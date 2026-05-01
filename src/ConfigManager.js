// ================================================================
// ConfigManager.js
// 职责：独立管理三个功能开关的读写与持久化
// 与 AttachmentState（运行时引用数据）完全隔离
// 所有状态读写必须通过本类的公开方法，禁止直接读写 _data
// ================================================================

class ConfigManager {

  /**
   * @param {import('obsidian').Plugin} plugin - 用于 loadData / saveData
   */
  constructor(plugin) {
    this._plugin = plugin;

    /**
     * 默认配置：三个功能全部开启
     * @private
     */
    this._data = {
      enableRedDot:  true,
      enableLocator: true,
      enablePrefix:  true,
    };
  }

  /**
   * 从磁盘加载已保存配置，合并到默认值
   * 必须在 plugin.onload() 中 await 调用，早于任何模块初始化
   */
  async load() {
    const saved = await this._plugin.loadData();
    if (saved) {
      // 只合并已知 key，防止旧版本遗留字段污染
      for (const key of Object.keys(this._data)) {
        if (key in saved) this._data[key] = saved[key];
      }
    }
  }

  /**
   * 获取单个配置项的当前值
   * @param {'enableRedDot'|'enableLocator'|'enablePrefix'} key
   * @returns {boolean}
   */
  get(key) {
    return this._data[key];
  }

  /**
   * 更新单个配置项并立即持久化到磁盘
   * @param {'enableRedDot'|'enableLocator'|'enablePrefix'} key
   * @param {boolean} value
   */
  async set(key, value) {
    this._data[key] = value;
    await this._plugin.saveData(this._data);
  }

  /**
   * 返回当前配置的只读副本（供 SettingsManager 初始化 UI 用）
   * @returns {{ enableRedDot: boolean, enableLocator: boolean, enablePrefix: boolean }}
   */
  getAll() {
    return { ...this._data };
  }
}

module.exports = { ConfigManager };