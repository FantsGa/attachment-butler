// ================================================================
// RedDotManager.js
// 职责：F1 红点标识 + 引用关系索引管理
// 本版本新增：enable() / disable() 支持设置页开关立即生效
// ================================================================

class RedDotManager {

  constructor(app, state) {
    this.app   = app;
    this.state = state;

    this._applyTimer    = null;
    this._rebuildTimer  = null;
    this._fileExplorerObserver = null;

    /**
     * 功能是否启用（由 main.js 通过 enable/disable 控制）
     * 默认 false，由 main.js 在 onLayoutReady 后根据 ConfigManager 决定是否启用
     * @private
     */
    this._enabled = false;
  }

  // ── 生命周期 ───────────────────────────────────────────────────

  /** 首次初始化（等价于 enable，供 main.js 在 onLayoutReady 时调用） */
  initialize() {
    this.enable();
  }

  /**
   * 启用功能：构建索引，应用红点，启动 DOM 监听
   * 若已启用则跳过（幂等）
   */
  enable() {
    if (this._enabled) return;
    this._enabled = true;
    this.buildReferenceIndex();
    this.applyAllIndicators();
    this._observeFileExplorer();
  }

  /**
   * 禁用功能：移除所有红点，断开 DOM 监听
   * 若已禁用则跳过（幂等）
   */
  disable() {
    if (!this._enabled) return;
    this._enabled = false;
    // 清除所有红点 DOM
    document.querySelectorAll('.attachment-butler-dot').forEach(el => el.remove());
    // 断开文件树监听
    if (this._fileExplorerObserver) {
      this._fileExplorerObserver.disconnect();
      this._fileExplorerObserver = null;
    }
    clearTimeout(this._applyTimer);
    clearTimeout(this._rebuildTimer);
  }

  /** 插件卸载时调用，完整清理 */
  destroy() {
    this.disable();
  }

  // ── 事件注册 ───────────────────────────────────────────────────

  /**
   * 注册所有事件监听（由 main.js 统一注册，保证生命周期正确）
   * 事件监听器始终存在，由 _enabled 标志决定是否响应
   * @param {import('obsidian').Plugin} plugin
   */
  registerEvents(plugin) {
    plugin.registerEvent(
      this.app.metadataCache.on('resolved', () => {
        if (!this._enabled) return;
        clearTimeout(this._rebuildTimer);
        this._rebuildTimer = setTimeout(() => {
          this.buildReferenceIndex();
          this.applyAllIndicators();
        }, 100);
      })
    );

    plugin.registerEvent(
      this.app.vault.on('create', (file) => {
        if (file.extension && file.extension !== 'md') {
          this.state.registerAttachment(file.path);
        }
      })
    );

    plugin.registerEvent(
      this.app.vault.on('delete', (file) => {
        this.state.removeAttachment(file.path);
        if (this._enabled) this._scheduleApply();
      })
    );

    plugin.registerEvent(
      this.app.vault.on('rename', (file, oldPath) => {
        this.state.renameAttachment(oldPath, file.path);
        if (this._enabled) this._scheduleApply();
      })
    );
  }

  // ── 核心逻辑（与之前版本完全一致）────────────────────────────

  onAttachmentCreated(file) {
    this.state.registerAttachment(file.path);
    if (this._enabled) this._scheduleApply();
  }

