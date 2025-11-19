# data
数据
--

\[TOC\]

字符串

* * *

不可变的字节序列，是一个复合结构。头部指针指向字节数组，但没有NULL结尾。默认UTF8编码存储Unicode字符。

unsafe.Pointer 用于指针类型转换

```go
type stringStruct struct {
    str unsafe.Pointer
    len int
}
```

*   字符串默认值为“”，而非nil。
*   使用"\`"定义不做转义的原始字符串，支持跨行。
*   编译器不会解析原始字符串内的注释语句，且前置缩进空格也属字符串内容。
*   支持 != == < > + +=，换行时符号在行尾
*   允许用索引号访问字节数组（非字符），但不能获取元素地址
*   以切片语法返回子串时，其内部依旧指向原字节数组
*   使用for遍历时，分为byte和rune两种方式

### 转换

修改字符串需要将其转换为可变类型\[\]rune 或 \[\]byte,完成后再转换回来，重新分配内存，并复制数据

*   rune
*   reflect.Pointer
*   unsafe
*   unsafe.Pointer
*   uintptr

有时候类型转换可以依靠unsafe非安全指针的方式进行提升性能避免，避免数据复制。

1.  指针类型，存储内存地址，地址指向内存空间
2.  unsafe.Pointer类型，实现定位和读写内存的基础，可以和任意类型指针相互转换，可以和uintptr类型相互转换
3.  unitptr类型，存储指针的整型，可以做指针运算，依赖平台，不同平台占用存储空间不同，运算时不同平台偏移量不同

### 性能

类型转换，动态构建字符串也容易造成性能问题。

拼接字符串时每次都必须重新分配内存。操作大字符串时会出现性能问题；**改进思路是预分配足够的内存空间，string.Join函数，会统计所有参数长度一次性完成内存分配**

*   copy
*   bytes.Buffer
*   string.Join

少量字符串拼接

*   fmt.Sprintf
*   text
*   template
*   zero-garbage

字符串操作通常在堆上分配内存，这对web等高并发应用会造成较大影响，会有大量字符串对象要做垃圾回收。建议使用\[\]byte缓存池，或者在栈上自行拼装等方式实现zero-garbage

*   zero-garbage

字符串的只读特性转换时会复制数据分配新内存。有时候编译器也做一些优化，避免额外复制分配内存

*   将\[\]byte转换为string key，去map\[string\]查询的时候
*   将string转换为\[\]byte，进行for range迭代时，直接取字节赋值给局部变量

### unicode

rune类型专门用来存储Unicode马甸，他是int32的别名，相当于UCS-4/UTF-32编码格式，使用单引号字面量，其默认类型就是rune

```go
func main(){
r:='我'
}
```

除了\[\]rune外，还可以直接在rune，byte，string间转换

```go
r:='t'
a:=string(r)
b:=byte(r)
c:=string(b)
d:=rune(b)
```

string直接追加到\[\]byte

```go
var bs []byte
append(bs, "abc"...)
```

*   utf8.RuneCountInString

数组
--

定义数组时数组长度必须是非负整型常量表达式。长度是类型组成部分。即是说长度不同的数组不属于同一类型。

```go
var d1 [2]int
var d2 [3]int
d1=d2 //error
```

初始化

```go
var a[4]int
b:=[4]int{2,4}
c:=[4]int{5,3:10} // 初始化指定索引
d:=[...]int{1,2,3} // 根据初始值决定数组长度

type user struct {
    name string
    age byte
}

d:=[...]user{
    {"tom",20}
}
```

定义多维数组时只允许第一层使用 ...

```go
c:=[...][2][2]{
    {
        {1,2},
        {3,4},
    }
}
```

len 和 cap 都可以返回第一维度长度 如果元素类型支持 == != 操作符，那么数组也支持此操作

```go
c:=[2]int{1,2}
d:=[2]int{3,4}
c!=d

var e,f [2]map[string] int
e==f // error
```

### 指针

要分清指针数组和数组指针的区别，指针数组是指元素为指针类型的数组，数组指针是获取数组变量的地址\*\*一定注意区分数组和切片）

### 复制

Go数组是值类型，赋值和传参操作都会复制整个数组数据。指针或切片可避免数据复制。

切片
--

切片是一个右半开区间，以开始和结束索引位置确定所引用的数组片段

```go
type slice struct {
    array unsafe.Pointer
    len int
    cap int
}
```

