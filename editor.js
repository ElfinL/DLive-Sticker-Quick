// GSS 圖庫編輯器
// 用於編輯貼圖 ID 和標籤

let allStickers = []; // 所有貼圖資料
let filteredStickers = []; // 過濾後的貼圖
let selectedIds = new Set(); // 選中的貼圖 ID
let tagVocabulary = []; // 標籤詞庫
let currentTypeFilter = 'all'; // 當前類型過濾
let currentTagFilter = '__all__'; // 當前標籤過濾

// DOM 元素
const content = document.getElementById('content');
const typeTabs = document.getElementById('typeTabs');
const tagTabs = document.getElementById('tagTabs');
const refreshBtn = document.getElementById('refreshBtn');
const selectAllBtn = document.getElementById('selectAllBtn');
const exportBtn = document.getElementById('exportBtn');
const statsText = document.getElementById('statsText');
const batchPanel = document.getElementById('batchPanel');
const selectedCount = document.getElementById('selectedCount');
const batchTagInput = document.getElementById('batchTagInput');
const batchTagSelect = document.getElementById('batchTagSelect');
const batchAddTagBtn = document.getElementById('batchAddTagBtn');
const batchRemoveTagBtn = document.getElementById('batchRemoveTagBtn');
const batchDeleteBtn = document.getElementById('batchDeleteBtn');
const clearSelectionBtn = document.getElementById('clearSelectionBtn');
const statusBar = document.getElementById('statusBar');
// 側邊欄元素
const idListInput = document.getElementById('idListInput');
const tagVocabInput = document.getElementById('tagVocabInput');
const saveIdsBtn = document.getElementById('saveIdsBtn');
const saveVocabBtn = document.getElementById('saveVocabBtn');
const saveStatus = document.getElementById('saveStatus');

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  // 載入語言設定
  chrome.storage.sync.get(['uiLang'], (result) => {
    const lang = window.SUPPORTED_LANGS?.includes(result.uiLang) ? result.uiLang : 'zh-TW';
    if (window.applyEditorLanguage) {
      window.applyEditorLanguage(lang);
    }
  });

  loadData();
  setupEventListeners();
});

function setupEventListeners() {
  refreshBtn.addEventListener('click', loadData);
  selectAllBtn.addEventListener('click', toggleSelectAll);
  exportBtn.addEventListener('click', exportData);
  batchAddTagBtn.addEventListener('click', () => batchAddTag());
  batchRemoveTagBtn.addEventListener('click', () => batchRemoveTag());
  batchDeleteBtn.addEventListener('click', () => batchDeleteIds());
  clearSelectionBtn.addEventListener('click', clearSelection);

  // 側邊欄保存按鈨
  saveIdsBtn?.addEventListener('click', saveIdList);
  saveVocabBtn?.addEventListener('click', saveVocab);

  // 語言切換按鈕
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      if (window.applyEditorLanguage) {
        window.applyEditorLanguage(lang);
      }
    });
  });

  // 批量標籤選擇器
  batchTagSelect?.addEventListener('change', () => {
    if (batchTagSelect.value === '__manual__') {
      batchTagInput.style.display = 'inline-block';
      batchTagInput.focus();
    } else {
      batchTagInput.style.display = 'none';
      batchTagInput.value = batchTagSelect.value;
    }
  });

  // 類型過濾按鈕
  typeTabs.querySelectorAll('.filter-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      typeTabs.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTypeFilter = btn.dataset.type;
      // 重置標籤過濾為全部
      currentTagFilter = '__all__';
      // 更新標籤數量顯示
      updateTagTabs();
      filterStickers();
    });
  });

  // 行號顯示和跳轉功能
  initLineInfo();
}

