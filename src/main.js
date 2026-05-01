// ================================================================
// main.js（入口文件）
// 职责：实例化所有模块，绑定生命周期，响应功能开关
//
// 本版本修复：
// 新增启动时"一次性 resolved 监听"机制
// 解决插件重启时 metadataCache 尚未就绪导致 F2/F3 不生效的问题
// ================================================================

const { Plugin }          = require('obsidian');
const { AttachmentState } = require('./AttachmentState');
const { ConfigManager }   = require('./ConfigManager');
const { RedDotManager }   = require('./modules/RedDotManager');
const { PrefixManager }   = require('./modules/PrefixManager');
const { LocatorManager }  = require('./modules/LocatorManager');
const { SettingsManager } = require('./modules/SettingsManager');

module.exports = class AttachmentButlerPlugin extends Plugin {

  async onload() {
    console.log('Attachment Butler loaded!');

    // 1. 初始化运行时状态
    this.state = new AttachmentState();

    // 2. 加载配置
    this.config = new ConfigManager(this);
    await this.config.load();

    // 3. 实例化各模块
    this.redDotManager  = new RedDotManager(this.app, this.state);
    this.prefixManager  = new PrefixManager(this.app, this.state);
    this.locatorManager = new LocatorManager(this.app, this.state);

    // 4. 注册设置页
    this.addSettingTab(new SettingsManager(
      this.app,
      this,
      this.config,
      (key, value) => this._applyFeatureToggle(key, value)
    ));

    // 5. 注册各模块的持续事件监听
    this.redDotManager.registerEvents(this);
    this.prefixManager.registerEvents(this);
    this.locatorManager.registerEvents(this);

    // 6. 界面就绪后初始化
    this.app.workspace.onLayoutReady(() => {
      this._initializeFeatures();

      // ── 关键修复：一次性 resolved 监听 ────────────────────────
      // 问题：插件重启时 onLayoutReady 触发，但 resolvedLinks 可能还是空的
      //       导致 buildReferenceIndex 建立了空索引，F2/F3 看不到任何引用数据
      //
      // 解决：注册一个一次性 resolved 事件
      //       Obsidian 完成链接解析后，强制用真实数据重新初始化一次
      //       之后的持续更新由各模块自己的 resolved 监听器接管
      const onFirstResolved = this.app.metadataCache.on('resolved', () => {
        // 用真实数据重建索引并刷新 UI
        this._refreshAllFeatures();
        // 立即注销，这个监听器只触发一次
        this.app.metadataCache.offref(onFirstResolved);
      });
    });
  }

  /**
   * 根据当前配置启用各功能模块
   * 在 onLayoutReady 时首次调用（此时 resolvedLinks 可能还是空的，作为初始渲染）
   * @private
   */
  _initializeFeatures() {
    if (this.config.get('enableRedDot'))  this.redDotManager.initialize();
    if (this.config.get('enablePrefix'))  this.prefixManager.initialize();
    if (this.config.get('enableLocator')) this.locatorManager.enable();
  }

  /**
   * 用最新的 resolvedLinks 重建索引并刷新所有启用中的功能 UI
   * 在一次性 resolved 事件后调用，确保数据准确
   * @private
   */
  _refreshAllFeatures() {
    if (this.config.get('enableRedDot')) {
      this.redDotManager.buildReferenceIndex();
      this.redDotManager.applyAllIndicators();
    } else {
      // 即使红点关闭，也要重建索引（F2/F3 依赖同一份 state 数据）
      this.redDotManager.buildReferenceIndex();
    }

    if (this.config.get('enablePrefix')) {
      this.prefixManager.applyAllPrefixes();
    }
    // F2 是纯事件驱动，不需要主动刷新
  }

  /**
   * 功能开关响应（由 SettingsManager 的 onToggle 回调触发）
   * @param {'enableRedDot'|'enableLocator'|'enablePrefix'} key
   * @param {boolean} value
   * @private
   */
  _applyFeatureToggle(key, value) {
    if (key === 'enableRedDot') {
      value ? this.redDotManager.enable()  : this.redDotManager.disable();
    } else if (key === 'enableLocator') {
      value ? this.locatorManager.enable() : this.locatorManager.disable();
    } else if (key === 'enablePrefix') {
      value ? this.prefixManager.enable()  : this.prefixManager.disable();
    }
  }

  onunload() {
    this.redDotManager.destroy();
    this.prefixManager.destroy();
    console.log('Attachment Butler unloaded!');
  }
}