*   cap 表示切片所引用数组片段的真实长度
*   len 用于限定可读的写元素数量。
*   数组必须addressable
*   因为是引用类型，需使用make函数或显示初始化语句，它会自动完成底层数组内存分配

```go
make([]int,3,5) // 指定len, cap 底层数组初始化为0,[0,0,0]
make([]int,3) // 省略cap 和 len相等, [0,0,0]
[]int{10,20,5:30} // [10,20,0,0,0,30]
```

### reslice

基于切片创建新切片，\[cap\]slice 不能超出 cap 不受 len 限制

```go
stack := make([]int,0,5)
stack = [:5] // 最大5不能超出之前的cap5
```

### append

向切片尾部（slice\[len\]）添加数据返回新的切片对象

```go
a:=make([]int,0,5)
append(a,1)
append(a,3,4)
```

使用append时插入数据追加到原底层数组，如果超出cap，则为新切片对象重新分配数组。

*   超出切片cap限制，而非地城数组长度限制，cap可能小于数组长度
*   新分配数组是原cap两倍,或者四分之一倍，以节省内存，不是原数组的
*   向nil切片追加数据时，会为其分配底层数组内存

正因为存在重新分配底层数组的缘故，在某些场合建议预留足够多的空间，避免中途内存分配和数据复制开销。

### copy

两个切片对象间复制数组，允许指向统一底层数组，允许目标区间重叠。最终复制长度以较短的切片长度为准,返回复制元素个数。

```go
s1:=[]int{1,2,3}
s2:=[]int{4,5,6,7,8}
copy(s1,s2) // s1:[4,5,6]
copy(s2,s1) // s2:[1,2,3,7,8]
copy(s2[1:3], s2[2:4]) // s2:[4,6,7,7,9]
```

可以从字符串复制数据到\[\]byte

如果切片长时间引用大数组中很小的片段，那么建议新建独立切片，复制出所需数据，以便原数组内存可被及时回收。

map

* * *

字典的key必须是可以支持相等运算符（== ！=）的数据类型，数字 字符串 指针 数组 结构体 接口

map只能和nil比较，除此之外均不可

字典是引用类型，使用make函数或初始化表达语句来创建；访问不存在的键值默认返回0，不会引发错误。推荐使用ok-idiom模式，毕竟通过0值无法判断值是否存在，或许存的值是0

```go
make(map[string]int)

map[int]struct{
    x int
}{
    1: {x:2},
}

v,o := v[1]
```

len返回当前键值对数量，cap 不接受字典。由于内存安全和哈希算法等缘故，字典是not addressable，不能直接修改value成员（结构或数组）

```go
m[1].age = 1 // error

v:=m[1]
v.age=1
m[1]=v

m[key]++ // 是合法的相当于 m[key]=m[key]+1
```

nil字典不能进行写操作，但是可以读

```go
var m map[string]int // map[] == nil
m['a'] // 0
m['a'] = 1 // err

m2:=map[string]int{} // map[] != nil 已初始化，make
```

### 安全

迭代是删除和新增键值是安全的的

```go
m:=make(map[int]int)
for i:=0;i<10;i++ {
    m[i]=i+10
}
for k:=range m{
    if k==5 {
        m[100]=100
    }
    delete(m,k)
    fmt.Println(k,m)
}
```

就此例而言，不能保证迭代操作会删除新增的键值。

运行时会对字典并发操作做出检测。如果某个任务正在对字典进行写操作，那么其他任务就不能对该字典执行并发操作（读、写、删除），否则会导致进程崩溃。

```go
go run -race <filename> // 数据竞争 data race 检查这种问题
```

*   sync.RWMutex

```go
func main() {
 var lock sync.RWMutex
 m := make(map[string]int)
 go func() {
  for {
   lock.Lock()
   m["a"] += 1
   lock.Unlock()
   time.Sleep(time.Microsecond)
  }
 }()

 go func() {
  for {
   lock.RLock()
   _ = m["b"]
   lock.RUnlock()
   time.Sleep(time.Microsecond)
  }
 }()
 select {}
}
```

### 性能

字典对象本身就是指针包装，传参时无需再去取地址。创建时预先分配足够空间有助于提升性能，减少扩张时的内存分配和重新哈希操作。

