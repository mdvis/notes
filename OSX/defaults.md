### macOS 命令 `defaults` 介绍

`defaults` 是 macOS 系统内置的命令行工具，用于管理和操作用户默认设置（User Defaults）。这些设置通常以属性列表（.plist 文件）的形式存储在 `~/Library/Preferences/` 目录下，主要用于记录应用程序的偏好配置、系统选项等。它允许用户通过终端（Terminal）快速读取、写入或删除这些设置，而无需手动编辑 plist 文件。 该命令源于 1998 年的 OPENSTEP 系统，并在 macOS 中得到广泛使用。

#### 主要用途
- **读取设置**：查看应用程序或系统的当前配置值。
- **写入设置**：修改偏好，例如调整 Dock 的显示方式或 Finder 的行为。
- **删除设置**：重置特定键值对。
- **自动化配置**：常用于脚本中批量设置 macOS 环境，例如在新机上快速应用个性化选项。

它特别适用于开发者、系统管理员或高级用户，因为它比图形界面更精确和高效。

#### 基本语法
`defaults` 命令的基本格式为：
```
defaults [子命令] [域] [键] [值]
```
- **域（Domain）**：通常是应用程序的 Bundle ID（如 `com.apple.dock` 表示 Dock），或 `NSGlobalDomain` 表示全局系统设置。
- **键（Key）**：具体设置项的名称。
- **值（Value）**：要写入的数据，支持字符串、数字、布尔值、数组等类型。

以下是常用子命令的表格总结：

| 子命令     | 描述                  | 示例命令                          | 示例说明 |
|------------|-----------------------|-----------------------------------|----------|
| `read`    | 读取域下的所有键值，或指定键 | `defaults read com.apple.dock` <br> `defaults read com.apple.dock orientation` | 读取 Dock 的所有设置 <br> 读取 Dock 的方向设置 |
| `write`   | 写入键值对            | `defaults write com.apple.dock orientation -string "left"` | 将 Dock 放置在左侧 |
| `delete`  | 删除指定键            | `defaults delete com.apple.dock orientation` | 删除 Dock 方向设置 |
| `domains` | 列出所有可用域        | `defaults domains`                | 显示所有偏好域 |

#### 实用示例
1. **显示隐藏文件**（全局设置）：
   ```
   defaults write com.apple.finder AppleShowAllFiles -bool true
   killall Finder
   ```
   这会让 Finder 显示所有文件（包括 . 开头的隐藏文件），然后重启 Finder 生效。

2. **读取 Safari 的默认主页**：
   ```
   defaults read com.apple.Safari HomePage
   ```

3. **重置所有设置**（谨慎使用）：
   ```
   defaults delete -g  # 删除全局设置
   ```

#### 注意事项
- **权限**：大多数操作无需 sudo，但系统级设置可能需要管理员权限。
- **生效**：写入后，通常需重启相关应用（如用 `killall` 命令）才能生效。
- **备份**：修改前建议备份 plist 文件，以防出错。
- **类型匹配**：值类型需正确（如 `-bool true` 用于布尔值，`-string "text"` 用于字符串），否则命令会失败。
- **更多资源**：Apple 官方文档或 man 页（在终端输入 `man defaults`）提供完整细节。

如果您有特定设置想修改或更多示例需求，请提供细节，我可以进一步说明！