// 載入資料
async function loadData() {
  content.innerHTML = '<div class="loading">載入資料中...</div>';

  try {
    // Firefox 相容：使用回調形式
    const result = await new Promise((resolve) => {
      chrome.storage.local.get([
        'stickerIdsText',
        'favoriteStickerIds',
        'stickerTagVocabularyText'
      ], (items) => {
        resolve(items || {});
      });
    });

    // 解析標籤詞庫
    tagVocabulary = parseVocabulary(result?.stickerTagVocabularyText || '');

    // 解析貼圖資料（使用正規化後的內容）
    const parsed = parseStickerIdsText(result?.stickerIdsText || '');

    // 填充側邊欄輸入框（顯示正規化後的內容）
    if (idListInput) {
      idListInput.value = rowsToText(parsed.rows);
    }
    if (tagVocabInput) tagVocabInput.value = result?.stickerTagVocabularyText || '';

    // 使用已經正規化的 parsed 數據
    allStickers = parsed.rows.map(row => ({
      id: row.id,
      type: getStickerType(row.id),
      tags: row.tags || [],
      isFav: (result?.favoriteStickerIds || []).includes(row.id),
      previewUrl: getPreviewUrl(row.id),
      lineNumber: row.lineNumber // 保存行號
    }));

    // 更新標籤標籤頁
    updateTagTabs();

    filterStickers();
    showStatus(`已載入 ${allStickers.length} 個貼圖`);

    // 重置光標到開頭，讓行號顯示為第 1 行
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (idListInput) {
          idListInput.setSelectionRange(0, 0);
          idListInput.scrollTop = 0;
          updateLineInfo();
        }
      }, 100);
    });
  } catch (err) {
    content.textContent = '';
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    const icon = document.createElement('div');
    icon.className = 'empty-state-icon';
    icon.textContent = '❌';
    const msg = document.createElement('div');
    msg.textContent = '載入失敗: ' + err.message;
    emptyState.appendChild(icon);
    emptyState.appendChild(msg);
    content.appendChild(emptyState);
    showStatus('載入失敗: ' + err.message, true);
  }
}

// 儲存 ID 清單
async function saveIdList() {
  try {
    const text = idListInput?.value || '';
    const vocab = tagVocabInput?.value || '';

    // 解析驗證
    const parsed = parseStickerIdsText(text);
    const ids = parsed.rows.map(r => r.id);

    // 更新 allStickers
    allStickers = parsed.rows.map(row => ({
      id: row.id,
      type: getStickerType(row.id),
      tags: row.tags || [],
      isFav: allStickers.find(s => s.id === row.id)?.isFav || false,
      previewUrl: getPreviewUrl(row.id),
      lineNumber: row.lineNumber // 保存行號
    }));

    // 儲存到 storage
    await chrome.storage.local.set({
      stickerIdsText: text,
      stickerTagVocabularyText: vocab
    });

    // 更新 UI
    updateTagTabs();
    filterStickers();

    if (saveStatus) {
      saveStatus.textContent = '✅ 已儲存';
      setTimeout(() => saveStatus.textContent = '', 2000);
    }
    showStatus(`已儲存 ${ids.length} 個貼圖 ID`);
  } catch (err) {
    console.error('Save error:', err);
    if (saveStatus) {
      saveStatus.textContent = '❌ 儲存失敗';
      saveStatus.style.color = '#dc3545';
      setTimeout(() => {
        saveStatus.textContent = '';
        saveStatus.style.color = '#28a745';
      }, 2000);
    }
    showStatus('儲存失敗: ' + err.message, true);
  }
}

// 儲存標籤詞庫
async function saveVocab() {
  try {
    const vocab = tagVocabInput?.value || '';
    await chrome.storage.local.set({ stickerTagVocabularyText: vocab });
    tagVocabulary = parseVocabulary(vocab);
    if (saveStatus) {
      saveStatus.textContent = '✅ 詞庫已儲存';
      setTimeout(() => saveStatus.textContent = '', 2000);
    }
    showStatus('標籤詞庫已儲存');
  } catch (err) {
    showStatus('儲存失敗: ' + err.message, true);
  }
}

// 解析貼圖 ID 文字
function parseStickerIdsText(text) {
  const rows = [];
  const lines = text.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    // 格式: ID #tag1 #tag2
    const parts = trimmed.split(/\s+/);
    const id = parts[0];
    const tags = parts.slice(1)
      .filter(p => p.startsWith('#'))
      .map(p => p.slice(1));

    // 正規化 ID（針對 GSS 格式移除 HTTP/HTTPS 前綴）
    let normalizedId = id;
    if (id.startsWith('GSS-')) {
      normalizedId = id.replace(/^GSS-https?:\/\//i, 'GSS-');
    }

    if (normalizedId) {
      rows.push({ id: normalizedId, tags, lineNumber: i + 1 }); // 記錄行號（從1開始）
    }
  }

  return { rows };
}

// 解析標籤詞庫
function parseVocabulary(text) {
  return text.split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));
}

// 取得貼圖類型
function getStickerType(id) {
  return StickerRegistry.detectType(id) || 'OTHER';
}

// 取得預覽 URL
function getPreviewUrl(id) {
  if (!id) return '';
  const info = StickerRegistry.getStickerInfo(id);
  return info ? info.previewUrl : '';
}

