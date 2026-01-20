# Sioyek 使用指南

Sioyek 是一款专为阅读学术 PDF 设计的轻量级阅读器，注重高效导航、标记和跨文档管理。下面根据官方文档整理的完整中文使用指南，涵盖主要功能和默认快捷键（所有快捷键均可通过编辑 `keys_user.config` 自定义）。

## 基本操作与配置

- **自定义快捷键**：在 `keys_user.config` 中添加格式：  
  `命令名 快捷键`  
  示例：`move_down j`（用 j 键向下移动）
- **命令列表**：按 `:` 打开可搜索的命令菜单，查看所有命令及其当前绑定。

## 打开文件

- `o`：打开文件选择菜单（`open_document`）
- `Shift + O`：打开最近文件列表（`open_prev_doc`）
- `Ctrl + O`：打开嵌入式文件浏览器（`open_document_embedded`）
- `Ctrl + Shift + O`：从当前文档所在文件夹打开嵌入式浏览器（`open_document_embedded_from_current_path`）
- 拖拽文件到窗口即可打开
- 最近文件列表中按 `Delete` 可移除条目（不删除实际文件）
- 新窗口打开：命令行加 `--new-window`，或在程序内按 `Ctrl + T`
- 切换窗口：`goto_window`

## 基本移动

- 方向键：上下左右移动画面（`move_up/down/left/right`）
- 鼠标滚轮：垂直滚动
- `gg`：跳到文档开头  
  `G`：跳到文档末尾
- 输入数字 + `gg`：跳到指定页（如 `42gg` 跳到第 42 页）
- `Home` 键：打开页码输入菜单（`goto_page_with_page_number`）
- `Space`：向下翻屏  
  `Shift + Space`：向上翻屏
- `Ctrl + PageDown/PageUp`：下一/上一页（`next_page/previous_page`）
- `t`：打开目录（Table of Contents），选中条目跳转（`goto_toc`）
- `gc`：下一章  
  `gC`：上一章（`next_chapter/prev_chapter`）
- 默认无滚动条，如需启用：执行 `toggle_scrollbar`

## 缩放

- `+` / `-`：放大/缩小（`zoom_in/out`）
- `Ctrl + 鼠标滚轮`：放大/缩小
- `F9`：页面宽度适应窗口（`fit_to_page_width`）
- `F10`：智能适应页面宽度（忽略白色边距，`fit_to_page_width_smart`）

## 历史导航

Sioyek 拥有完整的浏览器式历史，支持跨文档。

- `Backspace` 或 `Ctrl + ←`：后退（`prev_state`）
- `Shift + Backspace` 或 `Ctrl + →`：前进（`next_state`）

## 概览与智能跳转（Overview & SmartJump）

- 右键点击 PDF 链接：弹出目标位置概览窗口，可用鼠标滚轮浏览
- 即使无链接，右键点击引用文本（如 “Figure 2.19”）：自动尝试显示对应内容概览（适用于图、表、公式、参考文献等）
- 中键点击：直接跳转到目标位置

## 视觉标记（Visual Mark）

右键点击文本行会在该行下方显示视觉高亮标记。

