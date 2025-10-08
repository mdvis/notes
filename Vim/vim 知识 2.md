我将这些 Vim 相关知识进行分类合并，形成一个更加结构化的知识体系：

# Vim 知识体系分类整理

## 1. 基础操作与配置

### 1.1 启动与退出
```vim
" 启动命令
vim -p filename1 filename2    " tab方式打开多个文件
vim -u NONE -N               " 不加载任何插件启动
vim +[num]                   " 定位到第num行
vim +/[pat]                  " 定位到第一个匹配pat的位置

" 保存退出命令
ZZ          " 保存退出当前窗口
ZQ          " 不保存退出
:x          " 保存退出（未修改不写入）
:xa         " 保存退出所有缓冲区
:cq {N}     " 带错误码退出（用于git等调用）
```

### 1.2 配置系统
```vim
" 配置路径
~/.vim/colors/       " 配色方案
~/.vim/plugin/       " 插件目录
~/.vim/ftdetect/     " 文件类型检测
~/.vim/ftplugin/     " 文件类型插件
~/.vim/autoload/     " 按需加载

" runtimepath
echo &rtp            " 查看运行时路径
:runtime syntax/c.vim " 加载语法文件
```

### 1.3 编码设置
```vim
set encoding=utf-8          " Vim内部编码
set fileencoding=utf-8      " 文件编码
set fileencodings=ucs-bom,utf-8,cp936,gb18030,big5,latin1  " 自动识别编码
```

## 2. 编辑操作

### 2.1 移动光标
```vim
" 基本移动
hjkl                    " 方向键
gj/gk                  " 屏幕行移动
H/M/L                  " 页顶/中/底
zt/zz/zb              " 当前行置顶/中/底

" 单词移动
w/W                   " 下一个单词/WORD
b/B                   " 上一个单词/WORD
e/E                   " 词尾/WORD尾
ge/gE                 " 上一个词尾/WORD尾

" 跳转
gg/G                  " 文件首/尾
gd/gD                 " 局部/全局定义
gf                    " 打开光标下文件
<C-o>/<C-i>           " 跳转历史
```

### 2.2 文本操作
```vim
" 复制粘贴
yy/Y                  " 复制行
y{motion}             " 复制区域
p/P                   " 粘贴后/前
gp/gP                 " 粘贴并移动光标到文本结尾

" 删除
dd/D                  " 删除行/到行尾
d{motion}             " 删除区域
x/X                   " 删除字符/前字符
```

### 2.3 查找替换
```vim
" 查找
/pattern              " 向前查找
?pattern              " 向后查找
*                     " 向下查找当前单词
#                     " 向上查找当前单词
n/N                   " 下一个/上一个匹配

" 替换
:s/old/new/g          " 当前行替换
:%s/old/new/g         " 全文替换
:'<,'>s/old/new/g     " 选中区域替换
```

## 3. 正则表达式

### 3.1 模式设置
```vim
\v    " very magic模式（推荐）
\V    " very nomagic模式（原义）
\m    " magic模式（默认）
\M    " nomagic模式
```

### 3.2 常用元字符
```vim
.       " 任意字符
*       " 0次或多次
\+      " 1次或多次
\?      " 0次或1次
\{n,m}  " n到m次
$       " 行尾
^       " 行首
\<      " 词首
\>      " 词尾
```

### 3.3 字符类
```vim
[abc]     " a、b或c
[^abc]    " 非a、b、c
\d        " 数字
\D        " 非数字
\w        " 单词字符
\W        " 非单词字符
\s        " 空白字符
\S        " 非空白字符
```

### 3.4 零宽断言
```vim
\@=      " 正先行断言
\@!      " 负先行断言
\@<=     " 正后发断言
\@<!     " 负后发断言
```

## 4. 窗口、缓冲区与标签页

### 4.1 窗口管理
```vim
:sp [file]     " 水平分割
:vs [file]     " 垂直分割
<C-w>h/j/k/l   " 窗口间移动
<C-w>c         " 关闭窗口
<C-w>o         " 只保留当前窗口
```

### 4.2 缓冲区管理
```vim
:ls/:buffers   " 显示缓冲区列表
:bn/:bp        " 下一个/上一个缓冲区
:bd            " 删除缓冲区
:bufdo cmd     " 对所有缓冲区执行命令
```

### 4.3 标签页管理
```vim
:tabnew        " 新建标签页
:tabclose      " 关闭当前标签页
gt/gT          " 下一个/上一个标签页
:tabdo cmd     " 所有标签页执行命令
```

## 5. 插件系统

### 5.1 vim-plug 管理
```vim
" 安装插件
Plug 'author/plugin'

" 命令
:PlugInstall   " 安装插件
:PlugUpdate    " 更新插件
:PlugClean     " 删除插件
```

### 5.2 常用插件
```vim
" 文件管理
Plug 'preservim/nerdtree'
Plug 'junegunn/fzf.vim'

" 编辑增强
Plug 'tpope/vim-surround'
Plug 'tpope/vim-commentary'
Plug 'jiangmiao/auto-pairs'

" 补全与语法
Plug 'ycm-core/YouCompleteMe'
Plug 'neoclide/coc.nvim'

" Git集成
Plug 'tpope/vim-fugitive'
```

## 6. Vim 脚本编程

### 6.1 数据类型
```vim
" 基本类型
let str = "string"
let num = 42
let flag = v:true
let list = [1, 2, 3]
let dict = {'key': 'value'}
```

### 6.2 函数定义
```vim
function! MyFunction(arg)
    echo a:arg
    return 42
endfunction
```

### 6.3 自动命令
```vim
augroup MyGroup
    autocmd!
    autocmd BufWritePre * :%s/\s\+$//e
augroup END
```

### 6.4 按键映射
```vim
nmap <Leader>w :w<CR>
imap jk <Esc>
vmap <C-c> "+y
```

## 7. 高级功能

### 7.1 寄存器系统
```vim
""     " 无名寄存器
"0     " 复制寄存器
"a-"z  " 命名寄存器
"*     " 系统剪贴板
"_     " 黑洞寄存器
```

### 7.2 标记系统
```vim
ma     " 设置标记a
'a     " 跳转到标记a
:marks " 显示所有标记
```

### 7.3 折叠功能
```vim
zc     " 关闭折叠
zo     " 打开折叠
za     " 切换折叠
zm     " 增加折叠级别
zr     " 减少折叠级别
```

### 7.4 多文件操作
```vim
:args **/*.md           " 设置参数列表
:argdo %s/old/new/g     " 对所有参数文件执行替换
:vimgrep /pattern/ **   " 多文件查找
```

## 8. 实用技巧

### 8.1 编码问题处理
```vim
:set fileencoding=utf-8  " 转换文件编码
:w ++enc=utf-8          " 以指定编码保存
```

### 8.2 权限问题
```vim
:w !sudo tee % > /dev/null  " 无权限时保存
```

### 8.3 性能优化
```vim
" 大文件处理
gvim -u NONE -U NONE -N hugefile.txt
```

这个分类体系从基础到高级，涵盖了 Vim 的主要功能模块，便于学习和查阅。每个类别都包含了最常用的命令和配置，可以作为 Vim 使用的参考手册。