// 過濾貼圖
function filterStickers() {
  filteredStickers = allStickers.filter(s => {
    // 類型過濾
    if (currentTypeFilter !== 'all' && s.type !== currentTypeFilter) {
      return false;
    }

    // 標籤過濾
    if (currentTagFilter !== '__all__') {
      if (currentTagFilter === '__uncategorized__') {
        // 未分類：沒有標籤的貼圖
        if (s.tags.length > 0) return false;
      } else {
        // 特定標籤
        if (!s.tags.includes(currentTagFilter)) return false;
      }
    }

    return true;
  });

  updateStats();
  renderStickers();
}

// 更新標籤標籤頁
function updateTagTabs() {
  // 根據當前類型過濾貼圖
  const typeFilteredStickers = currentTypeFilter === 'all'
    ? allStickers
    : allStickers.filter(s => s.type === currentTypeFilter);

  // 收集所有標籤（基於類型過濾後的貼圖）
  const allTags = new Set();
  const tagCounts = {};

  typeFilteredStickers.forEach(s => {
    s.tags.forEach(tag => {
      allTags.add(tag);
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  // 排序標籤
  const sortedTags = Array.from(allTags).sort();

  // 使用翻譯函數
  const t = window.t || ((key) => key);

  // 清空現有標籤（保留全部和未分類）
  tagTabs.textContent = '';
  const allBtn = document.createElement('button');
  allBtn.className = 'tag-tab' + (currentTagFilter === '__all__' ? ' active' : '');
  allBtn.dataset.tag = '__all__';
  allBtn.textContent = t('tagAll') + ' (' + typeFilteredStickers.length + ')';
  tagTabs.appendChild(allBtn);
  const uncategorizedBtn = document.createElement('button');
  uncategorizedBtn.className = 'tag-tab' + (currentTagFilter === '__uncategorized__' ? ' active' : '');
  uncategorizedBtn.dataset.tag = '__uncategorized__';
  uncategorizedBtn.textContent = t('tagUncategorized') + ' (' + typeFilteredStickers.filter(s => s.tags.length === 0).length + ')';
  tagTabs.appendChild(uncategorizedBtn);

  // 添加隱藏標籤
  const hiddenCount = typeFilteredStickers.filter(s => s.tags.includes('隱藏')).length;
  if (hiddenCount > 0 || sortedTags.includes('隱藏')) {
    const hiddenBtn = document.createElement('button');
    hiddenBtn.className = 'tag-tab hidden-tag' + (currentTagFilter === '隱藏' ? ' active' : '');
    hiddenBtn.dataset.tag = '隱藏';
    hiddenBtn.textContent = t('hiddenTag') + ' (' + hiddenCount + ')';
    tagTabs.appendChild(hiddenBtn);
  }

  // 添加其他標籤
  sortedTags.forEach(tag => {
    if (tag !== '隱藏') {
      const btn = document.createElement('button');
      btn.className = 'tag-tab' + (currentTagFilter === tag ? ' active' : '');
      btn.dataset.tag = tag;
      btn.textContent = tag + ' (' + tagCounts[tag] + ')';
      tagTabs.appendChild(btn);
    }
  });

  // 更新批量標籤下拉選項
  if (batchTagSelect) {
    const currentVal = batchTagSelect.value;
    batchTagSelect.textContent = '';
    const opt1 = document.createElement('option');
    opt1.value = '';
    opt1.textContent = t('selectTag');
    batchTagSelect.appendChild(opt1);
    const opt2 = document.createElement('option');
    opt2.value = '__manual__';
    opt2.textContent = t('manualInput');
    batchTagSelect.appendChild(opt2);

    // 添加所有可用標籤（按字母排序）
    const sortedTagList = Array.from(allTags).sort();
    sortedTagList.forEach(tag => {
      const opt = document.createElement('option');
      opt.value = tag;
      opt.textContent = tag + ' (' + tagCounts[tag] + ')';
      batchTagSelect.appendChild(opt);
    });

    // 恢復之前的選擇（如果還存在）
    if (currentVal && (currentVal === '__manual__' || allTags.has(currentVal))) {
      batchTagSelect.value = currentVal;
      if (currentVal === '__manual__') {
        batchTagInput.style.display = 'inline-block';
      }
    }
  }

  // 綁定事件
  tagTabs.querySelectorAll('.tag-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      tagTabs.querySelectorAll('.tag-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTagFilter = btn.dataset.tag;
      filterStickers();
    });
  });
}

// 更新統計
function updateStats() {
  const t = window.t || ((key, ...args) => {
    if (key === 'statsText' && args.length >= 2) {
      return `顯示 ${args[0]} / ${args[1]} 個貼圖`;
    }
    return key;
  });
  statsText.textContent = t('statsText', filteredStickers.length, allStickers.length);
}

// 渲染貼圖列表
function renderStickers() {
  if (filteredStickers.length === 0) {
    content.innerHTML = `<div class="empty-state">
      <div class="empty-state-icon">🔍</div>
      <div>沒有符合條件的貼圖</div>
    </div>`;
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'sticker-grid';

  // 排序：常用在前
  const sorted = [...filteredStickers].sort((a, b) => {
    if (a.isFav && !b.isFav) return -1;
    if (!a.isFav && b.isFav) return 1;
    return 0;
  });

  for (const sticker of sorted) {
    const card = createStickerCard(sticker);
    grid.appendChild(card);
  }

  content.innerHTML = '';
  content.appendChild(grid);
}

// 建立貼圖卡片
function createStickerCard(sticker) {
  try {
    const card = document.createElement('div');
    card.className = 'sticker-card';
    if (selectedIds.has(sticker.id)) {
      card.classList.add('selected');
    }

    // 預覽圖處理
    const isVideo = sticker.id.match(/\.(mp4|webm)$/i);
    let previewEl;
    if (isVideo) {
      previewEl = document.createElement('video');
      previewEl.src = sticker.previewUrl;
      previewEl.className = 'sticker-preview';
      previewEl.autoplay = true;
      previewEl.loop = true;
      previewEl.muted = true;
      previewEl.setAttribute('playsinline', '');
    } else {
      previewEl = document.createElement('img');
      previewEl.src = sticker.previewUrl;
      previewEl.className = 'sticker-preview';
      previewEl.alt = sticker.id;
      previewEl.loading = 'lazy';
      previewEl.decoding = 'async';
      previewEl.onerror = function () { this.style.display = 'none'; };
    }

    // 建立 header
    const header = document.createElement('div');
    header.className = 'sticker-header';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'sticker-select';
    if (selectedIds.has(sticker.id)) {
      checkbox.checked = true;
    }
    header.appendChild(checkbox);
    header.appendChild(previewEl);

    const actions = document.createElement('div');
    actions.className = 'sticker-actions';
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'sticker-delete-btn';
    deleteBtn.title = t('delTitle');
    deleteBtn.textContent = '×';
    actions.appendChild(deleteBtn);
    header.appendChild(actions);
    card.appendChild(header);

    // 貼圖 ID
    const idDiv = document.createElement('div');
    idDiv.className = 'sticker-id';
    const idText = sticker.id || 'NO_ID';
    idDiv.textContent = idText + (sticker.isFav ? ' ⭐' : '');
    card.appendChild(idDiv);

    // 行號
    const lineDiv = document.createElement('div');
    lineDiv.className = 'sticker-line-number';
    lineDiv.textContent = t('stickerLineNumber', sticker.lineNumber);
    card.appendChild(lineDiv);

    // 標籤區域
    const tagsSection = document.createElement('div');
    tagsSection.className = 'tags-section';
    const tagsList = document.createElement('div');
    tagsList.className = 'tags-list';

    sticker.tags.forEach(tag => {
      const tagSpan = document.createElement('span');
      tagSpan.className = 'tag';
      tagSpan.dataset.tag = tag;
      tagSpan.textContent = tag;

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'remove-tag-btn';
      removeBtn.textContent = '×';
      tagSpan.appendChild(removeBtn);
      tagsList.appendChild(tagSpan);
    });

    tagsSection.appendChild(tagsList);
    card.appendChild(tagsSection);

    // 點擊卡片選擇
    checkbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        selectedIds.add(sticker.id);
        card.classList.add('selected');
      } else {
        selectedIds.delete(sticker.id);
        card.classList.remove('selected');
      }
      updateBatchPanel();
    });

    // 綁定移除標籤按鈕事件
    tagsList.querySelectorAll('.remove-tag-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const tagSpan = btn.closest('.tag');
        const tag = tagSpan.dataset.tag;
        removeTagFromSticker(sticker.id, tag);
      });
    });

    // 綁定刪除貼圖按鈕事件
    deleteBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      deleteSticker(sticker.id);
    });

    // 右鍵選單事件
    card.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      showContextMenu(e, sticker);
    });

    return card;
  } catch (err) {
    console.error('createStickerCard error:', err, 'sticker:', sticker);
    return document.createElement('div');
  }
}

