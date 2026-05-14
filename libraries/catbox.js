/**
 * Catbox.moe 圖庫適配器 (CB-xxx)
 * 免費匿名文件託管服務，直接 URL 訪問
 */
class CatboxAdapter extends LibraryAdapter {
  constructor() {
    super();
    this.name = 'catbox';
    this.prefix = 'CB-';
    this.baseUrl = 'https://files.catbox.moe';
  }

  /**
   * 編碼：Catbox URL → CB-xxx
   * @param {string} url - Catbox URL (如 https://files.catbox.moe/z8dta6.gif)
   * @param {boolean} useTwitchFormat - 是否使用 Twitch 格式（-分隔）
   * @returns {string|null} - 如 CB-z8dta6-gif
   */
  encode(url, useTwitchFormat = false) {
    const match = url.match(/files\.catbox\.moe\/([a-zA-Z0-9]+)(?:\.(gif|png|jpg|jpeg|mp4|webp))?/i);
    if (!match || match[1].length < 6) return null;
    
    const id = match[1];
    const ext = match[2] || 'gif';
    
    if (useTwitchFormat) {
      return `CB-${id}-${ext}`;
    }
    
    return ext === 'gif' ? `CB-${id}` : `CB-${id}.${ext}`;
  }

  /**
   * 解碼：CB-xxx → Catbox URL
   * @param {string} id - 如 CB-z8dta6-gif 或 CB-z8dta6.gif
   * @returns {string|null}
   */
  decode(id) {
    if (!id || !id.startsWith('CB-')) return null;
    
    const idPart = id.slice(3);
    if (!idPart || idPart.length < 6) return null;

    // 檢查 -ext 格式 (Twitch)
    const lastDashIndex = idPart.lastIndexOf('-');
    if (lastDashIndex > 0) {
      const possibleExt = idPart.slice(lastDashIndex + 1).toLowerCase();
      if (['gif', 'png', 'jpg', 'jpeg', 'mp4', 'webp'].includes(possibleExt)) {
        const cleanId = idPart.slice(0, lastDashIndex);
        return `${this.baseUrl}/${cleanId}.${possibleExt}`;
      }
    }

    // 檢查 .ext 格式 (標準)
    const lastDotIndex = idPart.lastIndexOf('.');
    if (lastDotIndex > 0) {
      const possibleExt = idPart.slice(lastDotIndex + 1).toLowerCase();
      if (['gif', 'png', 'jpg', 'jpeg', 'mp4', 'webp'].includes(possibleExt)) {
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
   * Catbox ID 為 6 位字母數字組合
   * @param {string} id
   * @returns {boolean}
   */
  isValid(id) {
    if (!id || !id.startsWith('CB-')) return false;
    const idPart = id.slice(3);
    // 移除可能的副檔名或格式標記
    const cleanId = idPart.replace(/[.-](gif|png|jpg|jpeg|mp4|webp)$/i, '');
    return /^[a-zA-Z0-9]{6,}$/.test(cleanId);
  }

  /**
   * 從 Catbox URL 提取 ID
   * @param {string} url
   * @returns {string|null}
   */
  extractIdFromUrl(url) {
    return this.encode(url, false);
  }
}

// 匯出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CatboxAdapter };
} else {
  window.CatboxAdapter = CatboxAdapter;
}
