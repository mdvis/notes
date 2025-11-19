# oop
面向对象

* * *

\[toc\]

类型系统

* * *

实际上类型系统才是一门编程语 言的地基，它的地位至关重要

类型系统是指一个语言的类型体系结构。一个典型的类型系统通常包含如下基本内容

*   基础类型，byte，int，bool，float等
*   复合类型，数组，结构体，指针等
*   可以指向任意对象的类型（any类型）
*   值语义和引用语义
*   面向对象，即所有具备面向对象特征（比如成员方法）的类型
*   接口

类型系统描述的是这些内容在一个语言中如何被关联

### 为类型添加方法

go中可以给当前包内任意类型（包括内置类型，但不包括指针类型）添加相应的方法

*   方法施加的目标（也就是对象）显示传递，没有隐藏起来
*   方法施加的目标（也就是对象）不需要非得是指针，也不用非得叫this

```go
type Integer int

func (s Integer) Less(b Interger) bool { //函数名前面部分相当于python的self，js的this，称作receiver
    return s < b
}

func Less2(s, b Interger) bool { //函数名前面部分相当于python的self，js的this，称作receiver
    return s < b
}

func main(){
    var a Interger = 1
    a.Less(2)  // 面向对象
    Less2(a, 2)  // 面向过程
}
```

### 值语义和引用语义

值语义

*   基本类型，byte，int，bool，float32，float64和string等
*   复合类型，数组，结构体和指针等

数组复制是值复制`b = a`，想要表达引用需要使用指针`b = &a` 这是b的类型是`*[3]int`而不是`[3]int`

*   数组切片：指向数组的一个区间；其本质是一个区间，\[\]T大致可表示为如下，切片内部指向数组指针，所以会改变指向数组元素

```go
type slice struct {
    first *T
    len int
    cap int
}
```

*   map：极其常见的数据结构，提供键值查询能力

map本质是一个字典指针，map\[K\]V大致表现如下

```go
type Map_K_V struct {}
type map[K]V struct {
    impl *Map_K_V
}

// 基于指针可以自定义一个引用

type IntegerRef struct {
    impl *int
}
```

*   channel：执行体（goroutine）间的通信设施

channel和map类似，本质上是一个指针，将他们设计为引用类型而不是统一的值类型的原因是，完整复制一个channel或map并不是常规需求

*   接口：对一组满足某个契约的类型的抽象

接口具备引用语义是因为内部维持两个指针，如下，接口在go中非常重要

```go
type interface struct {
    data *void
    itab *Itab
}
```

这四个看起来像引用类型，实际并不影响其类型被看做值语义

### 结构体

go语言放弃了包括继承在内的大量面向对象的特性，只保留了组合这个最基础的特性。组合甚至都不算面向对象的特性。组合只是形成复合类型的基础

```go
type Rect struce {
    x, y float64
    width, height float64
}

func (a Rect) Area() float64{
    return a.width * a.height
}
```

初始化

* * *

```go
rect1 := new(Rect)
rect2 := &Rect{}
rect3 := &Rect{0, 0, 100, 100}
rect3 := &Rect{ width: 100, height: 100}
```

未进行显式初始化的变量都会被初始化为该类型的零值，例如bool类型的零 值为false，int类型的零值为0，string类型的零值为空字符串。

没有构造函数的概念， 对象的创建通常交由一个全局的创建函数来完成， 以 NewXXX来命名，表示“构造函数”

```go
func NewRect(x, y, width, height float64) *Rect {
    return &Rect {x,y,width,height}
}
```

匿名组合

* * *

确切地说，Go语言也提供了继承，但是采用了组合的文法，所以我们将其称为匿名组合

```go
type Base struct {
    Name string
}

func (base *Base) Foo(){}
func (base *Base) Bar(){}

type Foo struct {
    Base
}

// 使Foo”继承“并改写了Bar方法
func (foo *Foo) Bar() {
    foo.Base.Bar()
    ...
}
// 调用foo.Foo和foo.Base.Foo效果一致
// 匿名组合类型相当于以其类型名称（去掉包名部分） 作为成员变量的名字
func (foo *Foo) Bar() {
    ...
    foo.Base.Bar()
}
// 属性顺序对应这内存布局（位置前后）
```

以指针方式从一个类型”派生“

```go
type Foo struct {
    *Base
    ...
}
```

这时创建实例的时候，需要外部提供一个Base类实例的指针（类似c++虚基类）

