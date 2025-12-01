# Tmux 完全指南

Tmux 是一个终端复用器，允许你在单个终端窗口中创建和管理多个终端会话。

## 基本命令

### 启动新会话
```bash
tmux [new -s 会话名 -n 窗口名]
tmux new -s mysession -n mywindow
```

### 恢复会话
```bash
tmux at [-t 会话名]
tmux attach -t mysession
```

### 列出所有会话
```bash
tmux ls
tmux list-sessions
```

### 关闭会话
```bash
tmux kill-session -t 会话名
```

### 关闭所有会话
```bash
tmux ls | grep : | cut -d. -f1 | awk '{print substr($1, 0, length($1)-1)}' | xargs kill
```

## 配置文件 (.tmux.conf)

### 基本配置选项
```bash
# 鼠标支持 - 设置为 on 来启用鼠标(与 2.1 之前的版本有区别，请自行查阅 man page)
set -g mouse on

# 设置默认终端模式为 256color
set -g default-terminal "screen-256color"

# 启用活动警告
setw -g monitor-activity on
set -g visual-activity on

# 居中窗口列表
set -g status-justify centre

# 设置前缀
set -g prefix C-z

# 窗口编号从 1 开始计数
set -g base-index 1

# PREFIX-Q 显示编号的驻留时长，单位 ms
set -g display-panes-time 10000

# 窗格编号从 1 开始计数
set -g pane-base-index 1

# 关掉某个窗口后，编号重排
set -g renumber-windows on

# 禁止活动进程修改窗口名
setw -g allow-rename off

# 禁止自动命名新窗口
setw -g automatic-rename off

# 进入复制模式的时候使用 vi 键位（默认是 EMACS）
setw -g mode-keys vi
```

### 窗格最大化/恢复
```bash
# 最大化/恢复窗格
unbind Up
bind Up new-window -d -n tmp \; swap-pane -s tmp.1 \; select-window -t tmp

unbind Down
bind Down last-window \; swap-pane -s tmp.1 \; kill-window -t tmp
```

## 插件管理

### 安装 TPM (Tmux Plugin Manager)
```bash
git clone https://github.com/tmux-plugins/tpm ~/.tmux/plugins/tpm
setenv -g TMUX_PLUGIN_MANAGER_PATH '~/.tmux/plugins'
~/.tmux/plugins/tpm/bin/install_plugins
```

### 推荐的插件
```bash
set -g @plugin 'seebi/tmux-colors-solarized'
set -g @plugin 'tmux-plugins/tmux-pain-control'
set -g @plugin 'tmux-plugins/tmux-prefix-highlight'
set -g @plugin 'tmux-plugins/tmux-resurrect'
set -g @plugin 'tmux-plugins/tmux-sensible'
set -g @plugin 'tmux-plugins/tmux-yank'
set -g @plugin 'tmux-plugins/tpm'
```

## 操作指南 (Prefix + 键)

默认前缀是 `Ctrl+b`，在配置中我们改为了 `Ctrl+z`

### 会话管理
```
:new        启动新会话
s           列出所有会话
$           重命名当前会话
d           退出 tmux（tmux 仍在后台运行）
D           暂离 Session
(           上一个 Session
)           下一个 Session
L           最后使用 Session
```

### 窗口管理 (标签页)
```
c           创建新窗口
w           列出所有窗口
n           后一个窗口
p           前一个窗口
f           查找窗口
,           重命名当前窗口
&           关闭当前窗口
.           设置窗口编号
i           窗口信息
'           输入索引切换窗口
```

### 调整窗口排序
```
:swap-window -s 3 -t 1    交换 3 号和 1 号窗口
:swap-window -t 1          交换当前和 1 号窗口
:move-window -t 1          移动当前窗口到 1 号
```

### 窗格操作（分割窗口）
```
%           垂直分割
"           水平分割
o           交换窗格
x           关闭窗格
空格         切换布局
q           显示每个窗格是第几个，当数字出现的时候按数字几就选中第几个窗格
{           与上一个窗格交换位置
}           与下一个窗格交换位置
z           切换窗格最大化/最小化
;           切换到上次激活的面板
!           将当前窗格移动到新窗口
```

