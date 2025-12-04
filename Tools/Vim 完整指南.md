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
#### 基础快捷键
```vim
" 保存退出
nmap <Leader>w :w<CR>
nmap <Leader>q :q<CR>
nmap <Leader>x :x<CR>

" 窗口操作
nmap <C-h> <C-w>h
nmap <C-j> <C-w>j
nmap <C-k> <C-w>k
nmap <C-l> <C-w>l

" 缓冲区操作
nmap <Leader>bn :bnext<CR>
nmap <Leader>bp :bprevious<CR>
nmap <Leader>bd :bdelete<CR>

" 标签页操作
nmap <Leader>tn :tabnext<CR>
nmap <Leader>tp :tabprevious<CR>
nmap <Leader>tc :tabclose<CR>
```

#### 高级快捷键
```vim
" 快速移动到行首/行尾
nmap <Leader>h 0
nmap <Leader>l $

" 复制粘贴到系统剪贴板
vnoremap <Leader>y "+y
nmap <Leader>p "+p

" 删除不保存字符
nmap <Leader>x "_x

" 替换模式
nnoremap <Leader>r :%s/
vnoremap <Leader>r :s/

" 搜索
nnoremap <Leader>/ :<C-r>=expand('<cword>')<CR>
```

### 10.2 性能优化

#### 大文件处理
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

### 10.3 调试技巧

#### 调试配置
```vim
" 显示函数调用栈
map <F8> :echo expand('%:t') . ':' . line('.') . ':' . getline('.')<CR>

" 调试模式
set verbosefile=~/vim_debug.log
set verbose=15
```

### 10.4 常见问题解决

#### 编码问题
```vim
set encoding=utf-8
set fileencoding=utf-8
set fileencodings=ucs-bom,utf-8,cp936,gb18030,big5,latin1
```

#### 权限问题
```vim
" 无权限时保存
:w !sudo tee % > /dev/null
```

---

## 结语

Vim 是一个极其强大和灵活的编辑器，通过合理配置和插件选择，可以打造成接近现代 IDE 的开发环境。本文档提供了从基础到高级的全面配置指南，帮助你充分利用 Vim 的强大功能。

记住，最好的 Vim 配置是适合你自己工作习惯的配置。不要害怕尝试新的插件和配置，找到最适合你的开发工作流。

### 推荐学习资源

1. **官方文档**: `:help` 命令是最好的学习资源
2. **书籍**: 《Practical Vim》和《Vim 8 文本处理实战》
3. **网站**: vim.org, github.com 上的优秀 Vim 插件
4. **实践**: 全力使用 Vim，不断优化你的配置

---

*最后更新: 2024年12月*