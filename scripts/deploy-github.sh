#!/bin/bash

# GitHub Pages 部署腳本
# 使用方法: ./scripts/deploy-github.sh

set -e

echo "🚀 開始部署到 GitHub Pages..."

# 檢查是否有未提交的變更
if [[ -n $(git status --porcelain) ]]; then
  echo "❌ 有未提交的變更，請先提交所有變更"
  exit 1
fi

# 檢查當前分支
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 當前分支: $CURRENT_BRANCH"

# 建置專案
echo "🔨 建置專案..."
npm run build:prod

# 檢查建置結果
if [ ! -d "dist" ]; then
  echo "❌ 建置失敗，找不到 dist 目錄"
  exit 1
fi

# 進入建置目錄
cd dist

# 初始化 git（如果需要）
if [ ! -d ".git" ]; then
  git init
  git checkout -b gh-pages
fi

# 添加 CNAME（如果有自訂域名）
# echo "your-domain.com" > CNAME

# 添加 .nojekyll 檔案
touch .nojekyll

# 提交建置結果
git add -A
git commit -m "Deploy to GitHub Pages - $(date)"

# 推送到 GitHub Pages
echo "📤 推送到 GitHub Pages..."
git push -f origin gh-pages

# 回到專案根目錄
cd ..

echo "✅ 部署完成！"
echo "🌐 您的網站將在幾分鐘內可用："
echo "   https://your-username.github.io/temple-finance-management"

# 清理
rm -rf dist/.git
