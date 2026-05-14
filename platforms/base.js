/**
 * Platform Base Adapter
 * 所有平台適配器的抽象基底類別
 */

class PlatformAdapter {
  constructor() {
    this.name = 'unknown';
  }

  /**
   * 檢查當前頁面是否為此平台
   * @returns {boolean}
   */
  isMatch() {
    return false;
  }

  /**
   * 發送聊天訊息
   * @param {string} message - 要發送的訊息內容
   * @returns {Promise<{ok: boolean, id?: string, error?: string}>}
   */
  async sendMessage(message) {
    throw new Error('PlatformAdapter.sendMessage() must be implemented by subclass');
  }

  /**
   * 發送帶有零寬編碼的隱藏訊息 (DLive IM/ME 專用)
   * @param {string} message - 要隱藏發送的訊息
   * @returns {Promise<{ok: boolean, error?: string}>}
   */
  async sendHiddenMessage(message) {
    // 預設行為：直接發送明文（平台不支援零寬編碼時）
    return await this.sendMessage(message);
  }

  /**
   * 尋找聊天室輸入框元素
   * @returns {HTMLElement|null}
   */
  findChatInput() {
    return null;
  }

  /**
   * 尋找聊天室容器元素
   * @returns {HTMLElement|null}
   */
  findChatContainer() {
    return null;
  }

  /**
   * 取得平台名稱
   * @returns {string}
   */
  getName() {
    return this.name;
  }
}

// 支援 CommonJS 和 ES Module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PlatformAdapter };
}
if (typeof window !== 'undefined') {
  window.GSS = window.GSS || {};
  window.GSS.PlatformAdapter = PlatformAdapter;
}
