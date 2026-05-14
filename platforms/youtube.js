/**
 * YouTube Platform Adapter
 * YouTube 平台的發圖邏輯適配器
 */

class YouTubeAdapter extends PlatformAdapter {
  constructor() {
    super();
    this.name = 'youtube';
    this.isSendingMessage = false;
  }

  /**
   * 檢查是否為 YouTube 平台
   */
  isMatch() {
    return window.location.hostname.includes('youtube.com');
  }

  /**
   * 遞迴搜索元素及其 Shadow DOM 中的 contenteditable
   */
  findContentEditableInShadowDOM(element, depth = 0) {
    if (depth > 5) return null; // 防止無限遞迴

    // 檢查當前元素
    if (element.isContentEditable || element.getAttribute('contenteditable') === 'true') {
      return element;
    }

    // 如果元素有 shadowRoot，遞迴搜索
    if (element.shadowRoot) {
      // 在 shadowRoot 內搜索所有子元素
      const shadowElements = element.shadowRoot.querySelectorAll('*');
      for (const shadowEl of shadowElements) {
        if (shadowEl.isContentEditable || shadowEl.getAttribute('contenteditable') === 'true') {
          return shadowEl;
        }
        // 更深層的 shadow DOM
        if (shadowEl.shadowRoot) {
          const found = this.findContentEditableInShadowDOM(shadowEl, depth + 1);
          if (found) return found;
        }
      }
    }

    // 搜索子元素
    const children = element.querySelectorAll('*');
    for (const child of children) {
      if (child.isContentEditable || child.getAttribute('contenteditable') === 'true') {
        return child;
      }
      // 檢查子元素的 shadow DOM
      if (child.shadowRoot) {
        const found = this.findContentEditableInShadowDOM(child, depth + 1);
        if (found) return found;
      }
    }

    return null;
  }

