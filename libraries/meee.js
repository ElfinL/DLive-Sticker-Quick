/**
 * MEEE (meee.com.tw) 圖庫適配器 (ME-xxx)
 */
class MeeeAdapter extends LibraryAdapter {
  constructor() {
    super();
    this.name = 'meee';
    this.prefix = 'ME-';
    this.baseUrl = 'https://meee.com.tw';
  }

  /**
   * 編碼：MEEE URL → ME-xxx
   * @param {string} url - MEEE URL
   * @param {boolean} useTwitchFormat - 是否使用 Twitch 格式
   * @returns {string|null}
   */
  encode(url, useTwitchFormat = false) {
    const match = url.match(/meee\.com\.tw\/([a-zA-Z0-9]+)(?:\.(gif|png|jpg|jpeg|mp4))?/i);
    if (!match || match[1].length < 5) return null;
    
    const id = match[1];
    const ext = match[2] || 'jpg';
    
    if (useTwitchFormat) {
      return `ME-${id}-${ext}`;
    }
    
    return `ME-${id}.${ext}`;
  }

  /**
   * 解碼：ME-xxx → MEEE URL
   * @param {string} id - 如 ME-43XNR9K-jpg
   * @returns {string|null}
   */
  decode(id) {
    if (!id || !id.startsWith('ME-')) return null;
    
    const idPart = id.slice(3);
    if (!idPart || idPart.length < 5) return null;

    // 檢查 -ext 格式
    const lastDashIndex = idPart.lastIndexOf('-');
    if (lastDashIndex > 0) {
      const possibleExt = idPart.slice(lastDashIndex + 1).toLowerCase();
      if (['gif', 'png', 'jpg', 'jpeg', 'mp4'].includes(possibleExt)) {
        const cleanId = idPart.slice(0, lastDashIndex);
        return `${this.baseUrl}/${cleanId}.${possibleExt}`;
      }
    }

    // 檢查 .ext 格式
    const lastDotIndex = idPart.lastIndexOf('.');
    if (lastDotIndex > 0) {
      const possibleExt = idPart.slice(lastDotIndex + 1).toLowerCase();
      if (['gif', 'png', 'jpg', 'jpeg', 'mp4'].includes(possibleExt)) {
        return `${this.baseUrl}/${idPart}`;
      }
    }

    // 無副檔名，預設 .jpg
    return `${this.baseUrl}/${idPart}.jpg`;
  }

  /**
   * 判斷是否為視頻
   * @param {string} id
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
    return id && id.startsWith('ME-') && id.length > 8;
  }

  /**
   * 從 MEEE URL 提取 ID
   * @param {string} url
   * @returns {string|null}
   */
  extractIdFromUrl(url) {
    return this.encode(url, false);
  }
}

// 匯出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MeeeAdapter };
} else {
  window.MeeeAdapter = MeeeAdapter;
}
