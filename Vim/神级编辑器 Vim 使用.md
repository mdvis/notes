- `setlocal option` 使配置只在当前的 `buffer` 内生效
## vim 的配置路径
- `~/.vim/colors/`: 加载我们的 colorscheme, 使用 `:color mycolors` 将会调用 `~/.vim/colors/mycolors` 文件
- `~/.vim/plugin/`: plugin 目录, 每次启动 vim 将会将在其中的全部内容
- `~/.vim/ftdetect/`: 每次启动 vim 将会加载其中全部内容, 用于判断打开的文件是什么类型然后 `set filetype ***`
- `~/.vim/ftplugin/`: 当 vim 查找到一个文件的类型后, 为其 `set filetype`, 然后根据具体的类型在本目录下寻找对应的加载文件, 比如一个 `test.md` 文件, vim 在确定其是 `markdown` 类型后, 使用 `setf markdown` 设置其类型, 然后在本目录下寻找 `markdown.vim` 进行加载 (有的话就加载, 没有就不加载)
- `~/.vim/indent/`: 与 `~/.vim/ftplugin` 类似, 也是在确定了文件类型后在本目录下查找对应的文件进行加载, 不过只针对于缩进
- `~/.vim/compliler/`: 与 `~/.vim/ftplugin` 类似, 也是在确定了文件类型后加载对应文件然后确定执行时使用的命令
- `~/.vim/after/`: 每次启动 vim 都会加载其中的文件, 其中可以含 `plugin` 与 `ftplugin` 文件夹, 加载时机位于 `~/.vim/plugin/` 或 `~/.vim/ftplugin` 之后
- `~/.vim/autoload/`: 按需加载, 也是延时加载, 在第一次呼叫相关插件命令后进行加载
- `~/.vim/doc/`: vim 的相关文档说明, 插件加载完成后进行加载
## runtimepath
当Vim查找文件时，比如查找语法文件（syntax/）的时候，它不只是在一个地方查找。就像Linux/Unix/BSD系统中的PATH一样，Vim也有runtimepath设置，它告诉Vim在哪里查找文件来加载。
 `vim-plug` 这类包管理工具的存在的主要作用就是将各个 plugin 的 path 添加到 runtimepath 中, 进而统一管理, 可以使用 `echo &rtp` 查看
加载插件文件时根据 `runtimepath` 内部变量的值加载. 所有 `runtimepath` 中的所有目录下名为 `plugin` 的子目录们下面所有以 `.vim` 结尾的文件都会被加载执行.
autoload 加载的文件会在 `runtimepath` 下的所有 `autoload` 文件夹中进行查找, 如果找到一个, 则停止继续查找 (即使后面还有同名的文件!)
## autoload
暂时用不到的文件可以放在 `~/.vim/autoload` 文件夹中, 比如变量或方法, 命名方式为 `file1#func1`, 这样在加载的时候不会立即加载此文件, 而是在显式调用此方法时才会 source `autoload/file1`, 然后再调用 `func1`
## 基础命令
- `vim -u NONE -N`: 以不加载任何插件的方式启动 vim(终端命令)
- `gvim.exe -c "/main" joe.c`: Open joe.c then jump to “main”
- `vim -c "%s/ABC/DEF/ge | update" file1.c`: execute multiple command on a single file
- `vim -c "argdo %s/ABC/DEF/ge | update" *.c`: execute multiple command on a group of files
- `mvim --servername VIM3 --remote-tab foobar.txt`: 在 MacVim 中已打开的窗口中打开文件
- `mvim -f file.txt`: 使用 `MacVim` 编辑, 编辑完后返回结果给 terminal(如果不加 f 的话就是立刻返回结果给终端)
- `vim -c "argdo /begin/+1,/end/-1g/^/d | update" *.c`: remove blocks of text from a series of files
- `vim -s "convert.vim" file.c`: Automate editing of a file (Ex commands in convert.vim)
- `gvim -u NONE -U NONE -N hugefile.txt`: “load VIM without.vimrc and plugins (clean VIM) e.g. for HUGE files
- `gvim -c 'normal ggdG"*p' c:/aaa/xp`: Access paste buffer contents (put in a script/batch file)
- `gvim -c 's/^/\=@*/|hardcopy!|q!'`: print paste contents to default printer
- `:runtime syntax/c.vim`: 将文件加载入 `runtimpath`, 不使用冒号只会加载第一个符合的
- `:runtime! **/maps.vim`: 将文件夹下所有符合的文件添加到 `runtimpath` 中, 使用冒号会加载全部符合的
- `:set ft=json`: 设置的文件格式为 `json 格式`
- `:set ft?`: 查看当前文件的 ft 值
- `*`: 向下查找光标下的单词
- `#`: 向上查找光标下的单词
- `ga`: show unicode information of the character under cursor
- `g<C-g>`: counts words, 可以在 normal mode 与 visual mode 下使用
- `:e.`: `.` 代表 `pwd` 的结果, 即当前工作路径, 这个命令会进入 `netrw` 的文件管理界面
- `gq`: 重新布局 (如果设置了 `textwidth` 的话会根据 `textwidth` 进行断行)
- `gq}` format a paragraph
- `gqap`: format a paragraph
- `ggVGgq`: refromat entire file
- `Vgq`: current line
- `gw`: same as gq, but puts the cursor back at the same position in the text. However, `formatprg` and `formatexpr` are not used.
- `:verbose vmap`: show all map under visual model
- ` == `: indent current line
    - ` =G `: indent the all the lines below the current line
    - `n==`: indent `n` lines below the current line
    - ` =% `: indent a block of code
- `:%!xxd`: show file in hex mode
- `:%!xxd -r`: show content of file
## 保存退出
- `n1,n2 w [file]`: 将 `n1` 行到 `n2` 行的内容保存到另一个文件
- `:wa`: 保存所有缓冲区
- `:wn`: 保存当前缓冲区并进入下一个参数列表
- `:qa`: 退出所有缓冲区
- `:cq {N}`: quit vim with error code, useful when vim is called from another program, such as git call vim as mergetool
- `ZZ`: 保存退出当前 window(same as `:x` but not `:wq` which write the file even if it hasn’t been modified)
- `ZQ`: 不保存直接退出当前 window(equal to `:q!`)
- `:x`: 与 `ZZ` 及 `:zq` 功能类似, 但是不会写入没有被修改过的文件
- `:xa`: 保存并退出所有缓冲区 (不会保存没有修改过的)
- `:sav path/to.txt`: 将本缓冲区保存为文件 (相当于另存为, 命令全名是 `saveas`)
- `:sav php.html`: Save current file as php.html and “move” to php.html
- `:sav! %<.bak`: Save Current file to alternative extension (old way)
- `:sav! %:r.cfm`: Save Current file to alternative extension
- `:sav %:s/fred/joe/`: do a substitute on file name
- `:sav %:s/fred/joe/:r.bak2`: do a substitute on file name & ext.
- `:!mv % %:r.bak`: rename current file (DOS use Rename or DEL)
- `:w path/to.txt`: 保存到某路径
- `:e!`: 重载本文件, 即使有未保存的内容也会被丢弃 (edit 缩写)
- `:e path/to.txt`: 打开指定文件
- `:e.`: 进入 `netrw` 浏览目录

## 移动

- `gj`: 在一段被折为多行时, 将光标向下移动一行 (向下移动一个屏幕行)
- `gk`: 在一段被折为多行时, 将光标向上移动一行 (向上移动一个屏幕行)
- `]}`: 跳转到下一个 `}` 上
- `[{`: 跳转到下一个 `{` 上
- `[m`: jump to beginning of next method
- `[M`: jump to end of next
- `]m`: jump to beginning of previous
- `]M`: jump to end of previous
- `:le`: 当前行居左对齐
- `:ce`: 当前行居中对齐
- `:ri`: 当前行居右对齐
- `g^`: 移动到屏幕行的行首
- `g$`: 移动到屏幕行的行尾
- `g_`: 光标移至最后一个可见字符上
- `gi`: 跳转到上次退出插入模式的位置并直接进入 `Insert Mode`
- `gn` / `gN`: 跳转冰选中上个 / 下个 `highlight`
- `ge`: backward to the end of **word**
- `gE`: backward to the end of **WORD**
- `;`: 重复查找, 即重复 `f` 或 `t`, 非常有用, 可以与 `.` 想媲美
- `,`: `;` 的反面, 当按 `;` 过头了可以用 `,` 退回来
- `<C-e>`: 向上滚一行
- `<C-y>`: 向下滚一行
- `<C-u>`: 向上滚半页
- `<C-d>`: 向下滚半页
- `M`: 光标移至页中部
- `L`: 光标移至页底部
- `H`: 光标移至页顶部
- `88gg`: 跳至第 88 行
- `88G`: 跳至第 88 行
- `gd`: 跳转到局部变量定义处
- `gD`: 跳转到文件内全局声明 (从文件开头开始查找)
- `[<C-d>`: 跳转到定义处
- `[<C-i>`: 跳转到函数, 变量和定义处
- `gf`: Edit existing file under cursor in **same window**
- `<C-w>gf`: Edit existing file under cursor in **new tabpage**
- `<C-w> f`: Edit existing file under cursor in **split window**
- `<C-w> <C-f>`: Edit existing file under cursor in **split window**
- `<C-o>`: Normal 模式下返回上一个操作的位置; Insert 模式下切换到 Normal 模式, 输入完命令后再次进入 Insert 模式: `c-o zz`
- `<C-t>`: Normal 模式下返回上一个操作的位置; Search 模式下跳转到上一个匹配位置
- `<C-g>`: Search 模式下跳转到下一个匹配位置
- `<C-i>`: Normal 模式下返回下一个操作的位置
- `<C-^>` / `<C-6>`: Normal 模式下在本文件与上一个操作文件中跳转
- `'m`: 反撇号, 跳转到设置的标记 `m` 处
- `'M`: 跳转到全局标记
- `<C-]>`: 跳转到当前光标的定义处 (基于 `.tags` 文件)
- `<C-w>]`: 用新窗口 (如果在本 buffer 内则直接跳转) 打开并查看光标下符号的定义 (光标会跳转)(基于 `.tags` 文件)
- `<C-w>}`: 使用 preview 窗口预览光标下符号的定义 (光标不会跳转)(基于 `.tags` 文件)
## 复制 / 粘贴 / 删除
- `c`: 删除并进入 `插入模式` (理解: `cert`, 会插入)
- `cw`: 删除一个单词并进入 `插入模式`
- `C`: 删除自游标处到当前行尾, 并进入 `插入模式`
- `c2c`: 删除两行并进入 `插入模式`
- `cc`: 删除一行并进入 `插入模式`
- `d^`: 删除至行首 (理解: `delete`, 不会插入, 直接删除, 不会复制)
- `D`: 从当前光标处删除至行尾
- `dw`: 向右删除一个单词
- `d2d`: 删除两行
- `dd`: 删除一行
- `d121gg`: 从当前行删除到 121 行
- `d121j`: 从当前行向下删除 121 行
- `dtj`: 向前删除到 j(不包含 j)
- `dfj`: 向前删除到 j(包含j)
- `dTj`: 向后删除到 j(不包含j)
- `dFj`: 向后删除到 j(包含j)
- `d/ans`: 向前删除到 ans(不包含 ans)
- `d?ans`: 向后删除到 ans(不包含 ans)
- `d/\d`: 向前删除到第一个数字
- `x`: 删除本字符 (等于 delete)
- `X`: 向前删除一个字符 (等于 backspace)
- `s`: 删除右侧并进入插入模式
- `S`: 删除整行并进入插入模式
- `yy`: 复制一行
- `y$`: 从光标当前处复制到结尾, 不会复制到换行符, 但是如果 `v$y` 则会复制到换行符
- `y`: 复制所选 (可视模式)
- `'a,'by*`: yank range into paste
- `%y*`: yank range into paste
- `.y*`: yank current line to paste
- `set paste`: prevent vim from formatting pasted in text
- `y5j`: 向下复制 5 行
- `v/d/c/y` + `[文本对象]`
    - 操作分隔符的文本对象: 用于确定范围
        - `i(/[/{/"/'<`: 由 `(/[/{/"/'<` 包围起来的字符, 不包含 `(/[/{/"/'<`
        - `a(/[/{/"/'<`: 由 `(/[/{/"/'<` 包围起来的字符及包围符号本身
        - `[/?]motion<cr>`: `d/ans` / `d?ans` / `c/ans` / `c?ans`
    - 操作文本块的文本对象
        - `it`: 由 tag 包围起来的字符
        - `at`: 由 tag 包围起来的字符及 tag 本身
        - `iw`: 当前单词
        - `aw`: 当前单词及一个空格
        - `iW`: 当前字串
        - `aW`: 当前字串及一个空格
        - `is`: 当前句子
        - `as`: 当前句子及一个空格
        - `iB`: 当前 bracket(在定位 fold marker 时很有用)
        - `aB`: 当前 bracket 及一个空格
        - `ip`: 当前段落
        - `ap`: 当前段落记一个空行
    - 一般来说, `d{motion}` 命令和 `aw`, `as` 和 `ap` 配合起来使用比较好, 而 `c{motion}` 命令和 `iw` 及类似的文本对象一起用效果会更好.
- `gp`: 与 `p` 类似, 不过会把光标移动至文本的结尾
- `gP`: 与 `P` 类似, 不过会把光标移动到文本的结尾, 在粘贴多行的时候尤其有用
## 大小写 / 加减
- `~`: 将当前光标处的大小写翻转
- `g~5j`: 将当前行向下 5 行大小写反转
- `gu5j`: 将当前行向下 5 行改为小写
- `gU5j`: 将当前行向下 5 行改为大写
- `gUit`: 将 tag 包围的内容改为大写
- `guu`: 将当前行改为小写
- `gUU`: 将当前行改为大写
- `g~~`: flip case line
- `Vu`: 将当前行改为小写
- `VU`: 将当前行改为大写
- `veu`: 当前光标至尾端的字符改为小写
- `vG~`: 将当前光标至文本结尾的字符翻转大小写
- `ggguG`: lowercase entire file
- `<C-a>`: 对数字进行增加操作, 在列选择模式下批量增加数字, 对 Markdown 的列表排序特别好用
    - `<C-v>` + `select` + `C-a`: 将选择区域数字统一增加 1
    - `<C-v>` + `select` + `2` + `C-a`: 将选择区域数字统一增加 2
    - `<C-v>` + `select` + `g` + `C-a`: 将选择区域的数字 + 以 1 为梯度的一个数列(`1, 3, 5, 7 ...`)相加, 得到的结果覆盖原选择区域
    - `<C-v>` + `select` + `2` + `g` + `C-a`: 将选择区域的数字 + 以 2 为梯度的一个数列(`2, 4, 6, 8 ...`)相加, 得到的结果覆盖原选择区域
- `<C-x>`: 对数字进行缩小操作 (用法同 `C-a`)

## 撤销

- `u`: 撤销 undo(命令模式, 可多次撤销)
- `U`: 无论当前行修改了多少次, 全部撤销操作
- `<C-r>`: Normal 模式下反撤销
- `:undolist`: 撤销历史 (命令模式)
- `:undo 5`: 撤销 5 个改变 (命令模式)

## Folding

- `zf`: 创建折叠
- `zc`: close, 关闭当前光标下可折叠区域
- `zo`: open, 打开当前光标下可折叠区域
- `za`: toggle, 打开 / 关闭当前光标下可折叠区域
- `zC/zO/zA`: 与小写不同的是操作对象为全局, 与光标位置无关
- `zr`: reduce, 整体减少折叠等级 (与光标位置无关)
- `zR`: 将所有折叠级别减值最小 (直观看来就是缓冲区完全展开了)
- `zm`: more, 整体增加折叠级别 (与光标位置无关)
- `zM`: 增加折叠级别至最高 (直观看来就是缓冲区完全折叠了)
- `zi`: 全部折叠与全部展开之间进行切换
- `[z`: 当前打开折叠的开始处
- `z]`: 当前打开折叠的末尾处
- `zd`: 删除当前折叠 marker
- `zE`: 删除所有折叠 marker
- `zj`: 移动至下一个折叠
- `zk`: 移动至上一个折叠
- `zn`: 禁用折叠
- `zN`: 启用折叠

## window/tab

- `:tabnew [filename]`: 新建一个 tab 页, 例: `tabnew %` 以当前文件新建一个 tab 页, `%` 表示当前文件
- `:tabclose`: 关闭当前 tab
- `:tabonly`: 关闭所有其他的 tab
- `:tabn`: 移动至下一个 tab, 直接使用 gt 也可
- `:tabp`: 移动至上一个 tab, 直接使用 gT 也可
- `:tabs`: 查看所有打开的 tab
- `:tabdo %s/foo/bar/g`: 在所有打开的 tab 上执行替换
- `:tab ball`: 将所有的缓冲区在 tab 中打开
- `:tab sball`: 将所有的缓冲区在 tab 中再次打开
- `gt`: 跳转到下一个 tab
- `gT`: 跳转到上一个 tab
- `5gt`: 跳转到第 5 个 tab 上
- `:sp`: 上下切割当前文件, 同 `<C-w> s`
- `:vs`: 左右切割当前文件, 同 `<C-w> v`
- `:sp [filename]`: 上下分割并打开一个新文件, 如果不输入 filename 会切割打开本文件 (光标在文件开头位置)
- `:vs [filename]`: 左右分割并打开一个新文件, 如果不输入 filename 会切割打开本文件 (光标在文件开头位置)
- `<C-w> T`: 如果当前 tab 存在多个不同的 window, 那么将当前 window 移动到新 tab 上, 必须是大写
- `<C-w> s`: 水平切割当前窗口
- `<C-w> v`: 垂直切割当前窗口
- `<C-w> h/j/k/l`: 光标向某个方向分屏移动
- `<C-w> H/J/K/L`: 当前分屏向某个方向移动
- `<C-w> w`: 在所有窗口间进行切换
- `<C-w> _`: 使窗口高度最大化
- `<C-w> |`: 使窗口宽度最大化
- `<C-w> =`: 使所有窗口等宽等高
- `<C-w> r`: 翻转窗口顺序
- `<C-w> q`: quit, 关闭当前分屏, 如果是最后一个, 则退出 vim
- `<C-w> c`: close, 关闭当前分屏, 如果是最后一个, 则退出 vim
- `<C-w> o`: only, 关闭所有除当前屏幕外的所有分屏
- `<C-w> z`: 关闭当前打开的 preview 窗口
- `[N]<C-w> +`: 分屏增加 N 列高度 (可选)
- `[N]<C-w> <`: 分屏减少 N 列宽度 (可选)
- `:wincmd l`: 将光标移动至右窗口, 与 `<C-w>l` 功能等价
- `:3wincmd l`: 将光标移动至右窗口, 重复三次此动作
- `:$wincmd w`: 将光标移动至最右窗口
- `:close`: 关闭活动窗口
- `:only`: 只留下当前活动窗口
- `:new abc.txt`: 在新窗口中编辑文件

## Buffer

- `:ls` / `:buffers`: 显示当前所有 buffer(缓冲区列表)
    - `a`: active buffer
    - `h`: hidden buffer
    - `%`: the buffer is the current window
    - `#`: alternate buffer, 可以使用 `:e #` 直接编辑
- `:ls!`: 列出非缓冲区列表文件
- `:bn`: buffer next, 下一个 buffer
- `:bp`: buffer previous, 上一个 buffer
- `:bf`: 打开第一个 buffer
- `:bl`: 打开最后一个 buffer
- `:b1`: 切换到 buffer1(同理可按照数字切换到不同的 buffer)
- `:bd`: 删除 buffer(并没有删除文件本身, 只是 buffer 而已)
- `:bd 1 3`: 删除 buffer 编号为 `1`, `3` 的两个 buffer
- `:bw 3`: 将非缓冲区文件全部删除
- `:bufdo [command]`: 对所有缓冲区执行操作
    - `:bufdo /searchstr/`: use `:rewind` to recommence search
    - `:bufdo %s/searchstr/&/gic`: say n and then a to stop
    - `:bufdo execute "normal! @a" | w`: execute macro a over all buffers
    - `:bufdo exe ":normal Gp" | update`: paste to the end of each buffer
- `:1,3 bd`: 删除 buffer 编号在 `1~3` 之间的所有 buffer

## Tag

- `<C-]>`: 跳转到当前光标的定义处
- `g<C-]>`: 查看当前光标处有多少个定义 (可输入数字然后跳转)
- `g]`: 查看当前光标处有多少个定义 (可输入数字然后跳转)
- `:tag {keyword}`: 根据 `keyworkd` 查找有多少个匹配的 tag
- `:tag`: 正向遍历 tag 历史
- `:tnext`: 跳转到下一处匹配的 tag
- `:tprev`: 跳转到上一处匹配的 tag
- `:tfist`: 跳转到第一处匹配的 tag
- `:tlast`: 跳转到最后一处匹配的 tag
- `:tselect`: 提示用户从 tag 匹配的列表中选择一项进行跳转
- `:cs`: 显示 `cscope` 的所有可用命令

## Mark

vim 中 mark 分为三种:

