- `vim -p filename1 filename2 ...` tab方式
- `vim -p \*` 编辑当前目录的所有文件
- `vim -r` 恢复
- `vim -o` 水平分割 
- `vim -O` 垂直分割
- `vim +[num]` 定位在num行
- `vim +/[pat]` 定位在第一个pat
## 编码

* `ga` 查看编码
- `:ascii` 类似ga，更简单

| 选项            | 简写    | 作用      |
| ------------- | ----- | ------- |
| encoding      | enc   | vim内部编码 |
| fileencoding  | fenc  | 文件编码    |
| fileencodings | fencs | 解码列表    |
### encoding
- encoding 是 Vim 内部使用的字符编码方式
- 所有的 buffer、寄存器、脚本中的字符串等，都使用 encodin 设置的编码
- 编码方式与 Vim 的内部编码不一致时会先转换成内部编码。如有无法转换为内部编码的字符，字符会丢失
- Vim 内部编码要选择包容力足够强的编码,建议将encoding设置为utf-8
- encoding 涉及 Vim 中所有字符的内部表示，因此只能在Vim启动的时候设置一次
- 在 Vim 工作过程中修改 encoding 会造成非常多的问题。
- 避免在非UTF-8系统(如Windows)下，菜单和系统提示出现乱码,做一下设置
```
set encoding=utf-8
set langmenu=zh_CN.UTF-8
language message zh_CN.UTF-8
```
当然，你也可以设置菜单和信息都显示为英文，这样也可以避免Vim程序界面乱码的问题:
```
set langmenu=en_US
let $LANG = 'en_US'

source $VIMRUNTIME/delmenu.vim
source $VIMRUNTIME/menu.vim
```
### fileencoding
- Vim 读取文件时，对文件编码进行探测。如果编码方式和 Vim 的内部编码方式不同，Vim 就会对编码进行转换。转换后，Vim 会将 fileencoding 选项设置为文件的编码
- Vim 存盘时，如果 encoding 和 fileencoding 不一致，会编码转换。
- 打开文件后设置 fileencoding，可以将文件由一种编码转换为另一种编码。 `set fileencoding=utf-8`
- ​Vim 打开文件时，自动探测和设置 fileencoding，如果出现乱码，无法通过在打开文件后重新设置 fileencoding 来纠正乱码
### fileencodings
- 编码的自动识别，是通过设置fileencodings实现的
- fileencodings 是一个用逗号分隔的列表，列表中的每一项是一种编码的名称。当我们打开文件时，Vim 按顺序使用 fileencodings 中的编码进行尝试解码，如果成功的话，就使用该编码方式进行解码，并将 fileencoding 设置为这个值
- 设置 fileencodings 时，一定要把严格的编码方式放在前面，把宽松的编码方式放在后面
```vim
// 推荐使用以下 fileencodings 设置
set fileencodings=ucs-bom, utf-8, cp936, gb18030, big5, latin1
// ucs-bom 是一种非常严格的编码，非该编码的文件几乎没有可能被误判为ucs-bom，因此放在第一位。
// utf-8也相当严格，除了很短的文件之外也是几乎不可能被误判的，因此放在第二位
```
## 按键映射

|      | Normal | Visual | Operator | Insert | Command |
| ---- | ------ | ------ | -------- | ------ | ------- |
| map  | Y      | Y      | Y        |        |         |
| nmap | Y      |        |          |        |         |
| vmap |        | Y      |          |        |         |
| omap |        |        | Y        |        |         |
| map! |        |        |          | Y      | Y       |
| imap |        |        |          | Y      |         |
| cmap |        |        |          |        | Y       |
### 模式介绍
`Normal Mode` 默认普通模式。
`Visual Mode` 可视模式下选定字符、行、列。在普通模式下，可以按 `v` 进入。
`Insert Mode` 插入模式，指处在编辑状态。普通模式下，可以按 `i` 进 入。
`Select Mode` 用鼠标选定，即选择模式。输入会直接替换选择的文本(这是和可视模式的区别)。普通模式下，可以按 `gh` 进入。
`Command-Line` 命令行模式。输入各种命令。普通模式下，按 `:` 进入。
`ex Mode` Ex 模式。普通模式下按 `Q` 进入 Ex 模式，是多行的 `Command-Line` 模式。只有 vim 有 neovim 不支持
### map前缀

