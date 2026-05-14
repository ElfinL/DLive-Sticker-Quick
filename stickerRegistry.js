/**
 * StickerRegistry - 統一的貼紙類型註冊中心
 * 整合所有貼紙類型定義、URL生成、平台發送格式轉換
 */

const StickerRegistry = (function () {
  'use strict';

  // ==================== 類型定義 ====================
  const TYPES = {
    IM: {
      prefix: 'IM-',
      name: 'Imgur',
      regex: /^IM-[a-zA-Z0-9-]+\.(?:gif|png|jpg|jpeg|mp4)$/i,
      isVideo: (id) => /\.mp4$/i.test(id),
      cleanId: (id) => id.slice(3),
      getPreviewUrl: (id) => {
        const clean = id.slice(3);
        // 靜態圖片使用縮圖，影片保持原 URL
        const extMatch = clean.match(/\.([^.]+)$/);
        const ext = extMatch ? extMatch[1].toLowerCase() : '';
        if (['gif', 'jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
          const thumbId = clean.replace(/\.([^.]+)$/, 'm.$1');
          return `https://i.imgur.com/${thumbId}`;
        }
        return `https://i.imgur.com/${clean}`;
      },
      getDefaultCode: (id) => id,
      getPlatformCode: (id, platform) => {
        const clean = id.slice(3);
        switch (platform) {
          case 'twitch':
            // Twitch: IM-xxx.gif → IM-xxx-gif（用 - 代替 .）
            return id.replace(/\.(gif|png|jpg|jpeg|mp4)$/i, '-$1');
          case 'vaughn':
          case 'kick':
            // Vaughn/Kick 保持原始格式（使用 . ）
            return id;
          case 'youtube':
            // YouTube: 發送原始 IM-xxx.gif 格式（轉圖功能會將其轉換為圖片）
            return id;
          default:
            return id;
        }
      }
    },

    ME: {
      prefix: 'ME-',
      name: 'Meee',
      regex: /^ME-[a-zA-Z0-9-]+\.(?:gif|png|jpg|jpeg|mp4)$/i,
      isVideo: (id) => /\.mp4$/i.test(id),
      cleanId: (id) => id.slice(3),
      getPreviewUrl: (id) => {
        const clean = id.slice(3);
        return `https://meee.com.tw/${clean}`;
      },
      getDefaultCode: (id) => id,
      getPlatformCode: (id, platform) => {
        const clean = id.slice(3);
        switch (platform) {
          case 'twitch':
            // Twitch: ME-xxx.gif → ME-xxx-gif
            return id.replace(/\.(gif|png|jpg|jpeg|mp4)$/i, '-$1');
          case 'vaughn':
          case 'kick':
            return id; // 保持原始格式
          case 'youtube':
            // YouTube: 發送原始 ME-xxx.gif 格式（轉圖功能會將其轉換為圖片）
            return id;
          default:
            return id;
        }
      }
    },

    YT: {
      prefix: 'YT-',
      name: 'YouTube',
      regex: /^YT-[a-zA-Z0-9_-]+$/,
      isVideo: (id) => true,
      cleanId: (id) => id?.slice(3) || '',
      getPreviewUrl: (id) => {
        const clean = id?.slice(3);
        if (!clean) return '';
        return `https://img.youtube.com/vi/${clean}/mqdefault.jpg`;
      },
      getDefaultCode: (id) => id || '',
      getPlatformCode: (id, platform) => {
        const clean = id?.slice(3);
        if (!clean) return '';
        // 所有平台都發送 YT-xxx 格式（轉圖功能會將其轉換為 YouTube 縮略圖）
        return `YT-${clean}`;
      }
    },

    YTS: {
      prefix: 'YTS-',
      name: 'YouTube Shorts',
      regex: /^YTS-[a-zA-Z0-9_-]+$/,
      isVideo: (id) => true,
      cleanId: (id) => id?.slice(4) || '',
      getPreviewUrl: (id) => {
        const clean = id?.slice(4);
        if (!clean) return '';
        return `https://img.youtube.com/vi/${clean}/mqdefault.jpg`;
      },
      getDefaultCode: (id) => id || '',
      getPlatformCode: (id, platform) => {
        const clean = id?.slice(4);
        if (!clean) return '';
        // 所有平台都發送 YTS-xxx 格式（轉圖功能會將其轉換為 YouTube Shorts 嵌入播放器）
        return `YTS-${clean}`;
      }
    },

    CB: {
      prefix: 'CB-',
      name: 'Catbox',
      // Catbox ID 為字母數字，支援 .ext 格式
      regex: /^CB-[a-zA-Z0-9-]+\.(?:gif|png|jpg|jpeg|mp4|webp)?$/i,
      isVideo: (id) => {
        if (!id) return false;
        const lowerId = id.toLowerCase();
        return lowerId.endsWith('-mp4') || lowerId.endsWith('.mp4');
      },
      cleanId: (id) => {
        if (!id) return '';
        return id.startsWith('CB-') ? id.slice(3) : id;
      },
      getPreviewUrl: (id) => {
        const clean = id?.startsWith('CB-') ? id.slice(3) : id;
        if (!clean) return '';
        return `https://files.catbox.moe/${clean}`;
      },
      getDefaultCode: (id) => id || '',
      getPlatformCode: (id, platform) => {
        const clean = id?.startsWith('CB-') ? id.slice(3) : id;
        if (!clean) return '';
        switch (platform) {
          case 'twitch':
            // Twitch: CB-xxx.gif → CB-xxx-gif（用 - 代替 .）
            return id.replace(/\.(gif|png|jpg|jpeg|mp4|webp)$/i, '-$1');
          case 'kick':
          case 'vaughn':
            // Kick/Vaughn 保持原始格式（使用 . ）
            return id;
          case 'youtube':
            // YouTube: 發送原始 CB-xxx.gif 格式
            return id;
          default:
            return id;
        }
      }
    },
    GSS: {
      prefix: 'GSS-',
      name: 'General Sticker System',
      // GSS 格式：GSS-URL 或 GSS-https://URL，支援各種圖片/影片格式
      regex: /^GSS-(?:https?:\/\/)?[^\s]+\.(?:jpg|jpeg|png|gif|webp|bmp|svg|mp4)(?:\?[^\s]*)?$/i,
      isVideo: (id) => {
        if (!id) return false;
        const lowerId = id.toLowerCase();
        return lowerId.endsWith('-mp4') || lowerId.endsWith('.mp4');
      },
      cleanId: (id) => {
        if (!id) return '';
        return id.startsWith('GSS-') ? id.slice(4) : id;
      },
      getPreviewUrl: (id) => {
        const clean = id?.startsWith('GSS-') ? id.slice(4) : id;
        if (!clean) return '';
        // 檢查是否有協議，如果沒有則添加 https://
        let url = clean;
        if (!url.match(/^https?:\/\//i)) {
          url = 'https://' + url;
        }
        return url;
      },
      getDefaultCode: (id) => id || '',
      getPlatformCode: (id, platform) => {
        const clean = id?.startsWith('GSS-') ? id.slice(4) : id;
        if (!clean) return '';
        switch (platform) {
          case 'twitch':
            return id; // Twitch 保持原始格式
          case 'vaughn':
          case 'kick':
            return id; // Kick/Vaughn 保持原始格式
          case 'youtube':
            return id; // YouTube 保持原始格式
          default:
            return id;
        }
      }
    }
  };

  // ==================== 工具函數 ====================

  /**
   * 檢測 ID 類型
   * @param {string} id
   * @returns {string|null} 類型鍵 (DL/IM/ME/YT/YTS) 或 null
   */
  function detectType(id) {
    if (!id || typeof id !== 'string') return null;
    console.log('[StickerRegistry] detectType called with:', id);
    // 優先檢查較長的 prefix（避免 YTS- 被錯誤識別為 YT-）
    const sortedTypes = Object.entries(TYPES).sort((a, b) => b[1].prefix.length - a[1].prefix.length);
    console.log('[StickerRegistry] sortedTypes:', sortedTypes.map(([t, c]) => `${t}:${c.prefix}`));
    for (const [type, config] of sortedTypes) {
      if (id.startsWith(config.prefix)) {
        console.log('[StickerRegistry] matched type:', type, 'with prefix:', config.prefix);
        return type;
      }
    }
    // 無前綴的舊格式 DL ID
    if (/^[A-Za-z0-9_]+$/.test(id)) return 'DL';
    console.log('[StickerRegistry] no type matched for:', id);
    return null;
  }

  /**
   * 驗證 ID 是否有效
   * @param {string} id
   * @returns {boolean}
   */
  function isValid(id) {
    const type = detectType(id);
    if (!type) return false;
    const config = TYPES[type];
    // 特殊處理 DL：無前綴的也合法
    if (type === 'DL' && !id.startsWith('DL-')) {
      return /^[A-Za-z0-9_]+$/.test(id);
    }
    return config.regex.test(id);
  }

  /**
   * 正規化 ID（統一格式）
   * @param {string} id
   * @returns {string|null} 正規化後的 ID 或 null（無效時）
   */
  function normalize(id) {
    if (!id) return null;
    const trimmed = id.trim();
    const type = detectType(trimmed);

    switch (type) {
      case 'IM':
      case 'ME':
      case 'CB':
        // IM/ME/CB: 將 -gif 結尾替換為 .gif
        return trimmed.replace(/-(gif|png|jpg|jpeg|mp4)$/i, '.$1');
      case 'DL':
        // DL: 確保有前綴
        return trimmed.startsWith('DL-') ? trimmed : `DL-${trimmed}`;
      case 'GSS':
        // GSS: 移除 http:// 和 https:// 前綴以節省儲存空間
        return trimmed.replace(/^GSS-https?:\/\/?/i, 'GSS-');
      case 'YT':
      case 'YTS':
        // YT/YTS: 直接返回
        return trimmed;
      default:
        return null;
    }
  }

  /**
   * 取得貼紙完整資訊
   * @param {string} id
   * @returns {Object|null}
   */
  function getStickerInfo(id) {
    const type = detectType(id);
    if (!type) return null;
    const config = TYPES[type];
    const normalized = normalize(id);
    if (!normalized) return null;

    return {
      id: normalized,
      type: type,
      typeName: config.name,
      isVideo: config.isVideo(normalized),
      previewUrl: config.getPreviewUrl(normalized),
      defaultCode: config.getDefaultCode(normalized),
      // 各平台發送代碼
      platformCodes: {
        twitch: config.getPlatformCode(normalized, 'twitch'),
        vaughn: config.getPlatformCode(normalized, 'vaughn'),
        kick: config.getPlatformCode(normalized, 'kick'),
        youtube: config.getPlatformCode(normalized, 'youtube')
      }
    };
  }

  /**
   * 取得特定平台的發送代碼
   * @param {string} id
   * @param {string} platform - twitch/vaughn/kick
   * @returns {string|null}
   */
  function getSendCode(id, platform) {
    const info = getStickerInfo(id);
    if (!info) return null;
    return info.platformCodes[platform] || info.defaultCode;
  }

  /**
   * 批量取得發送代碼（用於顯示）
   * @param {string} id
   * @returns {Object}
   */
  function getAllSendCodes(id) {
    const info = getStickerInfo(id);
    if (!info) return null;
    return {
      id: info.id,
      twitch: info.platformCodes.twitch,
      vaughn: info.platformCodes.vaughn,
      kick: info.platformCodes.kick,
      // IM/ME 使用零寬編碼，其他直接發送
      isHidden: info.type === 'IM' || info.type === 'ME'
    };
  }

  /**
   * 註冊新的貼紙類型（擴充用）
   * @param {string} type
   * @param {Object} config
   */
  function registerType(type, config) {
    if (TYPES[type]) {
      console.warn(`[StickerRegistry] 類型 ${type} 已存在，將被覆蓋`);
    }
    TYPES[type] = config;
  }

  /**
   * 取得所有支援的類型
   * @returns {string[]}
   */
  function getSupportedTypes() {
    return Object.keys(TYPES);
  }

  // ==================== 公開 API ====================
  return {
    // 核心函數
    detectType,
    isValid,
    normalize,
    getStickerInfo,
    getSendCode,
    getAllSendCodes,

    // 擴充
    registerType,
    getSupportedTypes,

    // 原始配置（唯讀）
    get TYPES() { return { ...TYPES }; }
  };
})();

// 支援 CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { StickerRegistry };
}

// 掛載到全域
if (typeof window !== 'undefined') {
  window.StickerRegistry = StickerRegistry;
}
