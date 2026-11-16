#!/bin/bash
set -e

SRC_PNG="assets/icon_clean.png"
if [ ! -f "$SRC_PNG" ]; then
  echo "Error: $SRC_PNG not found!"
  exit 1
fi

echo "=== 1. Creating macOS iconset ==="
rm -rf AppIcon.iconset
mkdir -p AppIcon.iconset

sips -z 16 16     "$SRC_PNG" --out AppIcon.iconset/icon_16x16.png
sips -z 32 32     "$SRC_PNG" --out AppIcon.iconset/icon_16x16@2x.png
sips -z 32 32     "$SRC_PNG" --out AppIcon.iconset/icon_32x32.png
sips -z 64 64     "$SRC_PNG" --out AppIcon.iconset/icon_32x32@2x.png
sips -z 128 128   "$SRC_PNG" --out AppIcon.iconset/icon_128x128.png
sips -z 256 256   "$SRC_PNG" --out AppIcon.iconset/icon_128x128@2x.png
sips -z 256 256   "$SRC_PNG" --out AppIcon.iconset/icon_256x256.png
sips -z 512 512   "$SRC_PNG" --out AppIcon.iconset/icon_256x256@2x.png
sips -z 512 512   "$SRC_PNG" --out AppIcon.iconset/icon_512x512.png
sips -z 1024 1024 "$SRC_PNG" --out AppIcon.iconset/icon_512x512@2x.png

echo "=== 2. Packing into AppIcon.icns ==="
iconutil -c icns AppIcon.iconset -o assets/AppIcon.icns
rm -rf AppIcon.iconset
echo "✓ AppIcon.icns 打包完成！"

echo "=== 3. Deploying to /Applications and Workspace ==="
killall -9 QNote 2>/dev/null || true

cp assets/AppIcon.icns /Applications/QNote.app/Contents/Resources/electron.icns
cp assets/AppIcon.icns /Applications/QNote.app/Contents/Resources/AppIcon.icns
cp assets/AppIcon.icns /Users/likeashot/Desktop/QNote/QNote.app/Contents/Resources/electron.icns
cp assets/AppIcon.icns /Users/likeashot/Desktop/QNote/QNote.app/Contents/Resources/AppIcon.icns

# Touch and clear cache
touch /Applications/QNote.app
touch /Users/likeashot/Desktop/QNote/QNote.app

echo "=== 4. Refreshing macOS Dock & clearing icon caches ==="
rm -rf /private/var/folders/*/*/C/com.apple.dock.iconcache* 2>/dev/null || true
rm -rf /private/var/folders/*/*/C/com.apple.iconservices* 2>/dev/null || true
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -f /Applications/QNote.app 2>/dev/null || true
killall Dock 2>/dev/null || true

echo "=== 5. Relaunching /Applications/QNote.app ==="
sleep 1
env -u ELECTRON_RUN_AS_NODE open /Applications/QNote.app
echo "QNote launched successfully with new icon!"
