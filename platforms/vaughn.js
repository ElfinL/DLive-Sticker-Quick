/**
 * Vaughn Platform Adapter
 * Vaughn 平台的發圖邏輯適配器
 */

class VaughnAdapter extends PlatformAdapter {
  constructor() {
    super();
    this.name = 'vaughn';
    this.isSendingMessage = false;
  }

  /**
   * 檢查是否為 Vaughn 平台
   */
  isMatch() {
    return window.location.hostname.includes('vaughn.live');
  }

  /**
   * 尋找 Vaughn 聊天室輸入框
   */
  findChatInput() {
    const selectors = [
      '#vs_chatv9_input_box',                      // Vaughn 主要輸入框
      '.vs_chatv9_input_box textarea',             // 備援
      '.vs_chatv9_input_box input',              // 備援
      '[placeholder*="Type something nice" i]',   // Vaughn placeholder
      '[placeholder*="chat" i]',                   // 通用
      '[placeholder*="message" i]'                // 通用
    ];

    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el) return el;
    }
    return null;
  }

  /**
   * 尋找聊天室容器
   */
  findChatContainer() {
    const selectors = [
      '.vs_chatv9_input_box',                      // Vaughn 輸入框容器
      '.vs_chat_container',                          // Vaughn 聊天室容器
      '.vs_chatv9',                                  // Vaughn 聊天區
      '.chat-container',                             // 通用
      '.chat-wrapper',                               // 通用
      '#chat-container'                              // 通用
    ];

    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el) return el;
    }
    return null;
  }

  /**
   * 發送聊天訊息 (Vaughn)
   */
  async sendMessage(message) {
    this.isSendingMessage = true;

    try {
      const chatInput = this.findChatInput();

      if (!chatInput) {
        throw new Error('找不到 Vaughn 聊天輸入框');
      }

      // 聚焦輸入框
      chatInput.focus();
      chatInput.click();

      // 清除現有內容
      if (chatInput.tagName === 'INPUT' || chatInput.tagName === 'TEXTAREA') {
        chatInput.value = message;

        // 觸發 input 事件
        const inputEvent = new Event('input', { bubbles: true });
        chatInput.dispatchEvent(inputEvent);

        // 觸發 change 事件
        const changeEvent = new Event('change', { bubbles: true });
        chatInput.dispatchEvent(changeEvent);
      } else {
        // contenteditable 元素
        chatInput.textContent = message;

        // 觸發 input 事件
        const inputEvent = new InputEvent('input', {
          bubbles: true,
          inputType: 'insertText',
          data: message
        });
        chatInput.dispatchEvent(inputEvent);
      }

      // 尋找並點擊發送按鈕，或模擬 Enter 鍵
      const sendButton = document.querySelector('#chat-send-btn, .chat-send-btn, [class*="send"]');
      if (sendButton && !sendButton.disabled) {
        sendButton.click();
      } else {
        // 模擬 Enter 鍵
        const enterEvent = new KeyboardEvent('keydown', {
          key: 'Enter',
          code: 'Enter',
          keyCode: 13,
          which: 13,
          bubbles: true,
          cancelable: true
        });
        chatInput.dispatchEvent(enterEvent);

        const keyupEvent = new KeyboardEvent('keyup', {
          key: 'Enter',
          code: 'Enter',
          keyCode: 13,
          which: 13,
          bubbles: true,
          cancelable: true
        });
        chatInput.dispatchEvent(keyupEvent);
      }

      return { ok: true };
    } finally {
      setTimeout(() => {
        this.isSendingMessage = false;
      }, 500);
    }
  }

  /**
   * Vaughn 不支援零寬編碼，直接發送明文
   * 使用 StickerRegistry 處理格式轉換
   */
  async sendHiddenMessage(message) {
    const sendCode = StickerRegistry.getSendCode(message, 'vaughn') || message;
    return await this.sendMessage(sendCode);
  }

  /**
   * 檢查是否正在發送訊息
   */
  isSending() {
    return this.isSendingMessage;
  }
}

// 支援 CommonJS 和 ES Module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { VaughnAdapter };
}
if (typeof window !== 'undefined') {
  window.GSS = window.GSS || {};
  window.GSS.VaughnAdapter = VaughnAdapter;
}
