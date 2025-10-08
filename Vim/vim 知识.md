# Vim 知识分类

以下是对提供的文档内容的分类合并。内容已去除重复，逻辑上归纳为主要类别，并使用表格、列表和代码块增强可读性。分类基于Vim的核心功能和使用场景，优先突出实用性和结构化。

## 1. 启动与基本命令

### 启动选项
- `vim -p filename1 filename2 ...`: 以标签页方式打开多个文件。
- `vim -p *`: 编辑当前目录所有文件。
- `vim -r`: 恢复会话。
- `vim -o`: 水平分割窗口打开文件。
- `vim -O`: 垂直分割窗口打开文件。
- `vim +[num]`: 定位到指定行。
- `vim +/[pat]`: 定位到第一个匹配模式。
- `vim -u NONE -N`: 以无配置、无插件模式启动（用于大文件）。
- `vim -c "命令" file`: 执行命令后打开文件，例如 `vim -c "%s/ABC/DEF/ge | update" file1.c`。
- `gvim -c 'normal ggdG"*p' file`: 从系统剪贴板粘贴内容。
- `mvim --servername VIM3 --remote-tab foobar.txt`: 在MacVim中远程打开标签页。

### 保存与退出
- `ZZ` 或 `:x`: 保存并退出当前窗口（不保存未修改文件）。
- `ZQ` 或 `:q!`: 不保存直接退出。
- `:wa`: 保存所有缓冲区。
- `:wn`: 保存当前缓冲区并切换到下一个。
- `:qa`: 退出所有缓冲区。
- `:cq {N}`: 以错误码退出（用于脚本调用，如Git mergetool）。
- `:xa`: 保存并退出所有缓冲区（不保存未修改文件）。
- `:sav path/to.txt`: 另存为（全称`:saveas`）。
- `:sav! %:r.bak`: 保存为备用扩展名。
- `:w !sudo tee %`: 以sudo保存只读文件。
- `:e!`: 强制重载当前文件（丢弃未保存内容）。
- `n1,n2 w [file]`: 保存指定行范围到新文件。

### 文件操作
- `:e path/to.txt`: 打开文件。
- `:e .`: 进入Netrw目录浏览器。
- `:r [filename]`: 读取文件内容插入下一行。
- `:r ![command]`: 读取外部命令输出插入下一行。
- `:!mv % %:r.bak`: 重命名当前文件。
- `:ene[w]`: 新建缓冲区。
- `:hide`: 关闭当前窗口（保留缓冲区）。

### 模式介绍
| 模式          | 描述                          | 进入方式                  |
|---------------|-------------------------------|---------------------------|
| Normal       | 默认普通模式                  | 启动时 / `<Esc>`         |
| Visual       | 可视选择（字符/行/块）         | `v` (字符) / `V` (行) / `Ctrl-v` (块) |
| Insert       | 插入编辑                      | `i` / `a` / `o` 等        |
| Select       | 鼠标选择（替换式）            | `gh`                      |
| Command-line | 命令行输入                    | `:`                       |
| Ex           | Ex模式（多行命令）            | `Q` (仅Vim支持)           |

## 2. 移动与导航

