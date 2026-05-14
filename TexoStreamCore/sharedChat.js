/**
 * Shared Chat Module - 主聊天室功能
 * 在 DLive/Vaughn 等页面嵌入 Twitch/Kick 聊天室
 */

const SharedChat = {
  isActive: false,
  sidebar: null,
  originalChat: null,
  currentPlatform: null,

  // 平台配置
  platforms: {
    dlive: {
      chatSelector: '.chat-room, [class*="chat"], .live-chat, .message-list',
      urlPattern: /dlive\.tv/
    },
    twitch: {
      chatSelector: '.chat-list, .chat-room__content, [data-a-target="chat-list"]',
      urlPattern: /twitch\.tv/
    },
    vaughn: {
      chatSelector: '#chat, .chat-container, .chat-messages',
      urlPattern: /vaughn\.live/
    },
    kick: {
      chatSelector: '#chat-container, .chat, .message-list',
      urlPattern: /kick\.com/
    }
  },

  // 检测当前平台
  detectPlatform() {
    const hostname = window.location.hostname;
    for (const [name, config] of Object.entries(this.platforms)) {
      if (config.urlPattern.test(hostname)) {
        this.currentPlatform = name;
        return name;
      }
    }
    return null;
  },

  // 获取原聊天室元素
  getOriginalChat() {
    if (!this.currentPlatform) return null;
    const config = this.platforms[this.currentPlatform];
    return document.querySelector(config.chatSelector);
  },

  // 隐藏原聊天室
  hideOriginalChat() {
    const chat = this.getOriginalChat();
    if (chat) {
      this.originalChat = chat;
      chat.style.display = 'none';
      console.log('[SharedChat] 隱藏原聊天室:', this.currentPlatform);
    }
  },

  // 显示原聊天室
  showOriginalChat() {
    if (this.originalChat) {
      this.originalChat.style.display = '';
      console.log('[SharedChat] 恢復原聊天室');
    }
  },

  // 解析主聊天室 URL（提取频道名）
  parseChatUrl(url) {
    // Twitch: https://www.twitch.tv/popout/channel/chat
    const twitchMatch = url.match(/twitch\.tv\/(?:popout\/)?([^\/\?]+)/i);
    if (twitchMatch) {
      return { platform: 'twitch', channel: twitchMatch[1] };
    }

    // Kick: https://kick.com/channel/chat
    const kickMatch = url.match(/kick\.com\/([^\/\?]+)/i);
    if (kickMatch) {
      return { platform: 'kick', channel: kickMatch[1] };
    }

    return null;
  },

  // 创建 Twitch embed URL（用于iframe嵌入）
  createTwitchEmbed(channel) {
    const parent = window.location.hostname;
    return `https://www.twitch.tv/embed/${channel}/chat?parent=${parent}&darkpopout`;
  },

  // 创建 Kick embed URL（用于iframe嵌入）
  // 注意：KICK 有严格的安全策略，可能无法在所有页面嵌入
  createKickEmbed(channel) {
    return `https://kick.com/${channel}/chatroom`;
  },

  // 检查 KICK 是否可以在当前页面嵌入
  canEmbedKick() {
    // KICK 在 DLive 和 Vaughn 页面可能因 CSRF 限制无法嵌入
    const hostname = window.location.hostname;
    if (hostname.includes('dlive.tv') || hostname.includes('vaughn.live')) {
      // 这些平台可能受 CSRF 限制
      return { allowed: true, warning: 'kick_csrf' };
    }
    return { allowed: true };
  },

  // 创建主聊天室侧边栏（带iframe嵌入）
  createSidebar(url) {
    const parsed = this.parseChatUrl(url);
    if (!parsed) {
      console.log('[SharedChat] 無法解析聊天 URL:', url);
      return null;
    }

    // 创建侧边栏容器
    const sidebar = document.createElement('div');
    sidebar.id = 'texo-shared-chat-sidebar';
    sidebar.style.cssText = `
      position: fixed;
      top: 0;
      right: 0;
      width: 340px;
      height: 100vh;
      background: #0e0e10;
      border-left: 1px solid rgba(255,255,255,0.1);
      z-index: 9999;
      display: flex;
      flex-direction: column;
      box-shadow: -4px 0 20px rgba(0,0,0,0.5);
    `;

    // 標題欄
    const header = document.createElement('div');
    header.style.cssText = `
      padding: 10px 16px;
      background: #18181b;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
    `;

    // 標題文字容器（兩行）
    const titleContainer = document.createElement('div');
    titleContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 2px;
    `;

    // 第一行：實況主名
    const streamerName = document.createElement('span');
    streamerName.textContent = parsed.channel;
    streamerName.style.cssText = `
      color: #fff;
      font-size: 14px;
      font-weight: 600;
    `;

    // 第二行：平台 聊天室
    const chatLabel = document.createElement('span');
    chatLabel.textContent = `${parsed.platform.toUpperCase()} 聊天室`;
    chatLabel.style.cssText = `
      color: rgba(255,255,255,0.6);
      font-size: 11px;
    `;

    titleContainer.appendChild(streamerName);
    titleContainer.appendChild(chatLabel);

    // 关闭按钮
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = `
      background: none;
      border: none;
      color: rgba(255,255,255,0.6);
      font-size: 18px;
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
    closeBtn.onclick = () => this.close();

    const btnGroup = document.createElement('div');
    btnGroup.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
    `;
    btnGroup.appendChild(closeBtn);

    header.appendChild(titleContainer);
    header.appendChild(btnGroup);

    // iframe 容器
    const iframeContainer = document.createElement('div');
    iframeContainer.style.cssText = `
      flex: 1;
      overflow: hidden;
      position: relative;
    `;

    // 创建 iframe
    let iframeUrl;
    if (parsed.platform === 'twitch') {
      iframeUrl = this.createTwitchEmbed(parsed.channel);
    } else if (parsed.platform === 'kick') {
      iframeUrl = this.createKickEmbed(parsed.channel);
    }

    if (iframeUrl) {
      const iframe = document.createElement('iframe');
      iframe.src = iframeUrl;
      iframe.id = 'texo-shared-chat-iframe';
      iframe.style.cssText = `
        width: 100%;
        height: 100%;
        border: none;
      `;
      iframeContainer.appendChild(iframe);
    } else {
      iframeContainer.innerHTML = `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: rgba(255,255,255,0.5);
          font-size: 14px;
          text-align: center;
          padding: 20px;
        ">
          暫不支援此平台嵌入
        </div>
      `;
    }

    sidebar.appendChild(header);
    sidebar.appendChild(iframeContainer);

    return sidebar;
  },

  // 打开主聊天室
  open(url) {
    if (this.isActive) {
      this.close();
    }

    const platform = this.detectPlatform();
    if (!platform) {
      console.log('[SharedChat] 不支援的平台');
      return;
    }

    const parsed = this.parseChatUrl(url);
    if (!parsed) {
      console.log('[SharedChat] 無法解析聊天 URL:', url);
      return;
    }

    // 檢查跨平台限制：KICK 頁面無法嵌入 Twitch 聊天（Twitch 安全策略限制）
    if (platform === 'kick' && parsed.platform === 'twitch') {
      // 使用多語言警告文本（如果 t() 函數可用）
      const warningText = typeof t === 'function' ? t('sharedChatKickTwitchWarning') : '⚠️ Twitch 聊天室無法在 KICK 頁面嵌入\n\n這是 Twitch 的安全策略限制，\n請在 DLive 或 Vaughn 頁面使用 Twitch 主聊天室。';
      alert(warningText);
      return;
    }

    console.log('[SharedChat] 開啟主聊天室:', platform, '->', url);

    // 隐藏原聊天室
    this.hideOriginalChat();

    // 创建并显示侧边栏（带 iframe 嵌入）
    this.sidebar = this.createSidebar(url);
    if (this.sidebar) {
      document.body.appendChild(this.sidebar);
      this.isActive = true;

      // 调整页面布局（给侧边栏腾出空间）
      this.adjustLayout(true);

      // 隐藏原页面的 GSS 按钮（因为主聊天室取代了）
      this.hideOriginalGSSButton();

      // 原页面的 GSS 按钮保持隐藏（用户应该在iframe内使用Twitch的GSS）
    }
  },

  // 调整页面布局
  adjustLayout(open) {
    const mainContent = document.querySelector('main, .main-content, .video-container, [class*="content"]');
    if (mainContent && this.currentPlatform === 'dlive') {
      if (open) {
        mainContent.style.marginRight = '340px';
      } else {
        mainContent.style.marginRight = '';
      }
    }
  },

  // 关闭主聊天室
  close() {
    if (this.sidebar) {
      this.sidebar.remove();
      this.sidebar = null;
    }

    this.showOriginalChat();

    // 恢復頁面佈局
    this.adjustLayout(false);

    // 恢復原頁面的 GSS 按鈕
    this.showOriginalGSSButton();

    this.isActive = false;
    console.log('[SharedChat] 關閉主聊天室');
  },

  // 隐藏原页面的 GSS 按钮（主聊天室取代时）
  hideOriginalGSSButton() {
    const btn = document.getElementById('dlsq_btn');
    if (btn) {
      btn.style.display = 'none';
      console.log('[SharedChat] 已隱藏原頁面 GSS 按鈕');
    }
  },

  // 显示原页面的 GSS 按钮
  showOriginalGSSButton() {
    const btn = document.getElementById('dlsq_btn');
    if (btn) {
      btn.style.display = '';
      console.log('[SharedChat] 已恢復原頁面 GSS 按鈕');
    }
  },

  // 初始化
  init() {
    console.log('[SharedChat] 模組已載入');
  }
};

// 导出
if (typeof module !== 'undefined') module.exports = SharedChat;
