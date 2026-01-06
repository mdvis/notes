## Taskwarrior 使用指南

Taskwarrior 是一个强大的开源命令行任务管理工具（TODO list manager），它灵活、快
速、高效，适合喜欢在终端工作的用户。它支持任务添加、优先级、截止日期、标签、项
目、依赖关系、报告、同步等功能，完全免费开源。

### 常用命令

- **添加任务**：`task add [描述] [属性...]`

  - 项目：`project:工作`
  - 优先级：`priority:H`（High）、`M`（Medium）、`L`（Low）
  - 截止日期：`due:2026-01-10` 或 `due:tomorrow`、`due:eom`（月末）
  - 标签：`+重要 +紧急`
  - 依赖：`depends:1`（依赖任务 ID 1）

- **修改任务**：`task <ID 或过滤> modify [属性...]`

  ```
  task 1 modify priority:H due:today +紧急
  ```

- **删除任务**：`task <ID> delete`

- **注解（注释）**：`task <ID> annotate "备注内容"`

- **开始/停止任务**：`task <ID> start` / `task <ID> stop`（用于计时）

- **报告**：

  - `task list`：所有待办
  - `task next`：最紧急的
  - `task completed`：已完成
  - `task projects`：显示所有项目
  - `task tags`：显示所有标签
  - `task burndown.daily`：每日燃尽图（图形化）

- **过滤**：
  ```
  task project:工作 list
  task +紧急 next
  task due.before:today overdue  # 逾期任务
  ```
## taskwarrior-tui 使用指南

taskwarrior-tui 是 Taskwarrior 的终端用户界面（TUI），用 Rust 编写，提供 Vim 风
格的导航、实时过滤、任务管理等功能，比纯命令行更直观高效。它直接调用 
Taskwarrior 的命令，所以所有 Taskwarrior 功能都可用。

### 界面概览
启动后，界面分为几个区域：
- 上部：任务报告列表（默认 next 或自定义报告）
- 下部：任务详情、注解、上下文信息
- 右侧：有时显示日历（due 日期高亮）
- 底部：状态栏、提示

支持多任务选择（用空格）、实时过滤、Tab 补全。

### 主要快捷键（Keybindings）
- **导航**：
  - `j` / `k`：向下/向上移动
  - `J` / `K`：翻页向下/向上
  - `g`：跳到顶部
  - `G`：跳到底部
  - `Ctrl+d` / `Ctrl+u`：半页翻页

- **任务操作**（选中任务后）：
  - `a`：添加新任务（输入描述，支持属性如 project:xxx +tag）
  - `m`：修改选中任务（输入 modify 参数）
  - `d`：标记为完成（done）
  - `Delete` 或 `D`：删除任务
  - `s`：启动任务（start）
  - `p`：停止任务（stop）
  - `e`：在编辑器中编辑任务（用 $EDITOR）
  - `A`：添加注解（annotate）
  - `y`：复制任务（duplicate）
  - `l`：日志新任务（log，已完成但不计入待办）

- **过滤与报告**：
  - `/`：实时过滤任务（输入过滤条件，如 project:工作）
  - `c`：切换到日历视图（Calendar，显示 due 日期）
  - `t`：切换标签视图
  - `Tab`：切换不同面板（任务列表、详情、日历等）

- **其他**：
  - `?`：显示帮助（所有快捷键）
  - `q`：退出
  - `1-9`：自定义快捷脚本（见高级配置）
  - `Esc`：取消输入或返回

多选：用空格选中多个任务，然后操作（如批量 done 或 modify）。