- `Local mark` (a-z): 每一个 buffer 里皆有自己的 local mark, 也就是说档案 A 可以有 `mark a`, 档案 B 里也可以有自己的 `mark a`
- `Global mark` (A-Z): 此种 _mark_ 是全域的, 也就是说在档案 A 里所看到的 `mark A` 和 B 档案 B 里的 `mark A` 是一样的
- `Special mark`: 其他神奇的 mark, 不在此文章討论范围
- `:marks`: 显示所有的 `marks`
- `mm`: 为当前位置在当前缓冲区内设置本地标记 `m`
- `dmm`: 删除本地标记 `m`
- `'m`: 反撇号, 跳转到设置的本地标记 `m` 处
- `mM`: 为当前位置设置全局标记 `M` (必须是大写, 可以跨文件使用)
- `'M`: 跳转到全局标记
- `'[`: 上一次修改或复制的第一行或第一个字符
- `']`: 上一次修改或复制的最后一行或最后一个字符
- `'<`: 上一次在可视模式下选取的第一行或第一个字符
- `'>`: 上一次在可视模式下选取的最后一行或最后一个字符
- `''`: 上一次跳转 (不包含 `hjkl` 的那种跳转) 之前的光标位置
- `'"`: 上一次关闭当前缓冲区时的光标位置
- `'^`: 上一次插入字符后的光标位置, `gi` 便是使用了此 mark
- `'.`: 上一次修改文本后的光标位置, 如果想跳转到更旧的 mark, 可以使用 `g;`
- `'(`: 当前句子的开头, 与 command `(` 相同
- `')`: 当前句子的结尾, 与 command `)` 相同
- `'{`: 当前段落的开头, 与 command `{` 相同
- `'}`: 当前段落的结尾, 与 command `}` 相同

> 跳转时我们可以使用 _单引号_, 也可以使用 _反撇号_, _单引号_ 只会让我们跳转到该行的第一个非空白字符, _反撇号_ 会让我们跳转到改行的该列, 更加精确

## Completion

- `<C-n>`: 触发补全, 向下
- `<C-p>`: 触发补全, 向上
- `<C-x>`: 进入补全模式
    - `<C-x> <C-l>`: 整行补全
    - `<C-x> <C-n>`: 根据当前文件里关键字补全
    - `<C-x> <C-k>`: 根据字典补全
    - `<C-x> <C-t>`: 根据同义词字典补全
    - `<C-x> <C-i>`: 根据头文件内关键字补全
    - `<C-x> <C-]>`: 根据 tag 补全
    - `<C-x> <C-f>`: 补全文件名
    - `<C-x> <C-d>`: 补全宏定义
    - `<C-x> <C-v>`: 补全 `vim` 命令
    - `<C-x> <C-u>`: 用户自定义补全方式
    - `<C-x> <C-s>`: 例如: 一个英文单词 拼写建议

## Quick List

- `:cnext`: 显示当前页下一个结果
- `:cpre`: 显示当前页上一个结果
- `:copen`: 打开 Quickfix 窗口
- `:cfirst`: 跳转到第一项
- `:clast`: 跳转到最后一项
- `:cnfile`: 跳转到下一个文件中的第一项
- `:cpfile`: 跳转到上一个文件中的最后一项
- `:cc N`: 跳转到第 n 项
- `:cclose`: 关闭 Quickfix 窗口
- `:cdo {cmd}`: 在 quickfix 列表中的每一行上执行 {cmd}
- `:cfdo {cmd}`: 在 quickfix 列表上的每个文件上执行一次 {cmd}
- `:cl[ist]`: 打开 location list 窗口, 目前看来不需要使用此选项

## Location List

与 Quick-List 相似, 最大的不同是: Quick-List 是针对多个窗口共享一个结果, 而 `Location List` 则是各个窗口的结果互相独立

- `lopen`: 用于打开位置列表窗口
- `lclose`: 用于关闭位置列表窗口
- `lnext`: 用于切换到位置列表中的下一项
- `lprevious`: 用于切换到位置列表中的上一项
- `lwindow`: 用于在错误出现时才触发位置列表窗口

## 宏

- `q + 小写字母`: 进入宏记录模式, 记录到 `小写字母` 寄存器中, 记录完成后再次按下 `q` 即可.
- `q + 大写字母`: 进入宏记录模式, 在 `小写字母` 寄存器尾部接着添加命令, 记录完成后再次按下 `q` 即可.
- `@ + 小写字母`: 执行对应寄存器内的宏. 可使用前缀添加数字的方式重复多次命令
- `@:`: repeat last `:` command, `:` 寄存器总是保存着最后执行的命令行命令
- `@@`: 直接重复上一次的 `@` 命令, 此命令必须建立在 **上一次使用了以 `@` 开头的寄存器宏** 或者 **刚刚建立了一个寄存器宏的** 基础上, 因此经常配合 `@:` 使用.
- `10@a`: 执行寄存器 `a` 中所存储宏 10 次 (串行处理, 如果有错误, 则立刻停止, 后续命令不再执行)

## 参数列表

参数列表与缓冲区的概念很类似, 参数列表的原始含义是我们在终端中使用 `vim a.txt b.txt` 时后面的一系列文件或参数名, 但是我们也可以在进入 vim 后使用 `args` 手动添加参数文件. 其与缓冲区的区别是:

1. 位于参数列表的文件必然位于缓冲区列表中
2. 缓冲区列表永远是乱糟糟的, 但是参数列表永远是秩序井然

- `:args *.*`: 将当前目录下的所有类型的文件加入到参数列表中 (不包括文件夹中的文件)
- `:args **/*.*`: 将当前目录下的所有文件及子文件夹的所有文件都匹配加入到参数列表中
- `:args *.md aa/**/*.md` 表示添加子文件夹下的 md 文件及 aa 文件夹下的和其子文件夹下的 md 文件到参数列表中
- `:args 'cat list.txt'`: 用反撇号将命令包围起来, 然后将命令被执行后的结果作为参数加入参数列表中
- `:argdo %s/oldword/newword/egc | update`: 对所有存在参数列表中的文件执行命令, s 代表替换, % 指对所有行进行匹配, g 代表整行替换 (必用), e 指使用正则表达式, c 代表每次替换前都会进行确认, update 表示对文件进行读写
- `:argdo exe '%!sort' | w`
- `:argdo write`: 将所有参数列表中的内容进行缓冲区保存
- `:argdo normal @a`: 将当前参数列表的所有缓冲区执行寄存器 a 中所存储的宏
- `:argd *`: 清空参数列表
- `:argdo bw`: 将参数列表中的所有文件清除出缓冲区
- `:args`: 显示当前的所有参数列表
- `:next`: 跳转到下一个参数列表的文件
- `:prev`: 跳转到上一个参数列表的文件
- `:first`: 跳转到第一个参数列表的文件
- `:last`: 跳转到最后一个参数列表的文件
- `:args **/*.md`: 将当前文件夹下所有.md 文件加入到参数列表中 (包括子文件夹中的文件)
- `:argdo %s/!\[.*\]/!\[img\]/gc`: 将所有参数列表中的以 `![` 开头, 以 `]` 结尾的所有字段改为 `[img]`
- `:argdo source FormatCN.vim`: 对参数列表中的所有文件执行脚本 `FormatCN.vim`

## 命令行模式

- `:shell`: 调用系统的 `shell` 来在 vim 进程中执行命令, 执行完使用 `exit` 退出
- `:term bash`: 在底部分割出一个独立窗口并调用 `bash`, 也可以使用 `term zsh` 来调用 `zsh`, 或 `:terminal zsh`
- `:history`: all commands(equal to `:his c`)
- `:his c`: commandline history
- `:his s`: search history
- `<C-w> N`: 在进入 `:term` 的终端模式后, 使用本命令可以获得 `Normal 模式` 的效果, 使用 `i` 返回正常的终端模式
- `<C-\><C-n>`: 同 `<C-w> N`
- `:col<C-d>`: 在 Ex 命令模式中使用补全查看可能的选项, 然后使用 `Tab` / `S-Tab` 进行选择 / 反向选择
- `<C-r><C-w>`: 将当前的光标下的单词 `<cword>` 插入到命令行中
- `<C-r><C-a>`: 将当前的光标下的单词 `<CWORD>` 插入到命令行中
- `<C-f>`: 将正在命令行中输入的内容放入到命令行窗口开始编辑
- `<C-c>`: 与 `<C-f>` 相反, 此命令可以使命令行窗口的当前行内容从命令行窗口放回到命令行中
- `<C-z>`: 在终端中将 `vim` 最小化, 然后如果再需要调用的话使用 `fg` 进行操作, 使用 `jobs` 查看所有处于后台的工作
- `<C-b>`: beginning, 在命令行模式中跳转到行首
- `<C-e>`: end, 在命令行模式中跳转到结尾
- `<C-p>`: 在命令行模式中显示上次的命令
- `<C-n>`: 在命令行模式中显示下次的命令
- `:!!`: last `:!` command
- `:~`: last substitute
- `:!<command>`: 在 shell 中执行命令
- `:!sh %`: 将当前文件所有行作为输入使用外部程序 sh 执行, `%` 代表本文件所有行
- `!!<command>`: 运行命令并将结果作为当前行的内容, 同 `:read!<command>`, `:.!<command>`
- `:read!<command>`: 将命令的结果输入 (重定向) 到当前缓冲区
    - `r !printf '\%s' {a..z}`: 获得 `a-z`
- `:put=execute('echo expand(\"%:p\")')`: 将当前文件名输出到 buffer
- `:put=execute('scriptnames')`: 将输出 put 到当前 `buffer` 上
- `:put=range(1,5)`: 生成 `1,2,3,4,5`, 并粘贴到当前光标之后(每行一个元素)
- `:put=range(10,0,-1)`: 生成 `10,9,8,7,6,5,4,3,2,1,0`, 并粘贴到当前光标之后(每行一个元素)
- `:put=range(0,10,2)`: 生成 `0,2,4,6,8,10`, 并粘贴到当前光标之后(每行一个元素)
- `:put=range(5)`: 生成 `0,1,2,3,4`, 并粘贴到当前光标之后(每行一个元素)
- `:enew|put=execute('scriptnames')`: 新开一个 `buffer`, 将输出 `put` 到该 `buffer` 上
- `:tabnew|put=execute('scriptnames')`: 新开一个 `tab`, 将输出 `put` 到该 `buffer` 上
- `:redir @">|silent scriptnames|redir END|enew|put`: 使用重定向到 `"` 寄存器, 然后在新 `buffer` 上 `put`
- `:!ls`: 显示当前工作目录下的所有文件 (此操作属于调用系统进程, 使用! 来调用系统操作是 Vim 的一大特点)
- `:[range]write!sh`: 将当前缓冲区的内容, 在 shell 中逐行执行, 与 `read!<command>` 作用正好相反, `!` 表示外部程序
- `:[range]write! sh`: 将当前缓冲区的内容, 在 shell 中逐行执行, `!` 表示外部程序
- `:[range]write! sh`: 将当前缓存区内容写入到一个名为 sh 的文件, `!` 表示强制覆盖式写入
- `:[range]write! filename`: 将当前缓冲区内容另存为到 filename 文件中
- `:.,$ sort [option] [pattern]`: 从当前行到末尾进行排序
    - `!`: 翻转顺序, 默认小在前, 翻转后大在前
    - `i`: 忽略大小写
    - `n`: numeric, 综合数字进行排序, 100 会排在 20 的后面
    - `f`: 浮点型
    - `b`: 二进制排序
    - `o`: 八进制排序
    - `x`: 十六进制排序
    - `u`: 移除重复行, `:sort! u` 会倒序去重排序 (`!` 控制正反序, 默认是正序)
    - `pattern`: When `pattern` is specified and there is no `r` flag the text matched with `pattern` is skipped, so that you sort on what comes after the match.
- `:sort /.*\%2v/`: sort all lines on second column
- `:2,$!sort -t',' -k2`: 使用外部 `sort` 程序进行排序, 以 `,` 为分隔符, 以第二项进行排序
- `:%!tac`: 将整个文档翻转
- `:%!sort -R`: 随机排序
- `:%!shuf`: 随机排序
- `:w!sudo tee % > /dev/null`: 在当前用户没有权限对当前文件做操作时使用超级管理员身份进行操作
- `:ls`: 列出当前所有的缓冲区文件列表, 执行的是 vim 的 ls 命令
- `:f`: 显示当前文件路径, (使用了 `<C-g>` 代替, 此项基本不会用了)
- `:command`: 显示当前所文件的所有可使用命令
- `:retab`: 重新生成所有的 tab(主要用于在.vimrc 中重新设置了 tab 格式, 然后在已存在旧格式 tab 的文档进行重生成)
- `:map g`: 查看所有以 `g` 开头的映射
- `echo $VIMRUNTIME`: 输出 vim 的 `runtime` path
- `echom $VIMRUNTIM`: echo 的信息只能显示一次, 之后不能查看, 使用 `echom` 可以通过 `messages` 调用查看.
- `echom &rtp`: 输出 `runtimepath`

> Vim 的先祖是 vi, 正是 vi 开创了区分模式编辑的范例. 相应的, vi 奉 一个名为 ex 的行编辑器为先祖, 这就是为什么会有 Ex 命令.

Ex 命令在命令行模式中执行, 而命令行模式的进入方式为 `:` 键, 因此我们可以看到所有的 `Ex` 命令都是以 `:` 开始的, 输入完命令后按下确定键 `<CR>` 即可执行, 虽然 `Ex` 命令年代久远, 但是不可否认其语法的简洁明了以及高效, 很多复杂的操作往往都是通过 `Ex` 命令来进行处理.

- `:[range] <command> [target]`: 执行命令并将结果放入目标位置
    - `:3,5 w!bash`: 将 3~5 行写入 bash
    - `:. w!bash`: 将当前行写入 bash
    - `:.!bash`: 将当前行执行结果写入当前 buffer
    - `:3,5 delete x`: 将当前行执行结果删除到 x 寄存器
    - `:.,$delete x`: 将当前行到文件结尾的所有内容删除
    - `:3,5 yank x`: 将当前行执行结果复制到 x 寄存器
    - `:. put x`: 在当前行后粘贴寄存器 x 的内容
    - `:3,5 copy .`: 将 3~5 行复制到当前行下
    - `:3,5 copy $`: 将 3~5 行复制到缓冲区的尾部
    - `:3,5 move.`: 将 3~5 行移动到当前行下
    - `:3,5 join`: 将 3~5 行进行合并
    - `[range] normal [cmd]`: normal 用来指定在 normal 模式下对文本的操作命令
        - `:3,5 normal .`: 对 3~5 行执行 `.` 重复命令
        - `:3,5 normal @q`: 对 3~5 行执行寄存器 `q` 内存储的命令
        - `'<,'> normal @a`: 在所选高亮区域上执行宏 (如果有错误也不停止, 因为是针对每一行执行的, 出错了只需要不处理那一行就行了)
    - `:[range] global/{pattern}/[cmd]`: 对指定范围内匹配的所有行执行 Ex 命令 (具体实例参见正则替换篇)
    - `:3,5 s/{pattern}/{string}/[flags]`: 将 `3~5` 行进行相应替换
    - `:3,5 join`: 将 `3~5` 行进行合并
    - `:3 p`: 打印第 3 行
    - `:3,5 p`: 打印 3~5 行
    - `:.,.+3 p`: 打印本行以下的三行内容, `+3` 代表偏移
    - `:% p`: 打印本 buffer 的所有行, `%` 代表所有行, 是 `1:$` 的简写
    - `:0,$ p`: 打印本 buffer 所有行, `$` 代表最后一行
    - `:.,$ p`: 打印本 buffer 内从本行到结尾的所有内容, `.` 代表当前行
    - `/<html>/+1,/<\/html>/-1 p`: 使用 patten 指定范围, `+1` 表示偏移
    - `:6t.`: 把第 6 行复制到当前行下方, tail 代表尾巴, 遵守 `from...to...` 的含义
    - `:t6`: 把当前行复制到第 6 行下方, 当 `.` 位于首位时可以省略 `.`, 因此全称是 `:.t6`
    - `:t.`: 粘贴当前行到下方, 与 `yyp` 不同的是本方式不会将内容放到寄存器中, 而 `yyp` 会将内容复制到 `unname` 寄存器与 `0` 寄存器
    - `:t$`: 粘贴当前行到文本结尾
    - `:'<,'>t0`: 把高亮选中的行复制到文件开头, `'<` 代表高亮选取的第一行, `'>` 代表高亮选取的最后一行
    - `:'<,'>m$`: 把高亮选中的行移动到文件结尾
    - `:'<,'>A;`: 把当前文件的所有行的尾部加上 `;`

## Insert 模式

- `<C-p>`: 选择上方补全
- `<C-n>`: 选择下方补全
- `⎋`: 退出插入模式 (推荐)
- `<C-c>`: 退出插入模式
- `<C-[>`: 退出插入模式
- `<C-u>`: 向左删除到行首
- `<C-w>`: 向左删除一个单词
- `<C-h>`: 向左删除一个字符
- `<C-t>`: 整行向右偏移
- `<C-d>`: 整行向左偏移
- `<C-r>= <function>`: 进行计算并将结果输出到当前缓冲区中
- `<C-x><C-e>`: scroll up wile staying put in insert
- `<C-x><C-y>`: scroll down wile staying put in insert
- `<C-Left>`: jump one word backwards
- `<C-Right>`: jump one word forward
- `<C-v><Tab>`: 无论 `expandtab` 选项是否开启都会插入制表符
- `<C-v><C-c>`: 输入文本结束字符(其他控制字符也可以按照这种方式插入)
- `<C-v><Tab>`: 输入水平制表符
- `<C-v>065`: 按照十进制输入大写字母 A
- `<C-v>o033`: 按照八进制输入转义符 `^[`
- `<C-v>x2a`: 按照十六进制输入转义符 `*`
- `<C-v>X2a`: 按照十六进制输入转义符 `*`
- `<C-v>u1234`: 按照 unicode 码以 16 进制来输入
- `<C-v>U00001234`: 按照 unicode 码以 16 进制来输入
- `<C-k>xx`: 通过两个字符输入常规键盘不方便输入的一些字符, 具体可通过 `:digraphs` / `:h digraph` 查看相关字符定义, 例如 `<C-k>*2` 可插入 `★`

## 路径

vim 的工作路径是使用中要格外注意的地方, 简单来说, 终端中的 vim 默认会把终端当前的路径作为其工作路径, 当然我们可以使用 `cd` 使其工作路径变更

- `:cd [path]`: 设置此次 vim 的工作目录为 path
- `:cd %:h`: cd 到当前缓冲区所属目录中
- `:cd ../`: cd 到上一级
- `:pwd`: 显示当前工作路径
- `:lcd [path]`: 设置当前窗口的工作目录为 path(与 cd 不同的是只会改变当前 window 的工作路径, 其他 window 的不受此影响)

vim 为我们提供了一些可以使用的宏用来表示相关路径或文件名称:

- `%`: 当前文件相对于工作路径的文件名及扩展
- `%:h`: 表示当前文件所在目录的相对工作目录路径 (不含文件名及扩展)
- `%:p`: 表示当前文件所在目录的绝对路径 (含文件名及扩展)
- `%:r`: 移除扩展之后的相对工作目录路径所有内容
- `%:e`: 扩展名
- `%:t`: 当前文件名 (含扩展), 无任何目录信息
- `%<`: 当前文件相对工作路径的文件名, 无扩展

在使用以上这几种宏时, 我们可以使用 `<Tab>` 使其自动展开, 有些命令不支持自动展开的话需要使用 `expand()` 命令

- `echo expand('%:e')`: 打印当前文档扩展名, markdown 是 `md`
- `cd %:h<Tab>`: cd 到当前缓冲区所属目录中, 在最后可以使用 `<Tab>` 进行自动展开
- `e %<Tab>`: 会自动扩展为当前文件含相对工作目录的路径全名

## 寄存器

寄存器是 vim 的一种特有概念, 其他文本编辑器默认都会用系统剪贴板作为复制粘贴的根据地, 然后 vim 另辟蹊径使用多种不同类型寄存器作为临时内容存储位置. 我们可以在复制粘贴时使用指定的寄存器定制化我们的需求, 也可以在录制宏及使用宏时指定寄存器, 大大地提高了我们的工作效率.

很多刚使用 vim 的人会抱怨无法复制内容到 vim 外或 vim 内, 然后各种搜索如何使 vim 的默认复制操作与剪贴板交互, 最后定义了一大堆按键, 譬如 `"*y`, `set clipboard=unnamed`, 其实大可不必, 寄存器是 vim 的高效操作方式之一, 接受了这种方式才能更好地利用 vim 来为我们服务 (虽然刚开始适应的过程必然是痛苦的)

总的来说 Vim 的删除, 复制与粘贴命令以及定义宏时都会用到众多寄存器中的某一个. 可以通过给命令加 `"{register}` 前缀的方式指定要用的寄存器. 若不指明, Vim 将缺省使用无名寄存器

- 无名寄存器
    
    所有删除复制粘贴操作如果不显示指明寄存器类型的话使用的都是无名寄存器, 其标志符是 `""` / `"@`.
    
- 编号寄存器
    
    从 `"0` 到 `"9` 共 10 个, `"0` 保存着拷贝来的字符串, `"1` 保存着上次删除掉的字符串, `"2` 保存着上上次删除掉的字符串, 依次类推, vim 会保存最近的 9 次删除. 删除操作包括 `s`, `c`, `d`, `x`. 只有整行整行的删除才会放入 `"1` 中.
    
    使用 `y` 复制后内容会被放到 `"0` 寄存器及无名寄存器中, 但是复制寄存器是稳定的, 无名寄存器的内容会时刻被重置替换. 其标志符是 `"0`
    
