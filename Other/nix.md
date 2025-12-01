`nix-env` —— 用户级包管理器

`nix-env` 是 **Nix 包管理的用户接口**，主要用于**在当前用户环境安装、升级、卸载软件**，类似于 `apt install` 或 `brew install`，但具备 Nix 的特性：**不破坏系统，版本可并存，可回滚**。

### 常用操作

| 命令                          | 功能                       |
| --------------------------- | ------------------------ |
| `nix-env -iA nixpkgs.<pkg>` | 安装某个包（A 表示按属性名安装）        |
| `nix-env -u`                | 升级已安装的所有包                |
| `nix-env -e <pkg>`          | 卸载包                      |
| `nix-env -q`                | 查询当前已安装的包                |
| `nix-env -qaP <keyword>`    | 搜索可用包（a 表示所有，P 表示显示属性路径） |

#### 示例

```bash
nix-env -iA nixpkgs.htop   # 安装 htop
nix-env -qaP python        # 搜索 Python 相关的包
nix-env -e htop            # 卸载 htop
```

> **特点**
>
> - 对当前用户生效，不影响系统其他用户
>
> - 安装的包会放在 `~/.nix-profile`，并通过 symlink 链接到 Nix store
>
> - 不需要 root 权限
>
> - 缺点：不声明化，不方便系统迁移（更适合临时性安装）
>

`nix-shell` —— 临时开发环境

`nix-shell` 用于**进入一个带有指定依赖的临时 shell 环境**，常用于开发时加载依赖而不污染全局系统。

### 两种用法

#### ① 直接命令行临时环境

```bash
nix-shell -p python39 git
```

进入后，你会有一个临时 shell，内置 `python3.9` 和 `git`。退出后，这些包不会保留在系统中。

#### ② 使用 `shell.nix` 或 `default.nix`

适合开发项目，把依赖写在 `shell.nix` 里，让团队所有人进入相同环境：

```nix
# shell.nix
{ pkgs ? import <nixpkgs> {} }:
pkgs.mkShell {
  buildInputs = [
    pkgs.python39
    pkgs.git
  ];
}
```

然后：

```bash
nix-shell   # 自动加载 shell.nix
```

> **特点**
>
> - 环境是**临时的**，退出后不影响系统
>
> - 非常适合构建 reproducible（可复现）的开发环境
>
> - 支持自动下载、隔离依赖
>
> - 常与 CI/CD、科研、开源项目配合
>

下面是 **最全面、系统、详细的 Nix 文件语法说明**（涵盖 Nix 语言全语法：表达式结构、数据类型、函数、作用域、继承、包 derivation、导入、字符串、多行语法、运算等）。

这是一个 **完整语言教程级别** 的说明，你可以把它当作 Nix 语言语法手册阅读。

---

## nix 表达式
# 🧱 1. Nix 语言基础结构

Nix 语言是：

- **表达式语言**（everything is an expression）
    
- **纯函数式**（无副作用）
    
- **延迟求值**（lazy evaluation）
    

一个 `.nix` 文件最终必须返回一个**值**，可以是：

- 字符串
    
- 数字
    
- 布尔
    
- 列表
    
- 集合（attribute set）
    
- 派生（derivation）
    
- 函数
    

示例：

```nix
"hello"
```

---

# 🔢 2. 数据类型

Nix 有以下数据类型：

## 2.1 字符串（String）

### 普通字符串

```nix
"hello world"
```

### 字符串插值（${}）

```nix
"${pkgs.hello}/bin/hello"
```

### 多行字符串

```nix
''
  line1
  line2
''
```

缩进会被移除。

---

## 2.2 数字（Int）

整数：

```nix
123
```

---

## 2.3 布尔（Bool）

```nix
true
false
```

---

## 2.4 Null

```nix
null
```

---

## 2.5 列表（List）

```nix
[ 1 2 3 ]
[ "a" "b" ]
[ pkgs.vim pkgs.git ]
```

列表中元素以空格分隔。

---

## 2.6 集合（Attribute Set）

类似 JSON / dict。

```nix
{
  name = "hello";
  version = 1;
}
```

### 嵌套集合

```nix
{
  env = {
    PATH = "/bin";
  };
}
```