```go
type Job struct {
    Command string
    *log.Logger
}
```

在合适的赋值后，我们在Job类型的所有成员方法中可以很舒适地借用所有log.Logger提 供的方法

```go
func (job *Job) start(){
    job.Log("starting")
    ...
    job.Log('end')
}
```

可见性

* * *

要使某个符号对其他包（package）可见（即可以访问），需要将该符号定义为以大写字母 开头；Go语言中符号的可访问性是包一级的而不是类型一级的

接口
--

接口采用duck type方式，无需显示声明。

接口在Go语言有着至关重要的地位。如果说goroutine和channel 是支撑起Go语言的并发模型 的基石，让Go语言在如今集群化与多核化的时代成为一道极为亮丽的风景，那么接口是Go语言 整个类型系统的基石，让Go语言在基础编程哲学的探索上达到前所未有的高度。

### 其他语言接口（java，c）

*   在Go语言出现之前，接口主要作为不同组件之间的契约存在。对契约的实现是强制的，你 必须声明你的确实现了该接口。为了实现一个接口，你需要从该接口继承。
*   这类接口我们称为侵入式接口。“侵入式”的主要表现在于实现类需要明确声明自己实现了 某个接口。

### 非侵入式接口

*   一个类只需要实现了接口要求的所有函数，我们就说这个类实现了该接口

```go
type File struct {}

func (f *File) Read(buf []byte) (n int, err error)
func (f *File) Write(buf []byte) (n int, err error)
func (f *File) Seek(off int64, whence int) (pos int64, err error)
func (f *File) Close() error

type IFile interface {
    Read(buf []byte) (n int, err error)
    Write(buf []byte) (n int, err error)
    Seek(off int64, whence int) (pos int64, err error)
    Close() error
}

type IReader interface { Read(buf []byte) (n int, err error) }

type IWriter interface { Write(buf []byte) (n int, err error) }

type ICloser interface { Close() error }

// 尽管File类并没有从这些接口继承，甚至可以不知道这些接口的存在，但是File类实现了这些接口(有接口要求的所有函数)，可以进行赋值：
var file1 IFile = new(File)
var file2 IReader = new(File)
 var file3 IWriter = new(File)
 var file4 ICloser = new(File)
```

小的文法调整，深远的影响

*   go标准库再也不需要绘制类库的继承树图
*   实现类的时候，只需要关心自己应该提供哪些方法，不需在纠结细粒度问题，接口由使用方按需定义，无需事前规划
*   不用为了实现一个接口而导入一个包，因为多饮用一个外部的包，就意味着更多的耦合，接口有需求方按自身需求定义，使用方无需关心是否有其他模块定义过类似的接口

### 接口赋值

接口赋值分为两种情况：

1.  将对象实例赋值给接口，要求对象实例实现了接口所要求的所有方法
2.  将一个接口赋值给另一个接口

#### 赋值给接口

```go
type Inte int

func (a *Inte) Add(b Inte){}

func (a Inte) Less(b Inte) bool {}
// 会自动生成如下方法
func (a *Inte) Less(b Inte) bool {
    return (*a).Less(b)
}

// 这样Less和Add都在*Inte上
// 所以给如下接口赋值时要使用*Inte(指针)
type LessAdder interface {
    Less(b Inte)bool
    Add(b Inte)
}

var a Inte = 1
var b LessAdder = &a
```

#### 将一个接口赋值给另一个接口

**只要两个接口拥 有相同的方法列表（次序不同不要紧），那么它们就是等同的，可以相互赋值；也可以赋给子集**。

### 接口查询

在Go语言中，对象是否满足某个 接口，通过某个接口查询其他接口，这一切都是完全自动完成的。

```go
var file1 Writer = ...
if file2, ok := file1.(*File); ok {}  // 判断file1接口指向的对象实例是否是*File类型
```

### 类型查询

询问**接口指向的对象实例**的类型

```go
var v1 interface {} = ...
switch v := v1.(type){
case int:
    ...
case string:
    ...
default:
    ...
}
// .(type)只能用于switch语句
```

通常类型查询不常用，更多是个补充需要配合接口使用

利用反射也可以进行类型查询，reflect.TypeOf()

### 接口组合

type Read interface {} type Write interface{} type ReadWrite interface { Reader Write}

### any类型

因为任何对象都满足空接口 interface{}，所以 interface{} 看起来像是可以指向任何对象的 any

函数可以接受任意参数时，会将其声明为interface{}

```go
func Printf(args ...interface){}
```