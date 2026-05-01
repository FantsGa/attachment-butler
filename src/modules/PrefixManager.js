// ================================================================
// PrefixManager.js
// 职责：F3 被引用附件笔记名前缀显示
// 本版本新增：enable() / disable() 支持设置页开关立即生效
// ================================================================

const { setTooltip } = require('obsidian');

class PrefixManager {

  constructor(app, state) {
    this.app   = app;
    this.state = state;

    this._applyTimer   = null;
    this._rebuildTimer = null;
    this._fileExplorerObserver = null;

    /** 功能是否启用，默认 false，由 main.js 控制 @private */
    this._enabled = false;
  }

  // ── 生命周期 ───────────────────────────────────────────────────

  initialize() { this.enable(); }

  enable() {
    if (this._enabled) return;
    this._enabled = true;
    this.applyAllPrefixes();
    this._observeFileExplorer();
  }

  disable() {
    if (!this._enabled) return;
    this._enabled = false;
    // 移除所有前缀 span
    document.querySelectorAll('.attachment-butler-prefix').forEach(el => el.remove());
    // 移除所有自定义 tooltip（恢复 Obsidian 原生时间 tooltip）
    document.querySelectorAll('.nav-file-title[aria-label]').forEach(el => {
      el.removeAttribute('aria-label');
    });
    if (this._fileExplorerObserver) {
      this._fileExplorerObserver.disconnect();
      this._fileExplorerObserver = null;
    }
    clearTimeout(this._applyTimer);
    clearTimeout(this._rebuildTimer);
  }

  destroy() { this.disable(); }

  // ── 事件注册 ───────────────────────────────────────────────────

  registerEvents(plugin) {
    plugin.registerEvent(
      this.app.metadataCache.on('resolved', () => {
        if (!this._enabled) return;
        clearTimeout(this._rebuildTimer);
        this._rebuildTimer = setTimeout(() => this.applyAllPrefixes(), 150);
      })
    );
    plugin.registerEvent(
      this.app.vault.on('rename', () => { if (this._enabled) this._scheduleApply(); })
    );
    plugin.registerEvent(
      this.app.vault.on('delete', () => { if (this._enabled) this._scheduleApply(); })
    );
  }

  // ── 核心逻辑（与之前版本完全一致）────────────────────────────

  applyAllPrefixes() {
    if (!this._enabled) return;
    const fileItems = document.querySelectorAll('.nav-file-title[data-path]');

    for (const item of fileItems) {
      const filePath = item.getAttribute('data-path');
      if (!filePath) continue;
      const file = this.app.vault.getAbstractFileByPath(filePath);

      if (!file || file.extension === 'md' || !file.extension) {
        this._removePrefix(item);
        continue;
      }

      const refs = this.state.getRefs(filePath);
      if (!refs || refs.size === 0) {
        this._removePrefix(item);
        this._clearTooltip(item);
        continue;
      }

      const refNoteNames = Array.from(refs)
        .map(notePath => {
          const nf = this.app.vault.getAbstractFileByPath(notePath);
          return nf ? nf.basename : notePath.replace(/\.md$/, '');
        })
        .sort();

      const primaryNote = refNoteNames[0];
      const extraCount  = refNoteNames.length - 1;
      const prefix = extraCount > 0
        ? `[${primaryNote}]+${extraCount}_`
        : `[${primaryNote}]`;

      this._applyPrefix(item, prefix, refNoteNames, file);
    }
  }

  _applyPrefix(navTitleEl, prefix, allNoteNames, file) {
    const titleContent = navTitleEl.querySelector('.nav-file-title-content');
    if (!titleContent) return;
    const existing = titleContent.querySelector('.attachment-butler-prefix');
    if (existing) existing.remove();
    const prefixEl = document.createElement('span');
    prefixEl.className = 'attachment-butler-prefix';
    prefixEl.textContent = prefix;
    titleContent.prepend(prefixEl);
    this._setTooltip(navTitleEl, file, allNoteNames);
  }

  _removePrefix(navTitleEl) {
    const titleContent = navTitleEl.querySelector('.nav-file-title-content');
    if (!titleContent) return;
    titleContent.querySelector('.attachment-butler-prefix')?.remove();
  }

  _setTooltip(navTitleEl, file, noteNames) {
    const parts = [];
    if (noteNames.length > 0) {
      parts.push('被引用笔记：');
      noteNames.forEach(name => parts.push(`[${name}]`));
      parts.push('');
    }
    if (file?.stat) {
      parts.push(`最后修改于 ${this._formatDate(file.stat.mtime)}`);
      parts.push(`创建于 ${this._formatDate(file.stat.ctime)}`);
    }
    setTooltip(navTitleEl, parts.join('\n'));
  }

  _clearTooltip(navTitleEl) {
    navTitleEl.removeAttribute('aria-label');
  }

  _formatDate(ts) {
    const d  = new Date(ts);
    const y  = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    const h  = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${y}-${mo}-${da} ${h}:${mi}`;
  }

  _scheduleApply() {
    clearTimeout(this._applyTimer);
    this._applyTimer = setTimeout(() => this.applyAllPrefixes(), 50);
  }

  _observeFileExplorer() {
    const container = document.querySelector('.nav-files-container');
    if (!container) {
      console.warn('Attachment Butler [PrefixManager]: 找不到文件树容器');
      return;
    }
    this._fileExplorerObserver = new MutationObserver(() => this._scheduleApply());
    this._fileExplorerObserver.observe(container, { childList: true, subtree: true });
  }
}

module.exports = { PrefixManager };