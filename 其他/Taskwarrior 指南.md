**Taskwarrior** 是一个功能强大、完全命令行的开源任务管理工具，适合喜欢终端操作、需要高度自定义的用户。下面是从官方 man page（task.1）提炼出的**核心实用使用方法**总结，聚焦最常用、最核心的操作方式。

### 1. 基本任务操作（最常用）

| 操作          | 命令示例                                      | 说明                              |
|---------------|-----------------------------------------------|-----------------------------------|
| 添加任务      | `task add 买牛奶 due:tomorrow project:家 +购物` | 最基本用法，支持直接加属性         |
| 添加已完成    | `task log 整理旧手机`                         | 直接记录已经完成的事情            |
| 查看任务      | `task list` 或 `task`                         | 默认显示 pending 任务（最常用）   |
| 详细查看      | `task long` / `task next` / `task ready`      | 更详细信息 / 下一个最紧急 / 可立即行动 |
| 查看逾期      | `task overdue`                                | 非常实用                          |
| 查看单个任务  | `task 42` 或 `task 42 info`                   | 显示 ID=42 的详细信息             |
| 完成任务      | `task 3 done` / `task project:家 done`        | 可批量                            |
| 删除任务      | `task 5 delete`                               | 软删除，可 undo                   |
| 永久删除      | `task 5 purge`                                | 已 delete 的任务彻底清除          |
| 撤销上一步    | `task undo`                                   | 后悔药，非常好用                  |

### 2. 过滤器写法（核心技能，必须掌握）

过滤器几乎所有命令都支持，写在命令前面。

常用过滤写法示例：

```bash
# 项目 + 标签组合
task project:工作 +urgent list
task project:学习 -考试 list

# 日期相关（非常常用）
task due:today list           # 今天到期
task due.before:today list    # 已逾期（等价于 overdue）
task due.after:eow list       # 下周之后到期
task wait:tomorrow list       # 明天才可见的任务

# 优先级
task priority:H list          # 高优先级
task priority.not:L list      # 非低优先级

# 状态
task +OVERDUE list
task +WAITING list
task +BLOCKED list

# 逻辑组合（括号很重要）
task '(project:工作 or project:个人) +review due.before:eom' list
task 'priority:H or +urgent' ready

# ID 范围
task 12-18 done               # 完成 12 到 18 号任务
```

### 3. 常用修改操作（modify 是最强命令）

```bash
# 修改属性（最常用）
task 7 modify due:friday priority:M project:家
task 1-4 modify +review       # 批量加标签

# 追加/前置描述
task 23 append "（记得带发票）"
task 23 prepend "【紧急】"

# 替换描述文字
task 15 modify /旧手机/新手机/g     # 全局替换

# 添加注释
task 8 annotate "老板说可以延期到下周三"

# 开始/停止计时
task 19 start
task 19 stop

# 设置等待（隐藏到指定日期）
task 41 wait:someday
task 41 wait:eom

# 设置依赖（阻塞关系）
task 55 modify depends:52,53
task 55 modify depends:     # 清除依赖
```

### 4. 递归任务（Recurring）

```bash
task add "周会" recur:weekly due:friday
task add "备份代码" recur:monthly due:eom
task add "体检" recur:yearly due:apr-15
```

### 5. 上下文（Context）——极大提高效率

```bash
# 定义上下文
task context define home   project:家
task context define work   project:工作 +office
task context define review '( +review or +weekly )'

# 切换 / 查看 / 清除
task context home
task context list
task context show
task context none
```

上下文会自动附加到 `add`、`list`、`modify` 等命令，非常适合按场景切换。

### 6. 报告与统计（最常用的几个）

```bash
task next           # 下一个最该做的事（按 urgency 排序）
task calendar       # 月历视图（看哪些天有到期）
task projects       # 项目列表 + 任务数
task tags           # 所有标签统计
task summary        # 按项目汇总
task stats          # 整体数据统计
task burndown.weekly   # 周燃尽图（ASCII）
task history.monthly   # 每月任务历史
```

### 7. 快速上手推荐命令组合（日常最常用 Top 10）

1. `task add ...`  
2. `task list` / `task`  
3. `task next`  
4. `task <id> done`  
5. `task <filter> modify ...`  
6. `task overdue`  
7. `task due:today`  
8. `task context <name>`  
9. `task projects` / `task tags`  
10. `task undo`

### 8. 同步（Sync）简单说明

```bash
task sync    # 与 Taskserver 同步（需先配置证书和 taskd 服务器）
```

多设备同步时，通常一台机器开启 recurrence，另一台关闭，避免重复生成任务。

掌握以上内容，80% 的日常任务管理已经足够。  
建议把最常用的过滤器和上下文写进 `~/.taskrc` 或做成 shell alias，进一步提效。

需要更详细的某个部分（如自定义报告、UDA、颜色主题、Hook 脚本等）可以继续问！