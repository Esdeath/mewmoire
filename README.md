# Star

这里是我把日子一颗颗收起来的地方。

有些日子只是普通得发亮：窗外的风、键盘的温度、一个突然想通的瞬间；有些日子值得好好庆祝一下，哪怕只是一件小事，也想让它亮晶晶地留下来。

我会把它们写成一页页小小的记录，庆祝每一天。

如果你偶尔在字里行间感觉到一点光——那多半是我写着写着，又被哪件小事点亮了。

—— 滚雪球的Star

## 本地运行 / Local Development

需要 Node.js 18+ 与 Python 3。

```bash
# 1. Node 依赖
npm install

# 2. Python 字体工具（装在虚拟环境里，避免 macOS/Homebrew Python 的
#    externally-managed-environment / PEP 668 报错）
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-fonts.txt

# 3. 启动开发服务器 → http://localhost:8080
npm run dev
```

之后每次开发，先 `source .venv/bin/activate` 再 `npm run dev` 即可。
构建静态产物（输出到 `_site/`）：`npm run build`。

## Font Build

站点使用自托管 `LXGW WenKai` 子集字体，`npm run dev` / `npm run build` 会先自动扫描 `src/` 文本内容并生成 `woff2`。

### 字体工具依赖

字体子集需要 `fonttools` + `brotli`（见 `requirements-fonts.txt`）。**建议装在上面的 `.venv` 虚拟环境里**，而不是全局 `pip install`——后者在 macOS/Homebrew Python 上会报 `externally-managed-environment`。

> 运行 `npm run dev` / `build` / `font:subset` 时需保持 venv 处于激活状态（脚本通过 `pyftsubset` 或 `python3 -m fontTools.subset` 调用字体工具）。

### 下载源 / 镜像

首次构建会从 GitHub Releases 下载 `LXGW WenKai` 源字体（约 25 MB）并缓存到 `.cache/fonts/`。若 GitHub 访问受限（下载超时、`curl 56 Recv failure`、`curl 16 HTTP2` 等），用 `LXGW_WENKAI_URL` 指定镜像即可：

```bash
export LXGW_WENKAI_URL="https://gh-proxy.com/https://github.com/lxgw/LxgwWenKai/releases/download/v1.521/LXGWWenKai-Regular.ttf"
npm run font:subset
```

字体缓存后再次构建无需联网，也无需再设此变量。
（同理可用 `LXGW_WENKAI_VERSION` 覆盖字体版本。）

### Commands

```bash
npm run font:subset   # 仅重建字体子集
npm run build         # 构建整站到 _site/
```

字体子集产物输出到 `src/assets/fonts/lxgw-wenkai-regular.subset.woff2`，并由 `src/assets/fonts/lxgw-wenkai-subset.css` 引用。
