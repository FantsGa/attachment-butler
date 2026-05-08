# Attachment Butler | 附件管家

[![Obsidian](https://img.shields.io/badge/Obsidian-1.0.0+-purple?logo=obsidian)](https://obsidian.md)

[![GitHub release](https://img.shields.io/github/v/release/FantsGa/attachment-butler?color=green)](https://github.com/FantsGa/attachment-butler/releases)

> **高效管理 Obsidian 附件，告别文件混乱与引用追踪难题**  
> Efficiently manage Obsidian attachments, say goodbye to file clutter and reference tracking issues.

---

## ✨ 核心功能 / Core Features

### 🔴 未引用附件标识 / Unreferenced Attachment Indicator

自动标记未被任何笔记引用的附件，红色圆点一目了然，轻松识别并清理冗余文件。

Automatically marks attachments not referenced by any note with a red dot, helping you quickly identify and clean up redundant files.

### 📍 快速定位笔记 / Quick Note Locator

右键附件一键跳转到引用该附件的所有笔记，轻松追踪附件来源，不再迷失在文件海洋中。

Right-click an attachment to instantly jump to all notes that reference it, making source tracking effortless.

### 🏷️ 附件笔记名前缀 / Note Name Prefix

被引用的附件名称前端显示笔记名前缀，鼠标悬停可查看全部引用来源，附件归属一目了然。

Referenced attachments display the note name as a prefix. Hover to see all referencing notes, clarifying attachment ownership at a glance.

---

## 📥 安装方式 / Installation

### 方式1：从社区插件库安装（审核中）/ Method 1: Community Plugins (Under review)

1. 打开 Obsidian **设置** → **第三方插件** → **关闭安全模式**  
   Open Obsidian **Settings** → **Community plugins** → **Turn off safe mode**

2. 点击"**浏览**"社区插件  
   Click "**Browse**" community plugins

3. 搜索 `Attachment Butler`  
   Search for `Attachment Butler`

4. 点击"**安装**"并启用
   Click **"Install"** and enable

### 方式2：手动安装 / Method 2: Manual Installation

1. 从 [GitHub Release](https://github.com/FantsGa/attachment-butler/releases) 下载最新版的 3 个文件  
   Download the latest 3 files from [GitHub Release](https://github.com/FantsGa/attachment-butler/releases)

2. 打开你的 Vault 文件夹，进入 `.obsidian/plugins/`  
   Open your Vault folder → `.obsidian/plugins/`

3. 新建文件夹 `attachment-butler`，将 3 个文件放入  
   Create a folder named `attachment-butler` and place the 3 files inside

4. 在 Obsidian 设置中刷新插件列表并启用  
   Refresh plugin list in Obsidian Settings and enable

---

## 🚀 使用指南 / Usage

### 查看未引用附件 / View Unreferenced Attachments

在文件浏览器中，未引用附件左侧显示**红色圆点**，快速识别可清理的文件。

Unreferenced attachments show a **red dot** in the file explorer for quick identification.

<img width="551" height="831" alt="image" src="https://github.com/user-attachments/assets/14a896f0-7b37-4408-ad33-47f9e604ac11" />


### 定位到笔记 / Locate to Note

1. 右键点击附件  
   Right-click an attachment

2. 选择 **`定位到笔记`**  
   Select **`Locate to Note`**

3. 在二级菜单中点击目标笔记即可跳转  
   Click the target note in the submenu to jump

   <img width="900" height="1113" alt="image" src="https://github.com/user-attachments/assets/0efbd50a-1854-4d57-85a1-5a30a82e5d42" />
<img width="1614" height="1248" alt="image" src="https://github.com/user-attachments/assets/49156893-73f5-4c4a-b7a9-bdbffa6e71f9" />


### 查看引用来源 / View Reference Sources

悬停在附件名称上，查看**笔记名前缀**，了解该附件被哪些笔记引用。

Hover over the attachment name to see the **note name prefix** and understand which notes reference it.

<img width="561" height="900" alt="image" src="https://github.com/user-attachments/assets/cfec2a8c-335a-4a23-bb17-0a955adb74c1" />


---

## ⚙️ 配置说明 / Configuration

插件跟随 Obsidian 原生设置，无需额外配置。附件存放路径遵循 Obsidian 默认规则：

The plugin follows Obsidian's native settings with no additional configuration required. Attachment storage paths follow Obsidian's default rules:

- **附件存放位置**：由 Obsidian 的"文件与链接"设置决定  
  **Attachment location**: Determined by Obsidian's "Files & Links" settings
  
---

## 📋 技术信息 / Technical Info

| 项目 / Item                             | 详情 / Details                                                                                                                         |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **最低 Obsidian 版本**<br>Min App Version | `1.0.0+`                                                                                                                             |
| **支持平台**<br>Platforms                 | ✅ Windows（已验证）<br>🔜 macOS, Linux, Mobile（理论兼容，欢迎测试）<br><br>✅ Windows (Tested)<br>🔜 macOS, Linux, Mobile (Theoretically compatible) |
| **开源协议**<br>License                   | [MIT](LICENSE.md)                                                                                                                       |
| **作者**<br>Author                      | 加点幻想就有了@FantsGa                                                                                                                      |
| **仓库**<br>Repository                  | [GitHub](https://github.com/FantsGa/attachment-butler)                                                                               |

---

## 🐛 已知问题 / Known Issues

- 首次安装后可能需要重启 Obsidian 才能正常显示红点标识  
  May require Obsidian restart after first installation to display red dots

- 大量附件时（1000+）引用检测可能有轻微延迟  
  Slight delay possible with large attachment libraries (1000+)

---

## 🤝 贡献 / Contributing

欢迎通过以下方式参与改进：

Contributions are welcome in the following ways:

- 🐞 **提交 Issue**：反馈 Bug 或提出新功能建议  
  **Submit Issues**: Report bugs or suggest new features

- 🔧 **Pull Request**：贡献代码修复或改进  
  **Pull Requests**: Contribute code fixes or improvements

- 📝 **翻译**：帮助完善多语言支持  
  **Translations**: Help improve multilingual support

- ⭐ **Star & Share**：给个 Star 或分享给朋友  
  **Star & Share**: Give a star or share with friends

---

## 📄 许可证 / License

本项目遵循 MIT 开源协议。详见 [LICENSE](LICENSE.md) 文件。

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.

---

## 💬 反馈与支持 / Feedback & Support

- 📧 **问题反馈**：[GitHub Issues](https://github.com/FantsGa/attachment-butler/issues)  
  **Report Issues**: [GitHub Issues](https://github.com/FantsGa/attachment-butler/issues)

- 🌟 **如果喜欢这个插件，请考虑给个 Star！**  
  **If you like this plugin, please give it a Star!**

---

<div align="center">

Made with ❤️ for Obsidian Community  
[Obsidian](https://obsidian.md) · [GitHub](https://github.com/FantsGa/attachment-butler)

</div>