### 光标移动
- `h/j/k/l`: 左/下/上/右。
- `w/b/e`: 前/后单词 / 单词末尾。
- `W/B/E`: 前/后大单词 / 大单词末尾。
- `0/^/$`: 行首 / 第一非空白 / 行尾。
- `H/M/L`: 屏幕顶部/中部/底部。
- `zt/zz/zb`: 当前行移至屏幕顶部/中部/底部。
- `gj/gk`: 屏幕行下/上（处理折叠/换行）。
- `g0/g^/g$`: 屏幕行首 / 第一非空白 / 行尾。
- `g_`: 最后一个非空白字符。
- `f<char>/t<char>`: 向前到字符 / 到字符前。
- `F<char>/T<char>`: 向后到字符 / 到字符后。
- `;/,`: 重复上次f/t / 反向。
- `{/}`: 段落上/下。
- `[[/]]`: 段落/空行上/下。
- `[/[{`: 上一个块开始。
- `]/]}`: 下一个块结束。
- `[m/[M`: 下一个方法开始/结束。
- `]m/]M`: 上一个方法开始/结束。
- `<C-e>/<C-y>`: 向下/向上滚一行。
- `<C-u>/<C-d>`: 向上/向下半页。
- `88gg` 或 `88G`: 跳到第88行。
- `gd/gD`: 本地/全局变量定义。
- `gf`: 编辑光标下文件（同窗口）。
- `<C-w>gf`: 编辑光标下文件（新标签）。
- `<C-w>f`: 编辑光标下文件（分割窗口）。
- `<C-]>`: 跳到光标下标签定义。
- `<C-w>]`: 新窗口查看定义。
- `<C-w>}`: 预览窗口查看定义。
- `'m`: 跳到标记m。
- `'.`: 跳到上次编辑点。
- `g,`: 新编辑点。
- `g;`: 上次编辑点。
- `<C-o>/<C-i>`: 上/下一个跳转位置。
- `<C-^>` 或 `<C-6>`: 切换当前/上一个文件。
- `gi`: 跳到上次插入位置并进入Insert。

### 跳转与历史
- `:ju(mps)`: 跳转列表。
- `:changes`: 修改历史。
- `:jumps`: 跳转历史。
- `q?` / `q/`: 搜索历史。
- `q:`: 命令历史。
- `:=`: 行号计算。

## 3. 编辑与修改

### 插入与删除
| 操作          | 描述                          |
|---------------|-------------------------------|
| `i/a`        | 光标前/后插入。               |
| `I/A`        | 行首/尾插入。                 |
| `o/O`        | 下/上新行插入。               |
| `s/S`        | 删除字符/行并插入。           |
| `c<char>`    | 删除到指定并插入（e.g., `cw`）。 |
| `C`          | 到行尾删除并插入。            |
| `cc`         | 删除当前行并插入。            |
| `x/X`        | 删除当前/前字符。             |
| `d<char>`    | 删除到指定（e.g., `dw`、`d$`）。 |
| `dd`         | 删除当前行。                  |
| `D`          | 到行尾删除。                  |
| `dt/f<char>` | 删除到字符前/包括字符。       |

### 缩进与格式
- `==`: 缩进当前行。
- `n==`: 缩进n行。
- `=G`: 缩进到文件末尾。
- `=%`: 缩进当前块。
- `>% / >i{ / >a{`: 右缩进选区/内块/外块。
- `<C-t>/<C-d>` (Insert): 增加/减少缩进。
- `gq`: 重新格式化（基于`textwidth`）。
- `gq}` / `gqap`: 格式化段落。
- `ggVGgq`: 格式化整个文件。
- `gw`: 格式化但光标不动。
- `:le/ce/ri`: 左/中/右对齐当前行。
- `:set paste`: 防止粘贴时自动格式化。

### 替换与查找
- `/pat` / `?pat`: 向前/向后搜索。
- `n/N`: 下一个/上一个匹配。
- `* / #`: 向前/向后搜索光标下单词。
- `gn / gN`: 选当前高亮匹配 / 反向。
- `:%s/old/new/g`: 全局替换（当前文件）。
- `:%s/old/new/gc`: 确认替换。
- `s/old/new/g4`: 当前行起4行内替换。
- `.,$s/old/new/g`: 从当前行到文件末尾替换。
- `.,.+8s/old/new/g`: 当前行起9行内替换。
- `:/FROM/,/;/s/=/<>/g`: 范围替换（SQL示例）。
- `:%s/<term>/replace/gc`: 精确单词替换。
- `:%s/Kang\|Kodos/alien/gc`: 多项替换。
- `:%s!~!= expand($HOME)!g`: 变量替换。
- `:sball` / `:sb`: 所有缓冲区在窗口中显示。
- `s/str//gn` / `/str/gn`: 统计匹配数。
- `:bufdo /str/str/`: 缓冲区内搜索替换。
- `:argdo %s/a/b/g \| update`: 参数列表中替换并保存。
- `:silent! argdo %s/a/b/g \| update`: 静默替换（无错误提示）。
- `:tabdo %s/food/drink/g`: 所有标签页替换。

