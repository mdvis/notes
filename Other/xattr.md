### macOS 命令 xattr 介绍

`xattr` 是 macOS 系统内置的命令行工具，用于显示和操作文件（包括目录和符号链接）的**扩展属性**（Extended Attributes）。扩展属性是一种任意元数据，与文件系统属性（如修改时间或文件大小）分开存储，通常是 null-terminated UTF-8 字符串或二进制数据。它常用于存储文件来源、Finder 信息或安全标记（如 Gatekeeper 隔离标记）。你可以通过 `ls -la@ filename` 在命令行查看文件的扩展属性。

`xattr` 是 "extended attributes" 的缩写，使用它可以列出、打印、写入或删除这些属性。命令成功时返回 0 退出码，失败时返回非零码并输出错误消息。

#### 语法
- **列出属性**：`xattr [-lrsvx] file ...`
- **打印指定属性的值**：`xattr -p [-lrsvx] attr_name file ...`
- **写入属性**：`xattr -w [-rsx] attr_name attr_value file ...`
- **删除指定属性**：`xattr -d [-rsv] attr_name file ...`
- **清除所有属性**：`xattr -c [-rsv] file ...`
- **显示帮助**：`xattr -h | --help`

#### 常用选项
以下是主要选项的表格总结：

| 选项 | 描述 |
|------|------|
| `-c` | 清除文件的所有扩展属性及其值。 |
| `-d` | 删除指定的属性。 |
| `-h` | 显示帮助信息。 |
| `-l` | 同时显示属性名和值（默认只显示名或值）；十六进制显示时包含偏移量和 ASCII 表示。 |
| `-p` | 打印指定属性的值。 |
| `-r` | 如果文件是目录，则递归处理目录下的所有文件。 |
| `-s` | 如果文件是符号链接，则操作链接本身，而非其指向的文件。 |
| `-v` | 强制显示文件名（即使只有一个文件）。 |
| `-w` | 写入指定的属性名和值。 |
| `-x` | 以十六进制格式显示或写入属性值。 |

#### 示例
1. **列出文件的所有扩展属性**：
   ```
   xattr -l example.txt
   ```
   输出示例：
   ```
   com.apple.quarantine:
   0171;5c3b5f5a;Safari;https://example.com/
   ```

2. **删除文件的隔离标记**（常用于移除下载文件的 Gatekeeper 隔离）：
   ```
   xattr -d com.apple.quarantine ~/Downloads/demo.app
   ```

3. **递归清除目录下所有文件的扩展属性**（例如移除应用捆绑包的安全隔离）：
   ```
   xattr -rc /path/to/directory
   ```

4. **添加“来源”元数据到文件**：
   ```
   xattr -w com.apple.metadata:kMDItemWhereFroms "https://example.com/" /path/to/file
   ```

5. **复制一个属性的值**（例如从 `/usr` 复制 FinderInfo 到 `MyDir`）：
   ```
   xattr -px com.apple.FinderInfo /usr  # 先打印源值
   xattr -wx com.apple.FinderInfo "$(xattr -px com.apple.FinderInfo /usr)" MyDir  # 写入目标
   ```

更多细节可通过 `man xattr` 在终端查看手册页。