/**
 * i18n.js - 語言國際化模組
 * General Sticker System (GSS) 插件的語言切換功能
 */

const I18N = {
  'zh-TW': {
    editorTitle: (version) => `General Sticker System (GSS) V${version} 圖庫編輯器`,
    idListTitle: '📋 貼圖 ID 清單',
    idListHint: '每行一個 ID，後面可接 #標籤',
    saveIdList: '💾 儲存 ID 清單',
    tagVocabTitle: '🏷️ 標籤詞庫',
    tagVocabHint: '一行一個標籤，用於快速選擇',
    saveVocab: '💾 儲存詞庫',
    searchPlaceholder: '搜尋 ID 或標籤...',
    refresh: '🔄 重新整理',
    selectAll: '☑️ 全選',
    export: '📥 匯出資料',
    loading: '載入中...',
    typeAll: '全部',
    typeDL: 'DL',
    typeIM: 'IM',
    typeME: 'ME',
    tagAll: '全部',
    tagUncategorized: '未分類',
    selectedCount: '已選擇 {0} 個',
    selectTag: '選擇標籤...',
    manualInput: '✏️ 手動輸入...',
    batchAdd: '➕ 批量新增標籤',
    batchRemove: '➖ 批量移除標籤',
    batchDelete: '🗑️ 批量刪除ID',
    clearSelection: '✕ 清除選擇',
    hiddenTag: '隱藏',
    statsText: (filtered, total) => `顯示 ${filtered} / ${total} 個貼圖`,
    headerSubtitle: '通用貼圖系統 (GSS)',
    configTitle: '貼圖 ID 與標籤',
    configHint: '支援 CB / IM / ME / YT 圖，後可接 #標籤，詳見 ❓',
    tagVocabTitle: '標籤詞庫（一行一個）',
    tagVocabHint: '頻道頁右鍵貼圖或面板內右鍵可套用；每張最多 4 個標籤',
    saveButton: '儲存 ID 清單與詞庫',
    reminder: '提醒：需要先在支援的直播平台登入；並在頻道頁使用',
    footer: '',
    favTitle: '常用',
    delTitle: '刪除',
    deleteConfirmTitle: '刪除貼圖',
    deleteConfirmMessage: (id) => `確定要刪除貼圖 ${id} 嗎？\n此操作無法復原。`,
    deleteConfirmBtn: '刪除',
    deleteCancelBtn: '取消',
    statusFavOn: '✅ 已標記常用',
    statusFavOff: '✅ 已取消常用',
    statusCleared: '✅ 已清空 ID 清單',
    statusSavedCount: (n) => `✅ 已儲存 ${n} 個 ID`,
    statusDeleted: '✅ 已刪除',
    statusInvalidId: (id) => `❌ ID 格式錯誤：${id}`,
    statusParseErr: (detail) => `❌ 清單格式錯誤：${detail}`,
    statusVocabBadLine: (line) => `❌ 詞庫無效標籤（最多 16 字元、不可空白/#）：${line}`,
    lineInfo: (current, total) => `第 ${current} 行 / 共 ${total} 行`,
    stickerLineNumber: (line) => `第 ${line} 行`,
    gotoLinePlaceholder: '跳轉到行',
    gotoLineButton: '跳轉',
    idPlaceholder: 'DL-826c4ac1e004273_498281 #梗圖 #反應\nIM-ha3eTC7.gif #搞笑\nME-LXEcxGi.gif\nDL-826cd8c8b004273_335245',
    vocabPlaceholder: 'meme\nreaction\n搞笑',
    errBadId: (id) => `${id || ''}`.trim() || '無效 ID',
    errBadTag: (id, tag) => `${id}: #${tag} 無效`,
    errTooManyTags: (id) => `${id}: 標籤超過 4 個`,
    errDupId: (id) => `重複 ID: ${id}`,
    sendSameSticker: '↵ 發送相同圖片',
    tabSticker: '🎨 貼圖',
    tabSettings: '⚙️ 設定',
    tabTexo: '編織',
    openEditor: '📚 圖庫編輯',
    helpTitle: '使用說明',
    texoTitle: '🧶 實況編織核心',
    texoSubtitle: 'Texo Stream Core - 管理多平台實況資訊',
    texoLabel: '編織資料',
    texoOnePerLine: '(一行一筆)',
    texoPlaceholder: '>主播名稱 #https://www.twitch.tv/xxx\n#https://www.youtube.com/...\n#https://www.kick.com/...',
    texoFormatTitle: '格式規則：',
    texoFormatDisplayName: '顯示名稱',
    texoFormatPlatform: '直播平台',
    texoFormatSharedChat: '主聊天室',
    texoFormatSeeHelp: '詳見',
    texoSave: '儲存',
    texoStatus: '自動載入上次儲存的內容',
    texoSaved: '✅ 已儲存',
    tscLoading: '載入中...',
    tscMainChannel: '主頻道',
    tscShared: '主聊天室',
    tscChat: '聊天',
    tscChannel: '頻道',
    tscStreamers: (n) => `${n} 位實況主`,
    tscStreamer: '實況主',
    tscNotSet: '未設定',
    tscSetupHint: '請在【管理面板】→【編織】設定資料<br>格式：@名稱 #網址 #網址',
    tscViewers: (n) => `${n} 人觀看`,
    tscSingleStreamer: '實況主',
    tscEnabledLabel: '啟用系統',
    tscAutoCollectLabel: '自動抓取',
    tscAutoCollectEnabled: '自動抓取已開啟',
    tscAutoCollectDisabled: '自動抓取已關閉',
    errNoCurrentPage: '❌ 找不到當前頁面',
    errConnectPage: '❌ 無法連接到頁面，請確保在支援的直播平台頻道頁',
    statusExecuted: '✅ 已執行',
    autoMatureTitle: '🔞 記住 Mature 同意',
    autoMatureConfirm: '⚠️ 請注意\n\n本功能僅為了省去每次刷新頁面都需要重新同意的麻煩。\n\n開啟此功能前，請確認：\n\n1. 您已詳細閱讀並了解相關平台的年齡限制、地區政策、服務條款及隱私權政策\n2. 您符合當地法律規定之觀看年齡要求\n3. 您同意自行承擔使用此功能的責任\n\n本擴充功能不代表任何平台官方立場，僅為便利使用者而設計。\n\n點擊「確定」表示您已了解並同意上述說明。',
    autoMatureEnabled: '✅ 記住 Mature 同意已開啟',
    autoMatureDisabled: '✅ 記住 Mature 同意已關閉',
    disableNativeContextMenuTitle: '🖱️ 關閉右鍵面板',
    disableNativeContextMenuEnabled: '✅ 原生右鍵已啟用（已關閉 GSS 面板）',
    disableNativeContextMenuDisabled: '✅ GSS 右鍵面板已啟用',
    helpContent: `<p><b>貼圖格式：</b></p>
<ul>
  <li>CB-xxx：Catbox 圖片</li>
  <li>IM-xxx：Imgur 圖片/影片</li>
  <li>ME-xxx：meee.com.tw 圖片/影片</li>
  <li>YT-xxx：YouTube 影片</li>
</ul>
<p><b>標籤功能：</b></p>
<ul>
  <li>每張貼圖可添加最多 4 個標籤</li>
  <li>格式：ID #標籤1 #標籤2</li>
</ul>
<p><b>快捷操作：</b></p>
<ul>
  <li>★ 標記常用</li>
  <li>✕ 刪除貼圖</li>
  <li>右鍵貼圖可添加標籤</li>
</ul>
<p><b>通用功能：</b></p>
<ul>
  <li>劇院模式：全屏觀看體驗</li>
  <li>聊天室控制：調整聊天室顯示</li>
</ul>`,
  },
  'zh-CN': {
    editorTitle: (version) => `General Sticker System (GSS) V${version} 图库编辑器`,
    idListTitle: '📋 贴纸 ID 清单',
    idListHint: '每行一个 ID，后面可接 #标签',
    saveIdList: '💾 保存 ID 清单',
    tagVocabTitle: '🏷️ 标签词库',
    tagVocabHint: '一行一个标签，用于快速选择',
    saveVocab: '💾 保存词库',
    searchPlaceholder: '搜索 ID 或标签...',
    refresh: '🔄 重新整理',
    selectAll: '☑️ 全选',
    export: '📥 导出资料',
    loading: '载入中...',
    typeAll: '全部',
    typeDL: 'DL',
    typeIM: 'IM',
    typeME: 'ME',
    tagAll: '全部',
    tagUncategorized: '未分类',
    selectedCount: '已选择 {0} 个',
    selectTag: '选择标签...',
    manualInput: '✏️ 手动输入...',
    batchAdd: '➕ 批量新增標籤',
    batchRemove: '➖ 批量移除標籤',
    batchDelete: '🗑️ 批量删除ID',
    clearSelection: '✕ 清除选择',
    hiddenTag: '隐藏',
    statsText: (filtered, total) => `显示 ${filtered} / ${total} 个贴纸`,
    headerSubtitle: '通用贴图系统 (GSS)',
    configTitle: '贴纸 ID 与标签',
    configHint: '支持 CB / IM / ME / YT 图，后可接 #标签，详见 ❓ 说明',
    tagVocabTitle: '标签词库（一行一个）',
    tagVocabHint: '频道页右键贴纸或面板内右键可套用；每张最多 4 个标签',
    saveButton: '保存 ID 清单与词库',
    reminder: '提醒：需要先在支持的直播平台登录；并在频道页使用',
    footer: '',
    favTitle: '常用',
    delTitle: '删除',
    deleteConfirmTitle: '删除贴纸',
    deleteConfirmMessage: (id) => `确定要删除贴纸 ${id} 吗？\n此操作无法复原。`,
    deleteConfirmBtn: '删除',
    deleteCancelBtn: '取消',
    statusFavOn: '✅ 已标记常用',
    statusFavOff: '✅ 已取消常用',
    statusCleared: '✅ 已清空 ID 清单',
    statusSavedCount: (n) => `✅ 已保存 ${n} 个 ID`,
    statusDeleted: '✅ 已删除',
    statusInvalidId: (id) => `❌ ID 格式错误：${id}`,
    statusParseErr: (detail) => `❌ 清单格式错误：${detail}`,
    statusVocabBadLine: (line) => `❌ 词库无效标签（最多 16 字符、不可空白/#）：${line}`,
    lineInfo: (current, total) => `第 ${current} 行 / 共 ${total} 行`,
    stickerLineNumber: (line) => `第 ${line} 行`,
    gotoLinePlaceholder: '跳转到行',
    gotoLineButton: '跳转',
    idPlaceholder: 'DL-826c4ac1e004273_498281 #梗图 #反应\nIM-ha3eTC7.gif #搞笑\nME-LXEcxGi.gif\nDL-826cd8c8b004273_335245',
    vocabPlaceholder: 'meme\nreaction\n搞笑',
    errBadId: (id) => `${id || ''}`.trim() || '无效 ID',
    errBadTag: (id, tag) => `${id}: #${tag} 无效`,
    errTooManyTags: (id) => `${id}: 标签超过 4 个`,
    errDupId: (id) => `重复 ID: ${id}`,
    sendSameSticker: '↵ 发送相同图片',
    errUnknown: '未知错误',
    tabSticker: '� 贴纸',
    tabSettings: '⚙️ 设置',
    tabTexo: '编织',
    openEditor: '📚 图库编辑',
    helpTitle: '使用说明',
    texoTitle: '🧶 实况编织核心',
    texoSubtitle: 'Texo Stream Core - 管理多平台实况资讯',
    texoLabel: '编织资料',
    texoOnePerLine: '(一行一笔)',
    texoPlaceholder: '>主播名称 #https://www.twitch.tv/xxx\n#https://www.youtube.com/...\n#https://www.kick.com/...',
    texoFormatTitle: '格式规则：',
    texoFormatDisplayName: '显示名称',
    texoFormatPlatform: '直播平台',
    texoFormatSharedChat: '主聊天室',
    texoFormatSeeHelp: '详见',
    texoSave: '保存',
    texoStatus: '自动载入上次保存的内容',
    texoSaved: '✅ 已保存',
    tscLoading: '载入中...',
    tscMainChannel: '主频道',
    tscShared: '主聊天室',
    tscChat: '聊天',
    tscChannel: '频道',
    tscStreamers: (n) => `${n} 位主播`,
    tscStreamer: '主播',
    tscNotSet: '未设定',
    tscSetupHint: '请在【管理面板】→【编织】设定资料<br>格式：@名称 #网址 #网址',
    tscViewers: (n) => `${n} 人观看`,
    tscSingleStreamer: '主播',
    tscEnabledLabel: '启用系统',
    tscAutoCollectLabel: '自动抓取',
    tscAutoCollectEnabled: '自动抓取已开启',
    tscAutoCollectDisabled: '自动抓取已关闭',
    errNoCurrentPage: '❌ 找不到当前页面',
    errConnectPage: '❌ 无法连接到页面，请确保在支持的直播平台频道页',
    statusExecuted: '✅ 已执行',
    autoMatureTitle: '🔞 记住 Mature 同意',
    autoMatureConfirm: '⚠️ 请注意\n\n本功能仅为了省去每次刷新页面都需要重新同意的麻烦。\n\n开启此功能前，请确认：\n\n1. 您已详细阅读并了解相关平台的年龄限制、地区政策、服务条款及隐私权政策\n2. 您符合当地法律规定之观看年龄要求\n3. 您同意自行承担使用此功能的责任\n\n本扩展功能不代表任何平台官方立场，仅为便利使用者而设计。\n\n点击「确定」表示您已了解并同意上述说明。',
    autoMatureEnabled: '✅ 记住 Mature 同意已开启',
    autoMatureDisabled: '✅ 记住 Mature 同意已关闭',
    disableNativeContextMenuTitle: '🖱️ 关闭右键面板',
    disableNativeContextMenuEnabled: '✅ 原生右键已启用（已关闭 GSS 面板）',
    disableNativeContextMenuDisabled: '✅ GSS 右键面板已启用',
    helpContent: `<p><b>贴纸格式：</b></p>
<ul>
  <li>CB-xxx：Catbox 图片</li>
  <li>IM-xxx：Imgur 图片/视频</li>
  <li>ME-xxx：meee.com.tw 图片/视频</li>
  <li>YT-xxx：YouTube 视频</li>
</ul>
<p><b>标签功能：</b></p>
<ul>
  <li>每张贴纸可添加最多 4 个标签</li>
  <li>格式：ID #标签1 #标签2</li>
</ul>
<p><b>快捷操作：</b></p>
<ul>
  <li>★ 标记常用</li>
  <li>✕ 删除贴纸</li>
  <li>右键贴纸可添加标签</li>
</ul>
<p><b>通用功能：</b></p>
<ul>
  <li>剧院模式：全屏观看体验</li>
  <li>聊天室控制：调整聊天室显示</li>
</ul>`,
  },
  en: {
    editorTitle: (version) => `General Sticker System (GSS) V${version} Sticker Editor`,
    idListTitle: '📋 Sticker ID List',
    idListHint: 'One ID per line, can add #tags',
    saveIdList: '💾 Save ID List',
    tagVocabTitle: '🏷️ Tag Vocabulary',
    tagVocabHint: 'One tag per line for quick selection',
    saveVocab: '💾 Save Vocabulary',
    searchPlaceholder: 'Search ID or tags...',
    refresh: '🔄 Refresh',
    selectAll: '☑️ Select All',
    export: '📥 Export Data',
    loading: 'Loading...',
    typeAll: 'All',
    typeDL: 'DL',
    typeIM: 'IM',
    typeME: 'ME',
    tagAll: 'All',
    tagUncategorized: 'Uncategorized',
    selectedCount: 'Selected {0}',
    selectTag: 'Select tag...',
    manualInput: '✏️ Manual input...',
    batchAdd: '➕ Batch Add Tag',
    batchRemove: '➖ Batch Remove Tag',
    batchDelete: '🗑️ Batch Delete ID',
    clearSelection: '✕ Clear',
    hiddenTag: 'Hidden',
    statsText: (filtered, total) => `Showing ${filtered} / ${total} stickers`,
    headerSubtitle: 'General Sticker System (GSS)',
    configTitle: 'Sticker IDs & tags',
    configHint: 'Supports CB / IM / ME / YT images, optional #tags, see ❓ for help',
    tagVocabTitle: 'Tag vocabulary (one per line)',
    tagVocabHint: 'Right-click emote on channel or tile in panel to apply tags; max 4 tags per sticker',
    saveButton: 'Save IDs & vocabulary',
    reminder: 'Tip: Log in to supported streaming platforms first and use this on a channel page',
    footer: '',
    favTitle: 'Favorite',
    delTitle: 'Delete',
    deleteConfirmTitle: 'Delete Sticker',
    deleteConfirmMessage: (id) => `Are you sure you want to delete sticker ${id}?\nThis action cannot be undone.`,
    deleteConfirmBtn: 'Delete',
    deleteCancelBtn: 'Cancel',
    statusFavOn: '✅ Marked as favorite',
    statusFavOff: '✅ Unmarked as favorite',
    statusCleared: '✅ Cleared ID list',
    statusSavedCount: (n) => `✅ Saved ${n} IDs`,
    statusDeleted: '✅ Deleted',
    statusInvalidId: (id) => `❌ Invalid ID format: ${id}`,
    statusParseErr: (detail) => `❌ List parse error: ${detail}`,
    statusVocabBadLine: (line) => `❌ Invalid tag (max 16 chars, no spaces/# allowed): ${line}`,
    lineInfo: (current, total) => `Line ${current} / ${total} total`,
    stickerLineNumber: (line) => `Line ${line}`,
    gotoLinePlaceholder: 'Go to line',
    gotoLineButton: 'Go',
    idPlaceholder: 'DL-826c4ac1e004273_498281 #meme #reaction\nIM-ha3eTC7.gif #funny\nME-LXEcxGi.gif\nDL-826cd8c8b004273_335245',
    vocabPlaceholder: 'meme\nreaction\nfunny',
    errBadId: (id) => `${id || ''}`.trim() || 'Invalid ID',
    errBadTag: (id, tag) => `${id}: Invalid tag #${tag}`,
    errTooManyTags: (id) => `${id}: More than 4 tags`,
    errDupId: (id) => `Duplicate ID: ${id}`,
    sendSameSticker: '↵ Send Same Image',
    errUnknown: 'Unknown error',
    tabSticker: '� Stickers',
    tabSettings: '⚙️ Settings',
    tabTexo: 'Weave',
    openEditor: '📚 Editor',
    helpTitle: 'Help',
    texoTitle: '🧶 Texo Stream Core',
    texoSubtitle: 'Manage multi-platform streamer info',
    texoLabel: 'Weaving Data',
    texoOnePerLine: '(one per line)',
    texoPlaceholder: '>StreamerName #https://www.twitch.tv/xxx\n#https://www.youtube.com/...\n#https://www.kick.com/...',
    texoFormatTitle: 'Format:',
    texoFormatDisplayName: 'Display Name',
    texoFormatPlatform: 'Platform URL',
    texoFormatSharedChat: 'Main Chat',
    texoFormatSeeHelp: 'see',
    texoSave: 'Save',
    texoStatus: 'Auto-load last saved content',
    texoSaved: '✅ Saved',
    tscLoading: 'Loading...',
    tscMainChannel: 'Main',
    tscShared: 'Main',
    tscChat: 'Chat',
    tscChannel: 'Ch',
    tscStreamers: (n) => `${n} Streamers`,
    tscStreamer: 'Streamer',
    tscNotSet: 'Not Set',
    tscSetupHint: 'Go to 【Management Panel】→【Weave】to set data<br>Format: @Name #URL #URL',
    tscViewers: (n) => `${n} viewers`,
    tscSingleStreamer: 'Streamer',
    tscEnabledLabel: 'Enable System',
    tscAutoCollectLabel: 'Auto Collect',
    tscAutoCollectEnabled: 'Auto Collect Enabled',
    tscAutoCollectDisabled: 'Auto Collect Disabled',
    errNoCurrentPage: '❌ Cannot find current page',
    errConnectPage: '❌ Cannot connect to page, please ensure you are on a supported streaming platform channel page',
    statusExecuted: '✅ Executed',
    autoMatureTitle: '🔞 Remember Mature Consent',
    autoMatureConfirm: '⚠️ Notice\n\nThis feature is designed only to save you from having to re-confirm every time you refresh the page.\n\nBefore enabling, please confirm:\n\n1. You have read and understood the relevant platform\'s age restrictions, regional policies, Terms of Service, and Privacy Policy\n2. You meet the legal age requirements for viewing in your jurisdiction\n3. You agree to take responsibility for using this feature\n\nThis extension is not affiliated with any platform and is designed solely for user convenience.\n\nClick "OK" to acknowledge and agree to the above.',
    autoMatureEnabled: '✅ Remember Mature Consent enabled',
    autoMatureDisabled: '✅ Remember Mature Consent disabled',
    disableNativeContextMenuTitle: '🖱️ Disable Right-Click Panel',
    disableNativeContextMenuEnabled: '✅ Native right-click enabled (GSS panel disabled)',
    disableNativeContextMenuDisabled: '✅ GSS right-click panel enabled',
    helpContent: `<p><b>Sticker formats:</b></p>
<ul>
  <li>CB-xxx：Catbox images</li>
  <li>IM-xxx：Imgur images/videos</li>
  <li>ME-xxx：meee.com.tw images/videos</li>
  <li>YT-xxx：YouTube videos</li>
</ul>
<p><b>Tags:</b></p>
<ul>
  <li>Max 4 tags per sticker</li>
  <li>Format: ID #tag1 #tag2</li>
</ul>
<p><b>Shortcuts:</b></p>
<ul>
  <li>★ Mark as favorite</li>
  <li>✕ Delete sticker</li>
  <li>Right-click to add tags</li>
  <li>Ctrl + S: Save changes</li>
  <li>Ctrl + Z: Undo</li>
  <li>Ctrl + Y: Redo</li>
</ul>
<p><b>General Features:</b></p>
<ul>
  <li>Theater Mode: Fullscreen viewing</li>
  <li>Chat Control: Adjust chat display</li>
</ul>`,
  },
  ja: {
    editorTitle: (version) => `General Sticker System (GSS) V${version} ステッカーエディタ`,
    idListTitle: '📋 ステッカーIDリスト',
    idListHint: '1行に1つのID、#タグを追加可能',
    saveIdList: '💾 IDリストを保存',
    tagVocabTitle: '🏷️ タグ辞書',
    tagVocabHint: '1行に1つのタグ、クイック選択用',
    saveVocab: '💾 辞書を保存',
    searchPlaceholder: 'IDまたはタグを検索...',
    refresh: '🔄 更新',
    selectAll: '☑️ 全選択',
    export: '📥 データをエクスポート',
    loading: '読み込み中...',
    typeAll: 'すべて',
    typeDL: 'DL',
    typeIM: 'IM',
    typeME: 'ME',
    tagAll: 'すべて',
    tagUncategorized: '未分類',
    selectedCount: '{0}個選択中',
    selectTag: 'タグを選択...',
    manualInput: '✏️ 手動入力...',
    batchAdd: '➕ 一括タグ追加',
    batchRemove: '➖ 一括タグ削除',
    batchDelete: '🗑️ 一括ID削除',
    clearSelection: '✕ 選択を解除',
    hiddenTag: '隠す',
    statsText: (filtered, total) => `${filtered} / ${total} 個を表示`,
    headerSubtitle: '汎用ステッカーシステム (GSS)',
    configTitle: 'ステッカーIDとタグ',
    configHint: 'CB / IM / ME / YT 対応、#タグ追加可能、詳細は ❓ を参照',
    tagVocabTitle: 'タグ辞書（1行1つ）',
    tagVocabHint: 'チャンネルまたはパネルで右クリックしてタグを適用；1ステッカー最大4タグ',
    saveButton: 'IDリストと辞書を保存',
    reminder: 'ヒント：サポートされている配信プラットフォームにログインして、チャンネルページで使用してください',
    footer: '',
    favTitle: 'お気に入り',
    delTitle: '削除',
    deleteConfirmTitle: 'ステッカーを削除',
    deleteConfirmMessage: (id) => `ステッカー ${id} を削除しますか？\nこの操作は元に戻せません。`,
    deleteConfirmBtn: '削除',
    deleteCancelBtn: 'キャンセル',
    statusFavOn: '✅ お気に入りに追加',
    statusFavOff: '✅ お気に入りから削除',
    statusCleared: '✅ IDリストをクリア',
    statusSavedCount: (n) => `✅ ${n}個のIDを保存`,
    statusDeleted: '✅ 削除しました',
    statusInvalidId: (id) => `❌ ID形式エラー：${id}`,
    statusParseErr: (detail) => `❌ リスト形式エラー：${detail}`,
    statusVocabBadLine: (line) => `❌ 無効なタグ（最大16文字、空白/#不可）：${line}`,
    lineInfo: (current, total) => `行 ${current} / ${total}`,
    stickerLineNumber: (line) => `行 ${line}`,
    gotoLinePlaceholder: '行へ移動',
    gotoLineButton: '移動',
    idPlaceholder: 'DL-826c4ac1e004273_498281 #ミーム #反応\nIM-ha3eTC7.gif #面白い\nME-LXEcxGi.gif\nDL-826cd8c8b004273_335245',
    vocabPlaceholder: 'ミーム\n反応\n面白い',
    errBadId: (id) => `${id || ''}`.trim() || '無効なID',
    errBadTag: (id, tag) => `${id}: #${tag} は無効`,
    errTooManyTags: (id) => `${id}: タグは4つまで`,
    errDupId: (id) => `重複ID: ${id}`,
    sendSameSticker: '↵ 同じ画像を送信',
    errUnknown: '不明なエラー',
    tabSticker: '🎨 ステッカー',
    tabSettings: '⚙️ 設定',
    tabTexo: '編織',
    openEditor: '📚 エディタ',
    helpTitle: '使い方',
    texoTitle: '🧶 Texo Stream Core',
    texoSubtitle: 'マルチプラットフォーム配信者管理',
    texoLabel: '編織資料',
    texoOnePerLine: '(1行に1つ)',
    texoPlaceholder: '>配信者名 #https://www.twitch.tv/xxx\n#https://www.youtube.com/...\n#https://www.kick.com/...',
    texoFormatTitle: '書式：',
    texoFormatDisplayName: '表示名',
    texoFormatPlatform: 'プラットフォームURL',
    texoFormatSharedChat: 'メインチャット',
    texoFormatSeeHelp: '詳細は',
    texoSave: '保存',
    texoStatus: '前回保存した内容を自動読み込み',
    texoSaved: '✅ 保存しました',
    tscLoading: '読み込み中...',
    tscMainChannel: 'メイン',
    tscShared: 'メイン',
    tscChat: 'チャット',
    tscChannel: 'Ch',
    tscStreamers: (n) => `配信者${n}名`,
    tscStreamer: '配信者',
    tscNotSet: '未設定',
    tscSetupHint: '【管理パネル】→【編織】でデータを設定<br>書式：@名前 #URL #URL',
    tscViewers: (n) => `${n} 人が視聴`,
    tscSingleStreamer: '配信者',
    tscEnabledLabel: '有効',
    tscAutoCollectLabel: '自動',
    tscAutoCollectEnabled: '自動収集ON',
    tscAutoCollectDisabled: '自動収集OFF',
    errNoCurrentPage: '❌ 現在のページが見つかりません',
    errConnectPage: '❌ ページに接続できません。DLiveチャンネルページで実行してください',
    statusExecuted: '✅ 実行しました',
    autoMatureTitle: '🔞 Mature同意を記憶',
    autoMatureConfirm: '⚠️ ご注意\n\n本機能は、ページを更新するたびに同意ボタンを押す手間を省くためのものです。\n\n本機能を有効にする前に、以下を確認してください：\n\n1. DLIVEの年齢制限、地域ポリシー、利用規約、プライバシーポリシーをよくお読みください\n2. お住まいの地域の法律で定められた視聴年齢要件を満たしていること\n3. 本機能の使用に関する責任を負うことに同意すること\n\n本拡張機能はDLIVE公式とは関係なく、ユーザーの利便性のために設計されています。\n\n「OK」をクリックすると、上記の内容を理解し同意したものとみなされます。',
    autoMatureEnabled: '✅ Mature同意の記憶を有効にしました',
    autoMatureDisabled: '✅ Mature同意の記憶を無効にしました',
    disableNativeContextMenuTitle: '🖱️ 右クリックパネルを無効にする',
    disableNativeContextMenuEnabled: '✅ ネイティブ右クリック有効（GSSパネル無効）',
    disableNativeContextMenuDisabled: '✅ GSS右クリックパネル有効',
    helpContent: `<p><b>ステッカー形式：</b></p>
<ul>
  <li>CB-xxx：Catbox画像</li>
  <li>IM-xxx：Imgur画像/動画</li>
  <li>ME-xxx：meee.com.tw画像/動画</li>
  <li>YT-xxx：YouTube動画</li>
</ul>
<p><b>タグ機能：</b></p>
<ul>
  <li>ステッカー1つに最大4タグ</li>
  <li>形式：ID #タグ1 #タグ2</li>
</ul>
<p><b>ショートカット：</b></p>
<ul>
  <li>★ お気に入り登録</li>
  <li>✕ ステッカー削除</li>
  <li>右クリックでタグ追加</li>
</ul>
<p><b>DLive機能：</b></p>
<ul>
  <li>シアターモード：全画面表示</li>
  <li>チャット制御：チャット表示調整</li>
</ul>`,
  },
  ko: {
    editorTitle: (version) => `General Sticker System (GSS) V${version} 스티커 편집기`,
    idListTitle: '📋 스티커 ID 목록',
    idListHint: '한 줄에 하나의 ID, #태그 추가 가능',
    saveIdList: '💾 ID 목록 저장',
    tagVocabTitle: '🏷️ 태그 사전',
    tagVocabHint: '한 줄에 하나의 태그, 빠른 선택용',
    saveVocab: '💾 사전 저장',
    searchPlaceholder: 'ID 또는 태그 검색...',
    refresh: '🔄 새로고침',
    selectAll: '☑️ 전체 선택',
    export: '📥 데이터보내기',
    loading: '로딩 중...',
    typeAll: '전체',
    typeDL: 'DL',
    typeIM: 'IM',
    typeME: 'ME',
    tagAll: '전체',
    tagUncategorized: '미분류',
    selectedCount: '{0}개 선택됨',
    selectTag: '태그 선택...',
    manualInput: '✏️ 수동 입력...',
    batchAdd: '➕ 일괄 태그 추가',
    batchRemove: '➖ 일괄 태그 제거',
    batchDelete: '🗑️ 일괄 ID 삭제',
    clearSelection: '✕ 선택 해제',
    hiddenTag: '숨김',
    statsText: (filtered, total) => `${filtered} / ${total}개 표시`,
    headerSubtitle: '범용 스티커 시스템 (GSS)',
    configTitle: '스티커 ID와 태그',
    configHint: 'CB / IM / ME / YT 지원, #태그 추가 가능, ❓ 클릭',
    tagVocabTitle: '태그 사전 (한 줄에 하나)',
    tagVocabHint: '채널 또는 패널에서 우클릭하여 태그 적용; 스티커당 최대 4개 태그',
    saveButton: 'ID 목록과 사전 저장',
    reminder: '팁: 지원되는 스트리밍 플랫폼에 로그인하고 채널 페이지에서 사용하세요',
    footer: '',
    favTitle: '즐겨찾기',
    delTitle: '삭제',
    deleteConfirmTitle: '스티커 삭제',
    deleteConfirmMessage: (id) => `스티커 ${id}를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`,
    deleteConfirmBtn: '삭제',
    deleteCancelBtn: '취소',
    statusFavOn: '✅ 즐겨찾기 추가됨',
    statusFavOff: '✅ 즐겨찾기 제거됨',
    statusCleared: '✅ ID 목록 지워짐',
    statusSavedCount: (n) => `✅ ${n}개 ID 저장됨`,
    statusDeleted: '✅ 삭제됨',
    statusInvalidId: (id) => `❌ ID 형식 오류: ${id}`,
    statusParseErr: (detail) => `❌ 목록 형식 오류: ${detail}`,
    statusVocabBadLine: (line) => `❌ 유효하지 않은 태그 (최대 16자, 공백/# 불가): ${line}`,
    lineInfo: (current, total) => `줄 ${current} / ${total}`,
    stickerLineNumber: (line) => `줄 ${line}`,
    gotoLinePlaceholder: '줄로 이동',
    gotoLineButton: '이동',
    idPlaceholder: 'DL-826c4ac1e004273_498281 #밈 #반응\nIM-ha3eTC7.gif #웃긴\nME-LXEcxGi.gif\nDL-826cd8c8b004273_335245',
    vocabPlaceholder: '밈\n반응\n웃긴',
    errBadId: (id) => `${id || ''}`.trim() || '유효하지 않은 ID',
    errBadTag: (id, tag) => `${id}: #${tag} 유효하지 않음`,
    errTooManyTags: (id) => `${id}: 태그는 4개까지`,
    errDupId: (id) => `중복 ID: ${id}`,
    sendSameSticker: '↵ 같은 이미지 보내기',
    errUnknown: '알 수 없는 오류',
    tabSticker: '🎨 스티커',
    tabSettings: '⚙️ 설정',
    tabTexo: '편직',
    openEditor: '📚 편집기',
    helpTitle: '사용 방법',
    texoTitle: '🧶 Texo Stream Core',
    texoSubtitle: '멀티 플랫폼 스트리머 관리',
    texoLabel: '편직 자료',
    texoOnePerLine: '(한 줄에 하나)',
    texoPlaceholder: '>스트리머명 #https://www.twitch.tv/xxx\n#https://www.youtube.com/...\n#https://www.kick.com/...',
    texoFormatTitle: '형식:',
    texoFormatDisplayName: '표시 이름',
    texoFormatPlatform: '플랫폼 URL',
    texoFormatSharedChat: '메인 채팅',
    texoFormatSeeHelp: '자세히',
    texoSave: '저장',
    texoStatus: '마지막 저장 내용 자동 불러오기',
    texoSaved: '✅ 저장됨',
    tscLoading: '로딩 중...',
    tscMainChannel: '메인',
    tscShared: '메인',
    tscChat: '채팅',
    tscChannel: 'Ch',
    tscStreamers: (n) => `스트리머 ${n}명`,
    tscStreamer: '스트리머',
    tscNotSet: '미설정',
    tscSetupHint: '【관리 패널】→【편직】에서 데이터를 설정하세요<br>형식: @이름 #URL #URL',
    tscViewers: (n) => `시청자 ${n}명`,
    tscSingleStreamer: '스트리머',
    tscEnabledLabel: '시스템 활성화',
    tscAutoCollectLabel: '자동 수집',
    tscAutoCollectEnabled: '자동 수집 활성화됨',
    tscAutoCollectDisabled: '자동 수집 비활성화됨',
    errNoCurrentPage: '❌ 현재 페이지를 찾을 수 없습니다',
    errConnectPage: '❌ 페이지에 연결할 수 없습니다. DLive 채널 페이지인지 확인하세요',
    statusExecuted: '✅ 실행됨',
    autoMatureTitle: '🔞 Mature 동의 기억',
    autoMatureConfirm: '⚠️ 주의\n\n본 기능은 페이지를 새로고침할 때마다 동의 버튼을 다시 누르는 불편함을 해소하기 위한 것입니다.\n\n본 기능을 활성화하기 전에 다음을 확인하세요:\n\n1. DLIVE의 연령 제한, 지역 정책, 서비스 약관 및 개인정보처리방침을 자세히 읽고 이해했습니다\n2. 해당 지역 법률에서 규정한 시청 연령 요건을 충족합니다\n3. 본 기능 사용에 대한 책임을 지겠습니다\n\n본 확장 프로그램은 DLIVE 공식과 관련이 없으며 사용자의 편의를 위해 설계되었습니다.\n\n「확인」을 클릭하면 위 내용을 이해하고 동의한 것으로 간주됩니다.',
    autoMatureEnabled: '✅ Mature 동의 기억 활성화됨',
    autoMatureDisabled: '✅ Mature 동의 기억 비활성화됨',
    disableNativeContextMenuTitle: '🖱️ 우클릭 패널 끄기',
    disableNativeContextMenuEnabled: '✅ 기본 우클릭 활성화 (GSS 패널 비활성화)',
    disableNativeContextMenuDisabled: '✅ GSS 우클릭 패널 활성화됨',
    helpContent: `<p><b>스티커 형식：</b></p>
<ul>
  <li>CB-xxx: Catbox 이미지</li>
  <li>IM-xxx: Imgur 이미지/영상</li>
  <li>ME-xxx: meee.com.tw 이미지/영상</li>
  <li>YT-xxx: YouTube 영상</li>
</ul>
<p><b>태그 기능：</b></p>
<ul>
  <li>스티커당 최대 4개 태그</li>
  <li>형식: ID #태그1 #태그2</li>
</ul>
<p><b>단축키：</b></p>
<ul>
  <li>★ 즐겨찾기 추가</li>
  <li>✕ 스티커 삭제</li>
  <li>우클릭으로 태그 추가</li>
</ul>
<p><b>DLive 기능：</b></p>
<ul>
  <li>극장 모드: 전체 화면 보기</li>
  <li>채팅 제어: 채팅 표시 조정</li>
</ul>`,
  }
};

