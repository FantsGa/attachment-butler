// ================================================================
// SettingsManager.js
// 职责：纯 UI 渲染，不含任何业务逻辑
// 文案来源：i18n.js（禁止在此硬编码任何显示文字）
// 状态来源：ConfigManager
//
// 本版本修复：
// 1. 顶部标题改用更大字号，与副标题形成明显层级
// 2. 文字改为左对齐（跟随 Obsidian 标准设置页风格）
// 3. 增大标题区块与功能列表之间的间距
// 4. 增大三个功能开关之间的间距
// ================================================================

const { PluginSettingTab, Setting } = require('obsidian');
const { I18N, SHOW_SUPPORT_BUTTON } = require('../i18n');

class SettingsManager extends PluginSettingTab {

  /**
   * @param {import('obsidian').App} app
   * @param {import('obsidian').Plugin} plugin
   * @param {import('../ConfigManager').ConfigManager} config
   * @param {function(string, boolean): void} onToggle
   */
  constructor(app, plugin, config, onToggle) {
    super(app, plugin);
    this._config   = config;
    this._onToggle = onToggle;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();

    // ── 顶部标题区块 ─────────────────────────────────────────────
    const header = containerEl.createDiv();
    header.style.cssText = 'margin-bottom: 24px;';

    // 主标题：字号明显大于副标题
    const title = header.createEl('div', { text: I18N.pluginTitle });
    title.style.cssText = `
      font-size: 1.4em;
      font-weight: 700;
      color: var(--text-normal);
      margin-bottom: 6px;
    `;

    // 副标题
    const subtitle = header.createEl('div', { text: I18N.pluginSubtitle });
    subtitle.style.cssText = `
      font-size: 0.95em;
      color: var(--text-muted);
      margin-bottom: 10px;
    `;

    // "立即生效"提示
    const notice = header.createEl('div', { text: I18N.immediateEffect });
    notice.style.cssText = `
      font-size: 0.85em;
      color: var(--text-faint);
    `;

    // ── F1 开关 ───────────────────────────────────────────────────
    const f1Setting = new Setting(containerEl)
      .setName(I18N.f1Name)
      .setDesc(I18N.f1Desc)
      .addToggle(toggle =>
        toggle
          .setValue(this._config.get('enableRedDot'))
          .onChange(async value => {
            await this._config.set('enableRedDot', value);
            this._onToggle('enableRedDot', value);
          })
      );
    // 增大功能项间距
    f1Setting.settingEl.style.marginBottom = '8px';

    // ── F2 开关 ───────────────────────────────────────────────────
    const f2Setting = new Setting(containerEl)
      .setName(I18N.f2Name)
      .setDesc(I18N.f2Desc)
      .addToggle(toggle =>
        toggle
          .setValue(this._config.get('enableLocator'))
          .onChange(async value => {
            await this._config.set('enableLocator', value);
            this._onToggle('enableLocator', value);
          })
      );
    f2Setting.settingEl.style.marginBottom = '8px';

    // ── F3 开关 ───────────────────────────────────────────────────
    new Setting(containerEl)
      .setName(I18N.f3Name)
      .setDesc(I18N.f3Desc)
      .addToggle(toggle =>
        toggle
          .setValue(this._config.get('enablePrefix'))
          .onChange(async value => {
            await this._config.set('enablePrefix', value);
            this._onToggle('enablePrefix', value);
          })
      );

    // ── 支持开发者区块 ────────────────────────────────────────────
    if (SHOW_SUPPORT_BUTTON) {
      const hr = containerEl.createEl('hr');
      hr.style.margin = '28px 0 20px';

      const section = containerEl.createDiv();
      section.style.cssText = 'text-align: center; padding: 0 0 24px;';

      const supportTitle = section.createEl('div', { text: I18N.supportTitle });
      supportTitle.style.cssText = `
        font-size: 1.1em;
        font-weight: 600;
        color: var(--text-normal);
        margin-bottom: 10px;
      `;

      const githubDesc = section.createEl('p', { text: I18N.supportGithubDesc });
      githubDesc.style.cssText = 'color: var(--text-muted); margin-bottom: 6px;';

      const githubLine = section.createEl('p');
      githubLine.style.marginBottom = '16px';
      githubLine.appendText(I18N.supportGithubLabel);
      const link = githubLine.createEl('a', {
        text: I18N.githubUrl,
        href: I18N.githubUrl,
      });
      link.style.color  = 'var(--text-accent)';
      link.target       = '_blank';
      link.rel          = 'noopener noreferrer';

      const coffeeDesc = section.createEl('p', { text: I18N.coffeeDesc });
      coffeeDesc.style.cssText = 'color: var(--text-muted); margin-bottom: 12px;';

      const coffeeBtn = section.createEl('button', { text: I18N.coffeeBtn });
      coffeeBtn.style.cssText = `
        background-color: var(--interactive-accent);
        color: var(--text-on-accent);
        border: none;
        border-radius: 6px;
        padding: 10px 28px;
        font-size: 1em;
        cursor: pointer;
      `;
      coffeeBtn.addEventListener('click', () => {
        window.open(I18N.coffeeUrl, '_blank');
      });
    }
  }
}

module.exports = { SettingsManager };