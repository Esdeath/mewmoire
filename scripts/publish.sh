#!/usr/bin/env bash
#
# 一键发布:commit + push 到 GitHub,然后构建并部署到 Cloudflare Pages。
#
# 用法:
#   ./scripts/publish.sh "提交说明"     # 自定义提交信息
#   ./scripts/publish.sh                  # 用默认带时间戳的提交信息
#   npm run deploy -- "提交说明"          # 通过 npm 调用(注意 -- )
#
# 可用环境变量覆盖:
#   CF_PAGES_PROJECT     Cloudflare Pages 项目名(默认 mewmoire)
#   PUBLISH_BRANCH       推送/部署的分支(默认 master)
#   LXGW_WENKAI_URL      字体下载源(默认走 gh-proxy 镜像)
#   CLOUDFLARE_ACCOUNT_ID  Cloudflare 账号 ID

set -euo pipefail

# 切到项目根目录(脚本位于 scripts/ 下)
cd "$(dirname "$0")/.."

# ---- 配置(可被环境变量覆盖)----
PROJECT_NAME="${CF_PAGES_PROJECT:-mewmoire}"
BRANCH="${PUBLISH_BRANCH:-master}"
# 字体源镜像:绕过 GitHub 下载受限。字体已缓存时不会触发下载,留着无害。
export LXGW_WENKAI_URL="${LXGW_WENKAI_URL:-https://gh-proxy.com/https://github.com/lxgw/LxgwWenKai/releases/download/v1.521/LXGWWenKai-Regular.ttf}"
# Cloudflare 账号 ID(非机密;真正的凭据来自 wrangler 登录态)
export CLOUDFLARE_ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-86b42f0ff839665a477fde2c95947451}"

# ---- 1. 激活 Python venv(字体子集需要 fonttools/brotli)----
if [ -f .venv/bin/activate ]; then
  # shellcheck disable=SC1091
  source .venv/bin/activate
  echo "==> 已激活 .venv"
else
  echo "⚠️  没找到 .venv;若字体构建报缺 fonttools,请先按 README 创建虚拟环境。"
fi

# ---- 2. commit + push ----
MSG="${1:-publish: $(date '+%Y-%m-%d %H:%M:%S')}"
if [ -n "$(git status --porcelain)" ]; then
  echo "==> 提交改动:$MSG"
  git add -A
  git commit -m "$MSG"
else
  echo "==> 工作区无改动,跳过 commit。"
fi
echo "==> push 到 origin/$BRANCH"
git push origin "$BRANCH"

# ---- 3. 构建 Eleventy 站点 ----
echo "==> 构建站点(npm run build)"
npm run build

# ---- 4. 部署到 Cloudflare Pages ----
echo "==> 部署 _site 到 Cloudflare Pages 项目:$PROJECT_NAME"
npx --yes wrangler pages deploy _site --project-name="$PROJECT_NAME" --branch="$BRANCH" --commit-dirty=true

echo ""
echo "✅ 发布完成。线上地址:https://mewmoire-7lo.pages.dev/"