- 粘贴板寄存器
    
    用于与系统的其他应用中进行复制粘贴交互, 等于系统的剪贴板. 其标识符是 `"*` (或 `"+`), 使用 `set clipboard=unnamed` 可以使得 `"*` 与 `""` 始终具有相同的值
    
- 黑洞寄存器
    
    所有放入黑洞寄存器的内容全部被丢弃, 相当于完全删除, 不留痕迹, 其标识符是 `"_`
    
- 有名寄存器
    
    以单个小写字母命名的寄存器, 可用于自定义存储空间, 一共有 26 个
    
- 小删除寄存器
    
    不足一行的小删除会被放到小删除寄存器中, 删除操作包括 `s`, `c`, `d`, `x`.
    
- 只读寄存器
    - `"%`: 存储着当前文件名, 是当前文件相对于工作目录的路径文件名
    - `".`: 存储着上次插入模式中所输入的所有文本内容
    - `":`: 存储着上次执行的 Ex 命令, 与 `@:` 相对应, `@:` 可执行上次的命令
- 交替文件寄存器
    
    `"#` 存储着当前 vim 窗口的交替文件. 交替文件指 buffer 中的上一个文件, 可通过 `C-^` 来切换交替文件与本文件
    
- 表达式寄存器
    
    表达式寄存器 `"=` 用于计算 vim 脚本的返回值, 并插入到文本中
    
    - 当我们在 normal 模式下输入 `"=` 后, 再输入 `3+2`, 然后再使用 `p` 即可粘贴 `5`
    - 在 insert 模式下使用 `<C-R>`, 然后输入 `=expand('%:p')` 即可键入当前文件的完整路径名称
- 搜索寄存器
    
    `"/`, 存储着上次搜索的关键字
    

### 使用方式

- `""p`: 从无名寄存器中取值进行粘贴
- `"ay`: 将内容复制到有名寄存器 `a`
- `"_y`: 将内容复制到黑洞寄存器, 相当于彻底地删除
- `qa`: 录制操作到寄存器 `a` 中
- `@a`: 执行寄存器 `a` 中的内容
- `u@.`: execute command just type in
- `"ap`: 从自定义寄存器中取出内容进行粘贴
- `"0p`: 从复制寄存器中取出内容进行粘贴, 默认的 p 是从无名寄存器取值
- `"*p`: 从系统粘贴板寄存器中取出内容进行粘贴
- `<C-r>"`: 在插入模式中将无名寄存器的内容粘贴进来
- `<C-r>*`: 在插入模式中将系统粘贴板寄存器的内容粘贴进来
- `<C-r>0`: 在插入模式中将复制寄存器的内容粘贴进来
- `<C-r>%`: 插入当前文件名 (因为 “% 寄存器中存储了当前文件名)
- `:reg a`: 查看有名寄存器 `a` 的内容
- `:reg *`: 查看粘贴板寄存器 `*` 的内容
- `:reg "`: 查看无名寄存器 `"` 的内容
- `:put a`: 将有名寄存器 `a` 的内容粘贴到当前缓冲区中, 与 `"ap` 不同的是 `p` 用于只能在光标之前或光标之后进行粘贴, 但是 `put` 则会始终将内容粘贴到新的一行上
- `:d a`: 将内容删除到有名寄存器 `a` 中
- `:let @q=substitute(@0, 'iphone', 'iPhone', 'g')`: 对寄存器 `0` 的内容进行替换处理然后再赋值到寄存器 `q`
- `:let @*=@0`: 将粘贴寄存器内容赋值到系统剪贴板寄存器
- `:'<,'>normal @q`: 执行
- `let @a=@_`: clear register a
- `let @a=""` clear register a
- `let @a=@"`: save unnamed register
- `let @*=@a`: copy register a to paste buffer
- `let @*=@:`: copy last command to paste buffer
- `let @*=@/`: copy last search to paste buffer
- `let @*=@%`: copy current filename to paste buffer

> 使用 Visual Mode 时, 在选中的文本上使用 `p` 将直接替换该部分文本 (替换后被替换的文本会被放入到无名寄存器中), 可用于解决需要删除然后粘贴但是会影响到无名寄存器的问题

## vimdiff