### 多文件操作
- `:args ./**/*.md`: 添加文件到参数列表。
- `:argdo write`: 保存所有参数列表文件。
- `:vimgrep /pat/g **/*.md`: 多文件grep（结果在quickfix）。
- `:lvimgrep /pat/g **/*.md`: 本地列表grep。
- `:copen`: 打开quickfix列表。
- `:grep pat files`: Grep到quickfix（支持正则）。

## 4. 复制、粘贴与寄存器

### 基本操作
- `y<char>`: 复制到指定（e.g., `yy`、`y$`）。
- `p/P`: 后/前粘贴。
- `gp`: 粘贴后光标移到末尾。
- `y5j`: 向下复制5行。
- `:y n`: 复制当前行到n。
- `:co[py] / :t`: 复制行。
- `:m[ove]`: 移动行（e.g., `45,65 m 78`）。

### 寄存器
| 类型                  | 名称       | 描述                          |
|-----------------------|------------|-------------------------------|
| 无名                  | `""`      | 最后操作内容。                |
| 数字（复制）          | `"0`      | 最近复制。                    |
| 数字（删除）          | `"1-9`    | 最近9次删除。                 |
| 小删除                | `"-`      | 行内删除。                    |
| 具名                  | `"a-z/A-Z`| 指定寄存器（小写追加）。      |
| 只读（命令）          | `":"`     | 最近命令。                    |
| 只读（插入）          | `".`      | 最近插入文本。                |
| 只读（文件名）        | `"%/#"`   | 当前/交替文件名。             |
| 表达式                | `"=`      | 执行表达式。                  |
| 选择/剪贴板           | `"+/*/~"` | 系统剪贴板交互。              |
| 黑洞                  | `"_`      | 不缓存删除。                  |
| 搜索模式              | `"/`      | 最近搜索。                    |

- 使用: `"ayw`（复制词到a寄存器）。
- `:reg`: 查看寄存器。
- `@e`: 访问寄存器e作为变量。
- `let @e="开始"`: 设置寄存器。
- `<C-r>"`: Insert中插入无名寄存器。
- `<C-r>:`: 插入最近命令。
- `<C-r>/`: 插入最近搜索。
- `g/<pat>/y A`: 匹配内容到A寄存器。
- `:y *`: 复制到系统剪贴板。

### 交换内容
- `:exe "w ".@e`: 用寄存器保存文件。
- `<C-r>e`: 命令/搜索/Insert中插入寄存器e。
- `<C-r>=`: 表达式寄存器。

## 5. 标记

### 创建与跳转
- `m<mark>`: 创建标记（a-z当前缓冲，A-Z跨缓冲）。
- `'<mark>`: 跳到标记行首。
- `<mark>`: 跳到标记位置。

### 查看与删除
- `:marks`: 列出标记（`.`最近编辑，`0-9`最近文件，`^`最近插入，`'`上次跳转，`"`上次退出，`[`/`]修改开始/结束）。
- `:delmarks <marks>`: 删除指定标记。
- `:delmarks!`: 删除所有。

## 6. 窗口、缓冲区与标签页

### 缓冲区（Buffer）
- `:buffers` / `:ls` / `:files`: 列出缓冲区。
| 标志 | 描述                  |
|------|-----------------------|
| `%`  | 当前缓冲区             |
| `#`  | 交替缓冲区             |
| `a`  | 活动缓冲区             |
| `h`  | 隐藏缓冲区             |
| `*`  | 已修改缓冲区           |
| `=`  | 只读缓冲区             |

- `:b <num/file>`: 切换缓冲区。
- `:bn / :bp`: 下一个/上一个。
- `:bf / :bl`: 第一个/最后一个。
- `:badd`: 添加缓冲区。
- `:bd`: 删除缓冲区。
- `:bun`: 关闭但保留。
- `:bufdo cmd`: 对所有缓冲区执行cmd。
- `:bw <num>`: 完全移除缓冲区。
- `:verbose set buftype?`: 查看buftype（`nofile`不可保存，空可保存）。
- `:setlocal buftype=`: 重置buftype。