// 顯示右鍵選單
function showContextMenu(e, sticker) {
  // 移除現有選單
  hideContextMenu();

  const menu = document.createElement('div');
  menu.id = 'contextMenu';
  menu.className = 'context-menu';

  // 標題
  const header = document.createElement('div');
  header.className = 'context-menu-header';
  header.textContent = sticker.id;
  menu.appendChild(header);

  // 分隔線
  menu.appendChild(document.createElement('div')).className = 'context-menu-divider';

  // 常用選項
  const favItem = document.createElement('div');
  favItem.className = 'context-menu-item' + (sticker.isFav ? ' has-tag' : '');
  favItem.dataset.action = 'toggleFav';
  const favIndicator = document.createElement('span');
  favIndicator.className = 'tag-indicator';
  favIndicator.textContent = sticker.isFav ? '✓' : '';
  favItem.appendChild(favIndicator);
  favItem.appendChild(document.createTextNode(sticker.isFav ? '⭐ 取消常用' : '⭐ 設為常用'));
  menu.appendChild(favItem);

  // 分隔線
  menu.appendChild(document.createElement('div')).className = 'context-menu-divider';

  // 標籤選項
  tagVocabulary.forEach(tag => {
    const hasTag = sticker.tags.includes(tag);
    const tagItem = document.createElement('div');
    tagItem.className = 'context-menu-item' + (hasTag ? ' has-tag' : '');
    tagItem.dataset.action = 'toggleTag';
    tagItem.dataset.tag = tag;
    const indicator = document.createElement('span');
    indicator.className = 'tag-indicator';
    indicator.textContent = hasTag ? '✓' : '';
    tagItem.appendChild(indicator);
    tagItem.appendChild(document.createTextNode(tag));
    menu.appendChild(tagItem);
  });

  // 分隔線
  menu.appendChild(document.createElement('div')).className = 'context-menu-divider';

  // 新增標籤選項
  const addTagItem = document.createElement('div');
  addTagItem.className = 'context-menu-item';
  addTagItem.dataset.action = 'addCustomTag';
  addTagItem.textContent = '➕ 新增標籤...';
  menu.appendChild(addTagItem);

  // 定位選單 - 使用 clientX/clientY 視窗座標，避免捲軸影響
  const x = Math.min(e.clientX, window.innerWidth - 200);
  const y = Math.min(e.clientY, window.innerHeight - 300);
  menu.style.left = (window.scrollX + x) + 'px';
  menu.style.top = (window.scrollY + y) + 'px';

  document.body.appendChild(menu);

  // 綁定選單項目點擊事件
  menu.querySelectorAll('.context-menu-item').forEach(item => {
    item.addEventListener('click', async () => {
      const action = item.dataset.action;
      const tag = item.dataset.tag;

      if (action === 'toggleTag') {
        if (sticker.tags.includes(tag)) {
          await removeTagFromSticker(sticker.id, tag);
        } else {
          await applyTagToSticker(sticker.id, tag);
        }
      } else if (action === 'toggleFav') {
        await toggleFavorite(sticker.id);
      } else if (action === 'addCustomTag') {
        const newTag = prompt('請輸入新標籤名稱：');
        if (newTag && newTag.trim()) {
          await applyTagToSticker(sticker.id, newTag.trim());
        }
      }

      hideContextMenu();
    });
  });

  // 點擊其他地方關閉選單
  setTimeout(() => {
    document.addEventListener('click', hideContextMenu, { once: true });
  }, 0);
}

