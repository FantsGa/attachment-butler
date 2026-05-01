// ================================================================
// LocatorManager.js
// 职责：F2 右键"定位到笔记"菜单
// 本版本新增：enable() / disable() 支持设置页开关立即生效
// ================================================================

class LocatorManager {

  constructor(app, state) {
    this.app   = app;
    this.state = state;

    /** 功能是否启用，默认 false，由 main.js 控制 @private */
    this._enabled = false;
  }

  enable()  { this._enabled = true;  }
  disable() { this._enabled = false; }

  registerEvents(plugin) {
    plugin.registerEvent(
      this.app.workspace.on('file-menu', (menu, file) => {
        // 开关关闭时直接返回，右键菜单完全不含本功能的入口
        if (!this._enabled) return;
        if (!file.extension || file.extension === 'md') return;

        const refs = this.state.getRefs(file.path);
        if (!refs || refs.size === 0) return;

        menu.addItem((item) => {
          item.setTitle('定位到笔记').setIcon('crosshair').setSection('open');

          const submenu = item.setSubmenu();

          Array.from(refs)
            .map(notePath => ({
              notePath,
              noteFile: this.app.vault.getAbstractFileByPath(notePath),
            }))
            .filter(e => e.noteFile)
            .sort((a, b) => a.noteFile.basename.localeCompare(b.noteFile.basename))
            .forEach(({ noteFile }) => {
              submenu.addItem(sub =>
                sub
                  .setTitle(noteFile.basename)
                  .setIcon('file-text')
                  .onClick(async () => this._openAndScroll(noteFile, file))
              );
            });
        });
      })
    );
  }

  async _openAndScroll(noteFile, attachFile) {
    const leaf = this.app.workspace.getLeaf('tab');
    await leaf.openFile(noteFile);

    const targetLine = await this._findReferenceLine(noteFile, attachFile);
    if (targetLine === -1) return;

    await new Promise(resolve => setTimeout(resolve, 150));

    const view = leaf.view;
    if (!view?.editor) return;

    view.editor.setCursor({ line: targetLine, ch: 0 });

    await new Promise(resolve => requestAnimationFrame(resolve));
    await new Promise(resolve => requestAnimationFrame(resolve));

    const activeLine = view.containerEl.querySelector('.cm-activeLine');
    if (activeLine) activeLine.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  async _findReferenceLine(noteFile, attachFile) {
    const lines    = (await this.app.vault.read(noteFile)).split('\n');
    const fullName = attachFile.name;
    const baseName = attachFile.basename;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (
        line.includes(`[[${fullName}]]`) ||
        line.includes(`[[${baseName}]]`) ||
        line.includes(`(${fullName})`)   ||
        line.includes(`/${fullName})`)
      ) return i;
    }
    return -1;
  }
}

module.exports = { LocatorManager };