// Background script for General Sticker System (GSS)

// 【TSC 全域快取】避免多個分頁重複請求相同頻道狀態
const statusCache = new Map();
const CACHE_DURATION = 60000; // 1 分鐘快取
const pendingRequests = new Map(); // 進行中的請求去重

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'OPEN_TAB') {
    // Open a new tab with the specified URL
    chrome.tabs.create({ url: request.url });
    sendResponse({ success: true });
    return true;
  }

  if (request.type === 'CHECK_STREAM_STATUS') {
    // 在 background 中進行跨域 API 請求
    checkStreamStatusInBackground(request.url).then(result => {
      sendResponse(result);
    }).catch(err => {
      console.log('[GSS Background] 檢查失敗:', err.message);
      sendResponse({ status: 'unknown', error: err.message });
    });
    return true; // 保持消息通道開啟
  }

});

// 在 background 中檢測開台狀態（解決 CORS 問題 + 全域快取）
async function checkStreamStatusInBackground(url) {
  const lowerUrl = url.toLowerCase();
  const cacheKey = lowerUrl;
  const now = Date.now();

  // 1. 檢查快取
  const cached = statusCache.get(cacheKey);
  if (cached && (now - cached.timestamp < CACHE_DURATION)) {
    console.log('[GSS Background] 使用快取:', url, '->', cached.result.status);
    return cached.result;
  }

  // 2. 檢查是否有進行中的相同請求（去重）
  if (pendingRequests.has(cacheKey)) {
    console.log('[GSS Background] 等待進行中的請求:', url);
    return await pendingRequests.get(cacheKey);
  }

  // 3. 發起新請求並加入 pending
  const promise = (async () => {
    let result;
    if (lowerUrl.includes('twitch.tv')) {
      result = await checkTwitchStatus(url);
    } else if (lowerUrl.includes('dlive.tv')) {
      result = await checkDLiveStatus(url);
    } else if (lowerUrl.includes('vaughn.live')) {
      result = await checkVaughnStatus(url);
    } else if (lowerUrl.includes('kick.com')) {
      result = await checkKickStatus(url);
    } else if (lowerUrl.includes('youtube.com')) {
      result = await checkYouTubeStatus(url);
    } else {
      result = { status: 'unknown' };
    }

    // 存入快取
    statusCache.set(cacheKey, { result, timestamp: Date.now() });
    pendingRequests.delete(cacheKey);
    return result;
  })();

  pendingRequests.set(cacheKey, promise);
  return await promise;
}

// Twitch 狀態檢測（頁面解析法，無需 API 密鑰）
async function checkTwitchStatus(url) {
  const match = url.match(/twitch\.tv\/([^\/\?]+)/i);
  if (!match) return { status: 'unknown' };
  const username = match[1];

  try {
    const response = await fetch(`https://www.twitch.tv/${username}`, {
      method: 'GET',
      headers: {
        'Accept': 'text/html',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      return { status: 'unknown' };
    }

    const text = await response.text();

    // 檢查開台狀態標記
    const hasIsLiveBroadcast = text.includes('"isLiveBroadcast":true');
    const hasLiveThumbnail = text.includes(`live_user_${username}`) || text.includes('previews-ttv/live_user_');
    const hasJsonLdSchema = text.includes('application/ld+json') && text.includes('VideoObject');

    // 如果有任何開台標記，判定為 online
    const isLive = hasIsLiveBroadcast || hasLiveThumbnail || (hasJsonLdSchema && hasIsLiveBroadcast);
    const status = isLive ? 'online' : 'offline';

    return {
      status,
      details: {
        hasIsLiveBroadcast,
        hasLiveThumbnail,
        hasJsonLdSchema
      }
    };
  } catch (e) {
    console.log('[GSS Background] Twitch 頁面解析檢測失敗:', username, e.message);
    return { status: 'unknown', error: e.message };
  }
}

// DLive 狀態檢測
async function checkDLiveStatus(url) {
  const match = url.match(/dlive\.tv\/([^\/\?]+)/i);
  if (!match) return { status: 'unknown' };

  const username = match[1];
  try {
    const response = await fetch('https://graphigo.prd.dlive.tv/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        query: `query { userByDisplayName(displayname: "${username}") { livestream { id } } }`
      })
    });
    const data = await response.json();
    const hasLive = data?.data?.userByDisplayName?.livestream?.id;
    return { status: hasLive ? 'online' : 'offline' };
  } catch (e) {
    return { status: 'unknown', error: e.message };
  }
}

// Vaughn Live 狀態檢測 - 暫時返回 unknown（灰色）
// TODO: 找到可靠的檢測方法後再實作
async function checkVaughnStatus(url) {
  const match = url.match(/vaughn\.live\/([^\/\?]+)/i);
  if (!match) return { status: 'unknown' };

  const channel = match[1];
  console.log('[GSS Background] Vaughn 檢測暫時禁用:', channel, '-> 返回 unknown (灰色)');

  // 暫時返回 unknown，顯示灰色狀態
  // 等找到可靠檢測方法後再實作
  return { status: 'unknown' };
}

