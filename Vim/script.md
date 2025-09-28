## 数据类型(动态弱类型)
* String
* Number/Float
* Boolean
* v:null
* Dictionary
* List
* Funcref
* v:true/v:false
## 基本语法
```
let foo = 'Hello World'
let x = abs(1)

call clearmatches()

" 单行注释
\ 拆分行

!x         
x | y      
x && y
x < y      
x == y     (相等
x ==# y    (相等
x ==? y
x is y
x is? y
x is# y    (全等
x isnot# y (不等
x ? y : z  
=~         (匹配 pattern
!~         (不匹配 pattern
```
## 字符串表达式
* `'` 不转义
* `"` 转义
* strchars
* strlen
* split
* tolower
* toupper
* len
* str
* stridx
* strridx
* repeat
* substitute
## 数值表达式
- pow
- and
- xor
- invert
* max
* min
* round
* ceil
* floor
* trunc
* sqrt
* exp
* log
* log10
* log
* abs
* acos
* asin
* atan
* atan2
* cos
* tan
## list
*   \[1, 2, 3\]
*   len
*   get(list, idx)
*   list\[idx\]
*   copy(list)
*   list\[idx:\]
*   list\[start, end\]
*   list + list2
*   add(list, x)
*   extend(list, list2)
*   insert(list,x)
*   insert(list, idx, x)
*   remove(list, idx)
*   index(list, x)
*   join(list, x)
*   reverse(list)
*   sort(list)
*   sort(list, func)
*   uniq(list)
*   uniq(list, func)
*   list1 == list2
*   list1 is list2
## dictionary

| JavaScript                | VimL                     |
| ------------------------- | ------------------------ |
| obj.xyz                   | obj.xyz                  |
| obj.xyz = value           | let obj.xyz = value      |
| obj\[key\]                | get(obj, key)            |
| No equivalent             | obj\[key\]               |
| obj\[key\] = value        | let obj\[key\] = value   |
| key in obj                | has\_key(obj, key)       |
| delete obj1.xyz           | call remove(obj1, 'xyz') |
| delete obj1\[key\]        | call remove(obj1, key)   |
| Object.keys(obj)          | keys(obj)                |
| Object.keys(obj).length   | len(obj)                 |
| Object.values(obj)        | values(obj)              |
| Object.entries(obj)       | items(obj)               |
| Object.assign(obj1, obj2) | extend(obj1, obj2)       |
| Object.freeze(obj)        | No equivalent            |
| Object.seal(obj)          | No equivalent            |
| No direct equivalent      | obj1 == obj2             |
| obj1 === obj2             | obj1 is obj2             |
## 类型转换

| Types             | Syntax                                             |
| ----------------- | -------------------------------------------------- |
| String -> Number  | str2nr(x)                                          |
| String -> Float   | str2float(x)                                       |
| Float -> Number   | float2nr(x), float2nr(ceil(x)), float2nr(floor(x)) |
| Number -> Float   | floor(x)                                           |
| Number -> String  | string(x)                                          |
| Float -> String   | string(x)                                          |
| Boolean -> Number | +x                                                 |
| Number -> Boolean | x ? v:true : v:false                               |
## 类型检查

| Type            | Expression                               |
| --------------- | ---------------------------------------- |
| String          | type(x) is v:t\_string                   |
| Number          | type(x) is v:t\_number                   |
| Float           | type(x) is v:t\_float                    |
| Dictionary      | type(x) is v:t\_dict                     |
| List            | type(x) is v:t\_list                     |
| Funcref         | type(x) is v:t\_func                     |
| Boolean         | type(x) is v:t\_bool                     |
| v:null          | x is v:null                              |
| ? == String     | x is# 'foo'                              |
| ? == Number     | x is 42                                  |
| ? == Float      | x is 42.0                                |
| ? == Dictionary | type(x) is v:t\_dict && x ==# {'x': 'y'} |
| ? == List       | type(x) is v:t\_list && x ==# \[1, 2\]   |
| ? == Funcref    | x is function('type')                    |
| ? == Boolean    | x is v:true or x is v:false              |
| ? == v:null     | x is v:null                              |
## 条件
### if
```
if cond1
  " command1
elseif cond2
  " command2
else
  " command3
endif
```
### switch
### 循环
```
while cond
    " cmd
endwhile

for idx in range(length)
    " cmd
endfor
```
## 错误处理
```
try
  " Throw an error.
  throw 'xxx foo xxx'  " Catch all errors with a message containing 'foo'
catch /foo/
  call HandleException()  " finally is optional
finally
  call AlwaysDoSomethingElse()
endtry
```
## 函数
**函数引用类型的变量名必须以大写字母开头**
```
function! Foo() abrot
    return 42
endfunction
```
### 命名空间

