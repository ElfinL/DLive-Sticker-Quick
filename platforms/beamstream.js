/**
 * Beamstream Platform Adapter
 * Beamstream (beamstream.gg) 平台的發圖邏輯適配器
 * 使用 Quasar Framework UI
 */

class BeamstreamAdapter extends PlatformAdapter {
  constructor() {
    super();
    this.name = 'beamstream';
    this.isSendingMessage = false;
  }

  /**
   * 檢查是否為 Beamstream 平台
   */
  isMatch() {
    return window.location.hostname.includes('beamstream.gg');
  }

  /**
   * 尋找 Beamstream 聊天室輸入框
   * 基於 Quasar q-input 組件
   */
  findChatInput() {
    const selectors = [
      'input[enterkeyhint="send"]',                    // 最穩定：有 send 功能的輸入框
      'input[placeholder*="Type your message"]',        // 占位符文字
      '.q-field__native.q-placeholder',                // Quasar 原生輸入框
      'input[type="text"]._ggjyT',                     // 特定 class（可能變動）
      '.q-input input',                                // 通用 Quasar 輸入框
      '._LTHqz input',                                 // 父容器 class
      '.q-field--dark input'                           // Dark 模式的輸入框
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
      '.q-list',                                       // Quasar 列表容器
      '.q-scroll-area',                                // 滾動區域
      '.chat-container',                               // 通用
      '.chat-messages',                                // 通用
      '.q-page-container',                             // Quasar 頁面容器
      '._7aWRm',                                       // Beamstream 特定 class
      '[class*="chat"]'                                // 包含 chat 的 class
    ];

    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el) return el;
    }
    return null;
  }

  /**
   * 尋找發送按鈕
   */
  findSendButton() {
    const selectors = [
      'button[type="button"]._t7VJ8',                  // 特定 class
      'button:has(svg path[d*="M192 416"])',          // SVG send icon
      '.q-btn:has(i.q-icon)',                        // Quasar 按鈕帶圖標
      '.q-btn[tabindex="0"]',                        // 可聚焦按鈕
      'button:has(.q-focus-helper)',                  // Quasar 風格按鈕
      'button._t7VJ8'                                 // 備援
    ];

    for (const selector of selectors) {
      try {
        const el = document.querySelector(selector);
        if (el) return el;
      } catch (e) {
        // 某些 selector（如 :has）可能不被支持
      }
    }
    return null;
  }

  /**
   * 發送聊天訊息 (Beamstream)
   * Beamstream 使用標準 input + 按鈕發送
   */
  async sendMessage(message) {
    this.isSendingMessage = true;

    try {
      const chatInput = this.findChatInput();
      const sendBtn = this.findSendButton();

      if (!chatInput) {
        throw new Error('找不到 Beamstream 聊天輸入框');
      }

      console.log('[BeamstreamAdapter] sendMessage called with:', message);

      // 聚焦輸入框
      chatInput.focus();
      chatInput.click();

      await this.delay(50);

      // 設定值
      chatInput.value = message;

      // 觸發 input 事件
      const inputEvent = new InputEvent('input', {
        bubbles: true,
        cancelable: true,
        inputType: 'insertText',
        data: message
      });
      chatInput.dispatchEvent(inputEvent);

      // 觸發 change 事件
      chatInput.dispatchEvent(new Event('change', { bubbles: true }));

      await this.delay(50);

      // 自動發送訊息（模擬 Enter 鍵）
      const enterEvent = new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13
      });
      chatInput.dispatchEvent(enterEvent);

      await this.delay(50);

      const enterUpEvent = new KeyboardEvent('keyup', {
        bubbles: true,
        cancelable: true,
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13
      });
      chatInput.dispatchEvent(enterUpEvent);

      console.log('[BeamstreamAdapter] Message sent automatically');
      return { ok: true };
    } finally {
      this.isSendingMessage = false;
    }
  }

  /**
   * 延遲函數
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