对于海量小对象，应直接用字典存储键值数据拷贝，而非指针。这有助于减少需要扫描的对象数量，大幅缩短垃圾回收时间。另外，字典不会收缩内存，所以适当替换成新对象是必要的。

结构
--

结构体将多个不同类型命名字段序列到宝成一个复合类型。字段名必须唯一，可用"\_"补位，支持使用自身指针类型成员。字段名、排列顺序属于类型组成部分。除对齐处理外，编译器不会优化、调整内存布局。

```go
type node struct {
    _ int
    id int
    next *node
}

n1:=node{
    id:1,
}
n2:=node{
    id:2,
}
```

按顺序初始化全部字段，或使用命名方式初始化指定字段。

```go
type user struct {
    name string
    age byte
}

user{"Tom",12}
user{"Tom"} // error few values
user{name:"Tom"}
```

推荐使用命名初始化。这样在扩充结构字段或调整字段顺序时，不会导致初始化语句出错。

可直接定义匿名结构类型变量，或用做字段类型。**但因其缺少类型表示，在作为字段类型时无法直接初始化。**

```go
type file struct {
    name string
    attr struct {
        size int
        owner int
    }
}

f:=file{
    name: "n.txt",
    // attr : {       error: missing type in composite literal
    //    size:5
    //    owner:3
    // }
}
f.attr.size=2
f.attr.owner=2
```

### 空结构

没有字段的结构类型，不管他自身还是作为数组元素类型，其长度都为0,没有分配数组内存，但依然可以操作元素，对应len和cap属性也正常。

```go
var a struct{}
var b[100]struct{}

unsafe.Sizeof(a) //0
unsafe.Sizeof(b) //0

s:=b[:]
d[1]=struct{}{}
s[2]=struct{}{}
len(s) // 100
cap(s) // 100

a:=[10]struct{}{}
b:=a[:] // 底层数组指向zerobase， 而非slice
```

*   runtime.zerobase

空结构可以作为通道元素类型，用于事件通知。

```go
exit := make(chan struct{})

go func(){
    exit <-struct{}{}
}()

<- exit
```

### 匿名字段

所谓匿名字段是指没有名字，仅有类型的字段，也被称作嵌入字段或嵌入类型。编译的角度来看，这只是隐式的以类型名作为字段名。可直接引用匿名字段的成员，但是初始化时须当作独立字段。

```go
f:=file{
    name:'test.txt',
    attr:attr{
        perm:0775,
    }
}

f.perm=755
println(f.perm)

// 嵌入其他包中的类型，隐式字段名字不包括包名
type data struct {
    os.File
}
d:=data{
    File: os.File()
}
```

除了接口指针和多级指针以外的任何命名类型都可以作为你名字段,未命名类型没有名字标识，自然无法作为匿名字段

```go
type data struct {
    *int
    string
}

d:=data{
    int: &x,
    string: "",
}

//
data{
int:(*int)(0xc097978099sd),
string: "",
}
```

虽然可以像普通字段那样访问匿名字段成员，但会存在重名问题。默认情况下，编译器从当前显式命名字段开始，逐步向内查找匿名字段成员。如匿名字段成员被外层同名字段遮蔽，那么必须使用显式字段名。

### 字段标签

字段标签不是注释，而是用来对字段进行描述的元数据。尽管他不属于数据成员，但却是类型的组成部分。

运行期间可用反射获取标签信息。他常用做函数校验，数据库关系映射等。

```go
type user struct {
    name string `名称`
    sex byte `性别`
}

u:=user{"Tom",1}
v:=reflect.ValueOf(u)
t:=v.Type()

for i,n:=0,t.NumField();i<n;i++ {
    fmt.Printf("%s: %v\n", t.Field(i).Tag, v.Field(i))
}
```

### 内存布局

字段在相邻的地址空间按定义的顺序排列。内存一次性分配。对于引用类型、字符串和指针，结构内存中只包含其基本（头部）数据。匿名字段成员也包含在内。

```go
type point struct {
    x,y int
}

type value struct {
    id int
    name string
    data []byte
    next *value
    point
}

v:=value{
    id: 1,
    name:"test",
    data:[]byte{1,2,3,4},
    point: point{x:10,y:10}
}
```

*   unsafe.Offsetof 参数是一个字段，返回字段对于对象的地址偏移量
*   unsafe.Sizeof 操作数在内存中字节大小
*   unsafe.Alignof 返回对应参数类型需要对齐的倍数