// 隱藏右鍵選單
function hideContextMenu() {
  const existingMenu = document.getElementById('contextMenu');
  if (existingMenu) {
    existingMenu.remove();
  }
}

// 顯示狀態訊息
function showStatus(message, isError = false) {
  statusBar.textContent = message;
  statusBar.className = 'status-bar show' + (isError ? ' error' : '');

  setTimeout(() => {
    statusBar.classList.remove('show');
  }, 3000);
}

// 套用標籤到貼圖
async function applyTagToSticker(id, tag) {
  try {
    const result = await chrome.storage.local.get(['stickerIdsText']);
    const parsed = parseStickerIdsText(result.stickerIdsText || '');

    const row = parsed.rows.find(r => r.id === id);
    if (!row) {
      showStatus(`找不到貼圖 ${id}`, true);
      console.error('Sticker not found:', id, 'Available rows:', parsed.rows);
      return;
    }

    // 確保 tags 是陣列
    if (!Array.isArray(row.tags)) {
      row.tags = [];
    }

    // 檢查是否已存在
    if (row.tags.includes(tag)) {
      showStatus('標籤已存在');
      return;
    }

    // 新增標籤
    row.tags.push(tag);

    // 儲存
    const newText = rowsToText(parsed.rows);
    await chrome.storage.local.set({ stickerIdsText: newText });

    // 更新本地資料
    const sticker = allStickers.find(s => s.id === id);
    if (sticker) {
      if (!Array.isArray(sticker.tags)) {
        sticker.tags = [];
      }
      sticker.tags.push(tag);
    }

    renderStickers();
    showStatus(`已新增標籤 "${tag}" 到 ${id}`);
  } catch (err) {
    console.error('Add tag error:', err);
    showStatus('新增標籤失敗: ' + err.message, true);
  }
}

