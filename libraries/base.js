/**
 * 圖庫適配器基底類別
 * 所有圖庫適配器都應繼承此類別並實作必要方法
 */
class LibraryAdapter {
  constructor() {
    this.name = 'base';
    this.prefix = '';
    this.baseUrl = '';
  }

  /**
   * 編碼：從 URL 轉換為 ID 格式
   * @param {string} url - 圖片 URL
   * @param {boolean} useTwitchFormat - 是否使用 Twitch 格式（-分隔而非 .分隔）
   * @returns {string|null} - 編碼後的 ID，如 IM-xxx 或 null
   */
  encode(url, useTwitchFormat = false) {
    throw new Error('encode() 必須由子類別實作');
  }

  /**
   * 解碼：從 ID 轉換為完整 URL
   * @param {string} id - 貼圖 ID，如 IM-xxx
   * @returns {string|null} - 完整 URL 或 null
   */
  decode(id) {
    throw new Error('decode() 必須由子類別實作');
  }

  /**
   * 從 ID 取得圖片 URL
   * @param {string} id - 貼圖 ID
   * @returns {string|null} - 圖片 URL 或 null
   */
  getImageUrl(id) {
    return this.decode(id);
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
   * 驗證 ID 格式是否正確
   * @param {string} id - 貼圖 ID
   * @returns {boolean}
   */
  isValid(id) {
    return id && id.startsWith(this.prefix) && id.length > this.prefix.length + 2;
  }

  /**
   * 從 ID 提取純 ID（去掉前綴和副檔名）
   * @param {string} id - 貼圖 ID
   * @returns {string|null}
   */
  extractCleanId(id) {
    if (!this.isValid(id)) return null;
    let cleanId = id.slice(this.prefix.length);
    // 移除副檔名
    const lastDotIndex = cleanId.lastIndexOf('.');
    const lastDashIndex = cleanId.lastIndexOf('-');
    const lastSepIndex = Math.max(lastDotIndex, lastDashIndex);
    if (lastSepIndex > 0) {
      cleanId = cleanId.slice(0, lastSepIndex);
    }
    return cleanId;
  }

  /**
   * 取得副檔名
   * @param {string} id - 貼圖 ID
   * @returns {string} - 副檔名，預設為 'gif'
   */
  getExtension(id) {
    if (!id) return 'gif';
    const lowerId = id.toLowerCase();
    
    // 檢查 -ext 格式
    const lastDashIndex = lowerId.lastIndexOf('-');
    if (lastDashIndex > 0) {
      const possibleExt = lowerId.slice(lastDashIndex + 1);
      if (['gif', 'png', 'jpg', 'jpeg', 'mp4'].includes(possibleExt)) {
        return possibleExt;
      }
    }
    
    // 檢查 .ext 格式
    const lastDotIndex = lowerId.lastIndexOf('.');
    if (lastDotIndex > 0) {
      const possibleExt = lowerId.slice(lastDotIndex + 1);
      if (['gif', 'png', 'jpg', 'jpeg', 'mp4'].includes(possibleExt)) {
        return possibleExt;
      }
    }
    
    return 'gif';
  }
}

// 匯出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LibraryAdapter };
} else {
  window.LibraryAdapter = LibraryAdapter;
}
