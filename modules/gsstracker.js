/**
 * GSS System - 多平台直播追蹤器
 * 自動解析實況說明中的 #GSS System 標記，顯示主播其他平台開台情況
 */

(function () {
  'use strict';

  class GSSTracker {
    constructor() {
      this.isActive = false;
      this.streamData = null;
      this.panel = null;
      this.checkInterval = null;
      this.lastDescription = null;
    }

    init() {
      this.checkAndUpdate();
      // 每 10 秒檢查一次實況說明變化
      this.checkInterval = setInterval(() => this.checkAndUpdate(), 10000);

      // 監聽頁面變化（SPA 路由變化）
      this.observePageChanges();
    }

    observePageChanges() {
      let lastUrl = location.href;
      new MutationObserver(() => {
        if (location.href !== lastUrl) {
          lastUrl = location.href;
          // 路由變化後延遲檢查，等待頁面載入
          setTimeout(() => this.checkAndUpdate(), 2000);
        }
      }).observe(document, { subtree: true, childList: true });
    }

    checkAndUpdate() {
      const description = this.getStreamDescription();

      // 更新直播狀態檢測
      this.updateLiveStatus();

      if (!description) return;

      // 如果說明沒變化，跳過
      if (description === this.lastDescription) return;
      this.lastDescription = description;

      // 檢查是否有 #GSS System 標記
      if (!description.includes('#GSS System')) {
        if (this.isActive) {
          this.hidePanel();
          this.isActive = false;
        }
        return;
      }

      // 解析 GSS 資料
      const data = this.parseGSSData(description);
      if (!data) return;

      // 資料變化或首次顯示
      if (!this.isActive || JSON.stringify(data) !== JSON.stringify(this.streamData)) {
        this.streamData = data;
        this.showPanel();
        this.isActive = true;
        console.log('[GSS Tracker] 發現多平台資訊:', data);
      }
    }

    // 【新增】檢測當前平台直播狀態
    updateLiveStatus() {
      const hostname = window.location.hostname;
      let isLive = false;

      if (hostname.includes('youtube.com')) {
        isLive = this.isYouTubeLive();
      } else if (hostname.includes('twitch.tv')) {
        isLive = this.isTwitchLive();
      } else if (hostname.includes('dlive.tv')) {
        isLive = this.isDLiveLive();
      } else if (hostname.includes('vaughn.live')) {
        isLive = this.isVaughnLive();
      }

      // 如果有面板，更新狀態指示器
      if (this.panel && this.isActive) {
        this.updateLiveIndicator(isLive);
      }

      this.isCurrentlyLive = isLive;
    }

    // YouTube 直播狀態檢測（多方法綜合判斷）
    isYouTubeLive() {
      const hostname = window.location.hostname;
      const pathname = window.location.pathname;
      const url = window.location.href;

      // 【嚴格過濾】必須是 www.youtube.com 或 youtube.com 主域名
      if (!hostname.includes('youtube.com') ||
        hostname.includes('accounts.') ||
        hostname.includes('login.') ||
        hostname.startsWith('consent.')) {
        return false;
      }

      // 【過濾無效頁面】排除 RotateCookiesPage, signin 等頁面
      const isInvalidPage = pathname.includes('/RotateCookiesPage') ||
        pathname.includes('/signin') ||
        pathname.includes('/oauth');

      if (isInvalidPage) {
        // 跳過無效頁面
        return false;
      }

      const results = {
        url: url,
        method1_isLive: false,
        method2_liveBadge: false,
        method3_liveBadgeText: false,
        method4_urlPattern: false,
        method5_videoMeta: false,
        method6_chatFrame: false,
        finalResult: false
      };

      // 【方法1】檢查頁面原始碼中的 "isLive":true，並排除待機室（isUpcoming）
      const pageHtml = document.documentElement.innerHTML;
      const isLiveMatch = pageHtml.match(/"isLive"\s*:\s*(true|false)/);
      const isUpcoming = pageHtml.includes('"isUpcoming":true') ||
        pageHtml.includes('"upcomingEventData"') ||
        pageHtml.includes('LIVE_BADGE_STYLE_UPCOMING');
      const hasLiveBadge = pageHtml.includes('LIVE_BADGE_STYLE_LIVE');

      if (isLiveMatch) {
        // 真正的直播：isLive=true 且不是待機室，或有 LIVE 徽章
        results.method1_isLive = (isLiveMatch[1] === 'true' && !isUpcoming) || hasLiveBadge;
      }
      results.method1_detail = {
        isLiveRaw: isLiveMatch ? isLiveMatch[1] : null,
        isUpcoming: isUpcoming,
        hasLiveBadge: hasLiveBadge
      };

      // 【方法2】檢查 LIVE 徽章元素（優化：區分頻道頁和影片頁）
      // 頻道頁面：檢查頻道名稱下方的直播指示器
      // 方法 A：通過 aria-label 檢查（多語言支援）
      const channelHeaderLive = document.querySelector(
        'ytd-channel-name yt-badge-shape[aria-label="直播"], ' +
        'ytd-channel-name yt-badge-shape[aria-label="LIVE"], ' +
        'ytd-channel-name .yt-spec-icon-badge-shape[aria-label="直播"], ' +
        'ytd-channel-name .yt-spec-icon-badge-shape[aria-label="LIVE"], ' +
        '#channel-header yt-badge-shape[aria-label="直播"], ' +
        '#channel-header yt-badge-shape[aria-label="LIVE"], ' +
        '#channel-name yt-badge-shape[aria-label="直播"], ' +
        '#channel-name yt-badge-shape[aria-label="LIVE"], ' +
        '#channel-header .yt-spec-icon-badge-shape, ' +
        'ytd-channel-header-renderer .yt-spec-icon-badge-shape'
      );

      // 方法 B：通過文本內容檢查任何帶 "LIVE" 或 "直播中" 的元素
      const allElements = document.querySelectorAll('yt-badge-shape, .yt-spec-icon-badge-shape, .badge-shape-wiz__text');
      let hasLiveTextBadge = false;
      for (const el of allElements) {
        const text = el.textContent?.trim().toLowerCase();
        const ariaLabel = el.getAttribute('aria-label')?.toLowerCase();
        if (text === 'live' || text === '直播中' ||
          ariaLabel === 'live' || ariaLabel === '直播中') {
          hasLiveTextBadge = true;
          break;
        }
      }

      // 影片頁面的直播徽章
      const videoLiveBadge = document.querySelector(
        'ytd-video-primary-info-renderer [class*="live-badge"], ' +
        'ytd-video-primary-info-renderer [class*="live"], ' +
        '.ytp-live, ' +
        'ytd-video-primary-info-renderer yt-badge-shape[aria-label="直播"]'
      );

      // 【方法2.1】檢查頻道頁的正在直播視頻區塊（當徽章檢測失敗時使用）
      // 使用標準 CSS 選擇器，避免 :has-text 等非標準語法
      const channelLiveSection = document.querySelector(
        // 頻道頁的 "正在直播" 區塊
        '[class*="live-now"], ' +
        '[class*="badge-style-type-live-now"]'
      );

      // 【方法2.2】檢查頁面標題（直播中頻道通常有 LIVE 標記）
      const titleHasLive = document.title.toLowerCase().includes('live') ||
        document.title.includes('直播中');

      // 全域搜索任何帶有 "直播" aria-label 的徽章
      const allLiveBadges = document.querySelectorAll('yt-badge-shape[aria-label="直播"], .yt-spec-icon-badge-shape[aria-label="直播"]');

      const liveBadge = channelHeaderLive || videoLiveBadge || hasLiveTextBadge;
      results.method2_liveBadge = !!liveBadge;
      results.method2_detail = {
        channelHeader: !!channelHeaderLive,
        videoBadge: !!videoLiveBadge,
        hasLiveTextBadge: hasLiveTextBadge,
        channelLiveSection: !!channelLiveSection,
        titleHasLive: titleHasLive,
        allBadgesCount: allLiveBadges.length,
        allBadges: Array.from(allLiveBadges).map(b => b.getAttribute('aria-label') || b.textContent).slice(0, 3)
      };

      // 【方法3】檢查徽章文本內容
      if (liveBadge) {
        const badgeText = liveBadge.textContent?.toLowerCase() || '';
        const ariaLabel = liveBadge.getAttribute('aria-label')?.toLowerCase() || '';
        results.method3_liveBadgeText = badgeText.includes('live') || badgeText.includes('直播') ||
          ariaLabel.includes('live') || ariaLabel.includes('直播');
      }

      // 【方法4】URL 模式檢查
      results.method4_urlPattern = pathname.includes('/live') || pathname.includes('/live_chat');

      // 【方法5】檢查影片 meta 資訊
      const videoMeta = document.querySelector('meta[itemprop="publication"][content="Live"]');
      const videoTags = document.querySelectorAll('meta[property="og:video:tag"]');
      results.method5_videoMeta = !!videoMeta || Array.from(videoTags).some(tag =>
        tag.content?.toLowerCase().includes('live')
      );

      // 【方法6】檢查是否存在聊天室 iframe
      const chatFrame = document.querySelector('iframe[src*="/live_chat"], iframe[src*="live_chat"]');
      results.method6_chatFrame = !!chatFrame;

      // 綜合判斷（根據頁面類型使用不同邏輯）
      const isWatchPage = pathname.includes('/watch');
      const isChannelPage = pathname.includes('/@') || pathname.includes('/channel/');

      if (isWatchPage) {
        // 影片頁：主要依賴 method1_isLive
        results.finalResult = results.method1_isLive || results.method4_urlPattern || results.method6_chatFrame;
      } else if (isChannelPage) {
        // 頻道頁：檢查多種直播標記（徽章、文本、直播區塊、標題）
        const hasChannelBadge = results.method2_detail?.channelHeader;
        const hasLiveText = results.method2_detail?.hasLiveTextBadge;
        results.finalResult = hasChannelBadge || hasLiveText ||
          results.method2_detail?.channelLiveSection ||
          results.method2_detail?.titleHasLive ||
          results.method4_urlPattern;
      } else {
        // 其他頁面：綜合判斷
        results.finalResult = results.method1_isLive || results.method2_liveBadge ||
          results.method3_liveBadgeText || results.method4_urlPattern ||
          results.method5_videoMeta || results.method6_chatFrame;
      }

      return results.finalResult;
    }

    // 【調試工具】在控制台運行 testYouTubeLive() 查看詳細檢測結果
    debugYouTubeLive() {
      const hostname = window.location.hostname;
      const pathname = window.location.pathname;
      const url = window.location.href;

      // 【過濾無效頁面】排除 accounts, login, consent 等頁面
      const isInvalidPage = hostname.includes('accounts.') ||
        hostname.includes('login.') ||
        pathname.includes('/RotateCookiesPage') ||
        pathname.includes('/signin') ||
        url.includes('accounts.youtube.com') ||
        url.includes('consent.youtube.com');

      // 【檢測是否為有效內容頁】
      const isContentPage = pathname.includes('/watch') ||
        pathname.includes('/live') ||
        pathname.includes('/@') ||
        pathname.includes('/channel/') ||
        pathname.includes('/c/') ||
        pathname.includes('/user/') ||
        pathname.includes('/live_chat');

      const results = {
        url: url,
        hostname: hostname,
        pathname: pathname,
        isYouTube: hostname.includes('youtube.com'),
        isInvalidPage: isInvalidPage,
        isContentPage: isContentPage,
        skipDetection: isInvalidPage || !isContentPage,
        // 方法1: isLive 標記（僅在有效頁面檢測，排除待機室）
        method1_isLive: !isInvalidPage ? (() => {
          const html = document.documentElement.innerHTML;
          const match = html.match(/"isLive"\s*:\s*(true|false)/);
          const isUpcoming = html.includes('"isUpcoming":true') ||
            html.includes('"upcomingEventData"') ||
            html.includes('LIVE_BADGE_STYLE_UPCOMING');
          const hasLiveBadge = html.includes('LIVE_BADGE_STYLE_LIVE');
          return {
            isLive: match ? (match[1] === 'true' && !isUpcoming) || hasLiveBadge : false,
            isLiveRaw: match ? match[1] : null,
            isUpcoming: isUpcoming,
            hasLiveBadge: hasLiveBadge
          };
        })() : 'skipped',
        // 方法2: LIVE 徽章元素（詳細位置）
        method2_liveBadge: !isInvalidPage && (() => {
          // 檢查頻道標題區域的徽章
          const channelHeader = !!document.querySelector(
            'ytd-channel-name yt-badge-shape[aria-label="直播"], ytd-channel-name yt-badge-shape[aria-label="LIVE"], ' +
            'ytd-channel-name .yt-spec-icon-badge-shape[aria-label="直播"], ytd-channel-name .yt-spec-icon-badge-shape[aria-label="LIVE"]'
          );
          // 檢查所有徽章的文本內容
          const allElements = document.querySelectorAll('yt-badge-shape, .yt-spec-icon-badge-shape, .badge-shape-wiz__text');
          let hasLiveTextBadge = false;
          for (const el of allElements) {
            const text = el.textContent?.trim().toLowerCase();
            const ariaLabel = el.getAttribute('aria-label')?.toLowerCase();
            if (text === 'live' || text === '直播中' ||
              ariaLabel === 'live' || ariaLabel === '直播中') {
              hasLiveTextBadge = true;
              break;
            }
          }
          return {
            channelHeader: channelHeader,
            videoBadge: !!document.querySelector('ytd-video-primary-info-renderer [class*="live-badge"]'),
            hasLiveTextBadge: hasLiveTextBadge,
            channelLiveSection: !!document.querySelector('[class*="live-now"], [class*="badge-style-type-live-now"]'),
            titleHasLive: document.title.toLowerCase().includes('live') || document.title.includes('直播中'),
            allBadgesCount: document.querySelectorAll('yt-badge-shape[aria-label="直播"], yt-badge-shape[aria-label="LIVE"]').length
          };
        })(),
        // 方法3: URL 模式
        method3_urlPattern: pathname.includes('/live') || pathname.includes('/live_chat'),
        // 方法4: 聊天室 iframe
        method4_chatFrame: !isInvalidPage && !!document.querySelector('iframe[src*="live_chat"]'),
        // 方法5: 頁面可見標題
        method5_pageTitle: document.title.toLowerCase().includes('live') || document.title.includes('直播'),
        // 額外: 檢查 video ID
        videoId: (() => {
          const match = pathname.match(/\/watch\?v=([a-zA-Z0-9_-]+)/) ||
            window.location.search.match(/[?&]v=([a-zA-Z0-9_-]+)/);
          return match ? match[1] : null;
        })(),
        // 檢查頻道 handle
        channelHandle: pathname.match(/\/(@[\w-]+)/)?.[1] || null
      };

      return results;
    }

    // 【新增】獲取頻道名稱（用於 /live URL 檢測）
    getYouTubeChannelHandle() {
      const path = window.location.pathname;
      // 從 /@頻道名稱 或 /channel/UC... 獲取
      const handleMatch = path.match(/\/(@[\w-]+)/);
      if (handleMatch) return handleMatch[1];

      // 從頁面原始碼獲取
      const html = document.documentElement.innerHTML;
      const channelMatch = html.match(/"channelHandle"\s*:\s*"(@[\w-]+)"/);
      if (channelMatch) return channelMatch[1];

      // 從元資料獲取
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) {
        const canMatch = canonical.href.match(/\/(@[\w-]+)/);
        if (canMatch) return canMatch[1];
      }

      return null;
    }

    // Twitch 直播狀態檢測
    isTwitchLive() {
      if (!window.location.hostname.includes('twitch.tv')) return false;

      // 檢查 LIVE 指示器
      const liveIndicator = document.querySelector(
        '[data-a-target="live-badge"], ' +
        '.live-indicator, ' +
        '[class*="live-indicator"], ' +
        '.channel-status-info [class*="live"], ' +
        '.tw-channel-status-text-indicator'
      );
      if (liveIndicator && liveIndicator.textContent.toLowerCase().includes('live')) {
        return true;
      }

      // 檢查觀看人數（直播中顯示觀眾數）
      const viewerCount = document.querySelector(
        '[data-a-target="stream-viewer-count"], ' +
        '.viewer-count, ' +
        '[class*="viewer-count"]'
      );
      if (viewerCount) {
        return true;
      }

      return false;
    }

    // DLive 直播狀態檢測
    isDLiveLive() {
      if (!window.location.hostname.includes('dlive.tv')) return false;

      // DLive 通常顯示 LIVE 標籤
      const liveBadge = document.querySelector(
        '.live-badge, ' +
        '[class*="live-badge"], ' +
        '.live-indicator, ' +
        '.online-status, ' +
        '[class*="online"]'
      );
      if (liveBadge) {
        const text = liveBadge.textContent.toLowerCase();
        if (text.includes('live') || text.includes('online')) return true;
      }

      return false;
    }

    // Vaughn 直播狀態檢測
    isVaughnLive() {
      if (!window.location.hostname.includes('vaughn.live')) return false;

      // Vaughn 直播指示器
      const liveIndicator = document.querySelector(
        '.live-indicator, ' +
        '[class*="live"], ' +
        '.online-status'
      );
      if (liveIndicator && liveIndicator.textContent.toLowerCase().includes('live')) {
        return true;
      }

      return false;
    }

    // 更新面板上的直播狀態指示器
    updateLiveIndicator(isLive) {
      let indicator = this.panel.querySelector('#gss-live-indicator');
      if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'gss-live-indicator';
        indicator.style.cssText = `
          position: absolute;
          top: 8px;
          left: 8px;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          transition: all 0.3s;
        `;
        this.panel.insertBefore(indicator, this.panel.firstChild);
      }

      if (isLive) {
        indicator.textContent = '● LIVE';
        indicator.style.background = '#ff4444';
        indicator.style.color = '#fff';
        indicator.style.boxShadow = '0 0 8px rgba(255,68,68,0.5)';
      } else {
        indicator.textContent = '○ OFFLINE';
        indicator.style.background = 'rgba(255,255,255,0.1)';
        indicator.style.color = '#888';
        indicator.style.boxShadow = 'none';
      }
    }

    getStreamDescription() {
      // 根據不同平台找實況說明
      const hostname = window.location.hostname;

      // DLive
      if (hostname.includes('dlive.tv')) {
        const desc = document.querySelector('.livestream-info .description, .about-panel .description, [class*="description"]');
        if (desc) return desc.textContent;
        // 備用：找包含特定文字的區域
        const aboutPanel = document.querySelector('.about-panel, [class*="about"]');
        if (aboutPanel) return aboutPanel.textContent;
      }

      // Twitch
      if (hostname.includes('twitch.tv')) {
        // Twitch 通常沒有固定實況說明區，找面板或標題區
        const titleArea = document.querySelector('[data-a-target="stream-title"], .channel-info-content');
        if (titleArea) return titleArea.textContent;
        // 備用：找 about 區
        const about = document.querySelector('[data-target="channel-about-panel"], [class*="about"]');
        if (about) return about.textContent;
      }

      // Vaughn
      if (hostname.includes('vaughn.live')) {
        // Vaughn 頁面結構
        const desc = document.querySelector('.description, [class*="desc"]');
        if (desc) return desc.textContent;
        // 備用：整個頁面文字
        return document.body.innerText;
      }

      // YouTube - 支援直播和影片
      if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
        // 優先：頻道 About 頁面
        const aboutSection = document.querySelector('#about-section, [tab-title="About"]');
        if (aboutSection) {
          const aboutText = aboutSection.textContent;
          if (aboutText.includes('#GSS System')) return aboutText;
        }

        // 直播/影片描述
        const description = document.querySelector(
          '#description-inline-expander, ' +
          '#description, ' +
          '.ytd-video-secondary-info-renderer, ' +
          '[id="description-container"], ' +
          '#meta-contents, ' +
          '.content.ytd-video-secondary-info-renderer'
        );
        if (description) {
          const descText = description.textContent;
          if (descText.includes('#GSS System')) return descText;
        }

        // 聊天室頁面（youtube.com/live_chat）
        if (window.location.pathname.includes('/live_chat')) {
          // 嘗試從父頁面或網址參數獲取頻道資訊
          const urlParams = new URLSearchParams(window.location.search);
          const videoId = urlParams.get('v') || window.location.href.match(/v=([^&]+)/)?.[1];
          if (videoId) {
            // 標記為直播頁面，可能需要從主頁面獲取描述
            console.log('[GSS Tracker] YouTube 聊天室模式，視頻ID:', videoId);
          }
        }

        // 備用：掃描整個頁面（僅限包含 #GSS 的情況）
        const bodyText = document.body.innerText;
        if (bodyText.includes('#GSS System')) return bodyText;
      }

      // 通用備用：掃描整個頁面
      return document.body.innerText;
    }

    parseGSSData(text) {
      const lines = text.split('\n').map(l => l.trim()).filter(l => l);
      const data = {
        displayName: null,
        baseChat: null,
        streams: []
      };
      let foundGSSTag = false;

      for (const line of lines) {
        // 找到 #GSS System 標記才開始解析
        if (line.includes('#GSS System')) {
          foundGSSTag = true;
          continue;
        }
        if (!foundGSSTag) continue;

        // 格式：#名字 #網址
        const nameUrlMatch = line.match(/#([^#\s]+)\s+#(https?:\/\/[^\s]+)/);
        if (nameUrlMatch) {
          data.displayName = nameUrlMatch[1].trim();
          data.baseChat = nameUrlMatch[2].trim();
          data.streams.push({
            platform: this.detectPlatform(nameUrlMatch[2]),
            url: nameUrlMatch[2].trim()
          });
          continue;
        }

        // 格式：純網址 #https://...
        const urlMatch = line.match(/#(https?:\/\/[^\s]+)/);
        if (urlMatch) {
          const url = urlMatch[1].trim();
          data.streams.push({
            platform: this.detectPlatform(url),
            url: url
          });
          // 如果還沒設定主聊天室，用第一個 Twitch 連結
          if (!data.baseChat && url.includes('twitch.tv')) {
            data.baseChat = url;
          }
        }
      }

      return foundGSSTag ? data : null;
    }

    detectPlatform(url) {
      const lower = url.toLowerCase();
      if (lower.includes('twitch.tv')) return 'twitch';
      if (lower.includes('vaughn.live')) return 'vaughn';
      if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
      if (lower.includes('dlive.tv')) return 'dlive';
      if (lower.includes('bilibili.com')) return 'bilibili';
      return 'other';
    }

    getPlatformIcon(platform) {
      const icons = {
        twitch: '🎮',
        vaughn: '📺',
        youtube: '▶️',
        dlive: '⛵',
        bilibili: '📺',
        other: '🔗'
      };
      return icons[platform] || icons.other;
    }

    getPlatformColor(platform) {
      const colors = {
        twitch: '#9146ff',
        vaughn: '#ff6b00',
        youtube: '#ff0000',
        dlive: '#ffd600',
        bilibili: '#fb7299',
        other: '#666'
      };
      return colors[platform] || colors.other;
    }

    showPanel() {
      // 移除舊面板
      if (this.panel) {
        this.panel.remove();
      }

      const data = this.streamData;
      const displayName = data.displayName || 'Unknown';

      // 創建面板
      this.panel = document.createElement('div');
      this.panel.id = 'gss-tracker-panel';
      this.panel.style.cssText = `
        position: fixed;
        top: 80px;
        right: 16px;
        width: 220px;
        background: rgba(16, 18, 22, 0.98);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 12px;
        padding: 16px;
        z-index: 2147483646;
        box-shadow: 0 16px 44px rgba(0,0,0,0.55);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        backdrop-filter: blur(10px);
      `;

      // 標題
      const header = document.createElement('div');
      header.style.cssText = `
        font-size: 14px;
        font-weight: 600;
        color: #fff;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 6px;
        border-bottom: 1px solid rgba(255,255,255,0.1);
        padding-bottom: 10px;
      `;
      header.textContent = '';
      const hashSpan = document.createElement('span');
      hashSpan.style.color = '#ff6b00';
      hashSpan.textContent = '#';
      header.appendChild(hashSpan);
      header.appendChild(document.createTextNode(displayName));

      // 平台連結列表
      const linksContainer = document.createElement('div');
      linksContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 8px;
      `;

      data.streams.forEach(stream => {
        const linkBtn = document.createElement('a');
        linkBtn.href = stream.url;
        linkBtn.target = '_blank';
        linkBtn.style.cssText = `
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: ${this.getPlatformColor(stream.platform)}20;
          border: 1px solid ${this.getPlatformColor(stream.platform)}40;
          border-radius: 8px;
          color: #fff;
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.2s;
        `;
        linkBtn.textContent = '';
        const iconSpan = document.createElement('span');
        iconSpan.style.fontSize = '16px';
        iconSpan.textContent = this.getPlatformIcon(stream.platform);
        linkBtn.appendChild(iconSpan);
        const platformSpan = document.createElement('span');
        platformSpan.style.flex = '1';
        platformSpan.textContent = stream.platform.toUpperCase();
        linkBtn.appendChild(platformSpan);
        const arrowSpan = document.createElement('span');
        arrowSpan.style.fontSize = '10px';
        arrowSpan.style.opacity = '0.6';
        arrowSpan.textContent = '↗';
        linkBtn.appendChild(arrowSpan);
        linkBtn.addEventListener('mouseenter', () => {
          linkBtn.style.background = `${this.getPlatformColor(stream.platform)}40`;
          linkBtn.style.borderColor = `${this.getPlatformColor(stream.platform)}80`;
        });
        linkBtn.addEventListener('mouseleave', () => {
          linkBtn.style.background = `${this.getPlatformColor(stream.platform)}20`;
          linkBtn.style.borderColor = `${this.getPlatformColor(stream.platform)}40`;
        });
        linksContainer.appendChild(linkBtn);
      });

      // 主聊天室按鈕（如果有的話）
      if (data.baseChat) {
        const chatDivider = document.createElement('div');
        chatDivider.style.cssText = `
          border-top: 1px solid rgba(255,255,255,0.1);
          margin: 12px 0 8px;
          padding-top: 8px;
          font-size: 11px;
          color: #888;
          text-align: center;
        `;
        chatDivider.textContent = '💬 主聊天室';

        const chatBtn = document.createElement('a');
        chatBtn.href = data.baseChat;
        chatBtn.target = '_blank';
        chatBtn.style.cssText = `
          display: block;
          padding: 8px 12px;
          background: rgba(145, 70, 255, 0.2);
          border: 1px solid rgba(145, 70, 255, 0.4);
          border-radius: 8px;
          color: #9146ff;
          text-decoration: none;
          font-size: 12px;
          font-weight: 500;
          text-align: center;
          margin-top: 8px;
        `;
        chatBtn.innerHTML = '開啟主聊天室 ↗';

        linksContainer.appendChild(chatDivider);
        linksContainer.appendChild(chatBtn);
      }

      // 關閉按鈕
      const closeBtn = document.createElement('button');
      closeBtn.style.cssText = `
        position: absolute;
        top: 8px;
        right: 8px;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: rgba(255, 255, 255, 0.6);
        cursor: pointer;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      `;
      closeBtn.innerHTML = '×';
      closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.background = 'rgba(255, 80, 80, 0.8)';
        closeBtn.style.color = '#fff';
      });
      closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.background = 'rgba(255, 255, 255, 0.1)';
        closeBtn.style.color = 'rgba(255, 255, 255, 0.6)';
      });
      closeBtn.addEventListener('click', () => this.hidePanel());

      this.panel.appendChild(closeBtn);
      this.panel.appendChild(header);
      this.panel.appendChild(linksContainer);
      document.body.appendChild(this.panel);
    }

    hidePanel() {
      if (this.panel) {
        this.panel.remove();
        this.panel = null;
      }
      this.isActive = false;
    }

    destroy() {
      if (this.checkInterval) {
        clearInterval(this.checkInterval);
        this.checkInterval = null;
      }
      this.hidePanel();
    }
  }

  // 掛載到全域
  window.GSSTracker = GSSTracker;

  // 【自動初始化】創建全域實例
  const trackerInstance = new GSSTracker();
  window._gssTracker = trackerInstance;
})();
