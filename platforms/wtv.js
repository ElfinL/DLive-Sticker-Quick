/**
 * W.TV Platform Adapter
 * w.tv 平台適配器 - 支援貼圖發送和轉圖功能
 */

class WTVAdapter extends PlatformAdapter {
  constructor() {
    super();
    this.name = 'wtv';
  }

  /**
   * 檢查當前頁面是否為 w.tv 平台
   * @returns {boolean}
   */
  isMatch() {
    return window.location.hostname.includes('w.tv');
  }

  /**
   * 尋找聊天室輸入框元素
   * @returns {HTMLElement|null}
   */
  findChatInput() {
    // w.tv 使用 contenteditable div 作為輸入框
    const input = document.querySelector('div[contenteditable="true"]');
    if (input && input.closest('[data-testid="chat-message-input"]')) {
      return input;
    }
    return null;
  }

  /**
   * 尋找聊天室容器元素
   * @returns {HTMLElement|null}
   */
  findChatContainer() {
    return document.querySelector('[data-chat-scroll-container]');
  }

  /**
   * 發送聊天訊息
   * @param {string} message - 要發送的訊息內容
   * @returns {Promise<{ok: boolean, id?: string, error?: string}>}
   */
  async sendMessage(message) {
    try {
      const input = this.findChatInput();
      if (!input) {
        return { ok: false, error: '找不到聊天輸入框' };
      }

      // 聚焦輸入框
      input.focus();

      // 清空現有內容
      input.textContent = '';

      // 設置新訊息
      input.textContent = message;

      // 觸發 input 事件
      const inputEvent = new Event('input', { bubbles: true });
      input.dispatchEvent(inputEvent);

      // 等待一小段時間確保訊息被處理
      await new Promise(resolve => setTimeout(resolve, 100));

      // 模擬 Enter 鍵發送
      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true,
        cancelable: true
      });
      input.dispatchEvent(enterEvent);

      // 再次觸發 keyup 事件
      const keyupEvent = new KeyboardEvent('keyup', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true,
        cancelable: true
      });
      input.dispatchEvent(keyupEvent);

      return { ok: true, id: Date.now().toString() };
    } catch (error) {
      console.error('[WTV Adapter] 發送訊息失敗:', error);
      return { ok: false, error: error.message };
    }
  }

  /**
   * 取得聊天訊息中的圖片
   * @returns {Array<{url: string, element: HTMLElement, messageId: string}>}
   */
  getChatImages() {
    const images = [];
    const messageContainers = document.querySelectorAll('[data-testid="chat-message-container"]');

    messageContainers.forEach(container => {
      const emojiImages = container.querySelectorAll('img[data-testid="emoji-image"]');
      emojiImages.forEach(img => {
        // 取得圖片 URL (優先使用 webp 格式)
        let imageUrl = img.src;
        if (!imageUrl && img.querySelector('source')) {
          const webpSource = img.querySelector('source[type="image/webp"]');
          if (webpSource) {
            imageUrl = webpSource.getAttribute('srcset')?.split(' ')[0];
          }
        }

        if (imageUrl) {
          // 取得訊息 ID
          const messageElement = container.closest('[data-testid^="message-"]');
          const messageId = messageElement ? messageElement.getAttribute('data-testid') : 'unknown';

          images.push({
            url: imageUrl,
            element: img,
            messageId: messageId
          });
        }
      });
    });

    return images;
  }

  /**
   * 檢查圖片是否為表情符號
   * @param {HTMLElement} imgElement - 圖片元素
   * @returns {boolean}
   */
  isEmojiImage(imgElement) {
    return imgElement.hasAttribute('data-testid') && 
           imgElement.getAttribute('data-testid') === 'emoji-image';
  }

  /**
   * 取得平台名稱
   * @returns {string}
   */
  getName() {
    return 'wtv';
  }
}

// 支援 CommonJS 和 ES Module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { WTVAdapter };
}
if (typeof window !== 'undefined') {
  window.GSS = window.GSS || {};
  window.GSS.WTVAdapter = WTVAdapter;
}
