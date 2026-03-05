#!/bin/bash
# 🚀 FreeLang v2.5.0 Install Script

set -e

echo "════════════════════════════════════════════════════"
echo "📥 FreeLang v2.5.0 Installation"
echo "════════════════════════════════════════════════════"
echo ""

# Detect OS
OS="$(uname -s)"
ARCH="$(uname -m)"

case "$OS" in
  Linux)
    if [ "$ARCH" = "x86_64" ]; then
      BINARY="freelang-v2.5.0-linux-x64"
    else
      echo "❌ Unsupported architecture: $ARCH"
      exit 1
    fi
    ;;
  Darwin)
    if [ "$ARCH" = "x86_64" ] || [ "$ARCH" = "arm64" ]; then
      BINARY="freelang-v2.5.0-macos-$ARCH"
    else
      echo "❌ Unsupported architecture: $ARCH"
      exit 1
    fi
    ;;
  MINGW*|MSYS*|CYGWIN*)
    BINARY="freelang-v2.5.0-windows-x64.exe"
    ;;
  *)
    echo "❌ Unsupported OS: $OS"
    exit 1
    ;;
esac

echo "📍 Detected: $OS / $ARCH"
echo "📦 Binary: $BINARY"
echo ""

# Download
INSTALL_DIR="${HOME}/.freelang/bin"
mkdir -p "$INSTALL_DIR"

echo "📥 Downloading FreeLang v2.5.0..."
DOWNLOAD_URL="https://gogs.dclub.kr/kim/freelang-final/releases/download/v2.5.0/$BINARY"
echo "   URL: $DOWNLOAD_URL"

if command -v wget &> /dev/null; then
  wget -q "$DOWNLOAD_URL" -O "$INSTALL_DIR/freelang" || {
    echo "❌ Download failed"
    exit 1
  }
elif command -v curl &> /dev/null; then
  curl -sL "$DOWNLOAD_URL" -o "$INSTALL_DIR/freelang" || {
    echo "❌ Download failed"
    exit 1
  }
else
  echo "❌ wget or curl required"
  exit 1
fi

chmod +x "$INSTALL_DIR/freelang"
echo "✅ Downloaded to: $INSTALL_DIR/freelang"
echo ""

# Add to PATH
echo "🔧 Setting up PATH..."
if [[ ":$PATH:" == *":$INSTALL_DIR:"* ]]; then
  echo "✅ Already in PATH"
else
  SHELL_RC=""
  if [ -f "$HOME/.bashrc" ]; then
    SHELL_RC="$HOME/.bashrc"
  elif [ -f "$HOME/.zshrc" ]; then
    SHELL_RC="$HOME/.zshrc"
  fi

  if [ -n "$SHELL_RC" ]; then
    echo "export PATH=\"\$HOME/.freelang/bin:\$PATH\"" >> "$SHELL_RC"
    echo "✅ Added to $SHELL_RC"
    echo "   Run: source $SHELL_RC"
  fi
fi
echo ""

# Verify installation
echo "🧪 Verifying installation..."
export PATH="$INSTALL_DIR:$PATH"

if freelang --version 2>/dev/null | grep -q "v2.5.0"; then
  echo "✅ Installation verified"
elif freelang --help 2>/dev/null | grep -q "FreeLang"; then
  echo "✅ FreeLang is installed"
else
  echo "⚠️  Could not verify (binary may be missing --version flag)"
fi
echo ""

echo "════════════════════════════════════════════════════"
echo "✅ Installation Complete!"
echo "════════════════════════════════════════════════════"
echo ""
echo "Next steps:"
echo "  1. Run: source ~/.bashrc  (or ~/.zshrc)"
echo "  2. Try: freelang --help"
echo "  3. Run: freelang hello_world.fl"
echo ""
echo "📚 Documentation: https://gogs.dclub.kr/kim/freelang-final/wiki"
echo "🐛 Issues: https://gogs.dclub.kr/kim/freelang-final/issues"
echo ""
