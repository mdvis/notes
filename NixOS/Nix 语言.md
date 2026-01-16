## 惰性求值
-  不使用不计算（值、属性集元素）
```
nix-instantiate --eval *.nix
nix-instantiate --eval --strict *.nix
```
## 注释、缩进、换行
- 注释用 `#`
- 缩进大多数情况是为了可读性
- 换行和空格具有分割作用，不可随意断行
## 名称、属性集`{}`
名称可以理解成变量，更像常量不可变
- 字符串 `"string"`
- 整数 `1,2,3`
- 浮点数 `3.142,2.718`
- 布尔 `true,false`
- null `null`
- 列表 `["" 1 false]`
- 属性集 `{ a = 1; b = "tux"; c = false }`
- 函数 `x: x + 1`
### 属性集
- 键值对
- 末尾必须加`;`
```
{
	a=1;
	b={
		c=2;
	};
	b.d=3; // 属性访问，赋值取值均可
}
```
#### 递归属性集`rec{}`
普通属性集不支持递归引用
```
{
	a=1;
	b=a+1; # error: undefined variable 'a'
}

rec {
	a=1;
	b=a+1; # b = 2
}
```
## 列表`[]`
- 空格或换行分割元素
	- 两个列表拼接 `++`
## 赋值与访问
### let 绑定
- 指定范围内（后面的表达式中）
- `let` 与 `in` 之间键值对以`;`结尾
- `in` 之后只有一个表达式（语法要求），表达式可以很复杂
```
let 
	a=1;
	b=2;
in
	a+b
```
### with 和 inherit
with
```
let
	a={x=1;y=2;}
in
{
	R1 = [a.x a.y]
	R2 = with a;[x y] # [1 2]
}
```

```
let
	x=0
	a={x=1;y=2;}
in
{
	R1 = [a.x a.y]
	# with 表达式的就近性
	# x 可以直接取到，无需去嵌套中取
	R2 = with a;[x y] # [0 2]
}
```
inherit
```
let
	a=1;
	b=2;
	c={ d=3; e=4; }
in
{
	inherit a b;
	inherit (c) d e; }
```
## 路径（一种数据类型，不同于字符串）
- 路径中至少包含一个`/`
- 路径不能以`/`结尾，如果需要要在`.`后面加`.`
-  支持字符串插值 `"${./foo.txt}"`
## 检索路径`<>`尖括号语法
通过系统变量来获取路径的语法，以一对尖括号`<`和`>`包裹内容
## 字符串
- `" "` 双引号包裹
- 多行字符串
	- `str1\nstr2\nstr3` 两组单引号包裹
	- `'' ''` 两组单引号包裹
- 插值 `${...}`，其只支持字符串类型的变量
- 转义
	- 单行使用`\`
	- 多行使用`''`
```
let
  name = "Nix";
in
  "hello ${name}"
```

```
let
	x = 1;
in
	"${x} + ${x} = ${x+x}" # error: cannot coerce an integer to a string
	"${toString x} + ${toString x} = ${toString(x + x)}"
```
## 函数
- 参数和函数体由冒号分隔
- 匿名函数`x:x+1`
- 匿名函数调用`(x:x+1) 2`
- 每个函数只能有一个形参，多参用属性集变通实现(只包含属性名，逗号分隔)
```
let
  f = x: x + 1
in
  f 2
```

```
{x, y}: (3 * x) + (y / 2)
```
### 属性默认值
```
let
  greet = { greeting ? "Hello, ", object}:greeting + object + "!";
in
{
	greet {object="world";}
	greet {greeting = "Welcome, ";object = "my friend" }
	# Hello, world! 和 Welcome my friend!
}
```
### 额外属性
```
let
  concat2 = {a, b, ...}: a + b
in
  concat2 {a=""; b=""; c=""} # 多了c，不会报错
```
### 命名属性集
```
let
  a = { a,b }: a + b
  b = A: A.a + A.b
  c = { a,... }@A: a + A.b
in
{
  e = a { a = 1; b = 2; };
  d = b { a = 3; b = 4; };
  f = c { a = 5; b = 6; };
}
```
### 柯里化
```
let
  f = x: (y: x + y);
in
{
  g = f 4 5;
}
```

```
let
  f = x: (y: x + y);
  g = f 4;
in
{
  h = g 5;
}
```
### 函数库
- `+`、`-`、`*`、`/`、` == `、`&&`
- 内建函数可以通过常量 `builtins` 访问
- import
- toString
- map
- `pksg.lib` 

```
let 
	pkgs = import <nixpkgs> {};
in
pkgs.lib.strings.toUpper "Have a good day!"
```
pkgs 通常被作为参数传递给函数，按约定其指向 nixpkgs 属性集
```
{ pkgs, ... }:
pkgs.lib.strings.removePrefix "I" "I see you!"
```
## URL
```
# 两种形式均可
a = http://example.org
b = "http://example.org"
```
## 条件判断
```
if <exprCond> then <exprThen> else <exprElse>

if <exprCond> then <exprThen> else if <exprCond> else <exprElse>
```
## 循环
- 没有`while/for`，基于递归的高阶函数
### 递归函数
```
let 
  recurse = n: if n <= 0 then [] else recurse(n - 1) ++ [n];
in
  recurse 5
```
## 模块
### 工作原理
三个组成：导入（imports）、选项（options）、配置（config）
```
{ config, pkgs, ... }:
{
  imports = [
    # 导入模块
  ];
  
  options = {
    # 声明选项供其他模块设置
	# myModule 模块名字，使用小驼峰
	# 模块名取决于这里，而不是文件名
    myModule.enable = mkOption {
		type = types.bool;
		default = false;
		description = "描述模块";
    };
  };

  # mkIf 使得后面的选项为 true 时执行
  config = mkIf config.myModule.enable {
    # 选项激活后进行的动作
	systemd.services.myService = {
		wanteedBy = ["multi-user.target"];
		script = ''
		  # 服务启动时运行此脚本
		  each "Hello, NixOS"
		'';
	};
  };
}
```