### 窗口（Window）
- `<C-w>s / <C-w>v`: 水平/垂直分割。
- `<C-w>o`: 仅保留当前窗口。
- `<C-w>=`: 平均大小。
- `:res[ize] +n/-n`: 垂直调整n行。
- `:vertical res[ize] +n/-n`: 水平调整n列。
- `+ / -`: 纵向扩大/缩小。
- `:hide`: 关闭当前窗口。

### 标签页（Tabs）
- `:tabnew` / `:tabe`: 新标签页。
- `:tabclose` / `:tabc`: 关闭当前。
- `:tabonly` / `:tabo`: 仅保留当前。
- `gt / gT`: 下一个/上一个。
- `:tabn / :tabp`: 下一个/上一个。
- `:tabfirst / :tablast`: 第一/最后一个。
- `n gt`: 第n标签。
- `:tabmove n`: 移动到位置n（-1到最后，+n右移）。
- `:tabs`: 列出标签。
- `:tab split` / `:tab sp`: 当前缓冲到新标签。
- `:tabfind file`: 查找并新标签打开。
- `:tab cmd`: 在新标签执行cmd。
- `:tab ball`: 每个缓冲一个标签。
- `:tabdo cmd`: 所有标签执行cmd。
- `:echo tabpagenr()`: 当前标签号。
- `:echo tabpagenr('$')`: 总标签数。

### 文件浏览
- `:Ex`: Netrw浏览器。
- `:Sex / :Vex`: 水平/垂直Netrw。
- `:browse`: 图形文件浏览器（edit/saveas/read/oldfiles）。

## 7. 折叠（Folding）

| 快捷键 | 描述                  |
|--------|-----------------------|
| `za`   | 开/关当前折叠          |
| `zc`   | 关闭当前               |
| `zo`   | 打开当前               |
| `zm/zM`| 关闭所有/嵌套          |
| `zr/zR`| 打开所有/嵌套          |
| `zd/zE`| 删除当前/所有          |
| `zj/zk`| 下一个/上一个折叠      |
| `zn/zN`| 禁用/启用折叠          |

- `:set foldmethod=manual`: 手工折叠（`zf`折叠选区，`zfa(`折叠括号）。
- `:set foldmethod=indent`: 缩进折叠（`:set foldlevel=1`级别）。
- `:set foldmethod=syntax`: 语法折叠。
- `:set foldmethod=marker`: 标记折叠（默认{{{ / }}}）。
- `:mkview / :loadview`: 保存/加载折叠状态。
- `:set foldcolumn=N`: 左侧折叠列（N=0-12）。
- `nnoremap <space> za`: 空格键切换折叠。

## 8. 正则表达式（Regex）

