@echo off
echo 正在部署到GitHub...

REM 添加遠程倉庫
git remote add origin https://github.com/sppwlkb/temple-accounting.git

REM 推送到GitHub
git branch -M main
git push -u origin main

echo 部署完成！
echo 請前往 https://github.com/sppwlkb/temple-accounting/settings/pages 啟用GitHub Pages
pause