// 從貼圖移除標籤
async function removeTagFromSticker(id, tag) {
  try {
    const result = await chrome.storage.local.get(['stickerIdsText']);
    const parsed = parseStickerIdsText(result.stickerIdsText || '');

    const row = parsed.rows.find(r => r.id === id);
    if (!row) return;

    // 確保 tags 是陣列
    if (!Array.isArray(row.tags)) {
      row.tags = [];
      return; // 沒有標籤可移除
    }

    // 移除標籤
    row.tags = row.tags.filter(t => t !== tag);

    // 儲存
    const newText = rowsToText(parsed.rows);
    await chrome.storage.local.set({ stickerIdsText: newText });

    // 更新本地資料
    const sticker = allStickers.find(s => s.id === id);
    if (sticker && Array.isArray(sticker.tags)) {
      sticker.tags = sticker.tags.filter(t => t !== tag);
    }

    renderStickers();
    showStatus(`已從 ${id} 移除標籤 "${tag}"`);
  } catch (err) {
    console.error('Remove tag error:', err);
    showStatus('移除標籤失敗: ' + err.message, true);
  }
}

// 刪除貼圖
async function deleteSticker(id) {
  // 確認提示
  const confirmed = confirm(t('deleteConfirmMessage', id));
  if (!confirmed) return;

  try {
    const result = await chrome.storage.local.get(['stickerIdsText', 'favoriteStickerIds']);
    const parsed = parseStickerIdsText(result.stickerIdsText || '');

    // 找到並移除該貼圖
    const rowIndex = parsed.rows.findIndex(r => r.id === id);
    if (rowIndex === -1) {
      showStatus(`找不到貼圖 ${id}`, true);
      return;
    }

    parsed.rows.splice(rowIndex, 1);

    // 儲存新的 ID 列表
    const newText = rowsToText(parsed.rows);
    await chrome.storage.local.set({ stickerIdsText: newText });

    // 從收藏清單中移除
    const favIds = result.favoriteStickerIds || [];
    const newFavIds = favIds.filter(fid => fid !== id);
    await chrome.storage.local.set({ favoriteStickerIds: newFavIds });

    // 更新本地資料
    allStickers = allStickers.filter(s => s.id !== id);
    selectedIds.delete(id);

    // 重新渲染
    filterStickers();
    updateTagTabs();
    updateBatchPanel();

    showStatus(`已刪除貼圖 ${id}`);
  } catch (err) {
    console.error('Delete sticker error:', err);
    showStatus('刪除失敗: ' + err.message, true);
  }
}

// 切換常用狀態
async function toggleFavorite(id) {
  try {
    const result = await chrome.storage.local.get(['favoriteStickerIds']);
    let favIds = result.favoriteStickerIds || [];

    const sticker = allStickers.find(s => s.id === id);
    if (!sticker) return;

    if (favIds.includes(id)) {
      // 取消常用
      favIds = favIds.filter(fid => fid !== id);
      sticker.isFav = false;
      showStatus(`已取消常用 ${id}`);
    } else {
      // 設為常用
      favIds.push(id);
      sticker.isFav = true;
      showStatus(`已設為常用 ${id}`);
    }

    // 只更新 favoriteStickerIds，不改變 stickerIdsText 順序
    await chrome.storage.local.set({ favoriteStickerIds: favIds });

    filterStickers();
  } catch (err) {
    console.error('Toggle favorite error:', err);
    showStatus('操作失敗: ' + err.message, true);
  }
}