### Magic 模式
- `:set magic`: 默认（`$ . * ^`无需转义，其他需`\`）。
- `:set nomagic`: 仅`$ ^`无需转义。
- `\m`: 临时magic。
- `\M`: 临时nomagic。
- `\v`: Very magic（无需转义任何）。
- `\V`: Very nomagic（全需转义）。

示例：
```
/\v(a.c){3}$  # very magic: abcaccadc
/\m(a.c){3}$  # magic: (abc){3}
/\M(a.c){3}$  # nomagic: (a.c){3}
/\V(a.c){3}$  # very nomagic: (a.c){3}$
```

### 量词（Magic模式）
| 元字符     | 描述                          |
|------------|-------------------------------|
| `*`        | 0+（贪婪）                    |
| `\+`       | 1+（贪婪）                    |
| `\? / =`   | 0或1（贪婪）                  |
| `\{n,m}`   | n到m（贪婪）                  |
| `\{n,}`    | n+（贪婪）                    |
| `\{,m}`    | 最多m（贪婪）                 |
| `\{n}`     | 恰好n                         |

- 非贪婪: `\{-n,m}` / `\{-}` / `\{-1,}` / `\{-,1}`。
- 应用于组: `\(123\)\{2}`匹配123123。

### 常用元字符（Magic模式）
| 元字符    | 描述                          | 等价                  |
|-----------|-------------------------------|-----------------------|
| `.`       | 任意字符                      |                       |
| `[abc]`   | 括号内任意（`-`范围）         |                       |
| `[^abc]`  | 非括号内任意                  |                       |
| `\< / \>` | 单词开头/结尾                 |                       |
| `\a`      | 字母[a-zA-Z]                  |                       |
| `\l`      | 小写[a-z]                     |                       |
| `\u`      | 大写[A-Z]                     |                       |
| `\d`      | 数字[0-9]                     |                       |
| `\D`      | 非数字                        | `[^0-9]`              |
| `\s`      | 空白[ \t]                     |                       |
| `\S`      | 非空白                        | `[^ \t]`              |
| `\w`      | 单词[0-9A-Za-z_]              |                       |
| `\W`      | 非单词                        | `[^0-9A-Za-z_]`       |
| `\x`      | 十六进制[0-9A-Fa-f]           |                       |

- 字符类: `[:alnum:]` (字母数字), `[:alpha:]` (字母), `[:digit:]` (数字), `[:xdigit:]` (十六进制), `[:space:]` (空白)等。

### 转义
| 元字符 | 描述             |
|--------|------------------|
| `\\*`  | 匹配*字符        |
| `\\.`  | 匹配.字符        |
| `\\/`  | 匹配/字符        |
| `\\|`  | 匹配\|字符       |
| `\\[`  | 匹配[字符        |

### 位置锚点
| 元字符 | 描述                  |
|--------|-----------------------|
| `^`    | 行首                  |
| `$`    | 行尾                  |
| `\<`   | 单词开头              |
| `\>`   | 单词结尾              |

### 零宽度断言（环视/预查）
| PCRE     | Vim       | 描述                  | 示例 (PCRE)          | 示例 (Vim)              |
|----------|-----------|-----------------------|----------------------|-------------------------|
| `(?=Y)`  | `X\@=Y`   | 正先行（右存在Y的X）  | `foo(?=bar)`        | `foo\(bar\)\@=`        |
| `(?!Y)`  | `X\@!Y`   | 负先行（右不存在Y的X）| `foo(?!bar)`        | `foo\(bar\)\@!`        |
| `(?<=Y)` | `Y\@<=X`  | 正后发（左存在Y的X）  | `(?<=foo)bar`       | `\(foo\) \@<=bar`      |
| `(?<!Y)` | `Y\@<!X`  | 负后发（左不存在Y的X）| `(?<!foo)bar`       | `\(foo\) \@<!bar`      |
| `(?> )`  | `\@>`     | 固化分组              | -                    | -                       |
| `(?: )`  | `%( )`    | 非捕获组              | -                    | `%(my)sql(ok)`         |

- 示例: `/(my)@<=sql`（前面是my的sql）。
- Vim中`?`换成`@`，置于模式后。

### Vimscript 正则函数
- `'str' =~# pat`: 匹配返回1（不忽略大小写）。
- `'str' =~? pat`: 匹配返回1（忽略大小写）。
- `!~# / !~?`: 不匹配返回1。
- `substitute(str, pat, sub, flags)`: 替换（flags如`g`全局）。
- `match(str, pat)`: 匹配位置。
- `matchstr(str, pat)`: 匹配字符串。
- `matchend(str, pat)`: 末尾位置。
- `matchlist(str, pat)`: 匹配列表（完整+子组）。

### 执行顺序（优先级高到低）
1. `\(pat\)`: 分组/捕获。
2. `\=,\+,*,\{n\}`: 量词。
3. `abc\t\.\w`: 序列。
4. `\|`: 或。

## 9. 按键映射（Mapping）

### 基本语法
| 前缀    | 模式范围                     |
|---------|------------------------------|
| `map`   | Normal/Visual/Operator       |
| `nmap`  | Normal                       |
| `vmap`  | Visual                       |
| `omap`  | Operator                     |
| `imap`  | Insert                       |
| `cmap`  | Command-line                 |
| `map!`  | Insert/Command-line          |

- `nore`: 非递归（e.g., `nnoremap`）。
- `unmap`: 取消映射。
- `mapclear`: 清除所有。

### 参数（置于rhs前）
| 参数        | 描述                          |
|-------------|-------------------------------|
| `<buffer>`  | 限当前缓冲区                  |
| `<silent>`  | 无回显                        |
| `<special>` | 特殊键                        |
| `<expr>`    | 表达式计算                    |
| `<unique>`  | 检查唯一性                    |

### Leader
- `let g:mapleader = ','`: 设置Leader（默认`\`）。
- `<Leader>`: Leader键。
- `let g:maplocalleader = ','`: 本地Leader。

示例: `nmap <buffer> <silent> <Leader>w /a<CR>`。

### 缩写（Abbrev）
- `:ab ad advertisement`: 缩写。
- `:iab`: Insert模式。
- `:cab`: Command模式。
- `:unab ad`: 移除。
- `:abclear`: 清除所有。
- 示例: `:cab h tab h`（帮助在新标签）。

## 10. 编码与文件信息

### 编码选项
| 选项          | 简写   | 描述                          |
|---------------|--------|-------------------------------|
| `encoding`    | `enc`  | Vim内部编码（建议utf-8，一次设置）。 |
| `fileencoding`| `fenc` | 文件编码（保存时转换）。      |
| `fileencodings`| `fencs`| 自动探测列表（ucs-bom,utf-8,cp936,...）。 |

- `ga` / `:ascii`: 查看字符编码。
- `set encoding=utf-8`: 内部utf-8。
- `set fileencoding=utf-8`: 转换文件编码。
- 避免乱码: `set langmenu=zh_CN.UTF-8` / `language message zh_CN.UTF-8`。

### 文件信息
- `<C-g>`: 显示位置（1<C-g>全路径，2<C-g>缓冲号，g<C-g>统计字数/字节）。
- `:list`: 显示不可见字符。

### Buftype
- `:setlocal buftype=nofile`: 不可保存。
- `:setlocal buftype=`: 可保存。

## 11. 脚本与自动化（Vimscript）

### 数据类型
- String / Number/Float / Boolean / v:null / Dictionary / List / Funcref / v:true/v:false。

### 基本语法
- `let foo = 'str'`: 赋值。
- `let x = abs(1)`: 函数调用。
- 单行注释: `" `。
- 续行: `\`。
- 运算: `!x` (非), `x \| y` (或), `x && y` (与), `x < y`, `x == y` (相等), `x ==# y` (严格), `x ? y : z` (三元), `=~ / !~` (匹配/不匹配)。

### 字符串
- `'` (无转义) / `"` (转义)。
- 函数: `strchars()`, `strlen()`, `split()`, `tolower()`, `toupper()`, `len()`, `stridx()`, `strridx()`, `repeat()`, `substitute()`。

### 数值
- 函数: `pow()`, `and/xor/invert()`, `max/min()`, `round/ceil/floor/trunc()`, `sqrt/exp/log/log10/abs()`, 三角函数。

### List
- `[1,2,3]`。
- 操作: `len()`, `get(l,idx)`, `l[idx:]`, `l[start,end]`, `+`, `add/extend/insert/remove/index/join/reverse/sort/uniq/copy`。

### Dictionary
| JS 等价          | VimL                      |
|------------------|---------------------------|
| `obj.key`        | `obj.key`                 |
| `obj[key]`       | `get(obj,key)` / `obj[key]` |
| `obj[key]=val`   | `let obj[key]=val`        |
| `key in obj`     | `has_key(obj,key)`        |
| `delete obj.key` | `remove(obj,'key')`       |
| `keys(obj)`      | `keys(obj)`               |
| `values(obj)`    | `values(obj)`             |
| `entries(obj)`   | `items(obj)`              |
| `assign(obj1,obj2)` | `extend(obj1,obj2)`    |

### 类型转换与检查
| 转换             | 语法                       |
|------------------|----------------------------|
| String->Number   | `str2nr(x)`                |
| String->Float    | `str2float(x)`             |
| Number->String   | `string(x)`                |

- 检查: `type(x) is v:t_string` 等；`x is v:null`；`x is# 'foo'` (字符串严格)。

### 条件与循环
- `if/elseif/else/endif`。
- `while/endwhile`。
- `for idx in range(len)/endfor`。

### 错误处理
```
try
  throw 'error'
catch /pat/
  ...
finally
  ...
endtry
```

### 函数
- `function! Foo() abort`: 定义（!追加，abort可中断）。
- `return 42`。
- 可变参数: `function! name(...)`；`a:0` (数量), `a:1` (参数), `a:000` (列表)。
- 命名空间: `myplugin#hello()`。
- 引用: 大写开头变量 (Funcref)。

### 变量与作用域
- `let/unlet`: 赋值/删除（`unlet!`忽略错误）。
- 作用域: `g:` (全局), `l:` (局部), `a:` (参数), `s:` (脚本), `v:` (Vim), `b:` (缓冲), `w:` (窗口), `t:` (标签)。
- 伪变量: `&name` (选项), `&l/g:name` (本地/全局), `@name` (寄存器), `$name` (环境)。
- 检查: `exists(expr)`, `has(feature)`, `filereadable(file)`。

### 行/列操作
- `col(".")`: 当前列。
- `col("$")`: 当前行长度。
- `line(".")`: 当前行。
- `line("$")`: 最后一行。
- `getpos(".")`: [0,lnum,col,off] 位置。
- `setpos(".", pos)`: 设置位置。

### 事件
执行顺序示例（edit file）: BufWinEnter → BufEnter → VimEnter → BufNew → BufAdd → BufReadCmd → BufEnter → BufWinEnter → InsertEnter。

| 类别       | 事件示例                     |
|------------|------------------------------|
| 文件       | BufNewFile, BufRead/Post, BufWrite/Pre/Post, FileReadPost, BufDelete |
| 缓冲区     | BufEnter/Leave, BufWinEnter/Leave, BufHidden, BufUnload |
| 窗口       | WinEnter/Leave, WinNew, WinClosed |
| 生命周期   | VimEnter, VimLeave, GUIEnter |
| 文本更改   | TextChanged/I, InsertEnter/Leave |
| 其他       | FileType, Syntax, CursorMoved/I, ModeChanged, QuickFixCmdPost |

### 自动命令（Autocmd）
- `autocmd [group] event pat cmd`: 绑定。
- `autocmd!`: 清除组内。
- `augroup GroupName / augroup END`: 组。
- `doautocmd`: 手动触发。
- 示例: `autocmd BufWritePre * %s/\s\+$//e` (保存前删尾空格)；`autocmd FileType python setlocal ts=4 sw=4 et`。

## 12. 杂项与调试

- `:rewind / :brewind`: 参数/缓冲第一个文件。
- `!!cmd`: 替换当前行为外部命令输出（e.g., `!!ls`）。
- `:%!xxd`: 十六进制查看；`:%!xxd -r`: 恢复。
- `:scriptnames`: 加载脚本列表。
- `:function / :command`: 列函数/命令。
- `:verbose set opt?`: 选项值及设置位置。
- `:verbose map lhs`: 映射详情。
- `:verbose function/cmd name`: 函数/命令详情。
- `set autochdir`: 自动切换目录。

### 配置路径（Runtimepath）
- `echo &rtp`: 查看路径。
- 目录: `~/.vim/colors/` (colorscheme), `plugin/` (插件), `ftdetect/` (类型检测), `ftplugin/` (类型插件), `indent/` (缩进), `compiler/` (编译), `after/` (后加载), `autoload/` (按需), `doc/` (文档)。

### Autoload
- 延迟加载: `file1#func1` → source `autoload/file1.vim` on call。

### 常见问题
- 光标慢: 用`lightline`替换`airline`；macOS `defaults write NSGlobalDomain KeyRepeat -int 1`。
- 中文重复: `defaults write org.vim.MacVim MMUseInlineIm 0`。
- Python支持: 检查版本/位数；`set pythondll=/path/libpython.so`。

### 学习建议
- 用`:h [topic]` (e.g., `:h netrw`)。
- 书籍: 《Vim使用技巧》(Drew Neil), 《Vim 8 文本处理实战》(鲁兰斯·奥西波夫)。
- 实践: 全用Vim编辑；反思hjkl/重复操作，用`.`/宏/脚本优化。