### 调整窗格尺寸
```
PREFIX : resize-pane -D          当前窗格向下扩大 1 格
PREFIX : resize-pane -U          当前窗格向上扩大 1 格
PREFIX : resize-pane -L          当前窗格向左扩大 1 格
PREFIX : resize-pane -R          当前窗格向右扩大 1 格
PREFIX : resize-pane -D 20       当前窗格向下扩大 20 格
PREFIX : resize-pane -t 2 -L 20  编号为 2 的窗格向左扩大 20 格
```

快捷键调整：
- `PREFIX + Ctrl + arrow`     每次调整 1 个单位
- `PREFIX + Alt + arrow`      每次调整 5 个单位

### 同步窗格
这么做可以切换到想要的窗口，输入 Tmux 前缀和一个冒号呼出命令提示行，然后输入：
```
:setw synchronize-panes
```
你可以指定开或关，否则重复执行命令会在两者间切换。 这个选项值针对某个窗口有效，不会影响别的会话和窗口。

## 文本复制模式

### 基本操作
按下 `PREFIX-[` 进入文本复制模式。可以使用方向键在屏幕中移动光标。

### 启用 Vi 模式
在 `.tmux.conf` 中添加：
```bash
setw -g mode-keys vi
```

### Vi 模式快捷键对照表
```
vi             emacs        功能
^              M-m          反缩进
Escape         C-g          清除选定内容
Enter          M-w          复制选定内容
j              Down         光标下移
h              Left         光标左移
l              Right        光标右移
L                           光标移到尾行
M              M-r          光标移到中间行
H              M-R          光标移到首行
k              Up           光标上移
d              C-u          删除整行
D              C-k          删除到行末
$              C-e          移到行尾
:              g            前往指定行
C-d            M-Down       向下滚动半屏
C-u            M-Up         向上滚动半屏
C-f            Page down    下一页
w              M-f          下一个词
p              C-y          粘贴
C-b            Page up      上一页
b              M-b          上一个词
q              Escape       退出
C-Down or J    C-Down       向下翻
C-Up or K      C-Up         向下翻
n              n            继续搜索
?              C-r          向前搜索
/              C-s          向后搜索
0              C-a          移到行首
Space          C-Space      开始选中
               C-t          字符调序
```

### 复制粘贴流程
1. 按 `PREFIX-[` 进入复制模式
2. 使用 vi 键位移动光标到开始位置
3. 按 `Space` 开始选择
4. 移动光标选择文本
5. 按 `Enter` 复制选中的文本
6. 按 `PREFIX-]` 粘贴文本

## 高级功能

### 杂项快捷键
```
t           窗口中央显示一个数字时钟
?           列出所有快捷键
:           命令提示符
r           强制重绘屏幕
m           设置标记
~           显示消息
```

### 窗格移动和重组
```
:move-pane -t <session>:<window>    移动窗格到指定会话的窗口
:join-pane -t <win_name>            移动窗格到指定窗口
<Prefix - o>                        依次切换下个窗格
<Prefix - 方向键>                   按方向选择窗格
<Prefix - Space>                    重新排列布局
<Prefix - {>                        向前置换当前面板
<Prefix - }>                        向后置换当前面板
<Prefix - Alt-o>                    逆时针旋转当前窗口的面板
<Prefix - Ctrl-o>                   顺时针旋转当前窗口的面板
```

### 命令行操作
```bash
# 创建指定名称的会话和窗口
tmux new -s <session_name> -n <window_name>

# 重命名会话
tmux rename-session -t <old_name> <new_name>

# 杀死所有会话除当前外
tmux kill-session -a

# 列出所有窗格
tmux list-panes

# 发送命令到指定窗格
tmux send-keys -t <session>:<window>.<pane> "command" C-m
```

## 使用技巧

1. **会话持久化**：使用 tmux-resurrect 插件可以保存和恢复会话状态
2. **多服务器管理**：为不同项目创建不同的会话
3. **团队协作**：多个用户可以 attach 到同一个会话进行协作
4. **远程开发**：在 SSH 连接中使用 tmux，网络断开后可以重新连接恢复工作环境

## 常见问题解决

1. **鼠标不工作**：确保配置中有 `set -g mouse on`
2. **颜色显示异常**：设置 `set -g default-terminal "screen-256color"`
3. **复制模式不响应**：检查是否正确设置了 `mode-keys`
4. **插件不生效**：确保安装了 TPM 并在配置中正确引用了插件

---

*本指南整合了 Tmux 的配置、操作和命令，为日常使用提供完整的参考。*