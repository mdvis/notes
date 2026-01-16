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
	inherit (c) d e;
}
```