| 模式       | 作用                                                            |
| -------- | ------------------------------------------------------------- |
| nore     | 非递归                                                           |
| mapclear | 取消所有 map 绑定，相当于 nmapclear, imapclear, cmapclear, vmapclear 组合 |
| unmap    |                                                               |

| 模式         | 映射            |
| ---------- | ------------- |
| (n)ormal   | nmap,map      |
| (v)isual   | vmap,xmap,map |
| (o)perator | omap,map      |
| (i)nsert   | imap          |
| (c)md      | cmap          |
| (s)elect   | smap          |
| (l)anguage | lmap          |
| (t)erminal | tmap          |
### 特殊参数（在所有参数之前）

| 参数          | 作用                                                    | 例子                                                        |
| ----------- | ----------------------------------------------------- | --------------------------------------------------------- |
| `<buffer>`  | 局限当前缓冲区                                               | `:map <buffer>,w /a<CR>` //在当前缓冲区里定义键绑定，“,w”将在当前缓冲区里查找字符a |
| `<silent>`  | 执行键绑定时不在命令行回显                                         |                                                           |
| `<special>` | 定义特殊键可能有副作用的场合                                        | `:map <special><F12> /a<CR>`                              |
| `<expr>`    | 参数会作为表达式来进行计算，结果使用实际使用的`<rhs>`                        |                                                           |
| `<unique>`  | 一般用于定义新的键映射或者缩写命令的同时检查是否该键已经被映射，如果该映射或者缩写已经存在，则该命令会失败 |                                                           |
### Leader 和 mapleader 变量

| 名称          | 作用             | 映射                 |
| ----------- | -------------- | ------------------ |
| mapleader   | 设置leader的值     | `<Leader>`         |
| localLeader | 同leader，仅用于缓冲区 | `<maplocalleader>` |
```
let g:mapleader = ','
```
## 寄存器

