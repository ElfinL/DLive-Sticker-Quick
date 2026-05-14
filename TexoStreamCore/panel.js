// Texo Stream Core - 浮動資訊面板 (聊天面板用)
// 【隸屬：GSS 聊天面板 (content.js)】
// 顯示實況主多平台頻道狀態，固定在直播頁面左上角

// 所有語言的內建備用翻譯
const TSC_I18N = {
  'zh-TW': {
    tscLoading: '載入中...',
    tscMainChannel: '主頻道',
    tscShared: '主聊天室',
    tscChat: '聊天',
    tscChannel: '頻道',
    tscStreamer: '實況主',
    tscNotSet: '未設定',
    tscSetupHint: '請在【管理面板】→【編織】設定資料<br>格式：@名稱 #網址 #網址',
    tscStreamers: (n) => `${n} 位實況主`,
    tscSingleStreamer: '實況主',
    tscViewers: (n) => `${n} 人觀看`,
  },
  'zh-CN': {
    tscLoading: '载入中...',
    tscMainChannel: '主频道',
    tscShared: '主聊天室',
    tscChat: '聊天',
    tscChannel: '频道',
    tscStreamer: '主播',
    tscNotSet: '未设定',
    tscSetupHint: '请在【管理面板】→【编织】设定资料<br>格式：@名称 #网址 #网址',
    tscStreamers: (n) => `${n} 位主播`,
    tscSingleStreamer: '主播',
    tscViewers: (n) => `${n} 人观看`,
  },
  'en': {
    tscLoading: 'Loading...',
    tscMainChannel: 'Main',
    tscShared: 'Main',
    tscChat: 'Chat',
    tscChannel: 'Ch',
    tscStreamer: 'Streamer',
    tscNotSet: 'Not Set',
    tscSetupHint: 'Go to 【Management Panel】→【Weave】to set data<br>Format: @Name #URL #URL',
    tscStreamers: (n) => `${n} Streamers`,
    tscSingleStreamer: 'Streamer',
    tscViewers: (n) => `${n} viewers`,
  },
  'ja': {
    tscLoading: '読み込み中...',
    tscMainChannel: 'メイン',
    tscShared: 'メイン',
    tscChat: 'チャット',
    tscChannel: 'Ch',
    tscStreamer: '配信者',
    tscNotSet: '未設定',
    tscSetupHint: '【管理パネル】→【編織】でデータを設定してください<br>書式：@名前 #URL #URL',
    tscStreamers: (n) => `配信者${n}名`,
    tscSingleStreamer: '配信者',
    tscViewers: (n) => `視聴者${n}人`,
  },
  'ko': {
    tscLoading: '로딩 중...',
    tscMainChannel: '메인',
    tscShared: '메인',
    tscChat: '채팅',
    tscChannel: 'Ch',
    tscStreamer: '스트리머',
    tscNotSet: '미설정',
    tscSetupHint: '【관리 패널】→【편직】에서 데이터를 설정하세요<br>형식: @이름 #URL #URL',
    tscStreamers: (n) => `스트리머 ${n}명`,
    tscSingleStreamer: '스트리머',
    tscViewers: (n) => `시청자 ${n}명`,
  }
};

// 當前語言緩存
let tscCurrentLang = 'zh-TW';

// 從 storage 載入語言設定
function loadTscLanguage() {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.get(['uiLang'], (result) => {
      const lang = result.uiLang;
      if (lang && TSC_I18N[lang]) {
        tscCurrentLang = lang;
      }
    });
  }
}

// 輔助函數：取得翻譯文字
function tscT(key, ...args) {
  // 嘗試從 window.GSS.I18N 取得（如果可用）
  if (typeof window !== 'undefined' && window.GSS && window.GSS.I18N && window.GSS.I18N.t) {
    const result = window.GSS.I18N.t(key, ...args);
    if (result !== undefined && result !== null) return result;
  }
  // 使用內建備用翻譯
  const dict = TSC_I18N[tscCurrentLang] || TSC_I18N['zh-TW'];
  const val = dict[key];
  if (typeof val === 'function') return val(...args);
  return val || key;
}

// 初始化時載入語言
loadTscLanguage();

