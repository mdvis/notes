## Vim 基础
#### 启动选项
```vim
vim -p filename1 filename2     # 以标签页方式打开多个文件
vim -p *                       # 编辑当前目录所有文件
vim -r                         # 恢复会话
vim -o                         # 水平分割窗口打开文件
vim -O                         # 垂直分割窗口打开文件
vim +[num] filename            # 定位到指定行
vim +/[pat] filename           # 定位到第一个匹配模式
vim -u NONE -N                 # 以无配置、无插件模式启动
vim -c "命令" file              # 执行命令后打开文件
gvim -c 'normal ggdG"*p' file  # 从系统剪贴板粘贴内容
mvim --servername VIM3 --remote-tab foobar.txt  # 在MacVim中远程打开标签页
```
#### 保存与退出
```vim
ZZ 或 :x          # 保存并退出当前窗口（未修改文件不保存）
ZQ 或 :q!         # 不保存直接退出
:wa               # 保存所有缓冲区
:wn               # 保存当前缓冲区并切换到下一个
:qa               # 退出所有缓冲区
:cq {N}           # 以错误码退出（用于脚本调用）
:xa               # 保存并退出所有缓冲区（未修改文件不保存）
:sav path/to.txt   # 另存为
:w !sudo tee %    # 以sudo保存只读文件
:e!               # 强制重载当前文件（丢弃未保存内容）
```
#### 配置路径
```vim
~/.vim/colors/       # 配色方案
~/.vim/plugin/       # 插件目录
~/.vim/ftdetect/     # 文件类型检测
~/.vim/ftplugin/     # 文件类型插件
~/.vim/autoload/     # 按需加载
```
#### 配置立即生效
```vim
" 让配置变更立即生效
autocmd BufWritePost $MYVIMRC source $MYVIMRC
```
#### 模式介绍

| 模式           | 描述           | 进入方式                              |
| ------------ | ------------ | --------------------------------- |
| Normal       | 默认普通模式       | 启动时 / `<Esc>`                     |
| Visual       | 可视选择（字符/行/块） | `v` (字符) / `V` (行) / `Ctrl-v` (块) |
| Insert       | 插入编辑         | `i` / `a` / `o` 等                 |
| Select       | 鼠标选择（替换式）    | `gh`                              |
| Command-line | 命令行输入        | `:`                               |
| Ex           | Ex模式（多行命令）   | `Q` (仅Vim支持)                      |
## 折叠快捷键
| 快捷键     | 描述        |
| ------- | --------- |
| `za`    | 开/关当前折叠   |
| `zc`    | 关闭当前      |
| `zo`    | 打开当前      |
| `zm/zM` | 关闭所有/嵌套   |
| `zr/zR` | 打开所有/嵌套   |
| `zd/zE` | 删除当前/所有   |
| `zj/zk` | 下一个/上一个折叠 |
| `zn/zN` | 禁用/启用折叠   |
## Vim 脚本编程
#### 数据类型
```vim
" 基本类型
let str = "string"
let num = 42
let flag = v:true
let list = [1, 2, 3]
let dict = {'key': 'value'}
```
#### 函数定义
```vim
function! MyFunction(arg)
    echo a:arg
    return 42
endfunction
```
#### 自动命令
```vim
augroup MyGroup
    autocmd!
    autocmd BufWritePre * :%s/\s\+$//e
augroup END
```
#### 按键映射
```vim
nmap <Leader>w :w<CR>
imap jk <Esc>
vmap <C-c> "+y
```
### 高级功能
#### 寄存器系统
```vim
""     # 无名寄存器
"0     # 复制寄存器
"a-"z  # 命名寄存器
"*     # 系统剪贴板
"_     # 黑洞寄存器
```
#### 标记系统
```vim
ma     # 设置标记a
'a     # 跳转到标记a
:marks # 显示所有标记
```
#### 折叠功能
```vim
zc     # 关闭折叠
zo     # 打开折叠
za     # 切换折叠
zm     # 增加折叠级别
zr     # 减少折叠级别
```
## 实用技巧
### 大文件处理
```vim
" 禁用某些功能以提高大文件处理性能
autocmd BufReadPre *.log set nowrap
autocmd BufReadPre *.log set nocursorline
autocmd BufReadPre *.log set nocursorcolumn
autocmd BufReadPre *.log syntax off
autocmd BufReadPre *.log set norelativenumber
autocmd BufReadPre *.log set noundofile
autocmd BufReadPre *.log set noswapfile
autocmd BufReadPre *.log set nobackup
```
### 权限问题
```vim
" 无权限时保存
:w !sudo tee % > /dev/null
```

## expand
核心作用是：将包含特殊通配符（如 %, #, ~）的字符串扩展为具体的路径、文件名或环境变量。
### 核心语法
`expand({expr} [, {nosuf} [, {list}]])`
- {expr}: 想要扩展的字符串（如 "%" 代表当前文件）。
- {nosuf}: 可选。如果为真，忽略 ‘suffixes’ 设置。
- {list}: 可选。如果为真，返回一个列表（用于匹配多个文件时）。
### 最常用的修饰符
expand() 最强大的地方在于可以配合修饰符（Modifiers） 来提取路径的具体部分。
假设当前编辑的文件全路径为：`/home/user/project/src/main.py`
- `expand("%")` `src/main.py` 当前文件（相对路径）
- `expand("%:p")` `/home/user/project/src/main.py` 完整绝对路径
- `expand("%:t")` `main.py` 文件名 (Tail)
- `expand("%:r")` `src/main` 移除后缀 (Root)
- `expand("%:e")` `py` 仅扩展名 (Extension)
- `expand("%:h")` `src` 所在目录 (Head)
- e`xpand("%:p:h")` `/home/user/project/src` 绝对路径的目录
### 常见使用场景
#### 获取特殊路径
除了当前文件 %，还可以获取其他系统信息：
- `expand("~")`: 用户主目录（如 /home/user）。
- `expand("$HOME")`: 扩展环境变量。
- `expand("#")`: 扩展为交替文件（上一个编辑的文件）。
- `expand("<cword>")`: 扩展为光标下的单词（常用于自定义搜索快捷键）。
- `expand("<cfile>")`: 扩展为光标下的文件名路径。
#### 在脚本中动态生成路径
如果你想在 .vimrc 中根据当前打开的文件创建一个备份或编译后的文件：
```
" Python
nnoremap <F5> :exe "!python3 ".expand("%:p")<CR>
```
#### 获取多个文件 (Wildcards)
如果你想获取当前目录下所有的 .txt 文件：
```
let files = expand("*.txt", 0, 1) "['a.txt', 'b.txt']
```
#### 避坑指南：expand 与命令行 ! 的区别
在 Vim 命令行模式`:`下，`%` 会被 shell 自动识别。但如果你是在写 Vim 脚本逻辑，必须显式调用 expand()。
```
"错误示例（在脚本中）
let my_file = % "(报错：Vim 不认识单独的 %)

"正确示例
let my_file = expand("%")
```
#### 进阶技巧：组合使用
修饰符可以链式叠加，例如：`expand("%:p:h:t")`
- `:p` 变成绝对路径。
- `:h` 取目录部分。
- `:t` 取该目录的名字。 结果：当前文件所属的文件夹名称。