| 名称                                       | 作用                                            |
| ---------------------------------------- | --------------------------------------------- |
| 无名（unnamed）寄存器：""                        | 缓存最后一次操作内容                                    |
| 数字（numbered）寄存器："0                       | 缓存最近一次复制的内容                                   |
| 数字（numbered）寄存器："1 ～ "9                  | 缓存最近9次删除内容                                    |
| 行内删除（small delete）寄存器："-                 | 缓存行内删除内容                                      |
| 具名（named）寄存器："a ～ "z或"A - "Z             | 指定时可用                                         |
| 只读（read-only）寄存器：":                      | 缓存最近命令                                        |
| 只读（read-only）寄存器：".                      | 缓存最近插入文本                                      |
| 只读（read-only）寄存器："%                      | 缓存当前文件名                                       |
| 只读（read-only）寄存器："#                      | 缓存当前交替文件名                                     |
| 表达式（expression）寄存器："=                    | 只读，用于执行表达式命令                                  |
| 选择及拖拽（selection and drop）寄存器："\*, "+, "~ | 存取GUI选择文本，可用于与外部应用交互，使用前提为系统剪切板（clipboard）可用； |
| 黑洞（black hole）寄存器："\_                    | 不缓存操作内容（干净删除）                                 |
| 模式寄存器（last search pattern）："/            | 缓存最近的搜索模式                                     |
### 使用示例
```
"ayw // 寄存器a中复制一个词

// :y 复制 :d 删除 :pu 粘贴 :pu! 向上粘贴
:y n // 复制当前行到n
```
### 查看
`:reg`
### 变量
寄存器是个变量——特殊的变量，只要在前面加上一个@号就可以用变量的方式访问寄存器。所以，变量的操作也同样适用于寄存器。`let @e="开始"` `echo @e`
## 在编辑窗口与命令窗口间交换内容
### 命令模式中使用寄存器的值
1.  使用:execute命令
```
// 写入以"e为名的寄存器中
:exe "w ".@e
```
1.  使用Ctrl-R转义。可适用于各种输入的环境中,插入模式输入时、命令窗口输入时、搜索时
```
// 搜索寄存器e的内容
<Ctrl-R>e
```
### 无名寄存器
* 上次复制内容 `<c-r> "`
* 上次执行命令 `<c-r> :`
* 上次搜索内容 `<c-r> /`
* `g/<匹配内容>/y A` 将匹配内容放入寄存器A
### 表达式寄存器
`<C-R>=`
`:echo @<registername>` 寄存器内容作为变量输出
## 标记
### 创建标记
* `m<markname>` 标记可以跨文件跳转
* `a-z` 用于当前缓冲区
* `A-Z` 可以跨不同缓冲区
### 跳转标记
* `'<markname>` 移动到标记的文本行首
* `<markname> 移动到标记的光标位置
### 列印标记
* `:marks`
* `.` 最近编辑的位置
* `0-9` 最近使用的文件
* `∧` 最近插入的位置
* `'` 上一次跳转前的位置
* `"` 上一次退出文件时的位置
* `[` 上一次修改的开始处
* `]` 上一次修改的结尾处
### 删除标记
* `:delmarks <markname> <markname2>...` 删除指定标记
* `:delmarks!` 删除所有标记
## 搜索
### 计数
* `s/str//gn` 统计搜索关键字str的匹配个数
* `/str/gn`
## 拷⻉
`:co[py]` `:t`
## 移动
`:m[[o]ve]` eg:45,65 m 78 将45-65移动至78
## buftype
`:verbose set buftype` 查看buftype的设置
当buftype=nofile时，不能保存文件，只有当buftype=空时，才可以保存,修改buftype`:setlocal buftype=` `:setlocal buftype=nofile`
## 别名
`!` 为 `insert/command` 双模式，输入之后紧接 `<c-v><space>` 暂时不使用ab模式
* `:ab[breviate] 缩写 模式`
* `:iab[brev] 缩写 模式`
* `:cab[brev] 缩写 模式`
* `:unab[breviate]`
* `:iunab[breviate]`
* `:cunab[breviate]`
* `:abc[lear]`
* `:cabc[lear]`
* `:iabc[lear]`
按下`Ctrl-]`键，可以输入 advertisement 并停留在插入模式; 按下Esc键，将插入扩展字符并返回命令模式;按下 Space 或 Enter 键，那么将在插入扩展字符后，自动增加空格或回⻋，并停留在插入模式。
- 多个单词设置缩写 `:abbreviate JB Jack Berry`
- 定位光标所处的位置: `:iabbrev icode !cursor!:call search('!cursor!','b')cf!`
- 定义命令缩写 `:cabbrev h tab h` 在新的标签⻚中显示帮助信息
- 移除某个缩写: `:unabbreviate ad`
- 清除所有缩写: `:abclear`
## Tabs 多标签
### 创建和管理标签页
1. **`:tabnew` 或 `:tabe` 或 `:tabedit`** 新建一个标签页并打开一个新缓冲区。
2. **`:tabclose` 或 `:tabc`** 关闭当前标签页。
3. **`:tabonly` 或 `:tabo`** 关闭除当前标签页外的所有标签页。
### 切换标签页
1. **`gt`** 切换到下一个标签页（循环）。
2. **`gT`** 切换到上一个标签页（循环）。
3. **`:tabnext` 或 `:tabn`** 切换到下一个标签页。
4. **`:tabprevious` 或 `:tabp`** 切换到上一个标签页。
5. **`:tabfirst` 或 `:tabfir`** 跳转到第一个标签页。
6. **`:tablast` 或 `:tabl`** 跳转到最后一个标签页。
7. **`数字 + gt`** 跳转到指定编号的标签页（从 1 开始计数）。
### 移动标签页
1. **`:tabmove` 或 `:tabm`** 移动当前标签页到指定位置。
    ```
    `:tabmove` - 将当前标签页移动到最后。
    `:tabmove N` - 将当前标签页移动到第 N 个位置（从 0 开始计数）。
    `:tabmove +N` - 向右移动 N 个位置。
    `:tabmove -N` - 向左移动 N 个位置。
    ```
