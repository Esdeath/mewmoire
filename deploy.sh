#!/usr/bin/env bash

set -euo pipefail

cd "$(dirname "$0")"

exec python3 -c '
import subprocess
import sys

command = ["npm", "run", "deploy"]
if len(sys.argv) > 1:
    command.append("--")
    command.extend(sys.argv[1:])

raise SystemExit(subprocess.run(command).returncode)
' "$@"