### 动态 key（字符串化）

```nix
{
  "foo bar" = 123;
}
```

---

# 🔃 3. 运算符

## 3.1 算数运算符

```nix
1 + 2
3 - 1
a * b
a / b
```

---

## 3.2 布尔运算符

```nix
true && false
true || false
! true
```

---

## 3.3 比较运算符

```nix
1 == 1
"a" != "b"
1 < 2
```

---

## 3.4 字符串拼接

```nix
"hello" + "world"
```

---

## 3.5 列表连接

```nix
[1 2] ++ [3 4]
```

---

# 🧩 4. 函数（Function）

Nix 语言中的函数是 **单参数**，但可以模拟多参数。

## 4.1 单参数函数

```nix
x: x + 1
```

调用：

```nix
(x: x + 1) 10   # => 11
```

---

## 4.2 多参数（使用 Attrset 解构）

这是 Nix 最常见的模式：

```nix
{ a, b }: a + b
```

调用：

```nix
({ a = 1; b = 2; })  # => 3
```

---

## 4.3 默认参数

```nix
{ a, b ? 10 }: a + b
```

---

## 4.4 可选参数 + 捕获剩余参数（...）

```nix
{ a, b, ... }:
a + b
```

任意多余字段被忽略。

---

# 🧱 5. let-in 作用域

局部变量定义：

```nix
let
  x = 1;
  y = 2;
in
x + y
```

---

# 🧱 6. with 语句（污染 scope — 谨慎使用）

```nix
with pkgs;
[ vim git ]
```

展开为：

```nix
[ pkgs.vim pkgs.git ]
```

---

# 🧱 7. inherit 继承

## 7.1 从当前 scope 继承字段

```nix
let
  a = 1;
  b = 2;
in {
  inherit a b;
}
```

相当于：

```nix
{ a = a; b = b; }
```

---

## 7.2 从集合继承

```nix
{ inherit (pkgs) vim git; }
```

相当于：

```nix
{ vim = pkgs.vim; git = pkgs.git; }
```

---

# 🧭 8. 导入（import）

## 8.1 导入一个文件

```nix
import ./file.nix
```

如果 file.nix 是函数：

```nix
(import ./file.nix) { pkgs = pkgs; }
```

---

# 🧪 9. if-then-else

```nix
if condition then expr1 else expr2
```

---

# 🧱 10. 选择器（Attrset Access）

## 10.1 点访问

```nix
pkgs.git
```

## 10.2 动态 key

```nix
myset.${key}
```

---

# 🧩 11. 模板字符串（Indented Strings）高级语法

### 内插表达式中允许 Nix 语法

```nix
"result: ${builtins.toString (1 + 2)}"
```

---

# 🔧 12. builtins 内建函数

常用：

- `builtins.toString`
    
- `builtins.length`
    
- `builtins.attrNames`
    
- `builtins.readFile`
    
- `builtins.fetchTarball`
    
- `builtins.filter`
    
- `builtins.map`
    
- `builtins.path`
    
- `builtins.getEnv`
    

示例：

```nix
builtins.length [1 2 3]   # => 3
```

---

# 🏗️ 13. Derivation（构建包）

核心构建表达式：

```nix
stdenv.mkDerivation {
  pname = "hello";
  version = "1.0";
  src = ./.;
}
```

每个字段都是一个 Nix 表达式。

---

# 🧱 14. 文件路径语法

```nix
./file
../src
/foo/bar
```

---

# 🧊 15. Flake 文件语法（flake.nix）

核心结构：

```nix
{
  description = "Example";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs";
  };

  outputs = { self, nixpkgs }: {
    packages.x86_64-linux.default =
      nixpkgs.legacyPackages.x86_64-linux.hello;
  };
}
```

---

# 🧩 16. 完整语法例子（综合使用）

```nix
{ pkgs ? import <nixpkgs> {} }:

let
  version = "1.0";
in

pkgs.stdenv.mkDerivation {
  pname = "demo";
  inherit version;

  src = ./src;

  buildInputs = with pkgs; [ gcc ];

  installPhase = ''
    mkdir -p $out/bin
    cp demo $out/bin/
  '';
}
```