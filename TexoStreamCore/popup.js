// Texo Stream Core - Popup 頁面綁定
// 【隸屬：GSS 管理面板 (popup.html)】
// 綁定管理面板的「編織」頁面事件

const TexoPopup = {
  init() {
    const btnSave = document.getElementById('texoSave');

    if (btnSave) btnSave.addEventListener('click', () => this.save());

    setTimeout(() => this.load(), 100);
  },

  save() {
    const input = document.getElementById('texoInput');
    if (!input) return;
    TexoCore.save(input.value.trim(), () => this.showToast(t('texoSaved')));
  },

  load() {
    const input = document.getElementById('texoInput');
    if (!input) return;
    TexoCore.load((text) => { if (text) input.value = text; });
  },

  showToast(msg) {
    const status = document.getElementById('texoStatus');
    if (!status) return;
    const original = status.textContent;
    const originalColor = status.style.color;
    status.textContent = msg;
    status.style.color = msg.includes('❌') ? '#ff6b6b' : '#28a745';
    setTimeout(() => {
      status.textContent = original;
      status.style.color = originalColor;
    }, 2500);
  }
};
