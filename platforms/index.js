/**
 * Platform Index
 * 平台分發器 - 統一管理所有平台適配器
 */

// 注意：此檔案在瀏覽器環境中運行，需要確保相依檔案已載入

(function () {
  'use strict';

  // 平台註冊表
  const adapters = [];

  // 當前平台的適配器實例（需要保持引用，否則定時器會被 GC）
  let currentAdapterInstance = null;

  /**
   * 註冊平台適配器
   * @param {PlatformAdapter} adapterClass - 適配器類別
   */
  function registerAdapter(adapterClass) {
    adapters.push(adapterClass);
  }

  /**
   * 取得當前平台的適配器實例
   * @returns {PlatformAdapter|null}
   */
  function getPlatformAdapter() {
    // 如果已經有實例，直接返回
    if (currentAdapterInstance) {
      return currentAdapterInstance;
    }

    for (const AdapterClass of adapters) {
      // 防禦性檢查：確保是有效的類
      if (typeof AdapterClass !== 'function') {
        console.warn('[GSS Platform] 無效的適配器類:', AdapterClass);
        continue;
      }

      try {
        const instance = new AdapterClass();

        // 防禦性檢查：確保實例有 isMatch 方法
        if (!instance || typeof instance.isMatch !== 'function') {
          console.warn('[GSS Platform] 適配器實例缺少 isMatch 方法:', instance);
          continue;
        }

        if (instance.isMatch()) {
          // 保存實例引用，防止被 GC
          currentAdapterInstance = instance;
          console.log('[GSS Platform] Adapter initialized for:', instance.getName());
          return instance;
        }
      } catch (err) {
        console.error('[GSS Platform] 实例化适配器失败:', err);
        continue;
      }
    }
    return null;
  }

  /**
   * 取得當前平台名稱
   * @returns {string}
   */
  function getCurrentPlatform() {
    const adapter = getPlatformAdapter();
    return adapter ? adapter.getName() : 'unknown';
  }


  /**
   * 檢查是否為 Twitch 平台
   * @returns {boolean}
   */
  function isTwitch() {
    return getCurrentPlatform() === 'twitch';
  }

  /**
   * 檢查是否為 Vaughn 平台
   * @returns {boolean}
   */
  function isVaughn() {
    return getCurrentPlatform() === 'vaughn';
  }

  /**
   * 檢查是否為 Kick 平台
   * @returns {boolean}
   */
  function isKick() {
    return getCurrentPlatform() === 'kick';
  }

  /**
   * 檢查是否為 YouTube 平台
   * @returns {boolean}
   */
  function isYouTube() {
    return getCurrentPlatform() === 'youtube';
  }

  /**
   * 檢查是否為 WTV 平台
   * @returns {boolean}
   */
  function isWTV() {
    return getCurrentPlatform() === 'wtv';
  }

  /**
   * 檢查是否為 Beamstream 平台
   * @returns {boolean}
   */
  function isBeamstream() {
    return getCurrentPlatform() === 'beamstream';
  }

  /**
   * 統一發送訊息介面
   * @param {string} message - 要發送的訊息
   * @param {Object} options - 選項
   * @param {boolean} options.isIM - 是否為 IM 類型貼圖
   * @param {boolean} options.isME - 是否為 ME 類型貼圖
   * @returns {Promise<{ok: boolean, id?: string, error?: string}>}
   */
  async function sendSticker(message, options = {}) {
    const adapter = getPlatformAdapter();
    if (!adapter) {
      throw new Error('不支援的平台');
    }

    const { isIM, isME } = options;

    // 直接發送訊息（移除 DLive 零寬編碼邏輯）
    return await adapter.sendMessage(message);
  }

  // 自動註冊內建適配器 (如果類別已定義)
  function autoRegister() {
    if (typeof TwitchAdapter !== 'undefined') {
      registerAdapter(TwitchAdapter);
    }
    if (typeof VaughnAdapter !== 'undefined') {
      registerAdapter(VaughnAdapter);
    }
    if (typeof KickAdapter !== 'undefined') {
      registerAdapter(KickAdapter);
    }
    if (typeof YouTubeAdapter !== 'undefined') {
      registerAdapter(YouTubeAdapter);
    }
    if (typeof BeamstreamAdapter !== 'undefined') {
      registerAdapter(BeamstreamAdapter);
    }
    if (typeof WTVAdapter !== 'undefined') {
      registerAdapter(WTVAdapter);
    }
    // 立即初始化當前平台的適配器，確保定時器等功能啟動
    const adapter = getPlatformAdapter();
    if (adapter) {
      console.log('[GSS Platform] Auto-initialized adapter:', adapter.getName());
    }
  }

  // 公開 API
  const PlatformAPI = {
    registerAdapter,
    getPlatformAdapter,
    getCurrentPlatform,
    isTwitch,
    isVaughn,
    isKick,
    isYouTube,
    isWTV,
    isBeamstream,
    sendSticker,
    autoRegister
  };

  // 支援 CommonJS
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = PlatformAPI;
  }

  // 掛載到全域
  if (typeof window !== 'undefined') {
    window.GSS = window.GSS || {};
    window.GSS.Platform = PlatformAPI;

    // 延遲自動註冊，確保適配器類別已定義
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', autoRegister);
    } else {
      autoRegister();
    }
  }
})();