### 查看标签页
1. **`:tabs`** 列出所有标签页及其包含的缓冲区。
### 在标签页中打开文件
1. **`:tab split` 或 `:tab sp`** 在新的标签页中打开当前缓冲区。
2. **`:tabfind` 或 `:tabf`** 在标签页中查找并打开文件（需要文件在 `path` 中）。
### 结合其他命令使用
1. **在命令前加 `tab` 修饰符** 让某些命令在新标签页中执行。`:tab 命令`
### 实用技巧
- **查看当前标签页编号**：可以用 `:echo tabpagenr()` 查看当前标签页的编号。
- **查看总标签页数**：可以用 `:echo tabpagenr('$')` 查看总共有多少标签页。
- **自定义快捷键**：可以在 `.vimrc` 中映射常用命令，例如：
  ```vim
  nnoremap <C-t> :tabnew<CR>    " Ctrl+t 新建标签页
  nnoremap <C-Left> :tabp<CR>   " Ctrl+左箭头 切换到上一个标签页
  nnoremap <C-Right> :tabn<CR>  " Ctrl+右箭头 切换到下一个标签页
  ```
- `:tabdo %s/a/b/g` 所有tabs中执行命令
- `:tab ball` 每个文件一个tab
## 文件浏览
`:Ex` 开启目录浏览器
`:Sex` 水平分割开启目录浏览器
`:Vex` 垂直分割开启目录浏览器
`:browse` 图形版文件浏览器，允许通过图形化来选择文件，edit、saveas、read、oldfiles 
`:grep` 命令用于在多个文件中搜索指定的字符串或正则表达式，并将匹配结果存储在 **快速修复列表（Quickfix List）** 中，方便后续查看和跳转。
## 读取内容并插入
`:r [filename]` 读取文件插入到下一行
`:r ![command]` 读取命令out插入到下一行
## 插入模式下的快捷键

