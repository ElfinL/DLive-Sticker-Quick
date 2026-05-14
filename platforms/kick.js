/**
 * Kick Platform Adapter
 * Kick 平台的發圖邏輯適配器
 */

class KickAdapter extends PlatformAdapter {
  constructor() {
    super();
    this.name = 'kick';
    this.isSendingMessage = false;
  }

  /**
   * 檢查是否為 Kick 平台
   */
  isMatch() {
    return window.location.hostname.includes('kick.com');
  }

  /**
   * 尋找 Kick 聊天室輸入框
   */
  findChatInput() {
    const selectors = [
      '[data-testid="chat-input"]',                // Kick 主要輸入框 (contenteditable div)
      '#chat-input-wrapper [contenteditable="true"]', // Kick contenteditable
      '.chat-input [contenteditable="true"]',      // Kick chatroom 輸入框
      '[contenteditable="true"]',                  // 通用 contenteditable
      '[data-a-target="chat-input"]',             // 備援
      'textarea[placeholder*="Send a message" i]', // 備援
      'textarea[placeholder*="chat" i]',            // 通用
      'textarea[placeholder*="message" i]',      // 通用
      '.chat-input textarea',                       // 通用
      'textarea[class*="chat" i]',                 // 通用
      'input[placeholder*="message" i]',           // chatroom 可能用 input
      'input[placeholder*="chat" i]'               // chatroom 可能用 input
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
      '#chat-container',                           // Kick 聊天室容器
      '[data-a-target="chat-container"]',           // Kick data attribute
      '.chat-container',                           // 通用
      '.chat-wrapper',                             // 通用
      '.chat-room',                                // 通用
      '.chat',                                     // chatroom 簡化容器
      '[class*="chat-input"]',                     // chatroom 輸入區域
      '.chat-interface',                           // chatroom 介面
      '#chat'                                      // 最簡單的 chat id
    ];

    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el) return el;
    }
    return null;
  }

  /**
   * 發送聊天訊息 (Kick)
   * KICK 使用 contenteditable div，需要特殊處理
   */
  async sendMessage(message) {
    this.isSendingMessage = true;

    try {
      const chatInput = this.findChatInput();

      if (!chatInput) {
        throw new Error('找不到 Kick 聊天輸入框');
      }

      console.log('[KickAdapter] sendMessage called with:', message);

      // GSS 格式直接發送原始 ID，不使用零寬編碼

      // 聚焦輸入框
      chatInput.focus();
      chatInput.click();

      // 等待聚焦完成
      await this.delay(50);

      // 判斷是 contenteditable 還是 textarea/input
      const isContentEditable = chatInput.contentEditable === 'true' || chatInput.isContentEditable;

      if (isContentEditable) {
        // ===== contenteditable div（KICK 主要輸入框）=====
        console.log('[KickAdapter] Using contenteditable mode');

        // 選擇所有內容並刪除
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(chatInput);
        selection.removeAllRanges();
        selection.addRange(range);
        document.execCommand('delete', false, null);

        console.log('[KickAdapter] Inserting text:', message);
        // 插入訊息
        document.execCommand('insertText', false, message);

        // 【注意】KICK 不需要觸發 input 事件，否則會導致重複發送
        // 只使用 Enter 鍵發送
      } else {
        // ===== textarea/input（備援）=====
        chatInput.value = message;
        chatInput.dispatchEvent(new InputEvent('input', {
          bubbles: true,
          cancelable: true,
          inputType: 'insertText',
          data: message
        }));
      }

      // 等待 DOM 更新
      await this.delay(50);

      // 發送訊息（模擬 Enter 鍵）
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