- 用途：
  - 快速返回上次阅读位置：按 `` ` `` 两次或右键
  - 减少眼睛疲劳，标记当前阅读行
- `j` / `k`：向下/上移动视觉标记（`move_visual_mark_down/up`）
- `F7`：切换视觉滚动模式，鼠标滚轮移动标记（`toggle_visual_scroll`）
- `ruler_mode` 配置：
  - `0`：仅在行下划线
  - `1`：整行矩形高亮
- 高亮行时：
  - `l`：显示当前行引用的概览（`overview_definition`）
  - `]`：创建门户到引用  
    `Ctrl + ]`：直接跳转到引用

## 搜索

- `/` 或 `Ctrl + F`：打开搜索栏（`search`）
- `n` / `N`：下一个/上一个匹配（`next_item/previous_item`）
- `c/`：仅搜索当前章节（`chapter_search`）
- 限定页范围：`<起始页,结束页>搜索词`（如 `<20,30>Figure`）
- `overview_next_item` / `overview_prev_item`：以概览形式查看搜索结果

## 标记（Marks）

用于临时标记位置，快速返回。

- 创建：`m` + 字母（如 `ma` 创建标记 a，`set_mark`）
- 跳转：`` ` `` + 字母（如 `` `a``，`goto_mark`）
- 小写标记：文档本地  
  大写标记：全局跨文档
- 标记持久保存

## 书签（Bookmarks）

带文字描述的标记。

- `b`：添加书签，输入描述（`add_bookmark`）
- `gb`：当前文档书签列表（`goto_bookmark`）
- `gB`：所有文档书签列表（`goto_bookmark_g`）
- `db`：删除最近书签（`delete_bookmark`）

## 高亮（Highlights）

- 选中文字后 `h` + 字母：创建对应类型高亮（不同字母不同颜色，`add_highlight`）
- 或使用当前高亮类型直接高亮：`add_highlight_with_current_type`
- 切换高亮类型：`set_select_highlight_type`
- 持续高亮模式：`toggle_select_highlight`
- `gh`：当前文档高亮列表  
  `gH`：所有文档高亮列表
- 导航：`goto_next/prev_highlight`（全部）或 `goto_next/prev_highlight_of_type`（指定类型）
- 删除：点击高亮后 `dh` 或在列表中 Delete

## 门户（Portals）

用于在主窗口阅读正文时，辅助窗口自动显示相关内容（如图表、定义）。

- 创建：`p` 在源位置 → 导航到目标位置再按 `p`（`portal`）
- 快捷创建：`p` 后点击 PDF 链接，或 `p` 后中键（使用 SmartJump）
- 查看：`F12` 打开/关闭辅助窗口（`toggle_window_configuration`），自动显示最近门户的目标
- 删除最近门户：`dp`（`delete_portal`）
- 跳转到最近门户目标：`goto_portal`
- 编辑门户目标：`Shift + P`（`edit_portal`），调整后用历史返回

## 命令菜单

- `:`：打开可搜索命令菜单（`command`）

## 外部搜索

- 选中文字后 `ss` / `sl`（或 `s` + a-z 字母）：在配置的搜索引擎中搜索
- 中键或 Shift+中键点击论文/书籍名称：自动猜测标题并搜索
- 配置：`prefs_user.config` 中的 `search_url_*` 和 `middle_click_search_engine` 等

## Synctex 支持

- `F4`：切换 Synctex 模式（`toggle_synctex`）
- 模式下右键点击文本：打开对应 TeX 源码位置
- 需要配置 `inverse_search_command`

## 数据与同步

- 数据存储在 `local.db`（本地）和 `shared.db`（可共享）
- 设置 `shared_database_path` 指向云同步目录（如 Dropbox）即可跨设备同步标记、书签、门户等
- 导出/导入：使用 `export` / `import` 命令（JSON 格式）

## 窗口配置

- `F12`：切换全屏/辅助窗口配置（`toggle_window_configuration`）
- 保存当前窗口尺寸配置：`copy_window_size_config`

## 其他功能

- 复制文字：选中后 `Ctrl + C`（`copy`）
- 键盘打开 PDF 链接：`f` 后输入链接旁数字（`open_link`）
- `F8`：切换暗色模式（`toggle_dark_mode`）
- `F5`：切换演示模式（`toggle_presentation_mode`）
- 防止水平滚动：`toggle_horizontal_scroll_lock`
- 自定义颜色：`toggle_custom_color`
- 执行壳命令：`execute`（支持 %1/%2/%3 占位符）
- 预定义命令：`execute_predefined_command`
- 嵌入注释到 PDF：`embed_annotations`
- 旋转页面：`rotate_clockwise/counterclockwise`

这份指南涵盖了 Sioyek 的核心功能，建议结合实际使用逐步熟悉快捷键，以获得最高效率的学术阅读体验。