![](https://a.hanleylee.com/HKMS/2021-01-14215042.png?x-oss-process=style/WaMa)

git 与 vim 可以说是非常好的一对搭档了, 平时在终端中提交 commit 我们都少不了与 `vim` 打交道, vimdiff 是 vim 提供的专门用于修正 git 冲突文件的一款工具

若想使用 vimdiff 作为冲突修改工具, 需要设置 `~/.gitconfig` 的以下项

vim

![](https://www.hanleylee.com/img/copyCodeBtn.svg)

```
[diff]
    tool = vimdiff
[merge]
    tool = vimdiff
```

在 vimdiff 中, 一共有四个窗口, 上面依次是 `LOCAL`, `BASE`, `REMOTE`, 底部则是一个最终的文件结果窗口, 整个过程我们只需要将光标在最下方窗口上上下移动, 使用 `diffget` 命令从 `LOCAL`, `BASE`, `REMOTE` 中选择需要使用哪一个作为本行的最终结果 (当然也可以跳到上面的窗口中使用 diffput 放置结果到底部窗口上

- `:diffget LOCAL`: 选择 LCOAL 作为本行最终结果
- `:diffget REMOTE`: 选择 REMOTE 作为本行最终结果
- `:diffget BASE`: 选择 BASE 作为本行最终结果
- `:diffput [num]`: 放置结果到缓冲区上, `num` 为缓冲区编号
- `:diffg L`: 这里 vim 为我们做了简略命令, 同样可用于 `REMTOE` 与 `BASE` 上
- `:diffget //2`: `//2` 将被替换为左侧文件名
- `:diffget //3`: `//3` 将被替换为右侧文件名
- `:%diffget LO`: 将所有变更使用 local 的结果
- `:'<'>diffget LO`: 将当前选中范围的使用 local 的结果
- `dp/do`: 如果只有两个文件则可以使用 `dp/do` 来替代 `:diffput/:diffget`
- `:diffoff`: 关闭 diff mode
- `:diffthis`: 开启 diff mode
- `:ls!`: 显示当前所有缓冲区的号码
- `[c`: conflict, 移动到上一个冲突处
- `]c`: conflict, 移动到下一个冲突处
- `$git merge --continue`: 冲突全部解决完后在外界终端中使用 `git merge --continue` 继续之前的 `merge` 操作
- `:diffsplit filename`: 已经在 vim 中时, 使用此命令与别的文件进行对比
- `:vert diffsplit filename`: 同上
- `vimidff file1 file2`: 对比 `file1` 与 `file2` 的差别
- `vim -d file1 file2`: 同上 🐷
- `:wqa`: 冲突修复完成保存退出, 如果仍然有文件冲突则进入下一个冲突
- `:cq`: 放弃修复, 终止流程(在 merge conflict 时很有用, 否则使用了 `qa` 的话想再次进入 mergetool 就必须使用 `git checkout --conflict=diff3 {file}` 了)

![](https://a.hanleylee.com/HKMS/2021-05-26-17-46-26.jpg?x-oss-process=style/WaMa)

txt

![](https://www.hanleylee.com/img/copyCodeBtn.svg)

```
╔═══════╦══════╦════════╗
║       ║      ║        ║
║ LOCAL ║ BASE ║ REMOTE ║
║       ║      ║        ║
╠═══════╩══════╩════════╣
║                       ║
║        MERGED         ║
║                       ║
╚═══════════════════════╝
```

## 远程编辑

可以使用如下方式编辑远程主机上的文件:

- `e scp://user@host//home/hanley/.sh/README.md`: 通过 scp 编辑远程 (使用绝对路径)
- `tabnew scp://user@host//home/hanley/.sh/README.md`: 使用新建 tab 的方式编辑
- `e scp://vm_ubuntu//home/hanley/.sh/README.md`: 也可以通过 `~/.ssh/config` 中的 `alias` 进行 `key` 的使用
- `e scp://vm_ubuntu/.sh/README.md`: 也可以通过 `~/.ssh/config` 中的 `alias` 进行 `key` 的使用 (使用相对路径)

## [vim-plug](https://github.com/junegunn/vim-plug)

`vim-plug` 是 vim 下的插件管理器, 可以帮我们统一管理后续的所有插件, 后续的安装插件全部由此工具完成

类似的插件管理工具还有 [Vundle](https://github.com/VundleVim/Vundle.vim), 相较而言 `vim-plug` 支持异步且效率非常高, 具体选择交由读者自己

### 安装

终端中输入如下命令

vim

![](https://www.hanleylee.com/img/copyCodeBtn.svg)

```
curl -fLo ~/.vim/autoload/plug.vim --create-dirs \
    https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim
```

### 基础命令

- `PlugInstall`: 安装插件
- `PlugUpdate`: 更新所有插件
- `PlugUpgrade`: 更新插件本身
- `PlugClean`: 删除插件, 把安装插件对应行删除, 然后执行这个命令即可

### 安装插件流程

安装完 `vim-plug` 之后, 我们就可以使用其为我们服务安装插件了, 我们只需要在 `call plug#begin(~/.vim/plugged)` 与 `call plug#end()` 中指明我们需要的第三方插件即可, 如下:

vim

![](https://www.hanleylee.com/img/copyCodeBtn.svg)

```
call plug#begin('~/.vim/plugged')

Plug 'junegunn/fzf', { 'do': { -> fzf#install() } }   " 模糊搜索
Plug 'junegunn/fzf.vim'                               " 模糊搜索
Plug 'embear/vim-localvimrc'
Plug 'ycm-core/YouCompleteMe'     " 补全插件

call plug#end()
```

后续的所有插件除非特别说明, 否则都按照 `Plug 'PlugName'` 的方式进行安装

## [AutoFormat](https://github.com/Chiel92/vim-autoformat)

自动格式化管理插件, 可根据不同文件类型使用不同的格式化工具

### 安装

vim

![](https://www.hanleylee.com/img/copyCodeBtn.svg)

```
Plug 'Chiel92/vim-autoformat'
```

### 配置

vim

![](https://www.hanleylee.com/img/copyCodeBtn.svg)

```
"*****************   vim-autoformat   **********************
let g:autoformat_verbosemode=0 "详细模式
let g:autoformat_autoindent = 0
let g:autoformat_retab = 1
let g:autoformat_remove_trailing_spaces = 1
let g:formatdef_hl_js='"js-beautify"'
let g:formatdef_hl_c='"clang-format -style=\"{BasedOnStyle: LLVM, UseTab: Never, IndentWidth: 4, PointerAlignment: Right, ColumnLimit: 150, SpacesBeforeTrailingComments: 1}\""' "指定格式化的方式, 使用配置参数
let g:formatters_c = ['hl_c']
let g:formatters_cpp = ['hl_c']
let g:formatters_json = ['hl_js']
let g:formatters_js = ['hl_js']
let g:formatdef_sqlformat = '"sqlformat --keywords upper -"'
let g:formatters_sql = ['sqlformat']

"保存时自动格式化指定文件类型代码
"au BufWrite *:Autoformat
"autocmd BufWrite *.sql,*.c,*.py,*.java,*.js:Autoformat "设置发生保存事件时执行格式化
```
## netrw

很多人使用 vim 编辑文件, 完成后退出 vim 进行目录切换, 殊不知 vim 其实自带路径管理功能的, 从 vim 7 以后我们可以使用 vim 自带的 `netrw` 进入路径管理窗口

![](https://a.hanleylee.com/HKMS/2021-01-19223003.jpg?x-oss-process=style/WaMa)

`netrw` 是 vim 自带的插件, 不需要额外安装, 其提供的功能非常强大, 相比与 `NERDTREE` 这些第三方插件来说速度更快, 体量更轻, 设计更简洁

### 操作命令

- `:Ex`: 全屏进入 `netrw`, 全称是 `:Explorer`
- `:Sex>`: 水平分割进入 `netrw`
- `:Vex>`: 垂直分割进入 `netrw`
- `<F1>`: 在 netrw 界面弹出帮助信息
- `<CR>`: 打开光标下文件 / 夹
- `-`: 进入上一级目录
- `p`: 预览文件 (光标保持不动)
- `P`: 打开文件, 会在上一个使用的窗口一侧的第一个窗口打开文件
- `<C-w>z`: 关闭预览窗口
- `gn`: 使光标下的目录作为目录树最顶部, 在 tree style 下与 `<CR>` 是不同的
- `d`: 创建文件夹
- `D`: 移除文件 / 夹
- `cd`: change 工作目录到当前路径
- `I`: 显示 / 隐藏顶部 `banner`
- `o`: 以水平分割窗口方式打开光标下文件
- `v`: 以垂直分割窗口方式打开光标下文件
- `%`: 在当前目录下新建一个文件并编辑
- `r`: 翻转排序方式
- `qb`: 列出所有的目录以及历史路径
- `qf`: 显示文件详细信息
- `R`: 重命名文件 / 文件夹
- `s`: 在 `name`, `time` 和 `file size` 之间切换排序
- `t`: 新 tab 中打开文件
- `<c-h>`: 编辑隐藏列表
- `<c-l>`: 更新 netrw 列表内容
- `a`: 隐藏 / 显示由 `g: netrw_list_hide` 所控制的文件
- `C`: 设置编辑窗口
- `gb`: 跳转到上次标记的书签
- `gd`: 强制作为目录
- `gf`: 强制作为文件
- `gh`: 快速隐藏 `.` 开头的文件
- `i`: 在 `thin`, `long`, `wide`, `tree listings` 状态之间切换
- `mb`: 将当前目录存为书签
- `mc`: Copy marked files to marked-file target directory
- `mm`: Move marked files to marked-file target directory
- `md`: 对标记的文件做 `diff` 操作
- `me`: 将标记的文件放入参数列表中并进行编辑
- `mf`: 标记一个文件
- `mF`: 取消标记一个文件
- `mg`: 对标记的文件使用 `vimgrep` 命令
- `mp`: 打印标记的文件
- `mr`: 使用 `shell-style` 标记文件
- `mt`: 使当前目录成为标记文件目标
- `mT`: 对标记文件应用 `ctags`
- `mu`: 对所有标记文件取消标记
- `mz`: 压缩 / 反压缩标记文件
- `O`: Obtain a file specified by cursor
- `qF`: Mark files using a quickfix list
- `S`: 确认在 name 排序状态下的扩展名优先级
- `u`: 跳转到上一次浏览的目录
- `x`: 使用系统中与之关联的程序打开光标下文件
- `X`: 执行光标下的文件

### 配置

vim

![](https://www.hanleylee.com/img/copyCodeBtn.svg)

```
let g:netrw_hide = 1 "设置默认隐藏
let g:netrw_liststyle = 3 " tree 模式显示风格
let g:netrw_banner = 0 " 显示帮助信息
let g:netrw_browse_split = 0 "控制 <CR> 直接在当前窗口打开光标下文件
let g:netrw_winsize = 30 " 占用宽度
let g:netrw_list_hide= '\(^\|\s\s\)\zs\.\S\+' " 需要隐藏的文件
let g:netrw_localrmdir = 'trash' "默认的删除工具使用 trash
let g:netrw_altv = 1 " 控制 v 分裂的窗口位于右边
let g:netrw_preview = 1 " 默认是水平分割, 此项设置使之垂直分割
let g:netrw_alto = 0 " 控制预览窗口位于左侧或右侧, 与 netrw_preview 共同作用
" let g:netrw_chgwin = 2 " 控制按下 <CR> 的新文件在位于屏幕右侧的 2 号窗口打开, Lex 默认会设为 2
```

### netrw copy 文件的方式

netw 复制文件的方式比较费解, 其原理是先标记好一个源文件, 然后标记好一个要被拷贝到的路径, 最后使用拷贝命令进行拷贝, 具体如下:

1. `mf` 标记源文件
2. 将光标移动至 `./` 上, 然后使用 `mt` 标记此目标路径
3. `mc` 拷贝文件至此 (也可以 `mv` 移动文件至此)

## [NerdTree](https://github.com/preservim/nerdtree)

不管出于任何原因不想使用 `netrw`, 我们都有很多第三方插件可以选择, `NerdTree` 就是其中的佼佼者

### 安装

1. 先在.vimrc 文件中添加 Plug 名称及设定:
    
    vim
    
    ![](https://www.hanleylee.com/img/copyCodeBtn.svg)
    
    ```
       Plug 'preservim/nerdtree'
       Plug 'Xuyuanp/nerdtree-git-plugin' "目录树 git 状态显示
       "F1 开启和关闭 NerdTree
       map <F1>:NERDTreeToggle<CR>
       let NERDTreeChDirMode=1
       
       let NERDTreeShowBookmarks=1 "显示书签
       let NERDTreeIgnore=['\~$', '\.pyc$', '\.swp$'] "设置忽略文件类型
       let NERDTreeWinSize=25 "窗口大小
    ```
    
2. 运行 vim, 输入命令 `:PlugInstall`

### 操作命令

1. 文件操作
    - `e`: 进入文件夹内部浏览, 会在右侧开启小窗口进入文件夹列表
    - `o`: 在预览窗口中打开文件, 左侧 NerdTree 仍然被保留 (事实上除非打开新 tab 或手动退出, 否在会一直存在)
    - `O`: 递归地打开其内所有文件夹
    - `go`: 在预览窗口中打开文件, 光标将仍然保留在小窗口中, 非常好用, 用于预览多个文件特别有用.
    - `i`: 以分割视图打开文件
    - `gi`: 以分割视图打开, 但是光标仍然保留在小窗口
    - `s`: 以分割视图打开文件
    - `gs`: 以分割视图打开文件, 但是光标仍然保留在小窗口
    - `t`: 在新标签页打开选择的文件, 全屏
    - `T`: 在新标签页静默打开选择的文件, 全屏, 因为是静默, 所以不会跳转到新窗口
    - `C`: 将当前所选文件夹改为根目录, 即进入到所选择的文件夹, 与 o 不同, o 是在当前视图下将文件夹展开, C 则是直接进入到文件夹.
    - `cd`: 将当前文件夹改为 cwd(当前工作目录)
    - `CD`: 将文件夹目录跳转到 CWD(当前工作目录) 中
    - `m`: 对所选择的文件或文件夹弹出编辑菜单. 包括修改文件名, 复制, 移动, 删除等操作
    - `B`: 隐藏 / 显示书签, 如果显示书签, 还会将光标自动跳转至书签
    - `I`: 显示系统隐藏文件
2. 关闭移动系列
    - `q`: 直接退出 NerdTree
    - `D`: 删除书签
    - `F`: 隐藏文件, 只保留文件夹在视图中
    - `⌃ j`: 当同一个 NerdTree 有多个目录级别时, 只在同一级别下向下移动
    - `⌃ k`: 当同一个 NerdTree 有多个目录级别时, 只在同一级别下向上移动
    - `J`: 移动到同一级别的最下方
    - `K`: 移动到同一级别的最上方
3. 其他
    - `A`: 全屏进入 NerdTree 窗口
    - `r`: 刷新当前文件夹的缓存, 使界面刷新
    - `R`: 刷新整个文件夹树的缓存, 使整个界面更新
    - `?`: 快速显示帮助, 非常有用, 忘记功能时使用!

> 每次 `NERDTree` 从左侧显示出来的时候其所在目录即工作目录, 可以通过 `cd` 命令进行设置, 或者在 `.vimrc` 中设置 `set autochair` 进行自动切换, 这个概念对于文件批量操作很重要, 因为文件批量操作时添加待操作文件是依靠当前工作目录来进行筛选的.

## unimpaired

一个映射了大量实用命令的插件, 主要前缀键是 `[` 与 `]`,

### 安装

vim

![](https://www.hanleylee.com/img/copyCodeBtn.svg)

```
Plug 'tpope/vim-unimpaired'
```

### 使用

- `[b`:bprevious
- `]b`:bnext
- `[B`:bfirst
- `]B`:blast
- `[Space`: 当前行上增加空行
- `]Space`: 当前行下增加空行
- `[e`: 当前行上移
- `]e`: 当前行下移
- `[f`:previous file in current directory
- `]f`:next file in current directory
- `<p`: 复制到当前行下, 减少缩进
- `<P`: 复制到当前行上, 减少缩进
- `=P`: 复制到当前上, 自动缩进
- `>p`: 复制到当前行下, 增加缩进
- `>P`: 复制到当前行上, 增加缩进
- `[p`: 复制到当前行上
- `]p`: 复制到当前行下
- `[q`:cprevious, quickfix previous
- `]q`:cnext
- `[Q`:cfirst
- `]Q`:clast
- `[a`:previous
- `]a`:next
- `[A`:first
- `]A`:last
- `[l`:lprevious
- `]l`:lnext
- `[L`:lfirst
- `]L`:llast
- `[<C-L>`:lpfile
- `]<C-L>`:lnfile
- `[<C-Q>`:cpfile
- `]<C-Q>`:cnfile
- `[<C-T>`:ptprevious
- `]<C-T>`:ptnext
- `[n`:previous scm conflict
- `]n`:next scm conflict
- `[t`:tprevious, tag previous
- `]t`:tnext
- `[T`:tfirst
- `]T`:tlast

## [xkbswitch](https://github.com/lyokha/vim-xkbswitch)

vim 下的输入法自动切换工具, 在进入命令模式时自动切换至英文输入法, 回到插入模式时返回到上一次选择的输入法 (在需要中英文切换的环境中非常有用)

### 安装

1. 下载基础工具 [xkbswitch-macosx](https://github.com/myshov/xkbswitch-macosx)(每个系统有不同的实现工具, 这里以 macOS 为例)
    
    bash
    
    ![](https://www.hanleylee.com/img/copyCodeBtn.svg)
    
    ```
       git clone https://github.com/myshov/xkbswitch-macosx
       # 把 git 下来的 xkbswitch 弄到 /usr/local/bin 下, 其实环境变量能搜到就行
       cp xkbswitch-macosx/bin/xkbswitch /usr/local/bin
       git clone https://github.com/myshov/libxkbswitch-macosx
       cp libxkbswitch-macosx/bin/libxkbswitch.dylib /usr/local/lib/
    ```
    
2. 在 vim 中安装插件
    
    在 `vimrc` 中加入下面的内容:
    
    bash
    
    ![](https://www.hanleylee.com/img/copyCodeBtn.svg)
    
    ```
       Plug 'lyokha/vim-xkbswitch', {'as': 'xkbswitch'}
       
       let g:XkbSwitchEnabled     = 1
       let g:XkbSwitchIMappings   = ['cn']
       let g:XkbSwitchIMappingsTr = {'cn': {'<': '', '>': ''}}
    ```
    
    最后 `PlugInstall` 即可.
    
3. 先在.vimrc 文件中添加 Plug 名称及设定:
    
    vim
    
    ![](https://www.hanleylee.com/img/copyCodeBtn.svg)
    
    ```
       Plug 'lyokha/vim-xkbswitch', {'as': 'xkbswitch'}
       let g:XkbSwitchEnabled     = 1
    ```
    
4. 运行 vim, 输入命令:PlugInstall

### 使用方式

在 `normal` 模式下手动切换至英文输入法模式, 然后进入 `insert` 模式后手动切换到中文输入法模式, 此时插件已经记忆了输入法的状态了, 在 `ESC` 回到 `normal` 模式后会自动切换到英文输入法模式, 再次进入 `insert` 模式时会自动切换到中文输入法模式

## [auto-pairs](https://github.com/jiangmiao/auto-pairs)

自动补全匹配符号

### 安装

vim

![](https://www.hanleylee.com/img/copyCodeBtn.svg)

```
Plug 'jiangmiao/auto-pairs'
```

### 配置

vim

![](https://www.hanleylee.com/img/copyCodeBtn.svg)

```
let g:AutoPairsMapCR = 0
```

### 映射

- `<M-p>`: Toggle Autopairs (g:AutoPairsShortcutToggle)
- `<M-e>`: Fast Wrap (g:AutoPairsShortcutFastWrap)
- `<M-n>`: Jump to next closed pair (g:AutoPairsShortcutJump)
- `<M-b>`: BackInsert (g:AutoPairsShortcutBackInsert)
- `<M-(>` / `<M-)>` / `<M-[>` / `<M-]>` / `<M-{>` / `<M-}>` / `<M-">` / `<M-'>`: Move character under the cursor to the pair

## [tabular](https://github.com/godlygeek/tabular)

一款对齐插件, 快速按照给定的分隔符号完成指定范围内的对齐操作

### 安装

vim

![](https://www.hanleylee.com/img/copyCodeBtn.svg)

```
Plug 'godlygeek/tabular'
```

### 操作

- `:Tabularize /,/`: 将整个缓冲区的所有行按照 `,` 符号进行对齐
- `:'<,'>Tabularize /,/`: 对高亮选中范围内的行进行对齐
- `:Tabularize /,/l1c1r0`: 按照 `,` 进行对齐, 并且为每个分割的文本区域内的文本指定对齐方式, `l`, `c`, `r` 分别为左中右对齐, 1 代表每个分隔区域对齐补全后添加一个空格
    
    vim
    
    ![](https://www.hanleylee.com/img/copyCodeBtn.svg)
    
    ```
      abc,def,ghi
      a,b
      a,b,c
      
      :Tabularize /,/r1c1l0
      
      abc, def, ghi
        a, b
        a, b, c
    ```
    

> 1. 对于分隔符所处的区域, `l` / `r` / `c` 的作用是相同的, 因为其只有一个宽度
> 2. 如果分隔的区块足够多, 那么将会循环使用 `r1c1l0`

txt

![](https://www.hanleylee.com/img/copyCodeBtn.svg)

```
:Tabularize /,/r1c1l0

        Some short phrase, some other phrase
A much longer phrase here, and another long phrase

That command would be read as

1. Align the matching text, splitting fields on commas.
2. Print everything before the first comma right aligned, then 1 space,
3. then the comma center aligned, then 1 space,
4. then everything after the comma left aligned."

Notice that the alignment of the field the comma is in is
irrelevant - since it's only 1 cell wide, it looks the same whether it's right,
left, or center aligned.  Also notice that the 0 padding spaces specified for
the 3rd field are unused - but they would be used if there were enough fields
to require looping through the fields again.  For instance:

abc,def,ghi
a,b
a,b,c

:Tabularize /,/r1c1l0

abc, def, ghi
  a, b
  a, b,  c
```

## [emmet-vim](https://github.com/mattn/emmet-vim)

### 安装

vim

![](https://www.hanleylee.com/img/copyCodeBtn.svg)

```
Plug 'boydos/emmet-vim'
```

### 配置

vim

![](https://www.hanleylee.com/img/copyCodeBtn.svg)

```
let g:user_emmet_mode='a'    "enable all function in all mode.
let g:user_emmet_leader_key='<C-y>'
let g:user_emmet_install_global = 0
```

### 操作

- `div>ul>li` + `<C-y>,`: `>` 生成子节点
    
    html
    
    ![](https://www.hanleylee.com/img/copyCodeBtn.svg)
    
    ```
      <div>
          <ul>
              <li></li>
          </ul>
      </div>
    ```
    
- `div+p+bq` + `<C-y>,`: `+` 生成兄弟节点
    
    html
    
    ![](https://www.hanleylee.com/img/copyCodeBtn.svg)
    
    ```
      <div></div>
      <p></p>
      <blockquote></blockquote>
    ```
    
- `div+div>p>span+em^bq` + `<C-y>,`: `^` 与 `>` 相反, 在父节点生成新节点
    
    html
    
    ![](https://www.hanleylee.com/img/copyCodeBtn.svg)
    
    ```
      <div></div>
      <div>
          <p><span></span><em></em></p>
          <blockquote></blockquote>
      </div>
    ```
    
- `div+div>p>span+em^^^bq` + `<C-y>,`: 使用 n 个 `^`, 就可以在第 n 父级生成新的节点
    
    html
    
    ![](https://www.hanleylee.com/img/copyCodeBtn.svg)
    
    ```
      <div></div>
      <div>
          <p><span></span><em></em></p>
      </div>
      <blockquote></blockquote>
    ```
    
- `ul>li*5` + `<C-y>,`: 使用 `*` 生成多个相同元素
    
    html
    
    ![](https://www.hanleylee.com/img/copyCodeBtn.svg)
    
    ```
      <ul>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
      </ul>
    ```
    
- `div>(header>ul>li*2>a)+footer>p` + `<C-y>,`: 圆括号 `()` 是 Emmet 的高级用法, 用来实现比较复杂的 DOM 结构
    
    html
    
    ![](https://www.hanleylee.com/img/copyCodeBtn.svg)
    
    ```
      <div>
          <header>
              <ul>
                  <li><a href=""></a></li>
                  <li><a href=""></a></li>
              </ul>
          </header>
          <footer>
              <p></p>
          </footer>
      </div>
    ```
    
- `(div>dl>(dt+dd)*3)+footer>p` + `<C-y>,`: 还可以嵌套使用圆括号 `()`
    
    html
    
    ![](https://www.hanleylee.com/img/copyCodeBtn.svg)
    
    ```
      <div>
          <dl>
              <dt></dt>
              <dd></dd>
              <dt></dt>
              <dd></dd>
              <dt></dt>
              <dd></dd>
          </dl>
      </div>
      <footer>
          <p></p>
      </footer>
    ```
    
- `div#header+div.page+div#footer.class1.class2.class3` + `<C-y>,`: Emmet 给元素添加 ID 和 CLASS 的方法和 CSS 的语法类似
    
    html
    
    ![](https://www.hanleylee.com/img/copyCodeBtn.svg)
    
    ```
      <div id="header"></div>
      <div class="page"></div>
      <div id="footer" class="class1 class2 class3"></div>
    ```
    
- `td[title="Hello world!" colspan=3]` + `<C-y>,`: 使用 `[attr]` 标记来添加自定义属性
    
    html
    
    ![](https://www.hanleylee.com/img/copyCodeBtn.svg)
    
    ```
      <td title="Hello world!" colspan="3"></td>
    ```
    
- `ul>li.item$*5` + `<C-y>,`: 使用 `$` 操作符可以对重复元素进行有序编号
    
    html
    
    ![](https://www.hanleylee.com/img/copyCodeBtn.svg)
    
    ```
       <ul>
           <li class="item1"></li>
           <li class="item2"></li>
           <li class="item3"></li>
           <li class="item4"></li>
           <li class="item5"></li>
       </ul>
    ```
    
- `ul>li.item$$$*5` + `<C-y>,`: 还可以用多个 `$` 定义编号的格式
    
    html
    
    ![](https://www.hanleylee.com/img/copyCodeBtn.svg)
    
    ```
      <ul>
          <li class="item001"></li>
          <li class="item002"></li>
          <li class="item003"></li>
          <li class="item004"></li>
          <li class="item005"></li>
      </ul>
      <ul>
          <li class="item001"></li>
          <li class="item002"></li>
          <li class="item003"></li>
          <li class="item004"></li>
          <li class="item005"></li>
      </ul>
    ```
    
- `ul>li.item$@-*5` + `<C-y>,`: 使用 `@` 修饰符可以改变编号的格式, 在 `$` 后面添加 `@-` 可以改变编号顺序
    
    html
    
    ![](https://www.hanleylee.com/img/copyCodeBtn.svg)
    
    ```
       <ul>
           <li class="item4"></li>
           <li class="item3"></li>
           <li class="item2"></li>
           <li class="item1"></li>
           <li class="item0"></li>
       </ul>
    ```
    
- `ul>li.item$@3*5` + `<C-y>,`: 在 `$` 后面添加 `@N` 可以改变编号基数
    
    html
    
    ![](https://www.hanleylee.com/img/copyCodeBtn.svg)
    
    ```
      <ul>
          <li class="item3"></li>
          <li class="item4"></li>
          <li class="item5"></li>
          <li class="item6"></li>
          <li class="item7"></li>
      </ul>
    ```
    
- `ul>li.item$@-3*5` + `<C-y>,`: 还可以组合使用上面的修饰符
    
    html
    
    ![](https://www.hanleylee.com/img/copyCodeBtn.svg)
    
    ```
      <ul>
          <li class="item7"></li>
          <li class="item6"></li>
          <li class="item5"></li>
          <li class="item4"></li>
          <li class="item3"></li>
      </ul>
    ```
    
- `a{click}+b{here}` + `<C-y>,`: Emmet 使用 `Text:{}` 给元素添加文本内容
    
    html
    
    ![](https://www.hanleylee.com/img/copyCodeBtn.svg)
    
    ```
      <a href="">click</a>
      <b>here</b>
    ```
    
- `a>{click}+b{here}` + `<C-y>,`:
    
    html
    
    ![](https://www.hanleylee.com/img/copyCodeBtn.svg)
    
    ```
      <a href="">click<b>here</b></a>
    ```
    
- `p>{Click }+a{here}+{ to continue}` + `<C-y>,`:
    
    html
    
    ![](https://www.hanleylee.com/img/copyCodeBtn.svg)
    
    ```
      <p>
          Click
          <a href="">here</a>
           to continue
      </p>
    ```
    
- `#page>div.logo+ul#navigation>li*5>a{Item $}` + `<C-y>,`:
    
    html
    
    ![](https://www.hanleylee.com/img/copyCodeBtn.svg)
    
    ```
       <div id="page">
           <div class="logo"></div>
           <ul id="navigation">
               <li><a href="">Item 1</a></li>
               <li><a href="">Item 2</a></li>
               <li><a href="">Item 3</a></li>
               <li><a href="">Item 4</a></li>
               <li><a href="">Item 5</a></li>
           </ul>
       </div>
    ```
    

### 快捷键

- `<Ctrl-y>,`: 展开简写式
- `<Ctrl-y>d`: Balance a Tag Inward(选中包围的标签?)
- `<Ctrl-y>D`: Balance a Tag Outward
- `<Ctrl-y>n`: 进入下个编辑点
- `<Ctrl-y>N`: 进入上个编辑点
- `<Ctrl-y>i`: 更新 `<img>` 图像尺寸
- `<Ctrl-y>m`: 合并文本行
- `<Ctrl-y>k`: 删除标签
- `<Ctrl-y>j`: 分解 / 展开空标签
- `<Ctrl-y>/`: 注释开关
- `<Ctrl-y>a`: 从 URL 生成 anchor 标签
- `<Ctrl-y>A`: 从 URL 生成引用文本

## [Markdown-preview](https://github.com/iamcco/markdown-preview.nvim)

一款在浏览器中预览 markdown 文件的插件

![](https://a.hanleylee.com/HKMS/2021-01-19-125822.jpg?x-oss-process=style/WaMa)

### 安装

vim

![](https://www.hanleylee.com/img/copyCodeBtn.svg)

```
Plug 'iamcco/markdown-preview.nvim', {'do': 'cd app & yarn install'}
```

运行 vim, 输入命令:PlugInstall

### 配置

vim

![](https://www.hanleylee.com/img/copyCodeBtn.svg)

```
map <F3>:MarkdownPreview<CR> "设置 F3 开启 Markdown 文件预览
let g:mkdp_auto_start = 0 "打开文件后自动弹出, 0 为否
let g:mkdp_auto_close = 1 "关闭文件后自动关闭预览窗口, 1 为是
let g:mkdp_refresh_slow = 1 "慢速预览, 修改后退出 insert 模式后方会刷新视图, 1 为是
let g:mkdp_open_to_the_world = 0 "开启公网链接, 0 为否
let g:mkdp_browser = '' "指定浏览器, 默认会跟随系统浏览器
let g:mkdp_port = '' " 指定端口, 默认随机端口
let g:mkdp_page_title = ' **${name}** ' "指定浏览器窗口标题, 默认为 Markdown 文件名
```

### 操作命令

- `:MarkdownPreview`: 开启预览
- `:MarkdownPreviewStop`: 停止预览
- `:MarkdownPreviewTroggle`: 开关预览

## [markdown2ctags](https://github.com/jszakmeister/markdown2ctags)

在窗口右侧显示 markdown 目录结构的一个插件, 此插件基于 ctags 和 tagbar(Tagbar 是一个著名的文档目录显示插件, 但是不支持 markdown, 此插件在 Tagbar 的基础上添加了对 markdown 的支持). 因此此插件必须同时安装以上两种插件方可正常工作

### 安装

1. 通过 `brew` 安装 `ctgs`
    
    vim
    
    ![](https://www.hanleylee.com/img/copyCodeBtn.svg)
    
    ```
       brew install ctags
    ```
    
2. 在 `.vimrc` 文件中添加 `Plug` 名称
    
    vim
    
    ![](https://www.hanleylee.com/img/copyCodeBtn.svg)
    
    ```
       Plug 'jszakmeister/markdown2ctags'
       Plug 'majutsushi/tagbar'
    ```
    

### 配置

vim

![](https://www.hanleylee.com/img/copyCodeBtn.svg)

```
"*****************   Tagbar   *************************************
"F4 开启和关闭
map <F4>:TagbarToggle<CR>
let g:tagbar_type_markdown = {
    \ 'ctagstype': 'markdown',
    \ 'ctagsbin': '~/.vim/plugged/markdown2ctags/markdown2ctags.py',
    \ 'ctagsargs': '-f - --sort=yes ',
    \ 'kinds': [
        \ 's:sections',
        \ 'i:images'
    \ ],
    \ 'sro': '|',
    \ 'kind2scope': {
        \ 's': 'section',
    \ },
    \ 'sort': 0,
\ }
```

### 使用

只要在 vim 界面中使用 `:TagbarToggle` 即可调出 Tagbar 界面, 即可显示 markdown 的目录结构.

## [markdownlint](https://github.com/DavidAnson/markdownlint)

一款 markdown 语法检查工具, 可以根据预设的规则进行 markdown 语法错误警告或提示, 可根据需要进行规则自定义

### 安装

shell

![](https://www.hanleylee.com/img/copyCodeBtn.svg)

```
brew install markdownlint-cli
```

### 使用

配合 ALE 插件一起使用

vim

![](https://www.hanleylee.com/img/copyCodeBtn.svg)

```
let g:ale_linters = {
            \   'c': ['clangd'],
            \   'swift': ['swiftlint'],
            \   'markdown': ['markdownlint'],
            \   'sh': ['shellcheck'],
            \   'zsh': ['shellcheck']
            \}
```

### 配置规则

在项目根目录下建立 `.markdownlint.json` 配置文件, 在其中对默认的规则进行配置, ale markdownlint 工具在被调用的时候会自动去查找该名称配置文件

json

![](https://www.hanleylee.com/img/copyCodeBtn.svg)

```
{
  "default": true,
  "MD013": false,
  "MD014": false,
  "MD024": false,
  "MD029": false,
  "MD033": false,
  "MD040": false,
  "no-hard-tabs": false,
  "no-inline-html": {
    "allowed_elements": [
      "a"
    ]
  }
}
```

## [fzf](https://github.com/junegunn/fzf.vim)

`fuzzy find`, 快速模糊搜索查找工具

> fzf.vim 与 终端工具 fzf 配合使用, 在 vim 中的 `:FZF` 与 `Files` 命令都会调用 `export FZF_DEFAULT_COMMAND='...'` 这个参数, 需要在 `.zshrc` 中配置好

### 安装

1. 在终端中安装 fzf 工具
    
    bash
    
    ![](https://www.hanleylee.com/img/copyCodeBtn.svg)
    
    ```
       brew install fzf
    ```
    
2. `~/.vimrc` 中安装 vim 的 `fzf` 插件

bash

![](https://www.hanleylee.com/img/copyCodeBtn.svg)

```
Plug 'junegunn/fzf', { 'do': { -> fzf#install() } }
Plug 'junegunn/fzf.vim'
```

### 配置使用

首先在 `.zshrc` 中配置终端中的 fzf 选项, 如下:

bash

![](https://www.hanleylee.com/img/copyCodeBtn.svg)

```
export FZF_DEFAULT_COMMAND="fd --hidden --follow -I --exclude={Pods,.git,.idea,.sass-cache,node_modules,build} --type f"
export FZF_DEFAULT_OPTS="
--color=dark
--color=fg:#707a8c,bg:-1,hl:#3e9831,fg+:#cbccc6,bg+:#434c5e,hl+:#5fff87
--color=info:#af87ff,prompt:#5fff87,pointer:#ff87d7,marker:#ff87d7,spinner:#ff87d7
--height 60%
--layout reverse
--preview-window 'hidden:right:60%'
--preview '(highlight -O ansi -l {} 2> /dev/null || cat {} || tree -N -C {}) 2> /dev/null | head -500'
--bind ',:toggle-preview'
--border
--cycle
"
export FZF_CTRL_T_COMMAND=$FZF_DEFAULT_COMMAND
export FZF_CTRL_T_OPTS=$FZF_DEFAULT_OPTS
export FZF_CTRL_R_OPTS="
--layout=reverse
--sort
--exact
--preview 'echo {}'
--preview-window down:3:hidden:wrap
--bind ',:toggle-preview'
--cycle
"

export FZF_ALT_C_OPTS="--preview 'tree -N -C {} | head -500'"
export FZF_TMUX_OPTS="-d 60%"
export FZF_COMPLETION_TRIGGER='**'
```

(fzf 可扩展性很高, 如果进行适当配置, 它可以在你进行路径跳转, 历史命令搜索, 文件搜索等方面给你极大的帮助!)

然后在 vim 中配置 fzf 插件的相关设置

vim

![](https://www.hanleylee.com/img/copyCodeBtn.svg)

```
nnoremap <Leader>fh:History<CR>
nnoremap <Leader>fl:Lines<CR>
nnoremap <Leader>fb:Buffers<CR>
nnoremap <Leader>ff:Files<CR>
nnoremap <Leader>fg:GFiles<CR>
nnoremap <Leader>f?:GFiles?<CR>
nnoremap <Leader>ft:Tags<CR>
nnoremap <Leader>fa:Ag<CR>
nnoremap <Leader>fc:Commits<CR>

let g:fzf_preview_window = 'right:60%' " Always enable preview window on the right with 60% width
let g:fzf_buffers_jump = 1 " [Buffers] Jump to the existing window if possible
" [[B]Commits] Customize the options used by 'git log'
let g:fzf_commits_log_options = '--graph --color=always --format="%C(auto)%h%d %s %C(black)%C(bold)%cr"'
let g:fzf_tags_command = 'ctags -R' " [Tags] Command to generate tags file
let g:fzf_commands_expect = 'alt-enter,ctrl-x' " [Commands] --expect expression for directly executing the command
let g:fzf_action = {
            \ 'ctrl-t': 'tab split',
            \ 'ctrl-x': 'split',
            \ 'ctrl-v': 'vsplit'
            \}
let g:fzf_layout = { 'down': '~60%' }
```

### 命令

- `:Files [path]`: 列出 path 路径下的所有文件 (功能等价于 `:FZF` 命令)
- `:Buffers`: 文件缓冲区切换
- `:Colors`: 选择 Vim 配色方案
- `:Tags [QUERY]`: 当前项目中的 Tag (等价于: ctags -R)
- `:BTags`: [QUERY] 当前活动缓冲区的标记
- `:Marks`: 所有 Vim 标记
- `:Windows`: 窗口
- `:Lines [QUERY]`: 在所有加载的文件缓冲区里包含目标词的所有行
- `:BLines [QUERY]`: 在当前文件缓冲区里包含目标词的行
- `:Locate PATTERN`: locate command output
- `:History`: v:oldfiles and open buffers
- `:History:`: 命令行命令历史
- `:History/`: 搜索历史
- `:Commands`: Vim 命令列表
- `:Maps`: 普通模式下的按键映射
- `:Snippets`: Snippets (UltiSnips)
- `:Commits`: Git commits (requires fugitive.vim)
- `:BCommits`: 查看与当前缓冲区有关的 commit
- `:GFiles [OPTS]`: Git files (git ls-files)
- `:GFiles?`: Git files (git status)
- `:Ag [PATTERN]`: ag search result (ALT-A to select all, ALT-D to deselect all)
- `:Rg [PATTERN]`: rg search result (ALT-A to select all, ALT-D to deselect all)
- `:Filetypes`: File types

## [YouCompleteMe](https://github.com/ycm-core/YouCompleteMe)

补全插件, 支持 `c`, `c++`, `java`, `python`, `PHP` 等多语言

### 安装

1. 先在 `.vimrc` 文件中添加 Plug 名称
    
    vim
    
    ![](https://www.hanleylee.com/img/copyCodeBtn.svg)
    
    ```
       Plug 'ycm-core/YouCompleteMe'`
    ```
    
2. 运行 vim, 输入命令 `:PlugInstall`

经历过上述 2 个步骤后, YouCompleteMe 插件还没法使用, 此时打开 Vim 时会看到如下的报错:

txt

![](https://www.hanleylee.com/img/copyCodeBtn.svg)

```
The ycmd server SHUT DOWN (restart with ‘:YcmRestartServer’). YCM core library not detected; you need to compile YCM before using it. Follow the
instructions in the documentation.
```

这是因为, YouCompleteMe 需要手工编译出库文件 ycm_core.so (以及依赖的 libclang.so) 才可使用. 假设使用 vim-plug 下载的 YouCompleteMe 源码保存在目录 ~/.vim/plugged/YouCompleteMe, 在该目录下执行

bash

![](https://www.hanleylee.com/img/copyCodeBtn.svg)

```
# 编译全部语言
./install.py --all  # 或者 /usr/bin/python install.py

# 或仅编译 C 族语言
./install.py --clang-completer
```

## [coc.nvim](https://github.com/neoclide/coc.nvim)

基于 lsp 的补全插件, 基本上支持 lsp 的语言都可以使用此插件进行补全. 此插件利用了 vsc 的插件生态, 方案比较成熟, 推荐使用 (作者是国人)

### 命令

- `CocInstall <plugin>`: 安装插件
- `CocUninstall`: 卸载插件
- `CocConfig`: 打开配置文件 (vim: `~/.vim/coc-settings.json` )
- `CocLocalConfig`: 打开本地配置文件
- `CocEnable`: 开启 coc
- `CocDisable`: 关闭
- `CocUpdate`: 升级插件
- `CocList <flag>`: 列出相关内容
    - `diagnostic`: 诊断信息
    - `extension`: 所有插件
    - `commands`: 所有可用命令
    - `outline`: 大纲
    - `symbols`: symbols

### 常用插件

vim

![](https://www.hanleylee.com/img/copyCodeBtn.svg)

```
coc-clangd
coc-cmake
coc-css
coc-diagnostic
coc-dictionary
coc-emoji
coc-flutter
coc-gitignore
coc-go
coc-highlight
coc-html
coc-java
coc-json
coc-julia
coc-markdownlint
coc-omni
coc-pyright
coc-r-lsp
coc-rome
coc-rust-analyzer
coc-sh
coc-snippets
coc-solargraph
coc-sourcekit
coc-syntax
coc-tabnine
coc-tag
coc-tsserver
coc-vetur
coc-vimlsp
coc-word
coc-yaml
coc-yank
```

## [ludovicchabant/vim-gutentags](https://github.com/ludovicchabant/vim-gutentags)

管理 tag 文件, tag 文件关乎着项目的引用与跳转, 因此是一个比较大的话题, 详细可以参考 [韦大的文章](https://zhuanlan.zhihu.com/p/36279445)

### 安装

1. 安装 `universal-ctags` 命令行程序
    
    bash
    
    ![](https://www.hanleylee.com/img/copyCodeBtn.svg)
    
    ```
       brew tap universal-ctags/universal-ctags
       brew install --HEAD universal-ctags
    ```
    
2. 安装 vim 插件 vim-gutentags
    
    vim
    
    ![](https://www.hanleylee.com/img/copyCodeBtn.svg)
    
    ```
       Plug 'ludovicchabant/vim-gutentags'
    ```
    

### 配置

vim

![](https://www.hanleylee.com/img/copyCodeBtn.svg)

```
"*****************   gutentags   *************************************
let g:gutentags_project_root = ['.root', '.svn', '.git', '.hg', '.project'] " gutentags 搜索工程目录的标志, 当前文件路径向上递归直到碰到这些文件 / 目录名
let g:gutentags_ctags_tagfile = '.tags' " 所生成的数据文件的名称
let g:gutentags_modules = [] " 同时开启 ctags 和 gtags 支持:
if executable('ctags')
    let g:gutentags_modules += ['ctags']
endif
if executable('gtags-cscope') && executable('gtags')
    let g:gutentags_modules += ['gtags_cscope']
endif

let g:gutentags_cache_dir = expand('~/.cache/tags') " 将自动生成的 ctags/gtags 文件全部放入 ~/.cache/tags 目录中
" 配置 ctags 的参数, 老的 Exuberant-ctags 不能有 --extra=+q, 注意
let g:gutentags_ctags_extra_args = ['--fields=+niazS', '--extra=+q']
let g:gutentags_ctags_extra_args += ['--c++-kinds=+px']
let g:gutentags_ctags_extra_args += ['--c-kinds=+px']
let g:gutentags_ctags_extra_args += ['--output-format=e-ctags'] " 如果使用 universal ctags 需要增加下面一行, 老的 Exuberant-ctags 不能加下一行
let g:gutentags_auto_add_gtags_cscope = 0 " 禁用 gutentags 自动加载 gtags 数据库的行为
```

### 为系统头文件生成 tags

默认情况下, 我们不能跳转到 `printf` 这类标准库中的方法中, 如果需要的话, 我们可以为系统标准库生成 tags, 然后将在 `.vimrc` 文件中为其进行指定, 这样即可跳转到系统的标准库头文件定义中了.

首先将系统中的头文件目录找出来, 然后使用 ctags 对目录中所有文件进行生成

bash

![](https://www.hanleylee.com/img/copyCodeBtn.svg)

```
ctags --fields=+niazS --extras=+q --c++-kinds=+px --c-kinds=+px --output-format=e-ctags -R -f ~/.vim/systags /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk/usr/include  ~/header
```

然后在 `vim` 中指定 tags 文件的路径即可

vim

![](https://www.hanleylee.com/img/copyCodeBtn.svg)

```
set tags+=~/.vim/systags
```

## [vim-fugitive](https://github.com/tpope/vim-fugitive)

vim 下最好的 git 插件, 同时也是 git 下最好的 vim 插件

### fugitive object

fugitive 插件操作的对象名为 `fugitive object`, 可以是文件也可以是 commit, 下面列举了一些 `fugitive object` 的表示方式

- `@`: The commit referenced by @ aka HEAD
- `master`: The commit referenced by master
- `master^`: The parent of the commit referenced by master
- `master...other`: The merge base of master and other
- `master:`: The tree referenced by master
- `./master`: The file named master in the working directory
- `:(top)master`: The file named master in the work tree
- `Makefile`: The file named Makefile in the work tree
- `@^:Makefile`: The file named Makefile in the parent of HEAD
- `:Makefile`: The file named Makefile in the index (writable)
- `@~2:%`: The current file in the grandparent of HEAD
- `:%`: The current file in the index
- `:1:%`: The current file’s common ancestor during a conflict
- `:2:#`: The alternate file in the target branch during a conflict
- `:3:#5`: The file from buffer #5 in the merged branch during a conflict
- `!`: The commit owning the current file
- `!:Makefile`: The file named Makefile in the commit owning the current file
- `!3^2`: The second parent of the commit owning buffer #3
- `.git/config`: The repo config file
- `:`: The |fugitive-summary| buffer
- `-`: A temp file containing the last |:Git| invocation’s output
- `<cfile>`: The file or commit under the cursor

### commnads

- `:Git`: 进入 summary 界面
- `:Git <arbitrary subcommand>`: 所有 command line 中 `git...` 后面可以使用的 subcommand 都可以使用, 比如 `:Git push`, `:Git push`, 甚至是在 `~/.gitconfig` 中的 `git alias`.
- `:Git <arbitrary subcommand> -p`: 与上命令相同, 不过会将命令结果单独开一个页面进行显示
- `:Git blame`: 对当前文件执行 `git blame` 命令
- `:Gclog[!]`: 将本 repo 的所有 log 输出至 quickfix, 并跳转至第一个 commit 的信息页面 (添加 `!` 可以防止跳转)
- `:Gllog[!]`: 与 `Gclog` 相同, 但是将结果输出至 `location list`
- `:[range]Gclog[!]`: 给定范围 (比如选中多行), 然后使用 `Gclog` 的话会将与范围相关的所有 commit 列出, 可以使用 `:0Gclog!` 来将与本文件相关的所有 commit 列出
- `:Gread [object]`: 如果不传 `fugitive object`, 则等同于 `git checkout -- file`, 如果传了, 则先将本 buffer 清空, 然后读取指定的 `fugitive-object` 内容到本 buffer 中
- `:Gwrite`: 类似于 `git add`
- `:Gcd [directory]`: cd 到本 root 的根目录下
- `:Gedit [object]`: edit 一个 `fugitive object`
- `:Gdiffsplit [object]`: 使用 `vimdiff` 查看给定的 `object` 与当前 `file` 的差异, 如果给定的是一个 `commit`, 那么会将该 commit 中的本文件与当前本文件进行差异对比
- `:Gvdiffsplit [object]`: 与 `:Gdiffsplit` 相同, 但是永远 split vertically.
- `:Ghdiffsplit [object]`: 与 `:Gdiffsplit` 相同, 但是永远 split horizontally.
- `:GMove {destination}` Wrapper around git-mv that renames the buffer afterward. Add a! to pass -f.
- `:GRename {destination}` Like |:GMove| but operates relative to the parent directory of the current file.
- `:GDelete`: 与 `git rm --cached **` 相同, Add a! to pass -f and forcefully discard the buffer.
- `:GRemove`: 与 `GDelete` 相同, 但是保持空 buffer 存在
- `:GBrowse`: 在 GitHub 中查看当前 file / commit

### 键位映射

- blame
    - `A`: resize to end of author column
    - `C`: resize to end of commit column
    - `D`: resize to end of date/time column
    - `gq`: close blame, then `:Gedit` to return to work tree version
    - `<CR>`: close blame, and jump to patch that added line (or directly to blob for boundary commit)
    - `o`: jump to patch or blob in horizontal split
    - `O`: jump to patch or blob in new tab
    - `p`: jump to patch or blob in preview window
    - `-`: reblame at commit
    - `~`: reblame at [count]th first grandparent
    - `P`: reblame at [count]th parent (like HEAD^[count])
- stage/unstaging
    - `s`: Stage (add) the file or hunk under the cursor.
    - `u`: Unstage (reset) the file or hunk under the cursor.
    - `-`: Stage or unstage the file or hunk under the cursor.
    - `U`: Unstage everything.
    - `X`: Discard the change under the cursor.
    - `=`: Toggle an inline diff of the file under the cursor.
    - `>`: Insert an inline diff of the file under the cursor.
    - `<`: Remove the inline diff of the file under the cursor.
    - `gI`: Open.git/info/exclude in a split and add the file under the cursor. Use a count to open.gitignore.
    - `I`: Invoke |:Git| add –patch or reset –patch on the file
    - `P`: under the cursor. On untracked files, this instead
    - `gq`: Close the status buffer.
- diff
    - `dd`: Perform a |:Gdiffsplit| on the file under the cursor.
    - `dv`: Perform a |:Gvdiffsplit| on the file under the cursor.
    - `ds`: Perform a |:Ghdiffsplit| on the file under the cursor.
- navigation
    - `<CR>`: Open the file or |fugitive-object| under the cursor. In a blob, this and similar maps jump to the patch from the diff where this was added, or where it was removed if a count was given. If the line is still in the work tree version, passing a count takes you to it.
    - `o`: Open the file or `fugitive-object` under the cursor in a new split.
    - `gO`: Open the file or `fugitive-object` under the cursor in a new vertical split.
    - `O`: Open the file or `fugitive-object` under the cursor in a new tab.
    - `p`: Open the file or `fugitive-object` under the cursor in a preview window. In the status buffer, 1p is required to bypass the legacy usage instructions.
    - `~`: Open the current file in the [count]th first ancestor.
    - `P`: Open the current file in the [count]th parent.
    - `C`: Open the commit containing the current file.

### 常用流程

- 查看当前 head 的 diff

`:Gdiffsplit HEAD`

- 查看当前 file 的所有相关 commit

`:0Gclog!`

- 查看当前 file 之前某个版本与现在版本的差异
    
    1. `:0Gclog!` 列出所有本 file 相关的 commit
    2. `enter` 进入需要对比的 commit
    3. `Gdiffsplit HEAD` 与当前 `HEAD` 对比差异
    
    > 我们也可以直接找出需要对比的 commit hash, 让后直接使用 `Gdiffsplit commit_hash` 来进行对比. 当进行 diff 对比时, 永远是旧的 commit 信息列在屏幕左侧, 新的 commit 信息列在右侧
    

## [gv.vim](https://github.com/junegunn/gv.vim)

一款基于 `fugitive` 的查看 vim commit 树形图的工具

### command

- `:GV`: to open commit browser
- `:GV!`: will only list commits that affected the current file
- `:GV?`: fills the location list with the revisions of the current file

### map

- `o` / `<cr>` on a commit to display the content of it
- `o` / `<cr>` on commits to display the diff in the range
- `O`: opens a new tab instead
- `gb`: for:Gbrowse
- `]]`: and [[ to move between commits
- `.`: to start command-line with:Git [CURSOR] SHA à la fugitive
- `q`: or gq to close

## [vim-surround](https://github.com/tpope/vim-surround)

一款超级强大的快速添加 / 删除 / 改变包围符号的神器

### 安装

vim

![](https://www.hanleylee.com/img/copyCodeBtn.svg)

```
Plug 'tpope/vim-surround'
```

### 命令

- `ds`: 删除包围符号
- `cs`: 改变包围符号
- `ysw`: 当前至下一个词尾添加一个包围符号
- `ysW`: 当前至至下一个空格添加一个包围符号
- `ySw`: 当前至下一个词尾添加一个包围符号并将焦点移至下一行
- `ySW`: 当前至下一个空格添加一个包围符号并将焦点移至下一行
- `yss)`: 整行添加包围符号 `()`
- `ysiw)`: 为当前光标下单词添加包围符号 `()`
- `S"`: Visual 模式下对选中区域添加包围符号 `"`
- `gS"`: Visual 模式下对选中区域进行换行并添加包围符号
- `⌃-s`: Insert 模式下插入包围符号
- `⌃-s, ⌃-s`: Insert 模式下在插入包围符号并将焦点移至下一行
- `dst`: 删除 html/xml 的标签内部的所有字符
- `cst`: 删除 html/xml 的标签内部的所有字符并进入插入模式
- `ysa<'`: 在 `<>` 包裹的范围上加符号 `'`

### 范例

txt

![](https://www.hanleylee.com/img/copyCodeBtn.svg)

```
| Old text              | Command  | New text                    |
| :-------------------: | :-----:  | :-----------------------:   |
| "Hello *world!"       | ds"      | Hello world!                |
| [123+4*56]/2          | cs])     | (123+456)/2                 |
| "Look ma, I'm *HTML!" | `cs"` | `Look ma, I'm HTML!` |
| if *x>3 {             | ysW(     | if ( x>3 ) {                |
| my $str = *whee!;     | vlllls'  | my $str = 'whee!';          |
| Yo!*       | dst      | Yo!                         |
| Yo!*       | `cst` | `Yo!`                |
```

## [nerdcommenter](https://github.com/preservim/nerdcommenter)

快速注释插件

### 安装

bash

![](https://www.hanleylee.com/img/copyCodeBtn.svg)

```
Plug 'preservim/nerdcommenter'
```

### 命令

- `<leader>cc`: NERDCommenterComment, 注释当前行或所选择行 (文本)
- `<leader>cu`: NERDCommenterUncomment, 取消当前所处位置的注释状态 Uncomments the selected line(s).
- `<leader>ci`: NERDCommenterInvert, 反转所选择行的注释状态 (逐个地反转) `仅支持行`
- `<leader>c<space>`: NERDCommenterToggle (反) 激活所选择行的注释状态, 依据最顶部行的注释状态进行判断, 执行命令后, 所选择行的注释状态均为最顶部行注释状态的相反状态. `仅支持行`
- `<leader>cn`: NERDCommenterNested, 与 cc 相同, 不过嵌套地进行注释
- `<leader>cs`: NERDCommenterSexy, 将当前选择文本以块的方式进行注释 (即在选择文本的上方与下方加上单行注释) `仅支持行`
- `<leader>cy`: NERDCommenterYank, 与 cc 完全相同, 不过会先进行复制操作
- `<leader>c$`: NERDCommenterToEOL Comments the current line from the cursor to the end of line.
- `<leader>cA`: NERDCommenterAppend, Adds comment delimiters to the end of line and goes into insert mode between them.
- `<leader>ca`: NERDCommenterAltDelims Switches to the alternative set of delimiters.
- `<leader>cm`: NERDCommenterMinimal, Comments the given lines using only one set of multipart delimiters.

## [tpope/vim-commentary](https://github.com/tpope/vim-commentary)

快速注释插件, 相比于 `nerdcommenter` 更加简洁实用

### 安装

bash

![](https://www.hanleylee.com/img/copyCodeBtn.svg)

```
Plug 'tpope/vim-commentary'
```

### 命令

- `gcc`: 注释或反注释
- `gcap`: 注释一段
- `gc`: visual 模式下直接注释所有已选择的行

## [terryma/vim-multiple-cursors](https://github.com/terryma/vim-multiple-cursors)(已废弃, 推荐使用 [vim-visual-multi](https://www.hanleylee.com/articles/usage-of-vim-editor-plugin/#vim-visual-multi))

实现真正的多光标的一个插件, vim 的 visual block 模式并不是多光标, 如果想将 visual block 模式下被选中的多行的当前单词推进到每个单词的末尾, 那么就需要使用到多光标的概念.

> 我理解的此多光标插件的使用分为两种状态
> 
> - 从 normal 模式直接使用 `<C-n>` 进入多光标状态并选中当前光标下的单词, 然后再次使用 `<C-n>` 选择下一个, `<C-x>` 跳过当前符合的单词, 最后进行插入修改等操作
> - 从 visual 或 visual block 模式下使用 `<C-n>` 进入直接添加光标到当前所有行的选中单词处, 然后移动光标, 在合适位置进行进行插入修改等操作, 最后 esc 两次退出

### 安装

bash

![](https://www.hanleylee.com/img/copyCodeBtn.svg)

```
Plug 'terryma/vim-multiple-cursors'
```

### 命令

- `<C-n>`: 进入多光标状态 / 或选择下一个符合当前选择的单词
- `<C-x>`: 跳过当前候选
- `<C-p>`: 移除当前单词处的光标及选择状态跳转到上一个光标处

vim

![](https://www.hanleylee.com/img/copyCodeBtn.svg)

```
let g:multi_cursor_use_default_mapping=0

" Default mapping
let g:multi_cursor_start_word_key      = '<C-n>'
let g:multi_cursor_select_all_word_key = '<A-n>'
let g:multi_cursor_start_key           = 'g<C-n>'
let g:multi_cursor_select_all_key      = 'g<A-n>'
let g:multi_cursor_next_key            = '<C-n>'
let g:multi_cursor_prev_key            = '<C-p>'
let g:multi_cursor_skip_key            = '<C-x>'
let g:multi_cursor_quit_key            = '<Esc>'
```

## [vim-visual-multi](https://github.com/mg979/vim-visual-multi)

### 安装

vim

![](https://www.hanleylee.com/img/copyCodeBtn.svg)

```
Plug 'mg979/vim-visual-multi', {'branch': 'master'}
```

### Maps

- `<C-n>`: 选择当前光标所在的单词, 进入 `V-M` (visual multi) 模式
- `<C-Down>` / `<C-Up>`: 创建垂直光标选区
- `<S-Arrows>`: 一次创建一个字符选区
- `n` / `N`: 选择下一个出现的相同字符
- `[/` / `]`: 跳转到上一个 / 下一个选区处
- `q`: 跳过当前并选择下一个出现的地方
- `Q`: 移除当前的选取
- `i` / `a` / `I` / `A`: 进入插入模式
- `<Tab>`: 在 `cursor mode` 与 `extend mode` 之间切换

> 在 `V-M` 模式中, 绝大多数 vim 命令都是可以使用的, 比如 `r`, `~`

## [ctrlsf.vim](https://github.com/dyng/ctrlsf.vim)

一个异步批量搜索替换工具

### 安装

vim

![](https://www.hanleylee.com/img/copyCodeBtn.svg)

```
Plug 'dyng/ctrlsf.vim'
```

### Commands

- `CtrlSF [pattern]`: 搜索匹配字符串

### Maps

- 在 `CtrlSF window` 中:
    - `<CR>` / `o`: 在相应的文件中打开相应的行
    - `<C-O>`: 在 `horizontal split window` 中打开
    - `t`: 在新 tab 中打开
    - `p`: 在 preview 中打开
    - `P`: 在 preview 中打开并将焦点移动到 preview 上
    - `O`: 与 `o` 相同, 但是保持 `CtrlSF` 开启
    - `T`: 与 `t` 相同, 但是保持 focus 在 CtrlSF 上
    - `M`: 在 `normal view` (sublime) 与 `compact view` (quick-fix) 切换
    - `q`: 退出 CtrlSF
    - `<C-j>`: 移动光标到下一个匹配处
    - `<C-k>`: 移动光标到上一个匹配处
    - `<C-c>`: 停止搜索
- 在 `preview window` 中
    - `q`: 关闭 `preview`

## [seoul256.vim](https://github.com/junegunn/seoul256.vim)

一套配色 vim 配色方案, 韩国人出品. 与之匹配的还有一个 iTerm 配色方案, 两者结合的比较好看

### 安装

在.vimrc 文件中添加 Plug 名称及设定:

vim

![](https://www.hanleylee.com/img/copyCodeBtn.svg)

```
Plug 'junegunn/seoul256.vim'
colo seoul256
let g:seoul256_background = 236 "设置背景颜色深度
set background=dark "设置背景颜色为黑色, 必须设置, 否则上面的数值设置没有意义
" seoul256 (dark):
"   Range:   233 (darkest) ~ 239 (lightest)
"   Default: 237
```

## [Goyo.vim](https://github.com/junegunn/goyo.vim)

一款专注写作的 vim 插件, 开启后四周空白, 更利于专注. 不适用于写代码和看代码

### 安装

1. 在.vimrc 文件中添加 Plug 名称及设定:
    
    vim
    
    ![](https://www.hanleylee.com/img/copyCodeBtn.svg)
    
    ```
       Plug 'junegunn/goyo.vim'
    ```
    

## 命令

- `:Goyo`: 进入专注模式
- `:Goyo!`: 退出专注模式, 或使用:q
- `:Goyo 90%`: 调整高度为窗口的 90%
- `:Goyo x30%`: 调整宽度为窗口的 30%
- `:Goyo 70%-10x90%+10%`: 调整区域宽为窗口 70%, 左边距向左移 10 单位, 高度为窗口 90%, 向下移动窗口的 10%

## [Limelight](https://github.com/junegunn/limelight.vim)

与 `Goyo`, `seoul256` 为同一开发者, 联合使用效果最佳. 不适用于写代码和看代码.

[官网](https://github.com/junegunn/limelight.vim)

### 安装

在 `.vimrc` 文件中添加 `Plug` 名称及设定:

vim

![](https://www.hanleylee.com/img/copyCodeBtn.svg)

```
Plug 'junegunn/limelight.vim'
let g:limelight_default_coefficient = 0.5 // 设置隐藏区域的黑暗度, 值越大越暗
let g:limelight_paragraph_span = 2 // 设置暗光的跨度, 暗光所能照亮的范围
let g:limelight_priority = -1 // 暗光优先级, 防止搜索的高亮效果被覆盖
autocmd! User GoyoEnter Limelight // 进入 Goyo 专注插件时, 同时开启暗光效果
autocmd! User GoyoLeave Limelight! // 离开 Goyo 专注插件时, 同时退出暗光效果
```

### 命令

- `:Limelight` // 进入 Limelight 状态
- `:Limelight!` // 退出 Limelight 状态
- `:Limelight0.3` //

## [XVim](https://github.com/XVimProject/XVim2)

如果你同时是一名 iOS 开发者, 那么 `XVim` 可以帮助你在 `Xcode` 中找回缺失的 `Vim` 操作, XVim 可以让 Xcode 像 vim 一样编辑.

> 由于 XVim 没有上架到 Mac App Store, 因此我们需要进入官网下载源码编译按照, 编译前需要对 Xcode 进行自签名, 否则我们自己编译出来的结果文件是不能安装到 Xcode 上的

[官网](https://github.com/XVimProject/XVim2)

### 安装

1. 对系统的代码证书重新生成
    
    [XVimProject/XVim2](https://github.com/XVimProject/XVim2/blob/master/SIGNING_Xcode.md)
    
2. 克隆源码仓库
    
    vim
    
    ![](https://www.hanleylee.com/img/copyCodeBtn.svg)
    
    ```
       git clone https://github.com/XVimProject/XVim2.git
    ```
    
3. 确认 xcode 内容点
    
    vim
    
    ![](https://www.hanleylee.com/img/copyCodeBtn.svg)
    
    ```
       xcode-select -p
       /Applications/Xcode.app/Contents/Developer
    ```
    
    如果有多个版本 Xcode, 此项会让你清楚你将安装 XVim 到哪一个版本上, 如果结果不是你想要的版本, 那么使用 `xcode-select -s <path-of-xcode>` 进行手动指定
    
4. make
    
    vim
    
    ![](https://www.hanleylee.com/img/copyCodeBtn.svg)
    
    ```
       cd XVim2
       make
    ```
    
5. 按照需要可生成 `.xvimrc` 文件 ( `.xvimrc` 文件必须放在用户主目录, 即 `.vimrc` 同级目录)
6. 重启 Xcode
7. 完成安装

### 使用

- `:run`: xcode 代码运行
- `:make`: 构建 xcode 代码
- `:xhelp`: 光标位置快速帮助
- `:xccmd`: 执行 xcode 菜单
- `⌃ g`: 打印当前行的位置

## Vimum

`Vimum` 是一款 `Chrome` 插件, 使用 vim 的模式概念让我们可以脱离鼠标访问浏览网页

- `gg`: 跳转到页面顶部
- `G`: 跳转到页面底部
- `gi`: 激活搜索框
- `j`: 页面向下滚动
- `k`: 页面向上滚动
- `u`: 页面向上翻页
- `d`: 页面向下翻页
- `r`: 刷新当前页面
- `H`: 页面回退到上一次历史
- `L`: 页面从历史记录中返回来
- `x`: 关闭页面
- `X`: 恢复被关闭的页面 (可多次重复)
- `f`: 显示页面上各个点击点的链接, 可以在当前页打开
- `F`: 显示页面上各个点击点的链接, 在新页面打开
- `gt`: 向右侧浏览下一个 tab
- `gT`: 向左侧浏览 tab
- `yf`: 拷贝页面上显示的链接
- `yy`: 拷贝当前网页的链接
- `yt`: 复制当前 tab
- `v`: 进入选择模式, 可选择文本, 第一次按下时会进入 `creat mode`, 选中起点后再次按下 `v` 将启用选择模式, 然后按下 `y` 来进行复制. 如果需要再次进入 `creat mode`, 可使用 `c` 按键. 如果在复制中要改变复制区域的起点, 可以使用 `o` 按键, 或者在使用 `/` 进行搜索确定焦点后进行 `v` 选择操作. 在选择模式中可使用 `w`, `b`, `h`, `j`, `k`, `l`, `e`, `$` 来进行移动
- `V`: 进入行选择模式, 可批量选择多行文本
- `o`: 键入搜索内容, 可在当前页面显示历史记录或打开网页链接或搜索新内容
- `O`: 兼容搜索内容, 在新页面给出与 o 键相同的结果
- `b`: 搜索书签, 并在当前页面打开
- `B`: 搜索书签, 并在新页面打开
- `T`: 在已打开的 tab 中进行搜索
- `/`: 搜索当前页面值, 使用 `⌘ F` 进行也页面搜索, `/` 不能搜索中文
- `n`: 选中下一个搜索结果
- `N`: 选中上一个搜索结果

## Vimari

如果你正在使用 `Safari`, 但是也想在浏览器中使用 vim 的操作, 那么 `Vimari` 就很适合你了, 因为 `Vimum` 不支持 `Safari`, 因此 `Vimari` 就诞生出来了, 虽然没有 `Vimum` 功能那么强大, 但是基本的浏览操作倒是都覆盖了

- `f`: 触发跳转
- `F`: 触发跳转 (新 tab 中打开链接)
- `h/j/k/l`: 移动
- `u`: 向上翻页
- `d`: 向下翻页
- `gg`: 跳转到页面顶部
- `G`: 跳转到页面底部
- `gi`: 跳转到第一个输入处
- `H`: 回到前一个历史页面
- `L`: 回到后一个历史页面
- `r`: 重载页面
- `w`: 下一个 tab
- `q`: 上一个 tab
- `x`: 关闭当前 tab
- `t`: 开启新 tab

## 其他插件

vim 丰富的插件生态是其一大特色, 本文只是起到抛砖引玉的功能, 更多实用的插件有待读者的发现. 以下列举了笔者常用的插件.

vim

![](https://www.hanleylee.com/img/copyCodeBtn.svg)

```
"============= File Management =============
Plug 'junegunn/fzf', { 'do': { -> fzf#install() } } " 模糊搜索
Plug 'junegunn/fzf.vim'                             " 模糊搜索
Plug 'embear/vim-localvimrc'                        " 用于针对工程设置 vimrc

" ============= Edit ===========
Plug 'ycm-core/YouCompleteMe'                       " 补全插件
Plug 'SirVer/ultisnips'                             " 自定义某些片段
Plug 'ludovicchabant/vim-gutentags'                 " 根据 ctags 或 gtags 生成 tags 进行使用, 自动管理
Plug 'skywind3000/gutentags_plus'                   " 提供
Plug 'Shougo/echodoc.vim'
Plug 'lyokha/vim-xkbswitch', {'as': 'xkbswitch'}    " 返回到 normal 模式时快速切换为英文输入法
Plug 'dense-analysis/ale'                           " 提示语法错误
Plug 'easymotion/vim-easymotion'                    " 空格任意跳转
Plug 'bronson/vim-visual-star-search'
Plug 'jiangmiao/auto-pairs'                         " 匹配括号
Plug 'dhruvasagar/vim-table-mode'                   " 自动表格, 使用 `\tm` 就进入了表格模式, 会进行自动对齐
Plug 'godlygeek/tabular'                            " 文本对齐, 使用:Tabularize /= 可以等号对齐多行
Plug 'terryma/vim-multiple-cursors'                 " 多行文本操作
Plug 'tpope/vim-commentary'                         " 快速注释, gcc
Plug 'tpope/vim-repeat'                             " 支持重复
Plug 'tpope/vim-surround'                           " 包围符号
Plug 'tpope/vim-unimpaired'

" ============= Appearance ============
Plug 'joshdick/onedark.vim'
Plug 'ap/vim-css-color'              " 显示 css 颜色
Plug 'machakann/vim-highlightedyank' " 使 yank 的文档半透明高亮
Plug 'mhinz/vim-signify'             " 显示当前行的 git 状态
Plug 'Yggdroot/indentLine'           " 显示缩进线
Plug 'itchyny/lightline.vim'         " 显示底部导航栏

"============== Function ==============
Plug 'majutsushi/tagbar'        " 显示文档的层级
Plug 'qpkorr/vim-renamer'       " 批量修改文件的神器, 使用:Ren 进行编辑与保存, 完成后退出即可
Plug 'Chiel92/vim-autoformat'   " 自动格式化文档
Plug 'skywind3000/asyncrun.vim' " 异步执行
Plug 'tpope/vim-fugitive'       " git 插件
Plug 'jiazhoulvke/jianfan'      " 简繁转换 Tcn, Scn
Plug 'simnalamburt/vim-mundo'   " 显示修改历史

"============== Language ==============
Plug 'plasticboy/vim-markdown'       " markdown 增强插件
Plug 'jszakmeister/markdown2ctags'   " markdown 层级显示
Plug 'iamcco/markdown-preview.nvim', {'do': 'cd app & yarn install'} " Markdown 实时预览
```

实际上以上所列出的插件很多仅由百余行的文件构成, 所以如果一些插件不能满足需求的话完全可以按照自己的想法写出一个适合自己的插件. 想法最重要, 做一件事只要有了想法就成功了 80%.

Vim 的替换查找是其核心功能, 功能极其强大, 通过其规则匹配, 可以很快速地完成我们很多需要大量人力操作的工作, 而且可对多文件使用查找/替换功能.

![](https://a.hanleylee.com/HKMS/2020-01-09-vim8.png?x-oss-process=style/WaMa)

本系列教程共分为以下五个部分:

1. [神级编辑器 Vim 使用-基础篇](https://www.hanleylee.com/usage-of-vim-editor-basic.html)
2. [神级编辑器 Vim 使用-操作篇](https://www.hanleylee.com/usage-of-vim-editor.html)
3. [神级编辑器 Vim 使用-插件篇](https://www.hanleylee.com/usage-of-vim-editor-plugin.html)
4. [神级编辑器 Vim 使用-正则操作篇](https://www.hanleylee.com/usage-of-vim-editor-regex.html)
5. [神级编辑器 Vim 使用-最后](https://www.hanleylee.com/usage-of-vim-editor-last.html)

## 正则匹配的模式

编程界实现了多种正则匹配引擎, vim 的正则匹配引擎是独有的, 其风格类似于 `POSIX BRE`, 但是我们可通过将其匹配模式设为:

- `\v`: very magic 模式; 此模式下 `(` 已经被转义, 如果要搜索 `(`, 必须转回原义: `\(`(此模式实际上最接近 Perl 的正则)
- `\V`: very nomagic 原义模式; 此模式下直接搜索`(` 即可搜索到 `(`
- `\m`: magic 模式, 默认, 不指定任何模式时使用的就是此模式. 此模式下仅部分字符有特殊含义, `(` 没有被转义, 仍然可通过 `(` 搜索到 `(`
- `\M`: nomagic 模式; 其功能类似于 `\V` 原义开关, 不同的是, 一些字符会自动具有特殊含义, 即符号 `^` 与 `$`

其实, very magic 和 very nomagic 搜索模式分别是 Vim 对正则表达式特殊字符的两种极端处理方式. 一个通用的原则是: **如果想按正则表达式查找, 就用模式开关 \v, 如果想按原义查找文本, 就用原义开关 \V**

本文只讨论默认模式下(`\m` 模式)下的正则匹配, 其他模式下的原理类似, 读者可自行研究

## 元字符

完整的正则表达式由两种字符构成:

- 元字符(metacharacters): 特殊字符 (special characters, 例如文件名例子中的 `*`)
- 文字(literal): 即普通文本字符 (normal text characters).

### 字符 / 字符组

- `.`: 表示匹配任意 **一个** 字符. 例: `c..l` 表示任意以 c 开头, 中间有两个任意字符, l 结尾的字段.
- `.*`: 表示匹配 **任意多个** 字符. 例: `c.*l` 表示任意以 c 开头 l 结尾的字段(不会将一个字段进行跨行处理, 因此非常智能, 很频繁使用)
- `\_.*`: 表示匹配 **任意多个** 字符(包括换行符!)
- `[adz]`: 匹配 `a`, `d`, `z` 中的任意 **一个**, 括号内也可是数字, 如 `[2-5]` 表示匹配 `2`, `3`, `4`, `5` 中的任意一个数字
- `[^a]`: 匹配除 `a` 以外的任意 **字符**
- `[a-c]`: 匹配 `a`, `b`, `c` 中的任意一个, 递增的顺序
- `\%[]`: a sequence of optionally matched atoms
- `\o`: 匹配八进制数字外的任意一个字符, 等同于 `[0-7]`
- `\O`: 匹配除八进制数字外的任意一个字符, 等同于 `[^0-7]`
- `\d`: 匹配十进制数字中的任意一个, 等同于 `[0-9]`
- `\D`: 匹配除十进制数字外的任意一个字符, 等同于 `[^0-9]`
- `\x`: 匹配十六进制数字中的任意一个, 等同于 `[0-9A-Fa-f]`
- `\X`: 匹配除十六进制数字外的任意一个字符, 等同于 `[^0-9A-Fa-f]`
- `\1`: back-referencing
- `\h`: head of word character(`a,b,c...z,A,B,C...Z,_`), 等同于 `[a-zA-Z_]`
- `\H`: non-head of word character, 等同于 `[^a-zA-Z_]`
- `\a`: alphabetical character, 等同于 `[a-zA-Z]`
- `\A`: non-alphabetical character, 等同于 `[^a-zA-Z]`
- `\l`: lowercase character
- `\L`: non-lowercase character
- `\u`: uppercase character
- `\U`: non-uppercase character
- `\i`: identifier character
- `\I`: like “\i”, but excluding digits
- `\k`: keyword character
- `\K`: like “\k”: but excluding digits
- `\f`: file name character
- `\F`: like “\f”, but excluding digits
- `\p`: match printable character
- `\p`: like “\p”, but excluding digits
- `\w`: 匹配一个单词字符, 等同于 `[a-zA-Z0-9_]`(对中文来说非常鸡肋)
- `\W`: 匹配除单词字符外的所有字符, 等同于 `[^\w]`. 因为在 vim 中中文全部不被认为是单词, 因此, 此匹配会选中所有中文字段.
- `\v`: 匹配一个垂直制表符
- `\t`: 代表制表符 tab , 可使用此方法将所有 tab 替换为空格
- `\s`: 配空白字段, 包含 tab 与空格, 等同于 `[\t\n\f\r\p{Z}]`; 在 pattern 中使用此查找空白, 在 string 中就可以直接使用空格或者 tab 来输入以替换了
- `\S`: 匹配非空白字段, 等同于 `[^\s]`
- `\n`: match an `<EOL>`; When matching in a string insead of buffer text a literal newline(Line Feed = `Ctrl-J` = `^J`, ASCII value is 10) character is matched
- `\r`: newline different from `<EOL>`:
    - `<CR>` if `<EOL>` = `<CR><LF>` | `<LF>`
    - `<LF>` if `<EOL>` = `<CR>`
- `\e`: match `<ESC>`
- `\b`: match `<BS>`
- `\_x`: where _x_ is any of the character above: character class with end-of-line included
- `\_s`: 匹配换行或空白(空格或 tab)
- `\_.`: 匹配任何字符(包括换行)
- `\_a`: 匹配换行或单词(因为是单词, vim 不会匹配中文)
- `/\%dnnn`: match specified **decimal character**(eg `/\%d123`)
- `/\%onnn`: match **octal character**(eg`/\%o053` will match char `+` which ascii code is `43`)
- `/\%xnn` / `/\%Xnn`: match **hex character**, point range is `00~FF, aka 00~255`(eg `/\%x2a`)
- `/\%unnnn`: match **multibyte character**, point range is `0000~FFFF, aka 0~65535`(eg `/\%u20ac`)
- `/\%Unnnnnnnn`: match **large multibyte character**, point range is `00000000~7FFFFFFFF, aka 65536~2147483647`(eg `/\%U12345678`)
- `/\%C`: match any composing characters

### 量词 multi

- `*`: 表示其前字符可以重复 _0~无数_ 次. 如 `/be*` 会匹配到 `b`, `be`, `bee` …, 因为 e 重复零次就是没有, 所以会返回 b, **greedy**
- `\+`: 表示其前字符必须重复 1~无数 次, 如 `/be\+` 会匹配到 `be`, `bee`, `beee` …, **greedy**
- `\?` 或 `\=`: 代表其前字符必须重复 0 或者 1 次, **greedy**
- `\{n,m}`: 其前字符必须重复 n 到 m 次, **greedy**. (`\{n,}` 表示右边界范围为无限, `{,m}` 表示左边界范围为0)
- `{n}`: n, **exactly**
- `{n,}`: at least n, **greedy**
- `{,m}`: 0 to m, **greedy**
- `{}`: 0 or more, **greedy**(same as `*`)
- `\{-n,m}`: 其前字符必须重复 n 到 m 次, **lazy**. (`\{-n,}` 表示右边界范围为无限, `{-,m}` 表示左边界范围为0)
- `\{-n}`: n, exactly
- `\{-n,}`: at least n, **lazy**
- `\{-,m}`: 0 to m, **lazy**
- `\{-}`: 与 `*` 相对, `.\{-}` 与 `.*` 一样表示匹配任意多个字符, **lazy**(其实就是 `\{-0,}` 的简写)

### 零长度断言

- `$`: 匹配行尾. 例: `/d.*$` 表示匹配到以 d 开头到行尾中的所有内容, `/123$` 表示以 123 结尾的所有字段
- `^`: 匹配行首. 例: `^.*d` 表示匹配到行首到 d 的所有内容, `/^123` 表示以 123 开头的字段
- `\%^`: beginning of file, zero-width match
- `\%$`: end of file, zero-width match
- `\_^`: the beginning of a line, zero-width
- `\_$`: the end of a line, zero-width
- `\zs`: set the beginning of the match, zero-width
- `\ze`: set the end of the match, zero-width
- `\<`: beginning of word, zero-width
- `\>`: end of word, zero-width
- `\%V`: inside visual area, zero-width
- `\%#`: cursor position, zero-width
- `\%'m'`: matches with the position of mark m, zero-width
- `\%<'m'`: matches before the position of mark m, zero-width
- `\%>'m'`: matches after the position of mark m, zero-width
- `\%l`: matches in a specific line, e.g. `/\%23l` / `/\%.l`, zero-width
- `\%<l`: matches above a line(lower line number), e.g. `/\%<23l`, `/\%<.l`, zero-width
- `\%>l`: matches below a line(lower line number), e.g. `/\%>23l`, `/\%>.l`, zero-width
- `\%c`: matches at the column e.g. `/\%23c`, zero-width
- `\%<c`: matches before the cursor column, e.g. `/\%<23c`, zero-width
- `\%>c`: matches before the cursor column, e.g. `/\%>23c`, zero-width
- `\%v`: matches at virtual column e.g. `/\%23v`, zero-width
- `\%<v`: matches before virtual column e.g. `/\%<23v`, zero-width
- `\%>v`: matches after virtual column e.g. `/\%>23v`, zero-width
- `\@=`: 正先行断言, 其右存在 Y 的 X, `X\(Y\)\@=`
- `\@!`: 负先行断言, 其右不存在 Y 的 X, `X\(Y\)\@!`
- `\@<=`: 正后发断言, 其左存在 Y 的 X, `\(Y\)\@<=X`
- `\@<!`: 负后发断言, 其左不存在 Y 的 X, `\(Y\)\@<!X`

### 分组与捕获

- `\(\)`: grouping, catching
- `\%\(\)`: grouping, but not catching
- `\|`: 或的意思, 表示只要符合其前或其后任意一个字符即可. 例: `/one\|two\|three` 表示匹配 one, two, three 中的任意一个. `end\(if\|while\|for\)` 表示会查找到 endif, endwhile, endfor 中的任意一个.
- `~`: matches the last given substitute string
- `\1`: 匹配到的第一个 `\(...\)`
- `\2`: 匹配到的第二个 `\(...\)`
- `&`: 它代表与搜索模式想匹配的整个文本, 即重现搜索串. 这在试图避免重复输入文本时很有用(for substitute)
- `\0`: 同 `&`(for substitute)

### Modifier

- `\m`: ‘magic’ on for the following chars in the pattern
- `\M`: ‘magic’ off for the following chars in the pattern
- `\v`: the following chars in the pattern are “very magic”
- `\V`: the following chars in the pattern are “very no magic”
- `\%#=`: select regexp engine, zero-width
- `\C`: 区分大小写地查找或替换, 例: `/\CText` 表示只会查找`Text`, 不会查找 `text` 或 `tExt` 等
- `\c`: 不区分大小写地查找替换(已经在 vim 中设置了默认不区分了)
- `\l`: next character made lowercase(for substitute)
- `\u`: next character made uppercase(for substitute)
- `\U`: 将跟在后面的匹配串全部变成大写, 直至 `\E`(for substitute)
- `\L`: 将跟在后面的匹配串全部变成小写, 直至 `\E`(for substitute)
- `\E` / `\e`: end of `\U` and `\L`(for substitute)

### POSIX

除了 [正则表达式学习](https://www.hanleylee.com/learning-regular-expression.html#POSIX-%E5%AD%97%E7%AC%A6%E7%B1%BB) 中列出的 12 种字符类, vim 还支持以下字符类

|Pattern|Description|Example|
|---|---|---|
|`[:return:]`|`[:return:]`|the `<CR>` character|
|`[:tab:]`|`[:tab:]`|the `<Tab>` character|
|`[:escape:]`|`[:escape:]`|the `<Esc>` character|
|`[:backspace:]`|`[:backspace:]`|the `<BS>` character|
|`[:ident:]`|`[:ident:]`|identifier character (same as “\i”)|
|`[:keyword:]`|`[:keyword:]`|keyword character (same as “\k”)|
|`[:fname:]`|`[:fname:]`|file name character (same as “\f”)|

### 转义

如上所述, `.`, `*`, `[`, `]`, `^`, `%`, `/`, `?`, `~`, `$` 等字符有特殊含义, 如果对这些进行匹配, 需要考虑添加转义字符 `\` 进行转义

> - inside a single quoted string two single quotes `''` represent one single quote `'`.

## 查找

### 查找逻辑

**`/pattern/[offset]`**

### Search offset

- `[num]`: `num` line downwards, in column 1
- `+[num]`: `num` line downwards, in column 1
- `-[num]`: `num` line upwards, in column 1
- `e[+num]`: `num` characters to the right of the _end_ of the match, in column 1
- `e[-num]`: `num` characters to the left of the _end_ of the match, in column 1
- `s[+num]`: `num` characters to the rigth of the _start_ of the match, in column 1
- `s[-num]`: `num` characters to the left of the _start_ of the match, in column 1
- `b[+num]`: same as `s[+num]`
- `b[-num]`: same as `s[-num]`

### 查找实例

- `/view`: 全文查找 view 关键字 (n 为向下方向)
- `?view`: 全文查找 view 关键字 (n 为向上方向)
- `/\cview`: 全文查找 view 关键字(大小写不敏感)
- `:100,235g/foo/#`: 在区间 `100 ~ 235` 搜索, 在控制台输出结果
- `:100,235il foo`: 同上
- `/view/e`: 默认的查找会将光标置于单词首部, 使用 `e` 保证光标位于尾部, 方便 `.` 命令的调用
- `/view/s-2`: cursor set to **start** of match minus 3
- `/view/+3`: find view **move** cursor 3 lines down
- `/^joe.*fred.*bill/`: find joe **and** bill(joe at start of line)
- `/^[A-J]`: search for lines beginning with one or more `A-J`
- `/begin\_.*end`: search over possible multiple lines
- `/fred\_s*joe`: any whitespace including newline
- `/fred\|joe`: search for fred **or** joe
- `/.*fred\&.*joe`: search for fred **and** joe in any order
- `/\<fred\>/`: search fro fred but not alfred or frederick
- `/\<\d\d\d\d\>`: search for exactly 4 digit numbers
- `/\D\d\d\d\d\D`: search for exactly 4 digit numbers
- `/\<\d\{4}\>`: same thing
- `/\([^0-9]\|^\)%.*%`: search for absence of a digit or beginning of line
- `/^\n\{3}`: find 3 empty lines
- `/^str.*\nstr`: find 2 successive lines starting with str
- `/\(^str.*\n\)\{2}`: find 2 successive lines starting with str
- `/\(fred\).*\(joe\).*\2.*\1`
- `/^\([^,]*,\)\{8}`
- `:vmap // y/<C-R>"<CR>`: search for visually highlighted text
- `:vmap <silent> // y/<C-R>=escape(@", '\\/.*$^~[]')<CR><CR>`: with spec chars
- `/<\zs[^>]*\ze>`: search for tag contents, ignoring chevrons
- `/<\@<=[^>]*>\@=`: search for tag contents, ignoring chevrons
- `/<\@<=\_[^>]*>\@=`: search for tags across possible multiple lines
- `/\%(defg\)\@<!abc`: anything starting with `abc` that’s not (immediately) preceeded by `defg`
- `/\%(defg.*\)\@<!abc`: match `abc` as long as it’s not part of `defg.*abc`
- `/\%(defg.*\)\@<!abc \%(.*defg\)\@!`: Matching `abc` only on lines where `defg` doesn’t occur is similar
- `/<!--\_p\{-}-->`: search for multiple line comments
- `/fred\_s*joe/`: any whitespace including newline
- `/bugs\(\_.\)*bunny`: bugs followed by bunny anywhere in file
- `/\c\v([^aeiou]&\a){4}`: search for 4 consecutive consonants
- `/\%>20l\%<30lgoat`: search for goat between lines 20 and 30
- `/^.\{-}home.\{-}\zshome/e`: match only the 2nd occurence in a line of home
- `/^\(.*tongue.*\)\@!.*nose.*$`
- `\v^((tongue)@!.)*nose((tongue)@!.)*$`
- `.*nose.*\&^\%(\%(tongue\)\@!.\)*$`
- `:v/tongue/s/nose/&/gic`
- `'a,'bs/extrascost//gc`: trick: restrict search to between markers
- `/integ<C-L>`: Control-L to complete term
- `//e`: 匹配 `pattern` 为空则直接重用上次的逻辑进行查找
- `/\<f\>`: 使用 `<` 与 `>` 限定词首与词尾, 保证只查找单词 `f`
- `/^\n\{3}`: 查找三个空行
- `/\s\{2,}`: 查找 2 个以上的空格
- `/he\zsllo`: 查找 `hello` 并将 `llo` 作为匹配点进行高亮
- `/abc\(defg\)\@!`: 只查找 `abc`, 且后面不跟随 `defg`, 否则不匹配, `\@!` 表示 `negative look-ahead assertion`, 查看帮助 `help \@!`
- `/printer_\@!`: find any `printer` that is not followed by an `_`
- `/_\@<!printer`: find any `printer` that is not begin with an `_`
- `` `[^`]\_.\{-0,}` ``: 以 `` ` `` 开头, 以 `` ` `` 结尾, 且中间内容超过一个字符, 且内容可以跨行
- `/\%d123`: 查找 unicode 字符点为 20 的字符(20 为十六进制, 对应十进制为 32, 起 ASCII 值为 `SP`, 也就是空格)
- `/\%x2a`
- `/\%o040`
- `/\%u20`: 查找 unicode 字符点为 20 的字符(20 为十六进制, 对应十进制为 32, 起 ASCII 值为 `SP`, 也就是空格)
- `/\%u6c60`: 查找 unicode 字符点为 6c60 的字符
- `/\%U65536`: 查找 unicode 字符点为 65536 的字符

还有一种是使用 `global` 命令: `:g/pattern/d` , 含义是对 patter 进行匹配搜索, 然后执行命令 `delete`, 也是基于查找的

### 查找时的常用操作

- `:noh`: 取消查找模式的高亮匹配
- `*`: 全文查找当前光标处单词 (n 为向下方向)
- `#`: 全文查找当前光标处单词 (n 为向上方向)
- `n`: 下一个列出的关键字
- `N`: 上一个列出的关键字
- `gn`: 进入面向字符的可视模式, 并选中下一项匹配
- `gN`: 进入面向字符的可视模式, 并选中上一项匹配
- `gUgn`: 使下一处匹配改为大写
- `<C-r><C-w>`: 根据当前查找模式下已经输入的内容结合全文进行自动补全
- `/<UP>`: 直接调用上次的查找逻辑.
- `/<DOWN>`: 直接调用下次的查找逻辑.
- `/<C-n>`: 直接调用下次的查找逻辑.
- `/<C-p>`: 直接调用上次的查找逻辑.
- `/<C-r>/`: 使用寄存器 `/` 将上次查找的值直接插入到当前模式中来

## 替换

### 替换逻辑

**`:[range]s/pattern/string/flags`**

- `range`: 范围
    - `无`: 默认光标所在的行
    - `.`: 光标所在的当前行
    - `N`: 第 N 行
    - `$`: 最后一行
    - `'a`: 标记 `a` 所在的行(使用 `ma` 标记的)
    - `.+1`: 当前光标的下面一行
    - `$-1`: 倒数第二行
    - `22,23`: 第22 ~ 23行
    - `1,$`: 第一行到最后一行
    - `1,.`: 第一行到当前行
    - `.,$`: 当前行到最后一行
    - `'a, 'b`: 标记 `a` 所在的行到 标记 `b` 所在的行
    - `%`: 所有行(与 `1,$` 等价)
    - `?str?`: 从当前位置向上搜索, 找到的第一个 str 所在的行(str 可以为正则表达式)
    - `/str/`: 从当前位置向下搜索, 找到的第一个 str 所在的行
    - `1,7` 指第一行至第七行. 也可以使用 `%` 代表当前的文章(也可以理解为全部的行), `#` 代表前一次编辑的文章(基本不用)
- `s`: 代表当前的模式为替换
- `/`: 作为分隔符, 如果确实要替换文中的 `/`, 那么可以使用 `#` 代替作为分隔符. 例如 `:s#vi/#vim#g`, 代表替换 `vi/` 为 `vim`, 常用的分隔符还有 `:`, `_`, `|`
- `pattern`: 要被替换掉的字符
- `string`: 将要使用的字符
- `flags`
    - `无`: 只对指定范围内的每一行的第一个匹配项进行替换
    - `g`: global, 整行替换(基本上是必加的, 否则只会替换每一行的第一个符合字符)
    - `c`: confirm, 每次替换前会询问
    - `e`: ignore, 忽略错误(默认找不到会提示 `pattern not found`, 但是如果设置 vim 设置批量替换命令的话某一个项未匹配到不能影响到下一项的执行, 可以使用此关键字, `:silent %s/x/y/g` == `:%s/x/y/ge` )
    - `i`: ignore, 不区分大小写
    - `I`: 区分大小写

### 变量替换

在表达式中可以使用 `\(` 与 `\)` 将表达式括起来, 然后既可在后面使用 `\1` `\2` 来依次访问由 `\(` 与 `\)` 包围起来的内容.

例: `:s/\(\w\+\)\s\+\(\w\+\)/\2\t\1` 表示将 data1 data2 修改为 data2 data1

### 替换实例

- `r`: 进入单字符替换模式
- `R`: 进入替换模式
- `:&`: 重复上次替换
- `:%&`: last substitute every line
- `:%&gic`: last substitute every line confirm
- `g%`: normal mode repeat last substitute
- `g&`: last substitute on all lines
- `&`: 直接使用 `&` 也是重复上次替换的意思
- `:s/vi/vim/`: 只替换当前行的第一个 vi 为 vim
- `:s/vi/vim/g`: 替换当前行的所有 vi 为 vim
- `:%s/vi/vim/g`: 替换全文所有 vi 为 vim
- `:%s/vi/vim/gi`: 替换全文所有 vi 为 vim, 大小写不敏感
- `:n,$s/vi/vim/gci`: 替换从第 n 行到结尾所有 vi 为 vim, 每次替换提示, 不区分大小写
- `:.,$s/vi/vim/gci`: 替换从当前行到结尾所有 vi 为 vim, 每次替换提示, 不区分大小写
- `:.,+3s/^/#`: 在当前行到下面三行添加 `#` 的注释
- `:g/^\s*$/d`: 删除所有空行
- `:g/^$/d`: 删除所有空行
- `:%s/\s*$//g`: 删除行尾空格
- `:%s/^\s*//g`: 删除行首空格
- `:215,237 s/\(.\)$/\1(自定义)/c`: 将 215 至 237 行尾部添加 `(自定义)`
- `:%s/^\n$//gc/`: 替换多个空行为一个空行
- `:s:\s\+$::`: a simple regexp I use quite often to clean up a text: it drops the blanks at the end of the line.
- `:122,250s/\(201\d*\)\.\(\d*\)\.\(\d*\)\s/\1-\2-\3_/gc`: 替换 `2017.12.31`类型的字段为`2017-12-31_`
- `:%s/\(\](http:.*com\/\)\(HK.*\))/\](https:\/\/a.hanleylee.com\/\2?x-oss-process=style\/WaMa)/gc`: 将`[](http: ....com)` 替换成 https 并且尾部带有样式参数
- `:%s/\(a.*bc\)\(<.*>\)\(xy.*z\)/\3\2\1/gc`: 使用缓冲块实现对前后区域匹配并翻转位置(需要时再理解)
- `:%s/hello/&, world/`: 将会把hello替换成hello, wolrd
- `:%s/.*/(&)/`: 将会把所有行用()包含起来
- `:s/world/\U&/`: 把 world 变成 WORLD
- `:%s ; /user1/tim;/home/time;g`: `/user1/tim`改为`/home/time`, 除了 `/` 字符外, 还可以使用除反斜杆 `\`, 双引号`"`, 和竖直线 `|` 之外的任何非字母表, 非空白字符作为分隔符, 在对路径名进行修改时, 这点尤其便利
- `:s`: 与 `:s//~/`相同, 重复上次替换
- `:%s/\<child\>/children/g`: 保证在 child 是个完整单词的情况下进行替换
- `:g/mg[ira]box/s/box/square/g`: 将 `mgibox routine, mgrbox routine, mgabox routine,` 中的 box 换为 square
- `:%s/fred/joe/igc`: general substitute command
- `:%s//joe/igc`: substitute your last replacement string
- `:%s/~/sue/igc`: substitute your last replacement string
- `:%s/\r//g`: delete DOS return `^M`
- `:%s/\r/\r/g`: turn DOS return `^M` into real returns
- `:%s= *$==`: delete end of line blanks
- `:%s= \+$==`: Same thing
- `:%s#\s*\r\?$##`: Clean both trailing spaces AND DOS returns
- `:%s#\s*\r*$##`: same thing
- `:%s/^\n\{3}//`: delete blocks of 3 empty lines
- `:%s/^\n\+/\r/`: compressing empty lines
- `:%s#.*\(\d\+hours\).*#\1#`: delete all but memorised string
- `:%s#><\([^/]\)#>\r<\1#g`: split jumbled up XML file into one tag per line [N]
- `:%s/</\r&/g`: simple split of html/xml/soap [N]
- `:%s#<[^/]#\r&#gic`: simple split of html/xml/soap but not closing tag [N]
- `:%s#<[^/]#\r&#gi`: parse on open xml tag [N]
- `:%s#\[\d\+\]#\r&#g`: parse on numbered array elements [1] [N]
- `ggVGgJ`: rejoin XML without extra spaces (gJ) [N]
- `:%s=\\n#\d=\r&=g`: parse PHP error stack [N]
- `:%s#^[^\t]\+\t##`: Delete up to and including first tab [N]
- `:'a,'bg/fred/s/dick/joe/igc`: VERY USEFUL
- `:%s= [^ ]\+$=&&=`: duplicate end column
- `:%s= \f\+$=&&=`: Dupicate filename
- `:%s= \S\+$=&&`: usually the same
- `:%s#example#& = &#gic`: duplicate entire matched string [N]
- `:%s#.*\(tbl_\w\+\).*#\1#`: extract list of all strings tbl_* from text [NC]
- `:s/\(.*\):\(.*\)/\2 : \1/`: reverse fields separated by
- `:%s/^\(.*\)\n\1$/\1/`: delete duplicate lines
- `:%s/^\(.*\)\(\n\1\)\+$/\1/`: delete multiple duplicate lines [N]
- `:%s/^.\{-}pdf/new.pdf/`: delete to 1st occurence of pdf only (lazy)
- `:%s#^.\{-}\([0-9]\{3,4\}serial\)#\1#gic`: delete up to 123serial or 1234serial [N]
- `:%s#\<[zy]\?tbl_[a-z_]\+\>#\L&#gc`: lowercase with optional leading characters
- `:%s/<!--\_.\{-}-->//`: delete possibly multi-line comments
- `:s/fred/<c-r>a/g`: sub “fred” with contents of register “a”
- `:s/fred/<c-r>asome_text<c-r>s/g`
- `:s/fred/\=@a/g`: better alternative as register not displayed
- `:s/fred/\=@*/g`: replace string with contents of paste register
- `:%s/\f\+\.gif\>/\r&\r/g | v/\.gif$/d | %s/gif/jpg/`
- `:%s/a/but/gie|:update|:next`: then use @: to repeat
- `:%s/goat\|cow/sheep/gc`: ORing (must break pipe)
- `:'a,'bs#\[\|\]##g`: remove [] from lines between markers a and b [N]
- `:%s/\v(.*\n){5}/&\r`: insert a blank line every 5 lines [N]
- `:s/__date__/\=strftime("%c")/`: insert datestring
- `:inoremap \zd <C-R>=strftime("%d%b%y")<CR>`: insert date eg 31Jan11 [N]
- `:%s:\(\(\w\+\s\+\)\{2}\)str1:\1str2:`
- `:%s:\(\w\+\)\(.*\s\+\)\(\w\+\)$:\3\2\1:`
- `:%s#\<from\>\|\<where\>\|\<left join\>\|\<\inner join\>#\r&#g`
- `:redir @*|sil exec 'g#<\(input\|select\|textarea\|/\=form\)\>#p'|redir END`
- `:nmap ,z :redir @*<Bar>sil exec 'g@<\(input\<Bar>select\<Bar>textarea\<Bar>/\=form\)\>@p'<Bar>redir END<CR>`
- `:%s/^\(.\{30\}\)xx/\1yy/`: substitute string in column 30 [N]
- `:%s/\d\+/\=(submatch(0)-3)/`: decrement numbers by 3
- `:g/loc\|function/s/\d/\=submatch(0)+6/`: increment numbers by 6 on certain lines only
- `:%s#txtdev\zs\d#\=submatch(0)+1#g`
- `:%s/\(gg\)\@<=\d\+/\=submatch(0)+6/`: increment only numbers gg\d\d by 6 (another way)
- `:let i=10 | 'a,'bg/Abc/s/yy/\=i/ |let i=i+1`: convert yy to 10,11,12 etc
- `:let i=10 | 'a,'bg/Abc/s/xx\zsyy\ze/\=i/ |let i=i+1` # convert xxyy to xx11,xx12,xx13
- `:%s/"\([^.]\+\).*\zsxx/\1/`
- `:vmap <leader>z :<C-U>%s/\<<c-r>*\>/`
- `:'a,'bs/bucket\(s\)*/bowl\1/gic`
- `:%s,\(all/.*\)\@<=/,_,g`: `replace all / with _ AFTER "all/"`
- `:s#all/\zs.*#\=substitute(submatch(0), '/', '_', 'g')#`
- `:s#all/#&^M#|s#/#_#g|-j!`: Substitute by splitting line, then re-joining
- `:%s/.*/\='cp '.submatch(0).' all/'.substitute(submatch(0),'/','_','g')/`: Substitute inside substitute
- `:%s/home.\{-}\zshome/alone`: substitute only the 2nd occurence of home in any line
- `:%s/.*\zsone/two/`: substitute only the last occurrence of one

替换时系统会对用户进行询问, 有 (`y/n/a/q/1/^E/^Y`)

- `y`: 表示同意当前替换
- `n`: 表示不同意当前 替换
- `a`: 表示替换当前和后面的并且不再确认
- `q`: 表示立即结束替换操作
- `1`: 表示把当前的替换后结束替换操作
- `^E`: 向上滚屏
- `^Y`: 向下滚屏,

## Global

global 语法有两种

1. `:[range]g/{pattern}/[cmd]`: 在 range 内搜索 pattern, 如果符合要求就执行 cmd
2. `:g/pattern1/,/pattern2/[cmd]`: 在 `/p1/`, `p2/` 之间执行 cmd

- `:g/re/d`: 删除所有匹配到 `re` 的行
- `:g/re/p`: 打印所有匹配到 `re` 的行
- `:g//d`: 使用上次的查找结果进行匹配然后删除
- `:g/^$/,/./-j`: reduce multiple blank to a single blank
- `:1,.g/^/''+m.|-j!`: 合并两块区域
- `:1,.g/^/''+m.|s/^/\t/|-j!`: 合并两块区域, 并在两块区域中添加分隔符
- `:10,20g/^/ mo 10`: reverse the order of the lines starting from the line 10 up to the line 20.
- `:'a,'b g/^Error/ . w >> errors.txt`: in the text block marked by `'a` and `'b` find all the lines starting with Error and copy (append) them to `errors.txt` file. Note: . (current line address) in front of the `w` is very important, omitting it will cause `:write` to write the whole file to `errors.txt` for every Error line found.
- `:g/^Error:/ copy $ | s /Error/copy of the error/`: will copy all Error line to the end of the file and then make a substitution in the copied line. Without giving the line address `:s` will operate on the current line, which is the newly copied line.
- `:g/^Error:/ s /Error/copy of the error/ | copy $`: here the order is reversed: first modify the string then copy to the end.
- `:v/re/d`: v 是 global 的反面, 等价于 `g!`, 只保留匹配到 `re` 的行
- `:g/TODO/yank A`: 将结果匹配到 `TODO` 的行复制到寄存器 `a` 的原内容尾部
- `:g/TODO/t$`: 将结果匹配到 `TODO` 的行复制到本缓冲区的尾部
- `:g/{/.+1,/}/-1 sort`: 会在每个 `{` 开始找, 然后在之后一直执行到 `}` 为止, 进行排序
- `:g/{/sil.+1,/}/-1 >`: 会在每个 `{` 开始找, 然后在之后一直执行到 `}` 为止, 进行缩进 (加入 sil 是为了屏蔽提示信息)
- `:g/从这里删除/.,$ d`: 从内容中搜出的第一个 `从这里删除` 开始, 一直删除到文章结尾
- `:g/^\(.*\)$\n\1$/d`: 去除重复行
- `:g/\%(^\1$\n\)\@<=\(.*\)$/d`: 去除重复行
- `:g/\%(^\1\>.*$\n\)\@<=\(\k\+\).*$/d`: 去除重复行
- `:g/gladiolli/#`: display with line numbers
- `:g/gred.*joe.*dick/`: display all lines fred, joe & dick
- `:g/\<fred\>/`: display all lines fred but not freddy
- `:g/^\s*$/d`: delete all blank lines
- `:g!/^dd/d`: delete lines not containing pattern
- `:v/^dd/d`: delete lines not containing pattern
- `:g/joe/,/fred/d`: not line based
- `:g/joe/,/fred/j`: join lines
- `:g/-----/.-10,.d`: delete string & 10 previous lines
- `:g/{/ ,/}/- s/\n\+\r/g`: delete empty lines but only between `{...}`
- `:v/\S/d`: delete empty lines
- `:v/./,/./-j`: compress empty lines
- `:g/^$/,/./-j`: compress empty lines
- `:g/<input\|<form/p`:ORing
- `:g/^/put_`: double space file (pu = put)
- `:g/^/m0`: reverse file(m = move)
- `:g/^/m$`: no effect!
- `:'a,'bg/^/m'b`: reverse a section a to b
- `:g/^t.`: duplicate every line
- `:g/fred/t$`: copy(transfer) lines matching fred to EOF
- `:g/stage/t'a`: copy(transfer) lines matching stage to marker a
- `:g/^chapter/t.|s/./-/g`: automatically underline selecting headings
- `:g/\(^I[^^I]*\)\{80}/d`: delete all lines containing at least 80 tabs
- `:g/^/ if line('.')%2|s/^/zz /`: perform a substitute on every other line
- `:'a,'bg/somestr/co/otherstr/`: co(py) or mo(ve)
- `:'a,'bg/str1/s/str1/&&&/|mo/str2/`: as above but also do a substitution
- `:%norm jdd`: delete every other line
- `:.,$g/^\d/exe "norm! \<c-a>"`: increment numbers “ incrementing numbers (type `<c-a>` as 5 characters)
- `:'a,'bg/\d\+/norm! ^A`: increment numbers
- `:g/fred/y A`: append all lines fred to register a
- `:g/fred/y A | :let @*=@a`: put into paste buffer
- `:g//y A | :let @*=@a`: put last glob into paste buffer [N]
- `:let @a=''|g/Barratt/y A |:let @*=@a`
- `:'a,'bg/^Error/ . w >> errors.txt`: filter lines to a file (file must already exist)
- `:g/./yank|put|-1s/'/"/g|s/.*/Print '&'/`: duplicate every line in a file wrap a print ‘’ around each duplicate
- `:g/^MARK$/r tmp.txt | -d`: replace string with contents of a file, -d deletes the “mark”
- `:g/<pattern>/z#.5`: display with context
- `:g/<pattern>/z#.5|echo "=========="`: display beautifully
- `:g/|/norm 2f|r*`: replace 2nd | with a star
- `:nmap <F3> :redir @a<CR>:g//<CR>:redir END<CR>:new<CR>:put! a<CR><CR>`
- `:'a,'bg/fred/s/joe/susan/gic`: can use memory to extend matching
- `:/fred/,/joe/s/fred/joe/gic`: non-line based (ultra)
- `:/biz/,/any/g/article/s/wheel/bucket/gic`: non-line based
- `:/fred/;/joe/-2,/sid/+3s/sally/alley/gIC`
- `?Statement?;/StatusLine/s/pattern/replace/g`
- `:g/^/exe ".w ".line(".").".txt"`: create a new file for each line of file eg 1.txt,2.txt,3,txt etc
- `:.g/^/ exe ".!sed 's/N/X/'" | s/I/Q/`: chain an external command
- `:g/^$/;/^$/-1!sort`: Sort each block (note the crucial ;)

## Operate until string found

- `d/fred/`: delete until fred
- `y/fred/`: yank until fred
- `c/fred/e`: change until fred end
- `v12|`: visualise/change/delete to column 12

## 正则相关的 vimscript 方法

- `'a' =~# '\a'`: 匹配返回 1, 不匹配返回 0, 不忽略大小写
- `'a' =~? '\a'`: 同上, 但忽略大小写
- `'a'!~# '\a'`: 匹配返回 0, 不匹配返回 1, 不忽略大小写
- `'a'!~? '\a'`: 同上, 但忽略大小写
- `substitute( {expr}, {pat}, {sub}, {flags})`: 使用 `flags`, 替换 `expr` 里面的 `pat` (即 pattern 表示的正则) 为 `sub`
- `match( {expr}, {pat}[, {start}[, {count}]])`: 返回 `pat` 在 `expr` 里面所匹配的位置, 可设置开始位置和重复次数
- `matchstr({expr}, {pat}[, {start}[, {count}]])`: 返回 `expr` 里面 `pat` 所匹配的字符串, 无匹配返回空字符串
- `matchend( {expr}, {pat}[, {start}[, {count}]])`: 跟 `match` 函数一样, 但是返回最后一个字符的匹配位置
- `matchlist({expr}, {pat}[, {start}[, {count}]])`: 返回匹配的列表, 第一项是完整匹配, 后面是其它子匹配项

## 正则表达式执行顺序

以下由最高优先级至最低进行排列

|Precedence|Regexp|Description|
|---|---|---|
|1|`\(pattern\)`|grouping, capturing|
|2|`\=,\+,*,\{n}` etc.|quantifiers|
|3|`abc\t\.\w`|sequence of characters/ metacharacters, not containing quantifiers or grouping operators|
|4|`\|`|alternation|

## 零宽度断言 (前后预查/环视)

|PCRE 正则符号|vim 正则符号|描述|PCRE 示例|vim 示例|
|---|---|---|---|---|
|`?=`|`\@=`|正先行断言 - 其右存在 Y 的 X|`X(?=Y)`|`X\(Y\)\@=`|
|`?!`|`\@!`|负先行断言 - 其右不存在 Y 的 X|`X(?!Y)`|`X\(Y\)\@!`|
|`?<=`|`\@<=`|正后发断言 - 其左存在 Y 的 X|`(?<=Y)X`|`\(Y\)\@<=X`|
|`?<!`|`\@<!`|负后发断言 - 其左不存在 Y 的 X|`(?<!Y)X`|`\(Y\)\@<!X`|

先行断言和后发断言都属于 **非捕获簇**(不捕获文本, 也不针对组合计进行计数). 先行断言用于判断所匹配的格式是否在另一个确定格式之前, 匹配结果不包含该确定格式 (仅作为约束).

例如, 我们想要获得所有跟在 `$` 符号后的数字, 我们可以使用正后发断言 `(?<=\$)[0-9\.]*`. 这个表达式匹配 `$` 开头, 之后跟着 `0,1,2,3,4,5,6,7,8,9,.` 这些字符可以出现大于等于 0 次.

### `?=...` 正先行断言

`?=...` 正先行断言, 用于筛选所有匹配结果, 筛选条件为 **其后跟随着断言中定义的格式**. (即第一部分表达式之后必须跟着 `?=...` 定义的表达式)

返回结果只包含满足匹配条件的第一部分表达式. 定义一个正先行断言要使用 `()`. 在括号内部使用一个问号和等号: `(?=...)`. 正先行断言的内容写在括号中的等号后面.

例如, 表达式 `(T|t)he(?=\sfat)` 匹配 `The` 和 `the`, 在括号中我们又定义了正先行断言 `(?=\sfat)`, 即 `The` 和 `the` 后面紧跟着 `\nfat`.

txt

![](https://www.hanleylee.com/img/copyCodeBtn.svg)

```
"(T|t)he(?=\\sfat)" => **The** fat cat sat on the mat.
```

### `?!...` 负先行断言

`?!` 负先行断言, 用于筛选所有匹配结果, 筛选条件为 **其后不跟随着断言中定义的格式**. `负先行断言` 定义和 `正先行断言` 一样, 区别就是 `=` 替换成 `!` 也就是 `(?!...)`.

例如, 表达式 `(T|t)he(?!\sfat)` 匹配 `The` 和 `the`, 且其后不跟着 `\nfat`.

txt

![](https://www.hanleylee.com/img/copyCodeBtn.svg)

```
"(T|t)he(?!\\sfat)" => The fat cat sat on **the** mat.
```

### `?<=...` 正后发断言

正后发断言记作 `(?<=...)` 用于筛选所有匹配结果, 筛选条件为 **其前跟随着断言中定义的格式**.

例如, 表达式 `(?<=(T|t)he\s)(fat|mat)` 匹配 `fat` 和 `mat`, 且其前跟着 `The` 或 `the`.

txt

![](https://www.hanleylee.com/img/copyCodeBtn.svg)

```
"(?<=(T|t)he\\s)(fat|mat)" => The **fat** cat sat on the **mat**.
```

### `?<!...` 负后发断言

负后发断言记作 `(?<!...)` 用于筛选所有匹配结果, 筛选条件为 **其前不跟随着断言中定义的格式**.

例如, 表达式 `(?<!(T|t)he\s)(cat)` 匹配 `cat`, 且其前不跟着 `The` 或 `the`.

txt

![](https://www.hanleylee.com/img/copyCodeBtn.svg)

```
"(? The cat sat on **cat**.
```

## 多文件查找与替换

多文件操作的基础是一定要 **设置好工作目录**, 因为添加文件到操作列表是以当前路径下的文件进行判断筛选的, 设置当前路径可使用以下方式:

- 手动 `:cd path`
- `NERDTree` 插件的 `cd` 命令
- `netrw` 插件的 `cd` 命令
- 在 `.vimrc` 中设置 `set autochair` 自动切换当前工作路径

### 多文件查找

![](https://a.hanleylee.com/HKMS/2021-01-21194140.png?x-oss-process=style/WaMa)

#### 逻辑

**`vimgrep /pattern/[g][j] <range>`**

- `vimgrep`: 批量查找命令, 其后可直接加 `!` 代表强制执行. 也可以使用`lvimgrep` , 结果显示在 list 中
- `patten`: 需要查找的内容, 支持正则表达式, 高级用法见元字符
- `g`: 如果一行中有多个匹配是否全部列出
- `j`: 搜索完后直接定位到第一个匹配位置
- `range`: 搜索的文件范围
    - `%`: 在当前文件中查找
    - `**/*.md`: 在当前目录即子目录下的所有 .md 文件中
    - `*`: 当前目录下查找所有(不涉及子目录)
    - `**`: 当前目录及子目录下所有
    - `*.md`: 当前目录下所有.md 文件
    - `**/*`: 只查找子目录

查找的结果使用 `quick-fix` 来进行展示, 可使用 `:copen` 查看所有结果项并进行相应跳转, 具体操作参考 [神级编辑器 Vim 使用-操作篇](https://www.hanleylee.com/usage-of-vim-editor.html)

#### 实例

- `:vimgrep /hello/g **`: 在当前目录及子目录下的所有文件内查找 `hello` 字符串

#### quickfix-list 与 location-list 的区别

quickfix-list 是一个完整的窗口, 可以移动上下光标, 按下 enter 进行打开文件

location-list 只是一个局部的显示区域, 只能简单显示查找结果的信息, 目前看来没有必要使用此选项

### 多文件替换

多文件替换所依赖的是 vim 中的参数列表概念, 这里仅对流程命令进行演示, 具体的参数列表操作参考 [神级编辑器 Vim 使用-操作篇](https://www.hanleylee.com/usage-of-vim-editor.html)

- `:args`: 显示当前的所有参数列表
- `:args *.md aa/**/*.md` 表示添加子文件夹下的 `md` 文件及 `aa` 文件夹下的和其子文件夹下的 `md` 文件到参数列表中
- `:argdo %s/oldword/newword/egc | update`: 对所有存在参数列表中的文件执行命令, `s` 代表替换, `%` 指对所有行进行匹配, `g` 代表整行替换(必用), `e` 指使用正则表达式, `c` 代表每次替换前都会进行确认, `update` 表示对文件进行读写
- `:argdo %s/!\[.*\]/!\[img\]/gc`: 将所有参数列表中的以 `![` 开头, 以 `]` 结尾的所有字段改为 `[img]`
- `:argdo write`: 将所有参数列表中的内容进行缓冲区保存

## 常见疑问

### `<EOL>` 与 `newline`

EOL does not mean “there is an empty line after here”, it means **this marks the end of the line, any further characters are to be displayed on another line**

当 Vim 加载文件时, 会首先确定文件的 `fileformat`, 然后根据 `fileformat` 进而确定出 `<EOL>` 是什么字符, `<EOL>` 代表每行的结束, `<EOL>` 字符之后的字符就位于一个新的行. 这样, vim 就展示出了多行的效果.

`<EOL>`(end-of-line) 在不同的 `fileformat` 下有着不同的定义(通过 `set ff?` 查看), `newline` 是 vim 内部用来存储换行的符号, 在不同的 `fileformat` 下是不同的值:

|`fileformat`|对应的 `<EOL>`|对应的 `newline` 值|
|---|---|---|
|`dos`|`<CR><LF>`(0x0d 0x0a)|`<CR>`(0x0d)|
|`unix`|`<LF>`(0x0a)|`<CR>`(0x0d)|
|`mac`|`<CR>`(0x0d)|`<LF>`(0x0a)|

可见, `newline` 的定义刻意地避开了与 `<EOL>` 的内容相同

使用 `<C-V><C-M>` / `<C-V><ENTER>` 可以输入 `newline`, 使用 `<C-V><C-J>` 输入 `<NUL>`

### `\n` 与 `\r` 的区别到底是什么

首先, 明确一点, Vim 在内存中使用 `\n` 表示 `<NUL>`(aka `^@`), 使用 `\r` 表示 `newline`, 因此, 当 `\n` 与 `\r` 位于替换部分中时, 会插入相应的字符; 当 `\n` 与 `\r` 位于匹配部分时, 会按照其元字符的定义匹配对应的内容:

|-|搜索时|替换时|
|---|---|---|
|`\n`|在 buffer 中匹配 `<EOL>`; 或者在字符串中匹配换行符字面值|插入 `<NUL>`|
|`\r`|匹配不是 `<EOL>` 一部分的 `<CR>`|插入 `newline`|

## 如何更高效地学习 Vim

以下是几点个人对于 vim 操作技能提升的建议

- 如果你经常使用 `hjkl` 键进行连续移动, 请重新思考你使用 vim 的意义何在
- 如果一处编辑花费了你较多的操作, 那么请停止一下, 绝对有其他操作方式让你更高效的完成编辑
- 如果有简单的重复性的操作, 请充分考虑 `.` 命令
- 如果有复杂的重复性的操作, 请考虑宏
- 如果一种操作需要多文件使用, 以后也有可能会用到, 请考虑使用脚本文件

最后, 请将 vim 作为你的唯一编辑器用于所有文字编辑 (本系列文章以及我所有笔记整理都是由 vim 来完成的), 这会让你在实践中快速进步

## 后续如何继续提高学习?

无论如何, 我都认为 vim 官方的帮助文档时最好的学习资料, 使用方法非常简单: normal 模式下输入 `:h [command]` 即可, 这可以很快速的定位到你想要了解的知识上, 而且叙述简单明了. e.g. `:h netrw`

在官方文档这么详细的背景下, 很多第三方插件也在插件的帮助文档中对其插件功能及可配置项进行了详细的说明, 使用方式也是 `:h [command]`.

另外, 也有一系列的书对 vim 的一些特性进行了深入挖掘, 这里推荐:

- _Vim 使用技巧 (第 2 版)_ - Drew Neil
- _Vim 8 文本处理实战_ - 鲁兰斯. 奥西波夫

## Vim 常见问题

### 光标移动速度慢

主要原因有两点

1. vim 中的插件拖慢了速度
    
    vim 的第三方状态栏插件 `air-line` 插件开启后光标移动会被卡住, 改为 `powerline` 或 `lightline`, 效果好多了
    
2. 在系统设置中将重复时间调至最短, 速度仍然不够快, 在终端中使用如下设置
    
    bash
    
    ![](https://www.hanleylee.com/img/copyCodeBtn.svg)
    
    ```
       defaults write NSGlobalDomain KeyRepeat -int 1
    ```
    
    在系统设置中调至最快所对应的值是 2, 这里设置成 1 会变得更快. 最快的值是 0, 不过已经超出可控范围了, 因此不建议设置.
    

### 中文输入法下在 MacVim 中输入中文会导致大量重复拼音

- 原因
    
    输入法没有完全截获按键
    
- 解决办法
    
    终端下输入 `defaults write org.vim.MacVim MMUseInlineIm 0`
    
- 原理
    
    将输入法针对于 `MacVim` 设置为单行模式
    

### `vim --version` 显示支持 python 但是某些插件仍提示不支持

![](https://a.hanleylee.com/HKMS/2023-07-03120944.png?x-oss-process=style/WaMa)

排查步骤如下:

1. 系统上是否装了 Python?
2. Python 是 32 位还是 64 位跟 vim 是否匹配?
3. Python 的版本跟编译时的版本是否一致 (编译时的版本可以使用 `:version` 查看)
4. 通过 `pythondll` 和 `pythonthreedll` 来分别指定 Python2 和 Python3 所使用的动态库. 例如, 可以在 vimrc 里添加 `set pythondll=/Users/hanley/.python2.7.6/lib/libpython2.7.so`

经此 4 步, 99% 能让 Python 工作起来, 剩下的 1% 就看人品了