  buildReferenceIndex() {
    const newMap   = new Map();
    const allFiles = this.app.vault.getFiles();

    for (const file of allFiles) {
      if (file.extension !== 'md') newMap.set(file.path, new Set());
    }

    const nameToFiles = new Map();
    for (const file of allFiles) {
      if (file.extension !== 'md') {
        if (!nameToFiles.has(file.name)) nameToFiles.set(file.name, []);
        nameToFiles.get(file.name).push(file);
      }
    }

    const resolvedLinks = this.app.metadataCache.resolvedLinks;

    for (const [notePath, links] of Object.entries(resolvedLinks)) {
      for (const linkedPath of Object.keys(links)) {
        if (!newMap.has(linkedPath)) continue;
        const linkedFile = this.app.vault.getAbstractFileByPath(linkedPath);
        if (!linkedFile) continue;

        const sameNameFiles = nameToFiles.get(linkedFile.name) || [];

        if (sameNameFiles.length <= 1) {
          newMap.get(linkedPath).add(notePath);
        } else {
          const prevNoteAssigns = this._getPreviousAssignments().get(notePath);
          const prevPath = prevNoteAssigns?.get(linkedFile.name);

          if (prevPath && this.app.vault.getAbstractFileByPath(prevPath)) {
            if (!newMap.has(prevPath)) newMap.set(prevPath, new Set());
            newMap.get(prevPath).add(notePath);
          } else {
            const note       = this.app.vault.getAbstractFileByPath(notePath);
            const noteFolder = note?.parent?.path || '';
            const best = sameNameFiles.reduce((a, b) =>
              this._proximityScore(a.path, noteFolder) <=
              this._proximityScore(b.path, noteFolder) ? a : b
            );
            if (!newMap.has(best.path)) newMap.set(best.path, new Set());
            newMap.get(best.path).add(notePath);
          }
        }
      }
    }

    this.state.replaceReferenceMap(newMap);
  }

  /**
   * 从当前 state 生成历史引用快照
   * Map<笔记路径, Map<文件名, 附件路径>>
   * @private
   */
  _getPreviousAssignments() {
    const prev = new Map();
    const prevMap = this.state.getAllAttachments();
    for (const [attachPath, refs] of prevMap) {
      const f = this.app.vault.getAbstractFileByPath(attachPath);
      if (!f) continue;
      for (const notePath of refs) {
        if (!prev.has(notePath)) prev.set(notePath, new Map());
        prev.get(notePath).set(f.name, attachPath);
      }
    }
    return prev;
  }

  applyAllIndicators() {
    if (!this._enabled) return;
    const fileItems = document.querySelectorAll('.nav-file-title[data-path]');
    for (const item of fileItems) {
      const filePath = item.getAttribute('data-path');
      if (!filePath) continue;
      const file = this.app.vault.getAbstractFileByPath(filePath);
      if (!file || file.extension === 'md' || !file.extension) {
        this._setRedDot(item, false);
        continue;
      }
      const refs = this.state.getRefs(filePath);
      this._setRedDot(item, refs.size === 0);
    }
  }

  _setRedDot(navTitleEl, shouldShow) {
    const existing = navTitleEl.querySelector('.attachment-butler-dot');
    if (shouldShow && !existing) {
      const dot = document.createElement('span');
      dot.className = 'attachment-butler-dot';
      dot.title = '此附件未被任何笔记引用';
      navTitleEl.prepend(dot);
    } else if (!shouldShow && existing) {
      existing.remove();
    }
  }

  _scheduleApply() {
    clearTimeout(this._applyTimer);
    this._applyTimer = setTimeout(() => this.applyAllIndicators(), 50);
  }

  _observeFileExplorer() {
    const container = document.querySelector('.nav-files-container');
    if (!container) {
      console.warn('Attachment Butler [RedDotManager]: 找不到文件树容器');
      return;
    }
    this._fileExplorerObserver = new MutationObserver(() => {
      this._scheduleApply();
    });
    this._fileExplorerObserver.observe(container, { childList: true, subtree: true });
  }

  _proximityScore(filePath, noteFolder) {
    const fp = filePath.split('/');
    const np = noteFolder ? noteFolder.split('/') : [];
    let common = 0;
    while (common < np.length && common < fp.length - 1 && np[common] === fp[common]) {
      common++;
    }
    return (np.length - common) * 1000 + (fp.length - 1 - common);
  }
}

module.exports = { RedDotManager };