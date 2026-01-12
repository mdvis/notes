## `-m`
Python 的 `-m` 选项允许用户以模块的形式运行指定的代码。它的基本语法如下：
```bash
python -m module_name [args...]
```
其中：
- `module_name` 是一个已安装的 Python 模块的名称（可以是标准库中的模块，也可以是第三方模块）。
- `[args...]` 是传递给该模块的命令行参数。
使用 `-m` 选项时，Python 会将指定的模块作为脚本运行，而不是直接执行某个 `.py` 文件。这使得我们可以像运行命令行工具一样运行某些模块。
### 常见用法
以下是一些常见的 `-m` 选项用法示例：
#### 运行标准库模块
许多 Python 标准库模块都可以通过 `-m` 选项运行。例如：
- 启动 HTTP 服务器：
  ```bash
  python -m http.server 8000
  ```
  这会在当前目录启动一个简单的 HTTP 服务器，监听端口 8000。

- 运行 `pip` 安装包：
  ```bash
  python -m pip install requests
  ```
  这与直接运行 `pip install requests` 效果相同，但更推荐这种方式，因为它确保使用的是当前 Python 解释器对应的 `pip`。
#### 运行自定义模块
如果有一个自定义的 Python 包或模块，可以通过 `-m` 选项运行它。例如，假设有一个包结构如下：
```
my_package/
    __init__.py
    my_module.py
```
在 `my_module.py` 中定义了入口函数：
```python
def main():
    print("Hello from my_module!")

if __name__ == "__main__":
    main()
```
可以通过以下方式运行：
```bash
python -m my_package.my_module
```
#### 调试和测试
`-m` 选项常用于运行调试工具或测试框架。例如：
- 使用 `unittest` 运行测试：
  ```bash
  python -m unittest discover
  ```
- 使用 `pdb` 调试脚本：
  ```bash
  python -m pdb my_script.py
  ```
### 实现原理
`-m` 选项的核心实现原理涉及 Python 的模块加载机制和路径搜索逻辑。以下是其工作流程的详细分解：
#### 模块路径解析
当使用 `-m` 选项时，Python 会尝试从 `sys.path` 中查找指定的模块。`sys.path` 是一个列表，包含了 Python 寻找模块的所有路径，通常包括：
- 当前工作目录；
- 标准库路径；
- 第三方库路径（如通过 `pip` 安装的包）。
Python 会按照 `sys.path` 的顺序依次查找目标模块。如果找不到模块，会抛出 `ModuleNotFoundError` 错误。
#### 模块加载
找到模块后，Python 会将其作为主模块加载，并执行模块中的代码。具体步骤如下：
1. **检查模块是否存在**：Python 会根据模块名查找对应的 `.py` 文件或包。
2. **设置 `__name__` 变量**：被加载的模块会被赋予 `__name__ = "__main__"`，这使得模块中的 `if __name__ == "__main__":` 块会被执行。
3. **执行模块代码**：Python 会执行模块中的代码，包括调用 `main()` 函数（如果有定义）。
#### 参数传递
通过 `-m` 选项运行模块时，所有后续的命令行参数都会被传递给模块。模块可以通过 `sys.argv` 获取这些参数。
例如，运行以下命令：
```bash
python -m my_module arg1 arg2
```
在 `my_module.py` 中，可以通过以下方式访问参数：
```python
import sys

def main():
    print("Arguments:", sys.argv[1:])

if __name__ == "__main__":
    main()
```
输出结果为：
```
Arguments: ['arg1', 'arg2']
```
### 注意事项
#### 模块名必须是合法的
`-m` 选项要求模块名是合法的 Python 标识符。例如，不能包含特殊字符或以数字开头。
#### 模块必须可导入
模块必须存在于 `sys.path` 中，否则会报错。如果模块位于当前目录下，确保当前目录在 `sys.path` 中。
#### 避免命名冲突
如果当前目录下有一个与标准库模块同名的文件，可能会导致冲突。例如，如果当前目录下有一个名为 `http.py` 的文件，运行 `python -m http.server` 时会优先加载本地的 `http.py`，而不是标准库的 `http` 模块。
### 总结
`-m` 选项是 Python 提供的一个强大工具，允许用户以模块的形式运行代码。它的主要优势包括：
- 简化模块调用，无需显式指定 `.py` 文件路径；
- 确保使用正确的 Python 解释器和模块版本；
- 提供统一的命令行接口，方便集成到脚本或工具链中。
通过理解其工作原理和常见用法，可以更好地利用 `-m` 选项来简化开发和部署流程。

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