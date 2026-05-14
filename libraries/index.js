/**
 * 圖庫分發器
 * 統一管理所有圖庫適配器，提供單一介面存取不同圖庫
 */

class LibraryManager {
  constructor() {
    this.adapters = new Map();
    this._initialized = false;
  }

  /**
   * 註冊圖庫適配器
   * @param {LibraryAdapter} adapter - 圖庫適配器實例
   */
  register(adapter) {
    this.adapters.set(adapter.name, adapter);
    this.adapters.set(adapter.prefix, adapter); // 也可用前綴存取
  }

  /**
   * 初始化所有內建圖庫
   */
  init() {
    if (this._initialized) return;

    // 註冊內建圖庫（順序不重要）
    if (typeof ImgurAdapter !== 'undefined') {
      this.register(new ImgurAdapter());
    }
    if (typeof MeeeAdapter !== 'undefined') {
      this.register(new MeeeAdapter());
    }
    if (typeof CatboxAdapter !== 'undefined') {
      this.register(new CatboxAdapter());
    }

    this._initialized = true;
  }

  /**
   * 取得圖庫適配器
   * @param {string} name - 圖庫名稱或前綴，如 'imgur', 'IM-', 'ME-', 'DL-'
   * @returns {LibraryAdapter|null}
   */
  get(name) {
    this.init();

    // 標準化名稱
    const normalized = name.toLowerCase().replace(/-$/, '');

    // 直接查找
    if (this.adapters.has(name)) {
      return this.adapters.get(name);
    }
    if (this.adapters.has(normalized)) {
      return this.adapters.get(normalized);
    }

    // 根據前綴推斷
    if (name.startsWith('IM-') || normalized === 'im') {
      return this.adapters.get('imgur');
    }
    if (name.startsWith('ME-') || normalized === 'me') {
      return this.adapters.get('meee');
    }
    if (name.startsWith('CB-') || normalized === 'cb') {
      return this.adapters.get('catbox');
    }

    return null;
  }

  /**
   * 根據 ID 取得對應的圖庫適配器
   * @param {string} id - 貼圖 ID，如 IM-xxx, ME-xxx, CB-xxx
   * @returns {LibraryAdapter|null}
   */
  getById(id) {
    if (!id) return null;

    if (id.startsWith('IM-')) return this.get('imgur');
    if (id.startsWith('ME-')) return this.get('meee');
    if (id.startsWith('CB-')) return this.get('catbox');

    return null;
  }

  /**
   * 根據 URL 取得對應的圖庫適配器
   * @param {string} url - 圖片 URL
   * @returns {LibraryAdapter|null}
   */
  getByUrl(url) {
    if (!url) return null;

    // 檢查各圖庫的 URL 模式
    if (url.includes('imgur.com')) return this.get('imgur');
    if (url.includes('meee.com.tw')) return this.get('meee');
    if (url.includes('catbox.moe')) return this.get('catbox');

    return null;
  }

  /**
   * 編碼 URL 為 ID
   * @param {string} url - 圖片 URL
   * @param {boolean} useTwitchFormat - 是否使用 Twitch 格式
   * @returns {string|null}
   */
  encode(url, useTwitchFormat = false) {
    const adapter = this.getByUrl(url);
    if (!adapter) return null;
    return adapter.encode(url, useTwitchFormat);
  }

  /**
   * 解碼 ID 為 URL
   * @param {string} id - 貼圖 ID
   * @returns {string|null}
   */
  decode(id) {
    const adapter = this.getById(id);
    if (!adapter) return null;
    return adapter.decode(id);
  }

  /**
   * 取得圖片 URL
   * @param {string} id - 貼圖 ID
   * @returns {string|null}
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
    const adapter = this.getById(id);
    if (!adapter) return false;
    return adapter.isVideo(id);
  }

  /**
   * 驗證 ID 格式
   * @param {string} id - 貼圖 ID
   * @returns {boolean}
   */
  isValid(id) {
    const adapter = this.getById(id);
    if (!adapter) return false;
    return adapter.isValid(id);
  }

  /**
   * 取得所有已註冊的圖庫名稱
   * @returns {string[]}
   */
  getAllNames() {
    this.init();
    const names = new Set();
    for (const [key, adapter] of this.adapters) {
      names.add(adapter.name);
    }
    return Array.from(names);
  }

  /**
   * 取得所有支援的前綴
   * @returns {string[]}
   */
  getAllPrefixes() {
    this.init();
    const prefixes = new Set();
    for (const adapter of this.adapters.values()) {
      prefixes.add(adapter.prefix);
    }
    return Array.from(prefixes);
  }
}

// 建立全局單例
const Library = new LibraryManager();

// 匯出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LibraryManager, Library };
} else {
  window.LibraryManager = LibraryManager;
  window.Library = Library;
}