let currentLang = 'zh-TW';

// 支援的語言列表
const SUPPORTED_LANGS = ['zh-TW', 'zh-CN', 'en', 'ja', 'ko'];

/**
 * 翻譯函數 - 根據 key 取得對應語言的文字
 * @param {string} key - 翻譯鍵值
 * @param {...any} args - 動態參數（用於函數類型的翻譯值）
 * @returns {string} 翻譯後的文字
 */
function t(key, ...args) {
  const dict = I18N[currentLang] || I18N['zh-TW'];
  const val = dict[key];
  if (typeof val === 'function') return val(...args);
  return val;
}

/**
 * 套用語言設定到編輯器頁面
 * @param {string} lang - 語言代碼
 */
function applyEditorLanguage(lang) {
  currentLang = SUPPORTED_LANGS.includes(lang) ? lang : 'zh-TW';

  // 更新語言按鈕的 active 狀態
  document.querySelectorAll('.lang-btn').forEach(btn => {
    if (btn.dataset.lang === currentLang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // 標題 - 動態獲取版本號
  const titleEl = document.querySelector('h1');
  if (titleEl) {
    try {
      const manifest = chrome.runtime.getManifest();
      const version = manifest?.version || '4.4';
      const iconImg = titleEl.querySelector('img');
      if (iconImg) {
        iconImg.className = 'header-icon';
        titleEl.innerHTML = '';
        titleEl.appendChild(iconImg);
        titleEl.appendChild(document.createTextNode(' ' + t('editorTitle', version)));
      } else {
        titleEl.textContent = t('editorTitle', version);
      }
    } catch (e) {
      // 如果無法獲取 manifest，使用預設版本
      const iconImg = titleEl.querySelector('img');
      if (iconImg) {
        iconImg.className = 'header-icon';
        titleEl.innerHTML = '';
        titleEl.appendChild(iconImg);
        titleEl.appendChild(document.createTextNode(' ' + t('editorTitle', '4.4')));
      } else {
        titleEl.textContent = t('editorTitle', '4.4');
      }
    }
  }

  // 側邊欄 - 使用正確的選擇器
  const sidebarSections = document.querySelectorAll('.sidebar-section');
  if (sidebarSections.length >= 1) {
    const h3 = sidebarSections[0].querySelector('h3');
    if (h3) h3.textContent = t('idListTitle');
    const hint = sidebarSections[0].querySelector('.sidebar-hint');
    if (hint) hint.textContent = t('idListHint');
  }
  if (sidebarSections.length >= 2) {
    const h3 = sidebarSections[1].querySelector('h3');
    if (h3) h3.textContent = t('tagVocabTitle');
    const hint = sidebarSections[1].querySelector('.sidebar-hint');
    if (hint) hint.textContent = t('tagVocabHint');
  }

  const idListInput = document.getElementById('idListInput');
  if (idListInput) idListInput.placeholder = t('idPlaceholder');

  const saveIdsBtn = document.getElementById('saveIdsBtn');
  if (saveIdsBtn) saveIdsBtn.textContent = t('saveIdList');

  const tagVocabInput = document.getElementById('tagVocabInput');
  if (tagVocabInput) tagVocabInput.placeholder = t('vocabPlaceholder');

  const saveVocabBtn = document.getElementById('saveVocabBtn');
  if (saveVocabBtn) saveVocabBtn.textContent = t('saveVocab');

  // 行號信息和跳轉按鈕
  const lineInfoText = document.getElementById('lineInfoText');
  const idListInputEl = document.getElementById('idListInput');
  if (lineInfoText && idListInputEl) {
    const totalLines = idListInputEl.value.split('\n').length;
    const cursorPos = idListInputEl.selectionStart || 0;
    const textBeforeCursor = idListInputEl.value.substring(0, cursorPos);
    const currentLine = textBeforeCursor.split('\n').length || 1;
    lineInfoText.textContent = t('lineInfo', currentLine, totalLines);
  }

  const gotoLineInput = document.getElementById('gotoLineInput');
  if (gotoLineInput) gotoLineInput.placeholder = t('gotoLinePlaceholder');

  const gotoLineBtn = document.getElementById('gotoLineBtn');
  if (gotoLineBtn) gotoLineBtn.textContent = t('gotoLineButton');

  // 工具列
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.placeholder = t('searchPlaceholder');

  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) refreshBtn.textContent = t('refresh');

  const selectAllBtn = document.getElementById('selectAllBtn');
  if (selectAllBtn) selectAllBtn.textContent = t('selectAll');

  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) exportBtn.textContent = t('export');

  // 類型過濾按鈕
  const typeAllBtn = document.querySelector('[data-type="all"]');
  if (typeAllBtn) typeAllBtn.textContent = t('typeAll');

  const typeDLBtn = document.querySelector('[data-type="DL"]');
  if (typeDLBtn) typeDLBtn.textContent = t('typeDL');

  const typeIMBtn = document.querySelector('[data-type="IM"]');
  if (typeIMBtn) typeIMBtn.textContent = t('typeIM');

  const typeMEBtn = document.querySelector('[data-type="ME"]');
  if (typeMEBtn) typeMEBtn.textContent = t('typeME');

  // 批量操作面板
  const batchTagSelect = document.getElementById('batchTagSelect');
  if (batchTagSelect) {
    const options = batchTagSelect.querySelectorAll('option');
    if (options[0]) options[0].textContent = t('selectTag');
    if (options[1]) options[1].textContent = t('manualInput');
  }

  const batchTagInput = document.getElementById('batchTagInput');
  if (batchTagInput) batchTagInput.placeholder = t('manualInput').replace('✏️ ', '');

  const batchAddTagBtn = document.getElementById('batchAddTagBtn');
  if (batchAddTagBtn) batchAddTagBtn.textContent = t('batchAdd');

  const batchRemoveTagBtn = document.getElementById('batchRemoveTagBtn');
  if (batchRemoveTagBtn) batchRemoveTagBtn.textContent = t('batchRemove');

  const batchDeleteBtn = document.getElementById('batchDeleteBtn');
  if (batchDeleteBtn) batchDeleteBtn.textContent = t('batchDelete');

  const clearSelectionBtn = document.getElementById('clearSelectionBtn');
  if (clearSelectionBtn) clearSelectionBtn.textContent = t('clearSelection');

  // 更新標籤頁（需要重新渲染）
  if (typeof updateTagTabs === 'function') {
    updateTagTabs();
  }

  // 更新統計文字（如果有數據）
  const statsText = document.getElementById('statsText');
  if (statsText && typeof filteredStickers !== 'undefined' && typeof allStickers !== 'undefined') {
    statsText.textContent = t('statsText', filteredStickers.length, allStickers.length);
  }

  // 重新渲染貼圖卡片以更新行數顯示
  if (typeof renderStickers === 'function') {
    renderStickers();
  }

  chrome.storage.sync.set({ uiLang: currentLang });
}

/**
 * 套用語言設定到所有 UI 元素
 * @param {string} lang - 語言代碼 ('zh' 或 'en')
 */
function applyLanguage(lang) {
  currentLang = SUPPORTED_LANGS.includes(lang) ? lang : 'zh-TW';

  // 更新語言按鈕的 active 狀態
  document.querySelectorAll('.lang-btn').forEach(btn => {
    if (btn.dataset.lang === currentLang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  const subtitleEl = document.getElementById('subtitleText');
  if (subtitleEl) subtitleEl.textContent = t('headerSubtitle');

  const configTitleEl = document.getElementById('configTitle');
  if (configTitleEl) configTitleEl.textContent = t('configTitle');

  const configHintEl = document.getElementById('configHint');
  if (configHintEl) configHintEl.textContent = t('configHint');

  const tagVocabTitleEl = document.getElementById('tagVocabTitle');
  if (tagVocabTitleEl) tagVocabTitleEl.textContent = t('tagVocabTitle');

  const tagVocabHintEl = document.getElementById('tagVocabHint');
  if (tagVocabHintEl) tagVocabHintEl.textContent = t('tagVocabHint');

  const saveBtn = document.getElementById('saveIdsBtn');
  if (saveBtn) saveBtn.textContent = t('saveButton');

  const reminderEl = document.getElementById('reminderText');
  if (reminderEl) reminderEl.textContent = t('reminder');

  const footerEl = document.getElementById('footerText');
  if (footerEl) footerEl.textContent = t('footer');

  const langToggle = document.getElementById('langToggle');
  if (langToggle) langToggle.textContent = t('langToggleLabel');

  // 更新語言按鈕的顯示文字（如有需要）
  document.querySelectorAll('.lang-btn').forEach(btn => {
    const langKey = btn.dataset.lang;
    if (langKey && I18N[langKey]) {
      // 按鈕文字已固定為 中/简/En/日/한，這裡可以根據需要更新
    }
  });

  const idListInput = document.getElementById('idListInput');
  if (idListInput) idListInput.placeholder = t('idPlaceholder');

  const tagVocabInput = document.getElementById('tagVocabInput');
  if (tagVocabInput) tagVocabInput.placeholder = t('vocabPlaceholder');

  const gotoLineInput = document.getElementById('gotoLineInput');
  if (gotoLineInput) gotoLineInput.placeholder = t('gotoLinePlaceholder');

  const gotoLineBtn = document.getElementById('gotoLineBtn');
  if (gotoLineBtn) gotoLineBtn.textContent = t('gotoLineButton');

  // DLive 頁面翻譯 - 設定區塊（現在是第1個）
  const dliveAutoSettingsTitle = document.querySelector('#dlivePage .dlive-section:nth-child(1) .dlive-section-title');
  if (dliveAutoSettingsTitle) dliveAutoSettingsTitle.textContent = t('dliveAutoSettings');

  const btnAutoMature = document.getElementById('btnAutoMature');
  if (btnAutoMature) {
    const baseText = t('autoMatureTitle');
    // 如果按鈕是開啟狀態，保留 (✓) 標記
    if (btnAutoMature.classList.contains('active')) {
      btnAutoMature.textContent = `${baseText} (✓)`;
    } else {
      btnAutoMature.textContent = baseText;
    }
  }

  // 劇院模式區塊（現在是第2個）
  const dliveTheaterTitle = document.querySelector('#dlivePage .dlive-section:nth-child(2) .dlive-section-title');
  if (dliveTheaterTitle) dliveTheaterTitle.textContent = t('dliveTheaterTitle');

  const btnTheater13 = document.getElementById('btnTheater13');
  if (btnTheater13) btnTheater13.textContent = t('dliveTheaterMode');

  const btnTestZoomReset = document.getElementById('btnTestZoomReset');
  if (btnTestZoomReset) btnTestZoomReset.textContent = t('dliveZoomReset');

  const btnTestZoomOut = document.getElementById('btnTestZoomOut');
  if (btnTestZoomOut) btnTestZoomOut.textContent = t('dliveZoomOut');

  const btnTestZoomIn = document.getElementById('btnTestZoomIn');
  if (btnTestZoomIn) btnTestZoomIn.textContent = t('dliveZoomIn');

  // 聊天室控制區塊（現在是第3個）
  const dliveChatTitle = document.querySelector('#dlivePage .dlive-section:nth-child(3) .dlive-section-title');
  if (dliveChatTitle) dliveChatTitle.textContent = t('dliveChatTitle');

  const btnChatNarrow = document.getElementById('btnChatNarrow');
  if (btnChatNarrow) btnChatNarrow.textContent = t('dliveChatNarrow');

  const btnChatHidden = document.getElementById('btnChatHidden');
  if (btnChatHidden) btnChatHidden.textContent = t('dliveChatHidden');

  const btnChatOverlayFix1 = document.getElementById('btnChatOverlayFix1');
  if (btnChatOverlayFix1) btnChatOverlayFix1.textContent = t('dliveChatOverlay');

  // 元素控制區塊（現在是第4個）
  const dliveElementTitle = document.querySelector('#dlivePage .dlive-section:nth-child(4) .dlive-section-title');
  if (dliveElementTitle) dliveElementTitle.textContent = t('dliveElementTitle');

  const btnNavbar = document.getElementById('btnNavbar');
  if (btnNavbar) btnNavbar.textContent = t('dliveNavbar');

  const btnTitleFix1 = document.getElementById('btnTitleFix1');
  if (btnTitleFix1) btnTitleFix1.textContent = t('dliveTitle');

  const btnDonation = document.getElementById('btnDonation');
  if (btnDonation) btnDonation.textContent = t('dliveDonation');

  const btnSidebar = document.getElementById('btnSidebar');
  if (btnSidebar) btnSidebar.textContent = t('dliveSidebar');

  const btnAboutFix1 = document.getElementById('btnAboutFix1');
  if (btnAboutFix1) btnAboutFix1.textContent = t('dliveAbout');

  const btnTestBlackFix1 = document.getElementById('btnTestBlackFix1');
  if (btnTestBlackFix1) btnTestBlackFix1.textContent = t('dliveBlackBg');

  const dliveStatus = document.getElementById('dliveStatus');
  if (dliveStatus) dliveStatus.textContent = t('dliveStatusHint');

  // 頁面切換按鈕
  const tabSticker = document.getElementById('tabSticker');
  if (tabSticker) tabSticker.textContent = t('tabSticker');

  const tabDlive = document.getElementById('tabDlive');
  if (tabDlive) tabDlive.textContent = t('tabDlive');

  const openEditorBtn = document.getElementById('openEditorBtn');
  if (openEditorBtn) openEditorBtn.textContent = t('openEditor');

  chrome.storage.sync.set({ uiLang: currentLang });
}

/**
 * 初始化語言設定（從 storage 載入）
 * @param {Function} callback - 語言設置完成後的回調函數
 */
function initLanguage(callback) {
  chrome.storage.sync.get(['uiLang'], (result) => {
    const lang = SUPPORTED_LANGS.includes(result.uiLang) ? result.uiLang : 'zh-TW';
    applyLanguage(lang);
    if (typeof callback === 'function') callback();
  });
}

/**
 * 設定特定語言
 * @param {string} lang - 語言代碼
 * @returns {boolean} 是否設定成功
 */
function setLanguage(lang) {
  if (SUPPORTED_LANGS.includes(lang)) {
    applyLanguage(lang);
    return true;
  }
  return false;
}

// 暴露全局變數供其他腳本使用
window.I18N = I18N;
window.SUPPORTED_LANGS = SUPPORTED_LANGS;
window.currentLang = currentLang;
window.t = t;
window.applyLanguage = applyLanguage;
window.applyEditorLanguage = applyEditorLanguage;
window.initLanguage = initLanguage;
window.setLanguage = setLanguage;

// 暴露給 window.GSS，供 panel.js 使用
window.GSS = window.GSS || {};
window.GSS.I18N = {
  t,
  I18N,
  SUPPORTED_LANGS,
  getCurrentLang: () => currentLang
};
