# GitHub Pages 部署指南

## 步驟 1: 創建 GitHub 倉庫

1. 前往 [GitHub.com](https://github.com) 並登入您的帳戶
2. 點擊右上角的 "+" 按鈕，選擇 "New repository"
3. 填寫倉庫資訊：
   - **Repository name**: `guangqing-temple-accounting`
   - **Description**: `廣清宮快速記帳軟體 - 專為宮廟設計的記帳系統`
   - **Visibility**: 選擇 Public（公開）
   - **不要**勾選 "Add a README file"（因為我們已經有了）
4. 點擊 "Create repository"

## 步驟 2: 設置遠端倉庫

在您的本地專案目錄中執行以下命令（請將 `[您的GitHub用戶名]` 替換為您的實際 GitHub 用戶名）：

```bash
git remote add origin https://github.com/[您的GitHub用戶名]/guangqing-temple-accounting.git
git branch -M main
git push -u origin main
```

## 步驟 3: 啟用 GitHub Pages

1. 在 GitHub 倉庫頁面中，點擊 "Settings" 標籤
2. 在左側選單中找到 "Pages"
3. 在 "Source" 部分，選擇 "Deploy from a branch"
4. 在 "Branch" 下拉選單中選擇 "gh-pages"
5. 點擊 "Save"

## 步驟 4: 等待自動部署

GitHub Actions 會自動：
1. 構建您的 Vue.js 專案
2. 部署到 `gh-pages` 分支
3. 發布到 GitHub Pages

部署完成後，您的應用將可在以下網址訪問：
`https://[您的GitHub用戶名].github.io/guangqing-temple-accounting/`

## 步驟 5: 驗證部署

1. 等待幾分鐘讓部署完成
2. 訪問您的 GitHub Pages URL
3. 確認應用正常運行

## 故障排除

### 如果部署失敗
1. 檢查 GitHub Actions 頁面中的錯誤訊息
2. 確認 Node.js 版本設定正確
3. 檢查構建日誌

### 如果頁面顯示 404
1. 確認 GitHub Pages 設定正確
2. 等待幾分鐘讓部署完成
3. 檢查 `gh-pages` 分支是否已創建

## 後續更新

每次推送代碼到 `main` 分支時，GitHub Actions 會自動重新部署您的應用。

---

**注意**: 請將上述所有 `[您的GitHub用戶名]` 替換為您的實際 GitHub 用戶名。 