// 備選方案 1：嘗試普通 CORS 模式
async function checkVaughnStatusWithCors(channel) {
  console.log('[GSS Background] 嘗試 CORS 模式檢測 Vaughn:', channel);
  try {
    const response = await fetch(`https://vaughn.live/app_check.php?channel=${channel}`, {
      method: 'GET',
      headers: {
        'Accept': '*/*'
      }
    });
    const data = await response.text();
    const trimmed = data.trim().toLowerCase();
    const isLive = trimmed === 'yes' || /^\d+$/.test(trimmed);
    return { status: isLive ? 'online' : 'offline' };
  } catch (e) {
    console.log('[GSS Background] CORS 模式也失敗:', e.message);
    // 嘗試縮圖檢測作為最後手段
    return await checkVaughnStatusWithThumbnail(channel);
  }
}

// 備選方案 3：透過 HLS 串流偵測
async function checkByStream(channel) {
  const streamUrl = `https://ms-hls.vaughn.live/live/_definst_/${channel}/playlist.m3u8`;

  console.log('[GSS Background] 嘗試 HLS 串流偵測:', channel);
  try {
    const response = await fetch(streamUrl, {
      method: 'HEAD',
      cache: 'no-store'
    });

    if (response.ok) {
      console.log(`[GSS Background] ${channel} HLS 偵測: Online`);
      return { status: 'online' };
    } else {
      console.log(`[GSS Background] ${channel} HLS 偵測: Offline (HTTP ${response.status})`);
      return { status: 'offline' };
    }
  } catch (error) {
    console.error(`[GSS Background] ${channel} HLS 偵測出錯:`, error);
    return { status: 'offline' };
  }
}

// 備選方案 2：透過縮圖 URL 檢測（繞過 API CORS）
async function checkVaughnStatusWithThumbnail(channel) {
  console.log('[GSS Background] 嘗試縮圖檢測 Vaughn:', channel);
  const thumbnailUrl = `https://cdn.vaughn.live/screenshots/${channel}.jpg`;

  return new Promise((resolve) => {
    const img = new Image();
    let timeout;

    img.onload = () => {
      clearTimeout(timeout);
      console.log('[GSS Background] 縮圖載入成功，判定為 online:', channel);
      resolve({ status: 'online' });
    };

    img.onerror = () => {
      clearTimeout(timeout);
      console.log('[GSS Background] 縮圖載入失敗，判定為 offline:', channel);
      // 嘗試 HLS 流檢測作為最後手段
      checkByStream(channel).then(resolve);
    };

    // 設定超時（3秒）
    timeout = setTimeout(() => {
      console.log('[GSS Background] 縮圖載入超時，嘗試 HLS 檢測:', channel);
      checkByStream(channel).then(resolve);
    }, 3000);

    // 添加隨機參數避免快取
    img.src = `${thumbnailUrl}?t=${Date.now()}`;
  });
}

// KICK 狀態檢測
// API: https://kick.com/api/v1/channels/{slug}
// 判斷邏輯: livestream 欄位是否為 null
async function checkKickStatus(url) {
  const match = url.match(/kick\.com\/([^\/\?]+)/i);
  if (!match) return { status: 'unknown' };

  const slug = match[1];
  try {
    console.log('[GSS Background] 檢測 KICK 狀態:', slug);
    const response = await fetch(`https://kick.com/api/v1/channels/${slug}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.log('[GSS Background] KICK API 回應錯誤:', response.status);
      return { status: 'unknown' };
    }

    const data = await response.json();

    // 判斷 livestream 欄位
    const isLive = data?.livestream !== null && data?.livestream !== undefined;
    const status = isLive ? 'online' : 'offline';

    // 如果有縮圖，一起回傳
    const thumbnail = data?.livestream?.thumbnail?.url || null;

    console.log('[GSS Background] KICK 狀態:', slug, '->', status, thumbnail ? '(有縮圖)' : '');
    return { status, thumbnail };
  } catch (e) {
    console.log('[GSS Background] KICK 檢測失敗:', slug, e.message);
    return { status: 'unknown', error: e.message };
  }
}

// YouTube 狀態檢測 - 使用頁面解析（免費，無 API 額度限制）
async function checkYouTubeStatus(url) {
  try {

    // 如果是頻道頁，自動加上 /live 獲取直播頁面
    let checkUrl = url;
    const channelMatch = url.match(/youtube\.com\/(@[^\/\?]+)/i);
    if (channelMatch && !url.includes('/live')) {
      checkUrl = `https://www.youtube.com/${channelMatch[1]}/live`;
    }

    const response = await fetch(checkUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/html',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      return { status: 'unknown' };
    }

    const text = await response.text();

    // 檢查關鍵字（排除待機室）
    const hasIsLive = text.includes('"isLive":true');
    const hasIsUpcoming = text.includes('"isUpcoming":true') ||
      text.includes('"upcomingEventData"') ||
      text.includes('LIVE_BADGE_STYLE_UPCOMING');
    const hasLiveBadge = text.includes('LIVE_BADGE_STYLE_LIVE');

    // 真正的直播：(isLive=true 且不是待機室) 或有 LIVE 徽章
    const isLive = (hasIsLive && !hasIsUpcoming) || hasLiveBadge;
    const status = isLive ? 'online' : 'offline';


    return {
      status,
      details: {
        isLive: hasIsLive,
        isUpcoming: hasIsUpcoming,
        hasLiveBadge
      }
    };
  } catch (e) {
    return { status: 'unknown', error: e.message };
  }
}

// Handle extension install/update
chrome.runtime.onInstalled.addListener(() => {
  // Extension installed/updated
});

