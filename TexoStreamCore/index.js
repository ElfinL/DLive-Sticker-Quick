// Texo Stream Core - 核心功能模組
// 【隸屬：GSS 管理面板 (popup.html)】
// 這是管理多平台實況資訊的模組，在擴充彈出視窗中使用

const TexoCore = {
  STORAGE_KEY: 'texoStreamData',

  // 解析輸入文字
  parse(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    let displayName = '', baseChat = '', sharedChat = '';
    const platforms = [];

    for (const line of lines) {
      // 同時支援 @ 和 > 作為名稱前綴（> 不會被平台過濾）
      if (line.startsWith('@') || line.startsWith('>')) {
        const parts = line.substring(1).split(/\s+/);
        displayName = parts[0] || '';
        for (const part of parts.slice(1)) {
          if (part.startsWith('#') && !baseChat) baseChat = part.substring(1);
          else if (part.startsWith('!') && !sharedChat) sharedChat = part.substring(1);
        }
      } else if (line.startsWith('#')) {
        const url = line.substring(1);
        if (!baseChat) baseChat = url;
        else platforms.push(url);
      } else if (line.startsWith('!')) {
        if (!sharedChat) sharedChat = line.substring(1);
      }
    }
    return { displayName, baseChat, sharedChat, platforms };
  },

  // 格式化輸出（使用 > 避免被平台過濾）
  format(data) {
    let out = '';
    if (data.displayName) {
      out += `>${data.displayName}`;
      if (data.baseChat) out += ` #${data.baseChat}`;
      if (data.sharedChat) out += ` !${data.sharedChat}`;
      out += '\n';
    }
    if (data.sharedChat && !data.displayName) out += `!${data.sharedChat}\n`;
    for (const p of data.platforms || []) out += `#${p}\n`;
    return out.trim();
  },

  // 生成 GSS System 格式
  toGSS(data) {
    if (!data.displayName || !data.baseChat) return null;
    let txt = '#GSS System\n';
    txt += `#${data.displayName} #${data.baseChat}\n`;
    txt += `#${data.baseChat}\n`;
    if (data.sharedChat) txt += `!${data.sharedChat}\n`;
    for (const p of data.platforms) {
      if (p !== data.baseChat) txt += `#${p}\n`;
    }
    return txt;
  },

  // 儲存
  save(text, callback) {
    const data = this.parse(text);
    chrome.storage.local.set({ [this.STORAGE_KEY]: { rawText: text, parsed: data } }, callback);
  },

  // 載入
  load(callback) {
    chrome.storage.local.get([this.STORAGE_KEY], (res) => {
      const d = res[this.STORAGE_KEY];
      callback(d?.rawText || (d?.parsed ? this.format(d.parsed) : ''));
    });
  }
};

// 導出模組
if (typeof module !== 'undefined') module.exports = TexoCore;
