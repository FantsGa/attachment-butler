// ================================================================
// AttachmentState.js
// 职责：运行时附件引用关系的单一数据源
// settings 已迁移至 ConfigManager，本类只管引用数据
// ================================================================

class AttachmentState {

  constructor() {
    /**
     * 附件引用关系表
     * 唯一标识：文件完整路径（兼容跨文件夹同名附件）
     * 格式：Map<附件完整路径, Set<引用它的笔记路径>>
     * @private
     */
    this._referenceMap = new Map();
  }

  /**
   * 获取某个附件的引用笔记集合
   * @param {string} attachPath
   * @returns {Set<string>}
   */
  getRefs(attachPath) {
    return this._referenceMap.get(attachPath) || new Set();
  }

  /**
   * 判断某附件是否存在于引用表中
   * @param {string} attachPath
   * @returns {boolean}
   */
  hasAttachment(attachPath) {
    return this._referenceMap.has(attachPath);
  }

  /**
   * 注册一个附件（引用集合初始化为空）
   * @param {string} attachPath
   */
  registerAttachment(attachPath) {
    if (!this._referenceMap.has(attachPath)) {
      this._referenceMap.set(attachPath, new Set());
    }
  }

  /**
   * 移除一个附件
   * @param {string} attachPath
   */
  removeAttachment(attachPath) {
    this._referenceMap.delete(attachPath);
  }

  /**
   * 重命名附件的 key
   * @param {string} oldPath
   * @param {string} newPath
   */
  renameAttachment(oldPath, newPath) {
    if (this._referenceMap.has(oldPath)) {
      const refs = this._referenceMap.get(oldPath);
      this._referenceMap.delete(oldPath);
      this._referenceMap.set(newPath, refs);
    }
  }

  /**
   * 完整替换引用关系表
   * @param {Map<string, Set<string>>} newMap
   */
  replaceReferenceMap(newMap) {
    this._referenceMap = newMap;
  }

  /**
   * 获取完整引用关系表（供遍历用）
   * @returns {Map<string, Set<string>>}
   */
  getAllAttachments() {
    return this._referenceMap;
  }
}

module.exports = { AttachmentState };