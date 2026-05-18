/* global DLSQ */
/* =========================================================================
   【GSS 聊天面板】content.js
   - 這是注入到直播網頁的內容腳本（顯示浮動貼圖發送面板）
   - 功能：發送貼圖、頁面元素控制、劇院模式
   - 對應：popup.html 是「管理面板」（擴充彈出視窗）
   ========================================================================= */

// 【調試工具】確保 testYouTubeLive 可用（如果 gsstracker.js 還沒載入，提供臨時版本）
if (typeof window.testYouTubeLive === 'undefined') {
  window.testYouTubeLive = function () {
    if (window._gssTracker && window._gssTracker.debugYouTubeLive) {
      return window._gssTracker.debugYouTubeLive();
    }
    console.log('[GSS Tracker] 尚未初始化，請等待頁面載入完成');
    return null;
  };
}

const TAG = typeof DLSQ !== 'undefined' ? DLSQ : null;

// 當前版本（用於更新通知）
// 直接讀取 manifest.json 的版本號（只需改 manifest.json 即可）
const CURRENT_VERSION = chrome.runtime.getManifest().version;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ========= 平台適配器架構開關 =========
// true = 使用新的 platforms/ 架構
// false = 使用舊的內建函數 (向後相容後備)
const USE_NEW_PLATFORM_ADAPTER = true;

// 輔助函數：取得平台適配器
function getPlatformAdapter() {
  if (typeof window !== 'undefined' && window.GSS && window.GSS.Platform) {
    return window.GSS.Platform.getPlatformAdapter();
  }
  return null;
}

// 輔助函數：檢查新架構是否可用
function isNewPlatformAvailable() {
  return USE_NEW_PLATFORM_ADAPTER && getPlatformAdapter() !== null;
}

// ========= 語言設定 =========
let currentLang = 'zh';

// 支援的語言列表
const SUPPORTED_LANGS = ['zh', 'zh-CN', 'en', 'ja', 'ko'];

// 語言對應表：將 i18n.js 的語言代碼映射到 content.js 的語言代碼
const LANG_MAP = {
  'zh-TW': 'zh',
  'zh-CN': 'zh-CN',
  'en': 'en',
  'ja': 'ja',
  'ko': 'ko'
};

function getContentLang(uiLang) {
  return LANG_MAP[uiLang] || 'zh';
}

const UI_I18N = {
  zh: {
    addToQuick: '新增到 GSS',
    fav: '標記常用（★）',
    unfav: '取消常用（★）',
    hide: '隱藏',
    unhide: '取消隱藏',
    tags: '標籤',
    zoomImage: '放大圖片',
    sendSameSticker: '↵ 發送相同圖片',
    added: (n) => `✅ 已新增（共 ${n} 個）`,
    exists: (n) => `ℹ️ 已存在（共 ${n} 個）`,
    favMarked: '✅ 已標記常用（★）',
    favUnmarked: '✅ 已取消常用',
    hidden: `✅ 已隱藏（到「隱藏」分頁可永久刪除）`,
    unhidden: '✅ 已取消隱藏',
    removeTag: (tag) => `✅ 已移除 #${tag}`,
    addTag: (tag) => `✅ 已加上 #${tag}`,
    deleted: (n) => `✅ 已從清單刪除（剩 ${n} 個）`,
    notInList: 'ℹ️ 清單內沒有此 ID',
    loading: '載入中…',
    all: '全部 / ALL',
    dl: 'DL',
    im: 'IM',
    me: 'ME',
    yt: 'YT',
    wtv: 'WTV',
    hiddenTab: (n) => `隱藏 (${n})`,
    notInListMsg: '不在清單內',
    emptyVocabMsg: '詞庫為空時仍可用上方「常用／隱藏」；要套用其他 #標籤請到 popup 建立詞庫',
    permDelete: '從清單永久刪除…',
    uncategorizedTab: (n) => `未分類 (${n})`,
    prevPage: '< 上一頁',
    nextPage: '下一頁 >',
    extensionUpdated: '❌ 擴充已更新，請重新整理頁面',
    sendFailed: '貼圖送出失敗',
    sendFailedPrefix: '發送失敗:',
    unknownError: '未知錯誤',
    updateChangelog: '查看更新日誌',
    updateNewVersion: '📢 有新更新！點擊查看',
    helpPage: '查看使用說明',
    sharedChatKickTwitchWarning: '⚠️ Twitch 聊天室無法在 KICK 頁面嵌入\n\n這是 Twitch 的安全策略限制，\n請在支援的直播平台頁面使用 Twitch 共用聊天。'
  },
  'zh-CN': {
    addToQuick: '添加到 GSS',
    fav: '标记常用（★）',
    unfav: '取消常用（★）',
    hide: '隐藏',
    unhide: '取消隐藏',
    tags: '标签',
    zoomImage: '放大图片',
    sendSameSticker: '↵ 发送相同图片',
    added: (n) => `✅ 已添加（共 ${n} 个）`,
    exists: (n) => `ℹ️ 已存在（共 ${n} 个）`,
    favMarked: '✅ 已标记常用（★）',
    favUnmarked: '✅ 已取消常用',
    hidden: `✅ 已隐藏（到「隐藏」分页可永久删除）`,
    unhidden: '✅ 已取消隐藏',
    removeTag: (tag) => `✅ 已移除 #${tag}`,
    addTag: (tag) => `✅ 已添加 #${tag}`,
    deleted: (n) => `✅ 已从清单删除（剩 ${n} 个）`,
    notInList: 'ℹ️ 清单内没有此 ID',
    loading: '加载中…',
    all: '全部 / ALL',
    dl: 'DL',
    im: 'IM',
    me: 'ME',
    yt: 'YT',
    wtv: 'WTV',
    hiddenTab: (n) => `隐藏 (${n})`,
    notInListMsg: '不在清单内',
    emptyVocabMsg: '词库为空时仍可用上方「常用／隐藏」；要套用其他 #标签请到 popup 建立词库',
    permDelete: '从清单永久删除…',
    uncategorizedTab: (n) => `未分类 (${n})`,
    prevPage: '< 上一页',
    nextPage: '下一页 >',
    extensionUpdated: '❌ 扩展已更新，请刷新页面',
    sendFailed: '贴图发送失败',
    sendFailedPrefix: '发送失败:',
    unknownError: '未知错误',
    updateChangelog: '查看更新日志',
    updateNewVersion: '📢 有新更新！点击查看',
    helpPage: '查看使用说明',
    sharedChatKickTwitchWarning: '⚠️ Twitch 聊天室無法在 KICK 頁面嵌入\n\n這是 Twitch 的安全策略限制，\n請在支援的直播平台頁面使用 Twitch 共用聊天。'
  },
  en: {
    addToQuick: 'Add to GSS',
    fav: 'Mark as Favorite (★)',
    unfav: 'Unmark Favorite (★)',
    hide: 'Hide',
    unhide: 'Unhide',
    tags: 'Tags',
    zoomImage: 'Zoom Image',
    sendSameSticker: '↵ Send Same Image',
    added: (n) => `✅ Added (${n} total)`,
    exists: (n) => `ℹ️ Already exists (${n} total)`,
    favMarked: '✅ Marked as favorite (★)',
    favUnmarked: '✅ Unmarked as favorite',
    hidden: `✅ Hidden (find in "Hidden" tab to permanently delete)`,
    unhidden: '✅ Unhidden',
    removeTag: (tag) => `✅ Removed #${tag}`,
    addTag: (tag) => `✅ Added #${tag}`,
    deleted: (n) => `✅ Deleted from list (${n} remaining)`,
    notInList: 'ℹ️ ID not in list',
    loading: 'Loading…',
    all: 'All',
    dl: 'DL',
    im: 'IM',
    me: 'ME',
    yt: 'YT',
    wtv: 'WTV',
    hiddenTab: (n) => `Hidden (${n})`,
    notInListMsg: 'Not in list',
    emptyVocabMsg: 'When vocabulary is empty, you can still use "Favorite/Hide" above; to apply other #tags, add them in popup',
    permDelete: 'Permanently delete from list…',
    uncategorizedTab: (n) => `Uncategorized (${n})`,
    prevPage: '< Prev',
    nextPage: 'Next >',
    extensionUpdated: '❌ Extension updated, please refresh page',
    sendFailed: 'Failed to send sticker',
    sendFailedPrefix: 'Send failed:',
    unknownError: 'Unknown error',
    updateChangelog: 'View Changelog',
    updateNewVersion: '📢 New update available! Click to view',
    helpPage: 'View Help',
    sharedChatKickTwitchWarning: '⚠️ Twitch chat cannot be embedded on KICK pages\n\nThis is a Twitch security policy restriction.\nPlease use Twitch shared chat on supported streaming platform pages.'
  },
  ja: {
    addToQuick: 'GSSに追加',
    fav: 'お気に入り登録（★）',
    unfav: 'お気に入り解除（★）',
    hide: '非表示',
    unhide: '非表示解除',
    tags: 'タグ',
    zoomImage: '画像を拡大',
    sendSameSticker: '↵ 同じ画像を送信',
    added: (n) => `✅ 追加しました（計 ${n} 個）`,
    exists: (n) => `ℹ️ 既に存在します（計 ${n} 個）`,
    favMarked: '✅ お気に入りに追加しました（★）',
    favUnmarked: '✅ お気に入りから削除しました',
    hidden: `✅ 非表示にしました（「非表示」タブで完全削除可能）`,
    unhidden: '✅ 非表示を解除しました',
    removeTag: (tag) => `✅ #${tag} を削除しました`,
    addTag: (tag) => `✅ #${tag} を追加しました`,
    deleted: (n) => `✅ リストから削除しました（残り ${n} 個）`,
    notInList: 'ℹ️ リストにこの ID がありません',
    loading: '読み込み中…',
    all: '全て / ALL',
    dl: 'DL',
    im: 'IM',
    me: 'ME',
    yt: 'YT',
    wtv: 'WTV',
    hiddenTab: (n) => `非表示 (${n})`,
    notInListMsg: 'リストにありません',
    emptyVocabMsg: '辞書が空でも「お気に入り／非表示」は使用可能；その他の #タグ を追加するには popup で辞書を作成してください',
    permDelete: 'リストから完全に削除…',
    uncategorizedTab: (n) => `未分類 (${n})`,
    prevPage: '< 前へ',
    nextPage: '次へ >',
    extensionUpdated: '❌ 拡張機能が更新されました。ページを更新してください',
    sendFailed: 'スタンプの送信に失敗しました',
    sendFailedPrefix: '送信失敗:',
    unknownError: '不明なエラー',
    updateChangelog: '更新履歴を見る',
    updateNewVersion: '📢 新しい更新があります！クリックして見る',
    helpPage: '使い方を見る',
    sharedChatKickTwitchWarning: '⚠️ TwitchチャットはKICKページに埋め込めません\n\nこれはTwitchのセキュリティポリシーによる制限です。\nサポートされている配信プラットフォームページでTwitch共用チャットをご利用ください。'
  },
  ko: {
    addToQuick: 'GSS에 추가',
    fav: '즐겨찾기 등록（★）',
    unfav: '즐겨찾기 해제（★）',
    hide: '숨기기',
    unhide: '숨기기 해제',
    tags: '태그',
    zoomImage: '이미지 확대',
    sendSameSticker: '↵ 같은 이미지 보내기',
    added: (n) => `✅ 추가되었습니다（총 ${n} 개）`,
    exists: (n) => `ℹ️ 이미 존재합니다（총 ${n} 개）`,
    favMarked: '✅ 즐겨찾기에 추가되었습니다（★）',
    favUnmarked: '✅ 즐겨찾기에서 제거되었습니다',
    hidden: `✅ 숨김 처리되었습니다（"숨김" 탭에서 완전 삭제 가능）`,
    unhidden: '✅ 숨김 해제되었습니다',
    removeTag: (tag) => `✅ #${tag} 삭제됨`,
    addTag: (tag) => `✅ #${tag} 추가됨`,
    deleted: (n) => `✅ 목록에서 삭제되었습니다（남은 ${n} 개）`,
    notInList: 'ℹ️ 목록에 이 ID가 없습니다',
    loading: '로딩 중…',
    all: '전체 / ALL',
    dl: 'DL',
    im: 'IM',
    me: 'ME',
    yt: 'YT',
    wtv: 'WTV',
    hiddenTab: (n) => `숨김 (${n})`,
    notInListMsg: '목록에 없음',
    emptyVocabMsg: '사전이 비어있어도 "즐겨찾기／숨김"은 사용 가능；다른 #태그 를 추가하려면 popup에서 사전을 만드세요',
    permDelete: '목록에서 영구 삭제…',
    uncategorizedTab: (n) => `미분류 (${n})`,
    prevPage: '< 이전',
    nextPage: '다음 >',
    extensionUpdated: '❌ 확장 프로그램이 업데이트되었습니다. 페이지를 새로고침해 주세요',
    sendFailed: '스티커 전송 실패',
    sendFailedPrefix: '전송 실패:',
    unknownError: '알 수 없는 오류',
    updateChangelog: '업데이트 내역 보기',
    updateNewVersion: '📢 새로운 업데이트가 있습니다! 클릭해서 보기',
    helpPage: '사용 방법 보기',
    sharedChatKickTwitchWarning: '⚠️ 트위치 채팅은 KICK 페이지에 임베드할 수 없습니다\n\n이것은 트위치 보안 정책의 제한입니다.\n지원되는 스트리밍 플랫폼 페이지에서 트위치 공용 채팅을 사용해 주세요.'
  }
};

function t(key, ...args) {
  const dict = UI_I18N[currentLang] || UI_I18N.zh;
  const val = dict[key];
  if (typeof val === 'function') return val(...args);
  return val || key;
}

function initLanguage() {
  try {
    chrome.storage.sync.get(['uiLang'], (result) => {
      currentLang = getContentLang(result.uiLang);
    });
  } catch (e) {
    // Extension context invalidated
  }
}

// 監聽語言變化
try {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync' && changes.uiLang) {
      currentLang = getContentLang(changes.uiLang.newValue);
      // 刷新面板以更新語言
      const panel = document.getElementById(UI.panelId);
      if (panel?.classList.contains('open')) {
        refreshPanelStickers().catch(() => { });
      }
      // 更新選單文字
      updateContextMenuTexts();
    }
  });
} catch (e) {
  // Extension context invalidated
}

// ========= GSS-分類安全檢查 =========
// 安全檢查：確保圖片連結是安全的
function isSafeImageUrl(url) {
  try {
    // 檢查 URL 格式
    const urlObj = new URL(url);

    // 只允許 HTTP/HTTPS 協議
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return false;
    }

    // 檢查文件擴展名
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg', '.mp4'];
    const hasAllowedExtension = allowedExtensions.some(ext =>
      urlObj.pathname.toLowerCase().endsWith(ext)
    );

    if (!hasAllowedExtension) {
      return false;
    }

    // 檢查域名白名單（可選）
    const trustedDomains = [
      'i.imgur.com', 'imgur.com',
      'cdn.discordapp.com', 'media.discordapp.net',
      'i.redd.it', 'preview.redd.it',
      'pbs.twimg.com',
      'cdn.pixil.art',
      'i.nhentai.net', // 如果需要的話
      'storage.googleapis.com',
      'github.com', 'raw.githubusercontent.com'
    ];

    // 如果是受信任的域名，直接允許
    if (trustedDomains.some(domain => urlObj.hostname.includes(domain))) {
      return true;
    }

    // 對於其他域名，進行額外檢查
    // 不允許的域名模式
    const blockedPatterns = [
      /localhost/i,
      /127\.0\.0\.1/,
      /192\.168\./,
      /10\./,
      /\.onion/i,
      /\.bit/i
    ];

    if (blockedPatterns.some(pattern => pattern.test(urlObj.hostname))) {
      return false;
    }

    // 檢查 URL 長度限制
    if (url.length > 2048) {
      return false;
    }

    // 檢查是否包含可疑字符
    const suspiciousPatterns = [
      /javascript:/i,
      /data:/i,
      /vbscript:/i,
      /<script/i,
      /onload=/i,
      /onerror=/i
    ];

    if (suspiciousPatterns.some(pattern => pattern.test(url))) {
      return false;
    }

    return true;
  } catch (error) {
    console.warn('[GSS] URL 安全檢查失敗:', error);
    return false;
  }
}

// ========= 零寬字符隱藏訊息功能 =========
// 方案C: 只使用2種零寬字符表示1bit (Twitch會過濾U+FEFF和U+200D)
const ZW_CHARS = {
  '0': '\u200B', // 零寬空格 = 0
  '1': '\u200C'  // 零寬非連接符 = 1
};
const ZW_REVERSE = Object.fromEntries(Object.entries(ZW_CHARS).map(([k, v]) => [v, k]));

// 將字串編碼為零寬字符
function encodeToZeroWidth(str) {
  const bytes = new TextEncoder().encode(str);
  let encoded = '';
  for (const byte of bytes) {
    // 每個byte轉成8個bit，每個bit用一個零寬字符表示
    const b = byte.toString(2).padStart(8, '0');
    for (const bit of b) {
      encoded += ZW_CHARS[bit];
    }
  }
  return encoded;
}

// 從零寬字符解碼
function decodeFromZeroWidth(zwStr) {
  let bits = '';
  for (const char of zwStr) {
    const bit = ZW_REVERSE[char];
    if (bit) bits += bit;
  }
  // 每8bit一組轉成byte
  const bytes = [];
  for (let i = 0; i < bits.length; i += 8) {
    const byte = bits.slice(i, i + 8);
    if (byte.length === 8) {
      bytes.push(parseInt(byte, 2));
    }
  }
  return new TextDecoder().decode(new Uint8Array(bytes));
}

// 發送隱藏訊息（使用 GraphQL 像 IM 功能一樣）
async function sendHiddenMessage(message, visibleMarker = ' ') {
  const encoded = encodeToZeroWidth(message);
  const fullText = visibleMarker + encoded;

  try {
    await sendChatMessage(fullText);
    return true;
  } catch (err) {
    showSendFailureToast(`${t('sendFailedPrefix')} ${err.message}`);
    return false;
  }
}

// ========= UI: Chat-side button + floating panel =========
const UI = {
  rootId: 'dlsq_root',
  btnId: 'dlsq_btn',
  panelId: 'dlsq_panel',
  styleId: 'dlsq_style_v2',
  ctxMenuId: 'dlsq_ctx_menu',
  panelTagMenuId: 'dlsq_panel_tag_menu',
  failToastId: 'dlsq_fail_overlay',
  tabDLId: 'dlsq_tab_dl',
  tabCBId: 'dlsq_tab_cb',
  tabMEId: 'dlsq_tab_me',
  tabIMId: 'dlsq_tab_im',
  tabYTId: 'dlsq_tab_yt',
  zoomOverlayId: 'dlsq_zoom_overlay'
};

let panelFilterType = 'all'; // 'all', 'DL', 'IM', 'ME'
let panelFilterTag = '__all__';
let panelCurrentPage = 1; // 當前頁碼（分頁功能）
const PANEL_PAGE_SIZE = 12; // 每頁顯示 12 張貼圖（3行×4欄）
/** 保留標籤：帶此標籤的貼圖只在「隱藏」分頁顯示；一般分頁的「刪除」改為加此標籤 */
const PANEL_HIDDEN_TAG = '隱藏';
const PANEL_FILTER_HIDDEN = '__hidden__';
const PANEL_FILTER_UNCATEGORIZED = '__uncategorized__';
let suppressTileClickUntil = 0;
let suppressPanelAutoCloseUntil = 0;
let panelRefreshSeq = 0;
const PANEL_GRID_COLS = 4;
const PANEL_GRID_ROW_HEIGHT = 72;
const PANEL_GRID_MIN_HEIGHT = 72;
const PANEL_GRID_MAX_HEIGHT = 220;

let failToastHideTimer = null;

function suppressTileClickFor(ms = 450) {
  suppressTileClickUntil = Date.now() + Math.max(0, Number(ms) || 0);
}

function isTileClickSuppressed() {
  return Date.now() < suppressTileClickUntil;
}

function suppressPanelAutoCloseFor(ms = 700) {
  suppressPanelAutoCloseUntil = Date.now() + Math.max(0, Number(ms) || 0);
}

function isPanelAutoCloseSuppressed() {
  return Date.now() < suppressPanelAutoCloseUntil;
}

function ensureStyles() {
  let style = document.getElementById(UI.styleId);
  if (!style) {
    style = document.createElement('style');
    style.id = UI.styleId;
    document.documentElement.appendChild(style);
  }
  style.textContent = `
    #${UI.rootId} { position: relative; z-index: 999999; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    #${UI.btnId} {
      width: 26px; height: 26px; border-radius: 6px;
      border: 1px solid rgba(255,255,255,0.14);
      background: rgba(20,22,26,0.92);
      color: rgba(255,255,255,0.92);
      cursor: pointer;
      display: inline-flex; align-items: center; justify-content: center;
      margin-left: 6px;
      margin-right: 10px;
      user-select: none;
    }
    #${UI.btnId}:hover { background: rgba(28,30,36,0.96); border-color: rgba(120,190,255,0.45); }

    /* ===== Update button pulse animation ===== */
    @keyframes dlsq-pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.15); }
    }

    /* ===== 统一图片样式 - 全部在下一行 (display: block) ===== */
    .dlsq-chat-img {
      max-width: 100px;
      max-height: 100px;
      width: auto;
      height: auto;
      border-radius: 8px;
      cursor: default;
      display: block;
      margin: 4px 0;
      border: 2px solid transparent;
      object-fit: contain;
      clear: both;
    }
    /* 视频样式 - 也在下一行 */
    .dlsq-chat-video {
      max-width: 100px;
      max-height: 100px;
      width: auto;
      height: auto;
      border-radius: 8px;
      cursor: default;
      display: block;
      margin: 4px 0;
      border: 2px solid transparent;
      clear: both;
    }
    /* YouTube 缩略图 - 更大尺寸 */
    .dlsq-chat-yt {
      max-width: 160px;
      max-height: 90px;
      border-radius: 8px;
      display: block;
      cursor: pointer;
      object-fit: cover;
    }
    /* YouTube 缩略图容器 - 确保播放按钮居中定位 */
    .dlsq-yt-thumbnail, .gss-yt-thumbnail {
      position: relative !important;
      display: block !important;
      width: fit-content !important;
      height: fit-content !important;
      line-height: 0 !important;
      margin: 4px 0 !important;
      clear: both !important;
    }
    .dlsq-yt-thumbnail img, .gss-yt-thumbnail img {
      display: block !important;
    }
    /* 零宽解码标记 */
    .dlsq-hidden-decoded {
      opacity: 0.85;
    }

    #${UI.panelId} {
      position: fixed;
      right: 16px;
      bottom: 100px;
      width: 384px;
      max-width: calc(100vw - 32px);
      max-height: 480px;
      overflow: hidden;
      display: none;
      background: rgba(16,18,22,0.98);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 10px;
      box-shadow: 0 16px 44px rgba(0,0,0,0.55);
      z-index: 2147483647;
    }
    /* iframe 模式：更窄的面板 */
    #${UI.panelId}.iframe-mode {
      width: 320px;
      right: 10px;
      bottom: 90px;
      max-height: 480px; 
    }
    #${UI.panelId}.iframe-mode .body {
      max-height: 520px !important;
    }
    #${UI.panelId}.iframe-mode .grid {
      grid-template-columns: repeat(3, 1fr);
      height: 320px !important;
      max-height: none !important;
    }
    #${UI.panelId}.iframe-mode .tabs {
      height: 70px;
    }
    #${UI.panelId}.open { display: block; }
    #${UI.panelId} .hdr {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 10px;
      background: linear-gradient(180deg, rgba(28,30,36,0.98), rgba(18,20,24,0.98));
      color: rgba(255,255,255,0.92);
      font-size: 12px;
      font-weight: 600;
      border-bottom: 1px solid rgba(255,255,255,0.10);
    }
    #${UI.panelId} .hdr .close {
      cursor: pointer;
      padding: 2px 6px;
      border-radius: 6px;
      background: rgba(255,255,255,0.10);
    }
    #${UI.panelId} .hdr .close:hover { background: rgba(255,255,255,0.18); }
    #${UI.panelId} .body { padding: 10px; overflow: auto; max-height: 420px; }
    #${UI.panelId} .tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 10px;
      height: 72px;
      overflow-y: auto;
      padding: 6px 2px 6px 0;
      flex-shrink: 0;
      align-content: flex-start;
    }
    #${UI.panelId} .tabs .tab {
      border: 1px solid rgba(255,255,255,0.14);
      background: rgba(10,12,16,0.88);
      color: rgba(255,255,255,0.88);
      font-size: 11px;
      padding: 5px 8px;
      border-radius: 999px;
      cursor: pointer;
      max-width: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    #${UI.panelId} .tabs .tab:hover { background: rgba(120,190,255,0.14); border-color: rgba(120,190,255,0.45); }
    #${UI.panelId} .tabs .tab.on {
      background: rgba(120,190,255,0.22);
      border-color: rgba(120,190,255,0.55);
      color: rgba(255,255,255,0.96);
    }
    #${UI.panelId} .grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      height: 216px;
      padding-right: 2px;
    }
    #${UI.panelId} .tile {
      border: 0 !important;
      outline: none !important;
      box-shadow: none !important;
      border-radius: 10px;
      background: transparent !important;
      padding: 0 !important;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 64px;
      position: relative;
    }
    #${UI.panelId} .tile:hover { background: rgba(120,190,255,0.10); }
    #${UI.panelId} .tile:active { background: rgba(120,190,255,0.16); }
    #${UI.panelId} .tile img { max-width: 48px; max-height: 48px; }
    #${UI.panelId} .tile .fallback {
      font-size: 10px;
      color: rgba(255,255,255,0.82);
      text-align: center;
      line-height: 1.2;
      padding: 0 2px;
      word-break: break-word;
    }
    #${UI.panelId} .tile .fav {
      position: absolute;
      top: 4px;
      left: 6px;
      font-size: 12px;
      color: #ffd43b;
      text-shadow: 0 2px 10px rgba(0,0,0,0.65);
      display: none;
      pointer-events: none;
    }
    #${UI.panelId} .tile.favored .fav { display: block; }
    #${UI.panelId} .status {
      margin-top: 8px;
      font-size: 11px;
      color: rgba(255,255,255,0.72);
      min-height: 14px;
    }

    /* ===== Chat Button (聊天室輸入框按鈕) ===== */
    #${UI.btnId} {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 4px;
      margin: 0 4px;
      border-radius: 4px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      transition: background 0.15s ease;
    }
    #${UI.btnId}:hover {
      background: rgba(120,190,255,0.2);
    }
    #${UI.btnId} img {
      display: block;
      width: 20px;
      height: 20px;
    }

    /* ===== Right-click context menu (add sticker ID) ===== */
    #${UI.ctxMenuId} {
      position: fixed;
      z-index: 2147483647 !important;
      min-width: 180px;
      display: none;
      background: rgba(16,18,22,0.98);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 10px;
      box-shadow: 0 16px 44px rgba(0,0,0,0.55);
      padding: 6px;
      color: rgba(255,255,255,0.92);
      font-size: 12px;
    }
    #${UI.ctxMenuId}.open { display: block; }
    #${UI.ctxMenuId} .item {
      padding: 8px 10px;
      border-radius: 8px;
      cursor: pointer;
      user-select: none;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }
    #${UI.ctxMenuId} .item:hover { background: rgba(120,190,255,0.14); }
    #${UI.ctxMenuId} .sub {
      margin-top: 4px;
      padding: 0 10px 6px;
      color: rgba(255,255,255,0.55);
      font-size: 11px;
      word-break: break-all;
    }
    #${UI.panelTagMenuId} {
      position: fixed;
      z-index: 2147483647 !important;
      min-width: 180px;
      max-width: 280px;
      display: none;
      background: rgba(16,18,22,0.98);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 10px;
      box-shadow: 0 16px 44px rgba(0,0,0,0.55);
      padding: 6px;
      color: rgba(255,255,255,0.92);
      font-size: 12px;
    }
    #${UI.panelTagMenuId}.open { display: block; }
    #${UI.panelTagMenuId} .item {
      padding: 8px 10px;
      border-radius: 8px;
      cursor: pointer;
      user-select: none;
    }
    #${UI.panelTagMenuId} .item:hover { background: rgba(120,190,255,0.14); }
    #${UI.panelTagMenuId} .sub {
      padding: 4px 10px 6px;
      color: rgba(255,255,255,0.55);
      font-size: 11px;
      word-break: break-all;
    }
    #${UI.panelTagMenuId} .item.on::after {
      content: "✓";
      float: right;
      opacity: 0.8;
    }

    /* ===== Send failure toast（與貼圖面板同角落，不遮全畫面）===== */
    #${UI.failToastId} {
      position: fixed;
      right: 16px;
      bottom: 80px;
      width: 384px;
      z-index: 1000001;
      display: none;
      pointer-events: none;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    #${UI.failToastId}.open { display: block; }
    #${UI.failToastId} .dlsq-fail-card {
      width: 100%;
      pointer-events: auto;
      background: rgba(22,24,30,0.98);
      border: 1px solid rgba(255,80,80,0.35);
      border-radius: 10px;
      box-shadow: 0 16px 44px rgba(0,0,0,0.55);
      overflow: hidden;
    }
    #${UI.failToastId} .dlsq-fail-hdr {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 12px 14px;
      background: rgba(40,20,22,0.95);
      border-bottom: 1px solid rgba(255,80,80,0.2);
    }
    #${UI.failToastId} .dlsq-fail-title {
      font-size: 13px;
      font-weight: 600;
      color: #ff6b6b;
    }
    #${UI.failToastId} .dlsq-fail-x {
      border: 0;
      background: rgba(255,255,255,0.10);
      color: rgba(255,255,255,0.85);
      width: 28px;
      height: 28px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      line-height: 1;
    }
    #${UI.failToastId} .dlsq-fail-x:hover { background: rgba(255,255,255,0.18); }
    #${UI.failToastId} .dlsq-fail-msg {
      padding: 14px;
      font-size: 12px;
      line-height: 1.45;
      color: rgba(255,255,255,0.88);
      word-break: break-word;
      max-height: 180px;
      overflow-y: auto;
    }

    /* ===== Image Zoom Overlay ===== */
    #${UI.zoomOverlayId} {
      position: fixed;
      z-index: 1000002;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.85);
      display: none;
      align-items: center;
      justify-content: center;
      cursor: zoom-out;
    }
    #${UI.zoomOverlayId}.open { display: flex; }
    #${UI.zoomOverlayId} .zoom-img {
      max-width: 80vw;
      max-height: 80vh;
      object-fit: contain;
      border-radius: 8px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.6);
      transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), top 0.2s cubic-bezier(0.4, 0, 0.2, 1), left 0.2s cubic-bezier(0.4, 0, 0.2, 1), width 0.2s cubic-bezier(0.4, 0, 0.2, 1), height 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      position: fixed;
      transform-origin: center center;
    }
    #${UI.zoomOverlayId} .zoom-img.fly-complete {
      transition: none;
    }

    /* ===== Layout Compress Styles ===== */
    .dlsq-donation-hidden {
      display: none !important;
    }
    .dlsq-title-hidden {
      display: none !important;
      visibility: hidden !important;
      height: 0 !important;
      min-height: 0 !important;
      overflow: hidden !important;
    }
    .dlsq-title-hidden-fix1 {
      display: none !important;
    }

    /* ===== Chat Room Control (聊天室控制) ===== */
    .dlsq-chat-narrow {
      width: 160px !important;
      min-width: 160px !important;
      max-width: 160px !important;
    }
    .dlsq-chat-hidden {
      display: none !important;
      width: 0 !important;
      min-width: 0 !important;
    }
    /* Chat Ghost Mode - 半透明只顯示對話 */
    .dlsq-chat-ghost {
      opacity: 0.3 !important;
      transition: none !important;
    }
    .dlsq-chat-ghost:hover {
      opacity: 1 !important;
    }
    .dlsq-chat-ghost .v-stream-chatroom-input,
    .dlsq-chat-ghost .chatroom-top-contributors,
    .dlsq-chat-ghost [class*="top-contributor"] {
      display: none !important;
    }
    .dlsq-chat-ghost .chatroom:hover {
      opacity: 1 !important;
    }

    /* ===== Chat Overlay Mode (聊天室浮動在影片上) ===== */
    .dlsq-chat-overlay {
      position: fixed !important;
      right: 0 !important;
      top: 60px !important;
      height: calc(100vh - 60px) !important;
      width: 393px !important;
      z-index: 1000 !important;
      background: transparent !important;
    }
    .dlsq-chat-overlay .chatroom {
      background: transparent !important;
    }
    .dlsq-chat-overlay:hover {
      background: rgba(0, 0, 0, 0.3) !important;
    }

    /* ===== Sidebar & Nav Bar Control (側邊欄和頂部導航控制) ===== */
    .dlsq-sidebar-hidden {
      display: none !important;
      width: 0 !important;
      min-width: 0 !important;
    }
    .dlsq-navbar-hidden {
      display: none !important;
      height: 0 !important;
      min-height: 0 !important;
      max-height: 0 !important;
      overflow: hidden !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    /* When navbar is hidden, adjust main content to fill viewport */
    .application:has(.dlsq-navbar-hidden),
    #genius:has(.dlsq-navbar-hidden) {
      padding-top: 0 !important;
      margin-top: 0 !important;
    }
    /* Adjust mobile-page when navbar is hidden */
    .application:has(.dlsq-navbar-hidden) .mobile-page,
    #genius:has(.dlsq-navbar-hidden) .mobile-page {
      height: 100vh !important;
      min-height: 100vh !important;
    }
    .dlsq-extra-hidden {
      display: none !important;
    }
    /* Hide Vuetify dialog overlays that block video - disabled as it hides video */
    /* .v-dialog__content { display: none !important; } */
    /* Hide DPlayer gift animations only, keep mask and bezel for controls */
    .dplayer-gifts {
      display: none !important;
      pointer-events: none !important;
    }
    /* NOTE: .dplayer-mask and .dplayer-bezel removed - they are needed for video controls */
    /* About Panel Hidden */
    .dlsq-about-hidden {
      display: none !important;
    }
    /* Video expand mode - make video fill remaining space */
    .dlsq-video-expanded .dplayer,
    .dlsq-video-expanded .dplayer-video-wrap {
      height: auto !important;
      flex: 1 1 auto !important;
    }
    .dlsq-video-expanded .dplayer-video {
      object-fit: cover !important;
    }
    .dlsq-video-expanded .dplayer-video-wrap {
      background: transparent !important;
    }
    /* Remove dark background from application container */
    .dlsq-video-expanded .application,
    .dlsq-video-expanded .application--wrap,
    .dlsq-video-expanded #genius {
      background: transparent !important;
      background-color: transparent !important;
    }
    .dlsq-video-expanded.mobile-page,
    .dlsq-video-expanded .mobile-page {
      height: 100vh !important;
      min-height: 100vh !important;
    }
    /* Remove padding from ancestor containers to eliminate side black bars */
    .dlsq-video-expanded .mobile-page,
    .dlsq-video-expanded .mobile-page > div,
    .dlsq-video-expanded .position-absolute,
    .dlsq-video-expanded .width-100 {
      padding: 0 !important;
    }
  `;
}

function hideSendFailureToast() {
  if (failToastHideTimer) {
    clearTimeout(failToastHideTimer);
    failToastHideTimer = null;
  }
  const wrap = document.getElementById(UI.failToastId);
  if (wrap) wrap.classList.remove('open');
}

function showToast(message, duration = 3000) {
  ensureStyles();
  const toastId = 'dlsq_toast_msg';
  let toast = document.getElementById(toastId);

  if (!toast) {
    toast = document.createElement('div');
    toast.id = toastId;
    toast.style.cssText = `
      position: fixed;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(20, 22, 26, 0.98);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      padding: 12px 20px;
      color: #fff;
      font-size: 13px;
      z-index: 2147483647;
      box-shadow: 0 4px 20px rgba(0,0,0,0.4);
      transition: opacity 0.3s;
    `;
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.opacity = '1';

  setTimeout(() => {
    toast.style.opacity = '0';
  }, duration);
}

function showSendFailureToast(message) {
  const text = String(message || '').trim() || t('unknownError');
  ensureStyles();
  let wrap = document.getElementById(UI.failToastId);
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.id = UI.failToastId;

    const card = document.createElement('div');
    card.className = 'dlsq-fail-card';
    card.setAttribute('role', 'alert');
    card.setAttribute('aria-labelledby', 'dlsq_fail_title');

    const hdr = document.createElement('div');
    hdr.className = 'dlsq-fail-hdr';

    const title = document.createElement('span');
    title.className = 'dlsq-fail-title';
    title.id = 'dlsq_fail_title';
    title.textContent = '貼圖送出失敗';

    const xBtn = document.createElement('button');
    xBtn.type = 'button';
    xBtn.className = 'dlsq-fail-x';
    xBtn.setAttribute('aria-label', '關閉');
    xBtn.textContent = '✕';
    xBtn.addEventListener('click', () => hideSendFailureToast());

    hdr.appendChild(title);
    hdr.appendChild(xBtn);

    const msgDiv = document.createElement('div');
    msgDiv.className = 'dlsq-fail-msg';

    card.appendChild(hdr);
    card.appendChild(msgDiv);
    wrap.appendChild(card);
    document.body.appendChild(wrap);
  }
  wrap.querySelector('.dlsq-fail-msg').textContent = text;
  wrap.classList.add('open');
  if (failToastHideTimer) clearTimeout(failToastHideTimer);
  failToastHideTimer = setTimeout(() => {
    failToastHideTimer = null;
    hideSendFailureToast();
  }, 6200);
}

function setPanelStatus(text, color = '#495057') {
  const panel = document.getElementById(UI.panelId);
  if (!panel) return;
  const status = panel.querySelector('.status');
  if (!status) return;
  status.style.color = color;
  status.textContent = text || '';
}

function togglePanel(force) {
  const panel = document.getElementById(UI.panelId);
  if (!panel) return;
  const shouldOpen = typeof force === 'boolean' ? force : !panel.classList.contains('open');
  panel.classList.toggle('open', shouldOpen);
  if (shouldOpen) {
    panelFilterType = 'all';
    panelFilterTag = '__all__';
    panelCurrentPage = 1; // 重置頁碼
    refreshPanelStickers();
  }
}

function applyStickerTypeFilter() {
  const grid = document.getElementById(UI.panelId)?.querySelector('.grid');
  if (!grid) return;

  const tiles = grid.querySelectorAll('.tile');
  tiles.forEach(tile => {
    const type = tile.getAttribute('data-type');
    if (panelFilterType === 'all') {
      tile.style.display = '';
    } else if (panelFilterType === 'DL') {
      tile.style.display = type === 'DL' ? '' : 'none';
    } else if (panelFilterType === 'IM') {
      tile.style.display = type === 'IM' ? '' : 'none';
    } else if (panelFilterType === 'ME') {
      tile.style.display = type === 'ME' ? '' : 'none';
    } else if (panelFilterType === 'YT') {
      tile.style.display = type === 'YT' ? '' : 'none';
    }
  });
}

async function refreshTagTabs() {
  // 只更新標籤按鈕，不清空重建 grid，避免掉落震動
  const panel = document.getElementById(UI.panelId);
  if (!panel) return;
  const tabs = panel.querySelector('.tabs');
  if (!tabs || !TAG) return;

  const storage = await chrome.storage.local.get(['stickerIdsText', 'stickerTagVocabularyText', 'favoriteStickerIds']);
  const parsed = TAG.parseStickerIdsText(storage.stickerIdsText || '');
  const tabMap = TAG.rowsToIdTagMap(parsed.rows);
  const tabLabels = TAG.sortedTagLabelsForTabs(parsed.rows);

  // 根據當前類型過濾 rows 統計數量
  const isIMId = (id) => id && id.startsWith('IM-');
  const isMEId = (id) => id && id.startsWith('ME-');
  const isCBId = (id) => id && id.startsWith('CB-');
  const isGSSId = (id) => id && id.startsWith('GSS-');
  const isDLId = (id) => id && (id.startsWith('DL-') || (/^[A-Za-z0-9_]+$/.test(id) && !id.startsWith('IM-') && !id.startsWith('ME-') && !id.startsWith('CB-') && !id.startsWith('GSS-')));

  const filteredRows = parsed.rows.filter((r) => {
    // 移除 DL 過濾類型
    if (panelFilterType === 'CB') return isCBId(r.id);
    if (panelFilterType === 'ME') return isMEId(r.id);
    if (panelFilterType === 'IM') return isIMId(r.id);
    if (panelFilterType === 'GSS') return isGSSId(r.id);
    return true;
  });

  // 清空並重建標籤按鈕
  tabs.innerHTML = '';

  const mkTab = (label, value) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `tab${panelFilterTag === value ? ' on' : ''}`;
    b.textContent = label;
    b.title = label;
    b.addEventListener('click', () => {
      panelFilterTag = value;
      panelCurrentPage = 1; // 【分頁】重置頁碼
      // 重新整理面板以應用標籤過濾和分頁
      refreshPanelStickers();
    });
    tabs.appendChild(b);
  };

  const hiddenKey = PANEL_HIDDEN_TAG.toLowerCase();
  const counts = TAG.tagCountsFromRows(filteredRows);
  const hiddenCount = (filteredRows || []).filter((r) =>
    (r?.tags || []).some((t) => String(t).toLowerCase() === hiddenKey)
  ).length;
  const uncategorizedCount = (filteredRows || []).filter((r) => {
    if ((r?.tags || []).some((t) => String(t).toLowerCase() === hiddenKey)) return false;
    return !r?.tags?.length || r.tags.length === 0;
  }).length;

  mkTab(t('all'), '__all__');
  mkTab(t('uncategorizedTab', uncategorizedCount), PANEL_FILTER_UNCATEGORIZED);

  // 收集當前類型下存在的標籤
  const existingLabels = new Set();
  for (const lab of tabLabels) {
    if (String(lab).toLowerCase() === hiddenKey) continue;
    const c = counts[lab] || 0;
    mkTab(`${lab} (${c})`, lab);
    existingLabels.add(String(lab).toLowerCase());
  }

  // 如果當前選中的標籤不在新類型下，仍然創建一個計數為0的按鈕以保持選中狀態
  const currentTag = panelFilterTag;
  if (currentTag &&
    currentTag !== '__all__' &&
    currentTag !== PANEL_FILTER_HIDDEN &&
    currentTag !== PANEL_FILTER_UNCATEGORIZED &&
    !existingLabels.has(String(currentTag).toLowerCase())) {
    mkTab(`${currentTag} (0)`, currentTag);
  }

  mkTab(t('hiddenTab', hiddenCount), PANEL_FILTER_HIDDEN);
}

// 輕量級標籤過濾：只顯示/隱藏 tile，不清空重建 DOM
async function applyTagFilter() {
  const grid = document.getElementById(UI.panelId)?.querySelector('.grid');
  if (!grid) return;

  const active = panelFilterTag || '__all__';
  const hiddenKey = PANEL_HIDDEN_TAG.toLowerCase();

  // 獲取所有 tile
  const tiles = grid.querySelectorAll('.tile');

  // 如果沒有標籤數據，先加載
  let tagMap = {};
  if (TAG) {
    try {
      const storage = await chrome.storage.local.get(['stickerIdsText']);
      const parsed = TAG.parseStickerIdsText(storage.stickerIdsText || '');
      tagMap = TAG.rowsToIdTagMap(parsed.rows);
    } catch (e) {
      // 忽略錯誤
    }
  }

  tiles.forEach(tile => {
    const code = tile.getAttribute('data-code');
    const sid = tile.getAttribute('data-id');
    if (!code || !sid) {
      tile.style.display = 'none';
      return;
    }

    // 先檢查 DL/IM/ME 類型過濾
    const type = tile.getAttribute('data-type');
    if (panelFilterType === 'DL' && type !== 'DL') {
      tile.style.display = 'none';
      return;
    }
    if (panelFilterType === 'IM' && type !== 'IM') {
      tile.style.display = 'none';
      return;
    }
    if (panelFilterType === 'ME' && type !== 'ME') {
      tile.style.display = 'none';
      return;
    }

    // 再檢查標籤過濾
    const tags = tagMap[sid] || [];
    const isHidden = tags.some((t) => String(t).toLowerCase() === hiddenKey);

    if (active === '__all__') {
      tile.style.display = isHidden ? 'none' : '';
    } else if (active === PANEL_FILTER_HIDDEN) {
      tile.style.display = isHidden ? '' : 'none';
    } else if (active === PANEL_FILTER_UNCATEGORIZED) {
      tile.style.display = (!isHidden && tags.length === 0) ? '' : 'none';
    } else {
      const key = String(active).toLowerCase();
      const hasTag = tags.some((t) => String(t).toLowerCase() === key);
      tile.style.display = (!isHidden && hasTag) ? '' : 'none';
    }
  });
}

function createPanelIfNeeded() {
  const existingPanel = document.getElementById(UI.panelId);
  if (existingPanel) {
    // 面板已存在，檢查是否需要更新高亮狀態（例如版本更新後）
    // 在整個 panel 裡找 📢 按鈕
    const spans = existingPanel.querySelectorAll('span');
    let updateBtn = null;
    for (const span of spans) {
      if (span.textContent === '📢') {
        updateBtn = span;
        break;
      }
    }
    if (updateBtn) {
      try {
        chrome.storage.local.get(['lastSeenVersion'], (result) => {
          if (result.lastSeenVersion !== CURRENT_VERSION) {
            // 確保 CSS 動畫已注入（對於已存在的面板）
            ensureStyles();

            updateBtn.dataset.highlighted = 'true';
            updateBtn.style.opacity = '1';
            updateBtn.style.animation = 'dlsq-pulse 1.5s infinite';
            updateBtn.style.color = '#ffd43b'; // 黃色文字強制高亮
            updateBtn.style.textShadow = '0 0 8px rgba(255, 212, 59, 0.8)'; // 發光效果
            updateBtn.style.position = 'relative'; // 為紅點定位
            updateBtn.title = t('updateNewVersion');

            // 動態添加紅點（模擬主面板的 ::after 效果）
            if (!updateBtn.querySelector('.gss-red-dot')) {
              const redDot = document.createElement('span');
              redDot.className = 'gss-red-dot';
              redDot.style.cssText = 'position:absolute;top:-1px;right:-1px;width:5px;height:5px;background:#ff4444;border-radius:50%;box-shadow:0 0 3px rgba(255,68,68,0.8);';
              updateBtn.appendChild(redDot);
            }

          }
        });
      } catch (e) {
        // Extension context invalidated - 擴充重新載入後無法使用 storage
        console.log('[GSS] Extension context invalidated, skipping update button highlight');
      }
    }
    return;
  }
  ensureStyles();
  const panel = document.createElement('div');
  panel.id = UI.panelId;

  // 检测是否在 iframe 中（共用聊天室模式）
  const isInIframe = window.self !== window.top;
  if (isInIframe) {
    panel.classList.add('iframe-mode');
  }

  const hdr = document.createElement('div');
  hdr.className = 'hdr';

  // 左側：標題
  const title = document.createElement('div');
  title.textContent = 'GSS';

  // 標題右側：更新與說明圖示
  const iconsContainer = document.createElement('div');
  iconsContainer.style.display = 'flex';
  iconsContainer.style.gap = '6px';
  iconsContainer.style.alignItems = 'center';
  iconsContainer.style.marginLeft = '8px';

  // 更新通知圖示 📢
  const updateBtn = document.createElement('span');
  updateBtn.textContent = '📢';
  updateBtn.dataset.updateBtn = 'true'; // 用於後續選取
  updateBtn.style.fontSize = '14px';
  updateBtn.style.cursor = 'pointer';
  updateBtn.style.opacity = '0.7';
  updateBtn.style.transition = 'opacity 0.2s, transform 0.2s';
  updateBtn.title = t('updateChangelog');
  updateBtn.addEventListener('mouseenter', () => {
    updateBtn.style.opacity = '1';
    updateBtn.style.transform = 'scale(1.1)';
  });
  updateBtn.addEventListener('mouseleave', () => {
    updateBtn.style.opacity = updateBtn.dataset.highlighted === 'true' ? '1' : '0.7';
    updateBtn.style.transform = 'scale(1)';
  });
  updateBtn.addEventListener('click', () => {
    try {
      // 標記為已讀
      chrome.storage.local.set({ lastSeenVersion: CURRENT_VERSION });
      // 移除高亮
      updateBtn.dataset.highlighted = 'false';
      updateBtn.style.opacity = '0.7';
      updateBtn.style.animation = 'none';
      updateBtn.style.color = '';
      updateBtn.style.textShadow = '';
      updateBtn.style.position = '';
      // 移除紅點
      const redDot = updateBtn.querySelector('.gss-red-dot');
      if (redDot) redDot.remove();
      // 開啟更新日誌 - 直接開啟外部連結
      const updatelogUrl = 'https://elfinl.github.io/General-Sticker-System/updatelog.html';
      window.open(updatelogUrl, '_blank');
    } catch (e) {
      console.error('[GSS] Error in update button click:', e);
    }
  });

  // 說明圖示 ❓
  const helpBtn = document.createElement('span');
  helpBtn.textContent = '❓';
  helpBtn.style.fontSize = '14px';
  helpBtn.style.cursor = 'pointer';
  helpBtn.style.opacity = '0.7';
  helpBtn.style.transition = 'opacity 0.2s, transform 0.2s';
  helpBtn.title = t('helpPage');
  helpBtn.addEventListener('mouseenter', () => {
    helpBtn.style.opacity = '1';
    helpBtn.style.transform = 'scale(1.1)';
  });
  helpBtn.addEventListener('mouseleave', () => {
    helpBtn.style.opacity = '0.7';
    helpBtn.style.transform = 'scale(1)';
  });
  helpBtn.addEventListener('click', () => {
    try {
      const helpUrl = 'https://elfinl.github.io/General-Sticker-System/help.html';
      window.open(helpUrl, '_blank');
    } catch (e) {
      window.open(helpUrl, '_blank');
    }
  });

  iconsContainer.appendChild(updateBtn);
  iconsContainer.appendChild(helpBtn);

  // 檢查是否需要高亮更新圖示
  chrome.storage.local.get(['lastSeenVersion'], (result) => {
    if (result.lastSeenVersion !== CURRENT_VERSION) {
      updateBtn.dataset.highlighted = 'true';
      updateBtn.style.opacity = '1';
      updateBtn.style.animation = 'dlsq-pulse 1.5s infinite';
      updateBtn.style.color = '#ffd43b';
      updateBtn.style.textShadow = '0 0 8px rgba(255, 212, 59, 0.8)';
      updateBtn.style.position = 'relative';
      updateBtn.title = t('updateNewVersion');
      // 添加紅點
      const redDot = document.createElement('span');
      redDot.className = 'gss-red-dot';
      redDot.style.cssText = 'position:absolute;top:-1px;right:-1px;width:5px;height:5px;background:#ff4444;border-radius:50%;box-shadow:0 0 3px rgba(255,68,68,0.8);';
      updateBtn.appendChild(redDot);
    }
  });

  // 中間：類型切換 Tab（DL CB ME IM YT）
  const tabsContainer = document.createElement('div');
  tabsContainer.style.display = 'flex';
  tabsContainer.style.gap = '6px';
  tabsContainer.style.alignItems = 'center';
  tabsContainer.style.marginLeft = 'auto';
  tabsContainer.style.marginRight = '12px';

  const tabAll = document.createElement('button');
  tabAll.id = 'dlsq_tab_all';
  tabAll.textContent = 'ALL';
  tabAll.style.padding = '3px 8px';
  tabAll.style.borderRadius = '6px';
  tabAll.style.border = '1px solid rgba(255,255,255,0.14)';
  tabAll.style.background = 'rgba(120,190,255,0.22)';
  tabAll.style.color = 'rgba(255,255,255,0.96)';
  tabAll.style.fontSize = '10px';
  tabAll.style.cursor = 'pointer';
  tabAll.style.fontWeight = '600';
  tabAll.addEventListener('click', async () => {
    panelFilterType = 'all';
    panelCurrentPage = 1; // 重置頁碼
    updatePanelTypeTabs();
    await refreshTagTabs();
    refreshPanelStickers();
  });


  const tabCB = document.createElement('button');
  tabCB.id = UI.tabCBId;
  tabCB.textContent = 'CB';
  tabCB.style.padding = '3px 8px';
  tabCB.style.borderRadius = '6px';
  tabCB.style.border = '1px solid rgba(255,255,255,0.14)';
  tabCB.style.background = 'rgba(10,12,16,0.88)';
  tabCB.style.color = 'rgba(255,255,255,0.88)';
  tabCB.style.fontSize = '10px';
  tabCB.style.cursor = 'pointer';
  tabCB.style.fontWeight = '600';
  tabCB.addEventListener('click', async () => {
    panelFilterType = 'CB';
    panelCurrentPage = 1; // 重置頁碼
    updatePanelTypeTabs();
    await refreshTagTabs();
    refreshPanelStickers();
  });

  const tabIM = document.createElement('button');
  tabIM.id = UI.tabIMId;
  tabIM.textContent = 'IM';
  tabIM.style.padding = '3px 8px';
  tabIM.style.borderRadius = '6px';
  tabIM.style.border = '1px solid rgba(255,255,255,0.14)';
  tabIM.style.background = 'rgba(10,12,16,0.88)';
  tabIM.style.color = 'rgba(255,255,255,0.88)';
  tabIM.style.fontSize = '10px';
  tabIM.style.cursor = 'pointer';
  tabIM.style.fontWeight = '600';
  tabIM.addEventListener('click', async () => {
    panelFilterType = 'IM';
    panelCurrentPage = 1; // 重置頁碼
    updatePanelTypeTabs();
    await refreshTagTabs();
    refreshPanelStickers();
  });

  const tabME = document.createElement('button');
  tabME.id = 'dlsq_tab_me';
  tabME.textContent = 'ME';
  tabME.style.padding = '3px 8px';
  tabME.style.borderRadius = '6px';
  tabME.style.border = '1px solid rgba(255,255,255,0.14)';
  tabME.style.background = 'rgba(10,12,16,0.88)';
  tabME.style.color = 'rgba(255,255,255,0.88)';
  tabME.style.fontSize = '10px';
  tabME.style.cursor = 'pointer';
  tabME.style.fontWeight = '600';
  tabME.addEventListener('click', async () => {
    panelFilterType = 'ME';
    panelCurrentPage = 1; // 重置頁碼
    updatePanelTypeTabs();
    await refreshTagTabs();
    refreshPanelStickers();
  });

  const tabYT = document.createElement('button');
  tabYT.id = 'dlsq_tab_yt';
  tabYT.textContent = 'YT';
  tabYT.style.padding = '3px 8px';
  tabYT.style.borderRadius = '6px';
  tabYT.style.border = '1px solid rgba(255,255,255,0.14)';
  tabYT.style.background = 'rgba(10,12,16,0.88)';
  tabYT.style.color = 'rgba(255,255,255,0.88)';
  tabYT.style.fontSize = '10px';
  tabYT.style.cursor = 'pointer';
  tabYT.style.fontWeight = '600';
  tabYT.addEventListener('click', async () => {
    panelFilterType = 'YT';
    panelCurrentPage = 1; // 重置頁碼
    updatePanelTypeTabs();
    await refreshTagTabs();
    refreshPanelStickers();
  });

  tabsContainer.appendChild(tabAll);

  const tabGSS = document.createElement('button');
  tabGSS.id = 'dlsq_tab_gss';
  tabGSS.textContent = 'GSS';
  tabGSS.style.padding = '3px 8px';
  tabGSS.style.borderRadius = '6px';
  tabGSS.style.border = '1px solid rgba(255,255,255,0.14)';
  tabGSS.style.background = 'rgba(10,12,16,0.88)';
  tabGSS.style.color = 'rgba(255,255,255,0.88)';
  tabGSS.style.fontSize = '10px';
  tabGSS.style.cursor = 'pointer';
  tabGSS.style.fontWeight = '600';
  tabGSS.addEventListener('click', async () => {
    panelFilterType = 'GSS';
    panelCurrentPage = 1; // 重置頁碼
    updatePanelTypeTabs();
    await refreshTagTabs();
    refreshPanelStickers();
  });

  tabsContainer.appendChild(tabGSS);
  tabsContainer.appendChild(tabCB);
  tabsContainer.appendChild(tabME);
  tabsContainer.appendChild(tabIM);
  tabsContainer.appendChild(tabYT);

  // 右側：關閉按鈕
  const closeBtn = document.createElement('div');
  closeBtn.className = 'close';
  closeBtn.title = 'Close';
  closeBtn.textContent = '✕';
  closeBtn.addEventListener('click', () => togglePanel(false));

  hdr.appendChild(title);
  hdr.appendChild(iconsContainer);
  hdr.appendChild(tabsContainer);
  hdr.appendChild(closeBtn);

  const body = document.createElement('div');
  body.className = 'body';
  const tabs = document.createElement('div');
  tabs.className = 'tabs';

  // 分頁控制區域（在標籤下方，grid 上方）
  const pagination = document.createElement('div');
  pagination.className = 'pagination';
  pagination.id = 'dlsq_pagination';
  pagination.style.display = 'flex';
  pagination.style.alignItems = 'center';
  pagination.style.justifyContent = 'center';
  pagination.style.gap = '12px';
  pagination.style.marginBottom = '10px';
  pagination.style.padding = '6px 0';
  pagination.style.fontSize = '12px';
  pagination.style.color = 'rgba(255,255,255,0.88)';

  const prevBtn = document.createElement('button');
  prevBtn.id = 'dlsq_prev_page';
  prevBtn.textContent = t('prevPage');
  prevBtn.style.padding = '4px 10px';
  prevBtn.style.borderRadius = '6px';
  prevBtn.style.border = '1px solid rgba(255,255,255,0.14)';
  prevBtn.style.background = 'rgba(10,12,16,0.88)';
  prevBtn.style.color = 'rgba(255,255,255,0.88)';
  prevBtn.style.fontSize = '11px';
  prevBtn.style.cursor = 'pointer';
  prevBtn.addEventListener('click', () => goToPage(panelCurrentPage - 1));

  const pageInfo = document.createElement('span');
  pageInfo.id = 'dlsq_page_info';
  pageInfo.textContent = '1 / 1';
  pageInfo.style.minWidth = '50px';
  pageInfo.style.textAlign = 'center';

  const nextBtn = document.createElement('button');
  nextBtn.id = 'dlsq_next_page';
  nextBtn.textContent = t('nextPage');
  nextBtn.style.padding = '4px 10px';
  nextBtn.style.borderRadius = '6px';
  nextBtn.style.border = '1px solid rgba(255,255,255,0.14)';
  nextBtn.style.background = 'rgba(10,12,16,0.88)';
  nextBtn.style.color = 'rgba(255,255,255,0.88)';
  nextBtn.style.fontSize = '11px';
  nextBtn.style.cursor = 'pointer';
  nextBtn.addEventListener('click', () => goToPage(panelCurrentPage + 1));

  pagination.appendChild(prevBtn);
  pagination.appendChild(pageInfo);
  pagination.appendChild(nextBtn);

  // 【滑鼠滾輪分頁】為分頁控制區域添加滾輪事件
  pagination.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      // 向上滾輪 → 上一頁
      goToPage(panelCurrentPage - 1);
    } else if (e.deltaY > 0) {
      // 向下滾輪 → 下一頁
      goToPage(panelCurrentPage + 1);
    }
  }, { passive: false });

  const grid = document.createElement('div');
  grid.className = 'grid';

  // 【滑鼠滾輪分頁】為圖片區域也添加滾輪事件
  grid.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      // 向上滾輪 → 上一頁
      goToPage(panelCurrentPage - 1);
    } else if (e.deltaY > 0) {
      // 向下滾輪 → 下一頁
      goToPage(panelCurrentPage + 1);
    }
  }, { passive: false });

  // 【已刪除視頻控制區域按鈕】

  // 標籤分類區域

  const status = document.createElement('div');
  status.className = 'status';

  body.appendChild(tabs);
  body.appendChild(pagination);
  body.appendChild(grid);
  body.appendChild(status);
  panel.appendChild(hdr);
  panel.appendChild(body);
  document.body.appendChild(panel);
}

// 分頁切換函數
function goToPage(page) {
  const pagination = document.getElementById('dlsq_pagination');
  if (!pagination) return;

  // 獲取總頁數（需要從當前過濾結果計算）
  const totalPages = Math.max(1, Math.ceil(pagination.dataset.totalItems / PANEL_PAGE_SIZE));

  // 限制頁碼範圍
  page = Math.max(1, Math.min(page, totalPages));

  // 更新當前頁碼
  panelCurrentPage = page;

  // 刷新面板顯示
  refreshPanelStickers();
}

function updatePanelTypeTabs() {
  const tabAll = document.getElementById('dlsq_tab_all');
  const tabCB = document.getElementById(UI.tabCBId);
  const tabME = document.getElementById(UI.tabMEId);
  const tabIM = document.getElementById(UI.tabIMId);
  const tabGSS = document.getElementById('dlsq_tab_gss');
  if (!tabAll || !tabCB || !tabIM || !tabME || !tabGSS) return;

  // 重置所有樣式
  const inactiveStyle = {
    background: 'rgba(10,12,16,0.88)',
    color: 'rgba(255,255,255,0.88)'
  };
  const activeStyle = {
    background: 'rgba(120,190,255,0.22)',
    color: 'rgba(255,255,255,0.96)'
  };

  // 全部
  if (panelFilterType === 'all') {
    tabAll.style.background = activeStyle.background;
    tabAll.style.color = activeStyle.color;
  } else {
    tabAll.style.background = inactiveStyle.background;
    tabAll.style.color = inactiveStyle.color;
  }


  // CB
  if (panelFilterType === 'CB') {
    tabCB.style.background = activeStyle.background;
    tabCB.style.color = activeStyle.color;
  } else {
    tabCB.style.background = inactiveStyle.background;
    tabCB.style.color = inactiveStyle.color;
  }

  // IM
  if (panelFilterType === 'IM') {
    tabIM.style.background = activeStyle.background;
    tabIM.style.color = activeStyle.color;
  } else {
    tabIM.style.background = inactiveStyle.background;
    tabIM.style.color = inactiveStyle.color;
  }

  // ME
  if (panelFilterType === 'ME') {
    tabME.style.background = activeStyle.background;
    tabME.style.color = activeStyle.color;
  } else {
    tabME.style.background = inactiveStyle.background;
    tabME.style.color = inactiveStyle.color;
  }

  // GSS
  if (panelFilterType === 'GSS') {
    tabGSS.style.background = activeStyle.background;
    tabGSS.style.color = activeStyle.color;
  } else {
    tabGSS.style.background = inactiveStyle.background;
    tabGSS.style.color = inactiveStyle.color;
  }

  // YT
  const tabYT = document.getElementById('dlsq_tab_yt');
  if (tabYT) {
    if (panelFilterType === 'YT') {
      tabYT.style.background = activeStyle.background;
      tabYT.style.color = activeStyle.color;
    } else {
      tabYT.style.background = inactiveStyle.background;
      tabYT.style.color = inactiveStyle.color;
    }
  }
}

function applyStableGridHeight(gridEl, allStickerCount) {
  if (!gridEl) return;
  const count = Number.isFinite(allStickerCount) ? allStickerCount : 0;
  const rows = Math.max(1, Math.ceil(Math.max(0, count) / PANEL_GRID_COLS));
  const desired = rows * PANEL_GRID_ROW_HEIGHT;
  const clamped = Math.max(PANEL_GRID_MIN_HEIGHT, Math.min(PANEL_GRID_MAX_HEIGHT, desired));
  gridEl.style.height = `${clamped}px`;
}

function updateContextMenuTexts() {
  const menu = document.getElementById(UI.ctxMenuId);
  if (!menu) return;

  const sendDiv = menu.querySelector('[data-action="sendSameSticker"] > div:first-child');
  if (sendDiv) sendDiv.textContent = t('sendSameSticker');

  const addDiv = menu.querySelector('[data-action="addStickerId"] > div:first-child');
  if (addDiv) addDiv.textContent = t('addToQuick');

  const tagsDiv = menu.querySelector('[data-action="openTagMenu"] > div:first-child');
  if (tagsDiv) tagsDiv.textContent = t('tags');

  const zoomDiv = menu.querySelector('[data-action="zoomImage"] > div:first-child');
  if (zoomDiv) zoomDiv.textContent = t('zoomImage');

  const favDiv = menu.querySelector('[data-label="fav"]');
  if (favDiv) {
    const id = menu.getAttribute('data-id');
    if (id) {
      chrome.storage.local.get(['favoriteStickerIds'], (r) => {
        const fav = new Set(Array.isArray(r.favoriteStickerIds) ? r.favoriteStickerIds : []);
        favDiv.textContent = fav.has(id) ? t('unfav') : t('fav');
      });
    } else {
      favDiv.textContent = t('fav');
    }
  }

  const hideDiv = menu.querySelector('[data-action="toggleHidden"] > div:first-child');
  if (hideDiv) {
    const id = menu.getAttribute('data-id');
    if (id) {
      chrome.storage.local.get(['stickerIdsText'], (r) => {
        if (TAG) {
          const parsed = TAG.parseStickerIdsText(r.stickerIdsText || '');
          const row = parsed.rows.find((r) => r.id === id);
          const hiddenKey = PANEL_HIDDEN_TAG.toLowerCase();
          const isHidden = row?.tags?.some((t) => String(t).toLowerCase() === hiddenKey) || false;
          hideDiv.textContent = isHidden ? t('unhide') : t('hide');
        } else {
          hideDiv.textContent = t('hide');
        }
      });
    } else {
      hideDiv.textContent = t('hide');
    }
  }
}

function createContextMenuIfNeeded() {
  if (document.getElementById(UI.ctxMenuId)) {
    updateContextMenuTexts();
    return;
  }
  ensureStyles();
  const menu = document.createElement('div');
  menu.id = UI.ctxMenuId;

  const mkItem = (action, icon) => {
    const item = document.createElement('div');
    item.className = 'item';
    item.setAttribute('data-action', action);
    const labelDiv = document.createElement('div');
    if (action === 'toggleFavorite') labelDiv.setAttribute('data-label', 'fav');
    const iconDiv = document.createElement('div');
    iconDiv.style.opacity = '0.65';
    iconDiv.textContent = icon;
    item.appendChild(labelDiv);
    item.appendChild(iconDiv);
    return item;
  };

  menu.appendChild(mkItem('addStickerId', '＋'));
  menu.appendChild(mkItem('sendSameSticker', '↵'));
  menu.appendChild(mkItem('toggleFavorite', '★'));
  menu.appendChild(mkItem('toggleHidden', '👁️'));
  menu.appendChild(mkItem('zoomImage', '🔍'));
  menu.appendChild(mkItem('openTagMenu', '>'));

  const sub = document.createElement('div');
  sub.className = 'sub';
  sub.setAttribute('data-sub', 'id');
  menu.appendChild(sub);

  document.body.appendChild(menu);
  updateContextMenuTexts();
}

function isInsideFloatingMenu(menu, e) {
  if (!menu || !e?.target) return false;
  try {
    if (menu.contains(e.target)) return true;
    if (typeof e.composedPath === 'function') {
      const path = e.composedPath();
      for (let i = 0; i < path.length; i++) {
        if (path[i] === menu) return true;
      }
    }
  } catch (_) {
    /* ignore */
  }
  return false;
}

/** 在 document capture 處理，避免頁面（React）在選單節點上攔截不到事件 */
function dispatchContextMenuPointer(e, menu) {
  const actionEl = e.target.closest?.('[data-action]');
  const action = actionEl?.getAttribute('data-action');
  const id = menu.getAttribute('data-id');
  if (!action || !id) return;
  hideContextMenu();

  (async () => {
    try {
      if (action === 'applyTag') {
        const tag = actionEl.getAttribute('data-tag');
        if (!tag) return;
        const r = await applyTagToStickerIdInStorage(id, tag);
        setPanelStatus(
          r.removed ? t('removeTag', tag) : t('addTag', tag),
          '#28a745'
        );
      } else if (action === 'openTagMenu') {
        showPanelTagMenuAt((e.clientX || 0) + 6, (e.clientY || 0) + 6, id);
        return;
      } else if (action === 'addStickerId') {
        // 新增貼圖到 GSS
        const r = await addStickerIdToStorage(id);
        setPanelStatus(
          r.added ? t('added', r.count) : t('exists', r.count),
          r.added ? '#28a745' : '#adb5bd'
        );
      } else if (action === 'sendSameSticker') {
        // 發送相同圖片 - 使用 StickerRegistry 獲取正確的發送代碼
        const platform = getCurrentPlatform();
        const sendCode = StickerRegistry.getSendCode(id, platform);

        if (!sendCode) {
          showSendFailureToast('無法獲取發送代碼');
          return;
        }

        // 發送代碼
        sendChatMessage(sendCode).catch((e) => {
          showSendFailureToast(e?.message || e);
        });
        return;
      } else if (action === 'toggleFavorite') {
        const r = await toggleFavoriteIdInStorage(id);
        setPanelStatus(
          r.favored ? t('favMarked') : t('favUnmarked'),
          r.favored ? '#ffd43b' : '#adb5bd'
        );
      } else if (action === 'toggleHidden') {
        const r = await applyTagToStickerIdInStorage(id, PANEL_HIDDEN_TAG);
        setPanelStatus(
          r.removed ? t('unhidden') : t('hidden'),
          '#28a745'
        );
      } else if (action === 'zoomImage') {
        hideContextMenu();
        // 使用右鍵點擊時記錄的目標元素
        const targetEl = lastRightClickTarget;
        if (targetEl) {
          const isVideo = targetEl.tagName === 'VIDEO';
          showZoomOverlay({ element: targetEl, isVideo });
        }
        return;
      }
      const panel = document.getElementById(UI.panelId);
      if (panel?.classList.contains('open')) refreshPanelStickers();
    } catch (err) {
      const msg = err?.message || String(err);
      setPanelStatus(`❌ ${msg}`, '#dc3545');
      showSendFailureToast(`儲存失敗：${msg}`);
    }
  })();
}

function dispatchPanelTagMenuPointer(e, menu) {
  const target = e.target;
  const actionEl = target.closest?.('[data-action]');
  const action = actionEl?.getAttribute('data-action');
  const pid = menu.getAttribute('data-id');
  const tag = actionEl?.getAttribute('data-tag');

  if (action === 'applyTag' && pid && tag) {
    suppressTileClickFor(1200);
    suppressPanelAutoCloseFor(1200);
    hidePanelTagMenu();
    (async () => {
      try {
        const r = await applyTagToStickerIdInStorage(pid, tag);
        setPanelStatus(
          r.removed ? t('removeTag', tag) : t('addTag', tag),
          '#28a745'
        );
        const panel = document.getElementById(UI.panelId);
        if (panel?.classList.contains('open')) refreshPanelStickers();
      } catch (err) {
        const msg = err?.message || String(err);
        setPanelStatus(`❌ ${msg}`, '#dc3545');
        showSendFailureToast(msg);
      }
    })();
    return;
  }
  if (action === 'panelToggleFavorite' && pid) {
    suppressTileClickFor(300);
    suppressPanelAutoCloseFor(300);
    hidePanelTagMenu();
    (async () => {
      try {
        const r = await toggleFavoriteIdInStorage(pid);
        setPanelStatus(
          r.favored ? t('favMarked') : t('favUnmarked'),
          r.favored ? '#ffd43b' : '#adb5bd'
        );
        const panel = document.getElementById(UI.panelId);
        if (panel?.classList.contains('open')) refreshPanelStickers();
      } catch (err) {
        const msg = err?.message || String(err);
        setPanelStatus(`❌ ${msg}`, '#dc3545');
        showSendFailureToast(msg);
      }
    })();
    return;
  }
  if (action === 'panelToggleHidden' && pid) {
    suppressTileClickFor(1200);
    suppressPanelAutoCloseFor(1200);
    hidePanelTagMenu();
    (async () => {
      try {
        const r = await applyTagToStickerIdInStorage(pid, PANEL_HIDDEN_TAG);
        setPanelStatus(
          r.removed ? t('unhidden') : t('hidden'),
          '#28a745'
        );
        const panel = document.getElementById(UI.panelId);
        if (panel?.classList.contains('open')) refreshPanelStickers();
      } catch (err) {
        const msg = err?.message || String(err);
        setPanelStatus(`❌ ${msg}`, '#dc3545');
        showSendFailureToast(msg);
      }
    })();
    return;
  }
  if (action === 'panelRemoveSticker' && pid && panelFilterTag === PANEL_FILTER_HIDDEN) {
    suppressTileClickFor(300);
    suppressPanelAutoCloseFor(300);
    hidePanelTagMenu();
    (async () => {
      try {
        const r = await removeStickerIdFromStorage(pid);
        setPanelStatus(
          r.removed ? t('deleted', r.count) : t('notInList'),
          r.removed ? '#28a745' : '#adb5bd'
        );
        const panel = document.getElementById(UI.panelId);
        if (panel?.classList.contains('open')) refreshPanelStickers();
      } catch (err) {
        const msg = err?.message || String(err);
        setPanelStatus(`❌ ${msg}`, '#dc3545');
        showSendFailureToast(msg);
      }
    })();
  }
}

let floatingMenusDocumentCaptureInstalled = false;
function installFloatingMenusDocumentCapture() {
  if (floatingMenusDocumentCaptureInstalled) return;
  floatingMenusDocumentCaptureInstalled = true;

  const onDown = (e) => {
    const pmenu = document.getElementById(UI.panelTagMenuId);
    const ctx = document.getElementById(UI.ctxMenuId);

    if (pmenu?.classList.contains('open') && isInsideFloatingMenu(pmenu, e)) {
      dispatchPanelTagMenuPointer(e, pmenu);
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    if (ctx?.classList.contains('open') && isInsideFloatingMenu(ctx, e)) {
      dispatchContextMenuPointer(e, ctx);
      e.preventDefault();
      e.stopPropagation();
    }
  };

  document.addEventListener('pointerdown', onDown, true);
  document.addEventListener('mousedown', onDown, true);
}

function hideZoomOverlay() {
  const overlay = document.getElementById(UI.zoomOverlayId);
  if (!overlay) return;
  overlay.classList.remove('open');
  const img = overlay.querySelector('.zoom-img');
  if (img) img.remove();
}

function hideContextMenu() {
  const menu = document.getElementById(UI.ctxMenuId);
  if (!menu) return;
  menu.classList.remove('open');
  menu.style.display = 'none';
  menu.removeAttribute('data-id');
  const sub = menu.querySelector('[data-sub="id"]');
  if (sub) sub.textContent = '';
}

function findEmoteImageById(id) {
  // 處理 IM/ME/YT 類型：移除前綴來比對 URL
  const isIM = id && id.startsWith('IM-');
  const isME = id && id.startsWith('ME-');
  const isYT = id && id.startsWith('YT-');
  const searchId = isIM || isME ? id.slice(3) : (isYT ? id.slice(3) : id);

  // 搜尋 img 元素
  const imgs = document.querySelectorAll('img');
  for (const img of imgs) {
    const src = img.src || '';
    if (src.includes(id) || (!isIM && !isME && !isYT && src.includes(id.replace('DL-', '')))) {
      return { element: img, isVideo: false };
    }
    // 對於 IM/ME/YT 類型，比對不含前綴的 ID
    if ((isIM || isME || isYT) && src.includes(searchId)) {
      return { element: img, isVideo: false };
    }
  }

  // 對於 IM/ME mp4，搜尋 video 元素
  if (isIM || isME) {
    const videos = document.querySelectorAll('video');
    for (const video of videos) {
      const src = video.src || video.currentSrc || '';
      if (src.includes(searchId)) {
        return { element: video, isVideo: true };
      }
    }
  }

  return null;
}

function showZoomOverlay(sourceObj) {
  ensureStyles();
  let overlay = document.getElementById(UI.zoomOverlayId);
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = UI.zoomOverlayId;
    overlay.addEventListener('click', hideZoomOverlay);
    document.body.appendChild(overlay);
  }

  const sourceEl = sourceObj.element;
  const isVideo = sourceObj.isVideo;

  // 取得原始圖片位置
  const rect = sourceEl.getBoundingClientRect();
  const startX = rect.left;
  const startY = rect.top;
  const startW = rect.width;
  const startH = rect.height;

  // 建立放大元素（圖片或影片）
  let zoomEl;
  if (isVideo) {
    zoomEl = document.createElement('video');
    zoomEl.className = 'zoom-img';
    zoomEl.src = sourceEl.src || sourceEl.currentSrc;
    zoomEl.muted = true;
    zoomEl.autoplay = true;
    zoomEl.loop = true;
    zoomEl.playsInline = true;
  } else {
    zoomEl = document.createElement('img');
    zoomEl.className = 'zoom-img';
    zoomEl.src = sourceEl.src;
  }
  zoomEl.style.left = `${startX}px`;
  zoomEl.style.top = `${startY}px`;
  zoomEl.style.width = `${startW}px`;
  zoomEl.style.height = `${startH}px`;
  zoomEl.style.transform = 'scale(1)';

  overlay.innerHTML = '';
  overlay.appendChild(zoomEl);
  overlay.classList.add('open');

  // 強制 reflow 確保動畫生效
  void zoomEl.offsetWidth;

  // 計算目標位置（畫面中央）
  const targetW = Math.min(320, window.innerWidth * 0.8);
  const targetH = Math.min(320, window.innerHeight * 0.8);
  const targetX = (window.innerWidth - targetW) / 2;
  const targetY = (window.innerHeight - targetH) / 2;

  // 觸發動畫
  requestAnimationFrame(() => {
    zoomEl.style.left = `${targetX}px`;
    zoomEl.style.top = `${targetY}px`;
    zoomEl.style.width = `${targetW}px`;
    zoomEl.style.height = `${targetH}px`;
  });
}


function createPanelTagMenuIfNeeded() {
  if (document.getElementById(UI.panelTagMenuId)) return;
  ensureStyles();
  const menu = document.createElement('div');
  menu.id = UI.panelTagMenuId;

  const sub = document.createElement('div');
  sub.className = 'sub';
  sub.setAttribute('data-panel-tag-sub', '');

  const list = document.createElement('div');
  list.className = 'tag-block-list';
  list.setAttribute('data-panel-tag-list', '');

  menu.appendChild(sub);
  menu.appendChild(list);

  // Keep native context menu from appearing on top of our custom one.
  const block = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  menu.addEventListener('contextmenu', block);
  document.body.appendChild(menu);
}

function hidePanelTagMenu() {
  const menu = document.getElementById(UI.panelTagMenuId);
  if (!menu) return;
  menu.classList.remove('open');
  menu.style.display = 'none';
  menu.removeAttribute('data-id');
  const actions = menu.querySelector('[data-panel-tag-actions]');
  if (actions) actions.innerHTML = '';
  const list = menu.querySelector('[data-panel-tag-list]');
  if (list) list.innerHTML = '';
}

function ensurePanelTagMenuActionsSlot(menu) {
  let actions = menu.querySelector('[data-panel-tag-actions]');
  if (actions) return actions;
  actions = document.createElement('div');
  actions.setAttribute('data-panel-tag-actions', '');
  const list = menu.querySelector('[data-panel-tag-list]');
  if (list) menu.insertBefore(actions, list);
  else menu.appendChild(actions);
  return actions;
}

function showPanelTagMenuAt(x, y, id) {
  if (!TAG) return;
  createPanelTagMenuIfNeeded();
  const menu = document.getElementById(UI.panelTagMenuId);
  if (!menu) return;
  hideContextMenu();
  suppressPanelAutoCloseFor(1200);

  menu.setAttribute('data-id', id);
  const sub = menu.querySelector('[data-panel-tag-sub]');
  if (sub) sub.textContent = '';
  const actions = ensurePanelTagMenuActionsSlot(menu);
  actions.innerHTML = '';
  const list = menu.querySelector('[data-panel-tag-list]');
  if (list) list.innerHTML = '';

  chrome.storage.local.get(['stickerIdsText', 'stickerTagVocabularyText', 'favoriteStickerIds'], (res) => {
    const parsed = TAG.parseStickerIdsText(res.stickerIdsText || '');
    const row = parsed.rows.find((r) => r.id === id);
    const inList = !!row;
    const currentTags = new Set((row?.tags || []).map((t) => String(t).toLowerCase()));
    const favSet = new Set(Array.isArray(res.favoriteStickerIds) ? res.favoriteStickerIds : []);
    const vocab = TAG.parseTagVocabularyText(res.stickerTagVocabularyText || '');
    const hiddenKey = PANEL_HIDDEN_TAG.toLowerCase();

    if (inList) {
      const mkAction = (dataAction, label) => {
        const div = document.createElement('div');
        div.className = 'item';
        div.setAttribute('data-action', dataAction);
        div.textContent = label;
        actions.appendChild(div);
      };
      mkAction('panelToggleFavorite', favSet.has(id) ? t('unfav') : t('fav'));
      mkAction(
        'panelToggleHidden',
        currentTags.has(hiddenKey) ? t('unhide') : t('hide')
      );
      if (panelFilterTag === PANEL_FILTER_HIDDEN) {
        mkAction('panelRemoveSticker', t('permDelete'));
      }
    }

    if (!inList) {
      const item = document.createElement('div');
      item.className = 'item';
      item.style.cursor = 'default';
      item.style.opacity = '0.65';
      item.textContent = t('notInListMsg');
      list.appendChild(item);
    } else if (!vocab.length) {
      const item = document.createElement('div');
      item.className = 'item';
      item.style.cursor = 'default';
      item.style.opacity = '0.65';
      item.textContent = t('emptyVocabMsg');
      list.appendChild(item);
    } else {
      for (const t of vocab) {
        if (String(t).toLowerCase() === hiddenKey) continue;
        const div = document.createElement('div');
        div.className = 'item';
        div.setAttribute('data-action', 'applyTag');
        div.setAttribute('data-tag', t);
        if (currentTags.has(String(t).toLowerCase())) div.classList.add('on');
        div.textContent = `#${t}`;
        list.appendChild(div);
      }
    }

    menu.style.left = `${Math.max(8, x)}px`;
    menu.style.top = `${Math.max(8, y)}px`;
    menu.style.display = 'block';
    menu.classList.add('open');
    const rect = menu.getBoundingClientRect();
    const overflowX = rect.right - window.innerWidth + 8;
    const overflowY = rect.bottom - window.innerHeight + 8;
    if (overflowX > 0) menu.style.left = `${Math.max(8, x - overflowX)}px`;
    if (overflowY > 0) menu.style.top = `${Math.max(8, y - overflowY)}px`;
  });
}

let lastRightClickTarget = null;

function showContextMenuAt(x, y, id, targetElement) {
  createContextMenuIfNeeded();
  const menu = document.getElementById(UI.ctxMenuId);
  if (!menu) return;

  menu.setAttribute('data-id', id);
  // 記錄右鍵點擊的目標元素，供放大功能使用
  lastRightClickTarget = targetElement || null;

  const sub = menu.querySelector('[data-sub="id"]');
  if (sub) sub.textContent = id;

  const updateMenuTexts = (favSet, isHidden) => {
    const favLabel = menu.querySelector('[data-label="fav"]');
    if (favLabel) favLabel.textContent = favSet.has(id) ? t('unfav') : t('fav');

    const hiddenBtn = menu.querySelector('[data-action="toggleHidden"] > div:first-child');
    if (hiddenBtn) hiddenBtn.textContent = isHidden ? t('unhide') : t('hide');

    const addBtn = menu.querySelector('[data-action="addStickerId"] > div:first-child');
    if (addBtn) addBtn.textContent = t('addToQuick');

    const tagsBtn = menu.querySelector('[data-action="openTagMenu"] > div:first-child');
    if (tagsBtn) tagsBtn.textContent = t('tags');

    const zoomBtn = menu.querySelector('[data-action="zoomImage"] > div:first-child');
    if (zoomBtn) zoomBtn.textContent = t('zoomImage');
  };

  const placeMenu = () => {
    // 將選單移到正確的容器末端，確保層級在最上層
    // 在全螢幕模式下，需要附加到全螢幕元素而非 body
    const fullscreenEl = document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement;
    const targetParent = fullscreenEl || document.body;

    if (menu.parentNode !== targetParent) {
      targetParent.appendChild(menu);
    } else {
      targetParent.appendChild(menu); // 重新附加到末端
    }
    menu.style.left = `${Math.max(8, x)}px`;
    menu.style.top = `${Math.max(8, y)}px`;
    menu.style.display = 'block';
    menu.classList.add('open');
    const rect = menu.getBoundingClientRect();
    const overflowX = rect.right - window.innerWidth + 8;
    const overflowY = rect.bottom - window.innerHeight + 8;
    if (overflowX > 0) menu.style.left = `${Math.max(8, x - overflowX)}px`;
    if (overflowY > 0) menu.style.top = `${Math.max(8, y - overflowY)}px`;
  };

  if (!TAG) {
    placeMenu();
    return;
  }

  chrome.storage.local.get(['stickerIdsText', 'stickerTagVocabularyText', 'favoriteStickerIds'], (res) => {
    const parsed = TAG.parseStickerIdsText(res.stickerIdsText || '');
    const inList = parsed.rows.some((r) => r.id === id);
    const vocab = TAG.parseTagVocabularyText(res.stickerTagVocabularyText || '');
    const hiddenKey = PANEL_HIDDEN_TAG.toLowerCase();

    const row = parsed.rows.find((r) => r.id === id);
    const isHidden = row?.tags?.some((t) => String(t).toLowerCase() === hiddenKey) || false;

    const favSet = new Set(Array.isArray(res.favoriteStickerIds) ? res.favoriteStickerIds : []);
    updateMenuTexts(favSet, isHidden);

    const hiddenBtn = menu.querySelector('[data-action="toggleHidden"]');
    if (hiddenBtn) hiddenBtn.style.display = inList ? '' : 'none';

    const openTagBtn = menu.querySelector('[data-action="openTagMenu"]');
    if (openTagBtn) {
      openTagBtn.style.display = inList && vocab.length ? '' : 'none';
    }
    placeMenu();
  });
}

function extractEmoteIdFromSrc(src, imgElement = null) {
  if (!src) return null;
  const s = String(src);

  // Imgur 圖片 URL：i.imgur.com/xxx.gif → IM-xxx.gif
  const imgurMatch = s.match(/i\.imgur\.com\/([a-zA-Z0-9-]+\.(?:gif|png|jpg|jpeg|mp4))/i);
  if (imgurMatch) {
    return `IM-${imgurMatch[1]}`;
  }

  // MEEE 圖片 URL：meee.com.tw/xxx.jpg → ME-xxx.jpg
  const meeeMatch = s.match(/meee\.com\.tw\/([a-zA-Z0-9]+\.(?:gif|png|jpg|jpeg|mp4))/i);
  if (meeeMatch) {
    return `ME-${meeeMatch[1]}`;
  }

  // YouTube 縮圖 URL：img.youtube.com/vi/xxx/mqdefault.jpg → YT-xxx
  const ytMatch = s.match(/img\.youtube\.com\/vi\/([a-zA-Z0-9_-]+)\//i);
  if (ytMatch) {
    const videoId = ytMatch[1];
    return `YT-${videoId}`;
  }

  // Catbox 圖片 URL：files.catbox.moe/xxx.gif → CB-xxx.gif
  const catboxMatch = s.match(/files\.catbox\.moe\/([a-zA-Z0-9]+)(?:\.(gif|png|jpg|jpeg|mp4|webp))?/i);
  if (catboxMatch) {
    const id = catboxMatch[1];
    const ext = catboxMatch[2] || 'gif';
    return ext === 'gif' ? `CB-${id}` : `CB-${id}.${ext}`;
  }

  const patterns = [
    /\/emote\/([A-Za-z0-9_]+)(?:[/?#]|$)/i,
    /\/emotes\/([A-Za-z0-9_]+)(?:[/?#]|$)/i,
    /[?&]emote(?:id)?=([A-Za-z0-9_]+)/i
  ];
  for (const re of patterns) {
    const m = s.match(re);
    if (m?.[1]) return m[1];
  }
  return null;
}

function extractEmoteIdFromText(text) {
  const t = String(text || '').trim();
  if (!t) return null;
  // 只匹配特定格式的 emote ID
  // 移除 DLive emote 格式處理
  // 1. 其他格式：以 IM-, ME-, YT-, CB-, GSS- 開頭的貼圖 ID
  const m2 = t.match(/^(IM|ME|YT|CB|GSS)-([A-Za-z0-9_.-]+)/i);
  if (m2) return t;
  return null;
}

function getCandidateIdFromRightClick(target) {
  if (!target) return null;

  // 【統一】檢查是否點擊在 YouTube 遮罩層上（YT- 使用 data-yt-id）
  const ytOverlay = target.closest ? target.closest('[data-yt-id]') : null;
  if (ytOverlay) {
    const ytId = ytOverlay.getAttribute('data-yt-id');
    if (ytId) return ytId;
  }

  const img = target.closest ? target.closest('img') : null;
  if (img?.src) {
    // 【WTV 特殊處理】檢查是否有 data-sticker-id 屬性
    if (img.dataset.stickerId) {
      return img.dataset.stickerId;
    }

    const idFromSrc = extractEmoteIdFromSrc(img.src, img);
    if (idFromSrc) return idFromSrc;
  }

  // 檢查 video 元素（支援 GSS- 格式的影片）
  const video = target.closest ? target.closest('video') : null;
  if (video?.src) {
    // 檢查是否有 data-sticker-id 屬性
    if (video.dataset.stickerId) {
      return video.dataset.stickerId;
    }
  }

  const sel = window.getSelection ? window.getSelection() : null;
  const selText = sel && typeof sel.toString === 'function' ? sel.toString() : '';
  const idFromSel = extractEmoteIdFromText(selText);
  if (idFromSel) return idFromSel;

  const nearText = target.textContent ? String(target.textContent).slice(0, 220) : '';
  const idFromNear = extractEmoteIdFromText(nearText);
  if (idFromNear) return idFromNear;

  return null;
}

function rowsFromStorageBundle(res) {
  if (!TAG) {
    const lines = (typeof res.stickerIdsText === 'string' ? res.stickerIdsText : '')
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    const rows = [];
    for (const line of lines) {
      const parts = line.split(/\s+/).filter(Boolean);
      if (!parts.length) continue;
      const rawId = parts[0];
      // 自動轉換舊 ID 格式（加 DL- 前綴）
      const id = rawId.startsWith('DL-') ? rawId : `DL-${rawId}`;
      // 驗證 ID 格式（支援 DL- 前綴）
      if (!/^(?:DL-)?[A-Za-z0-9_]+$/.test(id)) continue;
      const tags = parts.slice(1).filter(p => p.startsWith('#')).map(p => p.slice(1));
      rows.push({ id, tags });
    }
    return rows;
  }
  const parsed = TAG.parseStickerIdsText(res.stickerIdsText || '');
  return parsed.rows;
}

async function writeStickerRows(rows, favoriteIds) {
  const fav = Array.isArray(favoriteIds) ? favoriteIds : [];
  const originalRows = Array.isArray(rows) ? rows : [];
  // 【修復】儲存時保持原始順序，不依照常用排序（避免改變實際 ID 排列）
  // 常用排序只在顯示時（refreshPanelStickers）處理
  const text = TAG ? TAG.serializeStickerRows(originalRows) : originalRows.map((r) => r.id).join('\n');
  await new Promise((resolve, reject) => {
    chrome.storage.local.set({ stickerIdsText: text, favoriteStickerIds: fav }, () => {
      const le = chrome.runtime.lastError;
      if (le) reject(new Error(le.message));
      else resolve();
    });
  });
  // 回傳排序後的結果供顯示使用，但不影響儲存
  let sortedForDisplay = [...originalRows];
  if (TAG) sortedForDisplay = TAG.sortRowsWithFavorites(sortedForDisplay, fav);
  else {
    const favSet = new Set(fav);
    sortedForDisplay.sort((a, b) => (favSet.has(b.id) ? 1 : 0) - (favSet.has(a.id) ? 1 : 0));
  }
  return { sorted: sortedForDisplay, text };
}

async function toggleFavoriteIdInStorage(id) {
  let trimmed = String(id || '').trim();

  // 先檢查 GSS- 格式，避免被後續的格式統一邏輯影響
  const isGSSFormat = /^GSS-(?:https?:\/\/)?[^\s]+\.(?:jpg|jpeg|png|gif|webp|bmp|svg|mp4)(?:\?[^\s]*)?$/i.test(trimmed);

  // GSS- 格式：保持原始格式，不做任何修改

  // IM/ME 格式：將 -gif, -png, -jpg, -jpeg, -mp4 結尾替換為 . 點格式
  if (trimmed.startsWith('IM-') || trimmed.startsWith('ME-')) {
    trimmed = trimmed.replace(/-(gif|png|jpg|jpeg|mp4)$/i, '.$1');
  }

  // 支援 IM- 前綴（Imgur 圖片）、ME- 前綴（meee.com.tw 圖片）、YT-（YouTube）、CB-（Catbox）、GSS-（圖片/影片連結）
  // 移除 DL- 前綴支援
  const isValidIM = /^IM-[a-zA-Z0-9-]+\.(?:gif|png|jpg|jpeg|mp4)$/i.test(trimmed);
  const isValidME = /^ME-[a-zA-Z0-9-]+\.(?:gif|png|jpg|jpeg|mp4)$/i.test(trimmed);
  const isValidYT = /^YT-[a-zA-Z0-9_-]+$/i.test(trimmed);
  const isValidCB = /^CB-[a-zA-Z0-9_-]+(?:\.(?:gif|png|jpg|jpeg|mp4|webp))?$/i.test(trimmed);
  const isValidGSS = /^GSS-(?:https?:\/\/)?[^\s]+\.(?:jpg|jpeg|png|gif|webp|bmp|svg|mp4)(?:\?[^\s]*)?$/i.test(trimmed);
  if (!isValidIM && !isValidME && !isValidYT && !isValidCB && !isValidGSS) {
    throw new Error(`ID 格式不正確：${trimmed}`);
  }

  const res = await chrome.storage.local.get(['favoriteStickerIds', 'stickerIdsText']);
  const currentFav = Array.isArray(res.favoriteStickerIds) ? res.favoriteStickerIds : [];
  const set = new Set(currentFav);
  const wasFav = set.has(trimmed);
  if (wasFav) set.delete(trimmed);
  else set.add(trimmed);
  const nextFav = [...set];

  const rows = rowsFromStorageBundle(res);
  const { sorted } = await writeStickerRows(rows, nextFav);

  return { favored: !wasFav, count: nextFav.length, total: sorted.length };
}

async function addStickerIdToStorage(id) {
  let trimmed = String(id || '').trim();

  // 先檢查 GSS- 格式，避免被後續的格式統一邏輯影響
  const isGSSFormat = /^GSS-(?:https?:\/\/)?[^\s]+\.(?:jpg|jpeg|png|gif|webp|bmp|svg|mp4)(?:\?[^\s]*)?$/i.test(trimmed);

  // GSS- 格式：保持原始格式，不做任何修改

  // IM/ME 格式：將 -gif, -png, -jpg, -jpeg, -mp4 結尾替換為 . 點格式
  if (trimmed.startsWith('IM-') || trimmed.startsWith('ME-')) {
    trimmed = trimmed.replace(/-(gif|png|jpg|jpeg|mp4)$/i, '.$1');
  }

  // 移除 DLive 格式統一邏輯

  // 支援 IM- 前綴（Imgur 圖片）、ME- 前綴（meee.com.tw 圖片）、YT-（YouTube）、CB-（Catbox）、GSS-（圖片/影片連結）
  // 移除 DL- 前綴支援
  const isValidIM = /^IM-[a-zA-Z0-9-]+\.(?:gif|png|jpg|jpeg|mp4)$/i.test(trimmed);
  const isValidME = /^ME-[a-zA-Z0-9-]+\.(?:gif|png|jpg|jpeg|mp4)$/i.test(trimmed);
  const isValidYT = /^YT-[a-zA-Z0-9_-]+$/i.test(trimmed);
  const isValidCB = /^CB-[a-zA-Z0-9_-]+(?:\.(?:gif|png|jpg|jpeg|mp4|webp))?$/i.test(trimmed);
  const isValidGSS = isGSSFormat;
  if (!isValidIM && !isValidME && !isValidYT && !isValidCB && !isValidGSS) {
    throw new Error(`ID 格式不正確：${trimmed}`);
  }

  const res = await chrome.storage.local.get(['stickerIdsText', 'favoriteStickerIds']);
  const rows = rowsFromStorageBundle(res);
  const beforeSize = rows.length;
  let nextRows = rows;
  if (!rows.some((r) => r.id === trimmed)) {
    nextRows = [...rows, { id: trimmed, tags: [] }];
  }
  const afterSize = nextRows.length;
  const fav = Array.isArray(res.favoriteStickerIds) ? res.favoriteStickerIds : [];
  await writeStickerRows(nextRows, fav);

  return { added: afterSize > beforeSize, count: nextRows.length };
}

async function removeStickerIdFromStorage(id) {
  let trimmed = String(id || '').trim();

  // 先檢查 GSS- 格式，避免被後續的格式統一邏輯影響
  const isGSSFormat = /^GSS-(?:https?:\/\/)?[^\s]+\.(?:jpg|jpeg|png|gif|webp|bmp|svg|mp4)(?:\?[^\s]*)?$/i.test(trimmed);

  // GSS- 格式：保持原始格式，不做任何修改

  // IM/ME 格式：將 -gif, -png, -jpg, -jpeg, -mp4 結尾替換為 . 點格式
  if (trimmed.startsWith('IM-') || trimmed.startsWith('ME-')) {
    trimmed = trimmed.replace(/-(gif|png|jpg|jpeg|mp4)$/i, '.$1');
  }

  // 支援 DL- 前綴（DLive 貼圖）、IM- 前綴（Imgur 圖片）、ME- 前綴（meee.com.tw 圖片）、YT-（YouTube）、GSS-（圖片/影片連結）
  const isValidDL = /^(?:DL-)?[A-Za-z0-9_]+$/.test(trimmed);
  const isValidIM = /^IM-[a-zA-Z0-9-]+\.(?:gif|png|jpg|jpeg|mp4)$/i.test(trimmed);
  const isValidME = /^ME-[a-zA-Z0-9-]+\.(?:gif|png|jpg|jpeg|mp4)$/i.test(trimmed);
  const isValidYT = /^YT-[a-zA-Z0-9_-]+$/i.test(trimmed);
  const isValidGSS = isGSSFormat;
  if (!isValidDL && !isValidIM && !isValidME && !isValidYT && !isValidGSS) {
    throw new Error(`ID 格式不正確：${trimmed}`);
  }

  const res = await chrome.storage.local.get(['stickerIdsText', 'favoriteStickerIds']);
  const rows = rowsFromStorageBundle(res);
  const hadId = rows.some((r) => r.id === trimmed);
  const nextRows = rows.filter((r) => r.id !== trimmed);
  const nextFav = (Array.isArray(res.favoriteStickerIds) ? res.favoriteStickerIds : []).filter((x) => x !== trimmed);
  await writeStickerRows(nextRows, nextFav);

  return { removed: hadId, count: nextRows.length };
}

async function applyTagToStickerIdInStorage(id, tagLabel) {
  if (!TAG) throw new Error('標籤模組未載入');
  let trimmed = String(id || '').trim();

  // 先檢查 GSS- 格式，避免被後續的格式統一邏輯影響
  const isGSSFormat = /^GSS-(?:https?:\/\/)?[^\s]+\.(?:jpg|jpeg|png|gif|webp|bmp|svg|mp4)(?:\?[^\s]*)?$/i.test(trimmed);

  // GSS- 格式：保持原始格式，不做任何修改

  // IM/ME 格式：將 -gif, -png, -jpg, -jpeg, -mp4 結尾替換為 . 點格式
  if (trimmed.startsWith('IM-') || trimmed.startsWith('ME-')) {
    trimmed = trimmed.replace(/-(gif|png|jpg|jpeg|mp4)$/i, '.$1');
  }

  // 支援 DL- 前綴（DLive 貼圖）、IM- 前綴（Imgur 圖片）、ME- 前綴（meee.com.tw 圖片）、YT-（YouTube）、GSS-（圖片/影片連結）
  const isValidDL = /^(?:DL-)?[A-Za-z0-9_]+$/.test(trimmed);
  const isValidIM = /^IM-[a-zA-Z0-9-]+\.(?:gif|png|jpg|jpeg|mp4)$/i.test(trimmed);
  const isValidME = /^ME-[a-zA-Z0-9-]+\.(?:gif|png|jpg|jpeg|mp4)$/i.test(trimmed);
  const isValidYT = /^YT-[a-zA-Z0-9_-]+$/i.test(trimmed);
  const isValidGSS = /^GSS-(?:https?:\/\/)?[^\s]+\.(?:jpg|jpeg|png|gif|webp|bmp|svg|mp4)(?:\?[^\s]*)?$/i.test(trimmed);
  if (!isValidDL && !isValidIM && !isValidME && !isValidYT && !isValidGSS) {
    throw new Error(`ID 格式不正確：${trimmed}`);
  }
  const label = TAG.normalizeTagToken(tagLabel);
  if (!TAG.isValidTagLabel(label)) {
    throw new Error('標籤格式不正確（最多 16 字元，不可含空白或 #）');
  }

  const res = await chrome.storage.local.get(['stickerIdsText', 'favoriteStickerIds']);
  const rows = rowsFromStorageBundle(res);
  const idx = rows.findIndex((r) => r.id === trimmed);
  if (idx < 0) throw new Error('此 ID 不在清單內（請先新增）');

  const row = rows[idx];
  const tags = Array.isArray(row.tags) ? [...row.tags] : [];
  const key = label.toLowerCase();
  const existingIdx = tags.findIndex((t) => String(t).toLowerCase() === key);
  if (existingIdx >= 0) {
    tags.splice(existingIdx, 1);
    const nextRows = rows.slice();
    nextRows[idx] = { id: trimmed, tags };
    const fav = Array.isArray(res.favoriteStickerIds) ? res.favoriteStickerIds : [];
    await writeStickerRows(nextRows, fav);
    return { removed: true, count: tags.length };
  }
  if (tags.length >= TAG.MAX_TAGS_PER_STICKER) {
    throw new Error(`每張最多 ${TAG.MAX_TAGS_PER_STICKER} 個標籤`);
  }
  tags.push(label);
  const nextRows = rows.slice();
  nextRows[idx] = { id: trimmed, tags };
  const fav = Array.isArray(res.favoriteStickerIds) ? res.favoriteStickerIds : [];
  await writeStickerRows(nextRows, fav);
  return { removed: false, count: tags.length };
}

async function refreshPanelStickers() {
  createPanelIfNeeded();
  updatePanelTypeTabs(); // 更新 DL/IM 切換按鈕樣式
  const refreshSeq = ++panelRefreshSeq;
  const panel = document.getElementById(UI.panelId);
  const tabs = panel.querySelector('.tabs');
  const grid = panel.querySelector('.grid');
  grid.innerHTML = '';
  if (tabs) tabs.innerHTML = '';
  setPanelStatus(t('loading'));

  let storage;
  try {
    storage = await chrome.storage.local.get(['favoriteStickerIds', 'stickerIdsText', 'stickerTagVocabularyText']);
  } catch (e) {
    // Extension context invalidated - 擴充重新載入後無法使用 storage
    setPanelStatus(t('extensionUpdated'), '#dc3545');
    return;
  }
  if (refreshSeq !== panelRefreshSeq) return;
  const favSet = new Set(Array.isArray(storage.favoriteStickerIds) ? storage.favoriteStickerIds : []);

  let tagMap = {};
  let tabLabels = [];
  let parsedRows = [];
  if (TAG) {
    parsedRows = TAG.parseStickerIdsText(storage.stickerIdsText || '').rows;
    tagMap = TAG.rowsToIdTagMap(parsedRows);
    // tabLabels 将在下面根据 filteredRows 重新计算
  }
  if (refreshSeq !== panelRefreshSeq) return;

  // 從 rows 創建混合 DL/IM/ME/YT 的 stickers
  let stickers = parsedRows.map((row, index) => {
    const id = row.id;
    if (id.startsWith('IM-')) {
      const idWithExt = id.slice(3);
      const isVideo = /\.mp4$/i.test(idWithExt);
      return {
        name: `LID ${index + 1}`,
        code: id,
        imageUrl: `https://i.imgur.com/${idWithExt}`,
        isVideo: isVideo,
        isIM: true
      };
    } else if (id.startsWith('ME-')) {
      const idWithExt = id.slice(3);
      const isVideo = /\.mp4$/i.test(idWithExt);
      return {
        name: `LID ${index + 1}`,
        code: id,
        imageUrl: `https://meee.com.tw/${idWithExt}`,
        isVideo: isVideo,
        isME: true
      };
    } else if (id.startsWith('CB-')) {
      // Catbox 貼圖
      const cleanId = id.slice(3);
      const isVideo = /\.mp4$/i.test(cleanId);
      const stickerData = {
        name: `LID ${index + 1}`,
        code: id,
        imageUrl: `https://files.catbox.moe/${cleanId}`,
        isVideo: isVideo,
        isCB: true
      };
      console.log('[GSS] 創建 CB 貼圖:', stickerData);
      return stickerData;
    } else if (id.startsWith('YT-')) {
      // YouTube 視頻貼圖
      const videoId = id.slice(3);
      return {
        name: `LID ${index + 1}`,
        code: id,
        imageUrl: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        isYT: true
      };
    } else if (id.startsWith('GSS-')) {
      // GSS 格式：直接使用 URL
      let imageUrl = id.slice(4); // 去掉 "GSS-" 前綴
      if (!imageUrl.match(/^https?:\/\//i)) {
        imageUrl = 'https://' + imageUrl;
      }
      return {
        name: `LID ${index + 1}`,
        code: id,
        imageUrl: imageUrl,
        isGSS: true
      };
    } else {
      // DL 類型
      const cleanId = id.startsWith('DL-') ? id.slice(3) : id;
      const normalizedId = `DL-${cleanId}`;
      return {
        name: `LID ${index + 1}`,
        code: normalizedId,
        imageUrl: `https://via.placeholder.com/100x100.png?text=Unsupported+Format`
      };
    }
  });

  // 保存全部贴图（用于创建 DOM）
  const allStickers = stickers.slice();

  // 使用總數固定面板高度（讓 IM/ME/YT/CB/GSS/全部 切換時大小一致）
  const totalStickerCount = stickers.length;
  applyStableGridHeight(grid, totalStickerCount);

  // 根據 panelFilterType 過濾類型（僅用於標籤統計，不改變 allStickers）
  let filteredForTags = allStickers;
  // 移除 DL 過濾類型
  if (panelFilterType === 'CB') {
    filteredForTags = allStickers.filter(s => s.isCB);
  } else if (panelFilterType === 'IM') {
    filteredForTags = allStickers.filter(s => s.isIM);
  } else if (panelFilterType === 'ME') {
    filteredForTags = allStickers.filter(s => s.isME);
  } else if (panelFilterType === 'GSS') {
    filteredForTags = allStickers.filter(s => s.isGSS);
  } else if (panelFilterType === 'YT') {
    filteredForTags = allStickers.filter(s => s.isYT);
  }

  if (tabs && TAG) {
    // 根據當前類型過濾 rows 統計數量
    // 【修正】使用 TAG 的驗證函數，確保各類型分開統計
    const isIMId = (id) => id && TAG.isValidIMId(id);
    const isMEId = (id) => id && TAG.isValidMEId(id);
    const isCBId = (id) => id && TAG.isValidCBId(id);
    const isGSSId = (id) => id && TAG.isValidGSSId(id);
    const isDLId = (id) => id && TAG.isValidDLId(id);
    const isYTId = (id) => id && TAG.isValidYTId(id);

    const filteredRows = parsedRows.filter((r) => {
      // 移除 DL 過濾類型
      if (panelFilterType === 'CB') return isCBId(r.id);
      if (panelFilterType === 'ME') return isMEId(r.id);
      if (panelFilterType === 'IM') return isIMId(r.id);
      if (panelFilterType === 'YT') return isYTId(r.id);
      if (panelFilterType === 'GSS') return isGSSId(r.id);
      return true; // 全部
    });

    // 為標籤統計，也過濾 sticker 對象以匹配（移除 DLive 格式支援）
    const stickerIdsInFilteredRows = new Set(filteredRows.map(r => r.id));
    const filteredStickersForTagCounts = allStickers.filter(s => {
      const code = String(s?.code || '');
      let sid = null;
      if (code.startsWith('IM-') || code.startsWith('ME-') || code.startsWith('YT-') || code.startsWith('CB-')) {
        sid = code;
      } else if (code.startsWith('DL-')) {
        sid = code;
      } else {
        const dlMatch = code.match(/^:emote\/mine\/dlive\/([A-Za-z0-9_]+):$/);
        if (dlMatch) sid = `DL-${dlMatch[1]}`;
      }
      return sid && stickerIdsInFilteredRows.has(sid);
    });

    const mkTab = (label, value) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `tab${panelFilterTag === value ? ' on' : ''}`;
      b.textContent = label;
      b.title = label;
      b.addEventListener('click', () => {
        panelFilterTag = value;
        panelCurrentPage = 1; // 重置頁碼
        // 重新整理面板以應用標籤過濾和分頁
        refreshPanelStickers();
      });
      tabs.appendChild(b);
    };
    mkTab(t('all'), '__all__');

    // 【修復】使用 filteredRows 計算標籤，確保標籤數量與當前類型匹配
    tabLabels = TAG.sortedTagLabelsForTabs(filteredRows);

    const counts = TAG.tagCountsFromRows(filteredRows);
    const hiddenKey = PANEL_HIDDEN_TAG.toLowerCase();
    const hiddenCount = (filteredRows || []).filter((r) =>
      (r?.tags || []).some((t) => String(t).toLowerCase() === hiddenKey)
    ).length;
    // Count stickers with no tags (excluding hidden ones)
    const uncategorizedCount = (filteredRows || []).filter((r) => {
      if ((r?.tags || []).some((t) => String(t).toLowerCase() === hiddenKey)) return false;
      return !r?.tags?.length || r.tags.length === 0;
    }).length;
    mkTab(t('uncategorizedTab', uncategorizedCount), PANEL_FILTER_UNCATEGORIZED);

    // 收集當前類型下存在的標籤
    const existingLabels = new Set();
    for (const lab of tabLabels) {
      if (String(lab).toLowerCase() === hiddenKey) continue;
      const c = counts[lab] || 0;
      mkTab(`${lab} (${c})`, lab);
      existingLabels.add(String(lab).toLowerCase());
    }

    // 如果當前選中的標籤不在新類型下，仍然創建一個計數為0的按鈕以保持選中狀態
    const currentTag = panelFilterTag;
    if (currentTag &&
      currentTag !== '__all__' &&
      currentTag !== PANEL_FILTER_HIDDEN &&
      currentTag !== PANEL_FILTER_UNCATEGORIZED &&
      !existingLabels.has(String(currentTag).toLowerCase())) {
      mkTab(`${currentTag} (0)`, currentTag);
    }

    mkTab(t('hiddenTab', hiddenCount), PANEL_FILTER_HIDDEN);
  }

  const active = panelFilterTag || '__all__';

  // 決定要渲染的貼圖：先用標籤過濾，再應用 IM/ME/YT/CB/GSS 過濾
  let stickersToRender = allStickers;

  if (TAG) {
    const hiddenKey = PANEL_HIDDEN_TAG.toLowerCase();
    // 取得 ID 用於常用標記和標籤存儲（移除 DLive 格式支援）
    const getId = (s) => {
      const code = String(s?.code || '');
      // 移除 DL 格式處理
      // IM 格式
      if (code.startsWith('IM-')) return code;
      // ME 格式
      if (code.startsWith('ME-')) return code;
      // CB 格式
      if (code.startsWith('CB-')) return code;
      // YT 格式
      if (code.startsWith('YT-')) return code;
      // GSS 格式
      if (code.startsWith('GSS-')) return code;
      return null;
    };
    const isHidden = (sid) => {
      if (!sid) return false;
      const ts = tagMap[sid] || [];
      return ts.some((t) => String(t).toLowerCase() === hiddenKey);
    };

    if (active === '__all__') {
      stickersToRender = stickersToRender.filter((s) => !isHidden(getId(s)));
    } else if (active === PANEL_FILTER_HIDDEN) {
      stickersToRender = stickersToRender.filter((s) => isHidden(getId(s)));
    } else if (active === PANEL_FILTER_UNCATEGORIZED) {
      stickersToRender = stickersToRender.filter((s) => {
        const sid = getId(s);
        if (!sid || isHidden(sid)) return false;
        const ts = tagMap[sid] || [];
        return ts.length === 0;
      });
    } else {
      const key = String(active).toLowerCase();
      stickersToRender = stickersToRender.filter((s) => {
        const sid = getId(s);
        if (!sid || isHidden(sid)) return false;
        const ts = tagMap[sid] || [];
        return ts.some((t) => String(t).toLowerCase() === key);
      });
    }
  }

  // 應用 CB/ME/IM/YT/GSS 類型過濾（切換時無閃爍）
  if (panelFilterType === 'CB') {
    stickersToRender = stickersToRender.filter(s => s.isCB);
  } else if (panelFilterType === 'ME') {
    stickersToRender = stickersToRender.filter(s => s.isME);
  } else if (panelFilterType === 'IM') {
    stickersToRender = stickersToRender.filter(s => s.isIM);
  } else if (panelFilterType === 'YT') {
    stickersToRender = stickersToRender.filter(s => s.isYT);
  } else if (panelFilterType === 'GSS') {
    stickersToRender = stickersToRender.filter(s => s.isGSS);
  }
  // 「全部」分類不做任何過濾，顯示所有圖片

  if (refreshSeq !== panelRefreshSeq) return;

  // 常用置頂排序（移除 DLive 格式支援）
  stickersToRender.sort((a, b) => {
    const getSortId = (s) => {
      const code = String(s?.code || '');
      if (code.startsWith('IM-') || code.startsWith('ME-') || code.startsWith('YT-') || code.startsWith('CB-') || code.startsWith('GSS-')) return code;
      // 移除 DL 格式處理
      return null;
    };
    const ida = getSortId(a);
    const idb = getSortId(b);
    const fa = ida && favSet.has(ida) ? 1 : 0;
    const fb = idb && favSet.has(idb) ? 1 : 0;
    return fb - fa;
  });

  // 【分頁】計算總頁數並儲存總項目數
  const totalItems = stickersToRender.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PANEL_PAGE_SIZE));

  // 【分頁】如果當前頁碼超過總頁數，重置為第1頁
  if (panelCurrentPage > totalPages) {
    panelCurrentPage = 1;
  }

  // 【分頁】只取當前頁的貼圖
  const startIndex = (panelCurrentPage - 1) * PANEL_PAGE_SIZE;
  const endIndex = startIndex + PANEL_PAGE_SIZE;
  stickersToRender = stickersToRender.slice(startIndex, endIndex);

  // 【分頁】更新分頁控制區域
  const pagination = document.getElementById('dlsq_pagination');
  if (pagination) {
    pagination.dataset.totalItems = totalItems;
    const prevBtn = document.getElementById('dlsq_prev_page');
    const nextBtn = document.getElementById('dlsq_next_page');
    const pageInfo = document.getElementById('dlsq_page_info');
    if (prevBtn) prevBtn.disabled = panelCurrentPage <= 1;
    if (nextBtn) nextBtn.disabled = panelCurrentPage >= totalPages;
    if (pageInfo) pageInfo.textContent = `${panelCurrentPage} / ${totalPages}`;
  }

  setPanelStatus('');

  for (const s of stickersToRender) {
    const tile = document.createElement('div');
    tile.className = 'tile';
    const isYT = s.code?.startsWith('YT-');
    tile.classList.add(s.isIM ? 'type-im' : (s.isME ? 'type-me' : (isYT ? 'type-yt' : 'type-other')));
    tile.setAttribute('data-type', s.isIM ? 'IM' : (s.isME ? 'ME' : (isYT ? 'YT' : 'OTHER')));
    tile.setAttribute('data-code', s.code);
    tile.title = s.name || '';

    // 取得 ID 用於常用標記和標籤存儲（移除 DLive 格式支援）
    const getSid = (code) => {
      if (!code) return null;
      if (code.startsWith('IM-') || code.startsWith('ME-') || code.startsWith('YT-') || code.startsWith('CB-') || code.startsWith('GSS-')) return code;
      // 移除 DL 格式處理
      return null;
    };
    const sid = getSid(s.code);
    if (sid) {
      tile.setAttribute('data-id', sid);
      // 存儲標籤信息供輕量級過濾使用
      const tags = tagMap[sid] || [];
      if (tags.length > 0) {
        tile.setAttribute('data-tags', tags.join(','));
      }
    }
    if (sid && favSet.has(sid)) tile.classList.add('favored');

    const favMark = document.createElement('div');
    favMark.className = 'fav';
    favMark.textContent = '★';
    tile.appendChild(favMark);

    // 顯示圖片或視頻
    if (isYT) {
      // YouTube 視頻貼圖：顯示縮略圖
      const img = document.createElement('img');
      img.src = s.imageUrl;
      img.style.maxWidth = '48px';
      img.style.maxHeight = '48px';
      img.style.pointerEvents = 'none';
      img.style.borderRadius = '4px';
      img.onerror = () => {
        const fallback = document.createElement('div');
        fallback.className = 'fallback';
        fallback.textContent = '🎬';
        tile.appendChild(fallback);
      };
      tile.appendChild(img);
    } else if (s.isVideo) {
      const video = document.createElement('video');
      video.src = s.imageUrl;
      video.style.maxWidth = '48px';
      video.style.maxHeight = '48px';
      video.style.pointerEvents = 'none'; // 防止視頻阻擋點擊
      video.muted = true;
      video.autoplay = true;
      video.loop = true;
      video.playsInline = true;
      video.onerror = () => {
        const fallback = document.createElement('div');
        fallback.className = 'fallback';
        fallback.textContent = s.name || 'video';
        tile.appendChild(fallback);
      };
      tile.appendChild(video);
    } else if (s.imageUrl) {
      const img = document.createElement('img');
      img.src = s.imageUrl;
      img.alt = s.name || '';
      img.style.pointerEvents = 'none'; // 防止圖片阻擋點擊（與視頻保持一致）
      img.onerror = () => {
        const fallback = document.createElement('div');
        fallback.className = 'fallback';
        fallback.textContent = s.name || 'sticker';
        tile.appendChild(fallback);
      };
      tile.appendChild(img);
    } else {
      const fallback = document.createElement('div');
      fallback.className = 'fallback';
      fallback.textContent = s.name || 'sticker';
      tile.appendChild(fallback);
    }

    // 右鍵選單（支援 DL 和 IM 類型）
    if (sid) {
      tile.addEventListener('contextmenu', (e) => {
        // 如果設置為禁用 GSS 右鍵面板，則不攔截
        if (window.gssDisableNativeContextMenu) return;

        e.preventDefault();
        e.stopPropagation();
        showPanelTagMenuAt(e.clientX, e.clientY, sid);
      });
    }

    // 點擊發送
    tile.addEventListener('click', () => {
      if (isTileClickSuppressed()) return;
      // 檢查當前是否可見（過濾後的）
      if (tile.style.display === 'none') return;
      // 防止重複發送
      if (tile._isSending) return;
      tile._isSending = true;
      const code = s.code;
      console.log('[GSS] 點擊貼圖 code:', code);
      togglePanel(false);

      // 使用 StickerRegistry 获取平台特定发送代码
      const platform = getCurrentPlatform();
      const sendCode = StickerRegistry.getSendCode(code, platform);
      console.log('[GSS] 平台:', platform, 'sendCode:', sendCode);
      if (!sendCode) {
        console.error('[GSS] 無法獲取 sendCode');
        tile._isSending = false;
        return;
      }

      // 判断是否使用零宽编码（移除 DLive 平台支援，其他平台不使用零寬編碼）
      const info = StickerRegistry.getStickerInfo(code);
      console.log('[GSS] 貼圖 info:', info);
      const useHiddenMessage = false; // 移除 DLive 後，其他平台不使用零寬編碼
      console.log('[GSS] useHiddenMessage:', useHiddenMessage);

      if (useHiddenMessage) {
        sendHiddenMessage(sendCode)
          .catch((e) => {
            showSendFailureToast(e?.message || e);
          })
          .finally(() => {
            tile._isSending = false;
          });
      } else {
        sendChatMessage(sendCode)
          .catch((e) => {
            showSendFailureToast(e?.message || e);
          })
          .finally(() => {
            tile._isSending = false;
          });
      }
    });

    grid.appendChild(tile);

    // 如果不在當前過濾結果中，立即隱藏
    const shouldShow = stickersToRender.some(sr => sr.code === s.code);
    if (!shouldShow) {
      tile.style.display = 'none';
    }
  }

  // 應用 DL/IM 類型過濾（切換時無閃爍）
  applyStickerTypeFilter();
}

function findChatContainer() {
  // DLive: .chatroom-input
  // Twitch: 需要找到包含輸入框和表情按鈕的容器
  // Vaughn: .vs_chatv9_input_box (容器), #vs_chatv9_input_box (textarea)
  // Kick: #chat-input-wrapper, [data-testid="chat-input"]
  // YouTube: yt-live-chat-renderer, yt-live-chat-app
  const selectors = [
    '.chatroom-input',                           // DLive
    '[data-a-target="chat-input-container"]',   // Twitch
    '.chat-input__container',                    // Twitch alternate
    '.chat-input-container',                     // Twitch alternate
    '.chat-input__textarea',                     // Twitch textarea container
    '.vs_chatv9_input_box',                      // Vaughn container
    '#chat-input-wrapper',                       // Kick 主容器
    '[data-testid="chat-input"]',               // Kick 輸入框
    '.chat-container',                           // Kick chatroom 容器
    '.chat-wrapper',                             // Kick chatroom 包裝
    'yt-live-chat-renderer',                     // YouTube 主容器
    'yt-live-chat-app',                          // YouTube app 容器
    'yt-live-chat-text-input-field-renderer',    // YouTube 輸入框容器
    '.q-field__native.q-placeholder',          // Beamstream 輸入框
    'input[enterkeyhint="send"]',                // Beamstream enterkey
    '[data-testid="chat-message-input"]',       // WTV 輸入框容器
    '[data-chat-scroll-container]',              // WTV 聊天容器
    '[class*="chat-input"]',                      // Generic fallback
    '.chat',                                     // 最簡單的 chat
  ];

  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el) {
      return el;
    }
  }
  return null;
}

function ensureChatButton() {
  const chat = findChatContainer();
  if (!chat) return false;

  // 檢查是否已存在 GSS 按鈕（包括傳統按鈕和 w.tv 按鈕）
  if (document.getElementById(UI.btnId)) return true;

  // w.tv 特殊檢查：檢查是否已存在按鈕並更新圖標大小
  if (isWTV()) {
    // 檢查聊天選項按鈕左邊是否已有 GSS 按鈕
    const chatOptionsButton = document.querySelector('button[data-testid="chat-options-button"]');
    if (chatOptionsButton && chatOptionsButton.parentElement) {
      const existingBtn = chatOptionsButton.parentElement.querySelector(`#${UI.btnId}`);
      if (existingBtn) {
        // 更新現有按鈕的圖標大小和來源
        const iconImg = existingBtn.querySelector('img');
        if (iconImg) {
          iconImg.src = chrome.runtime.getURL('icons/icon48.png');
          iconImg.style.setProperty('width', '20px', 'important');
          iconImg.style.setProperty('height', '20px', 'important');
          iconImg.style.setProperty('min-width', '20px', 'important');
          iconImg.style.setProperty('min-height', '20px', 'important');
          iconImg.style.setProperty('max-width', '20px', 'important');
          iconImg.style.setProperty('max-height', '20px', 'important');
        }
        return true;
      }
    }

    // 檢查發送按鈕左邊是否已有 GSS 按鈕
    const sendButton = document.querySelector('button[data-testid="send-message-button"]');
    if (sendButton && sendButton.parentElement) {
      const existingBtn = sendButton.parentElement.querySelector(`#${UI.btnId}`);
      if (existingBtn) {
        // 更新現有按鈕的圖標大小和來源
        const iconImg = existingBtn.querySelector('img');
        if (iconImg) {
          iconImg.src = chrome.runtime.getURL('icons/icon48.png');
          iconImg.style.setProperty('width', '20px', 'important');
          iconImg.style.setProperty('height', '20px', 'important');
          iconImg.style.setProperty('min-width', '20px', 'important');
          iconImg.style.setProperty('min-height', '20px', 'important');
          iconImg.style.setProperty('max-width', '20px', 'important');
          iconImg.style.setProperty('max-height', '20px', 'important');
        }
        return true;
      }
    }

    // 檢查輸入框內是否已有 GSS 按鈕
    const editableContainer = document.querySelector('div[contenteditable="true"]')?.parentElement;
    if (editableContainer) {
      const existingBtn = editableContainer.querySelector(`#${UI.btnId}`);
      if (existingBtn) {
        // 更新現有按鈕的圖標大小和來源
        const iconImg = existingBtn.querySelector('img');
        if (iconImg) {
          iconImg.src = chrome.runtime.getURL('icons/icon48.png');
          iconImg.style.setProperty('width', '20px', 'important');
          iconImg.style.setProperty('height', '20px', 'important');
          iconImg.style.setProperty('min-width', '20px', 'important');
          iconImg.style.setProperty('min-height', '20px', 'important');
          iconImg.style.setProperty('max-width', '20px', 'important');
          iconImg.style.setProperty('max-height', '20px', 'important');
        }
        return true;
      }
    }
  }

  ensureStyles();
  createPanelIfNeeded();

  // 根據平台創建不同結構
  if (isVaughn()) {
    // ===== Vaughn: 模仿官方按鈕結構（div 包裹 img）=====
    const emojiBtn = chat.querySelector('.vs_chatv9_input_emojis');
    if (emojiBtn) {
      // 創建外層 div（只用 inline style，不設 class）
      const wrapper = document.createElement('div');
      wrapper.id = UI.btnId;
      wrapper.style.cssText = 'width: 35px !important; height: 53px !important; padding: 0px 5px 7px 5px !important; margin: 0 !important; box-sizing: border-box !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; cursor: pointer;';

      // 創建內層 img（不設 class，避免影響外層尺寸）
      const iconImg = document.createElement('img');
      iconImg.src = chrome.runtime.getURL('icons/icon16.png');
      iconImg.style.width = '25px';
      iconImg.style.height = '25px';
      iconImg.style.display = 'block';
      wrapper.appendChild(iconImg);

      // 點擊事件
      wrapper.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        togglePanel();
      });

      // 插入到表情按鈕之後
      emojiBtn.after(wrapper);
      return true;
    }
    // 找不到表情按鈕，回退到 DLive 邏輯
  }

  // ===== Twitch / DLive / Vaughn 備援：使用 button 結構 =====
  const btn = document.createElement('button');
  btn.id = UI.btnId;
  btn.type = 'button';
  btn.title = 'GSS 通用貼圖系統';

  const iconImg = document.createElement('img');
  iconImg.src = chrome.runtime.getURL('icons/icon48.png');
  iconImg.style.width = '24px';
  iconImg.style.height = '24px';
  iconImg.style.display = 'block';
  iconImg.style.objectFit = 'contain';
  iconImg.style.flexShrink = '0';
  btn.appendChild(iconImg);

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    togglePanel();
  });

  if (isTwitch()) {
    // Twitch: 插入到笑臉按鈕之後
    const emojiBtn = document.querySelector('[data-a-target="emote-picker-button"]');
    if (emojiBtn) {
      btn.style.cssText = '';
      btn.style.background = 'transparent';
      btn.style.border = 'none';
      btn.style.cursor = 'pointer';
      btn.style.padding = '4px';
      btn.style.marginLeft = '4px';
      btn.style.width = '30px';
      btn.style.height = '30px';
      btn.style.display = 'inline-flex';
      btn.style.alignItems = 'center';
      btn.style.justifyContent = 'center';
      btn.style.verticalAlign = 'middle';
      emojiBtn.after(btn);
    } else {
      chat.appendChild(btn);
    }
  } else if (isYouTube()) {
    // YouTube: 插入到表情按鈕附近
    // YouTube 聊天室使用 Shadow DOM，需要仔細找
    let emojiBtn = null;
    let insertTarget = null;

    // 方法 1: 直接找表情按鈕元素
    emojiBtn = document.querySelector('yt-live-chat-emoji-button-renderer');

    // 方法 2: 找輸入框容器內的按鈕
    if (!emojiBtn) {
      const inputField = document.querySelector('yt-live-chat-text-input-field-renderer');
      if (inputField) {
        // YouTube 可能使用 Shadow DOM，嘗試深度查詢
        const allButtons = inputField.querySelectorAll('button, yt-icon-button, ytd-button-renderer');
        for (const btn of allButtons) {
          // 找包含表情圖標的按鈕或最後一個按鈕
          if (btn.querySelector('yt-icon, svg') || btn.getAttribute('aria-label')?.includes('emoji')) {
            emojiBtn = btn;
            break;
          }
        }
        // 如果還是找不到，用第一個或最後一個按鈕
        if (!emojiBtn && allButtons.length > 0) {
          emojiBtn = allButtons[allButtons.length - 1];
        }
      }
    }

    // 方法 3: 找輸入框的父容器，插入到容器內
    if (!emojiBtn) {
      const inputContainer = document.querySelector('yt-live-chat-text-input-field-renderer');
      if (inputContainer) {
        insertTarget = inputContainer;
      }
    }

    if (emojiBtn) {
      // 找到表情按鈕，在它後面插入
      btn.style.cssText = '';
      btn.style.background = 'transparent';
      btn.style.border = 'none';
      btn.style.cursor = 'pointer';
      btn.style.padding = '4px';
      btn.style.marginLeft = '4px';
      btn.style.width = '30px';
      btn.style.height = '30px';
      btn.style.display = 'inline-flex';
      btn.style.alignItems = 'center';
      btn.style.justifyContent = 'center';
      btn.style.verticalAlign = 'middle';
      emojiBtn.after(btn);
    } else if (insertTarget) {
      // 沒找到表情按鈕，直接插入到輸入框容器
      btn.style.cssText = '';
      btn.style.background = 'transparent';
      btn.style.border = 'none';
      btn.style.cursor = 'pointer';
      btn.style.padding = '4px';
      btn.style.marginLeft = '8px';
      btn.style.width = '30px';
      btn.style.height = '30px';
      btn.style.display = 'inline-flex';
      btn.style.alignItems = 'center';
      btn.style.justifyContent = 'center';
      insertTarget.appendChild(btn);
    } else {
      // 最後備援：直接加到 chat 容器
      chat.appendChild(btn);
    }
  } else if (isKick()) {
    // Kick: 插入到表情按鈕之後
    // 先嘗試找 #chat-input-wrapper（主頁面），再嘗試 .chat-wrapper（chatroom 頁面）
    let chatWrapper = document.getElementById('chat-input-wrapper');
    if (!chatWrapper) {
      // chatroom 頁面的容器
      chatWrapper = document.querySelector('.chat-wrapper, .chat-container, .chat-interface');
    }
    if (chatWrapper) {
      // 找表情按鈕（包含 SVG 的 button）
      let emojiBtn = null;
      const buttons = chatWrapper.querySelectorAll('button');
      for (const b of buttons) {
        if (b.querySelector('svg')) {
          emojiBtn = b;
          break;
        }
      }
      // 如果找不到包含 SVG 的，用最後一個 button
      if (!emojiBtn && buttons.length > 0) {
        emojiBtn = buttons[buttons.length - 1];
      }
      if (emojiBtn) {
        // 設置樣式並插入到表情按鈕後面
        btn.style.cssText = '';
        btn.style.background = 'transparent';
        btn.style.border = 'none';
        btn.style.cursor = 'pointer';
        btn.style.padding = '4px';
        btn.style.marginLeft = '4px';
        btn.style.width = '30px';
        btn.style.height = '30px';
        btn.style.display = 'inline-flex';
        btn.style.alignItems = 'center';
        btn.style.justifyContent = 'center';
        btn.style.verticalAlign = 'middle';
        emojiBtn.after(btn);
      } else {
        // 沒找到表情按鈕，直接加到容器末尾
        chatWrapper.appendChild(btn);
      }
    } else {
      // 備援：直接加到 chat 容器
      chat.appendChild(btn);
    }
  } else if (isBeamstream()) {
    // Beamstream: 插入到輸入框父容器
    // Beamstream 使用 Quasar q-input 組件
    const chatWrapper = document.querySelector('.row.items-center.relative-position');
    if (chatWrapper) {
      // 找表情按鈕（包含 SVG 的 button）
      let emojiBtn = null;
      const buttons = chatWrapper.querySelectorAll('button');
      for (const b of buttons) {
        if (b.querySelector('svg')) {
          emojiBtn = b;
          break;
        }
      }
      // 如果找不到包含 SVG 的，用最後一個 button
      if (!emojiBtn && buttons.length > 0) {
        emojiBtn = buttons[buttons.length - 1];
      }
      if (emojiBtn) {
        // 設置樣式並插入到表情按鈕後面
        btn.style.cssText = '';
        btn.style.background = 'transparent';
        btn.style.border = 'none';
        btn.style.cursor = 'pointer';
        btn.style.padding = '4px';
        btn.style.marginLeft = '4px';
        btn.style.width = '30px';
        btn.style.height = '30px';
        btn.style.display = 'inline-flex';
        btn.style.alignItems = 'center';
        btn.style.justifyContent = 'center';
        btn.style.verticalAlign = 'middle';
        emojiBtn.after(btn);
      } else {
        // 沒找到表情按鈕，直接加到容器末尾
        chatWrapper.appendChild(btn);
      }
    } else {
      // 備援：嘗試找到 q-field 的父元素
      const qField = document.querySelector('.q-field._LTHqz');
      if (qField && qField.parentElement) {
        qField.parentElement.appendChild(btn);
      }
    }
  } else if (isWTV()) {
    // WTV: 檢測輸入狀態並放置按鈕
    const chatOptionsButton = document.querySelector('button[data-testid="chat-options-button"]');
    const sendButton = document.querySelector('button[data-testid="send-message-button"]');

    if (sendButton && sendButton.parentElement) {
      // 輸入狀態：放在發送按鈕左邊
      btn.id = UI.btnId;

      // 設置按鈕樣式，與發送按鈕一致
      btn.style.cssText = '';
      btn.className = 'font-medium items-center disabled:cursor-not-allowed aria-disabled:cursor-not-allowed aria-disabled:opacity-75 transition-colors text-base gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-disabled:bg-(--color-base-brand-bg) bg-primary hover:bg-[var(--color-base-brand-bg-hover)] active:bg-[var(--color-base-brand-bg-hover)] active:opacity-86 disabled:opacity-50 disabled:bg-[var(--color-base-brand-bg)] border-t-1 border-x-0 border-transparent border-t-[var(--color-base-border-decorative)] border-solid focus-visible:shadow-focus-ring cursor-pointer rounded-[var(--rounding-control-button-l)] py-[var(--padding-button-l-vertical)] px-[var(--padding-button-l-horizontal)] h-[44px] tracking-[var(--text-cta-letter-spacing)] block !p-2.5 text-white';
      btn.type = 'button';

      // 調整圖標大小
      const iconImg = btn.querySelector('img');
      if (iconImg) {
        iconImg.style.setProperty('width', '20px', 'important');
        iconImg.style.setProperty('height', '20px', 'important');
        iconImg.style.setProperty('min-width', '20px', 'important');
        iconImg.style.setProperty('min-height', '20px', 'important');
        iconImg.style.setProperty('max-width', '20px', 'important');
        iconImg.style.setProperty('max-height', '20px', 'important');
        iconImg.className = 'iconify iconify--custom shrink-0';
      }

      // 插入到發送按鈕左邊
      sendButton.parentElement.insertBefore(btn, sendButton);

    } else if (chatOptionsButton && chatOptionsButton.parentElement) {
      // 未輸入狀態：放在聊天選項按鈕左邊
      btn.id = UI.btnId;

      // 設置按鈕樣式，與聊天選項按鈕一致
      btn.style.cssText = '';
      btn.className = 'font-medium inline-flex items-center disabled:cursor-not-allowed aria-disabled:cursor-not-allowed aria-disabled:opacity-75 transition-colors text-inverted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary border-solid disabled:bg-(--color-base-brand-bg) disabled:opacity-(--opacity-item-disabled) aria-disabled:bg-(--color-base-brand-bg) bg-transparent hover:bg-[var(--color-control-neutral-ghost-bg-hover)] active:bg-[var(--color-control-neutral-ghost-bg-hover)] active:opacity-86 border-2 border-transparent focus-visible:shadow-focus-ring cursor-pointer p-2 rounded-[var(--rounding-control-button-l)] !p-3';
      btn.type = 'button';

      // 調整圖標大小
      const iconImg = btn.querySelector('img');
      if (iconImg) {
        iconImg.style.setProperty('width', '20px', 'important');
        iconImg.style.setProperty('height', '20px', 'important');
        iconImg.style.setProperty('min-width', '20px', 'important');
        iconImg.style.setProperty('min-height', '20px', 'important');
        iconImg.style.setProperty('max-width', '20px', 'important');
        iconImg.style.setProperty('max-height', '20px', 'important');
        iconImg.className = 'iconify iconify--custom shrink-0';
      }

      // 插入到聊天選項按鈕左邊
      chatOptionsButton.parentElement.insertBefore(btn, chatOptionsButton);

    } else {
      // 備援：找不到這些按鈕時，插入到輸入框容器內
      const editableContainer = document.querySelector('div[contenteditable="true"]').parentElement;
      if (editableContainer) {
        btn.id = UI.btnId;

        btn.style.cssText = '';
        btn.style.position = 'absolute';
        btn.style.right = '8px';
        btn.style.top = '50%';
        btn.style.transform = 'translateY(-50%)';
        btn.style.background = 'transparent';
        btn.style.border = 'none';
        btn.style.cursor = 'pointer';
        btn.style.padding = '4px';
        btn.style.width = '24px';
        btn.style.height = '24px';
        btn.style.display = 'inline-flex';
        btn.style.alignItems = 'center';
        btn.style.justifyContent = 'center';
        btn.style.zIndex = '10';

        const iconImg = btn.querySelector('img');
        if (iconImg) {
          iconImg.style.width = '16px';
          iconImg.style.height = '16px';
        }

        editableContainer.appendChild(btn);
      } else {
        // 最後備援：直接加到 chat 容器
        btn.id = UI.btnId;
        chat.appendChild(btn);
      }
    }
  } else {
    // DLive / Vaughn 備援: 直接附加到聊天輸入框
    chat.appendChild(btn);
  }

  return true;
}

function setupUiAutoMount() {
  installFloatingMenusDocumentCapture();
  initLanguage();

  // 載入禁用原生右鍵面板的設置
  loadDisableNativeContextMenuSetting();

  // 【臨時修復】強制啟用 WTV 右鍵菜單
  setTimeout(() => {
    if (window.location.hostname.includes('w.tv')) {
      console.log('[GSS Debug] Force enabling context menu for WTV');
      window.gssDisableNativeContextMenu = false;
    }
  }, 1000);

  // 載入 TSC 系統設置
  loadTscSettings();

  // 初次嘗試
  ensureChatButton();

  // 用 observer 等待 SPA/動態聊天室渲染（帶節流）
  let ensureBtnTimeout = null;
  const obs = new MutationObserver(() => {
    // 節流：最多每 500ms 執行一次
    if (ensureBtnTimeout) return;
    ensureBtnTimeout = setTimeout(() => {
      ensureBtnTimeout = null;
      ensureChatButton();
    }, 500);
  });
  obs.observe(document.documentElement, { childList: true, subtree: true });

  // 右鍵：新增貼圖 ID（能解析到 emote id 才攔截，且需檢查設置）
  document.addEventListener('contextmenu', (e) => {
    console.log('[GSS Debug] Global contextmenu triggered:', e.target);
    console.log('[GSS Debug] gssDisableNativeContextMenu setting:', window.gssDisableNativeContextMenu);

    // 如果設置為禁用 GSS 右鍵面板，則不攔截
    if (window.gssDisableNativeContextMenu) {
      console.log('[GSS Debug] Native contextmenu disabled');
      return;
    }

    const id = getCandidateIdFromRightClick(e.target);
    console.log('[GSS Debug] ID from right click:', id);

    if (!id) {
      console.log('[GSS Debug] No ID found, skipping');
      return;
    }

    console.log('[GSS Debug] Preventing default and showing context menu');
    e.preventDefault();
    showContextMenuAt(e.clientX, e.clientY, id, e.target);
  });

  // 選單內點擊改由 #dlsq_ctx_menu / #dlsq_panel_tag_menu 節點的 capture mousedown 處理（避免 DLive 先攔截）
  document.addEventListener('mousedown', (e) => {
    const pmenu = document.getElementById(UI.panelTagMenuId);
    if (pmenu?.classList.contains('open') && !isInsideFloatingMenu(pmenu, e)) {
      hidePanelTagMenu();
    }
    const ctx = document.getElementById(UI.ctxMenuId);
    if (ctx?.classList.contains('open') && !isInsideFloatingMenu(ctx, e)) {
      hideContextMenu();
    }
  });

  // Some browsers still emit click after mousedown; block click-through here too.
  document.addEventListener('click', (e) => {
    const pmenu = document.getElementById(UI.panelTagMenuId);
    if (pmenu?.classList.contains('open') && pmenu.contains(e.target)) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  // 點外面關閉面板
  document.addEventListener('mousedown', (e) => {
    const panel = document.getElementById(UI.panelId);
    if (!panel || !panel.classList.contains('open')) return;
    if (isPanelAutoCloseSuppressed()) return;
    const btn = document.getElementById(UI.btnId);
    const ctxMenu = document.getElementById(UI.ctxMenuId);
    const panelTagMenu = document.getElementById(UI.panelTagMenuId);
    const t = e.target;
    if (panel.contains(t) || (btn && btn.contains(t))) return;
    // Keep panel open while operating right-click menus for continuous tagging.
    if ((ctxMenu && ctxMenu.contains(t)) || (panelTagMenu && panelTagMenu.contains(t))) return;
    hidePanelTagMenu();
    togglePanel(false);
  });

  // ESC 關閉
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      togglePanel(false);
      hideContextMenu();
      hidePanelTagMenu();
      hideSendFailureToast();
      hideZoomOverlay();
    }
  });

  // 監聽共用聊天室的 GSS 按鈕事件
  window.addEventListener('TEXO_TOGGLE_GSS_PANEL', () => {
    ensureChatButton(); // 確保聊天按鈕存在
    togglePanel(); // 切換面板
  });

  // storage 更新時即時刷新
  try {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== 'local') return;
      if (!changes.stickerIdsText && !changes.favoriteStickerIds && !changes.stickerTagVocabularyText) return;
      const panel = document.getElementById(UI.panelId);
      if (panel?.classList.contains('open')) {
        refreshPanelStickers().catch(() => {
          // Extension context invalidated, ignore
        });
      }
    });
  } catch (e) {
    // Extension context invalidated, ignore
  }
}

async function sendChatMessage(message, retries = 2) {
  // 【新架構】使用平台適配器發送訊息
  if (!isNewPlatformAvailable()) {
    throw new Error('平台適配器未載入');
  }

  const adapter = getPlatformAdapter();
  const result = await adapter.sendMessage(message);
  return result.id || true;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // 處理來自 popup 的 GSS 控制命令（禁用右鍵面板）
  if (request.type === 'GSS_CONTROL') {
    handleGssControlCommand(request.command, sendResponse);
    return true; // 讓 sendResponse 可以 async
  }

  // 處理來自 popup 的 DLive 控制命令
  if (request.type === 'DLIVE_CONTROL') {
    handleDliveControlCommand(request.command, sendResponse);
    return true; // 讓 sendResponse 可以 async
  }

  if (request.action !== 'sendSticker') return;

  (async () => {
    const id = await sendChatMessage(request.code);
    sendResponse({ ok: true, id });
  })().catch((e) => {
    showSendFailureToast(e?.message || e);
    sendResponse({ ok: false, error: String(e?.message || e), code: e?.code || null });
  });

  // 讓 sendResponse 可以 async
  return true;
});

// ==================== 平台檢測 ====================
function getCurrentPlatform() {
  const hostname = window.location.hostname;
  if (hostname.includes('twitch.tv')) return 'twitch';
  if (hostname.includes('vaughn.live')) return 'vaughn';
  if (hostname.includes('kick.com')) return 'kick';
  if (hostname.includes('youtube.com')) return 'youtube';
  if (hostname.includes('beamstream.gg')) return 'beamstream';
  if (hostname.includes('w.tv')) return 'wtv';
  return 'unknown';
}


function isTwitch() {
  return getCurrentPlatform() === 'twitch';
}

function isVaughn() {
  return getCurrentPlatform() === 'vaughn';
}

function isKick() {
  return getCurrentPlatform() === 'kick';
}

function isBeamstream() {
  return window.location.hostname.includes('beamstream.gg');
}

function isYouTube() {
  return getCurrentPlatform() === 'youtube';
}

function isWTV() {
  return getCurrentPlatform() === 'wtv';
}

// ==================== DLive 控制命令處理器 ====================
function handleDliveControlCommand(command, sendResponse) {
  // Twitch 平台不支援 UI 調整功能（Twitch 劇院模式已經做得很好）
  if (isTwitch()) {
    sendResponse({ success: false, message: 'ℹ️ Twitch 平台不支援畫面調整功能' });
    return;
  }

  try {
    switch (command) {
      case 'toggleDonation': {
        const donationArea = findDonationArea();
        if (!donationArea) {
          sendResponse({ success: false, message: '❌ 找不到課金區' });
          return;
        }
        donationArea.classList.toggle('dlsq-donation-hidden');
        const isHidden = donationArea.classList.contains('dlsq-donation-hidden');
        sendResponse({ success: true, message: isHidden ? '✅ 已隱藏課金區' : '已顯示課金區', active: isHidden });
        break;
      }

      case 'toggleTitleFix1': {
        const titleAreaFix1 = findTitleArea();
        if (!titleAreaFix1) {
          sendResponse({ success: false, message: '❌ 找不到標題區' });
          return;
        }
        titleAreaFix1.classList.toggle('dlsq-title-hidden-fix1');
        const isHiddenFix1 = titleAreaFix1.classList.contains('dlsq-title-hidden-fix1');
        sendResponse({ success: true, message: isHiddenFix1 ? '✅ 已隱藏標題區' : '已顯示標題區', active: isHiddenFix1 });
        break;
      }

      case 'toggleAboutFix1': {
        const aboutPanelsFix1 = document.querySelectorAll('.about-panel');
        if (aboutPanelsFix1.length === 0) {
          sendResponse({ success: false, message: '❌ 找不到實況主簡介面板' });
          return;
        }
        const mobilePageFix1 = document.querySelector('.mobile-page');
        const hasHiddenClassFix1 = aboutPanelsFix1[0].classList.contains('dlsq-about-hidden');

        aboutPanelsFix1.forEach(panel => {
          if (hasHiddenClassFix1) {
            panel.classList.remove('dlsq-about-hidden');
          } else {
            panel.classList.add('dlsq-about-hidden');
          }
        });

        if (mobilePageFix1) {
          if (hasHiddenClassFix1) {
            mobilePageFix1.classList.remove('dlsq-video-expanded');
          } else {
            mobilePageFix1.classList.add('dlsq-video-expanded');
          }
        }

        // 【修正】背景處理 - 帶備份和恢復
        const appElementsFix1 = document.querySelectorAll('.application, .application--wrap, #genius, .bg-grey-darken-5, .height-100.bg-grey-darken-7');
        appElementsFix1.forEach(el => {
          if (hasHiddenClassFix1) {
            // 顯示時恢復背景（使用備份的值）
            if (el.dataset.dlsqOriginalBgColor) {
              el.style.setProperty('background-color', el.dataset.dlsqOriginalBgColor, 'important');
              delete el.dataset.dlsqOriginalBgColor;
            } else {
              el.style.removeProperty('background-color');
            }
            if (el.dataset.dlsqOriginalBg) {
              el.style.setProperty('background', el.dataset.dlsqOriginalBg, 'important');
              delete el.dataset.dlsqOriginalBg;
            } else {
              el.style.removeProperty('background');
            }
          } else {
            // 隱藏時備份並設定透明背景
            if (!el.dataset.dlsqOriginalBgColor) {
              el.dataset.dlsqOriginalBgColor = el.style.getPropertyValue('background-color') || '';
            }
            if (!el.dataset.dlsqOriginalBg) {
              el.dataset.dlsqOriginalBg = el.style.getPropertyValue('background') || '';
            }
            el.style.setProperty('background-color', 'transparent', 'important');
            el.style.setProperty('background', 'transparent', 'important');
          }
        });

        sendResponse({ success: true, message: hasHiddenClassFix1 ? '已顯示簡介面板' : '✅ 已隱藏簡介面板並啟用影片擴展', active: !hasHiddenClassFix1 });
        break;
      }

      case 'toggleSidebar': {
        const sidebar = findSidebar();
        if (!sidebar) {
          sendResponse({ success: false, message: '❌ 找不到側邊欄' });
          return;
        }
        sidebar.classList.toggle('dlsq-sidebar-hidden');
        const isHidden = sidebar.classList.contains('dlsq-sidebar-hidden');
        sendResponse({ success: true, message: isHidden ? '✅ 已隱藏側邊欄' : '已顯示側邊欄', active: isHidden });
        break;
      }

      case 'toggleNavbar': {
        // 【修復版】同時執行導航欄隱藏 + flex-box 高度調整（帶備份）
        const navbar = findNavbar();
        const flexBox = document.querySelector('.flex-box.dl-flex-row');

        if (!navbar) {
          sendResponse({ success: false, message: '❌ 找不到頂部導航' });
          return;
        }

        // 檢查當前狀態：是否已經是隱藏+100vh模式
        const isNavbarHidden = navbar.classList.contains('dlsq-navbar-hidden');
        const isFullViewport = flexBox && flexBox.offsetHeight >= window.innerHeight - 10;

        if (isNavbarHidden && isFullViewport) {
          // ===== 恢復模式 =====
          // 1. 恢復導航欄
          navbar.classList.remove('dlsq-navbar-hidden');

          // 2. 恢復 flex-box 高度（使用備份）
          if (flexBox) {
            const originalHeight = flexBox.dataset.dlsqOriginalHeight;
            if (originalHeight) {
              flexBox.style.setProperty('height', originalHeight, 'important');
            } else {
              flexBox.style.setProperty('height', 'calc(100% - 60px)', 'important');
            }
            delete flexBox.dataset.dlsqOriginalHeight;
          }

          sendResponse({
            success: true,
            message: `✅ 已恢復顯示 (高度: ${flexBox?.dataset.dlsqOriginalHeight || 'calc(100% - 60px)'})`,
            active: false
          });
        } else {
          // ===== 隱藏模式 =====
          // 1. 隱藏導航欄
          navbar.classList.add('dlsq-navbar-hidden');

          // 2. 備份並設置 flex-box 高度
          if (flexBox) {
            const currentHeight = flexBox.style.getPropertyValue('height');
            if (currentHeight && currentHeight !== '100vh') {
              flexBox.dataset.dlsqOriginalHeight = currentHeight;
            }
            flexBox.style.setProperty('height', '100vh', 'important');
          }

          sendResponse({
            success: true,
            message: `✅ 已隱藏導航並設置 100vh`,
            active: true
          });
        }
        break;
      }

      case 'toggleChatNarrow': {
        const chatArea = findChatArea();
        if (!chatArea) {
          sendResponse({ success: false, message: '❌ 找不到聊天室' });
          return;
        }
        chatArea.classList.toggle('dlsq-chat-narrow');
        const isActive = chatArea.classList.contains('dlsq-chat-narrow');
        sendResponse({ success: true, message: isActive ? '✅ 聊天室已變窄 (160px)' : '已恢復聊天室寬度', active: isActive });
        break;
      }

      case 'toggleChatHidden': {
        const chatArea = findChatArea();
        if (!chatArea) {
          sendResponse({ success: false, message: '❌ 找不到聊天室' });
          return;
        }
        chatArea.classList.toggle('dlsq-chat-hidden');
        const isActive = chatArea.classList.contains('dlsq-chat-hidden');
        sendResponse({ success: true, message: isActive ? '✅ 已隱藏聊天室' : '已顯示聊天室', active: isActive });
        break;
      }

      case 'toggleChatOverlayFix1': {
        const chatAreaFix1 = findChatArea();
        if (!chatAreaFix1) {
          sendResponse({ success: false, message: '❌ 找不到聊天室' });
          return;
        }
        const topContributorsFix1 = document.querySelector('.top-contributors');
        const hasOverlayClass = chatAreaFix1.classList.contains('dlsq-chat-overlay');

        if (hasOverlayClass) {
          // 關閉浮動
          chatAreaFix1.classList.remove('dlsq-chat-overlay');
          if (topContributorsFix1) {
            topContributorsFix1.style.removeProperty('box-shadow');
          }
          sendResponse({ success: true, message: '已恢復聊天室原位置', active: false });
        } else {
          // 開啟浮動
          chatAreaFix1.classList.add('dlsq-chat-overlay');
          if (topContributorsFix1) {
            topContributorsFix1.style.setProperty('box-shadow', 'none', 'important');
          }
          sendResponse({ success: true, message: '✅ 聊天室已浮動在影片上', active: true });
        }
        break;
      }

      // 劇院模式 - 調用完整實現函數
      case 'toggleTheaterMode13': {
        // 創建虛擬按鈕對象來調用 toggleTheaterMode13（async 函數）
        const mockBtn = {
          textContent: theaterMode13Active ? '🎭 關閉劇院13' : '🎭 劇院模式13',
          style: { background: theaterMode13Active ? 'rgba(100, 200, 255, 0.6)' : '' },
          set text(val) { this.textContent = val; },
          get text() { return this.textContent; }
        };
        // 調用 async 函數並等待完成
        (async () => {
          await toggleTheaterMode13(mockBtn);
          sendResponse({
            success: true,
            message: theaterMode13Active ? '✅ 劇院模式13已啟用' : '已關閉劇院模式13',
            active: theaterMode13Active
          });
        })();
        return true; // 異步響應
      }

      // 測試按鈕
      case 'testZoomIn': {
        const video = document.querySelector('video');
        if (video) {
          const currentScale = parseFloat(video.getAttribute('data-scale') || '1');
          const newScale = currentScale + 0.1;
          video.style.setProperty('transform', `scale(${newScale})`, 'important');
          video.style.setProperty('transform-origin', 'top left', 'important');
          video.setAttribute('data-scale', newScale.toString());
          sendResponse({ success: true, message: `✅ 影片縮放: ${Math.round(newScale * 100)}%` });
        } else {
          sendResponse({ success: false, message: '❌ 找不到 video' });
        }
        break;
      }

      case 'testZoomOut': {
        const video = document.querySelector('video');
        if (video) {
          const currentScale = parseFloat(video.getAttribute('data-scale') || '1');
          const newScale = Math.max(0.1, currentScale - 0.1);
          video.style.setProperty('transform', `scale(${newScale})`, 'important');
          video.style.setProperty('transform-origin', 'top left', 'important');
          video.setAttribute('data-scale', newScale.toString());
          sendResponse({ success: true, message: `✅ 影片縮放: ${Math.round(newScale * 100)}%` });
        } else {
          sendResponse({ success: false, message: '❌ 找不到 video' });
        }
        break;
      }

      case 'testZoomReset': {
        const video = document.querySelector('video');
        if (video) {
          video.style.removeProperty('transform');
          video.style.removeProperty('transform-origin');
          video.removeAttribute('data-scale');
          sendResponse({ success: true, message: '✅ 影片縮放已重置' });
        } else {
          sendResponse({ success: false, message: '❌ 找不到 video' });
        }
        break;
      }

      case 'toggleBlackBackgroundFix1': {
        const candidatesFix1 = ['.bg-grey-darken-6', '[class*="grey-darken"]', '.flex-all-center', '.height-100.bg-grey-darken-6'];

        if (!blackBgActiveFix1) {
          // 開啟黑色背景
          let found = false;
          candidatesFix1.forEach(sel => {
            const el = document.querySelector(sel);
            if (el && !el.dataset.originalBgColor) {
              el.dataset.originalBgColor = el.style.backgroundColor || '';
              el.dataset.originalBg = el.style.background || '';
              el.style.setProperty('background-color', '#000', 'important');
              el.style.setProperty('background', '#000', 'important');
              found = true;
            }
          });
          // body 和 html
          if (!document.body.dataset.originalBgColor) {
            document.body.dataset.originalBgColor = document.body.style.backgroundColor || '';
          }
          if (!document.documentElement.dataset.originalBgColor) {
            document.documentElement.dataset.originalBgColor = document.documentElement.style.backgroundColor || '';
          }
          document.body.style.setProperty('background-color', '#000', 'important');
          document.documentElement.style.setProperty('background-color', '#000', 'important');
          sendResponse({ success: true, message: found ? '✅ 已設置黑色背景' : '⚠️ 已嘗試設置黑色背景', active: true });
          blackBgActiveFix1 = true;
        } else {
          // 關閉黑色背景 - 恢復原始樣式
          candidatesFix1.forEach(sel => {
            const el = document.querySelector(sel);
            if (el) {
              if (el.dataset.originalBgColor) {
                el.style.backgroundColor = el.dataset.originalBgColor;
                delete el.dataset.originalBgColor;
              } else {
                el.style.removeProperty('background-color');
              }
              if (el.dataset.originalBg) {
                el.style.background = el.dataset.originalBg;
                delete el.dataset.originalBg;
              } else {
                el.style.removeProperty('background');
              }
            }
          });
          // 恢復 body 和 html
          if (document.body.dataset.originalBgColor) {
            document.body.style.backgroundColor = document.body.dataset.originalBgColor;
            delete document.body.dataset.originalBgColor;
          } else {
            document.body.style.removeProperty('background-color');
          }
          if (document.documentElement.dataset.originalBgColor) {
            document.documentElement.style.backgroundColor = document.documentElement.dataset.originalBgColor;
            delete document.documentElement.dataset.originalBgColor;
          } else {
            document.documentElement.style.removeProperty('background-color');
          }
          sendResponse({ success: true, message: '已恢復背景', active: false });
          blackBgActiveFix1 = false;
        }
        break;
      }

      // ==================== 隱藏頂部欄分解測試 ====================
      case 'toggleNavbarTest1': {
        // 測試1: 僅隱藏/顯示導航欄（只操作 class）
        const navbar = findNavbar();
        if (!navbar) {
          sendResponse({ success: false, message: '❌ 找不到頂部導航' });
          return;
        }
        navbar.classList.toggle('dlsq-navbar-hidden');
        const isHidden = navbar.classList.contains('dlsq-navbar-hidden');
        sendResponse({ success: true, message: isHidden ? '✅ 僅隱藏導航欄 (class)' : '僅顯示導航欄 (class)', active: isHidden });
        break;
      }

      case 'toggleNavbarTest2': {
        // 測試2: 僅調整 flex-box 高度
        const flexBox = document.querySelector('.flex-box.dl-flex-row');
        if (!flexBox) {
          sendResponse({ success: false, message: '❌ 找不到 flex-box' });
          return;
        }
        // 使用 computedStyle 檢查實際高度是否為 100vh（通過比較 offsetHeight 和 window.innerHeight）
        const computedHeight = window.getComputedStyle(flexBox).height;
        const isFullViewport = flexBox.offsetHeight >= window.innerHeight - 10; // 允許 10px 誤差
        if (isFullViewport) {
          flexBox.style.removeProperty('height');
          sendResponse({ success: true, message: '已移除 flex-box height', active: false });
        } else {
          flexBox.style.setProperty('height', '100vh', 'important');
          sendResponse({ success: true, message: '✅ 設置 flex-box height: 100vh', active: true });
        }
        break;
      }

      case 'toggleNavbarTest3': {
        // 測試3: 僅調整聊天室高度
        const chatArea = findChatArea();
        if (!chatArea) {
          sendResponse({ success: false, message: '❌ 找不到聊天室' });
          return;
        }
        const currentHeight = chatArea.style.getPropertyValue('height');
        if (currentHeight === '100vh') {
          chatArea.style.removeProperty('height');
          chatArea.style.removeProperty('max-height');
          sendResponse({ success: true, message: '已移除聊天室 height', active: false });
        } else {
          chatArea.style.setProperty('height', '100vh', 'important');
          sendResponse({ success: true, message: '✅ 設置聊天室 height: 100vh', active: true });
        }
        break;
      }

      case 'toggleNavbarTest4': {
        // 測試4: 強制重排（reflow）
        const flexBox = document.querySelector('.flex-box.dl-flex-row');
        if (!flexBox) {
          sendResponse({ success: false, message: '❌ 找不到 flex-box' });
          return;
        }
        // 觸發重排
        flexBox.style.height = flexBox.style.height;
        void flexBox.offsetHeight;
        setTimeout(() => {
          flexBox.style.removeProperty('height');
          sendResponse({ success: true, message: '✅ 已執行強制重排', active: false });
        }, 0);
        return true; // 異步響應
      }

      case 'toggleNavbarTest5': {
        // 測試5: 完整功能（當前 toggleNavbar 的實現）
        const navbar = findNavbar();
        if (!navbar) {
          sendResponse({ success: false, message: '❌ 找不到頂部導航' });
          return;
        }
        navbar.classList.toggle('dlsq-navbar-hidden');
        const isHidden = navbar.classList.contains('dlsq-navbar-hidden');

        // 調整 flex-box 高度
        const flexBox = document.querySelector('.flex-box.dl-flex-row');
        if (flexBox) {
          if (isHidden) {
            flexBox.style.setProperty('height', '100vh', 'important');
          } else {
            flexBox.style.removeProperty('height');
            // 【修正】強制重排以恢復原始佈局
            flexBox.style.height = flexBox.style.height;
            setTimeout(() => {
              flexBox.style.removeProperty('height');
            }, 0);
          }
        }

        // 【修正】同時調整聊天室容器
        const chatArea = findChatArea();
        if (chatArea) {
          if (isHidden) {
            chatArea.style.setProperty('height', '100vh', 'important');
          } else {
            chatArea.style.removeProperty('height');
            chatArea.style.removeProperty('max-height');
          }
        }

        sendResponse({ success: true, message: isHidden ? '✅ 已隱藏頂部欄 (完整)' : '已顯示頂部欄 (完整)', active: isHidden });
        break;
      }

      // ==================== 問題診斷測試按鈮 ====================
      case 'toggleNavbarTest6': {
        // 測試6: 檢查屬性值 - 回報 getPropertyValue 的實際值
        const flexBox = document.querySelector('.flex-box.dl-flex-row');
        if (!flexBox) {
          sendResponse({ success: false, message: '❌ 找不到 flex-box' });
          return;
        }
        const propValue = flexBox.style.getPropertyValue('height');
        const hasHeightAttr = flexBox.hasAttribute('style');
        const styleCssText = flexBox.style.cssText;
        sendResponse({
          success: true,
          message: `getPropertyValue: "${propValue}" | hasAttribute: ${hasHeightAttr} | cssText: "${styleCssText}"`
        });
        break;
      }

      case 'toggleNavbarTest7': {
        // 測試7: 檢查計算樣式 - 回報 getComputedStyle 的實際值
        const flexBox = document.querySelector('.flex-box.dl-flex-row');
        if (!flexBox) {
          sendResponse({ success: false, message: '❌ 找不到 flex-box' });
          return;
        }
        const computedStyle = window.getComputedStyle(flexBox);
        const computedHeight = computedStyle.height;
        const offsetHeight = flexBox.offsetHeight;
        const windowHeight = window.innerHeight;
        sendResponse({
          success: true,
          message: `computed: ${computedHeight} | offset: ${offsetHeight}px | window: ${windowHeight}px`
        });
        break;
      }

      case 'toggleNavbarTest8': {
        // 測試8: 比較高度 - 切換並顯示高度變化
        const flexBox = document.querySelector('.flex-box.dl-flex-row');
        if (!flexBox) {
          sendResponse({ success: false, message: '❌ 找不到 flex-box' });
          return;
        }
        const before = flexBox.offsetHeight;
        // 切換
        const computedHeight = window.getComputedStyle(flexBox).height;
        const isFullViewport = flexBox.offsetHeight >= window.innerHeight - 10;
        if (isFullViewport) {
          flexBox.style.removeProperty('height');
        } else {
          flexBox.style.setProperty('height', '100vh', 'important');
        }
        const after = flexBox.offsetHeight;
        sendResponse({
          success: true,
          message: `切換前: ${before}px → 切換後: ${after}px | computed: ${computedHeight}`,
          active: !isFullViewport
        });
        break;
      }

      case 'toggleNavbarTest9': {
        // 測試9: 直接設置空值 - 測試 style.height = '' 的效果
        const flexBox = document.querySelector('.flex-box.dl-flex-row');
        if (!flexBox) {
          sendResponse({ success: false, message: '❌ 找不到 flex-box' });
          return;
        }
        const before = flexBox.offsetHeight;
        // 直接設置空字符串
        flexBox.style.height = '';
        const after = flexBox.offsetHeight;
        sendResponse({
          success: true,
          message: `height='' 前: ${before}px → 後: ${after}px`
        });
        break;
      }

      case 'toggleNavbarTest10': {
        // 測試10: 清空再恢復 - 測試清空 cssText 再恢復的效果
        const flexBox = document.querySelector('.flex-box.dl-flex-row');
        if (!flexBox) {
          sendResponse({ success: false, message: '❌ 找不到 flex-box' });
          return;
        }
        const before = flexBox.offsetHeight;
        const originalCssText = flexBox.style.cssText;
        // 清空所有 inline styles
        flexBox.style.cssText = '';
        void flexBox.offsetHeight; // 強制重排
        // 恢復（但不包括 height）
        if (originalCssText.includes('height')) {
          // 如果有 height，只恢復其他屬性
          const newCssText = originalCssText.replace(/height:\s*[^;]+;?/gi, '');
          flexBox.style.cssText = newCssText;
        }
        const after = flexBox.offsetHeight;
        sendResponse({
          success: true,
          message: `清空再恢復: ${before}px → ${after}px | 原始css: "${originalCssText.substring(0, 50)}..."`
        });
        break;
      }

      // ==================== 2號按鈮修復版 ====================
      case 'toggleNavbarTest2Fix': {
        // 修復版: 帶備份的 flex-box 高度切換
        const flexBox = document.querySelector('.flex-box.dl-flex-row');
        if (!flexBox) {
          sendResponse({ success: false, message: '❌ 找不到 flex-box' });
          return;
        }

        // 檢查是否已經是 100vh 模式（通過比較高度）
        const isFullViewport = flexBox.offsetHeight >= window.innerHeight - 10;

        if (isFullViewport) {
          // 恢復：使用備份的原始值，而不是直接 removeProperty
          const originalHeight = flexBox.dataset.dlsqOriginalHeight;
          if (originalHeight) {
            flexBox.style.setProperty('height', originalHeight, 'important');
            sendResponse({ success: true, message: `✅ 恢復原始高度: ${originalHeight}`, active: false });
          } else {
            // 沒有備份，嘗試硬編碼 DLive 的默認值
            flexBox.style.setProperty('height', 'calc(100% - 60px)', 'important');
            sendResponse({ success: true, message: '✅ 恢復默認: calc(100% - 60px)', active: false });
          }
          // 清除備份
          delete flexBox.dataset.dlsqOriginalHeight;
        } else {
          // 設置 100vh：先備份原始值
          const currentHeight = flexBox.style.getPropertyValue('height');
          if (currentHeight && currentHeight !== '100vh') {
            flexBox.dataset.dlsqOriginalHeight = currentHeight;
          }
          flexBox.style.setProperty('height', '100vh', 'important');
          sendResponse({ success: true, message: `✅ 設置 100vh (備份: ${currentHeight || 'none'})`, active: true });
        }
        break;
      }

      // ==================== 1號+2號修復組合 ====================
      case 'toggleNavbarTestCombo': {
        // 組合版: 同時執行導航欄隱藏 + flex-box 高度調整（帶備份）
        const navbar = findNavbar();
        const flexBox = document.querySelector('.flex-box.dl-flex-row');

        if (!navbar) {
          sendResponse({ success: false, message: '❌ 找不到頂部導航' });
          return;
        }
        if (!flexBox) {
          sendResponse({ success: false, message: '❌ 找不到 flex-box' });
          return;
        }

        // 檢查當前狀態：是否已經是隱藏+100vh模式
        const isNavbarHidden = navbar.classList.contains('dlsq-navbar-hidden');
        const isFullViewport = flexBox.offsetHeight >= window.innerHeight - 10;

        if (isNavbarHidden && isFullViewport) {
          // ===== 恢復模式 =====
          // 1. 恢復導航欄
          navbar.classList.remove('dlsq-navbar-hidden');

          // 2. 恢復 flex-box 高度（使用備份）
          const originalHeight = flexBox.dataset.dlsqOriginalHeight;
          if (originalHeight) {
            flexBox.style.setProperty('height', originalHeight, 'important');
          } else {
            flexBox.style.setProperty('height', 'calc(100% - 60px)', 'important');
          }
          delete flexBox.dataset.dlsqOriginalHeight;

          sendResponse({
            success: true,
            message: `✅ 已恢復顯示 (高度: ${originalHeight || 'calc(100% - 60px)'})`,
            active: false
          });
        } else {
          // ===== 隱藏模式 =====
          // 1. 隱藏導航欄
          navbar.classList.add('dlsq-navbar-hidden');

          // 2. 備份並設置 flex-box 高度
          const currentHeight = flexBox.style.getPropertyValue('height');
          if (currentHeight && currentHeight !== '100vh') {
            flexBox.dataset.dlsqOriginalHeight = currentHeight;
          }
          flexBox.style.setProperty('height', '100vh', 'important');

          sendResponse({
            success: true,
            message: `✅ 已隱藏導航並設置 100vh (備份: ${currentHeight || 'none'})`,
            active: true
          });
        }
        break;
      }

      // ==================== 劇院模式（修復版）====================
      case 'toggleTheaterCombo': {
        // 狀態變量（使用 dataset 儲存在 body 上）
        if (!document.body.dataset.theaterComboActive) {
          document.body.dataset.theaterComboActive = 'false';
        }
        const isActive = document.body.dataset.theaterComboActive === 'true';

        if (!isActive) {
          // ===== 啟用劇院模式 =====

          // 1. 隱藏課金區
          const donationArea = findDonationArea();
          if (donationArea) {
            donationArea.classList.add('dlsq-donation-hidden');
          }

          // 2. 隱藏標題
          const titleArea = findTitleArea();
          if (titleArea) {
            titleArea.classList.add('dlsq-title-hidden-fix1');
          }

          // 3. 隱藏下方區 + 【關鍵】透明背景處理
          const aboutPanels = document.querySelectorAll('.about-panel');
          aboutPanels.forEach(panel => panel.classList.add('dlsq-about-hidden'));
          const mobilePage = document.querySelector('.mobile-page');
          if (mobilePage) {
            mobilePage.classList.add('dlsq-video-expanded');
          }
          // 【修正】透明背景處理（來自 toggleAboutFix1）
          const appElements = document.querySelectorAll('.application, .application--wrap, #genius, .bg-grey-darken-5, .height-100.bg-grey-darken-7');
          appElements.forEach(el => {
            if (!el.dataset.originalAppBg) {
              el.dataset.originalAppBg = el.style.background || '';
              el.dataset.originalAppBgColor = el.style.backgroundColor || '';
            }
            el.style.setProperty('background-color', 'transparent', 'important');
            el.style.setProperty('background', 'transparent', 'important');
          });

          // 4. 隱藏側邊欄
          const sidebar = findSidebar();
          if (sidebar) {
            sidebar.classList.add('dlsq-sidebar-hidden');
          }

          // 5. 隱藏頂部欄 + 調整 flex-box（帶備份）
          const navbar = findNavbar();
          const flexBox = document.querySelector('.flex-box.dl-flex-row');
          if (navbar) {
            navbar.classList.add('dlsq-navbar-hidden');
          }
          if (flexBox) {
            const currentHeight = flexBox.style.getPropertyValue('height');
            if (currentHeight && currentHeight !== '100vh') {
              flexBox.dataset.dlsqOriginalHeight = currentHeight;
            }
            flexBox.style.setProperty('height', '100vh', 'important');
          }

          // 6. 浮動聊天室（儲存原始樣式）
          const chatArea = findChatArea();
          if (chatArea) {
            if (!chatArea.dataset.originalCssText) {
              chatArea.dataset.originalCssText = chatArea.style.cssText;
            }
            chatArea.classList.add('dlsq-chat-overlay');
            const topContributors = document.querySelector('.top-contributors');
            if (topContributors) {
              topContributors.style.setProperty('box-shadow', 'none', 'important');
            }
          }

          // 7. 黑色背景
          const bgCandidates = ['.bg-grey-darken-6', '[class*="grey-darken"]', '.flex-all-center', '.height-100.bg-grey-darken-6'];
          bgCandidates.forEach(sel => {
            const el = document.querySelector(sel);
            if (el && !el.dataset.originalBgColor) {
              el.dataset.originalBgColor = el.style.backgroundColor || '';
              el.dataset.originalBg = el.style.background || '';
              el.style.setProperty('background-color', '#000', 'important');
              el.style.setProperty('background', '#000', 'important');
            }
          });
          if (!document.body.dataset.originalBgColor) {
            document.body.dataset.originalBgColor = document.body.style.backgroundColor || '';
          }
          if (!document.documentElement.dataset.originalBgColor) {
            document.documentElement.dataset.originalBgColor = document.documentElement.style.backgroundColor || '';
          }
          document.body.style.setProperty('background-color', '#000', 'important');
          document.documentElement.style.setProperty('background-color', '#000', 'important');

          document.body.dataset.theaterComboActive = 'true';
          sendResponse({ success: true, message: '✅ 劇院模式（修復版）已啟用', active: true });
        } else {
          // ===== 關閉劇院模式 =====

          // 1. 恢復課金區
          const donationArea = findDonationArea();
          if (donationArea) {
            donationArea.classList.remove('dlsq-donation-hidden');
          }

          // 2. 恢復標題
          const titleArea = findTitleArea();
          if (titleArea) {
            titleArea.classList.remove('dlsq-title-hidden-fix1');
          }

          // 3. 恢復下方區 + 【關鍵】恢復背景
          const aboutPanels = document.querySelectorAll('.about-panel');
          aboutPanels.forEach(panel => panel.classList.remove('dlsq-about-hidden'));
          const mobilePage = document.querySelector('.mobile-page');
          if (mobilePage) {
            mobilePage.classList.remove('dlsq-video-expanded');
          }
          // 【修正】恢復透明背景
          const appElements = document.querySelectorAll('.application, .application--wrap, #genius, .bg-grey-darken-5, .height-100.bg-grey-darken-7');
          appElements.forEach(el => {
            if (el.dataset.originalAppBg) {
              el.style.background = el.dataset.originalAppBg;
              delete el.dataset.originalAppBg;
            } else {
              el.style.removeProperty('background');
            }
            if (el.dataset.originalAppBgColor) {
              el.style.backgroundColor = el.dataset.originalAppBgColor;
              delete el.dataset.originalAppBgColor;
            } else {
              el.style.removeProperty('background-color');
            }
          });

          // 4. 恢復側邊欄
          const sidebar = findSidebar();
          if (sidebar) {
            sidebar.classList.remove('dlsq-sidebar-hidden');
          }

          // 5. 恢復頂部欄 + flex-box（使用備份）
          const navbar = findNavbar();
          const flexBox = document.querySelector('.flex-box.dl-flex-row');
          if (navbar) {
            navbar.classList.remove('dlsq-navbar-hidden');
          }
          if (flexBox) {
            const originalHeight = flexBox.dataset.dlsqOriginalHeight;
            if (originalHeight) {
              flexBox.style.setProperty('height', originalHeight, 'important');
            } else {
              flexBox.style.setProperty('height', 'calc(100% - 60px)', 'important');
            }
            delete flexBox.dataset.dlsqOriginalHeight;
          }

          // 6. 恢復聊天室
          const chatArea = findChatArea();
          if (chatArea) {
            chatArea.classList.remove('dlsq-chat-overlay');
            if (chatArea.dataset.originalCssText) {
              chatArea.style.cssText = chatArea.dataset.originalCssText;
              delete chatArea.dataset.originalCssText;
            }
            const topContributors = document.querySelector('.top-contributors');
            if (topContributors) {
              topContributors.style.removeProperty('box-shadow');
            }
          }

          // 7. 恢復背景
          const bgCandidates = ['.bg-grey-darken-6', '[class*="grey-darken"]', '.flex-all-center', '.height-100.bg-grey-darken-6'];
          bgCandidates.forEach(sel => {
            const el = document.querySelector(sel);
            if (el) {
              if (el.dataset.originalBgColor) {
                el.style.backgroundColor = el.dataset.originalBgColor;
                delete el.dataset.originalBgColor;
              } else {
                el.style.removeProperty('background-color');
              }
              if (el.dataset.originalBg) {
                el.style.background = el.dataset.originalBg;
                delete el.dataset.originalBg;
              } else {
                el.style.removeProperty('background');
              }
            }
          });
          if (document.body.dataset.originalBgColor) {
            document.body.style.backgroundColor = document.body.dataset.originalBgColor;
            delete document.body.dataset.originalBgColor;
          } else {
            document.body.style.removeProperty('background-color');
          }
          if (document.documentElement.dataset.originalBgColor) {
            document.documentElement.style.backgroundColor = document.documentElement.dataset.originalBgColor;
            delete document.documentElement.dataset.originalBgColor;
          } else {
            document.documentElement.style.removeProperty('background-color');
          }

          document.body.dataset.theaterComboActive = 'false';
          sendResponse({ success: true, message: '✅ 劇院模式（修復版）已關閉', active: false });
        }
        break;
      }

      // ==================== 劇院模式（透明背景版）====================
      case 'toggleTheaterComboFix': {
        // 狀態變量（使用 dataset 儲存在 body 上）
        if (!document.body.dataset.theaterComboFixActive) {
          document.body.dataset.theaterComboFixActive = 'false';
        }
        const isActive = document.body.dataset.theaterComboFixActive === 'true';

        if (!isActive) {
          // ===== 啟用劇院模式（透明背景版）=====

          // 1. 隱藏課金區
          const donationArea = findDonationArea();
          if (donationArea) {
            donationArea.classList.add('dlsq-donation-hidden');
          }

          // 2. 隱藏標題
          const titleArea = findTitleArea();
          if (titleArea) {
            titleArea.classList.add('dlsq-title-hidden-fix1');
          }

          // 3. 隱藏下方區 + 【關鍵】透明背景處理
          const aboutPanels = document.querySelectorAll('.about-panel');
          aboutPanels.forEach(panel => panel.classList.add('dlsq-about-hidden'));
          const mobilePage = document.querySelector('.mobile-page');
          if (mobilePage) {
            mobilePage.classList.add('dlsq-video-expanded');
          }
          // 【修正】透明背景處理（來自 toggleAboutFix1）
          const appElements = document.querySelectorAll('.application, .application--wrap, #genius, .bg-grey-darken-5, .height-100.bg-grey-darken-7');
          appElements.forEach(el => {
            if (!el.dataset.originalAppBg) {
              el.dataset.originalAppBg = el.style.background || '';
              el.dataset.originalAppBgColor = el.style.backgroundColor || '';
            }
            el.style.setProperty('background-color', 'transparent', 'important');
            el.style.setProperty('background', 'transparent', 'important');
          });

          // 4. 隱藏側邊欄
          const sidebar = findSidebar();
          if (sidebar) {
            sidebar.classList.add('dlsq-sidebar-hidden');
          }

          // 5. 隱藏頂部欄 + 調整 flex-box（帶備份）
          const navbar = findNavbar();
          const flexBox = document.querySelector('.flex-box.dl-flex-row');
          if (navbar) {
            navbar.classList.add('dlsq-navbar-hidden');
          }
          if (flexBox) {
            const currentHeight = flexBox.style.getPropertyValue('height');
            if (currentHeight && currentHeight !== '100vh') {
              flexBox.dataset.dlsqOriginalHeight = currentHeight;
            }
            flexBox.style.setProperty('height', '100vh', 'important');
          }

          // 6. 浮動聊天室（儲存原始樣式）
          const chatArea = findChatArea();
          if (chatArea) {
            if (!chatArea.dataset.originalCssText) {
              chatArea.dataset.originalCssText = chatArea.style.cssText;
            }
            chatArea.classList.add('dlsq-chat-overlay');
            const topContributors = document.querySelector('.top-contributors');
            if (topContributors) {
              topContributors.style.setProperty('box-shadow', 'none', 'important');
            }
          }

          // 7. 黑色背景
          const bgCandidates = ['.bg-grey-darken-6', '[class*="grey-darken"]', '.flex-all-center', '.height-100.bg-grey-darken-6'];
          bgCandidates.forEach(sel => {
            const el = document.querySelector(sel);
            if (el && !el.dataset.originalBgColor) {
              el.dataset.originalBgColor = el.style.backgroundColor || '';
              el.dataset.originalBg = el.style.background || '';
              el.style.setProperty('background-color', '#000', 'important');
              el.style.setProperty('background', '#000', 'important');
            }
          });
          if (!document.body.dataset.originalBgColor) {
            document.body.dataset.originalBgColor = document.body.style.backgroundColor || '';
          }
          if (!document.documentElement.dataset.originalBgColor) {
            document.documentElement.dataset.originalBgColor = document.documentElement.style.backgroundColor || '';
          }
          document.body.style.setProperty('background-color', '#000', 'important');
          document.documentElement.style.setProperty('background-color', '#000', 'important');

          document.body.dataset.theaterComboFixActive = 'true';
          sendResponse({ success: true, message: '✅ 劇院模式（透明背景版）已啟用', active: true });
        } else {
          // ===== 關閉劇院模式（透明背景版）=====

          // 1. 恢復課金區
          const donationArea = findDonationArea();
          if (donationArea) {
            donationArea.classList.remove('dlsq-donation-hidden');
          }

          // 2. 恢復標題
          const titleArea = findTitleArea();
          if (titleArea) {
            titleArea.classList.remove('dlsq-title-hidden-fix1');
          }

          // 3. 恢復下方區 + 【關鍵】恢復背景
          const aboutPanels = document.querySelectorAll('.about-panel');
          aboutPanels.forEach(panel => panel.classList.remove('dlsq-about-hidden'));
          const mobilePage = document.querySelector('.mobile-page');
          if (mobilePage) {
            mobilePage.classList.remove('dlsq-video-expanded');
          }
          // 【修正】恢復透明背景
          const appElements = document.querySelectorAll('.application, .application--wrap, #genius, .bg-grey-darken-5, .height-100.bg-grey-darken-7');
          appElements.forEach(el => {
            if (el.dataset.originalAppBg) {
              el.style.background = el.dataset.originalAppBg;
              delete el.dataset.originalAppBg;
            } else {
              el.style.removeProperty('background');
            }
            if (el.dataset.originalAppBgColor) {
              el.style.backgroundColor = el.dataset.originalAppBgColor;
              delete el.dataset.originalAppBgColor;
            } else {
              el.style.removeProperty('background-color');
            }
          });

          // 4. 恢復側邊欄
          const sidebar = findSidebar();
          if (sidebar) {
            sidebar.classList.remove('dlsq-sidebar-hidden');
          }

          // 5. 恢復頂部欄 + flex-box（使用備份）
          const navbar = findNavbar();
          const flexBox = document.querySelector('.flex-box.dl-flex-row');
          if (navbar) {
            navbar.classList.remove('dlsq-navbar-hidden');
          }
          if (flexBox) {
            const originalHeight = flexBox.dataset.dlsqOriginalHeight;
            if (originalHeight) {
              flexBox.style.setProperty('height', originalHeight, 'important');
            } else {
              flexBox.style.setProperty('height', 'calc(100% - 60px)', 'important');
            }
            delete flexBox.dataset.dlsqOriginalHeight;
          }

          // 6. 恢復聊天室
          const chatArea = findChatArea();
          if (chatArea) {
            chatArea.classList.remove('dlsq-chat-overlay');
            if (chatArea.dataset.originalCssText) {
              chatArea.style.cssText = chatArea.dataset.originalCssText;
              delete chatArea.dataset.originalCssText;
            }
            const topContributors = document.querySelector('.top-contributors');
            if (topContributors) {
              topContributors.style.removeProperty('box-shadow');
            }
          }

          // 7. 恢復背景
          const bgCandidates = ['.bg-grey-darken-6', '[class*="grey-darken"]', '.flex-all-center', '.height-100.bg-grey-darken-6'];
          bgCandidates.forEach(sel => {
            const el = document.querySelector(sel);
            if (el) {
              if (el.dataset.originalBgColor) {
                el.style.backgroundColor = el.dataset.originalBgColor;
                delete el.dataset.originalBgColor;
              } else {
                el.style.removeProperty('background-color');
              }
              if (el.dataset.originalBg) {
                el.style.background = el.dataset.originalBg;
                delete el.dataset.originalBg;
              } else {
                el.style.removeProperty('background');
              }
            }
          });
          if (document.body.dataset.originalBgColor) {
            document.body.style.backgroundColor = document.body.dataset.originalBgColor;
            delete document.body.dataset.originalBgColor;
          } else {
            document.body.style.removeProperty('background-color');
          }
          if (document.documentElement.dataset.originalBgColor) {
            document.documentElement.style.backgroundColor = document.documentElement.dataset.originalBgColor;
            delete document.documentElement.dataset.originalBgColor;
          } else {
            document.documentElement.style.removeProperty('background-color');
          }

          document.body.dataset.theaterComboFixActive = 'false';
          sendResponse({ success: true, message: '✅ 劇院模式（透明背景版）已關閉', active: false });
        }
        break;
      }

      // ==================== 自動關閉 Mature 警告 ====================
      case 'enableAutoMature': {
        // 透過 platform adapter 啟用功能
        const adapter = window.GSS?.Platform?.getPlatformAdapter?.();
        if (adapter && typeof adapter.enableAutoMature === 'function') {
          adapter.enableAutoMature();
          sendResponse({ success: true, message: '✅ 自動關閉 Mature 警告已啟用', active: true });
        } else {
          // 如果 adapter 不可用，直接啟用定時器
          if (!window.dlsqMatureWarningTimer) {
            window.dlsqMatureWarningTimer = setInterval(() => {
              const agreeBtn = document.getElementsByClassName('agree')[0];
              if (!agreeBtn) return;
              const rect = agreeBtn.getBoundingClientRect();
              if (rect.width > 0 && rect.height > 0) {
                try {
                  const checkboxes = document.getElementsByClassName('v-input--selection-controls__ripple');
                  if (checkboxes.length > 0) {
                    checkboxes[0]?.click();
                    checkboxes[1]?.click();
                  }
                  agreeBtn.click();
                } catch (e) { }
              }
            }, 600);
          }
          sendResponse({ success: true, message: '✅ 自動關閉 Mature 警告已啟用', active: true });
        }
        break;
      }

      case 'disableAutoMature': {
        // 透過 platform adapter 停用功能
        const adapter = window.GSS?.Platform?.getPlatformAdapter?.();
        if (adapter && typeof adapter.disableAutoMature === 'function') {
          adapter.disableAutoMature();
          sendResponse({ success: true, message: '✅ 自動關閉 Mature 警告已停用', active: false });
        } else {
          // 如果 adapter 不可用，直接清除定時器
          if (window.dlsqMatureWarningTimer) {
            clearInterval(window.dlsqMatureWarningTimer);
            window.dlsqMatureWarningTimer = null;
          }
          sendResponse({ success: true, message: '✅ 自動關閉 Mature 警告已停用', active: false });
        }
        break;
      }

      default:
        sendResponse({ success: false, message: '❌ 未知命令' });
        break;
    }
  } catch (e) {
    sendResponse({ success: false, message: '❌ 執行錯誤: ' + e.message });
  }
}

// ==================== GSS 控制命令處理器 ====================
function handleGssControlCommand(command, sendResponse) {
  try {
    switch (command) {
      case 'disableNativeContextMenu': {
        window.gssDisableNativeContextMenu = true;
        sendResponse({ success: true, message: '✅ 原生右鍵已啟用（GSS 右鍵面板已關閉）', active: true });
        break;
      }

      case 'enableNativeContextMenu': {
        window.gssDisableNativeContextMenu = false;
        sendResponse({ success: true, message: '✅ GSS 右鍵面板已啟用', active: false });
        break;
      }

      // TSC 系統開關
      case 'enableTsc': {
        window.tscEnabled = true;
        sendResponse({ success: true, message: '✅ TSC 系統已啟用', active: true });
        break;
      }

      case 'disableTsc': {
        window.tscEnabled = false;
        sendResponse({ success: true, message: '✅ TSC 系統已禁用', active: false });
        break;
      }

      // TSC 自動抓取開關
      case 'enableTscAutoCollect': {
        window.tscAutoCollect = true;
        sendResponse({ success: true, message: '✅ TSC 自動抓取已啟用', active: true });
        break;
      }

      case 'disableTscAutoCollect': {
        window.tscAutoCollect = false;
        sendResponse({ success: true, message: '✅ TSC 自動抓取已禁用', active: false });
        break;
      }

      default:
        sendResponse({ success: false, message: '❌ 未知 GSS 命令' });
        break;
    }
  } catch (e) {
    sendResponse({ success: false, message: '❌ 執行錯誤: ' + e.message });
  }
}

/**
 * 載入禁用原生右鍵面板的設置
 */
function loadDisableNativeContextMenuSetting() {
  try {
    chrome.storage.local.get(['disableNativeContextMenu'], (result) => {
      window.gssDisableNativeContextMenu = result.disableNativeContextMenu === true;
    });
  } catch (e) {
    // 如果無法存取 storage，預設不禁用
    window.gssDisableNativeContextMenu = false;
  }
}

/**
 * 載入 TSC 系統設置
 */
function loadTscSettings() {
  try {
    chrome.storage.local.get(['tscEnabled', 'tscAutoCollect'], (result) => {
      // 預設開啟（undefined 或 true 都是開啟）
      window.tscEnabled = result.tscEnabled !== false;
      window.tscAutoCollect = result.tscAutoCollect !== false;
    });
  } catch (e) {
    // 如果無法存取 storage，預設開啟
    window.tscEnabled = true;
    window.tscAutoCollect = true;
  }
}

// ==================== 圖庫新架構兼容層 ====================
function isNewLibraryAvailable() {
  return typeof Library !== 'undefined' && Library.get;
}

/**
 * 解碼貼圖 ID 為 URL（使用新架構或舊架構）
 * @param {string} id - 貼圖 ID
 * @returns {string|null}
 */
function decodeStickerId(id) {
  // YT- 格式總是使用舊架構邏輯，確保正確處理
  if (id?.startsWith('YT-')) {
    // YouTube 视频贴纸：返回缩略图 URL
    const videoId = id.slice(3).replace(/[^a-zA-Z0-9_-]/g, '');
    if (!videoId) return null;
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  }

  if (isNewLibraryAvailable()) {
    return Library.decode(id);
  }
  // 舊架構後備
  if (id?.startsWith('IM-')) return DKIP.decode(id);
  if (id?.startsWith('ME-')) return MEKP.decode(id);
  if (id?.startsWith('CB-')) {
    // Catbox 格式：CB-xxxxxx.gif → https://files.catbox.moe/xxxxxx.gif
    const cbIdPart = id.slice(3); // 去掉 "CB-"
    if (!cbIdPart) return null;
    // 解析副檔名（支援 .ext 或 -ext 格式）
    const extMatch = cbIdPart.match(/[.-](gif|png|jpg|jpeg|mp4|webp)$/i);
    const ext = extMatch ? extMatch[1].toLowerCase() : 'gif';
    const idPart = cbIdPart.replace(/[.-](gif|png|jpg|jpeg|mp4|webp)$/i, '');
    return `https://files.catbox.moe/${idPart}.${ext}`;
  }
  if (id?.startsWith('GSS-')) {
    // GSS 格式：檢查是否有協議，如果沒有則添加 https://
    let url = id.slice(4); // 去掉 "GSS-" 前綴
    if (!url.match(/^https?:\/\//i)) {
      url = 'https://' + url;
    }
    return url;
  }
  if (id?.startsWith('DL-')) {
    const dlId = id.slice(3);
    return `https://images.prd.dlivecdn.com/emote/${dlId}`;
  }
  return null;
}

/**
 * 編碼 URL 為貼圖 ID（使用新架構或舊架構）
 * @param {string} url - 圖片 URL
 * @param {boolean} useTwitchFormat - 是否使用 Twitch 格式
 * @returns {string|null}
 */
function encodeStickerUrl(url, useTwitchFormat = false) {
  if (isNewLibraryAvailable()) {
    return Library.encode(url, useTwitchFormat);
  }
  // 舊架構後備
  if (url?.includes('imgur.com')) return 'IM-' + extractImgurId(url, useTwitchFormat);
  if (url?.includes('meee.com.tw')) return 'ME-' + extractMeeeId(url, useTwitchFormat);
  if (url?.includes('catbox.moe')) {
    const match = url.match(/files\.catbox\.moe\/([a-zA-Z0-9]+)(?:\.(gif|png|jpg|jpeg|mp4|webp))?/i);
    if (!match || match[1].length < 6) return null;
    const id = match[1];
    const ext = match[2] || 'gif';
    if (useTwitchFormat) {
      return `CB-${id}-${ext}`;
    }
    return ext === 'gif' ? `CB-${id}` : `CB-${id}.${ext}`;
  }
  return null;
}

const DKIP = {
  // 編碼：imgur URL → IM-xxx（Twitch 格式：IM-id-gif 或 IM-id-mp4，不用點號）
  encode(url, useTwitchFormat = false) {
    const match = url.match(/(?:i\.)?imgur\.com\/([a-zA-Z0-9]+)(?:\.(gif|png|jpg|jpeg|mp4))?/i);
    if (!match || match[1].length < 5) return null;
    const id = match[1];
    const ext = match[2] || 'gif'; // 默認 gif
    if (useTwitchFormat) {
      // Twitch 格式：IM-ha3eTC7-gif（用 - 代替 .）
      return `IM-${id}-${ext}`;
    }
    // 標準格式：IM-ha3eTC7.gif
    return ext === 'gif' ? `IM-${id}` : `IM-${id}.${ext}`;
  },

  // 解碼：IM-xxx → 圖片URL（支援兩種格式：IM-id.gif 和 IM-id-gif）
  decode(text) {
    if (!text || !text.startsWith('IM-')) return null;
    const idPart = text.slice(3); // 去掉 "IM-"
    if (!idPart || idPart.length < 5) return null;

    // 檢查新格式 IM-ha3eTC7-gif（用 - 分隔，支持 ID 中包含 -）
    // 從末尾找最後一個 - 後的擴展名
    const lastDashIndex = idPart.lastIndexOf('-');
    if (lastDashIndex > 0) {
      const possibleExt = idPart.slice(lastDashIndex + 1).toLowerCase();
      if (['gif', 'png', 'jpg', 'jpeg', 'mp4'].includes(possibleExt)) {
        const id = idPart.slice(0, lastDashIndex);
        return `https://i.imgur.com/${id}.${possibleExt}`;
      }
    }

    // 檢查舊格式 IM-ha3eTC7.gif（用 . 分隔）
    const lastDotIndex = idPart.lastIndexOf('.');
    if (lastDotIndex > 0) {
      const possibleExt = idPart.slice(lastDotIndex + 1).toLowerCase();
      if (['gif', 'png', 'jpg', 'jpeg', 'mp4'].includes(possibleExt)) {
        return `https://i.imgur.com/${idPart}`;
      }
    }

    // 無後綴，默認 .gif
    return `https://i.imgur.com/${idPart}.gif`;
  },

  // 判斷是否視頻（支援兩種格式）
  isVideo(text) {
    if (!text) return false;
    return /-mp4$/i.test(text) || /.mp4$/i.test(text);
  },

  isValid(text) {
    return text && text.startsWith('IM-') && text.length > 5;
  }
};

// MEEE (meee.com.tw) 編碼解碼器
const MEKP = {
  // 編碼：meee URL → ME-xxx（Twitch 格式：ME-id-jpg，用 - 代替 .）
  encode(url, useTwitchFormat = false) {
    const match = url.match(/meee\.com\.tw\/([a-zA-Z0-9]+)(?:\.(gif|png|jpg|jpeg|mp4))?/i);
    if (!match || match[1].length < 5) return null;
    const id = match[1];
    const ext = match[2] || 'jpg'; // 默認 jpg
    if (useTwitchFormat) {
      // Twitch 格式：ME-43XNR9K-jpg（用 - 代替 .）
      return `ME-${id}-${ext}`;
    }
    // 標準格式：ME-43XNR9K.jpg
    return `ME-${id}.${ext}`;
  },

  // 解碼：ME-xxx → 圖片URL（支援兩種格式：ME-id.jpg 和 ME-id-jpg）
  decode(text) {
    if (!text || !text.startsWith('ME-')) return null;
    const idPart = text.slice(3); // 去掉 "ME-"
    if (!idPart || idPart.length < 5) return null;

    // 檢查新格式 ME-43XNR9K-jpg（用 - 分隔）
    const lastDashIndex = idPart.lastIndexOf('-');
    if (lastDashIndex > 0) {
      const possibleExt = idPart.slice(lastDashIndex + 1).toLowerCase();
      if (['gif', 'png', 'jpg', 'jpeg', 'mp4'].includes(possibleExt)) {
        const id = idPart.slice(0, lastDashIndex);
        return `https://meee.com.tw/${id}.${possibleExt}`;
      }
    }

    // 檢查舊格式 ME-43XNR9K.jpg（用 . 分隔）
    const lastDotIndex = idPart.lastIndexOf('.');
    if (lastDotIndex > 0) {
      const possibleExt = idPart.slice(lastDotIndex + 1).toLowerCase();
      if (['gif', 'png', 'jpg', 'jpeg', 'mp4'].includes(possibleExt)) {
        return `https://meee.com.tw/${idPart}`;
      }
    }

    // 無後綴，默認 .jpg
    return `https://meee.com.tw/${idPart}.jpg`;
  },

  // 判斷是否視頻
  isVideo(text) {
    if (!text) return false;
    return /-mp4$/i.test(text) || /.mp4$/i.test(text);
  },

  isValid(text) {
    return text && text.startsWith('ME-') && text.length > 5;
  }
};

// 掃描並替換聊天室中的 IM- 文字為圖片（同時檢測零寬字符編碼的隱藏訊息）
function scanAndReplaceIMImages() {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  const textNodes = [];
  let node;
  let checkedCount = 0;
  while (node = walker.nextNode()) {
    checkedCount++;
    // 跳過已處理過的節點 和 聊天輸入框
    // 【標記】檢查消息容器級標記和圖片標記，防止 React/KICK 重置 DOM 後重複處理
    // 【修復】YouTube 翻譯重置檢測：如果 .dlsq-im-replaced 內有 ID 但沒有圖片，需要重新處理
    const inReplacedWrapper = node.parentElement?.closest('.dlsq-im-replaced');
    if (inReplacedWrapper) {
      const text = node.textContent || '';
      const hasID = /\b(IM|ME|DL|CB)-[a-zA-Z0-9_-]{3,}/i.test(text);
      const hasImage = inReplacedWrapper.querySelector('img.dlsq-chat-img, video.dlsq-chat-video');
      if (hasID && !hasImage) {
        // 有 ID 但沒有圖片，說明被翻譯重置了，清除標記重新處理
        inReplacedWrapper.classList.remove('dlsq-im-replaced');
        console.log('[GSS] 【翻譯重置檢測】wrapper 內有 ID 但無圖片，清除標記:', text.substring(0, 30));
      } else {
        continue; // 正常情況，跳過已處理的
      }
    }
    if (node.parentElement?.closest('.dlsq-message-processed, .dlsq-converted-image, img, video, script, style, textarea')) continue;
    // 跳過 Twitch/DLive 聊天輸入框（避免在輸入框中轉換圖片）
    // 【加強】添加更多 Twitch 輸入框相關選擇器
    if (node.parentElement?.closest('[data-a-target="chat-input"], [data-a-target="chat-input-container"], .chat-wysiwyg-input__editor, [contenteditable="true"], .chatroom-input, .chat-input, [class*="chat-input"]')) continue;
    const text = node.textContent;
    // 檢查常規 IM-/ME-/YT-/CB- 或零寬字符或 DL- 或 Twitch emote 格式或 YouTube URL 或 GSS- 圖片連結
    const hasIM = text.includes('IM-');
    const hasME = text.includes('ME-');
    const hasDL = text.includes('DL-');
    const hasYT = text.includes('YT-');
    const hasCB = text.includes('CB-');
    const hasGSS = text.includes('GSS-');
    if (hasIM || hasME || hasYT || hasDL || hasCB || hasGSS ||
      text.includes(':emote/mine/dlive/') ||
      text.includes('youtube.com/watch') || text.includes('youtube.com/shorts') || text.includes('youtu.be/') ||
      /[\u200B\u200C\u200D\uFEFF]/.test(text)) {
      textNodes.push(node);
    }
  }
  // Kick 掃描完成日誌（已關閉）
  // if (isKick()) {
  //   console.log('[GSS] Kick scan complete, checked', checkedCount, 'nodes, found', textNodes.length, 'sticker texts');
  // }

  // 處理每個文本節點（日誌已關閉以避免刷屏）
  // console.log('[GSS] Processing', textNodes.length, 'text nodes');
  textNodes.forEach((textNode, index) => {
    const text = textNode.textContent;
    // console.log('[GSS] Processing text node', index, ':', text.substring(0, 30));

    // 先嘗試解碼零寬字符
    let hiddenStickerId = null;
    let isDLSticker = false;
    let isIMSticker = false;
    let isMESticker = false;
    let isCBSticker = false;
    let isGSSSticker = false;
    const zwChars = text.match(/[\u200B\u200C\u200D\uFEFF]/g);
    if (zwChars && zwChars.length >= 8) {
      try {
        const decoded = decodeFromZeroWidth(zwChars.join(''));
        if (decoded && decoded.startsWith('IM-')) {
          hiddenStickerId = decoded;
          isIMSticker = true;
        } else if (decoded && decoded.startsWith('ME-')) {
          hiddenStickerId = decoded;
          isMESticker = true;
        } else if (decoded && decoded.startsWith('CB-')) {
          hiddenStickerId = decoded;
          isCBSticker = true;
        } else if (decoded && decoded.startsWith('GSS-')) {
          hiddenStickerId = decoded;
          isGSSSticker = true;
        } else if (decoded && decoded.startsWith('DL-')) {
          hiddenStickerId = decoded;
          isDLSticker = true;
        }
      } catch (e) {
        // 解碼失敗，繼續正常處理
      }
    }

    // 【修復】如果沒有零寬字元編碼的貼圖ID，檢查是否是直接的 IM-/ME-/CB-/GSS- 貼圖文本（Kick發送的格式）
    if (!hiddenStickerId) {
      const directMatch = text.match(/(IM|ME|CB|GSS)-[a-zA-Z0-9-]+\.(?:gif|png|jpg|jpeg|mp4)/i);
      if (directMatch) {
        hiddenStickerId = directMatch[0];
        if (hiddenStickerId.startsWith('IM-')) isIMSticker = true;
        else if (hiddenStickerId.startsWith('ME-')) isMESticker = true;
        else if (hiddenStickerId.startsWith('CB-')) isCBSticker = true;
        else if (hiddenStickerId.startsWith('GSS-')) isGSSSticker = true;
      }
    }

    // 【新功能】檢查 GSS- 圖片/影片連結格式
    if (!hiddenStickerId) {
      const gssMatch = text.match(/\bGSS-(?:https?:\/\/)?[^\s]+\.(?:jpg|jpeg|png|gif|webp|bmp|svg|mp4)(?:\?[^\s]*)?\b/gi);
      if (gssMatch) {
        hiddenStickerId = gssMatch[0]; // 使用第一個匹配的 GSS- 連結
      }
    }

    // 如果找到隱藏的貼圖ID，直接替換整個文本節點
    if (hiddenStickerId && !textNode.parentElement?.closest('.dlsq-hidden-decoded')) {
      const parentEl = textNode.parentElement;

      // 【防重複處理 1】檢查父元素是否已經標記處理過此ID
      // 【修復】同時檢查是否真的存在對應的圖片，防止 YouTube 翻譯重置後無法重新處理
      if (parentEl) {
        const processedIds = parentEl.getAttribute('data-dlsq-processed') || '';
        if (processedIds.includes(hiddenStickerId)) {
          // 檢查是否真的有對應的圖片存在
          const existingImg = parentEl.querySelector(`img[alt="${hiddenStickerId}"], img.dlsq-chat-img`);
          if (existingImg) {
            console.log('[GSS] 父元素已標記且圖片存在，跳過:', hiddenStickerId);
            return;
          } else {
            // 標記存在但圖片不存在（被翻譯重置），清除標記重新處理
            console.log('[GSS] 【翻譯重置】標記存在但圖片不存在，清除標記重新處理:', hiddenStickerId);
            const newProcessedIds = processedIds.split(',').filter(id => id !== hiddenStickerId).join(',');
            parentEl.setAttribute('data-dlsq-processed', newProcessedIds);
          }
        }
      }

      // 【防重複處理 2】檢查父元素是否已經有相同ID的貼圖圖片
      if (parentEl) {
        const existingImgs = parentEl.querySelectorAll('img.dlsq-chat-img');
        for (const img of existingImgs) {
          // 檢查是否已經有相同ID的圖片
          const imgSrc = img.src || '';
          const imgAlt = img.alt || '';
          if (imgAlt === hiddenStickerId ||
            (isDLSticker && imgSrc.includes(hiddenStickerId.slice(3))) ||
            (!isDLSticker && imgSrc.includes(hiddenStickerId.replace(/IM-|ME-|CB-/, '').split('.')[0]))) {
            console.log('[GSS] 已存在相同ID的貼圖圖片，跳過重複處理:', hiddenStickerId);
            return;
          }
        }
      }

      const wrapper = document.createElement('span');
      wrapper.className = 'dlsq-im-replaced dlsq-hidden-decoded';

      if (isDLSticker) {
        // DL 貼圖：顯示實際圖片
        const dlId = hiddenStickerId.slice(3); // 去掉 "DL-" 前綴
        const img = document.createElement('img');
        img.src = `https://images.prd.dlivecdn.com/emote/${dlId}`;
        img.alt = hiddenStickerId;
        img.className = 'dlsq-im-replaced dlsq-converted-image dlsq-chat-img'; // 【標記】標記為已轉換圖片
        wrapper.appendChild(img);
      } else if (hiddenStickerId.startsWith('GSS-')) {
        // 【新功能】GSS- 圖片/影片連結處理
        let imageUrl = hiddenStickerId.replace(/^GSS-/i, '');

        // 【關鍵】自動補完 HTTP 協議（如果沒有的話）
        if (!imageUrl.match(/^https?:\/\//i)) {
          imageUrl = 'https://' + imageUrl;
        }

        // 安全檢查：只允許特定圖片/影片格式和受信任的域名
        if (isSafeImageUrl(imageUrl)) {
          const isVideo = /\.mp4$/i.test(imageUrl);
          let mediaElement;

          if (isVideo) {
            // 創建 video 元素
            mediaElement = document.createElement('video');
            mediaElement.src = imageUrl;
            mediaElement.alt = hiddenStickerId;
            mediaElement.dataset.gssUrl = imageUrl;
            mediaElement.className = 'dlsq-im-replaced dlsq-converted-video dlsq-chat-video dlsq-gss-video';
            mediaElement.style.cssText = 'max-width: 100px; max-height: 100px; border-radius: 4px;  border: 2px solid #FF9800;'; // 橙色邊框區分影片
            mediaElement.muted = true;
            mediaElement.autoplay = true;
            mediaElement.loop = true;
            mediaElement.playsInline = true;
          } else {
            // 創建 img 元素
            mediaElement = document.createElement('img');
            mediaElement.src = imageUrl;
            mediaElement.alt = hiddenStickerId;
            mediaElement.dataset.gssUrl = imageUrl;
            mediaElement.className = 'dlsq-im-replaced dlsq-converted-image dlsq-chat-img dlsq-gss-image';
            mediaElement.style.cssText = 'max-width: 100px; max-height: 100px; border-radius: 4px;  border: 2px solid #4CAF50;'; // 綠色邊框區分圖片
          }

          // 添加錯誤處理
          mediaElement.onerror = () => {
            console.warn('[GSS] 無法載入媒體:', imageUrl);
            mediaElement.style.border = '2px solid #f44336'; // 紅色邊框表示失敗
            // 顯示錯誤文字
            const errorText = document.createElement('span');
            errorText.textContent = '❌ 載入失敗';
            errorText.style.cssText = 'font-size: 10px; color: #f44336; display: block; text-align: center;';
            wrapper.appendChild(errorText);
          };

          // 添加點擊事件：點擊放大媒體
          mediaElement.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            // 創建放大圖片覆蓋層
            const overlay = document.createElement('div');
            overlay.style.cssText = `
              position: fixed;
              top: 0;
              left: 0;
              width: 100vw;
              height: 100vh;
              background: rgba(0,0,0,0.9);
              z-index: 999999;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
            `;

            let largeMedia;
            if (isVideo) {
              // 創建放大影片
              largeMedia = document.createElement('video');
              largeMedia.src = imageUrl;
              largeMedia.controls = true;
              largeMedia.autoplay = true;
              largeMedia.loop = true;
              largeMedia.muted = true;
              largeMedia.style.cssText = `
                max-width: 90vw;
                max-height: 90vh;
                object-fit: contain;
                border-radius: 8px;
              `;
            } else {
              // 創建放大圖片
              largeMedia = document.createElement('img');
              largeMedia.src = imageUrl;
              largeMedia.style.cssText = `
                max-width: 90vw;
                max-height: 90vh;
                object-fit: contain;
                border-radius: 8px;
              `;
            }

            overlay.appendChild(largeMedia);
            document.body.appendChild(overlay);

            // 點擊關閉
            overlay.addEventListener('click', () => {
              document.body.removeChild(overlay);
            });
          });

          // 添加右鍵菜單
          mediaElement.addEventListener('contextmenu', (e) => {
            if (window.gssDisableNativeContextMenu) return;
            e.preventDefault();
            e.stopPropagation();
            showContextMenuAt(e.clientX, e.clientY, 'GSS-' + imageUrl, mediaElement);
          });

          wrapper.appendChild(mediaElement);
        } else {
          console.warn('[GSS] 不安全的圖片連結被阻止:', imageUrl);
          // 顯示錯誤提示
          const errorText = document.createElement('span');
          errorText.textContent = '⚠️ 不安全連結';
          errorText.style.cssText = 'font-size: 10px; color: #ff9800; display: block; text-align: center;';
          wrapper.appendChild(errorText);
        }
      } else {
        // IM 或 ME 貼圖：顯示圖片
        const url = decodeStickerId(hiddenStickerId);
        if (url) {
          const isVideo = /\.mp4$/i.test(url);
          if (isVideo) {
            // 創建 video 元素
            const video = document.createElement('video');
            video.src = url;
            video.alt = hiddenStickerId;
            video.muted = true;
            video.autoplay = true;
            video.loop = true;
            video.playsInline = true;
            video.className = 'dlsq-im-replaced dlsq-chat-video';
            wrapper.appendChild(video);
          } else {
            // 創建 img 元素
            const img = document.createElement('img');
            img.src = url;
            img.alt = hiddenStickerId; // 【修復】設置 alt 與 DL 圖保持一致，防止翻譯清除
            img.className = 'dlsq-im-replaced dlsq-converted-image dlsq-chat-img'; // 【標記】標記為已轉換圖片
            wrapper.appendChild(img);
          }
        }
      }

      // 使用 replaceWith 代替 replaceChild，更兼容 React
      try {
        // 額外檢查：確保節點還在 DOM 中且沒有被 React 移除
        if (!textNode.parentNode || !document.contains(textNode)) {
          console.log('[GSS] Text node removed from DOM, skipping');
          return; // 節點已被移除，跳過
        }
        textNode.replaceWith(wrapper);

        // 【防重複處理】給父元素添加處理標記
        if (parentEl && hiddenStickerId) {
          const processedIds = parentEl.getAttribute('data-dlsq-processed') || '';
          if (!processedIds.includes(hiddenStickerId)) {
            parentEl.setAttribute('data-dlsq-processed', processedIds + ',' + hiddenStickerId);
          }
        }
      } catch (e) {
        console.log('[GSS] replaceWith failed:', e.message);
        // 如果 replaceWith 失敗，嘗試 insertBefore + remove
        try {
          const parent = textNode.parentNode;
          if (parent && document.contains(textNode)) {
            parent.insertBefore(wrapper, textNode);
            parent.removeChild(textNode);
            console.log('[GSS] Fallback insertBefore/remove succeeded');

            // 【防重複處理】給父元素添加處理標記
            if (hiddenStickerId) {
              const processedIds = parent.getAttribute('data-dlsq-processed') || '';
              if (!processedIds.includes(hiddenStickerId)) {
                parent.setAttribute('data-dlsq-processed', processedIds + ',' + hiddenStickerId);
              }
            }
          }
        } catch (e2) {
          console.log('[GSS] Fallback also failed:', e2.message);
          // 節點可能已被 React 移除，忽略錯誤
        }
      }

      // 等待圖片加載完成後再滾動（所有貼圖類型都需要）
      // 【修復】為所有貼圖類型（IM/ME/DL/YT）觸發滾動
      const mediaEl = wrapper.querySelector('img, video');
      if (mediaEl && !mediaEl.dataset.dlsqScrollBound) {
        mediaEl.dataset.dlsqScrollBound = 'true'; // 標記已綁定，防止重複

        const doScroll = () => {
          // 多平台聊天容器選擇器
          const chatSelectors = [
            '.overflow-y-auto.height-100',           // DLive
            '.scrollable-area', // 【修正】Twitch 真正可滾動的容器
            '[data-a-target="chat-list"]',           // Twitch 備援
            '.chat-scroll-area',                      // Twitch 備援
            '.chat-room__content',                    // Twitch 舊版
            '.chat-list',                             // 通用
            '[data-chat="true"] [class*="overflow-y"]', // Kick 新版
            '[class*="ChatContainer"] [class*="overflow"]', // Kick 容器
            '#chat-input-wrapper ~ div [class*="overflow-y"]', // Kick 舊版
            '.chat-container [class*="overflow"]',    // Kick 備援
            '.vs_chatv9_messages',                    // Vaughn
            '[class*="message-list"]',              // 通用
          ];

          let chatContainer = null;
          for (const selector of chatSelectors) {
            const el = document.querySelector(selector);
            if (el && el.scrollHeight > el.clientHeight) {
              chatContainer = el;
              console.log('[GSS] Found chat container:', selector);
              break;
            }
          }

          if (chatContainer) {
            const distanceToBottom = chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight;
            console.log('[GSS] Distance to bottom:', distanceToBottom);
            if (distanceToBottom > 200) {
              console.log('[GSS] Skip scroll: user not near bottom');
              return; // 用戶在看歷史消息，不打擾
            }
          }

          // Kick/Twitch 特殊處理：使用 scrollTo 而不是 scrollIntoView
          if ((isKick() || isTwitch()) && chatContainer) {
            console.log('[GSS] Using Kick/Twitch scroll method, container:', chatContainer);
            // 【關鍵】Kick/Twitch 需要觸發滾動事件才能更新 React 狀態
            // 使用 scrollTo 方法更可靠
            const targetScroll = chatContainer.scrollHeight;
            chatContainer.scrollTo({ top: targetScroll, behavior: 'auto' });
            console.log('[GSS] scrollTo called, target:', targetScroll, 'current:', chatContainer.scrollTop);
            // 觸發多種滾動事件讓 Kick/Twitch 知道已滾動到底部
            chatContainer.dispatchEvent(new Event('scroll', { bubbles: true }));
            window.dispatchEvent(new Event('scroll', { bubbles: true }));
            // 嘗試找到並點擊「恢復滾動」按鈕
            const resumeBtn = document.querySelector('button[class*="scroll"], button[dir="ltr"]');
            if (resumeBtn && resumeBtn.textContent.includes('暂停')) {
              console.log('[GSS] Clicking resume button');
              resumeBtn.click();
            }
            // 再延遲一點確保渲染完成
            setTimeout(() => {
              console.log('[GSS] Delayed scroll check, current:', chatContainer.scrollTop, 'target:', chatContainer.scrollHeight);
              chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: 'auto' });
            }, 100);
          } else {
            wrapper.parentElement?.scrollIntoView(false);
          }
        };

        mediaEl.addEventListener('load', doScroll);
        mediaEl.addEventListener('error', doScroll);
        // 如果圖片已經載入完成，立即執行滾動
        if (mediaEl.complete) {
          doScroll();
        }
      } else if (!mediaEl) {
        // 沒有圖片/視頻元素，直接滾動
        console.log('[GSS] No media element, scrolling immediately');
        wrapper.parentElement?.scrollIntoView(false);
      }

      return; // 已處理，跳過常規 IM- 檢查
    }

    // 檢查明文 DL- ID 或 Twitch emote 格式 :emote/mine/dlive/xxx:（從頭匹配，最少6字符）
    const dlRegex = /\bDL-[a-zA-Z0-9_]{3,}\b|:emote\/mine\/dlive\/([a-zA-Z0-9_]+):/gi;
    let dlMatch;
    let dlLastIndex = 0;
    const dlFragments = [];

    while ((dlMatch = dlRegex.exec(text)) !== null) {
      const fullMatch = dlMatch[0];
      const emoteId = dlMatch[1]; // 如果是 emote 格式，這是捕獲組中的 ID

      if (dlMatch.index > dlLastIndex) {
        dlFragments.push(document.createTextNode(text.slice(dlLastIndex, dlMatch.index)));
      }

      if (emoteId) {
        // Twitch emote 格式 :emote/mine/dlive/xxx: - 顯示實際圖片
        const img = document.createElement('img');
        img.src = `https://images.prd.dlivecdn.com/emote/${emoteId}`;
        img.alt = `DL-${emoteId}`;
        img.className = 'dlsq-im-replaced dlsq-converted-image dlsq-chat-img'; // 【標記】標記為已轉換圖片
        dlFragments.push(img);
      } else {
        // 純文字 DL-xxx 格式 - 也顯示為實際圖片
        const dlId = fullMatch.slice(3); // 去掉 "DL-" 前綴
        const img = document.createElement('img');
        img.src = `https://images.prd.dlivecdn.com/emote/${dlId}`;
        img.alt = fullMatch;
        img.className = 'dlsq-im-replaced dlsq-converted-image dlsq-chat-img'; // 【標記】標記為已轉換圖片
        dlFragments.push(img);
      }

      dlLastIndex = dlRegex.lastIndex;
    }

    if (dlLastIndex < text.length) {
      dlFragments.push(document.createTextNode(text.slice(dlLastIndex)));
    }

    // 檢查是否成功替換了至少一個圖片（而不是只有文本節點）
    const hasDLMedia = dlFragments.some(f => f.tagName === 'IMG');
    if (hasDLMedia) {
      const wrapper = document.createElement('span');
      wrapper.className = 'dlsq-im-replaced';
      dlFragments.forEach(f => wrapper.appendChild(f));

      // 使用 replaceWith 代替 replaceChild
      try {
        if (textNode.parentNode) {
          textNode.replaceWith(wrapper);
        }
      } catch (e) {
        try {
          const parent = textNode.parentNode;
          if (parent) {
            parent.insertBefore(wrapper, textNode);
            parent.removeChild(textNode);
          }
        } catch (e2) {
          // 忽略錯誤
        }
      }
      // 【標記】給消息容器添加標記，防止 React/KICK 重置 DOM 後重複處理
      const msgContainer = textNode.parentElement?.closest('[class*="message"], [class*="chat-line"], [class*="ChatMessage"]');
      if (msgContainer) msgContainer.classList.add('dlsq-message-processed');

      // 【修復】DL 貼圖也需要觸發滾動
      const dlMediaEl = wrapper.querySelector('img');
      if (dlMediaEl && !dlMediaEl.dataset.dlsqScrollBound) {
        dlMediaEl.dataset.dlsqScrollBound = 'true';
        const doDLScroll = () => {
          // 多平台聊天容器選擇器
          const chatSelectors = [
            '.overflow-y-auto.height-100',
            '.scrollable-area', // 【修正】Twitch 真正可滾動的容器
            '[data-a-target="chat-list"]',
            '.chat-scroll-area',
            '.chat-room__content',
            '.chat-list',
            '[data-chat="true"] [class*="overflow-y"]',
            '[class*="ChatContainer"] [class*="overflow"]',
            '#chat-input-wrapper ~ div [class*="overflow-y"]',
            '.chat-container [class*="overflow"]',
            '.vs_chatv9_messages',
            '[class*="message-list"]',
          ];
          let chatContainer = null;
          for (const selector of chatSelectors) {
            const el = document.querySelector(selector);
            if (el && el.scrollHeight > el.clientHeight) {
              chatContainer = el;
              break;
            }
          }
          if ((isKick() || isTwitch()) && chatContainer) {
            const targetScroll = chatContainer.scrollHeight;
            chatContainer.scrollTo({ top: targetScroll, behavior: 'auto' });
            chatContainer.dispatchEvent(new Event('scroll', { bubbles: true }));
            window.dispatchEvent(new Event('scroll', { bubbles: true }));
            const resumeBtn = document.querySelector('button[class*="scroll"], button[dir="ltr"]');
            if (resumeBtn && resumeBtn.textContent.includes('暂停')) {
              resumeBtn.click();
            }
            setTimeout(() => {
              chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: 'auto' });
            }, 100);
          } else {
            wrapper.parentElement?.scrollIntoView(false);
          }
        };
        dlMediaEl.addEventListener('load', doDLScroll);
        dlMediaEl.addEventListener('error', doDLScroll);
        if (dlMediaEl.complete) {
          doDLScroll();
        }
      }

      return; // 已處理 DL，跳過 IM- 檢查
    }

    // 【優先】常規 IM-/ME- 檢查（從頭匹配，最少6字符）
    const imRegex = /\bIM-[a-zA-Z0-9]{3,}(?:\.(?:gif|png|jpg|jpeg|mp4))?\b/gi;
    const meRegex = /\bME-[a-zA-Z0-9]{3,}(?:[.-](?:gif|png|jpg|jpeg|mp4))?\b/gi;

    // 【調試】檢查文本內容
    const imTest = imRegex.test(text);
    const meTest = meRegex.test(text);
    imRegex.lastIndex = 0; // 重置
    meRegex.lastIndex = 0; // 重置
    if (imTest || meTest) {
      console.log(`[GSS] 【IM/ME 檢測】文本:`, text.substring(0, 60), 'IM匹配:', imTest, 'ME匹配:', meTest);
    }

    // 處理 IM- 格式
    let imMatch;
    let imLastIndex = 0;
    const imFragments = [];

    while ((imMatch = imRegex.exec(text)) !== null) {
      const fullMatch = imMatch[0];

      if (imMatch.index > imLastIndex) {
        imFragments.push(document.createTextNode(text.slice(imLastIndex, imMatch.index)));
      }

      const url = decodeStickerId(fullMatch);
      if (url) {
        const isVideo = /\.mp4$/i.test(url);
        if (isVideo) {
          const video = document.createElement('video');
          video.src = url;
          video.className = 'dlsq-im-replaced';
          video.muted = true;
          video.autoplay = true;
          video.loop = true;
          video.playsInline = true;
          video.className = 'dlsq-im-replaced dlsq-chat-video';
          imFragments.push(video);
        } else {
          const img = document.createElement('img');
          img.src = url;
          img.alt = fullMatch; // 【修復】設置 alt 與 DL 圖保持一致，防止翻譯清除
          img.className = 'dlsq-im-replaced dlsq-converted-image dlsq-chat-img'; // 【標記】標記為已轉換圖片
          imFragments.push(img);
        }
      } else {
        imFragments.push(document.createTextNode(fullMatch));
      }

      imLastIndex = imRegex.lastIndex;
    }

    if (imLastIndex < text.length) {
      imFragments.push(document.createTextNode(text.slice(imLastIndex)));
    }

    // 檢查是否成功替換了至少一個圖片/視頻（而不是只有文本節點）
    const hasIMMedia = imFragments.some(f => f.tagName === 'IMG' || f.tagName === 'VIDEO');
    if (hasIMMedia) {
      const wrapper = document.createElement('span');
      wrapper.className = 'dlsq-im-replaced';
      imFragments.forEach(f => wrapper.appendChild(f));

      try {
        if (textNode.parentNode) {
          textNode.replaceWith(wrapper);
        }
      } catch (e) {
        try {
          const parent = textNode.parentNode;
          if (parent) {
            parent.insertBefore(wrapper, textNode);
            parent.removeChild(textNode);
          }
        } catch (e2) {
          // 忽略錯誤
        }
      }
      // 【標記】給消息容器添加標記，防止 React/KICK 重置 DOM 後重複處理
      const msgContainer2 = textNode.parentElement?.closest('[class*="message"], [class*="chat-line"], [class*="ChatMessage"]');
      if (msgContainer2) msgContainer2.classList.add('dlsq-message-processed');

      // 【修復】明文 IM 貼圖也需要觸發滾動
      const imMediaEl = wrapper.querySelector('img, video');
      if (imMediaEl && !imMediaEl.dataset.dlsqScrollBound) {
        imMediaEl.dataset.dlsqScrollBound = 'true';
        const doIMScroll = () => {
          const chatSelectors = [
            '.overflow-y-auto.height-100', '.scrollable-area',
            '[data-a-target="chat-list"]', '.chat-scroll-area',
            '.chat-room__content', '.chat-list',
            '[data-chat="true"] [class*="overflow-y"]',
            '[class*="ChatContainer"] [class*="overflow"]',
            '#chat-input-wrapper ~ div [class*="overflow-y"]',
            '.chat-container [class*="overflow"]',
            '.vs_chatv9_messages', '[class*="message-list"]',
          ];
          let chatContainer = null;
          for (const selector of chatSelectors) {
            const el = document.querySelector(selector);
            if (el && el.scrollHeight > el.clientHeight) {
              chatContainer = el;
              break;
            }
          }
          if ((isKick() || isTwitch()) && chatContainer) {
            const targetScroll = chatContainer.scrollHeight;
            chatContainer.scrollTo({ top: targetScroll, behavior: 'auto' });
            chatContainer.dispatchEvent(new Event('scroll', { bubbles: true }));
            window.dispatchEvent(new Event('scroll', { bubbles: true }));
            const resumeBtn = document.querySelector('button[class*="scroll"], button[dir="ltr"]');
            if (resumeBtn && resumeBtn.textContent.includes('暂停')) {
              resumeBtn.click();
            }
            setTimeout(() => {
              chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: 'auto' });
            }, 100);
          } else {
            wrapper.parentElement?.scrollIntoView(false);
          }
        };
        imMediaEl.addEventListener('load', doIMScroll);
        imMediaEl.addEventListener('error', doIMScroll);
        if (imMediaEl.complete) {
          doIMScroll();
        }
      }

      return; // 已處理 IM，跳過 ME 檢查
    }

    // 處理 ME- 格式
    let meMatch;
    let meLastIndex = 0;
    const meFragments = [];

    while ((meMatch = meRegex.exec(text)) !== null) {
      const fullMatch = meMatch[0];

      if (meMatch.index > meLastIndex) {
        meFragments.push(document.createTextNode(text.slice(meLastIndex, meMatch.index)));
      }

      const url = MEKP.decode(fullMatch);
      if (url) {
        const isVideo = /\.mp4$/i.test(url);
        if (isVideo) {
          const video = document.createElement('video');
          video.src = url;
          video.className = 'dlsq-im-replaced';
          video.muted = true;
          video.autoplay = true;
          video.loop = true;
          video.playsInline = true;
          video.className = 'dlsq-im-replaced dlsq-chat-video';
          meFragments.push(video);
        } else {
          const img = document.createElement('img');
          img.src = url;
          img.alt = fullMatch; // 【修復】設置 alt 與 DL 圖保持一致，防止翻譯清除
          img.className = 'dlsq-im-replaced dlsq-converted-image dlsq-chat-img'; // 【標記】標記為已轉換圖片
          meFragments.push(img);
        }
      } else {
        meFragments.push(document.createTextNode(fullMatch));
      }

      meLastIndex = meRegex.lastIndex;
    }

    if (meLastIndex < text.length) {
      meFragments.push(document.createTextNode(text.slice(meLastIndex)));
    }

    // 檢查是否成功替換了至少一個圖片/視頻（而不是只有文本節點）
    const hasMEMedia = meFragments.some(f => f.tagName === 'IMG' || f.tagName === 'VIDEO');
    if (hasMEMedia) {
      const wrapper = document.createElement('span');
      wrapper.className = 'dlsq-im-replaced';
      meFragments.forEach(f => wrapper.appendChild(f));

      try {
        if (textNode.parentNode) {
          textNode.replaceWith(wrapper);
        }
      } catch (e) {
        try {
          const parent = textNode.parentNode;
          if (parent) {
            parent.insertBefore(wrapper, textNode);
            parent.removeChild(textNode);
          }
        } catch (e2) {
          // 忽略錯誤
        }
      }
      // 【標記】給消息容器添加標記，防止 React/KICK 重置 DOM 後重複處理
      const msgContainer3 = textNode.parentElement?.closest('[class*="message"], [class*="chat-line"], [class*="ChatMessage"]');
      if (msgContainer3) msgContainer3.classList.add('dlsq-message-processed');

      // 【修復】明文 ME 貼圖也需要觸發滾動
      const meMediaEl = wrapper.querySelector('img, video');
      if (meMediaEl && !meMediaEl.dataset.dlsqScrollBound) {
        meMediaEl.dataset.dlsqScrollBound = 'true';
        const doMEScroll = () => {
          const chatSelectors = [
            '.overflow-y-auto.height-100', '.scrollable-area',
            '[data-a-target="chat-list"]', '.chat-scroll-area',
            '.chat-room__content', '.chat-list',
            '[data-chat="true"] [class*="overflow-y"]',
            '[class*="ChatContainer"] [class*="overflow"]',
            '#chat-input-wrapper ~ div [class*="overflow-y"]',
            '.chat-container [class*="overflow"]',
            '.vs_chatv9_messages', '[class*="message-list"]',
          ];
          let chatContainer = null;
          for (const selector of chatSelectors) {
            const el = document.querySelector(selector);
            if (el && el.scrollHeight > el.clientHeight) {
              chatContainer = el;
              break;
            }
          }
          if ((isKick() || isTwitch()) && chatContainer) {
            const targetScroll = chatContainer.scrollHeight;
            chatContainer.scrollTo({ top: targetScroll, behavior: 'auto' });
            chatContainer.dispatchEvent(new Event('scroll', { bubbles: true }));
            window.dispatchEvent(new Event('scroll', { bubbles: true }));
            const resumeBtn = document.querySelector('button[class*="scroll"], button[dir="ltr"]');
            if (resumeBtn && resumeBtn.textContent.includes('暂停')) {
              resumeBtn.click();
            }
            setTimeout(() => {
              chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: 'auto' });
            }, 100);
          } else {
            wrapper.parentElement?.scrollIntoView(false);
          }
        };
        meMediaEl.addEventListener('load', doMEScroll);
        meMediaEl.addEventListener('error', doMEScroll);
        if (meMediaEl.complete) {
          doMEScroll();
        }
      }

      return; // 已處理 ME，跳過 YT 檢查
    }

    // 【統一格式】YT- 智能模式：自動檢測 Shorts 並給予適當顯示 (從頭匹配，最少6字符)
    // 【統一格式】YT- 智能模式：自動檢測 Shorts 並給予適當顯示
    const ytRegex = /\bYT-[a-zA-Z0-9_-]{3,}\b/gi;
    let ytMatch;
    let ytLastIndex = 0;
    const ytFragments = [];

    while ((ytMatch = ytRegex.exec(text)) !== null) {
      const fullMatch = ytMatch[0];

      if (ytMatch.index > ytLastIndex) {
        ytFragments.push(document.createTextNode(text.slice(ytLastIndex, ytMatch.index)));
      }

      const videoId = fullMatch.slice(3); // 移除 "YT-" 前綴

      // 【智能模式】先創建縮略圖容器
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
      const thumbContainer = document.createElement('span');
      thumbContainer.className = 'dlsq-im-replaced dlsq-yt-thumbnail';
      thumbContainer.style.cssText = 'cursor: pointer; display: block; position: relative;';
      thumbContainer.title = '點擊播放 YouTube 視頻';

      // 創建縮略圖圖片
      const img = document.createElement('img');
      img.src = thumbnailUrl;
      img.alt = fullMatch;
      img.className = 'dlsq-converted-image dlsq-chat-yt';
      img.onerror = () => {
        img.style.display = 'none';
        const fallback = document.createElement('span');
        fallback.textContent = '🎬 ' + fullMatch;
        fallback.style.cssText = 'color: #666; font-size: 12px;';
        thumbContainer.appendChild(fallback);
      };

      // 創建播放按鈕圖標
      const playBtn = document.createElement('span');
      playBtn.innerHTML = '▶';
      playBtn.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 40px;
        height: 40px;
        background: rgba(255,0,0,0.85);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 16px;
        padding-left: 3px;
        pointer-events: none;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      `;

      thumbContainer.appendChild(img);
      thumbContainer.appendChild(playBtn);

      // 點擊打開 YouTube 播放器
      thumbContainer.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openYouTubePlayer(videoId);
      });

      // 【智能檢測】若為 Shorts，自動轉換為直式自動播放
      checkYouTubeVideoType(videoId).then(videoInfo => {
        if (videoInfo.isShorts && thumbContainer.parentNode) {
          // 是 Shorts，創建直式自動播放容器替換縮略圖
          const shortsContainer = document.createElement('span');
          shortsContainer.className = 'dlsq-im-replaced dlsq-yt-shorts tsc-exclude';
          shortsContainer.style.cssText = 'display: inline-block; position: relative; width: 120px; height: 213px; vertical-align: middle; margin: 4px 0; border-radius: 8px; overflow: hidden;';

          // 創建 iframe 自動播放 Shorts
          const iframe = document.createElement('iframe');
          iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&playsinline=1&rel=0`;
          iframe.style.cssText = 'width: 100%; height: 100%; border: none; border-radius: 8px; pointer-events: none;';
          iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
          iframe.setAttribute('allowfullscreen', '');

          shortsContainer.appendChild(iframe);

          // 創建透明遮罩層
          const overlay = document.createElement('span');
          overlay.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; cursor: pointer; z-index: 1;';
          overlay.setAttribute('data-yt-id', `YT-${videoId}`);
          shortsContainer.appendChild(overlay);

          // 點擊遮罩開啟小播放器
          overlay.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openYouTubePlayer(videoId);
          });

          // 右鍵選單
          overlay.addEventListener('contextmenu', (e) => {
            if (window.gssDisableNativeContextMenu) return;
            e.preventDefault();
            e.stopPropagation();
            showContextMenuAt(e.clientX, e.clientY, `YT-${videoId}`, overlay);
          });

          // 替換縮略圖為 Shorts 容器
          thumbContainer.parentNode.replaceChild(shortsContainer, thumbContainer);
        }
      }).catch(() => {
        // API 失敗時保持縮略圖不變
      });

      ytFragments.push(thumbContainer);

      ytLastIndex = ytRegex.lastIndex;
    }

    if (ytLastIndex < text.length) {
      ytFragments.push(document.createTextNode(text.slice(ytLastIndex)));
    }

    if (ytFragments.length > 1 || (ytFragments.length === 1 && ytFragments[0].className?.includes('dlsq-yt-thumbnail'))) {
      const wrapper = document.createElement('span');
      wrapper.className = 'dlsq-im-replaced';
      ytFragments.forEach(f => wrapper.appendChild(f));

      try {
        if (textNode.parentNode) {
          textNode.replaceWith(wrapper);
        }
      } catch (e) {
        try {
          const parent = textNode.parentNode;
          if (parent) {
            parent.insertBefore(wrapper, textNode);
            parent.removeChild(textNode);
          }
        } catch (e2) {
          // 忽略錯誤
        }
      }
      // 【標記】給消息容器添加標記，防止 React/KICK 重置 DOM 後重複處理
      const msgContainer4 = textNode.parentElement?.closest('[class*="message"], [class*="chat-line"], [class*="ChatMessage"]');
      if (msgContainer4) msgContainer4.classList.add('dlsq-message-processed');

      // YT- 也觸發滾動（統一行為，支援 Kick）
      setTimeout(() => {
        if (isKick()) {
          // Kick 特殊處理：使用更精確的選擇器找到聊天容器
          const kickSelectors = [
            '[data-chat="true"] [class*="overflow-y"]',
            '[class*="ChatContainer"] [class*="overflow"]',
            '#chat-input-wrapper ~ div [class*="overflow-y"]',
            '.chat-container [class*="overflow"]'
          ];
          let kickChatContainer = null;
          for (const selector of kickSelectors) {
            const el = document.querySelector(selector);
            if (el && el.scrollHeight > el.clientHeight) {
              kickChatContainer = el;
              console.log('[GSS] YT- Kick chat container found:', selector);
              break;
            }
          }
          if (kickChatContainer) {
            const targetScroll = kickChatContainer.scrollHeight;
            kickChatContainer.scrollTo({ top: targetScroll, behavior: 'auto' });
            console.log('[GSS] YT- Kick scrolled to:', targetScroll);
            // 觸發滾動事件讓 React 知道
            kickChatContainer.dispatchEvent(new Event('scroll', { bubbles: true }));
          } else {
            wrapper.parentElement?.scrollIntoView(false);
          }
        } else {
          wrapper.parentElement?.scrollIntoView(false);
        }
      }, 500);

      return; // 已處理 YT-xxx，跳過完整 URL 檢查
    }

    // 處理完整的 YouTube URL (youtube.com/watch?v=... 或 youtube.com/shorts/... 或 youtu.be/...)
    // 【Vaughn 平台】不轉換完整 YouTube URL 為縮略圖，只處理 YT-xxx 格式
    if (isVaughn()) {
      return; // Vaughn 上跳過完整 URL 處理，只保留 YT-xxx 的縮略圖
    }

    const ytUrlRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtube\.com\/shorts\/|youtu\.be\/)([a-zA-Z0-9_-]+)(?:[&?][^\s]*)?/gi;
    let ytUrlMatch;
    let ytUrlLastIndex = 0;
    const ytUrlFragments = [];

    while ((ytUrlMatch = ytUrlRegex.exec(text)) !== null) {
      const fullMatch = ytUrlMatch[0];
      const videoId = ytUrlMatch[1];

      if (ytUrlMatch.index > ytUrlLastIndex) {
        ytUrlFragments.push(document.createTextNode(text.slice(ytUrlLastIndex, ytUrlMatch.index)));
      }

      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;

      // 創建縮略圖容器
      const thumbContainer = document.createElement('span');
      thumbContainer.className = 'dlsq-im-replaced dlsq-yt-thumbnail';
      thumbContainer.style.cssText = 'cursor: pointer; display: block; position: relative;';
      thumbContainer.title = '點擊播放 YouTube 視頻';

      // 創建縮略圖圖片
      const img = document.createElement('img');
      img.src = thumbnailUrl;
      img.alt = fullMatch;
      img.className = 'dlsq-converted-image dlsq-chat-yt'; // 【標記】標記為已轉換圖片
      img.onerror = () => {
        img.style.display = 'none';
        const fallback = document.createElement('span');
        fallback.textContent = '🎬 ' + fullMatch;
        fallback.style.cssText = 'color: #666; font-size: 12px;';
        thumbContainer.appendChild(fallback);
      };

      // 創建播放按鈕圖標
      const playBtn = document.createElement('span');
      playBtn.innerHTML = '▶';
      playBtn.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 40px;
        height: 40px;
        background: rgba(255,0,0,0.85);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 14px;
        padding-left: 3px;
        pointer-events: none;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      `;

      thumbContainer.appendChild(img);
      thumbContainer.appendChild(playBtn);

      // 點擊打開 YouTube 播放器
      thumbContainer.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openYouTubePlayer(videoId);
      });

      ytUrlFragments.push(thumbContainer);

      ytUrlLastIndex = ytUrlRegex.lastIndex;
    }

    if (ytUrlLastIndex < text.length) {
      ytUrlFragments.push(document.createTextNode(text.slice(ytUrlLastIndex)));
    }

    if (ytUrlFragments.length > 1 || (ytUrlFragments.length === 1 && ytUrlFragments[0].className?.includes('dlsq-yt-thumbnail'))) {
      const wrapper = document.createElement('span');
      wrapper.className = 'dlsq-im-replaced';
      ytUrlFragments.forEach(f => wrapper.appendChild(f));

      try {
        if (textNode.parentNode) {
          textNode.replaceWith(wrapper);
        }
      } catch (e) {
        try {
          const parent = textNode.parentNode;
          if (parent) {
            parent.insertBefore(wrapper, textNode);
            parent.removeChild(textNode);
          }
        } catch (e2) {
          // 忽略錯誤
        }
      }

      // 【修復】完整 YouTube URL 也需要觸發滾動
      console.log('[GSS] YouTube URL thumbnail processed, triggering scroll');
      const ytMediaEl = wrapper.querySelector('img');
      if (ytMediaEl && !ytMediaEl.dataset.dlsqScrollBound) {
        ytMediaEl.dataset.dlsqScrollBound = 'true';
        const doYTScroll = () => {
          // 多平台聊天容器選擇器
          const chatSelectors = [
            '.overflow-y-auto.height-100',
            '.scrollable-area', // 【修正】Twitch 真正可滾動的容器
            '[data-a-target="chat-list"]',
            '.chat-scroll-area',
            '.chat-room__content',
            '.chat-list',
            '[data-chat="true"] [class*="overflow-y"]',
            '[class*="ChatContainer"] [class*="overflow"]',
            '#chat-input-wrapper ~ div [class*="overflow-y"]',
            '.chat-container [class*="overflow"]',
            '.vs_chatv9_messages',
            '[class*="message-list"]',
          ];
          let chatContainer = null;
          for (const selector of chatSelectors) {
            const el = document.querySelector(selector);
            if (el && el.scrollHeight > el.clientHeight) {
              chatContainer = el;
              break;
            }
          }
          if ((isKick() || isTwitch()) && chatContainer) {
            const targetScroll = chatContainer.scrollHeight;
            chatContainer.scrollTo({ top: targetScroll, behavior: 'auto' });
            chatContainer.dispatchEvent(new Event('scroll', { bubbles: true }));
            window.dispatchEvent(new Event('scroll', { bubbles: true }));
            const resumeBtn = document.querySelector('button[class*="scroll"], button[dir="ltr"]');
            if (resumeBtn && resumeBtn.textContent.includes('暂停')) {
              resumeBtn.click();
            }
            setTimeout(() => {
              chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: 'auto' });
            }, 100);
          } else {
            wrapper.parentElement?.scrollIntoView(false);
          }
        };
        ytMediaEl.addEventListener('load', doYTScroll);
        ytMediaEl.addEventListener('error', doYTScroll);
        if (ytMediaEl.complete) {
          doYTScroll();
        }
      }
    }
  });
}

// WTV 專用：掃描並替換圖片（使用特殊策略避免 React 重新渲染）
function scanAndReplaceWTVImages() {
  // WTV 聊天容器
  const chatContainer = document.querySelector('[data-chat-scroll-container]');
  if (!chatContainer) return;

  // 只處理可見的訊息容器（優化效能）
  const messageContainers = chatContainer.querySelectorAll('[data-testid="chat-message-container"]');
  let processedCount = 0;

  messageContainers.forEach(container => {
    // 檢查是否已處理過
    if (container.classList.contains('dlsq-wtv-processed')) return;

    // 檢查是否已經有轉換過的圖片
    if (container.querySelector('.dlsq-wtv-converted')) return;

    // 使用 TreeWalker 精確查找文本節點，避免影響 HTML 結構
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let textNode = null;
    let imMatch = null;
    let meMatch = null;
    let dlMatch = null;
    let ytMatch = null;
    let cbMatch = null;
    let gssMatch = null;

    // 找到包含貼圖 ID 的文本節點
    while (textNode = walker.nextNode()) {
      const text = textNode.textContent || '';

      // 檢查是否包含貼圖 ID
      imMatch = text.match(/\bIM-[a-zA-Z0-9_-]+\.(?:gif|png|jpg|jpeg|mp4)\b/gi);
      meMatch = text.match(/\bME-[a-zA-Z0-9_-]+[\.-](?:gif|png|jpg|jpeg|mp4)\b/gi);
      dlMatch = text.match(/:emote\/mine\/dlive\/([a-zA-Z0-9_]+):/gi);
      ytMatch = text.match(/\bYT-[a-zA-Z0-9_-]+\b/gi); // YouTube ID
      cbMatch = text.match(/\bCB-[a-zA-Z0-9_-]+[\.-](?:gif|png|jpg|jpeg|mp4|webp)\b/gi); // Catbox ID

      // 【新功能】GSS-分類：檢測圖片/影片連結（支援無協議格式）
      gssMatch = text.match(/\bGSS-(?:https?:\/\/)?[^\s]+\.(?:jpg|jpeg|png|gif|webp|bmp|svg|mp4)(?:\?[^\s]*(?:&amp;[^\s]*)*)?\b/gi);

      if (imMatch || meMatch || dlMatch || ytMatch || cbMatch || gssMatch) {
        break; // 找到後停止，textNode 已經保存
      }
    }

    if (!textNode || (!imMatch && !meMatch && !dlMatch && !ytMatch && !cbMatch && !gssMatch)) return;

    // 標記容器為已處理
    container.classList.add('dlsq-wtv-processed');
    processedCount++;

    // 【關鍵策略】使用 CSS 隱藏原始文字 + 絕對定位圖片覆蓋，而不是替換 DOM 節點
    // 這樣可以避免 React 重新渲染時重置我們的修改

    // 1. 找到或創建圖片容器
    let imgContainer = container.querySelector('.dlsq-wtv-img-container');
    if (!imgContainer) {
      imgContainer = document.createElement('span');
      imgContainer.className = 'dlsq-wtv-img-container dlsq-wtv-converted';
      imgContainer.style.cssText = 'display: inline-flex; flex-wrap: wrap; gap: 4px; vertical-align: middle;';

      // 2. 將圖片容器插入到訊息容器的末尾
      container.appendChild(imgContainer);
    }

    // 3. 處理 IM- 貼圖/影片
    if (imMatch) {
      imMatch.forEach(stickerId => {
        const url = decodeStickerId(stickerId);
        if (url && !imgContainer.querySelector(`img[data-sticker-id="${stickerId}"], video[data-sticker-id="${stickerId}"]`)) {
          const isVideo = /\.mp4$/i.test(url);
          let mediaElement;

          if (isVideo) {
            // 創建 video 元素
            mediaElement = document.createElement('video');
            mediaElement.src = url;
            mediaElement.alt = stickerId;
            mediaElement.dataset.stickerId = stickerId;
            mediaElement.className = 'dlsq-wtv-sticker dlsq-wtv-video';
            mediaElement.style.cssText = 'max-width: 100px; max-height: 100px; border-radius: 4px; display: inline-block;';
            mediaElement.muted = true;
            mediaElement.autoplay = true;
            mediaElement.loop = true;
            mediaElement.playsInline = true;
          } else {
            // 創建 img 元素
            mediaElement = document.createElement('img');
            mediaElement.src = url;
            mediaElement.alt = stickerId;
            mediaElement.dataset.stickerId = stickerId;
            mediaElement.className = 'dlsq-wtv-sticker';
            mediaElement.style.cssText = 'max-width: 100px; max-height: 100px; border-radius: 4px; display: inline-block;';
          }

          // 添加右鍵菜單（使用 capture 模式）
          mediaElement.addEventListener('contextmenu', (e) => {
            console.log('[GSS Debug] WTV IM media contextmenu:', stickerId, e.target);
            if (window.gssDisableNativeContextMenu) {
              console.log('[GSS Debug] WTV native contextmenu disabled');
              return;
            }
            console.log('[GSS Debug] WTV IM preventing default and showing menu');
            e.preventDefault();
            e.stopPropagation();
            showContextMenuAt(e.clientX, e.clientY, stickerId, mediaElement);
          }, true); // 使用 capture 模式

          imgContainer.appendChild(mediaElement);
        }
      });
    }

    // 4. 處理 ME- 貼圖/影片
    if (meMatch) {
      meMatch.forEach(stickerId => {
        const normalizedId = stickerId.replace(/\./g, '-');
        const url = MEKP.decode(normalizedId);
        if (url && !imgContainer.querySelector(`img[data-sticker-id="${stickerId}"], video[data-sticker-id="${stickerId}"]`)) {
          const isVideo = /\.mp4$/i.test(url);
          let mediaElement;

          if (isVideo) {
            // 創建 video 元素
            mediaElement = document.createElement('video');
            mediaElement.src = url;
            mediaElement.alt = stickerId;
            mediaElement.dataset.stickerId = stickerId;
            mediaElement.className = 'dlsq-wtv-sticker dlsq-wtv-video';
            mediaElement.style.cssText = 'max-width: 100px; max-height: 100px; border-radius: 4px; display: inline-block;';
            mediaElement.muted = true;
            mediaElement.autoplay = true;
            mediaElement.loop = true;
            mediaElement.playsInline = true;
          } else {
            // 創建 img 元素
            mediaElement = document.createElement('img');
            mediaElement.src = url;
            mediaElement.alt = stickerId;
            mediaElement.dataset.stickerId = stickerId;
            mediaElement.className = 'dlsq-wtv-sticker';
            mediaElement.style.cssText = 'max-width: 100px; max-height: 100px; border-radius: 4px; display: inline-block;';
          }

          // 添加右鍵菜單
          mediaElement.addEventListener('contextmenu', (e) => {
            if (window.gssDisableNativeContextMenu) return;
            e.preventDefault();
            e.stopPropagation();
            showContextMenuAt(e.clientX, e.clientY, stickerId, mediaElement);
          });

          imgContainer.appendChild(mediaElement);
        }
      });
    }

    // 5. 處理 CB- 貼圖
    if (cbMatch) {
      cbMatch.forEach(stickerId => {
        const url = decodeStickerId(stickerId);
        if (url && !imgContainer.querySelector(`img[data-sticker-id="${stickerId}"]`)) {
          const img = document.createElement('img');
          img.src = url;
          img.alt = stickerId;
          img.dataset.stickerId = stickerId;
          img.className = 'dlsq-wtv-sticker';
          img.style.cssText = 'max-width: 100px; max-height: 100px; border-radius: 4px; display: inline-block;';

          // 添加右鍵菜單
          img.addEventListener('contextmenu', (e) => {
            if (window.gssDisableNativeContextMenu) return;
            e.preventDefault();
            e.stopPropagation();
            showContextMenuAt(e.clientX, e.clientY, stickerId, img);
          });

          imgContainer.appendChild(img);
        }
      });
    }

    // 6. 處理 DLive emote 格式 :emote/mine/dlive/xxx:
    if (dlMatch) {
      dlMatch.forEach(fullMatch => {
        const emoteIdMatch = fullMatch.match(/:emote\/mine\/dlive\/([a-zA-Z0-9_]+):/i);
        if (emoteIdMatch) {
          const emoteId = emoteIdMatch[1];
          const stickerId = `DL-${emoteId}`;
          if (!imgContainer.querySelector(`img[data-sticker-id="${stickerId}"]`)) {
            const img = document.createElement('img');
            img.src = `https://images.prd.dlivecdn.com/emote/${emoteId}`;
            img.alt = stickerId;
            img.dataset.stickerId = stickerId;
            img.className = 'dlsq-wtv-sticker';
            img.style.cssText = 'max-width: 100px; max-height: 100px; border-radius: 4px; display: inline-block;';

            // 添加右鍵菜單
            img.addEventListener('contextmenu', (e) => {
              if (window.gssDisableNativeContextMenu) return;
              e.preventDefault();
              e.stopPropagation();
              showContextMenuAt(e.clientX, e.clientY, stickerId, img);
            });

            imgContainer.appendChild(img);
          }
        }
      });
    }

    // 6. 處理 YT- 影片格式（抄襲其他平台的完整實現）
    if (ytMatch) {
      ytMatch.forEach(ytId => {
        const videoId = ytId.slice(3); // 移除 "YT-" 前綴

        // 【智能模式】先創建縮略圖容器
        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
        const thumbContainer = document.createElement('span');
        thumbContainer.className = 'dlsq-im-replaced dlsq-yt-thumbnail';
        thumbContainer.style.cssText = 'cursor: pointer; display: block; position: relative;';

        thumbContainer.title = '點擊播放 YouTube 視頻';
        thumbContainer.setAttribute('data-sticker-id', ytId);

        // 創建縮略圖圖片
        const img = document.createElement('img');
        img.src = thumbnailUrl;
        img.alt = ytId;
        img.className = 'dlsq-converted-image dlsq-chat-yt';
        img.onerror = () => {
          img.style.display = 'none';
          const fallback = document.createElement('span');
          fallback.textContent = '🎬 ' + ytId;
          fallback.style.cssText = 'color: #666; font-size: 12px;';
          thumbContainer.appendChild(fallback);
        };

        // 創建播放按鈕圖標
        const playBtn = document.createElement('span');
        playBtn.innerHTML = '▶';
        playBtn.style.cssText = `
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 40px;
          height: 40px;
          background: rgba(255,0,0,0.85);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 16px;
          padding-left: 3px;
          pointer-events: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        `;

        thumbContainer.appendChild(img);
        thumbContainer.appendChild(playBtn);

        // 點擊打開 YouTube 播放器
        thumbContainer.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          openYouTubePlayer(videoId);
        });

        // 右鍵菜單
        thumbContainer.addEventListener('contextmenu', (e) => {
          if (window.gssDisableNativeContextMenu) return;
          e.preventDefault();
          e.stopPropagation();
          showContextMenuAt(e.clientX, e.clientY, ytId, thumbContainer);
        });

        // 【智能檢測】若為 Shorts，自動轉換為直式自動播放
        checkYouTubeVideoType(videoId).then(videoInfo => {
          if (videoInfo.isShorts && thumbContainer.parentNode) {
            // 是 Shorts，創建直式自動播放容器替換縮略圖
            const shortsContainer = document.createElement('span');
            shortsContainer.className = 'dlsq-im-replaced dlsq-yt-shorts tsc-exclude';
            shortsContainer.style.cssText = 'display: inline-block; position: relative; width: 120px; height: 213px; vertical-align: middle; margin: 4px 0; border-radius: 8px; overflow: hidden;';

            // 創建 iframe 自動播放 Shorts
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&playsinline=1&rel=0`;
            iframe.style.cssText = 'width: 100%; height: 100%; border: none; border-radius: 8px; pointer-events: none;';
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            iframe.setAttribute('allowfullscreen', '');

            shortsContainer.appendChild(iframe);

            // 創建透明遮罩層
            const overlay = document.createElement('span');
            overlay.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; cursor: pointer; z-index: 1;';
            overlay.setAttribute('data-yt-id', ytId);
            shortsContainer.appendChild(overlay);

            // 點擊遮罩開啟小播放器
            overlay.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              openYouTubePlayer(videoId);
            });

            // 右鍵菜單
            overlay.addEventListener('contextmenu', (e) => {
              if (window.gssDisableNativeContextMenu) return;
              e.preventDefault();
              e.stopPropagation();
              showContextMenuAt(e.clientX, e.clientY, ytId, overlay);
            });

            // 替換縮略圖為 Shorts 容器
            thumbContainer.parentNode.replaceChild(shortsContainer, thumbContainer);
          }
        }).catch(() => {
          // API 失敗時保持縮略圖不變
        });

        imgContainer.appendChild(thumbContainer);
      });
    }

    // 7. 【新功能】處理 GSS- 分類：圖片/影片連結轉換
    if (gssMatch) {
      gssMatch.forEach(gssUrl => {
        // 提取純連結（去掉 GSS- 前綴）
        let imageUrl = gssUrl.replace(/^GSS-/i, '');

        // 【修復】解碼 HTML 實體（修復 WTV 平台的 &amp; 問題）
        imageUrl = imageUrl.replace(/&amp;/g, '&');

        // 【關鍵】自動補完 HTTP 協議（如果沒有的話）
        if (!imageUrl.match(/^https?:\/\//i)) {
          imageUrl = 'https://' + imageUrl;
        }

        // 安全檢查：只允許特定圖片/影片格式和受信任的域名
        if (isSafeImageUrl(imageUrl)) {
          // 檢查是否已經存在相同媒體
          if (!imgContainer.querySelector(`img[data-gss-url="${imageUrl}"], video[data-gss-url="${imageUrl}"]`)) {
            const isVideo = /\.mp4$/i.test(imageUrl);
            let mediaElement;

            if (isVideo) {
              // 創建 video 元素
              mediaElement = document.createElement('video');
              mediaElement.src = imageUrl;
              mediaElement.alt = 'GSS-' + imageUrl;
              mediaElement.dataset.gssUrl = imageUrl;
              mediaElement.dataset.stickerId = 'GSS-' + imageUrl;
              mediaElement.className = 'dlsq-wtv-sticker dlsq-gss-video';
              mediaElement.style.cssText = 'max-width: 100px; max-height: 100px; border-radius: 4px;  border: 2px solid #FF9800;'; // 橙色邊框區分影片
              mediaElement.muted = true;
              mediaElement.autoplay = true;
              mediaElement.loop = true;
              mediaElement.playsInline = true;
            } else {
              // 創建 img 元素
              mediaElement = document.createElement('img');
              mediaElement.src = imageUrl;
              mediaElement.alt = 'GSS-' + imageUrl;
              mediaElement.dataset.gssUrl = imageUrl;
              mediaElement.dataset.stickerId = 'GSS-' + imageUrl;
              mediaElement.className = 'dlsq-wtv-sticker dlsq-gss-image';
              mediaElement.style.cssText = 'max-width: 100px; max-height: 100px; border-radius: 4px;  border: 2px solid #4CAF50;'; // 綠色邊框區分圖片
            }

            // 添加錯誤處理
            mediaElement.onerror = () => {
              console.warn('[GSS] 無法載入媒體:', imageUrl);
              mediaElement.style.border = '2px solid #f44336'; // 紅色邊框表示失敗
              // 顯示錯誤文字
              const errorText = document.createElement('span');
              errorText.textContent = '❌ 載入失敗';
              errorText.style.cssText = 'font-size: 10px; color: #f44336; display: block; text-align: center;';
              imgContainer.appendChild(errorText);
            };

            // 添加右鍵菜單（使用 capture 模式）
            mediaElement.addEventListener('contextmenu', (e) => {
              console.log('[GSS Debug] WTV GSS media contextmenu:', 'GSS-' + imageUrl, e.target);
              if (window.gssDisableNativeContextMenu) {
                console.log('[GSS Debug] WTV native contextmenu disabled');
                return;
              }
              console.log('[GSS Debug] WTV GSS preventing default and showing menu');
              e.preventDefault();
              e.stopPropagation();
              showContextMenuAt(e.clientX, e.clientY, 'GSS-' + imageUrl, mediaElement);
            }, true); // 使用 capture 模式

            // 添加點擊事件：點擊放大媒體
            mediaElement.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              // 創建放大圖片覆蓋層
              const overlay = document.createElement('div');
              overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0,0,0,0.9);
                z-index: 999999;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
              `;

              let largeMedia;
              if (isVideo) {
                // 創建放大影片
                largeMedia = document.createElement('video');
                largeMedia.src = imageUrl;
                largeMedia.controls = true;
                largeMedia.autoplay = true;
                largeMedia.loop = true;
                largeMedia.muted = true;
                largeMedia.style.cssText = `
                  max-width: 90vw;
                  max-height: 90vh;
                  object-fit: contain;
                  border-radius: 8px;
                `;
              } else {
                // 創建放大圖片
                largeMedia = document.createElement('img');
                largeMedia.src = imageUrl;
                largeMedia.style.cssText = `
                  max-width: 90vw;
                  max-height: 90vh;
                  object-fit: contain;
                  border-radius: 8px;
                `;
              }

              overlay.appendChild(largeMedia);
              document.body.appendChild(overlay);

              // 點擊關閉
              overlay.addEventListener('click', () => {
                document.body.removeChild(overlay);
              });
            });

            imgContainer.appendChild(mediaElement);
          }
        } else {
          console.warn('[GSS] 不安全的圖片連結被阻止:', imageUrl);
        }
      });
    }

    // 8. 【重要】只隱藏貼圖 ID 部分，保留其他文字（如用戶名字）
    // 使用包裝器隱藏文本節點，避免影響其他元素
    if (textNode && (imMatch || meMatch || dlMatch || ytMatch || cbMatch || gssMatch)) {
      // 創建一個包裝器來隱藏文本節點
      const wrapper = document.createElement('span');
      wrapper.style.cssText = 'font-size: 0; line-height: 0; opacity: 0; display: inline-block; width: 0; height: 0; overflow: hidden; visibility: hidden;';
      wrapper.className = 'dlsq-wtv-text-wrapper';

      // 將文本節點移到包裝器中
      textNode.parentNode.insertBefore(wrapper, textNode);
      wrapper.appendChild(textNode);
    }
  });

  if (processedCount > 0) {
    console.log('[GSS] WTV processed', processedCount, 'messages');
  }
}

// 右鍵 imgur 圖片發送功能
function getImageUrlFromTarget(target) {
  if (!target) return null;
  if (target.tagName === 'IMG' && target.src) return target.src;
  if (target.tagName === 'VIDEO' && target.src) return target.src;
  const img = target.closest?.('img');
  if (img?.src) return img.src;
  const video = target.closest?.('video');
  if (video?.src) return video.src;
  return null;
}

function extractImgurId(url, useTwitchFormat = false) {
  if (!url) return null;
  const match = url.match(/(?:i\.)?imgur\.com\/([a-zA-Z0-9]+)(?:\.(gif|png|jpg|jpeg|mp4))?/i);
  if (!match) return null;
  const id = match[1];
  const ext = match[2] || 'gif'; // 默認 gif
  if (useTwitchFormat) {
    // Twitch 格式：IM-ha3eTC7-gif（用 - 代替 .）
    return `${id}-${ext}`;
  }
  // 標準格式：ha3eTC7.gif
  return ext === 'gif' ? id : `${id}.${ext}`;
}

function extractMeeeId(url, useTwitchFormat = false) {
  if (!url) return null;
  const match = url.match(/meee\.com\.tw\/([a-zA-Z0-9]+)(?:\.(gif|png|jpg|jpeg|mp4))?/i);
  if (!match) return null;
  const id = match[1];
  const ext = match[2] || 'jpg'; // 默認 jpg
  if (useTwitchFormat) {
    // Twitch 格式：ME-43XNR9K-jpg（用 - 代替 .）
    return `${id}-${ext}`;
  }
  // 標準格式：43XNR9K.jpg
  return `${id}.${ext}`;
}

// 初始化 IM 功能
// 全局標誌：是否正在發送消息（用於暫停 IM 轉圖掃描）
let isSendingMessage = false;

function initIMFeature() {
  // 【修復】Twitch、Vaughn、Kick、WTV 分開處理
  const isTwitchPage = window.location.hostname.includes('twitch.tv');
  const isVaughnPage = window.location.hostname.includes('vaughn.live');
  const isKickPage = window.location.hostname.includes('kick.com');
  const isWTVPage = window.location.hostname.includes('w.tv');

  if (isVaughnPage) {
    // ===== Vaughn 頁面：使用 IM 轉圖邏輯 =====
    setInterval(() => {
      if (!isSendingMessage) scanAndReplaceIMImages();
    }, 1500);

    const chatContainer = document.querySelector('.vs_chatv9, .vs_chat_container, [class*="chat"]');
    if (chatContainer) {
      let mutationTimeout = null;
      const observer = new MutationObserver((mutations) => {
        if (isSendingMessage) return;
        if (mutationTimeout) clearTimeout(mutationTimeout);
        mutationTimeout = setTimeout(() => {
          mutationTimeout = null;
          const hasNewMessages = mutations.some(m => {
            return Array.from(m.addedNodes).some(n => {
              return n.nodeType === Node.ELEMENT_NODE && (
                n.matches?.('[class*="message"]') ||
                n.querySelector?.('[class*="message"]') ||
                n.matches?.('[class*="chat"]') ||
                n.querySelector?.('[class*="chat"]')
              );
            });
          });
          if (hasNewMessages) scanAndReplaceIMImages();
        }, 100);
      });
      observer.observe(chatContainer, { childList: true, subtree: true });
    }
  } else if (isKickPage) {
    // ===== Kick 頁面：專門的 IM 轉圖邏輯 =====
    console.log('[GSS] Kick IM feature initializing');
    setInterval(() => {
      if (!isSendingMessage) {
        console.log('[GSS] Kick scanning for IM images...');
        scanAndReplaceIMImages();
      }
    }, 1500);

    // Kick 的聊天容器選擇器
    const chatContainer = document.querySelector('[class*="chat-container"], [class*="ChatContainer"], #chat-input-wrapper ~ div, [class*="overflow-y-auto"]');
    console.log('[GSS] Kick chat container found:', !!chatContainer);
    if (chatContainer) {
      let mutationTimeout = null;
      const observer = new MutationObserver((mutations) => {
        if (isSendingMessage) return;
        if (mutationTimeout) clearTimeout(mutationTimeout);
        mutationTimeout = setTimeout(() => {
          mutationTimeout = null;
          const hasNewMessages = mutations.some(m => {
            return Array.from(m.addedNodes).some(n => {
              return n.nodeType === Node.ELEMENT_NODE && (
                n.matches?.('[class*="message"]') ||
                n.querySelector?.('[class*="message"]') ||
                n.textContent?.match?.(/(IM-|ME-|YT-|DL-)/)
              );
            });
          });
          if (hasNewMessages) {
            console.log('[GSS] Kick new messages detected, scanning...');
            scanAndReplaceIMImages();
            // 【修復】KICK 平台額外檢查其他格式貼圖
            setTimeout(() => {
              scanAndReplaceMEImages();
              scanAndReplaceYTImages();
              scanAndReplaceCBImages();
              scanAndReplaceGSSImages();
            }, 200);
          }
        }, 100);
      });
      observer.observe(chatContainer, { childList: true, subtree: true });
    }
  } else if (isWTVPage) {
    // ===== WTV 頁面：專門的 IM 轉圖邏輯（避免 React 重新渲染問題）=====
    console.log('[GSS] WTV IM feature initializing with anti-React-reset protection');

    // WTV 專用：使用 requestAnimationFrame 批次處理，減少 React 干擾
    let wtvProcessingQueue = [];
    let isWTVProcessing = false;
    let wtvScrollTimeout = null;
    let isWTVScrolling = false;

    // 監聽卷軸事件，暫停處理
    const wtvChatContainer = document.querySelector('[data-chat-scroll-container]');
    if (wtvChatContainer) {
      wtvChatContainer.addEventListener('scroll', () => {
        isWTVScrolling = true;
        clearTimeout(wtvScrollTimeout);
        wtvScrollTimeout = setTimeout(() => {
          isWTVScrolling = false;
        }, 200); // 卷軸停止 200ms 後恢復處理
      }, { passive: true });
    }

    // WTV 專用轉圖函數
    function processWTVQueue() {
      if (isWTVProcessing || isWTVScrolling || isSendingMessage) return;
      isWTVProcessing = true;

      // 使用 requestAnimationFrame 批次處理
      requestAnimationFrame(() => {
        try {
          scanAndReplaceWTVImages();
        } finally {
          isWTVProcessing = false;
        }
      });
    }

    // 定期掃描（使用較長間隔，減少 React 壓力）
    setInterval(() => {
      if (!isSendingMessage && !isWTVScrolling) {
        processWTVQueue();
      }
    }, 2000); // WTV 使用 2 秒間隔，比 DLive 更長

    // MutationObserver 監聽新訊息
    if (wtvChatContainer) {
      let wtvMutationTimeout = null;
      const wtvObserver = new MutationObserver((mutations) => {
        if (isSendingMessage || isWTVScrolling) return;

        // 檢查是否為新訊息
        const hasNewMessages = mutations.some(m => {
          return Array.from(m.addedNodes).some(n => {
            return n.nodeType === Node.ELEMENT_NODE && (
              n.matches?.('[data-testid="chat-message-container"]') ||
              n.querySelector?.('[data-testid="chat-message-container"]')
            );
          });
        });

        if (hasNewMessages) {
          clearTimeout(wtvMutationTimeout);
          wtvMutationTimeout = setTimeout(() => {
            if (!isWTVScrolling) {
              processWTVQueue();
            }
          }, 300); // 延遲 300ms 等待 React 渲染完成
        }
      });

      wtvObserver.observe(wtvChatContainer, { childList: true, subtree: true });
      console.log('[GSS] WTV MutationObserver attached');
    }

  } else if (!isTwitchPage) {
    // ===== DLive 頁面：完整 IM 轉圖功能 =====
    setInterval(() => {
      if (!isSendingMessage) scanAndReplaceIMImages();
    }, 1500);

    const chatContainer = document.querySelector('.chat-list, .chat-scroll-area, [class*="chat-list"], [class*="message-list"]');
    if (chatContainer) {
      let mutationTimeout = null;
      const observer = new MutationObserver((mutations) => {
        if (isSendingMessage) return;
        if (mutationTimeout) clearTimeout(mutationTimeout);
        mutationTimeout = setTimeout(() => {
          mutationTimeout = null;
          const hasNewMessages = mutations.some(m => {
            return Array.from(m.addedNodes).some(n => {
              return n.nodeType === Node.ELEMENT_NODE && (
                n.matches?.('[class*="message"]') ||
                n.querySelector?.('[class*="message"]')
              );
            });
          });
          if (hasNewMessages) scanAndReplaceIMImages();
        }, 100);
      });
      observer.observe(chatContainer, { childList: true, subtree: true });
    }
  } else {
    // ===== Twitch 頁面：只處理聊天消息列表，完全避開輸入框區域 =====
    // 延遲啟動，等待頁面完全渲染
    setTimeout(() => {
      initTwitchIMFeature();
    }, 3000); // 增加到 3 秒延遲，確保 Twitch 完全載入
  }

  // 右鍵 imgur/meee 圖片選單（所有頁面）
  document.addEventListener('contextmenu', (e) => {
    // 如果設置為禁用 GSS 右鍵面板，則不攔截
    if (window.gssDisableNativeContextMenu) return;

    const url = getImageUrlFromTarget(e.target);
    if (!url) return;

    // 檢查是否為 imgur 或 meee 圖片
    const imgurId = extractImgurId(url);
    const meeeId = extractMeeeId(url);

    if (!imgurId && !meeeId) return;

    e.preventDefault();

    // 【Twitch 格式】使用 -gif/-jpg 格式（用 - 代替 .）
    // 【KICK 格式】使用原始 . 格式
    const isTwitchPage = window.location.hostname.includes('twitch.tv');
    const isKickPage = window.location.hostname.includes('kick.com');
    const useDashFormat = isTwitchPage; // 只有 Twitch 使用 - 代替 .
    let id;
    if (imgurId) {
      id = 'IM-' + extractImgurId(url, useDashFormat);
    } else {
      id = 'ME-' + extractMeeeId(url, useDashFormat);
    }
    showContextMenuAt(e.clientX, e.clientY, id, e.target);
  }, true);
}

// ===== Twitch 專用的 IM 轉圖功能 =====
let twitchIMFeatureInitialized = false;
let twitchIMRetryCount = 0;
const MAX_TWITCH_RETRY = 10;

function initTwitchIMFeature() {
  if (twitchIMFeatureInitialized) return;

  // 更完整的選擇器，支援不同 Twitch 頻道佈局
  const selectors = [
    '.chat-scrollable-area__message-container',           // 【修正】Twitch 實際容器
    '[data-test-selector="chat-scrollable-area__message-container"]', // 【修正】data-test-selector
    '.chat-list',
    '[data-a-target="chat-list"]',
    '.chat-scroll-area',
    '[class*="chat-list"]',
    '[class*="ChatList"]',
    '.chat-room__content',
    '[data-test-selector="chat-room-component"]',
    '[data-a-target="chat-room"]',
    '.stream-chat',
    '[class*="stream-chat"]'
  ];

  let chatList = null;
  for (const selector of selectors) {
    chatList = document.querySelector(selector);
    if (chatList) break;
  }

  if (!chatList) {
    // 如果找不到聊天列表，增加重試次數並延遲重試
    twitchIMRetryCount++;
    if (twitchIMRetryCount < MAX_TWITCH_RETRY) {
      setTimeout(() => {
        initTwitchIMFeature();
      }, 3000); // 每 3 秒重試一次
    }
    return;
  }

  twitchIMFeatureInitialized = true;

  // 只在聊天列表內掃描，不掃描整個 body
  setInterval(() => {
    if (!isSendingMessage) {
      scanTwitchChatMessages(chatList);
    }
  }, 2000); // Twitch 用較長間隔，減少衝突

  // 只在聊天列表上監聽變化
  let mutationTimeout = null;
  const observer = new MutationObserver((mutations) => {
    // 發送消息期間暫停
    if (isSendingMessage) return;

    // 檢查是否有新增消息
    const hasNewMessages = mutations.some(m => {
      return Array.from(m.addedNodes).some(n => {
        return n.nodeType === Node.ELEMENT_NODE && (
          n.matches?.('[class*="chat-line"], [data-a-target="chat-line-message"], [class*="message"]') ||
          n.querySelector?.('[class*="chat-line"], [data-a-target="chat-line-message"]')
        );
      });
    });

    if (hasNewMessages) {
      if (mutationTimeout) clearTimeout(mutationTimeout);
      mutationTimeout = setTimeout(() => {
        mutationTimeout = null;
        scanTwitchChatMessages(chatList);
      }, 200);
    }
  });

  observer.observe(chatList, { childList: true, subtree: true });
}

// Twitch 專用的聊天消息掃描
function scanTwitchChatMessages(chatContainer) {
  // 更廣泛的消息選擇器，支援不同 Twitch 頻道佈局
  const messageSelectors = [
    '[class*="chat-line"]',
    '[data-a-target="chat-line-message"]',
    '.chat-message',
    '[class*="message-content"]',
    '[class*="chat-room-content"]',
    '[class*="stream-chat-message"]',
    '[data-testid="chat-message"]',
    '.chat-scroll-content > div > div',
    '[class*="chat-list"] > div > div',
    '[class*="chat-log"] > div'
  ];

  let messageElements = [];
  for (const selector of messageSelectors) {
    const elements = chatContainer.querySelectorAll(selector);
    if (elements.length > 0) {
      messageElements = elements;
      break;
    }
  }

  // 如果都找不到，嘗試更深層掃描
  if (messageElements.length === 0) {
    messageElements = chatContainer.querySelectorAll('div[role="log"] > div, div[class] > div[class]:not([class*="input"]):not([class*="Input"])');
  }

  messageElements.forEach(msgEl => {
    // 【關鍵】跳過任何靠近輸入框的元素
    if (msgEl.closest('[data-a-target="chat-input"], [class*="chat-input"], [contenteditable="true"], [class*="input"], textarea')) {
      return;
    }

    // 跳過已處理過的（檢查是否已有轉換後的圖片或標記）
    if (msgEl.querySelector('.gss-im-replaced, .gss-im-image, .gss-im-converted')) return;
    if (msgEl.dataset.gssImProcessed === 'true') return;

    // 查找消息中的文本節點
    const walker = document.createTreeWalker(
      msgEl,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    // 按父元素分組收集文本節點（用於合併被分割的 URL）
    const parentGroups = new Map();
    let node;
    while (node = walker.nextNode()) {
      // 確保不是輸入框內的節點
      if (node.parentElement?.closest('[contenteditable="true"], [data-a-target="chat-input"], [class*="chat-input"], textarea')) {
        continue;
      }

      const text = node.textContent;
      // 檢查可能包含貼圖或 YouTube 鏈接的文本
      if (text.includes('IM-') || text.includes('ME-') || text.includes('DL-') || text.includes('YT-') ||
        text.includes('youtube.com/watch') || text.includes('youtube.com/shorts') || text.includes('youtu.be/') ||
        text.includes('http') || // 可能是不完整的 URL 片段
        /[\u200B\u200C\u200D\uFEFF]/.test(text)) {

        const parent = node.parentNode;
        if (!parentGroups.has(parent)) {
          parentGroups.set(parent, []);
        }
        parentGroups.get(parent).push(node);
      }
    }

    // 處理每個父元素下的文本節點組
    let hasProcessed = false;
    parentGroups.forEach((nodes, parent) => {
      // 嘗試合併相鄰文本節點來檢查是否包含完整的貼圖/URL
      if (nodes.length > 1) {
        // 按文檔順序排序
        nodes.sort((a, b) => {
          const pos = a.compareDocumentPosition(b);
          return pos & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
        });

        // 合併所有文本內容
        const mergedText = nodes.map(n => n.textContent).join('');

        // 檢查合併後的文本是否包含完整的貼圖或 YouTube 鏈接（從頭匹配，最少6字符）
        const hasSticker = /\bIM-[a-zA-Z0-9-]{3,}|\bME-[a-zA-Z0-9-]{3,}|\bDL-[a-zA-Z0-9_]{3,}|\bYT-[a-zA-Z0-9_-]{3,}/i.test(mergedText);
        const hasYouTube = /youtube\.com\/watch\?v=|youtube\.com\/shorts\/|youtu\.be\//i.test(mergedText);

        if (hasSticker || hasYouTube) {
          // 創建一個臨時的合併文本節點來處理
          const mergedNode = document.createTextNode(mergedText);
          // 保存原始節點引用以便替換
          mergedNode._originalNodes = nodes;
          const result = processTwitchMergedTextNode(mergedNode, msgEl, nodes);
          if (result) hasProcessed = true;
          return;
        }
      }

      // 單個節點直接處理
      nodes.forEach(textNode => {
        const result = processTwitchIMTextNode(textNode, msgEl);
        if (result) hasProcessed = true;
      });
    });

    // 標記已處理
    if (hasProcessed || parentGroups.size > 0) {
      msgEl.dataset.gssImProcessed = 'true';
    }

    // 【關鍵】Twitch 圖片插入後觸發卷軸滾動
    if (hasProcessed) {
      // 【修正】使用 scrollIntoView 而不是操作 scrollable-area
      // 找到消息容器內的圖片元素
      const imgEl = msgEl.querySelector('.gss-im-replaced, .dlsq-chat-img, img[src*="imgur"], img[src*="dlivecdn"], img[src*="youtube"]');
      if (imgEl) {
        // 檢查用戶是否在底部附近
        const scrollableArea = document.querySelector('.scrollable-area');
        if (scrollableArea) {
          const distanceToBottom = scrollableArea.scrollHeight - scrollableArea.scrollTop - scrollableArea.clientHeight;
          if (distanceToBottom <= 200) { // 用戶在底部附近才滾動
            imgEl.scrollIntoView({ behavior: 'auto', block: 'end' });
            console.log('[GSS] Twitch scrolled to image');
          }
        }
      }
    }
  });
}

// 處理合併後的 Twitch 聊天消息文本（用於處理被分割的 URL）
function processTwitchMergedTextNode(mergedNode, messageEl, originalNodes) {
  const text = mergedNode.textContent;
  let processed = false;

  // 【優先】處理 IM/ME/DL 格式（從頭匹配，最少6字符）
  const combinedRegex = /(\bIM-[a-zA-Z0-9-]{3,}(?:[.-](?:gif|png|jpg|jpeg|mp4))?)|(\bME-[a-zA-Z0-9-]{3,}(?:[.-](?:gif|png|jpg|jpeg|mp4))?)|(\bDL-[a-zA-Z0-9_]{3,})/gi;
  const matches = [];
  let m;
  while ((m = combinedRegex.exec(text)) !== null) {
    if (m[1]) matches.push({ type: 'IM', id: m[1], index: m.index, length: m[1].length });
    else if (m[2]) matches.push({ type: 'ME', id: m[2], index: m.index, length: m[2].length });
    else if (m[3]) matches.push({ type: 'DL', id: m[3], index: m.index, length: m[3].length });
  }

  if (matches.length > 0) {
    const firstNode = originalNodes[0];
    const parent = firstNode.parentNode;
    if (parent) {
      matches.reverse().forEach(match => {
        const img = createIMImage(match.id);
        if (img) {
          const before = text.slice(0, match.index);
          const after = text.slice(match.index + match.length);

          const fragment = document.createDocumentFragment();
          if (before) fragment.appendChild(document.createTextNode(before));
          fragment.appendChild(img);
          if (after) fragment.appendChild(document.createTextNode(after));

          originalNodes.forEach(n => { if (n.parentNode) n.parentNode.removeChild(n); });
          parent.appendChild(fragment);
          parent.classList.add('gss-im-converted');
          processed = true;
        }
      });
    }
    if (processed) return true;
  }

  // 【統一格式】YT- 智能模式：自動檢測 Shorts 並給予適當顯示
  const ytRegex = /\bYT-[a-zA-Z0-9_-]{3,}\b/gi;
  let ytMatch;
  const ytMatches = [];
  while ((ytMatch = ytRegex.exec(text)) !== null) {
    ytMatches.push({ id: ytMatch[0], index: ytMatch.index, length: ytMatch[0].length });
  }

  if (ytMatches.length > 0) {
    ytMatches.reverse().forEach(match => {
      const videoId = match.id.slice(3);
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;

      const thumbContainer = document.createElement('span');
      thumbContainer.className = 'gss-im-replaced gss-yt-thumbnail';
      thumbContainer.style.cssText = 'cursor: pointer; display: block; position: relative;';
      thumbContainer.title = '點擊播放 YouTube 視頻';

      const img = document.createElement('img');
      img.src = thumbnailUrl;
      img.alt = match.id;
      img.className = 'dlsq-converted-image dlsq-chat-yt';
      img.onerror = () => {
        img.style.display = 'none';
        const fallback = document.createElement('span');
        fallback.textContent = '🎬 ' + match.id;
        fallback.style.cssText = 'color: #666; font-size: 12px;';
        thumbContainer.appendChild(fallback);
      };

      const playBtn = document.createElement('span');
      playBtn.innerHTML = '▶';
      playBtn.style.cssText = `
        position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
        width: 40px; height: 40px; background: rgba(255,0,0,0.85); border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        color: #fff; font-size: 16px; padding-left: 3px; pointer-events: none;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      `;

      thumbContainer.appendChild(img);
      thumbContainer.appendChild(playBtn);
      thumbContainer.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation(); openYouTubePlayer(videoId);
      });

      // 替換原始節點
      const firstNode = originalNodes[0];
      const parent = firstNode.parentNode;
      if (parent) {
        const before = text.slice(0, match.index);
        const after = text.slice(match.index + match.length);

        const fragment = document.createDocumentFragment();
        if (before) fragment.appendChild(document.createTextNode(before));
        fragment.appendChild(thumbContainer);
        if (after) fragment.appendChild(document.createTextNode(after));

        // 移除所有原始節點
        originalNodes.forEach(n => { if (n.parentNode) n.parentNode.removeChild(n); });
        parent.appendChild(fragment);
        parent.classList.add('gss-im-converted');
        processed = true;
      }
    });
    if (processed) return true;
  }

  // 處理完整 YouTube URL
  const ytUrlRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtube\.com\/shorts\/|youtu\.be\/)([a-zA-Z0-9_-]+)(?:[&?][^\s]*)?/gi;
  let ytUrlMatch;
  const ytUrlMatches = [];
  while ((ytUrlMatch = ytUrlRegex.exec(text)) !== null) {
    ytUrlMatches.push({ fullUrl: ytUrlMatch[0], videoId: ytUrlMatch[1], index: ytUrlMatch.index, length: ytUrlMatch[0].length });
  }

  if (ytUrlMatches.length > 0) {
    ytUrlMatches.reverse().forEach(match => {
      const thumbnailUrl = `https://img.youtube.com/vi/${match.videoId}/mqdefault.jpg`;

      const thumbContainer = document.createElement('span');
      thumbContainer.className = 'gss-im-replaced gss-yt-thumbnail';
      thumbContainer.style.cssText = 'cursor: pointer; display: block; position: relative;';
      thumbContainer.title = '點擊播放 YouTube 視頻';

      const img = document.createElement('img');
      img.src = thumbnailUrl;
      img.alt = match.fullUrl;
      img.className = 'dlsq-converted-image dlsq-chat-yt';
      img.onerror = () => {
        img.style.display = 'none';
        const fallback = document.createElement('span');
        fallback.textContent = '🎬 ' + match.fullUrl;
        fallback.style.cssText = 'color: #666; font-size: 12px;';
        thumbContainer.appendChild(fallback);
      };

      const playBtn = document.createElement('span');
      playBtn.innerHTML = '▶';
      playBtn.style.cssText = `
        position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
        width: 40px; height: 40px; background: rgba(255,0,0,0.85); border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        color: #fff; font-size: 14px; padding-left: 3px; pointer-events: none;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      `;

      thumbContainer.appendChild(img);
      thumbContainer.appendChild(playBtn);
      thumbContainer.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation(); openYouTubePlayer(match.videoId);
      });

      const firstNode = originalNodes[0];
      const parent = firstNode.parentNode;
      if (parent) {
        const before = text.slice(0, match.index);
        const after = text.slice(match.index + match.length);

        const fragment = document.createDocumentFragment();
        if (before) fragment.appendChild(document.createTextNode(before));
        fragment.appendChild(thumbContainer);
        if (after) fragment.appendChild(document.createTextNode(after));

        originalNodes.forEach(n => { if (n.parentNode) n.parentNode.removeChild(n); });
        parent.appendChild(fragment);
        parent.classList.add('gss-im-converted');
        processed = true;
      }
    });
    if (processed) return true;
  }

  return false;
}

// 處理 Twitch 聊天消息中的 IM 文本
function processTwitchIMTextNode(textNode, messageEl) {
  const text = textNode.textContent;

  // 檢查零寬字符（隱藏貼圖）
  const zwChars = text.match(/[\u200B\u200C\u200D\uFEFF]/g);
  if (zwChars && zwChars.length >= 8) {
    try {
      const decoded = decodeFromZeroWidth(zwChars.join(''));
      if (decoded && (decoded.startsWith('IM-') || decoded.startsWith('ME-') || decoded.startsWith('DL-'))) {
        // 創建圖片元素替換文字
        const img = createIMImage(decoded);
        if (img) {
          // 使用更安全的方式：隱藏原文字，插入圖片
          const span = document.createElement('span');
          span.className = 'gss-im-image';
          span.appendChild(img);

          try {
            const parent = textNode.parentNode;
            if (parent && document.contains(textNode)) {
              parent.insertBefore(span, textNode);
              parent.removeChild(textNode);
              parent.classList.add('gss-im-converted');
              return true;
            }
          } catch (e) {
            // 忽略錯誤
          }
        }
      }
    } catch (e) {
      // 忽略解碼錯誤
    }
    return false;
  }

  // 【優先】處理 IM/ME/DL 格式（從頭匹配，最少6字符）
  const combinedRegex = /(\bIM-[a-zA-Z0-9-]{3,}(?:[.-](?:gif|png|jpg|jpeg|mp4))?)|(\bME-[a-zA-Z0-9-]{3,}(?:[.-](?:gif|png|jpg|jpeg|mp4))?)|(\bDL-[a-zA-Z0-9_]{3,})/gi;
  const matches = [];
  let m;
  while ((m = combinedRegex.exec(text)) !== null) {
    if (m[1]) matches.push({ type: 'IM', id: m[1], index: m.index, length: m[1].length });
    else if (m[2]) matches.push({ type: 'ME', id: m[2], index: m.index, length: m[2].length });
    else if (m[3]) matches.push({ type: 'DL', id: m[3], index: m.index, length: m[3].length });
  }

  if (matches.length > 0) {
    let replaced = false;
    matches.reverse().forEach(match => {
      const img = createIMImage(match.id);
      if (img && textNode.parentNode) {
        try {
          const parent = textNode.parentNode;
          const before = text.slice(0, match.index);
          const after = text.slice(match.index + match.length);

          const fragment = document.createDocumentFragment();
          if (before) fragment.appendChild(document.createTextNode(before));
          fragment.appendChild(img);
          if (after) fragment.appendChild(document.createTextNode(after));

          parent.replaceChild(fragment, textNode);
          parent.classList.add('gss-im-converted');
          replaced = true;
        } catch (e) {
          // 忽略錯誤
        }
      }
    });
    if (replaced) return true;
  }

  // 【其次】處理 YT- 格式（從頭匹配，最少6字符）
  const ytRegex = /\bYT-[a-zA-Z0-9_-]{3,}\b/gi;
  const ytMatches = [];
  let ytMatch;
  while ((ytMatch = ytRegex.exec(text)) !== null) {
    ytMatches.push({ type: 'YT', id: ytMatch[0], index: ytMatch.index, length: ytMatch[0].length });
  }

  // 處理找到的 YT- 匹配
  if (ytMatches.length > 0) {
    ytMatches.reverse().forEach(match => {
      const videoId = match.id.slice(3); // 移除 "YT-" 前綴
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;

      // 創建縮略圖容器
      const thumbContainer = document.createElement('span');
      thumbContainer.className = 'gss-im-replaced gss-yt-thumbnail';
      thumbContainer.style.cssText = 'cursor: pointer; display: block; position: relative;';
      thumbContainer.title = '點擊播放 YouTube 視頻';

      // 創建縮略圖圖片
      const img = document.createElement('img');
      img.src = thumbnailUrl;
      img.alt = match.id;
      img.className = 'dlsq-converted-image dlsq-chat-yt';
      img.onerror = () => {
        img.style.display = 'none';
        const fallback = document.createElement('span');
        fallback.textContent = '🎬 ' + match.id;
        fallback.style.cssText = 'color: #666; font-size: 12px;';
        thumbContainer.appendChild(fallback);
      };

      // 創建播放按鈕圖標
      const playBtn = document.createElement('span');
      playBtn.innerHTML = '▶';
      playBtn.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 40px;
        height: 40px;
        background: rgba(255,0,0,0.85);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 16px;
        padding-left: 3px;
        pointer-events: none;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      `;

      thumbContainer.appendChild(img);
      thumbContainer.appendChild(playBtn);

      // 點擊打開 YouTube 播放器
      thumbContainer.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openYouTubePlayer(videoId);
      });

      // 替換文本節點
      if (textNode.parentNode) {
        try {
          const parent = textNode.parentNode;
          const before = text.slice(0, match.index);
          const after = text.slice(match.index + match.length);

          const fragment = document.createDocumentFragment();
          if (before) fragment.appendChild(document.createTextNode(before));
          fragment.appendChild(thumbContainer);
          if (after) fragment.appendChild(document.createTextNode(after));

          parent.replaceChild(fragment, textNode);
          parent.classList.add('gss-im-converted');
        } catch (e) {
          // 忽略錯誤
        }
      }
    });
    return true; // 已處理 YT-，不再處理其他格式
  }

  // 【Twitch 專用】處理完整 YouTube URL
  const ytUrlRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtube\.com\/shorts\/|youtu\.be\/)([a-zA-Z0-9_-]+)(?:[&?][^\s]*)?/gi;
  const ytUrlMatches = [];
  let ytUrlMatch;
  while ((ytUrlMatch = ytUrlRegex.exec(text)) !== null) {
    ytUrlMatches.push({ fullUrl: ytUrlMatch[0], videoId: ytUrlMatch[1], index: ytUrlMatch.index, length: ytUrlMatch[0].length });
  }

  if (ytUrlMatches.length > 0) {
    ytUrlMatches.reverse().forEach(match => {
      const thumbnailUrl = `https://img.youtube.com/vi/${match.videoId}/mqdefault.jpg`;

      const thumbContainer = document.createElement('span');
      thumbContainer.className = 'gss-im-replaced gss-yt-thumbnail';
      thumbContainer.style.cssText = 'cursor: pointer; display: block; position: relative;';
      thumbContainer.title = '點擊播放 YouTube 視頻';

      const img = document.createElement('img');
      img.src = thumbnailUrl;
      img.alt = match.fullUrl;
      img.className = 'dlsq-converted-image dlsq-chat-yt';
      img.onerror = () => {
        img.style.display = 'none';
        const fallback = document.createElement('span');
        fallback.textContent = '🎬 ' + match.fullUrl;
        fallback.style.cssText = 'color: #666; font-size: 12px;';
        thumbContainer.appendChild(fallback);
      };

      const playBtn = document.createElement('span');
      playBtn.innerHTML = '▶';
      playBtn.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 40px;
        height: 40px;
        background: rgba(255,0,0,0.85);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 14px;
        padding-left: 3px;
        pointer-events: none;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      `;

      thumbContainer.appendChild(img);
      thumbContainer.appendChild(playBtn);

      thumbContainer.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openYouTubePlayer(match.videoId);
      });

      if (textNode.parentNode) {
        try {
          const parent = textNode.parentNode;
          const before = text.slice(0, match.index);
          const after = text.slice(match.index + match.length);

          const fragment = document.createDocumentFragment();
          if (before) fragment.appendChild(document.createTextNode(before));
          fragment.appendChild(thumbContainer);
          if (after) fragment.appendChild(document.createTextNode(after));

          parent.replaceChild(fragment, textNode);
          parent.classList.add('gss-im-converted');
        } catch (e) {
          // 忽略錯誤
        }
      }
    });
    // 【標記】給消息容器添加標記，防止 React/KICK 重置 DOM 後重複處理
    const msgContainer5 = textNode.parentElement?.closest('[class*="message"], [class*="chat-line"], [class*="ChatMessage"]');
    if (msgContainer5) msgContainer5.classList.add('dlsq-message-processed');
    return true; // 已處理 YouTube URL
  }

  return false;
}

// Twitch 專用：卷軸滾動到底部
function scrollTwitchChatToBottom() {
  // Twitch 聊天容器選擇器（卷軸滾動用）
  const selectors = [
    '.scrollable-area', // 【修正】Twitch 真正可滾動的容器
    '.chat-list',
    '[data-a-target="chat-list"]',
    '.chat-scroll-area',
    '[class*="chat-list"]',
    '[class*="ChatList"]',
    '.chat-room__content',
    '[data-test-selector="chat-room-component"]',
    '[data-a-target="chat-room"]',
    '.stream-chat',
    '[class*="stream-chat"]'
  ];

  let chatContainer = null;
  for (const selector of selectors) {
    chatContainer = document.querySelector(selector);
    if (chatContainer) break;
  }

  if (!chatContainer) return;

  // 檢查用戶是否在底部附近（超過 200px 不滾動，避免打擾用戶看歷史消息）
  const distanceToBottom = chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight;
  if (distanceToBottom > 200) return;

  // 使用 scrollTo 滾動到底部（Twitch 的 React 需要這種方式）
  const targetScroll = chatContainer.scrollHeight;
  chatContainer.scrollTo({ top: targetScroll, behavior: 'auto' });

  // 觸發 scroll 事件讓 React 更新狀態
  chatContainer.dispatchEvent(new Event('scroll', { bubbles: true }));
  window.dispatchEvent(new Event('scroll', { bubbles: true }));

  // 延遲再次滾動確保渲染完成
  setTimeout(() => {
    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: 'auto' });
  }, 100);
}

// 【關鍵】將函數掛載到全局，確保 scanTwitchChatMessages 可以調用
window.scrollTwitchChatToBottom = scrollTwitchChatToBottom;

// 創建 IM/ME 圖片/視頻元素（根據類型自動選擇 img 或 video）
function createIMImage(imId) {
  const isDL = imId.startsWith('DL-');
  const isME = imId.startsWith('ME-');

  if (isDL) {
    const dlId = imId.slice(3);
    const img = document.createElement('img');
    img.src = `https://images.prd.dlivecdn.com/emote/${dlId}`;
    img.alt = imId;
    img.className = 'gss-im-replaced dlsq-chat-img';
    return img;
  }

  // IM 或 ME 貼圖：先解碼 URL 判斷類型
  let url;
  if (isME) {
    url = MEKP.decode(imId);
  } else {
    url = DKIP.decode(imId);
  }
  if (!url) return null;

  // 檢查是否為視頻（.mp4）
  const isVideo = /\.mp4$/i.test(url) || imId.toLowerCase().endsWith('-mp4') || imId.toLowerCase().endsWith('.mp4');

  if (isVideo) {
    // 創建 video 元素
    const video = document.createElement('video');
    video.src = url;
    video.alt = imId;
    video.muted = true;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;
    video.className = 'gss-im-replaced dlsq-chat-video';
    return video;
  } else {
    // 創建 img 元素
    const img = document.createElement('img');
    img.src = url;
    img.alt = imId;
    img.className = 'gss-im-replaced dlsq-chat-img';
    return img;
  }
}

function findTitleArea() {
  // 找標題/直播資訊區域 - DLive 使用 #livestream-info 或 .livestream-info
  const selectors = [
    '#livestream-info',
    '.livestream-info',
    '.living-duration',
    '.stream-title',
    '[class*="livestream-info"]',
    '[class*="living-duration"]',
  ];

  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el) {
      return el;
    }
  }

  // 備選：找包含特定文字的區域（排除已隱藏的）
  const allDivs = document.querySelectorAll('div');
  for (const div of allDivs) {
    const text = div.textContent || '';
    const style = window.getComputedStyle(div);
    // 找包含直播資訊且可見的區域
    if ((text.includes('直播中') || text.includes('LIVE') || text.includes('觀看'))
      && div.offsetHeight > 30
      && div.offsetHeight < 300
      && style.display !== 'none') {
      return div;
    }
  }

  return null;
}

function findDonationArea() {
  // 找課金區域
  const selectors = [
    '.donation-wrapper',
    '.donation-box',
    '[class*="donation"]',
    '[class*="donate"]',
  ];

  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el) return el;
  }

  // 備選：找包含特定文字的區域
  const allDivs = document.querySelectorAll('div');
  for (const div of allDivs) {
    const text = div.textContent?.toLowerCase() || '';
    if ((text.includes('donate') || text.includes('課金') || text.includes('贊助')) && div.offsetHeight > 50) {
      return div;
    }
  }

  return null;
}

function findChatArea() {
  const selectors = ['.chatroom-right', '[class*="chatroom"]', '.chat-room', '.chat-container'];
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el) return el;
  }
  return null;
}

function findSidebar() {
  return document.querySelector('.sidebar');
}

function findNavbar() {
  const navbar = document.querySelector('.nav-bar');
  // 返回父元素，這樣隱藏時可以移除整個頂部區域
  return navbar?.parentElement || navbar;
}

// ==================== 全螢幕聊天室功能 ====================
let fullscreenChatActive = false;
let fullscreenChatClone = null;
let fullscreenScrollSyncInterval = null;
let blackBgActiveFix1 = false;

// 初始化全螢幕聊天室功能
function initFullscreenChat() {
  // 監聽全螢幕變化
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.addEventListener('mozfullscreenchange', handleFullscreenChange);
  document.addEventListener('MSFullscreenChange', handleFullscreenChange);

  // 監聽鍵盤事件（按C鍵切換聊天室）
  document.addEventListener('keydown', (e) => {
    // 只在全螢幕模式下響應，且不是輸入框
    if (!isFullscreen()) return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.key === 'c' || e.key === 'C') {
      toggleFullscreenChat();
    }
  });

  // 【修復】阻止全螢幕影片捕獲左右鍵事件
  document.addEventListener('keydown', (e) => {
    if (!isFullscreen()) return;

    // 當聊天室顯示時，阻止左右鍵傳播到影片
    if (fullscreenChatActive) {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.stopPropagation();
        e.preventDefault();
      }
    }
  }, true); // 使用 capture 階段確保先攔截

  // 監聽滑鼠移動（移到右邊顯示聊天室）
  document.addEventListener('mousemove', (e) => {
    if (!isFullscreen()) return;

    const screenWidth = window.screen.width;
    const mouseX = e.clientX;

    // 滑鼠移到畫面右邊 50px 內，自動顯示聊天室
    if (mouseX > screenWidth - 50) {
      if (!fullscreenChatActive) {
        showFullscreenChat();
      }
    }
  });
}

// 檢查是否處於全螢幕模式
function isFullscreen() {
  return !!(document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement);
}

// 處理全螢幕變化
function handleFullscreenChange() {
  if (isFullscreen()) {
    // 進入全螢幕，準備聊天室
    prepareFullscreenChat();
  } else {
    // 退出全螢幕，完美恢復所有元素位置
    cleanupFullscreenChat();
  }
}

// 準備全螢幕聊天室
function prepareFullscreenChat() {
  const originalChat = findChatArea();
  if (!originalChat) return;

  // 【改為浮動聊天室方式】給原始聊天室添加浮動 class
  originalChat.classList.add('dlsq-chat-overlay');

  // 【修復】移除聊天室頂部陰影（參考劇院模式13）
  const topContributors = document.querySelector('.top-contributors');
  if (topContributors) {
    topContributors.style.setProperty('box-shadow', 'none', 'important');
  }

  // 【完美恢復】儲存父元素和位置信息
  if (!originalChat._gssSaved) {
    originalChat._gssSaved = {
      parent: originalChat.parentNode,
      nextSibling: originalChat.nextSibling
    };
  }

  // 儲存原始樣式以便恢復
  if (!originalChat.dataset.originalFullscreenStyles) {
    originalChat.dataset.originalFullscreenStyles = originalChat.style.cssText;
  }

  // 設定全螢幕浮動樣式
  originalChat.style.cssText = `
    position: fixed !important;
    right: 0 !important;
    top: 60px !important;
    width: 350px !important;
    height: calc(100vh - 60px) !important;
    z-index: 999999 !important;
    display: none !important;
    background: transparent !important;
    overflow-y: auto !important;
    pointer-events: auto !important;
    user-select: text !important;
    -webkit-user-select: text !important;
  `;

  // 將聊天室移到全螢幕元素中
  const fullscreenEl = document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement;
  if (fullscreenEl) {
    fullscreenEl.appendChild(originalChat);
    fullscreenChatClone = originalChat;

    // 【修復】為所有子元素添加 pointer-events: auto 確保可互動
    originalChat.querySelectorAll('*').forEach(child => {
      child.style.setProperty('pointer-events', 'auto', 'important');
    });

    // 【關鍵】將插件面板也移到全螢幕元素中（保存原位置）
    const panel = document.getElementById(UI.panelId);
    if (panel && panel.parentNode !== fullscreenEl) {
      if (!panel._gssSaved) {
        panel._gssSaved = { parent: panel.parentNode, nextSibling: panel.nextSibling };
      }
      fullscreenEl.appendChild(panel);
    }

    // 【關鍵】將右鍵選單也移到全螢幕元素中（保存原位置）
    const ctxMenu = document.getElementById(UI.ctxMenuId);
    if (ctxMenu && ctxMenu.parentNode !== fullscreenEl) {
      if (!ctxMenu._gssSaved) {
        ctxMenu._gssSaved = { parent: ctxMenu.parentNode, nextSibling: ctxMenu.nextSibling };
      }
      fullscreenEl.appendChild(ctxMenu);
    }

    // 【關鍵】將面板標籤選單也移到全螢幕元素中（保存原位置）
    const panelTagMenu = document.getElementById(UI.panelTagMenuId);
    if (panelTagMenu && panelTagMenu.parentNode !== fullscreenEl) {
      if (!panelTagMenu._gssSaved) {
        panelTagMenu._gssSaved = { parent: panelTagMenu.parentNode, nextSibling: panelTagMenu.nextSibling };
      }
      fullscreenEl.appendChild(panelTagMenu);
    }
  }
}

// 切換全螢幕聊天室顯示
function toggleFullscreenChat() {
  if (fullscreenChatActive) {
    hideFullscreenChat();
  } else {
    showFullscreenChat();
  }
}

// 顯示全螢幕聊天室
function showFullscreenChat() {
  if (fullscreenChatClone) {
    fullscreenChatClone.style.setProperty('display', 'block', 'important');
    fullscreenChatActive = true;

    // 同步滾動位置
    const originalChat = findChatArea();
    if (originalChat) {
      fullscreenChatClone.scrollTop = originalChat.scrollTop;
    }
  }
}

// 隱藏全螢幕聊天室
function hideFullscreenChat() {
  if (fullscreenChatClone) {
    fullscreenChatClone.style.setProperty('display', 'none', 'important');
    fullscreenChatActive = false;
  }
}

// 清理全螢幕聊天室
function cleanupFullscreenChat() {
  // 清除捲動同步定時器
  if (fullscreenScrollSyncInterval) {
    clearInterval(fullscreenScrollSyncInterval);
    fullscreenScrollSyncInterval = null;
  }

  if (fullscreenChatClone) {
    // 移除浮動 class
    fullscreenChatClone.classList.remove('dlsq-chat-overlay');

    // 【修復】恢復聊天室頂部陰影（參考劇院模式13）
    const topContributors = document.querySelector('.top-contributors');
    if (topContributors) {
      topContributors.style.removeProperty('box-shadow');
    }

    // 恢復原始樣式
    if (fullscreenChatClone.dataset.originalFullscreenStyles) {
      fullscreenChatClone.style.cssText = fullscreenChatClone.dataset.originalFullscreenStyles;
      delete fullscreenChatClone.dataset.originalFullscreenStyles;
    } else {
      fullscreenChatClone.style.cssText = '';
    }

    // 【完美恢復】將聊天室精確插回原位置（insertBefore 到原來的兄弟節點前）
    if (fullscreenChatClone._gssSaved && fullscreenChatClone._gssSaved.parent) {
      const saved = fullscreenChatClone._gssSaved;
      if (saved.nextSibling) {
        saved.parent.insertBefore(fullscreenChatClone, saved.nextSibling);
      } else {
        saved.parent.appendChild(fullscreenChatClone);
      }
      delete fullscreenChatClone._gssSaved;
    }
  }

  // 【完美恢復】將面板精確插回原位置
  const panel = document.getElementById(UI.panelId);
  if (panel && panel._gssSaved && panel._gssSaved.parent) {
    const saved = panel._gssSaved;
    if (saved.nextSibling) {
      saved.parent.insertBefore(panel, saved.nextSibling);
    } else {
      saved.parent.appendChild(panel);
    }
    delete panel._gssSaved;
  }

  // 【完美恢復】將右鍵選單精確插回原位置
  const ctxMenu = document.getElementById(UI.ctxMenuId);
  if (ctxMenu && ctxMenu._gssSaved && ctxMenu._gssSaved.parent) {
    const saved = ctxMenu._gssSaved;
    if (saved.nextSibling) {
      saved.parent.insertBefore(ctxMenu, saved.nextSibling);
    } else {
      saved.parent.appendChild(ctxMenu);
    }
    delete ctxMenu._gssSaved;
  }

  // 【完美恢復】將面板標籤選單精確插回原位置
  const panelTagMenu = document.getElementById(UI.panelTagMenuId);
  if (panelTagMenu && panelTagMenu._gssSaved && panelTagMenu._gssSaved.parent) {
    const saved = panelTagMenu._gssSaved;
    if (saved.nextSibling) {
      saved.parent.insertBefore(panelTagMenu, saved.nextSibling);
    } else {
      saved.parent.appendChild(panelTagMenu);
    }
    delete panelTagMenu._gssSaved;
  }

  fullscreenChatClone = null;
  fullscreenChatActive = false;
}

// ==================== YouTube 視頻播放器 ====================
let youtubePlayerElement = null;

/**
 * 檢測 YouTube 影片類型（是否為 Shorts）
 * 使用 oEmbed API 檢測影片寬高比
 * @param {string} videoId - YouTube 視頻 ID
 * @returns {Promise<{isShorts: boolean, title: string}>}
 */
async function checkYouTubeVideoType(videoId) {
  try {
    // 使用 YouTube oEmbed API 獲取影片資訊
    const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/shorts/${videoId}&format=json`);
    if (!response.ok) {
      // 如果不是 Shorts URL，嘗試一般影片 URL
      const altResponse = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      if (!altResponse.ok) throw new Error('Failed to fetch video info');
      const data = await altResponse.json();
      return { isShorts: false, title: data.title || '' };
    }

    const data = await response.json();

    // 從 html 提取寬高資訊
    const widthMatch = data.html?.match(/width="(\d+)"/);
    const heightMatch = data.html?.match(/height="(\d+)"/);

    if (widthMatch && heightMatch) {
      const width = parseInt(widthMatch[1]);
      const height = parseInt(heightMatch[1]);
      const ratio = height / width;

      // Shorts 通常是 9:16 (1.77) 或 1:1 (1.0) 或更高
      // 一般影片是 16:9 (0.56)
      const isShorts = ratio >= 1.0;

      return { isShorts, title: data.title || '' };
    }

    // 無法取得尺寸時，根據標題或作者名稱推測
    return { isShorts: false, title: data.title || '' };
  } catch (error) {
    console.error('【GSS】檢測影片類型失敗:', error);
    throw error;
  }
}

/**
 * 將長片自動轉換為 YT- 縮圖格式
 * 用於當影片被誤用自動播放格式時自動轉換為縮略圖
 * @param {HTMLElement} container - 原容器元素
 * @param {string} videoId - YouTube 視頻 ID
 * @param {string} title - 影片標題
 */
function convertToYTThumbnail(container, videoId, title) {
  if (!container || !container.parentNode) return;

  // 創建 YT- 格式的縮圖容器
  const ytWrapper = document.createElement('span');
  ytWrapper.className = 'dlsq-im-replaced dlsq-yt-thumb tsc-exclude';
  ytWrapper.style.cssText = 'display: inline-block; position: relative; width: 160px; height: 90px; vertical-align: middle; margin: 4px 0; border-radius: 8px; overflow: hidden; cursor: pointer;';
  ytWrapper.setAttribute('data-yt-id', `YT-${videoId}`); // 【統一】添加識別屬性

  // 創建縮圖圖片
  const img = document.createElement('img');
  img.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  img.style.cssText = 'width: 100%; height: 100%; object-fit: cover; border-radius: 8px;';
  img.alt = title || 'YouTube Video';

  // 創建播放按鈕覆蓋層
  const playOverlay = document.createElement('span');
  playOverlay.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 40px; height: 40px; background: rgba(255,0,0,0.8); border-radius: 50%; display: flex; align-items: center; justify-content: center; pointer-events: none;';
  playOverlay.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="white"><path d="M8 5v14l11-7z"/></svg>';

  // 創建警告標籤（提示用戶這是長片）
  const warningBadge = document.createElement('span');
  warningBadge.textContent = '長片';
  warningBadge.style.cssText = 'position: absolute; top: 4px; right: 4px; background: rgba(255,193,7,0.9); color: #000; font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: bold;';

  ytWrapper.appendChild(img);
  ytWrapper.appendChild(playOverlay);
  ytWrapper.appendChild(warningBadge);

  // 點擊事件
  ytWrapper.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    openYouTubePlayer(videoId);
  });

  // 右鍵選單
  ytWrapper.addEventListener('contextmenu', (e) => {
    if (window.gssDisableNativeContextMenu) return;
    e.preventDefault();
    e.stopPropagation();
    showContextMenuAt(e.clientX, e.clientY, `YT-${videoId}`, ytWrapper);
  });

  // 替換原容器
  container.parentNode.replaceChild(ytWrapper, container);

  console.log('【GSS】已將長片自動轉換為 YT- 縮圖格式:', videoId);
}

/**
 * 打開 YouTube 視頻播放器
 * @param {string} videoId - YouTube 視頻 ID (如 IO2-G1pNmHs)
 */
function openYouTubePlayer(videoId) {
  // 如果已存在，先移除舊的
  if (youtubePlayerElement) {
    youtubePlayerElement.remove();
    youtubePlayerElement = null;
  }

  // 清理視頻 ID（移除可能的非法字符）
  const cleanId = videoId.replace(/[^a-zA-Z0-9_-]/g, '');
  if (!cleanId) {
    showSendFailureToast('無效的 YouTube 視頻 ID');
    return;
  }

  // 創建播放器容器
  const container = document.createElement('div');
  container.id = 'gss-youtube-player';
  container.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 320px;
    background: #0f0f0f;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.6);
    z-index: 999999;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  // 標題欄
  const header = document.createElement('div');
  header.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    background: #1a1a1a;
    border-bottom: 1px solid rgba(255,255,255,0.1);
  `;

  const title = document.createElement('span');
  title.textContent = '🎬 YouTube';
  title.style.cssText = `
    color: #fff;
    font-size: 13px;
    font-weight: 600;
  `;

  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '✕';
  closeBtn.style.cssText = `
    background: none;
    border: none;
    color: rgba(255,255,255,0.6);
    font-size: 16px;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: all 0.2s;
  `;
  closeBtn.onmouseenter = () => {
    closeBtn.style.background = 'rgba(255,80,80,0.3)';
    closeBtn.style.color = '#fff';
  };
  closeBtn.onmouseleave = () => {
    closeBtn.style.background = 'none';
    closeBtn.style.color = 'rgba(255,255,255,0.6)';
  };
  closeBtn.onclick = () => {
    container.remove();
    youtubePlayerElement = null;
  };

  header.appendChild(title);
  header.appendChild(closeBtn);

  // 縮略圖 + 播放按鈕容器
  const thumbContainer = document.createElement('div');
  thumbContainer.id = 'gss-yt-thumb-container';
  thumbContainer.style.cssText = `
    position: relative;
    width: 100%;
    height: 180px;
    cursor: pointer;
    background: #000;
    min-height: 100px;
  `;

  // YouTube 縮略圖
  const thumbnail = document.createElement('img');
  thumbnail.src = `https://img.youtube.com/vi/${cleanId}/mqdefault.jpg`;
  thumbnail.style.cssText = `
    width: 100%;
    height: 100%;
    object-fit: cover;
  `;
  thumbnail.onerror = () => {
    thumbnail.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect fill="%23333" width="100%" height="100%"/><text fill="%23999" x="50%" y="50%" text-anchor="middle" font-size="14">無法載入縮略圖</text></svg>';
  };

  // 播放按鈕圖標
  const playBtn = document.createElement('div');
  playBtn.innerHTML = '▶';
  playBtn.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60px;
    height: 60px;
    background: rgba(255,0,0,0.9);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 24px;
    padding-left: 4px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.4);
    transition: transform 0.2s, background 0.2s;
  `;
  playBtn.style.cssText += `
    pointer-events: none;
  `;

  thumbContainer.appendChild(thumbnail);
  thumbContainer.appendChild(playBtn);

  // 懸停效果
  thumbContainer.onmouseenter = () => {
    playBtn.style.transform = 'translate(-50%, -50%) scale(1.1)';
    playBtn.style.background = 'rgba(255,0,0,1)';
  };
  thumbContainer.onmouseleave = () => {
    playBtn.style.transform = 'translate(-50%, -50%) scale(1)';
    playBtn.style.background = 'rgba(255,0,0,0.9)';
  };

  // 點擊縮略圖開始播放
  thumbContainer.onclick = () => {
    // 替換為 iframe 播放器
    const iframe = document.createElement('iframe');
    iframe.id = 'gss-yt-iframe';
    iframe.src = `https://www.youtube.com/embed/${cleanId}?autoplay=1&rel=0`;
    iframe.style.cssText = `
      width: 100%;
      height: 180px;
      border: none;
    `;
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;

    thumbContainer.replaceWith(iframe);
    container.style.height = 'auto';
  };

  container.appendChild(header);
  container.appendChild(thumbContainer);

  // 添加調整大小手柄
  const resizeHandle = document.createElement('div');
  resizeHandle.style.cssText = `
    position: absolute;
    bottom: 0;
    right: 0;
    width: 20px;
    height: 20px;
    cursor: nwse-resize;
    background: linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.5) 50%);
    border-bottom-right-radius: 12px;
    z-index: 10;
  `;
  container.appendChild(resizeHandle);

  document.body.appendChild(container);
  youtubePlayerElement = container;

  // 【拖拽功能】讓播放器可以被拖動
  let isDragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  header.style.cursor = 'move';

  header.addEventListener('mousedown', (e) => {
    isDragging = true;
    dragOffsetX = e.clientX - container.offsetLeft;
    dragOffsetY = e.clientY - container.offsetTop;
    container.style.transition = 'none';
  });

  // 【調整大小功能】
  let isResizing = false;
  let startX = 0;
  let startY = 0;
  let startWidth = 0;
  let startHeight = 0;

  resizeHandle.addEventListener('mousedown', (e) => {
    e.stopPropagation(); // 防止觸發拖拽
    isResizing = true;
    startX = e.clientX;
    startY = e.clientY;
    startWidth = container.offsetWidth;
    startHeight = container.offsetHeight;
    container.style.transition = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    // 處理拖拽
    if (isDragging) {
      let newX = e.clientX - dragOffsetX;
      let newY = e.clientY - dragOffsetY;

      const maxX = window.innerWidth - container.offsetWidth;
      const maxY = window.innerHeight - container.offsetHeight;

      newX = Math.max(0, Math.min(newX, maxX));
      newY = Math.max(0, Math.min(newY, maxY));

      container.style.left = `${newX}px`;
      container.style.top = `${newY}px`;
      container.style.bottom = 'auto';
      container.style.right = 'auto';
    }

    // 處理調整大小
    if (isResizing) {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      let newWidth = startWidth + deltaX;
      let newHeight = startHeight + deltaY;

      // 限制最小和最大尺寸
      newWidth = Math.max(240, Math.min(newWidth, window.innerWidth - 40));
      newHeight = Math.max(135, Math.min(newHeight, window.innerHeight - 40));

      container.style.width = `${newWidth}px`;

      // 調整縮略圖/視頻高度（保持 16:9 比例或根據縱向調整）
      const iframe = container.querySelector('#gss-yt-iframe');
      const thumbDiv = container.querySelector('#gss-yt-thumb-container');

      if (iframe) {
        // 播放後：調整 iframe 高度
        const videoHeight = Math.max(135, newHeight - header.offsetHeight - 10);
        iframe.style.height = `${videoHeight}px`;
      } else if (thumbDiv) {
        // 播放前：調整縮略圖高度
        const thumbHeight = newWidth * 9 / 16;
        thumbDiv.style.height = `${thumbHeight}px`;
      }
    }
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      container.style.transition = '';
    }
    if (isResizing) {
      isResizing = false;
      container.style.transition = '';
    }
  });

  // 顯示提示
  setPanelStatus('🎬 已打開 YouTube 播放器（可拖動、可縮放）', '#28a745');
}

// 啟動 UI（先遷移 sync → local，避免舊資料留在已爆量的 sync）
(async function dlsqBootContent() {
  try {
    if (typeof DLSQStickerStore !== 'undefined') {
      await DLSQStickerStore.migrateFromSyncIfNeeded();
    }
  } catch (e) {
    // DLSQ sticker migrate error
  }
  setupUiAutoMount();
  initIMFeature();
  initFullscreenChat();

  // ===== GSS System - 多平台直播追蹤器 =====
  if (typeof GSSTracker !== 'undefined') {
    const tracker = new GSSTracker();
    tracker.init();
    window._gssTracker = tracker;
    console.log('[GSS] Multi-platform tracker initialized');
  }

  // ===== Texo Stream Core - 左上角浮動資訊面板 =====
  if (typeof TexoPanel !== 'undefined') {
    TexoPanel.init();
    console.log('[GSS] Texo Panel initialized');
  }

  // 手動測試快捷鍵（Shift+I）在 Twitch 上強制掃描
  if (window.location.hostname.includes('twitch.tv')) {
    document.addEventListener('keydown', (e) => {
      if (e.shiftKey && e.key === 'I') {
        e.preventDefault();
        // 嘗試找到聊天容器並強制掃描
        const chatSelectors = [
          '.chat-list', '[data-a-target="chat-list"]',
          '.chat-scroll-area', '[class*="chat-list"]',
          '[class*="ChatList"]', '.chat-room__content',
          '[data-test-selector="chat-room-component"]',
          '[data-a-target="chat-room"]', '.stream-chat'
        ];
        for (const sel of chatSelectors) {
          const container = document.querySelector(sel);
          if (container) {
            scanTwitchChatMessages(container);
            break;
          }
        }
      }
    });
  }
})();