// 將 rows 轉換回文字格式
function rowsToText(rows) {
  return rows.map(row => {
    // 正規化 ID（針對 GSS 格式移除 HTTP/HTTPS 前綴）
    let normalizedId = row.id;
    if (row.id.startsWith('GSS-')) {
      normalizedId = row.id.replace(/^GSS-https?:\/\//i, 'GSS-');
    }

    const tagsPart = row.tags.map(t => `#${t}`).join(' ');
    return tagsPart ? `${normalizedId} ${tagsPart}` : normalizedId;
  }).join('\n');
}

// 全選/取消全選
function toggleSelectAll() {
  const allSelected = filteredStickers.every(s => selectedIds.has(s.id));

  if (allSelected) {
    // 取消全選
    for (const s of filteredStickers) {
      selectedIds.delete(s.id);
    }
  } else {
    // 全選
    for (const s of filteredStickers) {
      selectedIds.add(s.id);
    }
  }

  renderStickers();
  updateBatchPanel();
}

// 清除選擇
function clearSelection() {
  selectedIds.clear();
  renderStickers();
  updateBatchPanel();
}

// 更新批量操作面板
function updateBatchPanel() {
  const count = selectedIds.size;
  selectedCount.textContent = count;

  if (count > 0) {
    batchPanel.classList.add('show');
  } else {
    batchPanel.classList.remove('show');
  }
}

// 批量新增標籤
async function batchAddTag() {
  // 從下拉選擇或輸入框獲取標籤
  let tag = '';
  if (batchTagSelect && batchTagSelect.value && batchTagSelect.value !== '__manual__') {
    tag = batchTagSelect.value;
  } else if (batchTagInput) {
    tag = batchTagInput.value.trim();
  }

  if (!tag) {
    showStatus('請選擇或輸入標籤名稱', true);
    return;
  }

  let successCount = 0;
  let failCount = 0;

  for (const id of selectedIds) {
    try {
      const result = await chrome.storage.local.get(['stickerIdsText']);
      const parsed = parseStickerIdsText(result.stickerIdsText || '');
      const row = parsed.rows.find(r => r.id === id);

      if (row && !row.tags.includes(tag)) {
        row.tags.push(tag);
        const newText = rowsToText(parsed.rows);
        await chrome.storage.local.set({ stickerIdsText: newText });

        const sticker = allStickers.find(s => s.id === id);
        if (sticker) {
          sticker.tags.push(tag);
        }
        successCount++;
      }
    } catch (err) {
      failCount++;
    }
  }

  // 重置輸入
  if (batchTagSelect) batchTagSelect.value = '';
  if (batchTagInput) {
    batchTagInput.value = '';
    batchTagInput.style.display = 'none';
  }

  filterStickers();
  updateTagTabs();
  showStatus(`批量新增完成: ${successCount} 成功${failCount > 0 ? `, ${failCount} 失敗` : ''}`);
}

// 批量刪除ID
async function batchDeleteIds() {
  if (selectedIds.size === 0) {
    showStatus('請先選擇要刪除的貼圖', true);
    return;
  }

  if (!confirm(`確定要刪除 ${selectedIds.size} 個選中的貼圖嗎？\n\n此操作無法復原！`)) {
    return;
  }

  let successCount = 0;
  let failCount = 0;

  try {
    const result = await chrome.storage.local.get(['stickerIdsText']);
    const parsed = parseStickerIdsText(result.stickerIdsText || '');

    // 過濾掉要刪除的ID
    const remainingRows = parsed.rows.filter(row => !selectedIds.has(row.id));

    // 保存更新後的資料
    const newText = rowsToText(remainingRows);
    await chrome.storage.local.set({ stickerIdsText: newText });

    // 更新 allStickers 陣列
    allStickers = allStickers.filter(sticker => !selectedIds.has(sticker.id));

    // 更新 filteredStickers 陣列（確保 renderStickers 使用最新的數據）
    filteredStickers = filteredStickers.filter(sticker => !selectedIds.has(sticker.id));

    successCount = selectedIds.size;

    // 清除選擇
    selectedIds.clear();
    updateBatchPanel();

    // 更新左側 ID 輸入框
    if (idListInput) {
      idListInput.value = newText;
      // 觸發 input 事件以更新行號顯示
      idListInput.dispatchEvent(new Event('input'));
    }

    // 重新渲染
    renderStickers();

  } catch (err) {
    console.error('批量刪除失敗:', err);
    failCount = selectedIds.size;
  }

  showStatus(`批量刪除完成: ${successCount} 成功${failCount > 0 ? `, ${failCount} 失敗` : ''}`);
}

// 批量移除標籤
async function batchRemoveTag() {
  // 從下拉選擇或輸入框獲取標籤
  let tag = '';
  if (batchTagSelect && batchTagSelect.value && batchTagSelect.value !== '__manual__') {
    tag = batchTagSelect.value;
  } else if (batchTagInput) {
    tag = batchTagInput.value.trim();
  }

  if (!tag) {
    showStatus('請選擇或輸入標籤名稱', true);
    return;
  }

  let successCount = 0;
  let failCount = 0;

  for (const id of selectedIds) {
    try {
      const result = await chrome.storage.local.get(['stickerIdsText']);
      const parsed = parseStickerIdsText(result.stickerIdsText || '');
      const row = parsed.rows.find(r => r.id === id);

      if (row && row.tags.includes(tag)) {
        row.tags = row.tags.filter(t => t !== tag);
        const newText = rowsToText(parsed.rows);
        await chrome.storage.local.set({ stickerIdsText: newText });

        const sticker = allStickers.find(s => s.id === id);
        if (sticker) {
          sticker.tags = sticker.tags.filter(t => t !== tag);
        }
        successCount++;
      }
    } catch (err) {
      failCount++;
    }
  }

  // 重置輸入
  if (batchTagSelect) batchTagSelect.value = '';
  if (batchTagInput) {
    batchTagInput.value = '';
    batchTagInput.style.display = 'none';
  }

  filterStickers();
  updateTagTabs();
  showStatus(`批量移除完成: ${successCount} 成功${failCount > 0 ? `, ${failCount} 失敗` : ''}`);
}

// 匯出資料
async function exportData() {
  try {
    const result = await chrome.storage.local.get(['stickerIdsText']);
    const blob = new Blob([result.stickerIdsText || ''], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `gss_stickers_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();

    URL.revokeObjectURL(url);
    showStatus('資料已匯出');
  } catch (err) {
    showStatus('匯出失敗: ' + err.message, true);
  }
}

// 匯出給批量操作使用
window.applyTagToSticker = applyTagToSticker;
window.removeTagFromSticker = removeTagFromSticker;

// ==================== 行號顯示和跳轉功能 ====================
function updateLineInfo() {
  const lineInfoText = document.getElementById('lineInfoText');
  if (!idListInput || !lineInfoText) return;

  // 處理 \r\n 和 \n 兩種換行符格式
  const normalizedValue = idListInput.value.replace(/\r\n/g, '\n');
  const lines = normalizedValue.split('\n');
  const totalLines = lines.length;

  // 計算當前光標所在行
  const cursorPos = idListInput.selectionStart;
  const textBeforeCursor = idListInput.value.substring(0, cursorPos).replace(/\r\n/g, '\n');
  const currentLine = textBeforeCursor.split('\n').length;

  lineInfoText.textContent = `第 ${currentLine} 行 / 共 ${totalLines} 行`;
}

function initLineInfo() {
  const gotoLineInput = document.getElementById('gotoLineInput');
  const gotoLineBtn = document.getElementById('gotoLineBtn');
  if (!idListInput) return;

  function gotoLine() {
    const lineNum = parseInt(gotoLineInput.value, 10);
    if (isNaN(lineNum) || lineNum < 1) return;

    const lines = idListInput.value.split('\n');
    if (lineNum > lines.length) return;

    // 計算目標行的起始位置
    let targetPos = 0;
    for (let i = 0; i < lineNum - 1; i++) {
      targetPos += lines[i].length + 1; // +1 for \n
    }

    // 設置光標位置並聚焦
    idListInput.focus();
    idListInput.setSelectionRange(targetPos, targetPos);
    updateLineInfo();

    // 滾動到該行
    const lineHeight = 18; // 近似行高
    idListInput.scrollTop = (lineNum - 1) * lineHeight;
  }

  // 監聽光標移動和輸入
  idListInput.addEventListener('keyup', updateLineInfo);
  idListInput.addEventListener('click', updateLineInfo);
  idListInput.addEventListener('input', updateLineInfo);
  idListInput.addEventListener('scroll', updateLineInfo);

  // 跳轉按鈕
  if (gotoLineBtn) {
    gotoLineBtn.addEventListener('click', gotoLine);
  }
  if (gotoLineInput) {
    gotoLineInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') gotoLine();
    });
  }

  // 初始更新
  setTimeout(() => {
    updateLineInfo();
  }, 100);
}
