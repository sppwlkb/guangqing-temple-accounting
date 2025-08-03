# 廣清宮記帳軟體 - APK打包指南

## 🔧 方案一：使用 PWA Builder (推薦)

### 步驟1：部署到網路
- 先按照 deploy-guide.md 將應用部署到GitHub Pages或Netlify

### 步驟2：生成APK
1. 前往 https://www.pwabuilder.com
2. 輸入您的網站網址
3. 點擊 "Start" 分析您的PWA
4. 選擇 "Android" 平台
5. 點擊 "Generate Package"
6. 下載生成的APK文件

## 🛠️ 方案二：使用 Cordova

### 安裝需求
```bash
npm install -g cordova
```

### 創建Cordova專案
```bash
cordova create GuangqingTemple com.guangqing.temple "廣清宮記帳"
cd GuangqingTemple
```

### 添加Android平台
```bash
cordova platform add android
```

### 複製文件
- 將所有HTML/CSS/JS文件複製到 `www/` 資料夾

### 配置config.xml
```xml
<widget id="com.guangqing.temple" version="1.0.0">
    <name>廣清宮快速記帳軟體</name>
    <description>專為宮廟設計的財務管理系統</description>
    <author email="temple@guangqing.com">廣清宮</author>
    
    <platform name="android">
        <icon density="ldpi" src="res/icon/android/ldpi.png" />
        <icon density="mdpi" src="res/icon/android/mdpi.png" />
        <icon density="hdpi" src="res/icon/android/hdpi.png" />
        <icon density="xhdpi" src="res/icon/android/xhdpi.png" />
    </platform>
    
    <preference name="permissions" value="none"/>
    <preference name="orientation" value="portrait"/>
    <preference name="target-device" value="universal"/>
    <preference name="fullscreen" value="false"/>
</widget>
```

### 建置APK
```bash
cordova build android
```

## 📱 方案三：線上APK生成器

### 使用 AppsGeyser
1. 前往 https://appsgeyser.com
2. 選擇 "Website" 模板
3. 輸入您的網站網址
4. 自定義應用圖標和名稱
5. 生成並下載APK

### 使用 Appy Pie
1. 前往 https://www.appypie.com
2. 選擇 "Website to App"
3. 輸入網站資訊
4. 自定義設計
5. 生成APK

## 🔐 簽名APK（發布用）

### 生成密鑰
```bash
keytool -genkey -v -keystore guangqing-release-key.keystore -alias guangqing -keyalg RSA -keysize 2048 -validity 10000
```

### 簽名APK
```bash
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore guangqing-release-key.keystore app-release-unsigned.apk guangqing
```

### 對齊APK
```bash
zipalign -v 4 app-release-unsigned.apk GuangqingTemple.apk
```

## 📋 安裝說明

### Android手機安裝：
1. 下載APK文件到手機
2. 開啟 "設定" → "安全性" → 允許 "未知來源"
3. 點擊APK文件安裝
4. 完成後即可在桌面找到應用圖標

## ⚠️ 注意事項

- APK方式需要用戶允許安裝未知來源應用
- PWA方式更安全，建議優先使用
- 如需發布到Google Play，需要開發者帳號（年費$25美元）

## 🎯 推薦方案

1. **最簡單**：PWA安裝（通過瀏覽器）
2. **最方便**：雲端部署 + PWA安裝
3. **最傳統**：APK打包安裝

建議先嘗試PWA方案，如果需要APK，我可以協助您完成打包流程。
