# 🎨 General Sticker System (GSS) / 通用貼圖系統

A Chrome extension for multiple streaming platforms (Twitch, Vaughn, Kick) to manage and send custom stickers, with theater mode, fullscreen chat, and multi-streamer management features.

[中文](#中文) | [English](#english)

---

<a name="english"></a>
## 📦 Installation

1. Download ZIP (Click "Code" → "Download ZIP")
2. Unzip the file
3. Open Chrome and go to `chrome://extensions/`
4. Enable "Developer mode"
5. Click "Load unpacked" and select the unzipped folder
6. Done! The extension icon will appear in your toolbar

## 📖 How to Use

1. Go to any Twitch channel (login first)
2. You'll see a sticker button in the chat area
3. Click to open the sticker panel and send stickers

### Manage Stickers & Tags
- Click the extension icon in toolbar to open manager
- Paste sticker IDs (one per line, e.g., `id #tag1 #tag2`)
- Right-click any sticker in the panel to apply tags or favorite/hide
- Click "★" to favorite
- Click "✕" to delete
- Click "👁️" to hide (Manage hidden stickers in "Hidden" tab)

### Right-click Quick Add
- Right-click on any sticker → Add to General Sticker System

### 🧶 Texo Stream Core (TSC) / 實況編織系統
Manage multiple streamers across platforms with the integrated streamer panel:
- **Streamer Management**: Organize streamers with @name and #URL format
- **Main Chat Support**: Automatically detect and link main chat rooms (e.g., Twitch squad streams)
- **Live Status Indicator**: Real-time online/offline status with viewer count (green = online, red = offline, blue = main chat)
- **Quick Channel Switching**: Click streamer name to expand and see all their channels
- **One-Click Access**: Click any channel badge to open the stream

**How to use:**
1. Open the extension popup (click toolbar icon)
2. Go to "🧶 Texo Stream Core" tab
3. Enter streamers in format: `@StreamerName #https://twitch.tv/name`
4. Click "Save"
5. On any supported platform, press the panel button or right-click to open the TSC panel

### 🎭 Theater Mode
The extension provides a theater mode to enhance your viewing experience:
- **Theater Mode**: Hide navbar, sidebar, donation area, and title for immersive viewing
- **Chat Overlay**: Float the chat room over the video
- **Black Background**: Set website background to black
- **Zoom Controls**: Adjust video zoom level (10% increments)
- **Auto Mature Consent**: Automatically remember and apply Mature content consent (with user confirmation)

Access these features through the extension popup.

### 🖱️ Right-Click Panel
Right-click anywhere on supported streaming platforms to open a quick access panel with:
- TSC streamer list (if configured)
- Theater mode toggle
- Fullscreen chat toggle
- Sticker panel
- Quick navigation to other platforms

*Note: Can be disabled in settings if you prefer native context menu.*

### 💬 Fullscreen Chat
When watching in fullscreen mode:
- Press **C** key to toggle chat visibility
- Move mouse to the right edge to auto-show chat
- Chat remains interactive while in fullscreen
- Supports Twitch and other platforms

### 🌐 Language Support
The extension supports **5 languages**: English, Traditional Chinese (繁體中文), Simplified Chinese (简体中文), Japanese (日本語), and Korean (한국어). Toggle language in the popup settings.

## 🔒 Privacy Policy
This extension does not collect, store, or transmit any personal user data. All data (stickers, tags, settings, TSC streamer lists) is stored **locally on your device** using Chrome's storage API.

### Data Handling
- **Local Storage Only**: All your data stays on your device
- **No Remote Servers**: We don't upload anything to external servers
- **No Analytics**: No tracking or telemetry
- **Transparent API Usage**: For TSC live status checking, we query public platform APIs (Twitch, Kick, Vaughn) to show online/offline status. This requires no login credentials and results are cached locally (5 minutes).

See [privacy.html](privacy.html) for complete details.

## � Author
**Elfin** · [GitHub](https://github.com/ElfinL)

---

<a name="中文"></a>
# 🎨 通用貼圖系統 (GSS)

適用於多個直播平台（Twitch、Vaughn、Kick）的 Chrome 擴充功能，提供貼圖管理、劇院模式、全螢幕聊天與多實況主管理功能。

## 📦 安裝方法

1. 下載 ZIP（點右上角「Code」→「Download ZIP」）
2. 解壓縮
3. 打開 Chrome 輸入 `chrome://extensions/`
4. 開啟「開發者模式」
5. 點「載入未封裝項目」，選擇解壓縮的資料夾
6. 完成！工具列會出現擴充功能圖示

## 📖 怎麼用

1. 前往任一支援的平台頻道（Twitch、Vaughn、Kick，要先登入）
2. 聊天室會多一個貼圖按鈕
3. 點開就可以選貼圖送出

### 管理貼圖與標籤
- 點工具列圖示打開管理介面
- 貼上貼圖 ID（一行一個，格式：`id #標籤1 #標籤2`）
- 在面板內對貼圖點右鍵，可快速套用標籤或設為常用/隱藏
- 點「★」設常用
- 點「✕」刪除
- 點「👁️」隱藏（可在「隱藏」分頁中永久刪除）

### 右鍵快速新增
- 對貼圖按右鍵 → 新增到通用貼圖系統

### 🧶 實況編織系統 (TSC)
透過整合式實況主面板管理跨平台實況主：
- **實況主管理**：使用 `@名稱` 和 `#網址` 格式整理實況主
- **主聊天室支援**：自動偵測並連結主聊天室（如 Twitch 小隊實況）
- **開台狀態指示**：即時顯示在線/離線狀態與觀看人數（綠色=開台、紅色=離線、藍色=主聊天室）
- **快速頻道切換**：點擊實況主名稱展開查看所有頻道
- **一鍵開台**：點擊任何頻道徽章即可開啟實況

**使用方法：**
1. 點擊工具列圖示開啟彈出視窗
2. 進入「🧶 實況編織」分頁
3. 輸入格式：`@實況主名稱 #https://twitch.tv/名稱`
4. 點「儲存」
5. 在支援的平台上按面板按鈕或右鍵開啟 TSC 面板

### 🎭 劇院模式
擴充功能提供劇院模式，提升觀賞體驗：
- **劇院模式**：隱藏頂部導航欄、側邊欄、課金區與標題，打造沉浸式觀賞體驗
- **浮動聊天室**：讓聊天室懸浮在影片上方
- **黑色背景**：將網站背景設為黑色
- **縮放控制**：調整影片縮放比例（每次 10%）
- **自動 Mature 同意**：自動記憶並套用 Mature 內容同意設定（需用戶確認）

透過擴充彈出視窗使用這些功能。

### 🖱️ 右鍵面板
在支援的直播平台任意處按右鍵，開啟快速存取面板：
- TSC 實況主列表（如有設定）
- 劇院模式切換
- 全螢幕聊天切換
- 貼圖面板
- 快速跳轉到其他平台

*注意：可在設定中關閉此功能，恢復原生右鍵選單。*

### 💬 全螢幕聊天室
全螢幕觀看時：
- 按 **C** 鍵切換聊天室顯示/隱藏
- 滑鼠移到畫面右側邊緣自動顯示聊天室
- 全螢幕模式下聊天室仍可互動
- 支援 Twitch 等平台

### 🌐 語言支援
支援 **5 種語言**：繁體中文、簡體中文、英文、日文、韓文。在彈出視窗設定中切換語言。

## 🔒 隱私政策
本擴充功能不會收集、儲存或傳輸任何個人使用者資料。所有資料（貼圖、標籤、設定、TSC 實況主列表）都使用 Chrome 儲存 API **儲存在您的本地裝置**。

### 資料處理
- **僅本地儲存**：所有資料都保留在您的裝置上
- **無遠端伺服器**：我們不會上傳任何資料到外部伺服器
- **無分析追蹤**：沒有追蹤或遙測功能
- **透明 API 使用**：TSC 開台狀態檢測會向各平台的公開 API（Twitch、DLive、Kick、Vaughn）發送請求以查詢在線狀態。這不需要登入憑證，且結果僅在本地快取 5 分鐘。

詳見 [privacy.html](privacy.html) 了解完整說明。

## 👤 作者
**Elfin** · [GitHub](https://github.com/ElfinL)