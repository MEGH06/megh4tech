#!/bin/sh
# Build, then serve dist on 4174.
#
# `vite preview` keeps handles open on files it has served, and on Windows that
# makes vite's own `emptyOutDir` fail with EPERM on whichever asset was fetched
# last — usually a .glb or a screenshot. Stopping the server before the build
# and starting it after is the whole fix.
set -e
cd "$(dirname "$0")/.."
export ComSpec="${SYSTEMROOT}\System32\cmd.exe"

for pid in $(powershell -NoProfile -Command \
  "(Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | Where-Object { \$_.CommandLine -like '*vite*preview*' }).ProcessId" \
  2>/dev/null | tr -d '\r'); do
  taskkill //PID "$pid" //F >/dev/null 2>&1 || true
done
sleep 1

npx vite build 2>&1 | grep -iE "EPERM|error|✓ built" | head -5

(npx vite preview --port 4174 --strictPort >/dev/null 2>&1 &)
sleep 7
printf 'preview 4174: '
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:4174/ --max-time 5
