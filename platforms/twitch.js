/**
 * Twitch Platform Adapter
 * Twitch 平台的發圖邏輯適配器
 */

class TwitchAdapter extends PlatformAdapter {
  constructor() {
    super();
    this.name = 'twitch';
    this.isSendingMessage = false;
  }

  /**
   * 檢查是否為 Twitch 平台
   */
  isMatch() {
    return window.location.hostname.includes('twitch.tv');
  }

  /**
   * 尋找 Twitch 聊天室輸入框
   */
  findChatInput() {
    const selectors = [
      '[data-a-target="chat-input"]',
      '.chat-wysiwyg-input__editor',
      '[contenteditable="true"]'
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
      '[data-a-target="chat-input-container"]',
      '.chat-input__container',
      '.chat-input-container',
      '.chat-input__textarea',
      '[class*="chat-input"]'
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
    return document.querySelector('[data-a-target="emote-picker-button"]');
  }

  /**
   * 發送聊天訊息 (Twitch - 只填充輸入框)
   * Twitch 的 React 輸入框很敏感，只觸發事件不自動發送
   */
  async sendMessage(message) {
    // 設置保護標誌，暫停其他掃描
    this.isSendingMessage = true;

    try {
      const chatInput = this.findChatInput();

      if (!chatInput) {
        throw new Error('找不到 Twitch 聊天輸入框');
      }

      // GSS 格式直接發送原始 ID，不使用零寬編碼

      // 聚焦輸入框
      chatInput.focus();

      // 觸發 beforeinput 事件，讓 React 準備接收輸入
      const beforeInput = new InputEvent('beforeinput', {
        bubbles: true,
        cancelable: true,
        inputType: 'insertText',
        data: message
      });
      chatInput.dispatchEvent(beforeInput);

      // 使用 execCommand 讓瀏覽器處理插入
      const success = document.execCommand('insertText', false, message);

      if (!success) {
        // execCommand 失敗，嘗試 paste 事件
        try {
          const dt = new DataTransfer();
          dt.setData('text/plain', message);
          const pasteEvent = new ClipboardEvent('paste', {
            bubbles: true,
            cancelable: true,
            clipboardData: dt
          });
          chatInput.dispatchEvent(pasteEvent);
        } catch (e) {
          // 忽略錯誤
        }
      }

      // 觸發 input 事件，通知 React 值已改變
      const inputEvent = new InputEvent('input', {
        bubbles: true,
        inputType: 'insertText',
        data: message
      });
      chatInput.dispatchEvent(inputEvent);

      // 觸發 change 事件
      chatInput.dispatchEvent(new Event('change', { bubbles: true }));

      // Twitch 不自動發送，讓用戶手動按 Enter
      return { ok: true };
    } finally {
      // 延遲清除標誌
      setTimeout(() => {
        this.isSendingMessage = false;
      }, 500);
    }
  }

  /**
   * Twitch 不支援零寬編碼，直接發送明文
   * 使用 StickerRegistry 處理格式轉換
   */
  async sendHiddenMessage(message) {
    // 使用 StickerRegistry 获取 Twitch 平台特定格式
    const sendCode = StickerRegistry.getSendCode(message, 'twitch') || message;
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
  module.exports = { TwitchAdapter };
}
if (typeof window !== 'undefined') {
  window.GSS = window.GSS || {};
  window.GSS.TwitchAdapter = TwitchAdapter;
}
