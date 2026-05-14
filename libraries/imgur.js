/**
 * Imgur 圖庫適配器 (IM-xxx)
 */
class ImgurAdapter extends LibraryAdapter {
  constructor() {
    super();
    this.name = 'imgur';
    this.prefix = 'IM-';
    this.baseUrl = 'https://i.imgur.com';
  }

  /**
   * 編碼：Imgur URL → IM-xxx
   * @param {string} url - Imgur URL
   * @param {boolean} useTwitchFormat - 是否使用 Twitch 格式（-分隔）
   * @returns {string|null} - 如 IM-ha3eTC7-gif
   */
  encode(url, useTwitchFormat = false) {
    const match = url.match(/(?:i\.)?imgur\.com\/([a-zA-Z0-9]+)(?:\.(gif|png|jpg|jpeg|mp4))?/i);
    if (!match || match[1].length < 5) return null;
    
    const id = match[1];
    const ext = match[2] || 'gif';
    
    if (useTwitchFormat) {
      return `IM-${id}-${ext}`;
    }
    
    return ext === 'gif' ? `IM-${id}` : `IM-${id}.${ext}`;
  }

  /**
   * 解碼：IM-xxx → Imgur URL
   * @param {string} id - 如 IM-ha3eTC7-gif 或 IM-ha3eTC7.gif
   * @returns {string|null}
   */
  decode(id) {
    if (!id || !id.startsWith('IM-')) return null;
    
    const idPart = id.slice(3);
    if (!idPart || idPart.length < 5) return null;

    // 檢查 -ext 格式 (Twitch)
    const lastDashIndex = idPart.lastIndexOf('-');
    if (lastDashIndex > 0) {
      const possibleExt = idPart.slice(lastDashIndex + 1).toLowerCase();
      if (['gif', 'png', 'jpg', 'jpeg', 'mp4'].includes(possibleExt)) {
        const cleanId = idPart.slice(0, lastDashIndex);
        return `${this.baseUrl}/${cleanId}.${possibleExt}`;
      }
    }

    // 檢查 .ext 格式 (標準)
    const lastDotIndex = idPart.lastIndexOf('.');
    if (lastDotIndex > 0) {
      const possibleExt = idPart.slice(lastDotIndex + 1).toLowerCase();
      if (['gif', 'png', 'jpg', 'jpeg', 'mp4'].includes(possibleExt)) {
        return `${this.baseUrl}/${idPart}`;
      }
    }

    // 無副檔名，預設 .gif
    return `${this.baseUrl}/${idPart}.gif`;
  }

  /**
   * 判斷是否為視頻
   * @param {string} id - 貼圖 ID
   * @returns {boolean}
   */
  isVideo(id) {
    if (!id) return false;
    const lowerId = id.toLowerCase();
    return lowerId.endsWith('-mp4') || lowerId.endsWith('.mp4');
  }

  /**
   * 驗證 ID 格式
   * @param {string} id
   * @returns {boolean}
   */
  isValid(id) {
    return id && id.startsWith('IM-') && id.length > 8;
  }

  /**
   * 從 Imgur URL 提取 ID
   * @param {string} url
   * @returns {string|null}
   */
  extractIdFromUrl(url) {
    return this.encode(url, false);
  }
}

// 匯出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ImgurAdapter };
} else {
  window.ImgurAdapter = ImgurAdapter;
}
