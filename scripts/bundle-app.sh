#!/bin/bash
set -e

echo "=== 1. Terminating any running QNote instances ==="
killall -9 QNote 2>/dev/null || true

echo "=== 2. Building frontend with base: './' ==="
pnpm run build

echo "=== 3. Preparing app package directory ==="
rm -rf dist-app release
mkdir -p dist-app

cp -r dist/* dist-app/
cp electron/main.cjs dist-app/main.cjs
cp electron/preload.cjs dist-app/preload.cjs
cp assets/icon_clean.png dist-app/icon.png

# In production packaged app, load index.html from same directory
sed -i '' 's/\.\.\/dist\/index\.html/index\.html/g' dist-app/main.cjs

cat << 'EOF' > dist-app/package.json
{
  "name": "qnote",
  "productName": "QNote",
  "version": "0.1.0",
  "main": "main.cjs"
}
EOF

echo "=== 4. Packaging macOS QNote.app with custom icon ==="
npx electron-packager dist-app QNote \
  --platform=darwin \
  --arch=arm64 \
  --out=release \
  --overwrite \
  --icon=assets/AppIcon.icns \
  --app-bundle-id=com.qnote.app \
  --app-category-type=public.app-category.productivity

APP_PATH="release/QNote-darwin-arm64/QNote.app"

echo "=== 5. Applying macOS MachPort rendezvous & name fixes ==="
/usr/libexec/PlistBuddy -c "Set :CFBundleDisplayName QNote" "${APP_PATH}/Contents/Info.plist"
/usr/libexec/PlistBuddy -c "Set :CFBundleName QNote" "${APP_PATH}/Contents/Info.plist"

# Copy icon to Resources
cp assets/AppIcon.icns "${APP_PATH}/Contents/Resources/electron.icns"
cp assets/AppIcon.icns "${APP_PATH}/Contents/Resources/AppIcon.icns"
cp assets/icon_clean.png "${APP_PATH}/Contents/Resources/icon.png"

echo "=== 6. Deploying to /Applications and Workspace ==="
rm -rf /Users/likeashot/Desktop/QNote/QNote.app
cp -R "${APP_PATH}" /Users/likeashot/Desktop/QNote/QNote.app

rm -rf /Applications/QNote.app
cp -R "${APP_PATH}" /Applications/QNote.app

xattr -cr /Applications/QNote.app /Users/likeashot/Desktop/QNote/QNote.app
touch /Applications/QNote.app /Users/likeashot/Desktop/QNote/QNote.app

echo "=== 7. Finished! QNote.app installed to /Applications successfully ==="
ls -ld /Applications/QNote.app