```
function! myplugin#hello()
```
### Abortable
### 可变参数
`...` 表示可变参数,可变参数被收集到一个单一变量中:一个名为 a:000 的数组。为单个参数也提供了位置参 数名:a:1、a:2、a:3，等等。参数的数量可以是 a:0。
```
function! name(...)
    echo a:000
    echo a:0
    echo a:1
endfunction

function! name(name, title, ...)
    echo a:000
    echo a:0
    echo a:1
    echo a:name
    echo a:title
endfunction
```
### 其他
*   exists(expr) 判断表达式(变量、选项名、方法名等)是否存在
*   has(feature) suported feature
*   filereadable(file) file exists
## 变量
* `let` 命令用来对变量进行初始化或者赋值。
* `unlet` 命令用来删除一个变量。
* `unlet!` 命令同样可以用来删除变量，但是会忽略诸如变量不存在的错误提示。
默认情况下，如果一个变量在函数体以外初始化的，那么它的作用域是全局变量；而如果它是在函数体以内初始化的，那它的作用于是局部变量。
### 作用域

| Scope | Explanation |
| ----- | ----------- |
| g:x   | 全局          |
| l:x   | 函数          |
| a:x   | 函数参数，只读     |
| s:x   | 当前脚本        |
| v:x   | VIM内部变量，只读  |
| b:x   | buffer局部变量  |
| w:x   | window局部变量  |
| t:x   | tab局部变量     |
你可以通过 $name的模式读取或者改写环境变量，同时可以用 &option 的方式来读写 vim 内部设置的值。
### 伪变量
* `&name` 一个vim选项（指定为本地否则为全局）
* `&l:name` 本地vim选项
* `&g:name` 全局
* `@name` 一个vim注册器
* `$name` 一个环境变量
```
nmap <silent> ]] :let &tabstop+=1<CR>
```
## 行和列操作函数
## 返回指定位置的列号
**col({expr})**
列号从1开始算起。 获取长度比实际字符长度+1是因为每行的最后有一个不可打印的换行符
* 返回光标所在的列号 `col(".")`
* 返回光标所在的行的长度 `col("$")`
* 返回第2行的长度 `col([2,'$'])`
## 返回指定位置的行号
**line({expr})**
* 返回当前光标所在的行号 `line(".")`
* 返回当前缓冲区的最后一行的行号 `line("$")`
* 返回可见区域第一行的行号 `line("w0")`
* 返回可见区域的最后一行行号 `line("w$")`
* 返回visual 模式下选择区域的起始行号 `line("v")`
## 获取指定位置的行和列号
**getpos({expr})**
* `getpos(".")` 获取光标位置，返回值格式 `[0,lnum,col,off]`
## 移动光标到指定的行和列
**setpos({expr},{list})**
* `setpos(".", pos)`
* `setpos('.',[0,lnum,col,off])`
## 事件
执行大概顺序
1. `BufWinEnter`: create a default window
2. `BufEnter`: create a defautl buffer
3. `VimEnter`: start the vim session `edit demo.txt`
4. `BufNew`: create a new buffer contain demo.txt
5. `BufAdd`: add that new buffer the session’s buffer list
6. `BufLeave`: exit the defautl buffer
7. `BufWinLeave`: exit the default window
8. `BufUnload`: remove the default buffer from the buffer list
9. `BufDelete`: deallocate the default buffer
10. `BufReadCmd`: read the contexts of demo.txt into the new buffer
11. `BufEnter`: activate the new buffer
12. `BufWinEnter`: activate the new buffer’s window
13. `InsertEnter`: swap into insert mode
### 文件相关事件
这些事件与文件的操作（如打开、保存、关闭等）相关。
1. **`BufNewFile`** 当创建一个新文件时（还未保存）。可以在文件创建时执行初始化操作，例如设置模板。
2. **`BufRead` 或 `BufReadPost`** 当读取一个缓冲区（文件）时。用于在文件加载后执行操作，例如设置文件类型或格式。
3. **`BufWrite` 或 `BufWritePre`** 在写入缓冲区（保存文件）之前。可以在保存前执行检查或修改，例如删除末尾空格。
4. **`BufWritePost`** 在保存文件之后。用于保存后的后续处理，例如更新日志。
5. **`FileReadPost`** 从文件中读取数据后。处理从外部文件读取的内容。
6. **`BufDelete`** 当一个缓冲区被删除时。清理与缓冲区相关的设置或数据。
### 缓冲区相关事件
这些事件与缓冲区的状态变化相关。
1. **`BufEnter`** 进入一个缓冲区时。可以在切换到某个缓冲区时应用特定设置。
2. **`BufLeave`** 离开一个缓冲区时。保存当前缓冲区的状态或清理设置。
3. **`BufWinEnter`** 当缓冲区进入一个窗口时。用于窗口和缓冲区关联时的初始化。
4. **`BufWinLeave`** 当缓冲区离开一个窗口时。清理窗口相关的设置。
5. **`BufHidden`** 当缓冲区变为隐藏状态时。处理缓冲区不再可见的情况。
6. **`BufUnload`** 当缓冲区被卸载时（从内存中移除）。在缓冲区销毁前执行清理操作。
### 窗口相关事件
这些事件与窗口的管理和操作相关。
1. **`WinEnter`** 进入一个窗口时。设置窗口特定的选项或高亮。
2. **`WinLeave`** 离开一个窗口时。保存窗口状态或撤销设置。
3. **`WinNew`** 创建新窗口时。初始化新窗口的属性。
4. **`WinClosed`** 关闭窗口时。处理窗口关闭后的清理工作。
### Vim 生命周期相关事件
这些事件与 Vim 的启动和退出相关。
1. **`VimEnter`** Vim 完全启动后。执行全局初始化操作，例如加载插件或设置。
2. **`VimLeave`** Vim 退出之前。保存会话或清理资源。
3. **`GUIEnter`** GUI 版本的 Vim（如 gVim）启动后。设置 GUI 特定的选项。
### 文本更改相关事件
这些事件与文本内容的修改相关。
1. **`TextChanged`** 正常模式下文本发生变化时。监控文本修改并执行相关操作。
2. **`TextChangedI`** 插入模式下文本发生变化时。实时处理插入模式的修改。
3. **`InsertEnter`** 进入插入模式时。调整插入模式下的设置。
4. **`InsertLeave`** 离开插入模式时。恢复正常模式的设置。
### 其他常用事件
这些事件涉及 Vim 的其他功能或状态。
1. **`FileType`** 检测到文件类型时。根据文件类型应用特定配置，例如缩进规则。
2. **`Syntax`** 语法高亮加载时。自定义语法高亮规则。
3. **`CursorMoved`** 光标移动时。实时跟踪光标位置并执行操作。
4. **`CursorMovedI`** 插入模式下光标移动时。处理插入模式下的光标行为。
5. **`ModeChanged`** 模式切换时（例如从正常模式到可视模式）。根据模式变化执行特定命令。
6. **`QuickFixCmdPost`** QuickFix 命令（如 `:make`）执行后。处理编译或查找的结果。
### 示例
通过 Vim 的自动命令（`autocmd`），可以结合这些事件实现自动化。例如：
```vim
" 在保存文件前自动删除末尾空格
autocmd BufWritePre * :%s/\s\+$//e

" 进入 Python 文件时设置缩进
autocmd FileType python setlocal tabstop=4 shiftwidth=4 expandtab

" Vim 启动时显示欢迎信息
autocmd VimEnter * echo "欢迎使用 Vim!"
```
## 自动命令
* `autocmd`
* `autocmd!` 清除组内已有的事件绑定，防止重复
* `augroup` 定义一个事件组
* `autocmd!`
* `doautocmd` 手动触发
自动命令有一个相关的命名机制，允许它们集成一个自动命令组，这样就可以对它们进行集体操作。
```
augroup GroupName
augroup END


autocmd! [group] [eventname [filename_pattern]] 停用自动命令
```