  /**
   * 尋找 YouTube 聊天室輸入框
   * YouTube 使用多層 Shadow DOM，需要遞迴穿透查找
   */
  findChatInput() {
    // 方法 1: 先找輸入框容器
    const inputContainer = document.querySelector('yt-live-chat-text-input-field-renderer');
    if (inputContainer) {
      console.log('[GSS YouTube] 找到輸入框容器，開始搜索內部...');

      // 使用遞迴搜索找到真正的 contenteditable
      const editable = this.findContentEditableInShadowDOM(inputContainer);
      if (editable) {
        console.log('[GSS YouTube] 找到可編輯輸入框:', editable.tagName);
        return editable;
      }
    }

    // 方法 2: 全域搜索所有可能的聊天相關元素
    const chatElements = document.querySelectorAll('yt-live-chat-renderer, yt-live-chat-app');
    for (const chatEl of chatElements) {
      const editable = this.findContentEditableInShadowDOM(chatEl);
      if (editable) {
        console.log('[GSS YouTube] 在聊天室中找到輸入框:', editable.tagName);
        return editable;
      }
    }

    // 方法 3: 遍歷整個頁面所有元素（深度搜索）
    const allElements = document.querySelectorAll('*');
    for (const el of allElements) {
      if (el.shadowRoot) {
        const editable = this.findContentEditableInShadowDOM(el);
        if (editable) {
          // 確認在聊天室上下文
          const inChatContext = el.closest('yt-live-chat') ||
            el.closest('yt-live-chat-renderer') ||
            el.closest('yt-live-chat-text-input-field-renderer');
          if (inChatContext) {
            console.log('[GSS YouTube] 深度搜索找到輸入框:', editable.tagName);
            return editable;
          }
        }
      }
    }

    // 方法 4: 備援選擇器
    const selectors = [
      'textarea[placeholder*="聊天"]',
      'textarea[placeholder*="chat"]',
      'input[placeholder*="說些什麼"]',
      'input[placeholder*="say something"]',
      '#live-chat-input'
    ];

    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el) {
        console.log('[GSS YouTube] 使用備援選擇器找到輸入框:', selector);
        return el;
      }
    }

    console.log('[GSS YouTube] 未找到輸入框');
    return null;
  }

  /**
   * 尋找聊天室容器
   */
  findChatContainer() {
    const selectors = [
      'yt-live-chat-renderer',
      'yt-live-chat-app',
      'yt-live-chat',
      '[class*="live-chat"]'
    ];

    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el) return el;
    }
    return null;
  }

  /**
   * 尋找表情按鈕 (用於插入 GSS 按鈕)
   */
  findEmoteButton() {
    return document.querySelector('yt-live-chat-emoji-button-renderer, button[aria-label*="emoji"], button[aria-label*="表情"]');
  }

  /**
   * 發送聊天訊息 (YouTube - 只填充輸入框)
   * YouTube 的 Web Components 輸入框使用 contenteditable，需要特殊處理
   */
  async sendMessage(message) {
    this.isSendingMessage = true;

    try {
      const chatInput = this.findChatInput();

      if (!chatInput) {
        throw new Error('找不到 YouTube 聊天輸入框');
      }

      console.log('[GSS YouTube] 找到輸入框:', chatInput.tagName, 'contenteditable:', chatInput.isContentEditable);

      // 聚焦輸入框
      chatInput.focus();

      // 等待一下確保聚焦成功
      await new Promise(resolve => setTimeout(resolve, 50));

      // 檢查是否是 contenteditable
      const isContentEditable = chatInput.isContentEditable || chatInput.getAttribute('contenteditable') === 'true';
      console.log('[GSS YouTube] 輸入框類型:', isContentEditable ? 'contenteditable' : 'input/textarea');

      if (isContentEditable) {
        // contenteditable 元素：清空後使用 execCommand 插入
        chatInput.innerHTML = '';
        await new Promise(resolve => setTimeout(resolve, 10));

        // 使用 execCommand 插入文字（這會觸發所有必要事件）
        const success = document.execCommand('insertText', false, message);
        console.log('[GSS YouTube] execCommand insertText:', success ? '成功' : '失敗');

        if (!success) {
          // 備援：直接設置 textContent
          chatInput.textContent = message;
        }

        // 觸發必要事件
        chatInput.dispatchEvent(new Event('input', { bubbles: true }));
        chatInput.dispatchEvent(new Event('change', { bubbles: true }));
      } else {
        // 普通 input/textarea 元素
        chatInput.value = message;

        // 觸發事件
        chatInput.dispatchEvent(new Event('input', { bubbles: true }));
        chatInput.dispatchEvent(new Event('change', { bubbles: true }));
      }

      // 模擬真實鍵盤輸入結束
      chatInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
      chatInput.dispatchEvent(new KeyboardEvent('keyup', { key: 'End', bubbles: true }));

      // 驗證是否真的填入了
      await new Promise(resolve => setTimeout(resolve, 50));
      const finalContent = chatInput.isContentEditable ? chatInput.textContent || chatInput.innerText : chatInput.value;
      console.log('[GSS YouTube] 輸入框當前內容:', finalContent);

      // YouTube 不自動發送，讓用戶手動按 Enter
      console.log('[GSS YouTube] 訊息已填入輸入框:', message);
      return { ok: true };
    } finally {
      setTimeout(() => {
        this.isSendingMessage = false;
      }, 500);
    }
  }

  /**
   * YouTube 不支援零寬編碼，直接發送明文
   * 使用 StickerRegistry 處理格式轉換（圖片直鏈）
   */
  async sendHiddenMessage(message) {
    // 使用 StickerRegistry 获取 YouTube 平台特定格式（圖片直鏈）
    const sendCode = StickerRegistry.getSendCode(message, 'youtube') || message;
    return await this.sendMessage(sendCode);
  }

  /**
   * 檢查是否正在發送訊息 (用於保護機制)
   */
  isSending() {
    return this.isSendingMessage;
  }
}

// 支援 CommonJS 和 ES Module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { YouTubeAdapter };
}
if (typeof window !== 'undefined') {
  window.GSS = window.GSS || {};
  window.GSS.YouTubeAdapter = YouTubeAdapter;
}