| 快捷键         | 意义                   |
| -------------- | ---------------------- |
| `<c-k>`        | 组合输入               |
| `<c-h>`        | 退格                   |
| `<c-u>`        | 删除至行首             |
| `<c-[>或<c-c>` | <esc>                  |
| `<c-w>`        | 删除一个词             |
| `<c-v>`        | unicode                |
| `<c-o>`        | 暂时进入normal         |
| `<c-d>`        | 减少缩进               |
| `<c-t>`        | 增加缩进               |
| `<c-y>`        | 复制上一行对应列的字符 |
| `<c-e>`        | 复制下一行对应列的字符 |
| `<c-r>`        | 插入寄存器内容         |
## 杂项
* `:list` 打印不可见字符
* `gp` 粘贴并将光标移至新粘贴行的下一行
* `:ene[w]` 新建文件
* `:delete` 删除行
* `:w !sudo tee %` 只读模式时使用sudo保存文件
* `:hide` 关闭当前窗口
* `:sball`，`:sb` 所有buffers显示在一个窗口
* `:rewind`，`:rew` 跳转到参数列表的第一个文件 
* `:brewind`， `:brew` 跳转到 buffer 的第一个文件
* `q?`，`q/` 查看检索历史，选择执行
* `q:` `:`模式命令历史，选择执行
* `:ju(mps)` 跳转记录
* `'.` 跳转到编辑点
* ``` `. ``` 编辑点所在行
* `g,` 新的编辑点位置
* `g;` 较旧的编辑点位置
* `:changes`
* `:=` 计算器
* `:lcd` 改变路径到当前编辑文件
* `<c-]>` tag cursor
* `g<c-]>` match || tablist
* `!!`普通模式按下 `!!`，命令行中会出现 `:.!`。这时输入一 个外部命令，当前行的内容就会被这个外部命令的输出替换。你也可以通过命令 `:?^$?+1,/^$/-1!ls` 把当前段落的内容替换成外部命令 ls 的输出，原理是向前 和向后各搜索一个空白行，删除这两个空白行之间的内容，并将外部命令 ls 的 输出放到这两个空白行之间。
## 缩进
* `gv` 上次选中
* `O` 块级选择的区域头尾移动
* `o` 块级选择区域对⻆线移动
### 块缩进
* `>%`
* `>i{`
* `>a{`
## 移动光标
* `H` 将光标移至顶部
* `M` 将光标移至中部
* `L` 将光标移至底部
* `zt` 将当前行移至上部
* `zz` 将当前行移至中部
* `zb` 将当前行移至底部
## fileinfo
* `<c-g>` 命令在屏幕的下端显示当前所在位置的信息
我们还可以在CTRL-G命令加上一个数字参数，这个数字越大得到的信息就越详细。
* `1<c-g>`会显示文件的全路径。
* `2<c-g>`会同时显示缓冲区的数字标号。
* `g<c-g>`可显示出当前文件中的字符数的信息。主要显示出当前行数(Line)、列数(Col)、字数(Word)、字符数(Char)和字节数(Byte)等信息
## jumps
可以在当前文件内跳转，还可以移动到曾经涉足过的其它文件。
- `:jumps` 曾到过的行的列表。
- `<c-o>` 跳转到移动记录列表中上一个位置。
- `<c-i>` 跳转到移动记录列表中下一个位置。
## 查找
1. 以下命令指定只在当前行在内的以下4行内进行替换`:s/helo/hello/g4`
2. 以下命令指定只在当前行至文件结尾间进行替换`:.,$s/dog/cat/g`
3. 以下命令指定只在后续9行内进行替换`:.,.+8s/dog/cat/g`
4. 你还可以将特定字符做为替换范围。比如，将SQL语句从FROM至分号部 分中的所有等号(=)替换为不等号(<>)`:/FROM/,/;/s/=/<>/g`
5. 在可视化模式下，首先选择替换范围, 然后输入:进入命令模式，就可以利 用s命令在选中的范围内进行文本替换。
6. 精确替换在搜索sig时，也将匹配sig, signature, signing等多个单词。如 果希望精确替换某个单词，可以使用“<”来匹配单词的开头，并用“>”来匹 配单词的结尾`:s/<term>/replace/gc`
7. 多项替换如果想要将单词Kang和Kodos都替换为alien，那么可以使用|进 行多项替换。`:%s/Kang|Kodos/alien/gc`
8. 变量替换使用以下命令可以将文字替换为变量的内容`:%s!~!= expand($HOME)!g`
## 折叠
| 快捷键 | 意义         |
| --- | ---------- |
| za  | 开/关当前折叠    |
| zc  | 关闭当前折叠     |
| zo  | 打开当前折叠     |
| zm  | 关闭所有折叠     |
| zM  | 关闭所有及其嵌套折叠 |
| zr  | 打开所有折叠     |
| zR  | 打开所有及其嵌套折叠 |
| zd  | 删除当前折叠     |
| zE  | 删除所有折叠     |
| zj  | 移动至下一个折叠   |
| zk  | 移动至上一个折叠   |
| zn  | 禁用折叠       |
| zN  | 启用折叠       |
通常在折叠处向左或向右移动光标，或者进入插入模式，都将会自动打开折叠。 定义快捷键，使用空格键关闭当前打开的折叠，或者打开当前关闭的折叠。 `:nnoremap <space> za`
### Manual Fold(手工折叠)
使用以下命令，启用手工折叠。 :set foldmethod=manual 在可视化模式下，使用以下命令，将折叠选中的文本: zf 通过组合使用移动命令，可以折叠指定的行。例如:使用zf70j命令，将折叠光 标之后的70行;使用5zF命令，将当前行及随后4行折叠起来;使用zf7G命令， 将当前行至全文第7行折叠起来。 我们也可以使用以下命令，折叠括号(比如()、\[\]、{}、><等)包围的区域: zfa( Vim并不会自动记忆手工折叠。但你可以使用以下命令，来保存当前的折叠状 态: :mkview 在下次打开文档时，使用以下命令，来载入记忆的折叠信息: :loadview 可以使用以下命令，查看关于手工折叠的帮助信息: :help fold-manual
### Indent Fold(缩进折叠)
使用以下命令，启用缩进折叠。所有文本将按照(选项shiftwidth 定义的)缩进 层次自动折叠。 :set foldmethod=indent 使用zm命令，可以手动折叠缩进;而利用zr命令，则可以打开折叠的缩进。 使用以下命令，将可以根据指定的级别折叠缩进: :set foldlevel=1 可以使用以下命令，查看关于缩进折叠的帮助信息: :help fold-indent
### Syntax Fold(语法折叠)
使用以下命令，启用语法折叠。所有文本将按照语法结构自动折叠。 :set foldmethod=syntax 可以使用以下命令，查看关于语法折叠的帮助信息: :help fold-syntax
### Marker Fold(标记折叠)
使用以下命令，启用标记折叠。所有文本将按照特定标记(默认为{{{和}}})自动 折叠。 :set foldmethod=marker 我们可以利用标记折叠，在文本中同时体现结构和内容，并且能够快速跳转到文 件的不同部分。 可以使用以下命令，查看关于标记折叠的帮助信息: :help fold-marker 折叠选项 使用:set foldcolumn=N命令，将在屏幕左侧显示一个折叠标识列，分别用“-”和 “+”而表示打开和关闭的折叠。其中，N是一个0-12的整数，用于指定显示的宽 度。 使用以下命令，可以查看关于折叠的帮助信息: :help folding
## 全局查找替换
`:args ./**/*.*` 
`:argdo %s/a/b/g | update` 依赖args的结果 
`:silent argdo %s/a/b/g | update` 只显示错误
`:silent! argdo %s/a/b/g | update` 错误也不显示

VIM中arg和argdo的使用介绍
* `args` 的用处是把需要进行批量操作的文件标记出来
* :argdo %s/<x_cnt>/x_counter/ge | update

1. `<` 和 `>` 使得只有完整的单词会被匹配
2. `g` 使得每行中的全部都被替换。
3. `e` 则用于避免某些文件中无匹配时的错误消息。
4. `|` 用来分隔两个命令。
5. `update` 命令会在文件有改变时进行保存。
## Buffer
### 关于缓冲区与文件
* `:buffers`
* `:files`
* `:ls`
* `:bw` 删除buffer(可指定)
### 文件列表
* `*` (非活动的缓冲区)
* `a` (当前被激活缓冲区)
* `h` (隐藏的缓冲区)
* `%` (当前的缓冲区)
* `#` 是指当前窗口可⻅的缓冲区，因为可以分割窗口，可能有多个
* (交换缓冲区) 代表轮换文件
* ` = ` (只读缓冲区)
* `*` (已经更改的缓冲区)
### 切换缓冲区
* `:wn` 保存当前buffer并跳转至下一个buffer
* `:wp` 保存当前buffer并跳转至上一个buffer
* `:bun` 关闭但不移除
* `:n` 编辑下一个文件
* `:N` 编辑上一个文件
* `:buffer <编号>`
* `:buffer <文件名>`
* `:bnext`， `:bn`
* `:bprevious`，` :bp`
* `:blast`，`:bl`
* `:bfirst`，`:bf`
### 维护缓冲区
* `:badd`
* `:bdelete`，`:bd` 把当前文件从buffer中移除
- `:bufdo /str/str/` 在打开的文件搜索并替换
## 窗口
### 横向
`+` 纵向扩大
`-` 纵向缩小 
`:res(ize) num`
`:res(ize) +num` 
`:res(ize) -num`
### 纵向
`:vertial res(ize) num`
`:vertial res(ize) +num`
`:vertial res(ize) -num`
`:tabdo %s/food/drink/g`
## 其他
- `:scriptnames` 显示所有加载的脚本及顺序
- `:function`: list functions
- `:func SearchCompl`: list particular(特定) function
- `:command`: list commands
- `:command SearchCompl`: list particular command
- `:verbose set shiftwidth?`: reveals value of shiftwidth and where set
- `:verbose map {lhs}`: show detailed information of map
- `:verbose function xxxx`: show detailed information of function
- `:verbose command xxxx`: show detailed information of command