const TexoPanel = {
  STORAGE_KEY: 'texoStreamData',
  panelId: 'texo_stream_panel',
  collapsed: true,
  CACHE_DURATION: 5 * 60 * 1000, // 5 分鐘緩存
  statusCache: {}, // 緩存 { url: { status, timestamp } }

  // 初始化面板
  init() {
    if (document.getElementById(this.panelId)) return; // 已存在

    // 檢查 TSC 是否啟用
    chrome.storage.local.get(['tscEnabled'], (result) => {
      const isEnabled = result.tscEnabled !== false; // 預設開啟

      if (!isEnabled) {
        // TSC 已禁用，不創建面板
        return;
      }

      this.createPanel();
      this.loadAndRender();

      // 標記是否已自動填充過（避免重複處理）
      this._autoFilled = false;

      // 檢查自動抓取設定
      chrome.storage.local.get(['tscAutoCollect'], (autoResult) => {
        const autoCollect = autoResult.tscAutoCollect !== false;
        if (autoCollect) {
          // 5秒後檢查頁面標記（一般載入速度）
          setTimeout(() => {
            if (!this._autoFilled) {
              this.checkAndAutoFillFromPage();
            }
          }, 5000);

          // 20秒後再檢查一次（慢速載入備案）
          setTimeout(() => {
            if (!this._autoFilled) {
              this.checkAndAutoFillFromPage();
            }
          }, 20000);
        }
      });
    });

    // 監聽 storage 變化，設定改變時處理
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'local') {
        if (changes[this.STORAGE_KEY]) {
          this.loadAndRender();
        }
        // TSC 開關變更
        if (changes.tscEnabled !== undefined) {
          this.handleTscToggle(changes.tscEnabled.newValue);
        }
      }
    });
  },

  // 處理 TSC 開關變更
  handleTscToggle(enabled) {
    const panel = document.getElementById(this.panelId);
    const collapsed = document.getElementById('texo_collapsed');

    if (enabled) {
      // TSC 開啟：顯示面板
      if (panel) {
        panel.style.display = 'block';
      } else {
        // 面板不存在，創建它
        this.init();
      }
    } else {
      // TSC 關閉：隱藏面板
      if (panel) panel.style.display = 'none';
      if (collapsed) collapsed.style.display = 'none';
    }
  },

  // 檢查頁面是否有 #GSS-TexoStreamCore 標籤，自動填充資料（智慧合併）
  checkAndAutoFillFromPage() {
    // 嘗試多種方式獲取頁面文字
    let bodyText = '';
    try {
      bodyText = document.body.innerText || document.body.textContent || '';
    } catch (e) {
      // 獲取 bodyText 失敗，靜默處理
    }

    // 更寬鬆的標記檢測（允許空白）
    const markerPatterns = [
      '#GSS-TexoStreamCore',
      '#GSS- TexoStreamCore',
      'GSS-TexoStreamCore',
      '#GSS-Texo StreamCore'
    ];

    let foundMarker = null;
    let markerIndex = -1;

    for (const marker of markerPatterns) {
      const idx = bodyText.indexOf(marker);
      if (idx >= 0) {
        foundMarker = marker;
        markerIndex = idx;
        break;
      }
    }

    if (!foundMarker) {
      // 頁面無 GSS-TexoStreamCore 標記，靜默返回
      return;
    }


    // 白名單：從 manifest.json content_scripts matches 提取支援的域名
    const getSupportedDomains = () => {
      // Chrome 擴展的 content_scripts matches 格式
      const matches = [
        'https://*.dlive.tv/*',
        'https://*.twitch.tv/*',
        'https://*.vaughn.live/*',
        'https://*.kick.com/*',
        'https://*.youtube.com/*',
        'https://youtube.com/*'
      ];
      return matches.map(pattern => {
        // 從 https://*.domain.com/* 或 https://domain.com/* 提取 domain.com
        const match = pattern.match(/https:\/\/(?:\*\.)?([^\/]+)\//);
        return match ? match[1] : null;
      }).filter(Boolean);
    };

    const supportedDomains = getSupportedDomains();

    const isSupportedUrl = (url) => {
      try {
        const hostname = new URL(url).hostname.toLowerCase();
        return supportedDomains.some(domain => hostname === domain || hostname.endsWith('.' + domain));
      } catch (e) {
        return false;
      }
    };

    // 從 HTML 中提取內容（處理超連結）
    const afterMarker = bodyText.substring(markerIndex + foundMarker.length);

    // 找到下一個 #GSS- 或空行作為結束
    const endMatch = afterMarker.match(/(\n\n|\r\n\r\n|#GSS-)/);
    const contentBlock = endMatch ? afterMarker.substring(0, endMatch.index) : afterMarker;

    // 解析每一行，處理可能的超連結
    const lines = contentBlock.split(/\n|\r\n/).map(l => l.trim()).filter(l => l);
    let reconstructedText = '';

    for (const line of lines) {
      // 檢查行首符號
      const prefixMatch = line.match(/^([>!#])\s*/);
      if (!prefixMatch) continue; // 不是有效的資料行

      const prefix = prefixMatch[1];
      const content = line.substring(1).trim();

      if (line.includes('http')) {
        // 包含超連結的行 - 需要更細緻處理
        // 先檢查是否是 >名稱 開頭的行
        if (prefix === '>' || prefix === '@') {
          // 這是實況主名稱行，可能包含共用聊天室
          // 提取名稱（第一個非URL的部分）
          const nameMatch = content.match(/^([^!#\s]+)/);
          let name = null;
          if (nameMatch && nameMatch[1] && !nameMatch[1].startsWith('http')) {
            name = nameMatch[1];
          }

          // 提取行中的所有URL
          const allUrls = content.match(/https?:\/\/[^\s]+/g) || [];

          // 如果沒有名稱但URL存在，從URL提取用戶名作為備用
          if (!name && allUrls.length > 0) {
            const firstUrl = allUrls[0];
            // 嘗試從 twitch.tv/xxx 或 dlive.tv/xxx 提取用戶名
            const userMatch = firstUrl.match(/(?:twitch\.tv|dlive\.tv)\/([^\/\s?]+)/);
            if (userMatch) {
              name = userMatch[1];
            }
          }

          if (name && name !== 'undefined') {
            reconstructedText += `>${name}\n`;
            // 然後提取行中的 ! 和 # URL（處理可能有空格的情況）
            const prefixedUrls = content.match(/[!#]\s*https?:\/\/[^\s]+/g);
            if (prefixedUrls) {
              prefixedUrls.forEach(url => {
                const cleanUrl = url.replace(/^[!#]\s*/, '');
                if (isSupportedUrl(cleanUrl)) {
                  reconstructedText += cleanUrl + '\n';
                } else {
                }
              });
            }
          } else {
          }
        } else if (prefix === '!') {
          // 共用聊天室行
          const urlMatch = content.match(/(https?:\/\/[^\s]+)/);
          if (urlMatch && isSupportedUrl(urlMatch[1])) {
            reconstructedText += `!${urlMatch[1]}\n`;
          } else if (urlMatch) {
          }
        } else if (prefix === '#') {
          // 平台頻道行
          const urlMatch = content.match(/(https?:\/\/[^\s]+)/);
          if (urlMatch && isSupportedUrl(urlMatch[1])) {
            reconstructedText += `#${urlMatch[1]}\n`;
          } else if (urlMatch) {
          }
        }
      } else {
        // 不包含 http 的純符號行
        reconstructedText += line + '\n';
      }
    }

    // 從 DOM 中直接查找帶 data-texo 屬性的元素作為備案
    const texoElements = document.querySelectorAll('[data-texo]');
    if (texoElements.length > 0 && reconstructedText.length < 10) {
      texoElements.forEach(el => {
        const type = el.getAttribute('data-texo-type') || '#';
        const url = el.getAttribute('data-texo-url') || el.textContent.trim();
        if (url && isSupportedUrl(url)) {
          reconstructedText += `${type}${url}\n`;
        } else if (url) {
        }
      });
    }

    if (!reconstructedText || reconstructedText.length < 10) {
      // 備案：動態構建 querySelector，使用相同的域名列表
      const domainSelectors = supportedDomains.map(d => `a[href*="${d}"]`).join(', ');
      const allLinks = Array.from(document.querySelectorAll(domainSelectors));
      if (allLinks.length > 0) {
        reconstructedText = '>AutoDetected\n';
        allLinks.forEach(a => {
          const href = a.getAttribute('href');
          if (href && isSupportedUrl(href)) {
            reconstructedText += `#${href}\n`;
          }
        });
      }
    }


    // 解析頁面資料
    const parsedResult = this.parseMultiStreamers(reconstructedText);
    const pageStreamers = parsedResult.streamers || [];
    if (pageStreamers.length === 0) {
      return;
    }

    // 檢查是否有無效的實況主名稱（如 undefined），如果有則完全取消自動填充
    const hasInvalidStreamer = pageStreamers.some(s => !s.name || s.name === 'undefined' || s.name.startsWith('http'));
    if (hasInvalidStreamer) {
      return;
    }

    // 取得現有資料進行比對
    chrome.storage.local.get([this.STORAGE_KEY], (res) => {
      const existing = res[this.STORAGE_KEY];
      let existingStreamers = [];
      let existingRawText = '';

      if (existing && existing.parsed) {
        // 確保 parsed 是數組
        existingStreamers = Array.isArray(existing.parsed) ? existing.parsed : [existing.parsed];
        existingRawText = existing.rawText || '';
      }

      // 智能更新：同名替換，新名添加
      const mergedStreamers = [];
      const pageStreamerNames = new Set(pageStreamers.map(s => (s.name || '').toLowerCase()));
      const addedNames = [];
      const updatedNames = [];

      // 1. 保留 storage 中不在 page 的實況主（直接使用原始 rawText 部分）
      let keptRawTextParts = [];
      if (existingRawText) {
        const existingLines = existingRawText.split('\n');
        let currentBlock = [];
        let currentName = '';
        for (const line of existingLines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('>') || trimmed.startsWith('@')) {
            // 新的實況主塊，保存前一個
            if (currentName && !pageStreamerNames.has(currentName.toLowerCase()) && currentBlock.length > 0) {
              keptRawTextParts.push(currentBlock.join('\n'));
            }
            currentBlock = [line];
            currentName = trimmed.substring(1).trim().split(/\s+/)[0];
          } else if (currentBlock.length > 0) {
            currentBlock.push(line);
          }
        }
        // 保存最後一個
        if (currentName && !pageStreamerNames.has(currentName.toLowerCase()) && currentBlock.length > 0) {
          keptRawTextParts.push(currentBlock.join('\n'));
        }
      }

      // 2. 構建新的 page 實況主 rawText
      const pageRawTextParts = pageStreamers.map(s => {
        const lines = [];
        if (s.sharedChat) lines.push(`!${s.sharedChat}`);
        if (s.baseChat) lines.push(`#${s.baseChat}`);
        if (s.platforms) {
          s.platforms.forEach(url => lines.push(`#${url}`));
        }
        return `>${s.name}\n${lines.join('\n')}`;
      });

      // 3. 統計新增/更新
      for (const s of pageStreamers) {
        const name = (s.name || '').toLowerCase();
        const exists = existingStreamers.some(es => (es.name || es.displayName || '').toLowerCase() === name);
        if (exists) {
          updatedNames.push(s.name);
        } else {
          addedNames.push(s.name);
        }
      }

      if (addedNames.length === 0 && updatedNames.length === 0 && keptRawTextParts.length === existingStreamers.length) {
        return;
      }


      // 4. 合併 rawText（保留的 + 新的/更新的）
      const mergedRawText = [...keptRawTextParts, ...pageRawTextParts].join('\n');

      // 儲存合併後的資料
      const dataToSave = {
        rawText: mergedRawText,
        parsed: mergedStreamers,
        timestamp: Date.now()
      };

      chrome.storage.local.set({ [this.STORAGE_KEY]: dataToSave }, () => {
        // 標記已自動填充，後續檢查可跳過
        this._autoFilled = true;
      });
    });
  },

  // 創建面板 DOM
  createPanel() {
    // 【修改】收合按鈕改為依附在網站標誌右邊
    this.createLogoButton();

    // 展開狀態 (完整面板) - 仍然在左上角
    const panel = document.createElement('div');
    panel.id = this.panelId;
    panel.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 12px;
      user-select: none;
      display: none;
    `;

    const expandedPanel = document.createElement('div');
    expandedPanel.id = 'texo_expanded';
    expandedPanel.style.cssText = `
      display: block;
      background: rgba(16, 18, 22, 0.95);
      border: 1px solid #FFF;
      border-radius: 8px;
      padding: 10px 12px;
      min-width: 140px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    `;

    // 標題列 (箭頭 + 主播名稱)
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    `;

    const arrow = document.createElement('span');
    arrow.style.cssText = `
      color: #fff;
      cursor: pointer;
      font-size: 14px;
      width: 20px;
      text-align: center;
    `;
    arrow.innerHTML = '▲';
    arrow.onclick = () => this.collapse();

    const title = document.createElement('span');
    title.id = 'texo_streamer_name';
    title.style.cssText = `
      color: #fff;
      font-weight: 600;
      font-size: 13px;
      flex: 1;
    `;
    title.textContent = tscT('tscLoading');

    header.appendChild(arrow);
    header.appendChild(title);
    expandedPanel.appendChild(header);

    // 頻道列表容器
    const channelList = document.createElement('div');
    channelList.id = 'texo_channel_list';
    channelList.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 6px;
    `;
    expandedPanel.appendChild(channelList);

    panel.appendChild(expandedPanel);
    document.body.appendChild(panel);
  },

  // 【新增】創建網站標誌旁邊的收合按鈕
  createLogoButton() {
    const hostname = window.location.hostname;
    let logoSelector = null;

    // 根據平台選擇對應的標誌
    if (hostname.includes('youtube.com')) {
      // YouTube: 標誌 SVG
      logoSelector = '#logo, ytd-topbar-logo-renderer, #masthead-container a[href="/"], a[href="https://www.youtube.com/"]';
    } else if (hostname.includes('twitch.tv')) {
      logoSelector = 'a[href="/"], [data-a-target="header-logo"], .top-nav__logo, .tw-svg[class*="logo"]';
    } else if (hostname.includes('dlive.tv')) {
      logoSelector = '.header__logo, .application--logo, a[href="/"], [class*="logo"]';
    } else if (hostname.includes('kick.com')) {
      logoSelector = '.kick-logo, a[href="/"], [class*="logo"]';
    } else if (hostname.includes('vaughn.live')) {
      // Vaughn: 只找 img.the_logo，避免選到 div.the_logo
      logoSelector = 'img.the_logo, a[href="/"]';
    } else if (hostname.includes('beamstream.gg')) {
      // Beamstream: 選 a.router-link-active（包含 logo img）
      logoSelector = 'a.router-link-active';
    }

    if (!logoSelector) return;

    // 【平台顏色配置】
    const platformColors = {
      'youtube.com': { main: '#000', text: '#fff', bg: 'rgb(255, 0, 0)' },
      'twitch.tv': { main: '#FFF', text: '#fff', bg: '#A970FF' },
      'dlive.tv': { main: '#000', text: '#fff', bg: '#F2B705' },
      'kick.com': { main: '#000', text: '#000', bg: '#55fc18ec' },
      'vaughn.live': { main: '#033E8C', text: '#fff', bg: '#FFF' },
      'beamstream.gg': { main: '#FFF', text: '#FFF', bg: '#191919' },
    };
    const color = platformColors[Object.keys(platformColors).find(k => hostname.includes(k))] || { main: '#fff', text: '#fff', bg: 'rgba(255, 255, 255, 0.15)' };

    // 嘗試添加按鈕（帶重試）
    let attempts = 0;
    const maxAttempts = 10;

    const tryAddButton = () => {
      attempts++;

      const logo = document.querySelector(logoSelector);
      if (!logo) {
        if (attempts < maxAttempts) {
          setTimeout(tryAddButton, 1000);
        }
        return;
      }

      // 找到標誌的父容器
      let logoContainer = null;

      // Beamstream 特殊處理：使用 a.router-link-active 的父容器，並標記為兄弟模式
      if (hostname.includes('beamstream.gg')) {
        logoContainer = logo.parentElement; // a.router-link-active 的父容器
        logo._beamstreamSibling = true; // 標記為需要作為兄弟元素插入
      } else if (logo.tagName === 'IMG' && logo.classList.contains('the_logo')) {
        // 對於 img.the_logo，依附在 <a> 的父元素（避免按鈕在 <a> 裡觸發連結）
        const aTag = logo.closest('a');
        if (aTag) {
          logoContainer = aTag.parentElement; // 把按鈕放在 <a> 外面
        } else {
          logoContainer = logo.parentElement;
        }
      } else {
        // 其他情況：優先找 <a> 連結
        logoContainer = logo.closest('a') || logo.parentElement;
      }
      if (!logoContainer) {
        console.log('[TSC] Logo container not found');
        return;
      }

      // 檢查是否已有按鈕
      if (logoContainer.querySelector('#texo_collapsed')) {
        console.log('[TSC] Button already exists');
        return;
      }

      console.log('[TSC] Found logo container:', logoContainer.tagName, logoContainer.className);

      // 設置相對定位
      const currentPos = window.getComputedStyle(logoContainer).position;
      if (currentPos === 'static') {
        logoContainer.style.position = 'relative';
      }

      // 【Twitch 專用】調整位置，更靠近標誌
      const rightOffset = hostname.includes('twitch.tv') ? '-15px' : '-30px';

      // 創建收合按鈕（使用平台顏色）
      const collapsedBtn = document.createElement('div');
      collapsedBtn.id = 'texo_collapsed';
      // Beamstream 特殊處理：白色背景，深灰色箭頭
      if (hostname.includes('beamstream.gg')) {
        collapsedBtn.style.cssText = `
          position: absolute !important;
          right: ${rightOffset} !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
          width: 24px !important;
          height: 24px !important;
          background: #FFF !important;
          border: 1px solid #191919 !important;
          border-radius: 4px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: pointer !important;
          color: #191919 !important;
          font-size: 12px !important;
          z-index: 999999 !important;
          font-family: Arial, sans-serif !important;
        `;
      } else if (hostname.includes('vaughn.live')) {
        // Vaughn 特殊處理：白色背景，藍色箭頭
        collapsedBtn.style.cssText = `
          position: absolute !important;
          right: ${rightOffset} !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
          width: 24px !important;
          height: 24px !important;
          background: #FFF !important;
          border: 1px solid #033E8C !important;
          border-radius: 4px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: pointer !important;
          color: #033E8C !important;
          font-size: 12px !important;
          z-index: 999999 !important;
          font-family: Arial, sans-serif !important;
        `;
      } else {
        collapsedBtn.style.cssText = `
          position: absolute;
          right: ${rightOffset};
          top: 50%;
          transform: translateY(-50%);
          width: 24px;
          height: 24px;
          background: ${color.bg};
          border: 1px solid ${color.main};
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: ${color.main};
          font-size: 12px;
          z-index: 999999;
          font-family: Arial, sans-serif;
        `;
      }
      collapsedBtn.innerHTML = '▼';
      collapsedBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.expand();
      };

      // Beamstream 特殊處理：插入到 a.router-link-active 裡面，使用絕對定位
      if (logo._beamstreamSibling) {
        // 設置 logo 為相對定位，讓按鈕相對於 logo 定位
        logo.style.position = 'relative';
        // 插入到 a.router-link-active 裡面
        logo.appendChild(collapsedBtn);
        // 保持絕對定位樣式（跟其他平台一致）
      } else {
        logoContainer.appendChild(collapsedBtn);
      }
      console.log('[TSC] Logo button added to', hostname);
    };

    // 開始嘗試（延遲1秒開始）
    setTimeout(tryAddButton, 1000);
  },

  // 展開面板
  async expand() {
    const panel = document.getElementById(this.panelId);
    const collapsed = document.getElementById('texo_collapsed');
    const expanded = document.getElementById('texo_expanded');
    if (panel && collapsed && expanded) {
      // 【修改】面板左上角對齊按鈕左上角
      const btnRect = collapsed.getBoundingClientRect();
      panel.style.top = btnRect.top + 'px';
      panel.style.left = btnRect.left + 'px';

      panel.style.display = 'block';
      collapsed.style.display = 'none';
      expanded.style.display = 'block';
      this.collapsed = false;

      // 展開時刷新狀態檢測
      await this.refreshStatus();
    }
  },

  // 刷新所有頻道開台狀態（帶緩存）
  async refreshStatus() {
    const list = document.getElementById('texo_channel_list');
    if (!list) return;

    const buttons = list.querySelectorAll('[data-url]');
    const now = Date.now();

    for (const btn of buttons) {
      const url = btn.getAttribute('data-url');
      const dot = btn.querySelector('[data-status-dot]');
      if (!url || !dot) continue;

      // 檢查緩存
      const cached = this.statusCache[url];
      if (cached && (now - cached.timestamp < this.CACHE_DURATION)) {
        this.updateStatusDot(dot, cached.status, cached.extra);
        continue;
      }

      // 檢測狀態並更新緩存
      const result = await this.checkStreamStatus(url);
      const status = typeof result === 'string' ? result : result.status;
      this.statusCache[url] = { status, timestamp: now, extra: typeof result === 'object' ? result : null };
      this.updateStatusDot(dot, status, this.statusCache[url].extra);
    }

  },

  // 更新狀態點顏色
  updateStatusDot(dot, status, extra) {
    const colors = {
      online: '#28a745',   // 綠色 - 開台
      offline: '#dc3545', // 紅色 - 未開台
      unknown: '#6c757d'  // 灰色 - 未知
    };
    dot.style.background = colors[status] || colors.unknown;
    // 如果有觀看人數和標題，更新 tooltip
    if (extra?.watchingCount !== undefined) {
      const tooltip = `${extra.title || ''} (${tscT('tscViewers', extra.watchingCount)})`;
      dot.parentElement.title = tooltip;
    }
  },

  // 檢測單一頻道開台狀態（使用 background script 解決 CORS）
  async checkStreamStatus(url) {
    try {
      // 發送消息到 background script 進行跨域請求
      const result = await new Promise((resolve) => {
        chrome.runtime.sendMessage({
          type: 'CHECK_STREAM_STATUS',
          url: url
        }, (response) => {
          resolve(response || { status: 'unknown' });
        });
      });
      return result.status || 'unknown';
    } catch (e) {
      return 'unknown';
    }
  },

  // 注意：所有平台狀態檢測都通過 background script 進行，避免 CORS 問題

  // 檢測 YouTube 開台狀態（調用 background script，無需 API Key）
  async checkYouTubeStatus(url) {
    return await this.checkStreamStatus(url);
  },

  // 檢測 Kick 開台狀態（調用 background script）
  async checkKickStatus(url) {
    return await this.checkStreamStatus(url);
  },

  // 更新狀態點顏色
  updateStatusDot(dot, status) {
    const colors = {
      online: '#28a745',   // 綠色 - 開台
      offline: '#dc3545', // 紅色 - 未開台
      shared: '#78beff',  // 藍色 - 共用聊天
      unknown: '#6c757d'  // 灰色 - 未知
    };
    dot.style.background = colors[status] || colors.unknown;
    dot.setAttribute('data-status', status);
  },

  // 收合面板
  collapse() {
    const panel = document.getElementById(this.panelId);
    const collapsed = document.getElementById('texo_collapsed');
    const expanded = document.getElementById('texo_expanded');
    if (panel && collapsed && expanded) {
      panel.style.display = 'none';
      collapsed.style.display = 'flex';
      expanded.style.display = 'none';
      this.collapsed = true;
    }
  },

  // 載入資料並渲染
  loadAndRender() {
    chrome.storage.local.get([this.STORAGE_KEY], (res) => {
      const data = res[this.STORAGE_KEY];
      if (!data || (!data.parsed && !data.rawText)) {
        this.renderEmpty();
        return;
      }
      // 優先重新解析原始文字（支援多實況主）
      let parsed;
      if (data.rawText) {
        parsed = this.parseMultiStreamers(data.rawText);
      } else {
        parsed = data.parsed;
      }
      this.renderData(parsed);
    });
  },

  // 解析多實況主資料 (支援多個 @ 區塊)
  parseMultiStreamers(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    const streamers = [];
    let currentStreamer = null;

    for (const line of lines) {
      // 同時支援 @ 和 > 作為實況主名稱前綴（> 不會被平台過濾）
      if (line.startsWith('@') || line.startsWith('>')) {
        // 新的實況主區塊，儲存前一個
        if (currentStreamer) {
          streamers.push(currentStreamer);
        }
        // 解析 > 行：>名稱 #網址 !網址（> 避免被平台過濾）
        const afterAt = line.substring(1).trim();
        const parts = afterAt.split(/\s+/).filter(p => p);
        const name = parts[0];
        if (!name || name.startsWith('http') || name === 'undefined') {
          continue; // 跳過無效的實況主行
        }
        currentStreamer = {
          name: name,
          baseChat: '',
          sharedChat: '',
          platforms: []
        };
        // 同一行可能有 # 主頻道 和 ! 共用聊天室
        for (const part of parts.slice(1)) {
          if (part.startsWith('#') && !currentStreamer.baseChat) {
            currentStreamer.baseChat = part.substring(1);
          } else if (part.startsWith('!') && !currentStreamer.sharedChat) {
            currentStreamer.sharedChat = part.substring(1);
          }
        }
      } else if (line.startsWith('#')) {
        // 直播平台 - 移除 # 後面的所有內容
        const url = line.substring(1).trim();
        if (currentStreamer && url) {
          if (!currentStreamer.baseChat) {
            currentStreamer.baseChat = url; // 第一個 # = 主頻道
          } else {
            currentStreamer.platforms.push(url);
          }
        }
      } else if (line.startsWith('!')) {
        // 共用聊天室
        const url = line.substring(1).trim();
        if (currentStreamer && url && !currentStreamer.sharedChat) {
          currentStreamer.sharedChat = url;
        }
      }
    }
    // 儲存最後一個實況主
    if (currentStreamer) {
      streamers.push(currentStreamer);
    }
    return { streamers };
  },

  // 解析單一實況主頻道列表
  parseStreamerChannels(streamer) {
    const channels = [];

    // 主聊天室
    if (streamer.baseChat) {
      const label = this.extractLabel(streamer.baseChat, tscT('tscMainChannel'));
      channels.push({
        label,
        url: streamer.baseChat,
        status: 'unknown',
        isMain: true
      });
    }

    // 其他平台 (支援多頻道自動編號)
    const platformCounts = {};
    for (const url of streamer.platforms || []) {
      const lowerUrl = url.toLowerCase();
      let platformType = 'other';
      if (lowerUrl.includes('twitch.tv')) platformType = 'twitch';
      else if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) platformType = 'youtube';
      else if (lowerUrl.includes('kick.com')) platformType = 'kick';
      else if (lowerUrl.includes('dlive.tv')) platformType = 'dlive';
      else if (lowerUrl.includes('vaughn.live')) platformType = 'vaughn';

      platformCounts[platformType] = (platformCounts[platformType] || 0) + 1;
      const index = platformCounts[platformType] - 1;

      const label = this.extractLabel(url, null, index);
      channels.push({
        label,
        url,
        status: 'unknown',
        isMain: false
      });
    }

    // 共用聊天室
    if (streamer.sharedChat) {
      const platformName = this.detectPlatform(streamer.sharedChat);
      const platformDisplay = platformName ? platformName.toUpperCase() : tscT('tscShared');
      channels.push({
        label: `${platformDisplay} ${tscT('tscChat')}`,
        subLabel: streamer.name || streamer.displayName,
        url: streamer.sharedChat,
        status: 'shared',
        isMain: false
      });
    }

    return channels;
  },

  // 從 URL 提取標籤
  extractLabel(url, defaultLabel = null, index = 0) {
    const trimmed = url.trim();

    // 支援格式: 標籤 https://...（空格分隔）
    const spaceMatch = trimmed.match(/^([^\s]+)\s+(https?:\/\/.*)/);
    if (spaceMatch && spaceMatch[2]) {
      // 如果有空格，前面部分是標籤
      const label = spaceMatch[1].replace(/^#/, '');
      return label;
    }

    // 純 URL，自動從網址判斷平台
    const lowerUrl = trimmed.toLowerCase();
    let result;
    if (lowerUrl.includes('twitch.tv')) {
      result = index === 0 ? 'Twitch' : `Twitch${index + 1}`;
    } else if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
      result = index === 0 ? 'YouTube' : `YT${index + 1}`;
    } else if (lowerUrl.includes('kick.com')) {
      result = index === 0 ? 'Kick' : `Kick${index + 1}`;
    } else if (lowerUrl.includes('dlive.tv')) {
      result = index === 0 ? 'DLive' : `DLive${index + 1}`;
    } else if (lowerUrl.includes('vaughn.live')) {
      result = index === 0 ? 'Vaughn' : `Vaughn${index + 1}`;
    } else {
      result = defaultLabel || `${tscT('tscChannel')}${index + 1}`;
    }
    return result;
  },

  // 檢測 URL 屬於哪個平台
  detectPlatform(url) {
    const lower = url.toLowerCase();
    if (lower.includes('twitch.tv')) return 'twitch';
    if (lower.includes('kick.com')) return 'kick';
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
    if (lower.includes('dlive.tv')) return 'dlive';
    if (lower.includes('vaughn.live')) return 'vaughn';
    return null;
  },

  // 渲染多實況主資料
  renderData(parsed) {
    const list = document.getElementById('texo_channel_list');
    const title = document.getElementById('texo_streamer_name');
    if (!list) return;
    list.innerHTML = '';

    // 支援新的多實況主格式或舊格式
    const streamers = parsed.streamers || [parsed];

    // 更新頂部標題：多實況主顯示「實況主們」，單一顯示名稱
    if (title) {
      if (streamers.length > 1) {
        title.textContent = tscT('tscStreamers', streamers.length);
      } else if (streamers[0]?.name || streamers[0]?.displayName) {
        title.textContent = streamers[0].name || streamers[0].displayName;
      } else {
        title.textContent = tscT('tscSingleStreamer');
      }
    }

    for (let i = 0; i < streamers.length; i++) {
      const streamer = streamers[i];
      const channels = this.parseStreamerChannels(streamer);

      // 創建實況主行容器
      const row = document.createElement('div');
      row.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: ${i === 0 ? '0' : '8px'} 0 8px 0;
        ${i > 0 ? 'border-top: 1px solid rgba(255,255,255,0.1);' : ''}
        cursor: pointer;
      `;

      // 左側：三角形圖標 + 實況主名稱
      const leftSection = document.createElement('div');
      leftSection.style.cssText = `
        display: flex;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;
      `;

      // 實況主名稱（移除了三角形圖標，改為依附在網站標誌上）
      const nameSpan = document.createElement('span');
      nameSpan.textContent = streamer.name || streamer.displayName || tscT('tscStreamer');
      nameSpan.style.cssText = `
        color: #fff;
        font-weight: 600;
        font-size: 13px;
      `;

      leftSection.appendChild(nameSpan);
      row.appendChild(leftSection);

      // 右側：平台狀態列表（橫向排列）
      const rightSection = document.createElement('div');
      rightSection.style.cssText = `
        display: flex;
        align-items: center;
        gap: 10px;
      `;

      for (const ch of channels) {
        const platformBadge = this.createPlatformBadge(ch);
        rightSection.appendChild(platformBadge);
      }

      row.appendChild(rightSection);

      // 點擊展開/收合頻道詳情（或跳轉到主要平台）
      row.onclick = () => {
        // 默認打開第一個在線的頻道，或第一個頻道
        const onlineCh = channels.find(c => c.status === 'online') || channels[0];
        if (onlineCh) {
          if (onlineCh.status === 'shared' && typeof SharedChat !== 'undefined') {
            SharedChat.open(onlineCh.url);
          } else {
            window.open(onlineCh.url, '_blank');
          }
        }
      };

      list.appendChild(row);
    }
  },

  // 創建平台狀態徽章（右側顯示用）
  createPlatformBadge(ch) {
    const badge = document.createElement('div');
    badge.setAttribute('data-url', ch.url);
    badge.style.cssText = `
      display: flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;
      transition: opacity 0.15s;
    `;
    badge.onmouseenter = () => badge.style.opacity = '0.7';
    badge.onmouseleave = () => badge.style.opacity = '1';
    badge.onclick = (e) => {
      e.stopPropagation(); // 防止觸發父級點擊
      if (ch.status === 'shared' && typeof SharedChat !== 'undefined') {
        SharedChat.open(ch.url);
      } else {
        window.open(ch.url, '_blank');
      }
    };

    // 狀態指示點
    const dot = document.createElement('span');
    dot.setAttribute('data-status-dot', 'true');
    dot.style.cssText = `
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #6c757d;
      flex-shrink: 0;
      transition: background 0.3s ease;
    `;

    // 平台名稱（簡化顯示）
    const label = document.createElement('span');
    label.textContent = ch.label;
    label.style.cssText = `
      color: #fff;
      font-size: 11px;
      font-weight: 500;
    `;

    badge.appendChild(dot);
    badge.appendChild(label);
    return badge;
  },

  // 無資料時的顯示
  renderEmpty() {
    const title = document.getElementById('texo_streamer_name');
    const list = document.getElementById('texo_channel_list');
    if (title) title.textContent = tscT('tscNotSet');
    if (list) {
      list.textContent = '';
      const div = document.createElement('div');
      div.style.cssText = 'color:#868e96;font-size:11px;padding:4px;';
      div.textContent = tscT('tscSetupHint');
      list.appendChild(div);
    }
  },

  // 移除面板
  destroy() {
    const panel = document.getElementById(this.panelId);
    if (panel) panel.remove();
  }
};

// 導出
if (typeof module !== 'undefined') module.exports = TexoPanel;

// 監聽語言設定變化（在 TexoPanel 定義之後）
if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.uiLang) {
      const newLang = changes.uiLang.newValue;
      if (newLang && TSC_I18N[newLang]) {
        tscCurrentLang = newLang;
        // 重新渲染面板以套用新語言
        if (typeof TexoPanel !== 'undefined' && TexoPanel.loadAndRender) {
          TexoPanel.loadAndRender();
        }
      }
    }
  });
}
