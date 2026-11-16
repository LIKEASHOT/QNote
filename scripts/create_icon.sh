#!/bin/bash
set -e

SRC_IMG="$1"
if [ -z "$SRC_IMG" ]; then
  echo "Usage: $0 <path-to-1024x1024-png>"
  exit 1
fi

OUT_DIR="$(dirname "$SRC_IMG")"
ICONSET="${OUT_DIR}/AppIcon.iconset"
mkdir -p "$ICONSET"

echo "Generating icon resolutions..."
sips -z 16 16     "$SRC_IMG" --out "${ICONSET}/icon_16x16.png"
sips -z 32 32     "$SRC_IMG" --out "${ICONSET}/icon_16x16@2x.png"
sips -z 32 32     "$SRC_IMG" --out "${ICONSET}/icon_32x32.png"
sips -z 64 64     "$SRC_IMG" --out "${ICONSET}/icon_32x32@2x.png"
sips -z 128 128   "$SRC_IMG" --out "${ICONSET}/icon_128x128.png"
sips -z 256 256   "$SRC_IMG" --out "${ICONSET}/icon_128x128@2x.png"
sips -z 256 256   "$SRC_IMG" --out "${ICONSET}/icon_256x256.png"
sips -z 512 512   "$SRC_IMG" --out "${ICONSET}/icon_256x256@2x.png"
sips -z 512 512   "$SRC_IMG" --out "${ICONSET}/icon_512x512.png"
sips -z 1024 1024 "$SRC_IMG" --out "${ICONSET}/icon_512x512@2x.png"

echo "Creating .icns file..."
iconutil -c icns "$ICONSET" -o "${OUT_DIR}/AppIcon.icns"
rm -rf "$ICONSET"

echo "Successfully generated: ${OUT_DIR}/AppIcon.icns"
