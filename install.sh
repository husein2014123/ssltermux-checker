#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail
REPO="https://github.com/husein2014123/ssltermux-checker.git"
DEST="$HOME/.local/opt/ssltermux-checker"
BIN="$PREFIX/bin"
command -v pkg >/dev/null || { echo "Installer ini khusus Termux." >&2; exit 1; }
pkg update -y
pkg install -y nodejs-lts git
mkdir -p "$(dirname "$DEST")" "$BIN"
if [ -d "$DEST/.git" ]; then git -C "$DEST" pull --ff-only; else git clone "$REPO" "$DEST"; fi
chmod +x "$DEST/sslcheck.js"
ln -sf "$DEST/sslcheck.js" "$BIN/sslcheck"
echo "Terpasang. Coba: sslcheck example.com"
