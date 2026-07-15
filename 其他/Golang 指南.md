# 数据类型
整型
--

### 有符号

int8, int16, int32(rune), int64

> rune 和 init32 等价，通常表示一个 Unicode 码点

### 无符号

uint8(byte), uint16, uint32, uint64

> byte 和 unit8 等价，通常用于强调数值是一个原始的数据而不是一个小的整数

### int 和 uint

一般对应特定CPU平台机器字大小的有符号和无符号整数int和uint;其中int是应用最广泛的数值类型。这两种类型都有同样的大小，32或64bit，但是我们不能对此做任何的假设;因为不同的编译器即使在相同的硬件平台上可能产生不同的大小。

### uintptr

没有指定具体 bit 大小但是足以容纳指针，只有在底层编程时才需要

### 算数运算符

| 优先级1 | 优先级2 | 优先级3 | 优先级4 | 优先级5 |
| --- | --- | --- | --- | --- |
| `*` | `+` | \== | `&&` | \|  |
| `/` | `-` | `!=` |     |     |
| `%` | \| or | `<` |     |     |
| `<<` | `^` xor | `<=` |     |     |
| `>>` |     | `>` |     |     |
| `&` and |     | `>=` |     |     |
| `&^` and not |     |     |     |     |

*   算术上 `<<n` 等价于乘以 2n, ​​`>>n`​​ 等价于除以 2n
*   按位置零(AND NOT):如果对应 y 中 bit 位为 1 的话, 表达式 z = x &^ y 结果 z 的对应的 bit 位为 0，否则 z 对应的 bit 位等于 x 相应的 bit 位的值。
*   同优先级使用左优先结合规则
*   `%` 取模运算符的符号和被取模数的符号总是一致的
*   `/` 除法运算的行为则依赖于操作数是否全为整数

```text-plain
-5%3=-2
-5%-3=-2

5.0/4.0=1.25
5/4=1 // 整数除法会向着0方向截断余数
```

*   \==计算结果溢出，高位丢弃，有符号最左侧为符号为，可能最终结果是负数==

```text-plain
var u uint8 = 255
// 1111 1111, 0000 0000, 0000 0001
fmt.Println(u, u+1, u*u) // "255 0 1"

var i int8 = 127
fmt.Println(i, i+1, i*i) // "127 ‐128 1"
```

\==无符号数往往只有在位运算或其它特殊的运算场景才会使用，就像bit集合、分析二进制文件格式或者是哈希和加密操作等。它们通常并不用于仅仅是表达非负数量的场合。== 一般来说，需要一个显式的转换将一个值从一种类型转化位另一种类型，并且算术和逻辑运算的二 元操作中必须是相同的类型。虽然这偶尔会导致需要很长的表达式，但是它消除了所有和类型相关 的问题，而且也使得程序容易理解。

```text-plain
var a int16 = 1
var b int32 = 2
var compote int = a + b // err

var compote int = int(a) + int(b) // ok
```

任何大小的整数字面值都可以用以0开始的八进制格式书写，例如0666；或用以0x或0X开头的十六进制格式书写，例如0xdeadbeef。十六进制数字可以用大写或小写字母。如今八进制数据通常用于POSIX操作系统上的文件访问权限标志，十六进制数字则更强调数字值的bit位模式。

```text-plain
o:=0666
fmt.Printf("%d %[1]o %#[1]o\n", o)
```

请注意 fmt 的两个使用技巧。通常 Printf 格式化字符串包含多个 `%` 参数时将会包含对应相同数量的额外操作数，但是 `%` 之后的 `[1]` 副词告诉 Printf 函数再次使用第一个操作数。第二，`%` 后的 `#` 副词告诉 Printf 在用 `%o`、`%x` 或 `%X` 输出时生成 0、0x 或 0X 前缀。

浮点数

* * *

Go 提供两种浮点数，float32 和 float64，math.MaxFloat32 表示 float32 最大值，math.MaxFloat64 表示 float64 最大值 算数规范由 IEEE754 浮点数国际标准定义，IEEE 754规定了四种表示浮点数值的方式：单精确度（32位）、双精确度（64位）、延伸单精确度（43比特以上，很少使用）与延伸双精确度（79比特以上，通常以80位实现） 一个 float32 （单精度，1个符号位，8个指数位，23个尾数位）类型的浮点数可以提供大约 6 个十进制数的精度，而 float64（双精度，1个符号位，11个指数位，52个尾数位）则可以提供约 15 个十进制数的精度;通常应该优先使用 float64 类型，因为 float32 类型的累计计算误差很容易扩散，并且能精确表示的正整数并不是很大(译注:因为 float32 的有效 bit 位只有 23 个，其它的 bit 位用于指数 float32 和符号;当整数大于 23bit 能表达的范围时，float32 的表示将出现误差)

根据算数规范IEEE754

复数
--

两种复数类型 complex64 和 complex128 对应 float32 和 float64 两种浮点数精度 我们把形如z=a+bi（a、b均为实数）的数称为复数。其中，a称为[实部](https://baike.baidu.com/item/%E5%AE%9E%E9%83%A8/53626919?fromModule=lemma_inlink)，b称为虚部，i称为虚数单位。当z的虚部b＝0时，则z为实数；当z的[虚部](https://baike.baidu.com/item/%E8%99%9A%E9%83%A8/5231815?fromModule=lemma_inlink)b≠0时，实部a＝0时，常称z为[纯虚数](https://baike.baidu.com/item/%E7%BA%AF%E8%99%9A%E6%95%B0/3386848?fromModule=lemma_inlink)。复数域是实数域的代数闭包，即任何复系数多项式在复数域中总有根。 内置函数：

*   complex 用于构建复数
*   real 用于返回复数实部
*   imag 用于返回复数虚部

```text-plain
x := complex(1,2) // 1+2i
x := 1 + 2i // 1+2i
x := 2i + 1 // 1+2i
```

复数也可以使用 `==` 和 `!=` 进行比较，`math/cmplx` 包提供复数处理函数

布尔 bool

* * *

```text-plain
s != "" && s[0] == "x"
```

这样表达式总是安全的，`s[0]` 操作如果作用与空字符串将会导致 panic 异常

布尔值不会隐式转换为数值 0 或 1，反之亦然

```text-plain
i := 0
if b {
    i = 1
}

func btoi(b bool) int {
    if b {
        return 1
    }
    return 0
}

// 数字到布尔型的逆转换则非常简单, 不过为了保持对称, 我们也可以包装一个函数:

func itob(i int) bool { return i != 0 }
```

常量
--

常量表达式在编译器计算，而不是在运行期，当操作数是常量时，一些运行时的错误也可以在编译期发现，常量的所有算术运算、逻辑运算和比较运算结果也是常量。

*   len
*   cap
*   real
*   imag
*   complex
*   unsafe.Sizeof 如果是批量声明的常量，除了第一个外其它的常量右边的初始化表达式都可以省略，如果省略初始 化表达式则表示使用前面常量的初始化表达式写法，对应的常量类型也一样的。

```text-plain
const (
    a = 1
    b
    c=2
    d
)
fmt.Println(a, b, c, d) // "1 1 2 2"
```

### iota

生成一组相似规则初始化的常量，不用每行都写一遍初始化表达式

```text-plain
type Weekday int

const (
    Sunday Weekday = iota // 0
    Monday // 1
    Tuesday // 2
    Wednesday // 3
    Thursday // 4
    Friday // 5
    Saturday // 6
)

type Flags uint

const (
    FlagUp Flags = 1 << iota
    FlagBroadcast
    FlagLoopback
    FlagPointToPoint
    FlagMulticast
)

const (
    _   = 1 << (10 * iota)
    KiB // 1024
    MiB // 1048576
    GiB // 1073741824
    TiB // 1099511627776             (exceeds 1 << 32)
    PiB // 1125899906842624
    EiB // 1152921504606846976
    ZiB // 1180591620717411303424    (exceeds 1 << 64)
    YiB // 1208925819614629174706176
)
```

### 无类型常量

六种未明确类型的常量类型（为没有明确基础类型的常量提供比基础类型更高精度的类型）

1.  无类型的布尔型
2.  无类型的整型
3.  无类型字符
4.  无类型浮点数
5.  无类型复数
6.  无类型字符串 通过延迟明确常量具体类型，无类型常量==可以提供更高的运算精度，可以直接用于更多的表达式而不需要显示的类型转换。== 比如说上例中的 YIB、ZIB 超出任何整数类型的表达范围，但依然是合法常量 还比如 math.Pi，无类型常量可以用于任何需要浮点数的常量赋值给 float32、float64，complex128 类型，如果 math.Pi 被确定为指定类型那精度就不一样了同时对其他类型还要进行转换

```text-plain
var x float32 = math.Pi
var x float64 = math.Pi
var x complex128 = math.Pi

const Pi64 float64 = math.Pi
var x float32 = float32(Pi64)
var x float64 = Pi64
var x complex128 = complex128(Pi64)
```

除法运算符/会根据操作数的类型生成对应类型的结果。因此，不同写法的常量除法表达 式可能对应不同的结果:

```text-plain
var f float64 = 212

fmt.Println((f ‐ 32) * 5 / 9) // "100"; (f ‐ 32) * 5 is a float64 
fmt.Println(5 / 9 * (f ‐ 32)) // "0"; 5/9 is an untyped integer, 0 
fmt.Println(5.0 / 9.0 * (f ‐ 32)) // "100"; 5.0/9.0 is an untyped float
```

只有常量可以是无类型的。当一个无类型的常量被赋值给一个变量的时候，就像下面的第一行语 句，或者出现在有明确类型的变量声明的右边，如下面的其余三行语句，无类型的常量将会被隐式 转换为对应的类型，如果转换合法的话。 无论是隐式或显式转换，将一种类型转换为另一种类型都要求目标可以表示原始值。对于浮点数和 复数，可能会有舍入处理 如果要给变量一个不同的类型，我们必须显式地将无类型的常量转化为所需的类型，或给声明的变 量指定明确的类型

### 分组

```text-plain
const i = 100
const pi = 3.14
const prefix = "Go_"

// 分组
const (
    i = 100
    pi = 3.14
    prefix = "Go_"
)
```

错误类型

* * *

```text-plain
err := errors.New("emit macho dwarf: elf header corrupted")
if(err != nil){
    fmt.Print(err)
}
```

数组
--

有==固定长度==的==特定类型元素==组成的序列，由于长度固定所以很少直接使用，Slice是可以增长和收缩的动态序列，更灵活，但要理解 slice 需要先理解数组

*   元素可通过索引下标访问，索引从零开始，len 函数返回数组元素个数
*   数组每个元素会被初始化为元素类型的零值，也可使用一组值来初始化`[3]int{1,2,3}`​
*   数组字面值中出现 `...`​ 表示长度有初始化元素个数决定 `[...]int{1,2,3}`​
*   数组长度是数组类型的一部分 `[3]int`​ 和 `[4]int`​ 是不同类型
*   数组、slice、map、struct 字面值的写法很相似，直接提供初始值序列，或者指定索引和对应值的方式初始化 `[3]int{0:0,1:1,2:2}`​ 定义一个含有 100 个元素的数组 `[...]int{99: -1}`​ 第 100 个元素初始化为 -1 其他为零值
*   一个数组的元素类型是可以相互比较的，那么数组类型也是可以相互比较的(必须是同类型数组，所有元素相等才相等)

```text-plain
[2][4]int{ [4]int{1,2,3,4}, [4]int{1,2,3,4} }

[2][4]{ {1,2,3,4}, {1,2,3,4} }
```

Slice 动态数组

* * *

和数组一样，只是没有长度声明 `var fslice []int`​

*   切片代表变长的序列，元素为相同类型，一般写作 `[]T`​；
*   类似数组，无固定长度，slice 是数组子序列，底层引用一个底层数组；
*   一个 slice 有三部分构成：指针、长度、容量；
*   指针指向 slice 第一个元素对应底层数组元素的地址；长度对应 slice 元素个数，不能超过容量；容量为 slice 开始的位置到底层数组的结尾位置；len 和 cap 分别返回长度和容量

### 切片操作

*   ​`s[i:j] 0 <= i <= j <= cap(s)`​
*   从第 i 元素开始，到 j - 1 个元素结束，长度 j - i
*   i 被省略将从 0 开始，j 被省略将从 len(s) 开始
*   字符串的切片操作和 \[\]byte 字节类型切片的切片操作是类似的
*   x\[m:n\]切片操作对于字符串则生成一个新字符串，如果x是\[\]byte的话则生成一个新的\[\]byte
*   一种将slice元素循环向左旋转n个元素的方法是三次调用reverse反转函数，第一次是反转开头的n 个元素，然后是反转剩下的元素，最后是反转整个slice的元素。(如果是向右循环旋转，则将第三 个函数调用移到第一个调用位置就可以了
*   和数组不同的是，slice之间不能比较，因此我们不能使用操作符来判断两个slice是否含有全部相 等元素。不过标准库提供了高度优化的bytes.Equal函数来判断两个字节型slice是否相等 (\[\]byte)，但是对于其他类型的slice，我们必须自己展开每个元素进行比较
*   slice唯一合法的比较操作是和nil比较
*   通过 len(s) == 0 来判断 slice 是否为空，不应使用是否为 nil 判断
*   使用 make 创建时，cap 可以省略 `make([]T, len)`​ `make([]T, len, cap)`​

```text-plain
var s []int // nil
s = nil // nil
s = []int(nil) // nil
s = []int{} // != nil
```

### append

*   用来向 slice 追加元素，append 过程中，先检测 slice 底层数组 cap 是否足够容纳新增元素，如果足够直接扩展 slice，将新元素直接复制到扩展的空间，新老 slice 共用一个底层数组。如果 cap 不足以容纳新元素，会先分配一个足够大的 slice，将原来的值和新增的值都添加到新的 slice，新老 slice 不会共用一个底层数组
*   copy 函数第一个参数是要复制的目标 slice，第二个参数是源 slice，目标和源的位置顺序和 dst = src 复制语句是一致的。会返回成功复制的元素个数（等于两个 slice 中长度较小的那个）
*   为了提高内存使用效率，新分配的数组一般略大于保存被操作的两个 slice 所需要的最低大小。通过在每次扩展数组时直接将长度翻倍从而避免了多次内存分配，也确保了添加单个元素操的平均时间是一个常数时间

```text-plain
func appendInt(x []int, y ...int) []int {
    var z []int
    zlen := len(x) + len(y)
    if zlen <= cap(x) {
        z = x[:zlen]
    } else {
        zcap := zlen
        if zcap < 2*len(x) {
            zcap = 2 * len(x)
        }
        z = make([]int, zlen, zcap)
        copy(z, x)
    }
    copy(z[len(x):], y)
    return z
}
```

内置的append函数可能使用比appendInt更复杂的内存扩展策略。因此，通常我们并不知道append 调用是否导致了内存的重新分配，因此我们也不能确认新的slice和原始的slice是否引用的是相同的 底层数组空间。同样，我们不能确认在原先的slice上的操作是否会影响到新的slice。因此，通常是 将append返回的结果直接赋值给输入的slice变量`a = append(a, b)`​ 要正确地使用slice，需要记住尽管底层数组的元素是间接访问的，但是 slice对应结构体本身的指针、长度和容量部分是直接访问的。要更新这些信息需要像上面例子那样 一个显式的赋值操作。从这个角度看，slice并不是一个纯粹的引用类型

```text-plain
type Slice struct {
    array unsafe.Pointer
    len, cap int
}
```

### copy

Copy from one slice to another

```text-plain
var s = make([]int, 3)
n := copy(s, []int{0, 1, 2, 3}) // n == 3, s == []int{0, 1, 2}
```

Copy from a slice to itself

```text-plain
s := []int{0, 1, 2}
n := copy(s, s[1:]) // n == 2, s == []int{1, 2, 2}
```

Copy from a string to a byte slice (special case)

```text-plain
var b = make([]byte, 5)
copy(b, "Hello, world!") // b == []byte("Hello")
```

### 内存技巧

```text-plain
// pop
top := stack[len(stack) - 1]
stack = stack[:len(stack) - 1]

// splice(slice,b)
copy(slice[b:],slice[b+1:])
slice[:len(slice)-1]
```

Map

* * *

哈希表是是一个无序的key/value对的集合，其中所有的key都是不同的，然后通过给定的 key 可以在常数时间复杂度内检索、更新或删除对应的value。 一个 map 就是是个哈希表的引用，map\[K\]V，所有 key 都有相同类型，所有 value 也有相同类型；key 必须是支持 == 比较运算符的数据类型。

```text-plain
// 创建一个 map

// make 创建
make(map[string]string)

// 字面值创建
map[string]int{
    "name": "deve",
    "age": "34",
}

// 创建空 map
map[string]int{}

// 删除元素
delete(theMap, theKey)

theMap[theKey]+=1
theMap[theKey]++
```

#### 声明

```text-plain
var myMap map[string] PersonInfo
var <var_name> map[key_type>] <val_type>
```

#### 创建

```text-plain
myMap = make(map[string] PersonInfo)
myMap = make(map[string] PersonInfo, 100)
myMap = map[string] PersonInfo {
    "123": PersonInfo{"12", "jack", "Room 444,..."}
}
```

#### 赋值

```text-plain
myMap["123"] = PersionInfo{"1","jack","Room 595,..."}
```

#### 删除

```text-plain
delete(myMap, 'key')
```

#### 查找

```text-plain
value, ok := myMap["key"] // 使用ok-idiom获取值，可知道key/value是否存在
if ok {}
```

所谓ok-idiom模式，是指在多返回值中用一个名为ok的布尔值来标示操作是否成功。因为很多操作默认返回零值，所以须额外说明

向 map 存数据前必须先创建，零值 nil 的 map 写入元素会导致 panic 要注意的是 map 的元素并不是一个变量，所以不能对 map 的元素进行取址操作 `&theMap[theKey]`​ 禁止对 map 元素取址的原因是随着 map 元素数量的增长 map 可能会重新分配更大的内存空间，导致之前地址无效。 遍历可以使用 `range`​ 和 slice 类似，遍历顺序每次不同（每次都使用随机的遍历顺序可以强制 要求程序不会依赖具体的哈希函数实现），要按顺序遍历可以先对 key 排序 `sort.Strings([]string)`​

```text-plain
for key, value := range theMap {}
```

map 中区分元素值为 0 时，是零值的 0，还是真是存在的 0

```text-plain
age, ok := theMap[theKey]
if !ok {/* 这时说明是零值的 0 */}

if age, ok := theMap[theKey];!ok {}
```

和 slice 一样，除了值为 nil 的 map 也不能进行比较

```text-plain
func equal(x, y map[string]int) bool {
    if len(x) != len(y) {
        return false 
    }
    for k, xv := range x {
        // 判断 map 间元素是否相同，
        // 不能只单纯比较 value（xv != yv)
        // 值为零，和值为零值是要区分
        // 需使用 !ok || xv != yv
        if yv, ok := y[k]; !ok || yv != xv { 
            return false
        }
    }
    return true
}

equal(map[string]int{"A": 0}, map[string]int{"B": 42}) // map1,map2 的 A 值都为零，但性质不一样
```

使用 slice 作为 key，绕过 map 的 key 必须是可比较的限制

1.  定义一个将 slice 转为 map 对应的 string 类型的 key 的函数，确保 key1 和 key2 相等时 f(key1) == f(key2) 才成立
2.  创建一个 key 为 string 类型的 map，每次对 map 操作时先用辅助函数将 slice 转为 string

make

* * *

make 用于内建类型（slice/map/channel）的内存分配

*   make 只能创建 slice/map/channel 并返回有初始值（非零）的 T 类型，而不是 `*T`​
*   指向数据结构的引用在使用前必须被初始化，如 slice 是一个包含指向数据（内部 array ）的指针、长度、容量的三项描述符在这些被初始化之前，slice 为 nil，make 初始化了数据结构填充适当的值，返回初始化后的（非零）值。

### slice

make(T, len\[, cap = len\])

### map

make(T \[, init\_space\])

### channel

make(T \[, buffer\_size\])

new

* * *

new 用于各种类型的内存分配，本质上和其他语言中的同名函数一样，new（T）分配了零值填充的 T 类型的内存空间，返回其地址 `*T`​ (返回的是指针) ==零值== int,int8,int32,int64,float32,float64 0 unit 0x0 rune 0 byte 0x0 bool false string ""

‍# base 基本
综合基础

* * *

\[TOC\]

关键字

* * *

| 1   | 2   | 3   | 4   | 5   | 6   | 7   |
| --- | --- | --- | --- | --- | --- | --- |
| break | default | func | interface | select | case | defer |
| go  | map | struct | chan | else | goto | package |
| switch | const | fallthrough | if  | range | type | continue |
| for | import | return | var |     |     |     |

变量
--

变量是一段或多段用来存储数据的内存。变量的生命和初始化是分开的，运行时内存分配操作会确保变量自动初始化为二进制零值，避免不可预测行为发生。显示提供初始值可省略类型由编译器推断

### 变量声明

支持类型推断，明确的基础类型划分有助于编写跨平台应用。

var 关键字

```go
var <variable_name> <type>
var v1 int
var v2 string
var v3 [10]int
var v4 []int
var v5 struct {
    f int
}
var v6 *int
var v7 map[string]int
var v8 func(a int)int
var (
    v9 int
    v10 string
)
```

### 变量初始化

go 指定类型不是必须的，可以根据右值推导出 ==只能用在函数内部== ==只能用在函数内部== ==只能用在函数内部==

```go
var v1 int = 10
// 一下两种可以自动推导类型
var v2 = 10

// 简短模式
// 冒号和等号的组合 :=
// 用于明确表达同时进行变量声明和初始化的工作。
// 定义变量，同时显示初始化
// 不能提供数据类型
// 只能用在函数内部
v3 := 10
```

#### 退化为赋值操作

\==退化赋值的前提条件是：最少有一个新变量被定义，且必须为同一作用域==

\==在处理函数错误时，退化赋值允许我们重复使用err变量==

```
// 退化为赋值操作
// 退化赋值的前提条件是：最少有一个新变量被定义，且必须为同一作用域
x := 1
x, y:=2,4 // 由于前面以声明x，这里x退化为赋值操作，只有y是变量定义，

x:=1
x:=2 // err: no new variables on left side of :=

x:=1
{
x, y := 3,4 // err: 不同作用域，全部为新变量定义
}
```

### 变量赋值

多重赋值

```go
var v1,v2 int = val1, val2
var v1,v2 = val1, val2
```

### 匿名变量, 空标识符

\_ 是特殊变量，所有赋给 \_ 的值都会被丢弃，无法读取内容

用来临时规避编译器对未使用变量和导入包的错误检查

\==预置成员，不能重新定义==

```go
func GetName() (firstName, lastName, nickName string){
    return 'May', 'Chan', 'Chibi' //多重返回
}

_, _, nickName := GetName() //匿名变量
```

### 类型转换

```go
[]byte(s) // 将s转换为[]byte类型
srting(c) 将c转换为string类型
```

### 类型断言

`v.(T)` v 不为 nil，且 v 可以转换为 T 类型，就断言==成功，返回 T 类型的值==，如果 T 不是接口类型，则要求 x 的类型就是 T，如果 T 是一个接口，要求 x 实现了 T 接口。

常量
--

常量通常是一些字面量，常量值必须是编译期可确定的字符、字符串、数字或布尔值，或者编译器可以计算出结果的表达式。不曾使用的常量不会引发编译错误。

不同于变量在运行期分配存储内存（非优化内存），常量通常会被编译器在预处理阶段直接展开，做为指令数据使用。

```go
const y = 0x200

pringln(&y) // error: cannot take the address of y

// 数字常量不会分配存储空间，无须像变量那样通过内存寻址来取值，因此无法获取地址
```

```go
const x=100         // 无类型声明的常量
const y byte=x       // 直接展开x，相当于const y byte=100

const a int=100      // 显式指定常量类型，编译器会做强类型检查
const b byte=a       // 错误:cannot use a(type int)as type byte in const initializer
```

常量组初始化时如果不指定类型，则与上一行非空常量右值相同

```go
const (
x int = 1
y  // 与上一行x类型右值相同 也是int
z = "a"
s // string
)
```

### 字面常量 literal

所谓字面常量（literal），是指程序中硬编码的常量，如：

\-12 3.14159265358979323846 // 浮点类型的常量 3.2+12i // 复数类型的常量 true // 布尔类型的常量 "foo" // 字符串常量

### 常量定义

const 关键字

```go
const Pi float64 = 3.141592654
```

常量定义的右值也可以是一个在编译期运算的常量表达式，比如`const mask = 1 << 3`

由于常量的赋值是一个编译期行为，所以右值不能出现任何需要运行期才能得出结果的表达 式，比如试图以如下方式定义常量就会导致编译错误：`const Home = os.GetEnv("HOME")`原因很简单，os.GetEnv()只有在运行期才能知道返回结果，在编译期并不能确定，所以 无法作为常量定义的右值。

### 预定义常量

Go语言预定义了这些常量：true、false和iota

iota比较特殊，可以被认为是一个可被编译器修改的常量，在每一个const关键字出现时被 重置为0，然后在下一个const出现之前，每出现一次iota，其所代表的数字会自动增1。

```go
const (
    c0 = iota // iota被重设为0
    c1 = iota
    c2 = iota
)

const (
    a = 1 << iota //iota 每个const开头被重置成0
    b = 1 << iota
    c = 1 << iota
)
```

如果两个const的赋值语句的表达式是一样的，那么可以省略后一个赋值表达式。因此，上面的两个const语句可简写为：

```go
const (
    c0 = iota // iota被重设为0
    c1
    c2
)

const (
    a = 1 << iota //iota 每个const开头被重置成0
    b
    c
)
```

### 枚举

枚举指一系列相关的常量，可以用在const后跟一对圆括号的方式定义一组常量，这种定义法在Go语言中通常用于定义枚举值。Go语言并不支持众多其他语言明确支持的enum关键字。需要借助**iota**标识符实现一组自增常量值来实现枚举功能。

下面是一个常规的枚举表示法，其中定义了一系列整型常量：

```go
const (
    Sunday = iota
    Monday
    Tuesday
    Wednesday
    Thursday
    Friday
    Saturday
    numberOfDays // 这个常量没有导出
)
```

同Go语言的其他符号（symbol）一样，**以大写字母开头的常量在包外可见**。 以上例子中numberOfDays为包内私有，其他符号则可被其他包访问。

```go
const (
    _,_ = iota, iota*10 // 0, 0*10
    a,b  // 1, 1*10
    c,d  // 2, 2*10
)

// 默认int
const (
a = iota //int
b float32 = iota
c = iota // 名有明确指定类型和b一样
)

// 自定义类型
type color  byte

const (
black color = iota
red
)
```

类型
--

| 类型  | 长度  | 默认  | 说明  |
| --- | --- | --- | --- |
| bool | 1   | false |     |
| byte | 1   | unit8 |     |
| int,uint | 4,8 | 默认整数类型，平台相关 |     |
| int8,uint8 | 1   | \-128-127，0-255 |     |
| int16,uint16 | 2   | \-32768-32767，0-65535 |     |
| int32,uint32 | 4   | \-21亿-21亿，0-42亿 |     |
| int64,uint64 | 8   |     |     |
| float32 | 4   | 0.0 |     |
| float64 | 8   | 0.0 | 默认浮点数类型 |
| complex64 | 8   |     |     |
| complex128 | 16  |     |     |
| rune | 4   | 0   | Unicode Code Point，int32 |
| uintptr | 4,8 | 0   | 足以存储指针的uint |
| string |     | ""  | 字符串，默认为空字符串，而非NULL |
| array |     |     | 数组  |
| struct |     |     | 结构体 |
| function |     | nil | 函数  |
| interface |     | nil | 接口  |
| map |     | nil | 字典，引用类型 |
| slice |     | nil | 字典，引用类型 |
| channel |     | nil | 字典，引用类型 |

**strconv 库可在不同进制（字符串）间转换**,静态类型，强类型（类型决定内存长度和存储格式）

*   基础类型
    *   布尔类型：bool
    *   整型：int8、byte、int16、int、uint、uintptr等
    *   浮点类型：float32、float64
    *   复数类型：complex64、complex128
    *   字符串：string
    *   字符类型：rune
    *   错误类型：error
*   复合类型
    *   指针（pointer）
    *   数组（array）
    *   切片（slice）
    *   字典（map）
    *   通道（chan）
    *   结构体（struct）
    *   接口（interface）

对于常规的开发来说，用int 和uint就可以了，没必要用int8之类明确指定长度的类型，以免导致移植困难。

### 别名

专门提到两个别名

*   byte alias for uint8
*   rune alias for int32

别名类型无需转换，可直接赋值

```go
var a byte = 0x11
var b uint8 = a
```

### 引用类型

所为引用类型特指slice map channel这三种预定义类型

**相比数字、数组等类型，引用类型拥有更复杂的存储结构。除分配内存外，它们还须初始化一系列属性，诸如指针、长度，甚至包括哈希分布、数据队列等。**

内置函数new按指定类型长度分配零值内存，返回指针，并不关心内部构造和初始化方式。而引用类型必须使用make函数创建，编译器会将make转换为目标类型专用的创建函数（或指令），以确保完成全部内存分配和相关属性初始化。

除new/make函数外，也可使用初始化表达式，编译器生成的指令基本相同。

当然，new函数也可为引用类型分配内存，但这是不完整创建。以字典（map）为例，它仅分配了字典类型本身（实际就是个指针包装）所需内存，并没有分配键值存储内存，也没有初始化散列桶等内部属性，因此它无法正常工作。

### 转换类型

除常量、别名类型以及未命名类型外，Go要求强制使用显示类型转换。加上不支持重载，所以总能明确确定语句及表达式的明确含义。

### 语法歧义

如果转换的目标是指针、单向通道或没有返回值的函数类型，那么必须使用括号，以避免造成语法分解错误。

```go
(*int)(p)          --> 如果没有括号 -->  *(int(p))
(<-chan int)(c)                <-(chan int(c))
(func())(x)                       func()x

func()int(x)           --> 有返回值的函数类型可省略括号，但依然建议使用。
(func()int)(x)                  使用括号后，更易阅读
```

### 自定义类型

使用 type 关键字定义用户自定义类型，包括基于现有基础类型创建，或者是结构体，函数类型等。

```go
type flag byte
```

type 类型像var const 一样，也可以合并成组

```go
type (
    user struct {}
    event func(string) bool
)
```

即便指定了基础类型，也只表明它们有相同底层数据结构，两者间不存在任何关系，属完全不同的两种类型。除操作符外，自定义类型不会继承基础类型的其他信息（包括方法）。不能视作别名，不能隐式转换，不能直接用于比较表达式。

```go
func main() {
   type data int
   var d data=10

   var x int=d       // 错误:cannot use d(type data)as type int in assignment
   println(x)

   println(d==x)      // 错误:invalid operation:d==x(mismatched types data and int)
}
```

### 未命名类型

与有明确标识符的bool、int、string等类型相比，**数组、切片、字典、通道等类型与具体元素类型或长度等属性有关，故称作未命名类型（unnamed type）** 。当然，可用type为其提供具体名称，将其改变为命名类型（named type）。

具有相同声明命的未名类型被视作同一类型

*   具有相同基类型的指针
*   具有相同元素类型和长度的数组
*   具有相同元素类型的切片
*   具有相同键值类型的字典
*   具有相同数据类型及操作方向的通道
*   具有相同字段序列（字段名 字段类型 标签 及字段顺序）的结构体
*   具有相同签名（参数和返回值列表，不包括参数名）的函数
*   具有相同方法集（方法名 方法签名 不包括顺序）的接口

需要注意的是struct tag也属于类型组成部分，不只是数据描述。函数的参数顺序也属于签名组成部分

```go
var a struct {x string 'tag'} // 匿名结构体
var b struct {x string}

a=b //error->tag

var a func(int,string)
var b func(string,int)

a=b //error->顺序
```

未命名转换规则

*   所属类型相同
*   基础类型相同，且其中一个是未命名类型
*   基础类型相同，将双向通道赋值给双向通道，且其中一个为未命名类型
*   将默认值nil赋值给切片 字典 通道 指针 函数或接口
*   对象实现了目标接口

### 整型

| 类型  | 长度（字节） | 值范围 |
| --- | --- | --- |
| int8 | 1   | 128 ~ 127 |
| uint8（即byte） | 1   | 0 ~ 255 |
| int16 | 2   | 32768 ~ 32767 |
| uint16 | 2   | 0 ~ 65535 |
| int32 | 4   | 2147483 648 ~ 2147483 647 |
| uint32 | 4   | 0 ~ 4294967295 |
| int64 | 8   | 9223372036854775808~9223372036854775807 |
| uint64 | 8   | 0 ~ 18446744073709551615 |
| int | 平台相关 | 平台相关 |
| uint | 平台相关 | 平台相关 |
| uintptr | 同指针 | 在32位平台下为4字节，64位平台下为8字节 |

### 类型表示

### 数值运算 (+,-,\*,/,%)

### 比较运算 (>,<,==,>=,<=,!=)

两个不同类型的整型数不能直接比较，比如int8类型的数和int类型的数不能直接比较，但 各种类型的整型变量都可以直接与字面常量（literal）进行比较

```go
var i int32
var j int64

i,j = 1,2

if i == j {} //编译错误 类型不同
if i == 1 {} //编译通过 字面量
```

### 位运算

*   <<
*   ^ 异或 x ^ y
*   &
*   |
*   ^ 取反 ^x

### 浮点类型

表示包含小数点的数据 go语言中的float32 float64分别对应c语言的float double 类型推导会将浮点类型自动推导为float64

#### 浮点数比较

因为浮点数不是一种精确的表达方式，所以像整型那样直接用==来判断两个浮点数是否相等 是不可行的，这可能会导致不稳定的结果。推荐使用

```go
import math

// p 为自定义的比较精度, 如 0.00001
func IsEqual(f1,f2,p float 64) bool {
    return math.Fdim(v1,v2) < p
}
```

### 复数类型

#### 复数表示

复数实际上由两个实数(在计算机中用浮点数表示)构成，一个表示实部(real)，一个表示虚部(imag)

我们把形如 z=a+bi（a、b均为实数）的数称为复数。其中，a 称为实部，b 称为虚部，i 称为虚数单位。当 z 的虚部 b＝0 时，则 z 为实数；当 z 的虚部 b≠0 时，实部 a＝0 时，常称 z 为纯虚数。复数域是实数域的代数闭包，即任何复系数多项式在复数域中总有根。

```go
v1 := 3.2 + 12i  // v1是complex128类型
v2 := complex(3.2, 12) // 同上
```

#### 实部与虚部

```go
z = complex(x,y)
real(z) // 获得实部x
imag(z) // 获得虚部y
```

### 字符串

双引号或反引号包裹

*   len
*   Printf
*   Println

#### 字符串操作

*   x + y
*   len
*   s\[ind\]

#### 字符串遍历

```go
for i := 0; i < n; i++ {
    ch := str[i]
    fmt.Println(i, ch)
}

// 中文在utf-8中站三个字节长度是3

for i, ch := range str {
    fmt.Println(i, ch)
}
```

### 字符类型

在Go语言中支持两个字符类型

*   一个是byte（实际上是uint8的别名），代表UTF-8字符串
*   一个是rune，代表单个Unicode字符

### 数组

#### 声明方法

*   \[32\] byte // 长度32的数组，每个元素一字节
*   \[2 \* N\] struct {x, y init32} // 复杂类型数组
*   \[1000\] \* float64 // 指针数组
*   \[3\] \[5\] int // 二维数组
*   \[2\] \[2\] \[2\] float64 // 等同 \[2\] ( \[2\] ( \[2\] float64))

在Go语言中，数组长度在定义后就不可更改，在声明时长度可以为一个常量或者一个常量 表达式（常量表达式是指在编译期即可计算结果的表达式）。数组的长度是该数组类型的一个内 置常量，可以用Go语言的内置函数len()来获取。

#### 元素访问

*   下标
*   range 关键字

```go
array := [2] int

for i, v := range array {}
```

需要特别注意的是，在Go语言中数组是一个值类型（value type）。所有的值类型变量在赋值和作为参数传递时都将产生一次复制动作。如果将数组作为函数的参数类型，则在函数调用时该 参数将发生数据复制。因此，在函数体中无法修改传入的数组的内容，因为函数内操作的只是所 传入数组的一个副本。

### 数组切片

每次传递都将产生一份副本。显然这种数据结构无法完全满足开发者的真实需求。

切片拥有自己的数据结构，而不仅仅是个指针。数组切片的数据结构可以抽象为以下3个变量：

*   一个指向原生数组的指针
*   数组切片中的元素个数
*   数组切片已分配的存储空间

数组切片实际上仍然使用数组来管理元素，基于数组，数组切片添加了一系列管理功能，可以随时动态扩充存放空间，并且可以被随意传递而不会导致所管理的元素被重复复制。

#### 创建数组切片

1.  基于数组 `var myslice []int = myarray[:5]`
2.  直接创建

```go
    // make 内置函数 可以用于创建切片
    myslice := make([]int, 5) // 初始元素个数为5的数组切片，元素初始值为0
    myslice := make([]int, 5, 10)  // 初始元素个数为5的数组切片，元素初始值为0，并预留10个元素的存储空间
    myslice := []int{1,2,3,4,5}  // 初始化包含5个元素的数组切片
```

#### 遍历

#### 动态增减

与数组相比，数组切片多了一个存储能 力（capacity）的概念，即元素个数和分配的空间可以是两个不同的值。

*   cap // 分配空间的大小
*   len // 存储元素的个数
*   append // 追加元素

```go
myslice = append(myslic, 1,2,3)

myslice2 := []int{1,2,3}
myslice = append(myslice, myslice2...) // 数组后面三个点...打散数组
```

#### 基于切片创建切片

#### 内容复制

*   copy 数组切片支持Go语言的另一个内置函数copy()，用于将内容从一个数组切片复制到另一个 数组切片。如果加入的两个数组切片不一样大，就会按其中较小的那个数组切片的元素个数进行 复制。# express
表达式

* * *

\[TOC\]

保留字

* * *

| 1   | 2   | 3   | 4   | 5   |
| --- | --- | --- | --- | --- |
| break | default | func | interface | select |
| case | defer | go  | map | struct |
| chan | else | goto | package | switch |
| const | fallthrough | if  | range | type |
| continue | for | import | return | var |

运算符

* * *

| 1   | 2   | 3   | 4   | 5   | 6   | 7   | 8   |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ()  | \-  | ^   | \*= | <<= | ++  | \-- | !   |
| +   | .   | &   | +=  | &=  | &&  | \== | !=  |
| \|  | \-= | \|= | \|  | <   | <=  | \[\] | \*  |
| ^=  | <-  | \>  | \>= | {}  | /   | <<  | /=  |
| \=  | :=  | ,   | ;   | %   | \>> | %=  | \>>= |
| ... | :   | &^  | &^= |     |     |     |     |

幂等 math.Pow 绝对值 math.Abs

位移右操作数必须是无符号整数，或可以转换的无显示类型常量。非常量位移表达式，会优先将无显式类型的常量左操作数转型

*   AND &
*   OR |
*   XOR a^b
*   NOT ^a
*   AND NOT(按位清除) &^
*   LEFT SHIFT(位左移) <<
*   RIGHT SHIFT >>

位清除：左右操作数对应二进制位都为1的重置为0

```go
const( 
   read  byte=1<<iota
   write
   exec
   freeze
) 

func main() { 
   a:=read|write|freeze
   b:=read|freeze|exec
   c:=a&^b     // 相当于a^read^freeze，但不包括exec

   fmt.Printf("%04b&^ %04b= %04b\n",a,b,c) 
}
```

自增 自减不再是运算符。只能作为独立语句，不能用于表达式

指针
--

*   不能将内存地址与指针混为一谈
*   内存地址：内存中每个字节单元的唯一编号
*   指针： 一个实体，会分配内存空间，相当于一个专门用来保存地址的整型变量
*   取址运算符 “&” 用于获取对象地址
*   指针运算符 “\*” 用于间接引用目标对象
*   二级指针\*\_T，如包含包名则可写成\_package.T

并非所有对象都能进行取地址操作，但变量总是能正确返回（addressable）。指针运算符为左值时，我们可更新目标对象状态；而为右值时则是为了获取目标状态。

初始化

* * *

复合类型（arr, splice, map,struct)

*   初始化表达式必须含类型标签
*   左花括号必须在类型尾部，不能另起一行
*   多个成员初始值以逗号分隔
*   允许多行，但每行须以逗号或右花括号结束

流控制

* * *

### if

初始化语句支持，可定义块局部变量或执行初始函数，局部变量的有效范围包含整个if/else块

```go
if xinit();x==0{}
if a,b:=x,y;a<b{}
```

### switch

*   switch 也支持初始化语句
*   省略switch条件默认值为true
*   空case不构成多条件匹配，隐式 break，case执行完毕后自动中断。
*   **如须贯通后续case（源码顺序），须执行fallthrough，但不再匹配后续条件表达式。**
*   fallthrough 必须在case结尾，可使用breake阻止

```go
switch x：=5， x {
    case a,b: // 多条件满足其一即可OR
    ...
    case 5:
    fallthrough
    case 6:
    ...
    case 7：
    if x > 10 {
    break
    }
    fallthrough
    default:
    ...
}
```

### for

初始化语句仅被执行一次。条件表达式中如有函数调用，须确认是否会重复执行。可能会被编译器优化掉，也可能是动态结果须每次执行确认。

for...range 迭代支持字符串 数组 数组指针 切片 字典 通道 返回索引和键值数据

### goto continue break

*   goto 使用goto前必须先定义标签，区分大小写 不能跳转到其他函数或内层代码块
*   break 用于 Switch for select，终止整个语句块执行
*   continue 仅用于for，终止后续逻辑，进入下次循环

break 和 continue 可以配合标签在多层嵌套中指定目标层级

```go
func main() { 
outer: 
   for x:=0;x<5;x++ { 
       for y:=0;y<10;y++ { 
           if y>2{ 
               println() 
               continue outer
            } 
           if x>2{ 
               break outer
            } 

           print(x, ":",y, " ") 
        } 
    } 
}
```

二级指针

```go
func test(p **int){
    x:=100
    *p =&x
}
func main(){
var i *int
test(&i)
fmt.Println(*i)
}
```

函数参数过多建议使用一个复合结构类型

```go
type serverOption struct{ 
   address string
   port  int
   path  string
   timeout time.Duration
   log    *log.Logger
} 

func newOption() *serverOption{ 
   return &serverOption{             // 默认参数 
       address: "0.0.0.0", 
       port:   8080, 
       path:    "/var/test", 
       timeout:time.Second*5, 
       log:    nil, 
    } 
} 

func server(option *serverOption) {} 

func main() { 
   opt:=newOption() 
   opt.port=8085         // 命名参数设置 

   server(opt) 
}
```

变参
--

变参本质上是一个切片，只能接收同类型参数，在最尾部

```go
func test(s string, a ...int){}
```

变参中，参数是数组时需要转为切片，切片需要展开传入

```go
a := [2]int{1,2}
test(a[:]...)
```

既然变参是切片，那么参数复制的仅是切片自身，并不包括底层数组，也因此可修改原数据。如果需要，可用内置函数copy复制底层数据

```go
a:=[]int{1,2}
test(b ...int){b[1]=10}
println(a) //[]int{1,10}
```

返回值

* * *

```go
func F1() (int,error){}
// 命名返回值
func F1() (i int, err error){
  return  // 相当于 return i,err 隐式返回
}
```

命名返回值和参数一样，可当做局部变量使用，最后由return隐式返回 如果返回值类型能明确表明其含义，就尽量不要对其命名

匿名函数

* * *

```go
func a(){
    func (s int){}(1) // 自执行
    b:=func(){} // 赋值给变量
    func test(f func()){f()}
    test(func(){}) // 作为参数
    return func(){} // 作为返回值
}
```

将匿名函数赋值给变量，与为普通函数提供名字标识符有着根本的区别。当然，编译器会为匿名函数生成一个“随机”符号名。

普通函数和匿名函数都可作为结构体字段，或经通道传递。

```go
type A struct {
    F func(x,y int)int
}
x:=A{F:func(x,y int)int{return x+y}}
```

### 闭包

闭包是函数和引用环境的组合体，闭包让我们不用传递参数就可读取或修改环境状态，当然也要为此付出额外代价。对于性能要求较高的场合，须慎重使用。

延迟调用

* * *

defer 常用于资源释放 解除锁定以及错误处理等

延迟调用注册的是调用，参数值在注册时被复制并缓存起来，如对状态敏感可用指针

```go
func main(){
    x,y:=1,2
    defer func(a int){
        a,y // 1,202
    }(x) // 注册时就被缓存
    x=101
    y=202
    x,y // 101,202
}
```

编译器通过插入额外指令来实现延迟调用执行，而return和panic语句都会终止当前函数流程，引发延迟调用。另外，return语句不是ret汇编指令，它会先更新返回值。

延迟调用需要额外开销，对性能有要求的地方应避免使用

错误处理

* * *

在最后一个参数返回error类型的错误状态

```go
type error interface{
    Error()string
}
```

错误变量通常以err作为前缀，且字符串内容全部小写，没有结束标点，以便于嵌入到其他格式化字符串中输出。

*   errors.New
*   fmt.Errorf 返回一个格式化内容的错误对象

自定义错误类型, 自定义错误类型通常以Error为后缀

```go
type DivError struct{              // 自定义错误类型 
   x,y int
} 

func(DivError)Error()string{          // 实现error接口方法 
   return"division by zero" 
} 

func div(x,y int) (int,error) { 
   if y==0{ 
       return 0,DivError{x,y}            // 返回自定义错误类型 
    }
    return x/y,nil
} 

func main() { 
   z,err:=div(5,0) 

   if err!=nil{ 
       switch e:=err.(type) {            // 根据类型匹配 
       case DivError: 
           fmt.Println(e,e.x,e.y) 
       default: 
           fmt.Println(e) 
        } 

       log.Fatalln(err) 
    } 

   println(z) 
}
```

大量的函数方法返回error，使得调用代码变得很难看，一堆堆检查语句充斥在代码行间。解决思路

*   使用专门的检查函数处理错误逻辑(比如记录日志)简化检查代码
*   在不影响逻辑的情况下，使用defer延后处理错误状态（err退化赋值）
*   在不中断逻辑的情况下，将错误作为内部状态保存，等最终提交时在处理

### panic recover

与error相比，panic、recover使用上像try/catch结构化异常

panic 会立即中断当前函数流程，执行延迟调用。延迟调用中可以使用recover捕获panic返回的提交的错误对象，panic会一直沿着调用栈向外传递。要么被捕获要么程序崩溃

连续多次调用panic仅最后一个会被recover捕获

在延迟函数中panic，不会影响后续延迟调用执行。而recover之后panic，可被再次捕获。另外，**recover必须在延迟调用函数中执行才能正常工作。**

调试阶段，可使用runtime/debug.PrintStack函数输出完整调用堆栈信息。

建议：除非是不可恢复性、导致系统无法正常工作的错误，否则不建议使用panic 例如：文件系统没有操作权限，服务端口被占用，数据库未启动等情况。在 Go (Golang) 中，`struct` 标签（Tag）用于为字段指定额外的元数据。这些标签通常以字符串形式写在结构体字段的后面，括在反引号 \` 中，并常用于控制序列化/反序列化、数据库映射和验证等操作。

以下是 `struct` 标签解析不同类型数据时的常见选项及其用途：
## 1. 通用格式
标签的格式通常如下：
```
`key1:"value1" key2:"value2"`
```
多个键值对可以用空格分隔。不同库会解析特定的键值。
## 2. JSON 标签
**作用**：控制结构体与 JSON 数据的映射。
### 用法：
```
type Example struct {
	Name string `json:"name"`
	Age  int    `json:"age,omitempty"`
	ID   string `json:"-"`
}
```
#### 选项说明：
- `json:"name"`：将字段映射为 JSON 中的 `name`。
- `json:"age,omitempty"`：`omitempty` 表示如果字段值是零值（如空字符串、零、`nil` 等），则在序列化时忽略该字段。
- `json:"-"`：完全忽略该字段，既不会被序列化，也不会被反序列化。
## 3. XML 标签
**作用**：控制结构体与 XML 数据的映射。
### 用法：
```
type Example struct {
	Name  string `xml:"name"`
	Age   int    `xml:"age,omitempty"`
	Inner struct {
		ID string `xml:"id,attr"`
	} `xml:"inner"`
}
```
### 选项说明：
- `xml:"name"`：将字段映射为 XML 中的 `<name>`。
- `xml:"age,omitempty"`：`omitempty` 同样表示忽略零值字段。
- `xml:"id,attr"`：`attr` 指定字段为 XML 属性（如 `<inner id="value">`）。
- `xml:"-"`：忽略该字段。
## 4. GORM 标签
**作用**：控制结构体与数据库表字段的映射。
### 用法：
```
type User struct {
	ID        uint   `gorm:"primaryKey"`
	Name      string `gorm:"column:username;size:100;not null"`
	CreatedAt time.Time
}
```
### 选项说明：
- `primaryKey`：定义主键。
- `column:username`：将字段映射到数据库中的 `username` 列。
- `size:100`：设置字段长度限制为 100 个字符。
- `not null`：设置字段为非空。
## 5. Validator 标签
**作用**：定义结构体字段的校验规则。
### 用法：
```
type User struct {
	Name  string `validate:"required"`
	Email string `validate:"required,email"`
	Age   int    `validate:"gte=18,lte=60"`
}
```
### 选项说明：
- `required`：字段是必填项。
- `email`：字段必须是有效的电子邮件地址。
- `gte=18`：字段值必须大于或等于 18。
- `lte=60`：字段值必须小于或等于 60。
## 6. SQL/SQLX 标签
**作用**：控制与 SQL 查询的字段映射。
### 用法：
```
type User struct {
	ID    int    `db:"id"`
	Name  string `db:"username"`
	Email string `db:"email_address"`
}
```
### 选项说明：
- `db:"id"`：字段映射到数据库中的 `id` 列。
- 标签的键通常是 `db`，用于 SQL 和 SQLX 库。
## 7. Form 标签
**作用**：控制结构体与表单数据的映射。
### 用法：
``type LoginForm struct {     Username string `form:"username"`     Password string `form:"password"` }``
### 选项说明：
- `form:"username"`：将字段映射到表单中的 `username` 键。
- 常用于 Web 框架如 `gin` 或 `echo`。
## 8. YAML 标签
**作用**：控制结构体与 YAML 数据的映射。
### 用法：
```
type Config struct {
	Server   string `yaml:"server"`
	Port     int    `yaml:"port"`
	Timeout  int    `yaml:"timeout,omitempty"`
}
```
### 选项说明：
- `yaml:"server"`：将字段映射到 YAML 中的 `server` 键。
- `omitempty`：忽略零值字段。
## 9. Protobuf 标签
**作用**：定义结构体字段与 Protocol Buffers 的映射。
### 用法：
```
type User struct {
	ID    int32  `protobuf:"varint,1,opt,name=id"`     
	Name  string `protobuf:"bytes,2,opt,name=name"`     
	Email string `protobuf:"bytes,3,opt,name=email"`
}
```
### 选项说明：
- `varint,1,opt,name=id`：
    - `varint`：字段类型。
    - `1`：字段编号。
    - `opt`：字段是可选的。
    - `name`：字段名称。
## 10. **Custom 标签**
开发者也可以自定义标签来实现特定功能。例如：
```
type Example struct {
	Field string `custom:"custom_value"`
}
```
然后通过 `reflect` 包解析：
```
import "reflect"

func ParseTags(v interface{}) {
	t := reflect.TypeOf(v)
	
	for i := 0; i < t.NumField(); i++ {
		field := t.Field(i)
		tag := field.Tag.Get("custom")
		fmt.Println(field.Name, tag)
	} 
}
```
## 标签解析的常用工具包
- **`encoding/json`**：JSON 序列化/反序列化。
- **`encoding/xml`**：XML 序列化/反序列化。
- **`gopkg.in/yaml.v2`**：YAML 解析。
- **`github.com/go-playground/validator/v10`**：校验工具。
- **`gorm.io/gorm`**：ORM 工具。
- **`reflect`**：用于自定义标签解析。
如果需要了解某一标签的具体细节或有其他疑问，可以进一步讨论！# 断言
断言格式 `value, ok := x.(T)` x 表示一个接口的类型，T 表示一个具体的类型，返回 x 的值和一个 bool 值，可以判断 x 是否为 T 类型

_类型_​ _\__​_前添加一个_​ _\__​_波浪线_ ~ ，表示的是衍生\_类型\_，即使用 type 自定义的\_类型\_也可以被识别到( type MyInt int )，底层\_类型\_一致即可# 流程控制
if
--

*   无需括号将条件包裹
*   {}必须存在
*   左{必须与if else 处于同一行
*   if 后，条件前，可以添加变量初始化语句，使用；间隔
*   有返回值的函数，不允许将“最终的”return语句包含在if...else...结构中

```go
if x > 10 {}
if x > 10 {} else {}
// Go语言的if还有一个强大的地方就是条件判断语句里面允许声明一个变量，这个变量的作用域只能在该条件逻辑块内，其他地方就不起作用了
if x := sum(); x > 10 {}
if x == 3 {} else if x < 3 {} else {}
```

for

* * *

Go语言中的循环语句只支持for关键字，而不支持while和do-while 结构

```
for [变量声明或函数调用的返回值（开始时）];[条件判断];[变量声明或函数调用的返回值（结束时）] {

}
```

```go
sun := 0
for i := 0; i < 10; i++ {
    sum += i
}
```

无限循环(while)

```go
sum := 0
for {
    sum++
    if sum > 100 {
        break
    }
}

for a < 5 {...}
```

条件多重赋值

```go
a := []init{1,2,3}
for i,j := 0, len(a) -1; i<j; i,j=i+1,j-1 {
a[i],a[j] = a[j], a[i]
}
```

*   左花括号{必须与for处于同一行
*   Go语言中的for循环与C语言一样，都允许在循环条件中定义和初始化变量，唯一的区别是，Go语言不支持以逗号为间隔的多个赋值语句，必须使用平行赋值的方式来初始化多个变量
*   Go语言的for循环同样支持 continue 和 break 来控制循环，但是它提供了一个更高级的 break，可以选择中断哪一个循环

```go
for j := 0; j<5;j++{
    for i := 0; i<10; i++ {
        if i>5{
            break JLoop
        }
        fmt.Println(i)
    }
}
JLoop:
```

```go
for i,v := range varible {...}
```

switch

* * *

*   左花括号{必须与switch处于同一行
*   条件表达式不限制为常量或者整数
*   单个case中，可以出现多个结果选项
*   与C语言等规则相反，Go语言不需要用break来明确退出一个case
*   **只有在case中明确添加fallthrough关键字，才会继续执行紧跟的下一个case**
*   可以不设定 switch 之后的条件表达式， 在此种情况下， 整个 switch 结构与多个 if...else...的逻辑作用等同。

```go
switch sExpr {
  case expr 1:
      ...
  case expr 1:
      ...
  default:
      ...
}
```

每个case后默认自带 break

```go
switch i {
  case 1:
      ...
  case 2,3,4:
      ...
  default:
      ...
}
```

可以使用 fallthrough 强制执行后续

```go
switch i {
  case 1:
      ...
      fallthrough
  case 2,3,4:
      ...
      fallthrough
  default:
      ...
}
```

switch 后可以没有表达式

```go
switch {
    case a==0:
        fmt.Printf()
    default:
        fmt.Printf()
}
```# 函数
函数是一个语句序列打包单元，其他地方多次调用，函数用来分解任务，对用户隐藏实现细节;函数声明包括函数名，形参列表，返回值列表及函数体

```go
func add(x int, y int) int { return x + y }
func sub(x, y int) (z int) { z = x - y }
func first(x int, _ int) int { return x }
func zero(int, int) int { return 0 }
```

*   无需前置声明,不支持命名嵌套定义,不支持同名函数重载,不支持默认参数
*   blank identifler (即 `_` 符号)
*   函数的类型被称为函数的标识符，==函数形参和返回列表变量类型一一对应==，就认为有相同类型和标识符，==形参和返回值的变量名不影响函数标识符==，也不影响是否可以省略参数类型的形式表示
*   函数的形参和有名返回值作为函数最外层的局部变量，被存储在相同的词法块中
*   实参通过值的方式传递，因此函数的形参是实参的拷贝。对形参进行修改不会影响实参。但是，如果实参包括引用类型，如指针，slice (切片)、map、function、channel 等类型，实参可能会由于函数的间接引用被修改
*   遇到没有函数体的函数声明，这表示该函数不是以 Go 实现的。这样的声明定义了函数标识符
*   **函数只能和nil比较，不能和其他任何比较**在编程语言的编译优化原理中，分析指针动态范围的方法称之为逃逸分析。通俗来讲，当一个对象的指针被多个方法或线程引用时，我们称这个指针发生了逃逸。
*   函数返回局部变量指针是安全的，编译器会通过逃逸分析来决定是否在堆内存上分配内存
*   不支持有默认值的可选参数
*   不支持命名实参
*   必须按签名顺序传递指定类型和数量的实参
*   参数相当于函数的局部变量，不能在相同层次定义同名变量
*   形参是**函数定义**中的参数，实参是**函数调用**时所传递的参数
*   所有参数都是值拷贝传递，不管是指针、引用类型还是其他类型参数，区别是拷贝目标对象还是拷贝指针，调用前为形参和返回值分配内存，并将实参拷贝到形参内存。

多返回值

* * *

*   如果一个函数将所有的返回值都显示的变量名，那么该函数的 return 语句可以省略操作数。这称之为 bare return，使用 bare return 在多返回值时可以减少代码重复，但会使得代码难以理解不宜过度使用

可变参数

* * *

参数数量可变的函数称为为可变参数函数。在声明可变参数函数时，需要在==参数列表的最后一个参数类型之前==加上省略符号'...',这表示该函数会接收任意数量的该类型参数

可变参数函数经常被用于格式化字符串

```
func myfunc(arg ...int){}
arg []int
```

#### 不定参数类型

不定参数是指函数传入的参数个数为不定数量。为了做到这点，首先需要将函数定义为接受 不定参数类型：

```go
//使用不定参数
func myfunc(args ...int) { //函数接受不定参数，且类型全是int
    for _, arg := range args {
        fmt.Println(arg)
    }
}
myfunc(2, 3, 4)

从函数的实现角度来看，这没有任何影响，该怎么写就怎么写。但从调用方来说，情形则完 全不同：

// 不使用不定参数，正常写
func myfunc2(args []int) {
    for _, arg := range args {
        fmt.Println(arg)
    }
}
myfunc2([]int{1, 3, 7, 13})
```

*   ...type格式的类型只能作为函数的参数类型存在，并且必须是最后一个参数。
*   它是一 个语法糖（syntactic sugar），即这种语法对语言的功能并没有影响，但是更方便程序员使用。通 常来说，使用语法糖能够增加程序的可读性，从而减少程序出错的机会
*   类型...type本质上是一个数组切片，也就是\[\]type，这也是为 什么上面的参数args可以用for循环来获得每个传入的参数。

#### 不定参数传递

```go
func myfunc(args ...int) {
    // 按原样传递
    myfunc3(args...)

    // 传递片段，实际上任意的int slice都可以传进去
    myfunc3(args[1:]...)
}
```

#### 任意类型的不定参数

```go
func Printf(format string, args ...interface{}) { // ...

}
```

用interface{}传递任意类型数据是Go语言的惯例用法。使用interface{}仍然是类型安 全的

```go
package main import "fmt"

func MyPrintf(args ...interface{}) {
    for _, arg := range args {
        switch arg.(type) {
            case int:
                fmt.Println(arg, "is an int value.")
           case string:
                fmt.Println(arg, "is a string value.")
            case int64:
                fmt.Println(arg, "is an int64 value.")
            default:
                fmt.Println(arg, "is an unknown type.")
        }
    }
}

func main() {
var v1 int = 1
var v2 int64 = 234
var v3 string = "hello"
var v4 float32 = 1.234
MyPrintf(v1, v2, v3,v4)
}
```

传值与传指针

* * *

函数调用始终是对参数值得复制，参数为值复制的是对应的值，参数为指针复制的是对应的指针

*   传指针可以使得多个函数操作同一个对象；
*   传指针比较轻量（8bytes），只有内存地址，可以用指针传递较大的结构体
*   string，slice，map类型的实现类似指针，所以可以直接传递，而不用传指针，函数需要改变slice长度除外

Deferred

* * *

你只需要在调用普通函数或方法前加上关键字defer，就完成了defer所需要的语法。当defer语句被执行时，跟在defer后面的函数会被延迟执行。直到包含该defer语句的函数执行完毕时，defer后的函数才会被执行，不论包含defer语句的函数是通过return正常结束，还是由于panic导致的异常结束。你可以在==一个函数中执行多条defer语句，它们的执行顺序与声明顺序相反。== defer语句中的函数会在return语句更新返回值变量后再执行，又因为在函数中定义的匿 名函数可以访问该函数包括返回值变量在内的所有变量，所以，==对匿名函数采用defer机制，可以使其观察函数的返回值。== 被延迟执行的匿名函数甚至可以修改函数返回给调用者的返回值

```go
func triple(x int) (result int) {
    defer func (){result += x}()
    return double(x)
}
```

函数值，类型

* * *

函数被看作第一类值（first­class values）：函数像其他值一样，拥有类型，可以被赋值给其他变量，传递给函数，从函数返回。对函数值（function value）的调用类似函数调用

*   函数的零值是 nil，调用零值函数会引起 panic 错误
*   函数可以与 nil 比较
*   函数值之间不能比较，也不能用作 map 的 key
*   函数值能够通过数据来参数化函数，也可以通过行为

```go
// strings.Map
// func Map(mapping func(rune) rune, s string) string
// 将s的每一个unicode码值r都替换为mapping(r)，返回这些新码值组成的字符串拷贝。
// 如果mapping返回一个负值，将会丢弃该码值而不会被替换。（返回值中对应位置将没有码值）

func add1(r rune) rune {return r + 1}
fmt.Println(string.Map(add1, "abc")) // "bcd"
fmt.Println(string.Map(add1, "HAL-9000")) // "IBM.:111"
fmt.Println(string.Map(add1, "Admix")) // "Benjy"
```

在Go语言中函数也是一种变量，我们可以通过type来定义它，它的类型就是所有拥有相同的参数，相同的返回值。有了类型就可以把有类型的函数当值传递

```
type typeName func(arg1 arg1Type[,...])(result resultType[,...])
```

Panic

* * *

程序中应该没有或者很少有 panic 的东西。其可以中断原有的控制流程，进入一个恐慌的流程中。

*   有些错误只能在运行时检查，如数组访问边界、空指针引用等。运行时错误会引起 panic 异常。
*   panic 异常发生时程序会中断，并立即执行该 goroutine 的延迟函数(defer 机制)，随后程序崩溃输出日志信息。信息包含 panic value 和函数调用的堆栈跟踪信息。
*   panic value 通常是某种错误信息
*   每个 goroutine 日志信息中都会有与之相对的发生 panic 时的函数调用堆栈跟踪信息。通常不需要再次运行程序去定位问题，日志已提供足够诊断依据
*   因此，填写问题报告时，一般会将 panic 异常和日志信息一并记录
*   直接调用内置的 panic 函数也会引发 panic 异常，panic 函数接受任何值作为参数，当某些不该发生的场景发生时，就应该调用 panic。比如程序到达了某条逻辑不可达的路径

```go
switch s := suit(drawCard()); s {
    case "Spades":
    case "Hearts":
    case "Diamonds":
    case "Clubs":
    dafault:
        panic(fmt.Sprintf("invalid suit %q", s))
}

// 滥用，没必要
func Reset(x *Buffer){
    if x == nil {
        panic("x is nil")
    }
    x.elements = nil
}
```

*   断言函数必须满足的前置条件是明智的做法，但这很容易被滥用。除非能提供更多错误信息，或者能更快速的发现错误，否则不需要使用断言，编译器会在运行时帮你检查代码。
*   Go 的 panic 类似其他语言的异常，但适用场景有些不同。panic 会引起程序崩溃，所以 panic 用于严重错误，如程序内部逻辑不一致。一般应该使用 Go 提供的错误机制而不是 panic，尽量避免程序崩溃，健壮的程序中任何可以预料的错误都应用 Go 的错误机制优雅的处理。
*   Go 的 panic 机制中，延迟函数的调用在释放堆栈信息之前。runtime 包允许程序员输出堆栈信息 ==runtime.Stack== 。

Recover

* * *

通常不该对 panic 异常做任何处理，但有时可以从异常中恢复，至少在崩溃前做一些操作，recover 仅在 defer 函数中有效，正常流程中调用 recover 会返回 nil，且再无其他任何效果

> 举个例子，当web服务器遇到不可预料的严重问题时，在崩溃前应该将所有的连接关闭；如果不做任何处理，会使得客户端一直处于等待状态。如果 web 服务器还在开发阶段，服务器甚至可以将异常信息反馈到客户端，帮助调试。

*   deferred 函数中调用了内置函数 recover，并且定义该 defer 语句的函数发生了 panic 异常，recover 会使程序从 panic 中恢复，并返回 panic value。导致 panic 异常的函数不会继续运行，但能正常返回。在未发生 panic 时调用 recover，recover 会返回 nil。
*   不加区分的恢复所有的 panic 异常，不是可取的做法；因为在 panic 之后，无法保证包级变量的状态仍然和我们预期一致。
*   作为被广泛遵守的规范，你不应该试图去恢复其他包引起的 panic。也不应该恢复一个由他人开发的函数引起的 panic，但有时很难遵守规范，基于以上原因，安全的做法是有选择的 recover，只恢复应该恢复的 panic 异常，可以设置特殊的 panic value 标记那些 panic 应该被恢复

> 举个例子，net/http 包中提供了一个 web 服务器，将收到的请求分发给用户提供的处理函数。很显然，我们不能因为某个处理函数引发的 panic 异常，杀掉整个进程；web 服务器遇到处理函数导致的 panic 时会调用 recover，输出堆栈信息，继续运行。这样的做法在实践中很便捷，但也会引起资源泄漏，或是因为 recover 操作，导致其他问题。

```
var user = os.Getenv("USER")
func init(){
  if user == "" {
    panic("no value for $USER")
  }
}

func throwsPanic(f func()) (b bool){
    defer func(){
      if x := recover(); x != nil {
          b = true
      }	
    }()
    f()
    return
}
```

error 接口

* * *

```go
type error interface {
    Error() string
}

func Foo(param int) (n int, err error){}
```

实际代码来示范如何使用自定义的error类型。 首先，定义一个用于承载错误信息的类型。因为Go语言中接口的灵活性，你根本不需要从 error接口继承或者像Java一样需要使用implements来明确指定类型和接口之间的关系

```go
type PathError struct {
    Op string
    Path string
    Err error
}

func (e *PathError) Error() string {
    return e.Op + e.Path + e.Err.Error()
}

func Stat(name string) (fi FileInfo, err error){
    var stat syscall.Stat_t
    err = syscall.Stat(name, &stat)
    if err != nil {
        return nil, &PathError{"","",""}
    }
    return fileInfoFromStat(&stat, name), nil
}

fi, err := os.Stat("a.txt")

if err != nil {
 if e, ok := err.(*os.PathError); ok && e.Err != nil {}
}
```

main 函数和 init 函数

* * *

程序的初始化和执行都起始于main包。如果main包还导入了其他的包，那么在编译时就会将它们依次导入。有时一个包被多个包同时导入，那么它只会被导入一次（例如很多包可能都会用到fmt包，但它只会被导入一次，因为没有必要导入多次）。当一个包被导入时，如果该包还导入了其他的包，那么会先将其他包导入进来，然后再对这些包中的包级常量和变量进行初始化，接着执行init函数（如果有的话），依此类推。等所有被导入的包都加载完毕了，就会开始对main包中的包级常量和变量进行初始化，然后执行main包中的init函数（如果存在的话），最后执行main函数。

import

* * *

```go
// goroot 下
import (
    "fmt"
)
// 相对路径，当前文件同目录，不建议使用
import "./model"
// 绝对路径，加载 gopath/src/shorturl/model 下
import "shorturl/model"
import (
    // . 操作，省略报名直接调用函数
    . "fmt"
    // 别名操作
    f "fmt"
    // _ 操作，引入包，不直接使用包内函数，调用包的 init 函数
    _ "fmt"
)
```

递归
--

函数可以直接或间接的调用自身，大部分编程语言使用固定大小的函数调用栈，常见的大小从64KB到2MB不等。固定大小栈会限制递归的深度，当你用递归处理大量数据时，需要避免栈溢出；除此之外，还会导致安全性问题。与之相反,Go语言使用可变栈，栈的大小按需增加(初始时很小)。这使得我们使用递归时不必考虑溢出和安全问题。

匿名函数

* * *

\==拥有函数名的函数只能在包级语法块中被声明==，通过函数字面量（function literal，func 关键字后无函数名），我们可以绕过这一限制，在任何一个表达式中表示一个函数。函数值字面量是一种表达式，他的值被称为匿名函数(anonymous function)。 函数字面量允许我们使用时再定义它。`strings.Map(func (r rune) rune {return r + 1},"HAL-9000")` 更重要的是，通过这种方式定义的函数可以访问完整的词法环境（lexical environment），这意味着在函数中定义的内部函数可以引用该函数的变量（即和 js 中闭包，延长变量生命周期一样）

```go
func squares() func () int {
    var x int
    return func () int {
        x++
        return x * x
    }
}
f := squares()
f() //1 
f() //4
f() //9
```

捕获迭代变量

goto

* * *

goto 跳转到==当前函数内==定义的标签

```
func Fun1{
    i:=0
Here:
    fmt.Printf()
    i++
    goto Here
}
```

‍# generics
泛型多类型

* * *

```go
func SumIntsOrFloats[K comparable, V int64 | float64](m map[K]V) V {}
```

*   K 和 V 你可以理解为类型别名，在中括号之间进行定义，作用域也只在此函数内，可以在形参、函数主体、返回值类型 里使用
*   \==comparable== 是 Go 语言预声明的类型，是那些可以比较（可哈希）的类型的集合，通常用于定义 map 里的 key 类型
*   int64 | float64 意思是 V 可以是 int64 或 float64 中的任意一个
*   map\[K\]V 就是使用了 K 和 V 这两个别名类型的 map

调用时移除类型参数

* * *

```go
SumIntsOrFloats(ints)
```

类型约束

* * *

类型的类型称为约束

```go
// T 称为类型参数
// any 给类型参数指定类型，这种类型的类型称为约束, any 即没有约束

func Print[T any](s []T){}

type Number interface {
    int64 | float64
}

func SumNumbers[K comparable, V Number](m map[K]V) V {}
```

泛型类型（可以有自己的方法）

* * *

```
type Lockable[T any] struct {
    sync.Mutex
    Data T
}

var a Lockable[bool]
var b Lockable[string]


func (l *Lockable[T]) Do(f func(T)){}

func (l *Lockable[_]) Nothing(){}  _表示未使用
```# fuzzing
‍# 面向对象
method

* * *

### 声明

func (r ReceiverType) funcName (paramters) (result) 在函数声明时，在其名字之前放上一个变量，即是一个方法。这个附加的参数会将该函数附加到这 种类型上，即相当于为这种类型定义了一个独占的方法。

*   可以为当前包内除了接口和指针以外的任何类型定义方法；在能够给任意类型定义方法这一点上，Go和很多其它的面向对象的语言不太一样
*   如果方法内不引用实例，可省略参数名，仅保留类型

```go
type N int

func (n N)toString()string{
    return fmt.Printf(n)
}

func (N)test(){
    fmt.Printf("hi")
}
```

reveiver 叫做方法的接收器，早期的面向对象语言留下的遗产将 调用一个方法称为“向一个对象发送消息 在Go语言中，我们并不会像其它语言那样用this或者self作为接收器;我们可以任意的选择接收器的名字。==由于接收器的名字经常会被使用到，所以保持其在方法间传递时的一致性和简短性是不错 的主意。这里的建议是可以使用其类型的第一个字母，比如这里使用了Point的首字母p。== p.Distance 这种表达式叫做选择器，选择合适的对应 p 的 Distance 方法来执行

```go
package main
import (
    "fmt"
)
const (
    WHITE = iota
    BLACK
    BLUE
    RED
    YELLOW
)
type Color byte
type Box struct {
    width,height,depth float64
    color Color
}
type BoxList []Box
func (b Box) Volume() float64 {
    return b.width * b.height * b.depth
}
func (b *Box) SetColor(c Color){
    b.color = c
}
func (bl BoxList) BiggestsColor() Color {
    v := 0.00
    k := Color(WHITE)
    for _,b := range bl {
        if b.Volume() > v {
            v = b.Volume()
            k = b.color
        }
    }
    return k
}
func (c Color) String() string {
    strings := []string{ "WHITE", "BLACK", "BLUE", "RED", "YELLOW" }
    return strings[c]
}
func main(){...}
```

### 基于指针对象的方法

当调用一个函数时，会对其==每一个参数值进行拷贝==，如果一个函数需要==更新一个变量==，或者函数的其中一个参数实在太大我们希望能够==避免进行这种默认的拷贝==，这种情况下我们就需要用到指针了。对应到我们这里用来更新接收器的对象的方法，当这个==接受者变量本身比较大时==，我们就==可以用其指针而不是对象==来声明方法

```go
func (p *Point) ScaleBy(factor float64) {
    p.X *= factor
    p.Y *= factor
}
// 方法名为 (*Point).ScaleBy,必须要有(),否则可能会被理解成*(Point.ScaleBy)
```

\==在现实的程序里，一般会约定如果Point这个类有一个指针作为接收器的方法，那么所有Point的方 法都必须有一个指针接收器，即使是那些并不需要这个指针接收器的函数。==

*   只有类型`(Point)`和指向他们的指针`(*Point)`，才是可能会出现在接收器声明里的两种接收器。
*   此 外，为了避免歧义，在声明方法时，如果一个==类型名本身是一个指针==的话，是不允许其出现在接收器中的 方法可使用实例值或指针调用方法，编译器会根据方法 reveiver 类型自动在基础类型和指针类型间转换 对象是否特别大不适合拷贝，内存地址指针适合拷贝

#### nil 也是一个合法的接收器类型

接收器对象值为零值，零值是 nil 是，接收器的类型就是 nil,当你定义一个允许nil作为接收器值的方法的类型时，在类型前面的注释中指出nil变量代表的意义是 很有必要的

```go
type IntList struct {
    valut int
    Tail *IntList
}
func (list *IntList)Sum()int{
if list == nil {
return 0
}
return list.Value + list.Tail.Sum()
}
```

#### 通过嵌入结构体来扩展类型

```go
import "image/color"

type Point struct{ X, Y float64 }

type ColoredPoint struct { 
Point
Color color.RGBA
}
```

```

type ColoredPoint struct {

Point

Color color.RGBA

}

type ColoredPoint struct {

*Point

Color color.RGBA

}

type ColoredPoint struct {

Point

color.RGBA

}
```

如果选择器有二义性的话编译器会报错，比如你在同一级里 有两个同名的方法。 方法只能在命名类型(像Point)或者指向类型的指针上定义，内嵌使得我们给匿名 struct类型来定义方法也有了手段

#### 方法值和方法表达式

p.Distance叫作“选择器”，选择器会返回一个方法"值"­>一个将方法 (Point.Distance)绑定到特定接收器变量的函数。这个函数可以不通过指定其接收器即可被调用;即 调用时不需要指定接收器(译注:因为已经在前文中指定过了)，只要传入函数的参数即可 当T是一个类型时，方法表达式可能会写作T.f或者(\*T).f，会返回一个函数"值"，这种函数会将其第 一个参数用作接收器，所以可以用通常(译注:不写选择器)的方式来对其进行调用

```

p := Point{1, 2}

distanceFromP := p.Distance // 方法值

distanceFromP(q)

Distance:=Point.Distance //方法表达式

Distance(p,q)
```

#### 封装

一个对象的变量或者方法如果对调用方是不可见的话，一般就被定义为“封装”。封装有时候也被叫做信息隐藏，同时也是面向对象编程最关键的一个方面。 Go语言只有一种控制可见性的手段:大写首字母的标识符会从定义它们的包中被导出，小写字母 的则不会。这种限制包内成员的方式同样适用于struct或者一个类型的方法。因而如果我们想要封 装一个对象，我们必须将其定义为一个struct。

封装有三方面优点

1.  调用方不能直接修改对象的变量值，只需关注少量语句且只要弄懂少量变量的可能的值即可
2.  隐藏实现细节，可以防止调用方依赖那些可能变化的具体实现，这样使包设计者在不破坏对外api的情况下得到更大的自由
3.  阻止了外部调用方对对象内部的值任意的进行修改

```go
var a N
p:=&a
a.value()
p.value()
```

选择receiver类型参考

*   要修改实例状态， 用\*T
*   无需修改状态的小对象或固定值，建议用T
*   大对象建议用\*T，以减少复制成本
*   引用类型、字符串、函数等指针包装对象，直接用T
*   若包含Mutex等同步字段，用\*T，避免因复制造成锁操作无效
*   其他无法确定的情况，都用\*T

### 匿名字段

可以像访问匿名字段成员那样调用其方法，由编译器负责查找

```go
type data struct {
    sync.Mutex
}
d:=data{}
d.Lock() // 会处理为 sync.(*mutex).Lock()
```

可以访问匿名成员及方法但是他们却不属于继承关系

### 方法集

类型有一个与之相关联的方法集，这决定类型是否实现了某个接口。可以使用反射检测这些规则

*   类型 T 方法包含所有 receiver T 方法
*   类型 \*T 方法集包含所有 receiver T + \*T 方法
*   匿名嵌入 S，T 方法集包含所有 receiver S 方法
*   匿名嵌入 \*S，T 方法集包含所有 receiver S + \*S 方法
*   匿名嵌入 S 或 \*S，\*T 方法集包含所有 receiver S + \*S 方法

方法集仅影响接口实现和方法表达式转换，与通过实例指针调用方法无关。实例并不使用方法集，而直接调用。匿名字段就是为方法集准备的。方法和实例以匿名嵌入方式组合到一起共同实现对外接口。

### 表达式

方法根据引用方式不同，可分为expression和value两种状态。

#### Method Expression

通过类型引用的 method expression 会被还原为普通函数样式，receiver 是第一参数，调用时需显示传参。类型可以是T或\*T，只要目标方法存在于该类型方法集中即可

```go
type N int

func (n N)test(){}

f:=N.test
f(n)
f:=(*N).test
f(&n)

(*N).test(&n)
```

### Method Value

基于实例或指针引用的method value，参数签名不会改变，依旧按正常方式调用。**但当 method value 被赋值给变量或作为参数传递时，会立即计算并复制该方法执行所需要的 receiver 对象，与其绑定，以便在稍后执行时，能隐式传入 receiver 对象。**

```go
type N int

func (n N) test { }

var n N = 10
p:=&n

n++
f1:=n.test // 复制n 11

n++
f2:=p.test // 复制*p 12

n++

f1() // 11
f2() // 12
```

编译器会为 method value 生成一个包装函数，实现间接调用。至于receiver复制，和闭包的实现方法基本相同，打包成funcvval，经由DX寄存器传递。当method value作为参数时，会复制含receiver在内的整个method value

```go
func call(m func()){
    m()
}

var n N =10
p:=&n

print p n // 10

n++
call(n.test) // 11

n++
call(p.test) // 12
```

```go
type N int

// receiver 指针类型
func (n *N) test {
print n *n
}

var n N = 10
p:=&n

n++
f1:=n.test

n++
f2:=p.test

n++
print p n // 13

f1() // 13
f2() // 11
```# 接口
接口是一组 method 的组合，用来定义对象的一组行为 接口类型是对其它类型行为的抽象和概括;因为接口类型不会和特定的实现细节绑定在一起，通过 这种抽象的方式我们可以让我们的函数更加灵活和更具有适应能力。 Go语言中接口类型的独特之处在于它是满足隐式实现的。也就是说，我们没有必要对于给定的具体类型定义所有满足的接口类型;简单地拥有一些必需的方法就足够了。这种设计可以让你创建一个新的接口类型满足已经存在的具体类型却不会去改变这些类型的定义;当我们使用的类型来自于不受我们控制的包时这种设计尤其有用。

接口约定

* * *

接口类型是一种抽象类型，他不会暴露它所代表的对象的内部值的结构和这个对象支持的基础操作的集合

接口类型

* * *

接口类型具体描述了一系列方法的集合，一个实现了这些方法的具体类型是这个接口类型的实例。 io.Writer 类型是用的最广泛的接口之一，因为它提供了所有的类型写入bytes的抽象，包括文件类 型，内存缓冲区，网络链接，HTTP客户端，压缩工具，哈希等等。 io.Reader 可以代表任意可以读取bytes的类型 io.Closer 可以是任意可以关闭的值，例如一 个文件或是网络链接。

实现接口的条件

* * *

一个类型如果拥有一个接口需要的所有方法，那么这个类型就实现了这个接口。 接口指定的规则非常简单:表达一个类型属于某个接口只要这个类型实现这个接口,这个规则甚至适用于等式右边本身也是一个接口类型

```go
var w io.Writer
w = os.Stdout  // has Write method
w = new(bytes.Buffer) // has Write method
w = time.Second // error: lacks Write method

var rwc io.ReaderWriterCloser
rwc = os.Stdout // *os.File had Read, Write, Close method
rwc = new(bytes.Buffer) // error: lacks Close Method

w = rwc
rwc = w // error: lacks Close method
```

对于每一个命名过的具体类型 T；它一些方法的接收者是类型 T 本身然而另一些则是一个 T 的指针。在 T 类型的参数上调用一个 `*T` 的方法是合法的，只要这个参数是一个变量；编译器隐式的获取了他的地址。这仅仅是一个语法糖：T 类型的值不拥有所有 `*T` 指针的方法，那这样他就可能只实现更少的接口。 interface{}类型，它没有任何方法，被称为空接口类型是不可或缺的。因为空接口类型对实现它的类型没有要求，所以我们可以将任意一个值赋给空接口类型。 对于创建的一个interface{}值持有一个boolean，float，string，map，pointer，或者任意其它的类 型;我们当然不能直接对它持有的值做操作，因为interface{}没有任何方法。

flag.Value 接口

* * *

定义
--

接口代表一种契约，是多个方法声明的集合。有些动态语言也被称作协议。

*   需要共同遵守的实现约定的规则，无需知道对方身份协作
*   实现的是做什么，而不是怎么做，谁来做
*   解除类型依赖
*   有助于减少用户可视方法
*   屏蔽实现细节
*   会有运行期开销
*   包内，货值不频繁变化的内部模块并不需要抽象接口强行分离
*   最常见是对包外提供访问，或预留拓展空间
*   无需显示声明，只要包含接口声明全部方法即视为实现
*   可以先实现类型，后抽象所需接口（重构时，模块拆分时等）

```go
// 接口也是一种结构
// 不能有字段
// 不能定义自己的方法
// 只能声明方法，不能实现
// 可嵌入其他接口类型
type iface struct {
    tab *itab
    data unsafe.Pointer
}
```

*   通常以er做名称后缀
*   方法名是声名组成部分
*   参数名可不同或省略

```go
type tester interface {
    test()
    string()string

    type d strict{} 

    func (*data)test(){} // 只有指针才有test方法
    func (data)string()string{return ""}

    var d data
    var t tester = &d

    t = d // error
    t = &d
}
```

执行机制

* * *

接口使用一个名为itab的结构存储运行期所需要的相关类型信息。

```go
type iface struct {
    tab *itab // 类型信息
    data unsafe.Pointer // 实际对象指针
}

type itab struct {
    inter *interfacetype // 接口类型
    _type *_type // 实际对象类型
    fun [1]uintptr // 实际对象方法地址
}
```

将对象赋值给接口变量时，会复制该对象。无法修改接口存储的复制品，因为他是unaddressagle的 接口内部两个指针（itab，data)都为nil时，接口才等于nil。再返回错误信息时容易出问题，应该明确返回nil

类型转换

* * *

类型推断可将接口变量还原为原始类型，或用来判断是否实现了某个更具体的接口类型。 使用ok-idiom模式，几遍转换失败也不会引发panic。还可用switch语句在多种类型间做出推断匹配，这样空接口皆有更多发挥空间。

技巧
--

*   让编译器检查，确保类型实现了指定接口

```go
var _ InterfaceName = struct{}
```

*   定义函数类型，让相同签名的函数自动实现某个接口

```go
type FuncString func()string

func (f FuncString) String()string {
    return f()
}

var t fmt.Stringer = FuncString(
    func()string{
        return ""
    }
)
```

接口机理

* * *

### 类型赋值给接口

接口包含的方法列表是类型包含方法的子集

### 接口查询

接口查询即接口方法查询，类型实现了接口所有方法。就认为类型实现了接口。

### 接口赋值

接口查询的一种优化

```go
var a interface{} = 1

a.(int)
a.(string)
```

interface 变量存储的类型

* * *

interface 里的变量可以是任意类型的数值（实现了 interface），如何知道变量实际保存的是哪个类型的对象

*   Comma-ok 断言 `value, ok = element.(T)` value 是变量的值，ok 是一个 bool 类型，element 是 interface 变量，T 是断言类型
*   switch 测试

```go
type Element interface{}
type List []Element

type Person struct {
    name string
    age int
}

func (p Person) String() string { }
list := make(List, 3)
list[0] = 1
list[1] = "Hello"
list[2] = Person{"Dennis",8}

for i,v := range list {
    if val,ok := v.(int);ok{}
    else if val,ok := v.(string);ok{}
    else if val,ok := v.(Person);ok{}
    else{}
}


for i,v := range list {
    switch val:=v.(type){
        case int:
        case string:
        case Person:
        default:
    }
}
```

嵌入 interface

* * *

```go
// sort package
type Interface interface {
    Len() int
    Less(i,j int) bool
}

// heap package
type Interface interface {
    sort.Interface
    Push(x interface{}) interface{}
}
```

```go
type inter1 interface{}
type inter2 interface{}
type inter3 interface{
    inter1
    inter2
}
```

```go
package main
import (
    "fmt"
)
type Human struct {
    name string
    age int
    phone string
}
type Student struct {
    Human
    school string
    loan float32
}
type Employee struct {
    Human
    company string
    money float32
}
func (h Human) SayHi(){ }
func (h Human) Sing(lyrics string){}
func (e Employee) SayHi(){}

type Men interface {
    SayHi()
    Sing(lyrics string)
}

mike := Student{Human{"",34,""},"",34.4}
sam:= Employee{Human{"",43,""},"",3.44}

ls := make([]Men,2)
ls[0], ls[1] := mike, sam
```

反射
--

1.  首先把值转换为 reflect 对象，根据情况选择 reflect.Type 或 reflect.Value

```go
t := reflect.TypeOf(i) // 得到类型的元数据
v := reflect.ValueOf(i) // 得到实际值
```

1.  将 reflect 对象转化成相应的值，可以返回相应的类型和数值

```go
tag := t.Elem().Field(0).Tag
name := v.Elem().Field(0).String()
```

1.  反射的字段必须是可修改的

反射就是动态运行时的状态 Go语言提供了一种机制，在编译时不知道类型的情况下，可更新变量、在运行时查看 值、调用方法以及直接对它们的布局进行操作，这种机制称为反射(reflection)

*   在运行时更新变量和检查它们的值、调用它们的方法和它们支持的内在操作
*   不需要在编译时就知道这些变量的具体类型
*   可以让我们将类型本身作为第一类的值类型处理(把类型当作头等值)

why

* * *

我们需要一个有能力==统一处理各种值类型==的函数

*   处理的多种类型无法共享同一个接口
*   处理的类型布局未知
*   处理的类型在设计函数时还不存在
*   以上三条同时存在

reflect.Type 和 reflect.Value

* * *

```go
func TypeOf(i interface{}) reflect.Type
func ValueOf(i interface{}) reflect.Value
```

*   reflect 包定义两个重要类型，Type 和 Value。
*   Type 和 Value 接口均满足 `fmt.Stringer` 接口
*   一个 Type 表示一个 Go 类型，是一个接口，有一系列用来区分类型及检查他们组成部分的方法
*   reflect.TypeOf(interface{}) 接受任意类型，并返回 reflect.Type 形式的动态类型，reflect.TypeOf 总是返回具体类型

1.  反射能在运行期探知对象的类型信息和内存结构，一定程度上弥补了静态语言在动态行为上的不足。
2.  反射还是实现元编程的重要手段。
3.  Go对象头部并没有类型指针，通过其自身是无法在运行期获知任何类型相关信息的。
4.  反射操作所需的全部信息都源自接口变量。接口变量除存储自身类型外，还会保存实际对象的类型数据。 对所有接口进行反射都可以得到一个包含Type和Value的信息结构。Type表达的是被反射的这个变量本身的类型信息，Value表达的是变量实例本身的信息

```go
// switch 类型分支
switch x.(type) {
case type1:
  ...
case type2:
  ...
default:
  ...
}
```

```go
// 将一个具体的值转为接口类型会有一个隐式的接口转换操作
// 它会创建一个包含两个信息的接口值: 
// 操作数的动态类型(这里是int)和它的动态的值(这里是3)
t := reflect.TypeOf(3)
t.String() // "int"
t // "int"
```

```go
// reflect.TypeOf 总是返回具体类型
// io.Writer 是 interface，os.File 是类型
var w io.Writer = os.Stdout
reflect.TypeOf(w) // "*os.File"
```

*   一个 Value 可以装载任意类型的值
*   reflect.ValueOf(interface{}) 返回一个装载其动态值的 reflect.Value
*   reflect.Value 可以持有一个接口值
*   除非 Value 持有的是字符串, 否 则 String 方法只返回其类型. 而使用 fmt 包的 %v 标志参数会对 reflect.Values 特殊处理.
*   对 Value 调用 Type 方法将返回具体类型所对应的 reflect.Type
*   reflect.ValueOf 的逆操作是 reflect.Value.Interface 方法. 它返回一个 interface{} 类型，装载着与 reflect.Value 相同的具体值

```go
v := reflect.ValueOf(3) // a flect.Value
fmt.Println(v) // "3"  
fmt.Printf("%v\n", v) // "3"  
fmt.Println(v.String()) // NOTE: "<int Value>"

v.Type() // a reflect.Type
```

```go
type order struct {
    ordID int
    customID int
}

o:=order{456,56}

reflect.TypeOf(o) // main.order
reflect.ValueOf(o) // {456 56}
```

```go
v := reflect.ValueOf(3) // a reflect.Value
x := v.Interface()  // an interface{}
i := x.(int) // an int
fmt.Printf("%d\n", i) // "3"
```

reflect.Kind 和 reflect.Name

* * *

*   reflect.Type
    *   reflect.Type.Kind`func Kind() reflect.Kind`
    *   reflect.Type.Name`func Name() string` 这两个反射入口函数，会将任何传入的对象转换为接口类型。面对类型时，需要区分Type和Kind。前者表示真实类型（静态类型），后者表示其基础结构（底层类型）类别

### 理解反射的类型（Type）与种类（Kind）

在使用反射时，需要首先理解类型（Type）和种类（Kind）的区别。编程中，使用最多的是类型，但在反射中，当需要区分一个大品种的类型时，就会用到种类（Kind）。例如，需要统一判断类型中的指针时，使用种类（Kind）信息就较为方便。

#### 1) 反射种类（Kind）的定义

Go 程序中的类型（Type）指的是系统原生数据类型，如 int、string、bool、float32 等类型，以及使用 type 关键字定义的类型，这些类型的名称就是其类型本身的名称。例如使用 type A struct{} 定义结构体时，A 就是 struct{} 的类型。 Map、Slice、Chan 属于引用类型，使用起来类似于指针，但是在种类常量定义中仍然属于独立的种类，不属于 Ptr。 type A struct{} 定义的结构体属于 Struct 种类，\*A 属于 Ptr。

#### 2) 从类型对象中获取类型名称和种类

Go语言中的类型名称对应的反射获取方法是 reflect.Type 中的 Name() 方法，返回表示类型名称的字符串。 类型归属的种类（Kind）使用的是 reflect.Type 中的 Kind() 方法，返回 reflect.Kind 类型的常量。

```go
t:=reflect.TypeOf(o) // main.orider
t.Kind() // struct
t.Name() // orider
```

reflect.NumField 和 reflect.Field

* * *

*   reflect.Value
    *   reflect.Value.NumField`func NumField() int`
    *   reflect.Value.Field`func Field(n int) reflect.StructField` `NumField()`方法返回结构中的字段数，`Field(i int)`方法返回字段 `i` 的 `reflect.Value`。 NumField 只能用于结构体，用前判断reflect.ValueOf(o).Kind() === reflect.Struct

```go
v:=reflect.ValueOf(o) // {456 56}
v.NumField() // 2
v.Field(0) // 456
v.Field(1) // 56
```

reflect.Int 和 reflect.String

* * *

*   reflect.ValueOf
    *   reflect.Value.Int `func Int() int64`
    *   reflect.Value.String `func String() string` 构造复合类型

```go
reflect.ArrayOf(10, reflect.TypeOf(byte(0)))
reflect.MapOf(relect.TypeOf(""),reflect.TypeOf(0))
```

*   reflect.ArrayOf
*   reflect.MapOf
*   reflect.TypeOf(&n).Elem // 返回指针、数组、切片、字典（值）或通道**的**基类型 获取结构体指针的基类型后，才能遍历他的字段。
*   reflect.Ptr
*   reflect.TypeOf().NumField
*   reflect.TypeOf().Field
*   reflect.TypeOf().Field().Type
*   reflect.TypeOf().Field().Offset
*   reflect.TypeOf().Field().Name
*   reflect.TypeOf().Field().Type.NumberField
*   reflect.TypeOf().Field().Type.Field
*   reflect.TypeOf().Field().Anonymoust
*   Reflect.Ptr
*   reflect.TypeOf().FieldByName
*   reflect.Typeof().FieldByIndex 匿名字段可用多级索引（按定义顺序）直接访问。 相对于reflect而言，当前包和外包都是“外包”，可用反射提取struct tag，还能自动分解。其常用于ORM映射，或数据格式验证 辅助判断方法Implements、ConvertibleTo、AssignableTo都是运行期进行动态调用和赋值所必需的。
*   reflect.TypeOf().Implements
*   reflect.TypeOf().ConvertibleTo
*   reflect.TypeOf().AssignableTo

值
-

Value 专注于对象实例数据读写。接口变量会复制对象，且是unaddressable的，所以要修改目标对象，就必须使用指针。

*   reflect.ValueOf().Elem // 传入指针也需要Elem获取目标对象，被接口存储的指针本身是不能寻址和进行设置操作的
*   reflect.ValueOf().CannAddr
*   reflect.ValueOf().CanSet 不能对非导出字段直接进行设置操作，无论是当前包还是外包

```go
type User struct {
    Name string
    code int
}

func main(){
    p:=new(User)
    v:=reflect.ValueOf(p).Elem()

    name:=v.FieldByName("Name")
    code:=v.FieldByName("code")

    fmt.Printf(name.CanAddr(), name.CanSet())
    fmt.Printf(code.CanAddr(), code.CanSet())

    if name.CanSet() {
        name.SetString("Tom")
    }

    if code.CanAddr() {
        *(*int)(unsafe.Pointer(code.UnsafeAddr())) = 100
    }

    fmt.Printf(*p)
}
```

*   Value.Pointer // 返回该字段所保存的地址
*   Value.Int
*   Value.data
*   Value.UnsafeAddr // 返回该字段自身的地址（结构对象地址+偏移量）
*   Value.Interface // 进行类型推断和转换
*   Value.TrySend
*   Value.TryRecv

```go
type user struct{
    Name string
    Age int
}
u:=user{
    "mage",
    60
}

v:=reflect.ValueOf(&u)

p,ok:=v.Interface().(*user)
```

接口有两种nil状态，使用IsNil判断是否为nil

```go
var a interface{}=nil
var b interface()=(*int)(nil)

a==nil
reflect.ValueOf(b).IsNil()
```

方法
--

*   Value.MethodByName
*   Value.MethodByName().Call

```go
type X struct {}

func (X) Test(x,y int) (int,error){
    return x+y, fmt.Errorf("%d",x+y)
}

func main(){
    var a X
    v:=reflect.ValueOf(&a)
    m:=v.MethodByName("Test")

    in:=[]reflect.Value{
        reflect.ValueOf(1),
        reflect.ValueOf(2),
    }

    out:=m.Call(in)
    for _,v:= range out{
        fmt.Println(v)
    }
}
```

变参使用CallSlice更方便

```go
type X struct {}

func (X) Format(s string, a...interface{})string{
    return fmt.Sprintf(s,a...)
}

func main(){
    var a X
    v:=reflect.ValueOf(&a)
    m:=v.MethodByName("Format")

    out:=m.Call([]reflect.Value{
        reflect.ValueOf("%d"),
        reflect.ValueOf("x"),
        reflect.ValueOf("100"),
    })

    fmt.Println(out)

    out=m.CallSlice([]reflect.Value{
        reflect.ValueOf("%d"),
        reflect.ValueOf([]interface{}{"x",100})
    })
}
```

构建
--

*   make
*   new

性能
--

反射在带来“方便”的同时，也造成了很大的困扰。很多人对反射避之不及，因为它会造成很大的性能损失。需谨慎使用

用法
--

获取类型信息

* * *

```go
var x float64 = 3.4

v.TypeOf() // float64

v:=reflect.ValueOf(x)
v.Kind() == reflect.Float64 // true
v.Float() // 3.4
```

获取值类型

* * *

> 类型 Type 中有个成员函数 CanSet，Go语言中所有的类型都是值类型，即这些变量在传递给函数的时候将发生一次复制。基于这个原则，我们再次看一下下面的语句:

```go
var x float64 = 3.4
v := reflect.ValueOf(x)
v.Set(4,1)
```

> 首先要理清 v 和 x 的关系。在调用 ValueOf() 的地方，需要注意到 x 将会产生一个副本，因此 ValueOf() 内部对 x 的操作其实都是对着 x 的一个副本。假如 v 允许调用 Set()，那么我们也可以想象出，被修改的将是这个 x 的副本，而不是 x 本身。如果允许这样的行为，那么执行结果将会非常困惑。调用明明成功了，为 什么 x 的值还是原来的呢?为了解决这个问题Go语言，引入了可设属性这个概念(Settability)。 如果 CanSet() 返回 false，表示你不应该调用 Set() 和 Set\_Xxx\_() 方法，否则会收到这样的错误: `panic: reflect.Value.SetFloat using unaddressable value`

```go
var x float64 = 3.4
p := reflect.ValueOf(&x)
v := p.Elem()
v.CanSet()
```

对结构的反射操作

* * *

```go
type T struct { 
  A int
  B string
}

t := T{203, "mh203"}
s := reflect.ValueOf(&t).Elem()
typeOfT := s.Type()

for i := 0; i < s.NumField(); i++ {
        f := s.Field(i)
        fmt.Printf("%d: %s %s = %v\n", i, typeOfT.Field(i).Name, f.Type(), f.Interface())
}
```# oop
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
```# 结构体
聚合的数据类型，由零个或多个任意类型的值聚合成的实体。每个值称为结构体的成员。成员可以通过点操作符访问.其成员也是变量,可以直接赋值也可以通过指针访问 结构体成员的顺序也有重要意义，不同顺序就是不同类型；如果结构体成员名字是以大写字母开头的，那么该成员就是导出的;这是Go语言导出规则决定 的。一个结构体可能同时包含导出和未导出的成员k。

*   一个命名为S的结构体类型将不能再包含S类型的成员:因为一个聚合的值不能包含它自身。(该限制同样适应于数组。)
*   S类型的结构体可以包含 `*S` 指针类型的成员，这可以让我们创建递归 的数据结构
*   结构体类型的零值是每个成员都是零值。通常会将零值作为最合理的默认值。
*   结构体没有任何成员的话就是空结构体，写作`struct{}`。它的大小为0，也不包含任何信息，但是有时候依然是有价值的。有些 Go 语言程序员用 map 来模拟 set 数据结构时，用它来代替 map 中布尔类型的 value，只是强调 key 的重要性，但是因为节约的空间有限，而且语法比较复杂，所以我们 通常会避免这样的用法。

```go
type Person struct {
    name string
    age int
}

var p Person
p.name = "Astaxie"
p.age = 32

p:=Person{"Astaxie", 32}
p:=Person{name:"Astaxie", age: 32}

seen := make(map[string]struct{})
if _,ok := seen[s];!ok {
    seen[s] = struct{}{}
}
```

### 结构体面值

1.  按成员顺序（要记住成员类型和顺序，成员调整会导致错误，只在定义包内部使用，或者在排列比较规则的小结构体中使用`image.Point{x, y}` `color.RGBA{red, green, blue, alpha}`）
2.  以成员名字加值（常用）

```go
type Point struct {x, Y int}

p := Point{1, 2} // 按成员定义顺序为每个成员指定一个面值
Point{Y:2} // 以成员名字和值来初始化
```

考虑效率，较大结构体通常会用指针方式传入和返回 如果要在函数内部修改结构体成员的话，用指针传入是必须的;因为在Go语言中，所有的函数参数都是值拷贝传入的，函数参数将不再是函数调用时的原始变量。

```go
pp := &Point{1, 2}
// 等价
pp := new(Point)
*pp = Point{1, 2}
```

### 结构体比较

*   结构体全部成员可比较结构体就可以比较
*   可比较的结构体类型和其他比较类型一样，可以用于 map 的 key 类型

### 结构体嵌入和匿名成员(匿名字段/嵌入字段)

*   命名结构体包含另一个结构体类型的匿名成员，通过点运算符访问匿名成员链中嵌套的成员
*   声明一个成员的数据类型而不指明成员的名字，这类成员就叫匿名成员
*   匿名成员的数据类型必须是命名的类型或指向一个命名的类型的指针

```go
type Point struct { X, Y int}
type Circle struct { 
    Center Point
    Radius int
}
type Wheel struct {
    Circle Circle
    Spokes int
}

var w Wheel
w.Circle.Center.X = 8
w.Circle.Center.Y = 8
w.Circle.Radius = 5
w.Spokes = 20

type Circle struct {
    Point // 匿名成员，Point 类型被嵌入到 Circle 结构体
    Radius int
}

type Wheel struct {
    Circle
    Spokes int
}

var w Wheel
w.X = 8        // equivalent to w.Circle.Point.X = 8 
w.Y = 8        // equivalent to w.Circle.Point.Y = 8 
w.Radius = 5   // equivalent to w.Circle.Radius = 5
w.Spokes = 20
```

*   右边的注释中给出的显式形式`w.Circle.Point.X`访问这些叶子成员的语法依然有效，因此匿名成员并不是真的无法 访问了
*   匿名成员 Circle、Point 都有自己的名字（即命名类型的名字，但这些名字再点操作符中是可选的）
*   结构体的字面值没有简短表示匿名成员的语法
*   匿名成员有隐式名字，所以不能同时包含两个同类型的匿名成员，名称会冲突
*   成员的名字是有其类型隐式决定的，所有匿名成员也有可见性的规则约束
*   任何命名类型都可作为结构体的匿名成员

但是为什么要嵌入一个没有任何子成员类型的匿名成员类型呢?

答案是匿名类型的方法集。简短的点运算符语法可以用于选择匿名成员嵌套的成员，也可以用于访 问它们的方法。实际上，外层的结构体不仅仅是获得了匿名成员类型的所有成员，而且也获得了该 类型导出的全部的方法。这个机制可以用于将一个有简单行为的对象组合成有复杂行为的对象。组 合是Go语言中面向对象编程的核心

```go
// 以下均无法通过
w = Wheel{8, 8, 5, 20}
w = Wheel{X:8, Y:8, Radius:5, Spokes:20}

// 字面值必须遵循形状类型声明时的结构
w = Wheel{Circle{Point{8, 8}, 5}, 20}
w = Wheel{
    Circle: Circle{
        Point: Point{X:8, Y:8},
        Radius: 5,
    },
    Spokes:20
}

fmt.Printf("%#v\n", w)
// Wheel{ Circle: Circle{ Point: Point{X:8, Y:8}, Radius: 5 }, Spokes:20 }
```# 并发
*   并发：逻辑上具备同时处理多个任务的能力
*   并行：物理上在同一时刻执行多个并发任务 通常说的并发设计指的是多个任务同时执行，但实际上并不一定真在同一时刻发生。单核处理器以间隔方式切换执行。并行则依赖多核处理器在物理上真正同一时刻执行。他代表当前程序运行状态。并行是并发的理想模式。
*   通常用多进程来实现分布式和负载均衡，减轻单进程垃圾回收压力
*   用多线程(LWP)抢夺更多的处理器资源
*   用协程来提高处理器时间片利用率 整个运行时完全并发化设计，凡是你能看到的，几乎都在以goroutine方式运行。

并发基础

* * *

串行程序运行时，只有一个执行上下文，一个调用栈。并发则意味着程序在运行时有多个执行上下文，对应着多个调用栈。每个进程都有自己调用的堆和栈，有一个完整的上下文，操作系统会保存进程的上下文，等进程获得时间片以后，再恢复上下文到系统中。

多线程或多进程是并行的基本条件，但单线程也可用协程（coroutine）做到并发。

并发主流的实现模型：

1.  多进程 - 简单，进程间相互不影响，开销大（所有进程都由内核管理）（进程间互不影响，靠消息通信）
2.  多线程 - 属于系统层面的并发模式，使用最多且有效的一种模式。开销依旧较大，高并发模式下影响效率
3.  基于回调的非阻塞/异步IO - 通过事件驱动方式使用异步IO，但这种模式，编程比多线程要复杂，因为他把流程做了分割，对问题本身反应不够自然
4.  协程 - 协程（Coroutine）本质上是一种用户态线程，不需要操作系统来进行抢占式调度， 且在真正的实现中寄存于线程中，因此，系统开销极小，可以有效提高线程的任务并发性，而避免多线程的缺点。使用协程的优点是编程简单，结构清晰；缺点是需要语言的支持，如果不支持，则需要用户在程序中自行实现调度器。目前，原生支持协程的语言还很少。

并发模式：

1.  共享内存系统=线程+共享内存(传统并发模型：多线程共享内存)
2.  消息传递系统=线程+消息传递(现代并发模型：顺序通信进程(CSP))

线程间通信只能采取共享内存的方式，共享内存有死锁、资源竞争等缺点不好解决

消息传递系统中进程间共享状态的各种操作都被封装在线程之间传递的消息中，这要求：发送消息是对状态进行复制，并且在消息传递的边界上交出这个状态的所有权。逻辑上这个操作与共享内存系统中执行的原子更新操作相同（所谓==原子操作==是指不会被线程调度机制打断的操作；这种操作一旦开始，就一直运行到结束，中间不会有任何 context switch（切换到另一个线程）），但从物理上看则不同。由于需要复制操作，所以大多数消息传递实现在性能上并不优越，但线程中的状态管理工作通常会变得更简单。

协程
--

执行体是个抽象的概念，在操作系统层面有多个概念与之对应，比如操作系统自己掌管的进程（process）、进程内的线程（thread）以及进程内的协程（coroutine，也叫轻量级线程）。

之所以叫轻量级线程，协程创建上百万也不会导致系统资源衰竭，而线程和进程通常也不能过万。

goroutine

* * *

goroutine 运行时会创建多个线程来执行并发任务，且任务单元可被调度到其他线程并行执行。更像多线程和协程的综合体，能最大限度提升执行效率，发挥多核处理器能力。

goroutine 更像多线程和协程的综合体

Go 语言在语言级别支持轻量级线程，叫 goroutine。**Go 语言标准库提供的所有系统调用操作（当然也包括所有同步 IO 操作），都会出让 CPU 给其他 goroutine。** 这让事情变得非常简单，让轻量级线程的切换管理不依赖于系统的线程和进程，也不依赖于CPU的核心数量。

go 关键字，函数调用加 go 关键字这次调用就会在一个新的 goroutine 中并发执行。函数返回，goroutine 自动结束，但是如果函数有返回值会被丢弃。

go 关键字并非执行并发操作，而是创建一个并发单元。新建任务被放置在系统队列中，等待调度器安排合适系统线程去获取执行权。当前流程不会阻塞，不会等待该任务启动，且运行时也不保证并发执行顺序。

每个任务单元除保存函数指针、调用参数外，还会分配执行所需的栈内空间。相比系统默认MB级别线程，goroutine自定义栈初始只有2KB，所以能创建成千上万的并发任务。自定义栈按需分配策略，在需要时进行扩容，最大能到GB规模。

*   一个并发的执行单元叫做一个 goroutine一个程序启动
*   其主函数即在一个单独的 goroutine（main goroutine) 中运行
*   goroutine 使用 go 关键字创建, go 语句本身会迅速完成
*   主程序（main）返回，所有的 goroutine 都会被直接打断，程序退出
*   除了主函数退出或终止程序外，没有其他编程方法能够打断 goroutine 执行

goroutine因延迟执行而立即执行计算并复制执行参数。

```go
package main
import "fmt"
func Add(x, y int) {
    z := x + y
    fmt.Println(z)
}

func main() {
    for i := 0; i < 10; i++ {
        go Add(i, i)
    }
}
```

**Go程序从初始化main package并执行main()函数开始，当main()函数返回时，程序退出， 且程序并不等待其他goroutine（非主goroutine）结束。**

并发通信

* * *

并发编程的难度在于协调，并发单元间的通信是最大问题。两种最常见的并发通信模型：共享数据和消息

共享数据是指多个并发单元分别保持对同一个数据的引用，实现对该数据的共享。最常见的共享数据就是内存，也就是前面提到的共享内存。

go 使用的是消息机制，而非共享内存作为通信方式。

消息机制（channel）认为每个并发单元是自包含的、独立的个体，并且都有自己的变量，但在不同并发单元间这些变量不共享。每个单元的输入输出只有一种，那就是消息。

“不要通过共享内存来通信，而应该通过通信来共享内存。”

channel

* * *

通道类型和值

* * *

*   `chan T` 元素类型为T的双通道
*   `chan<- T` 元素类型为T的单向发送通道
*   `<-chan T` 元素类型为T的单向接收通道

### 容量属性

`make(chan type, integer)`

*   非缓冲通道（容量属性为0）
*   缓冲通道（容量属性不为0）

go鼓励使用CSP（Communicating Sequential Process）通道，以通信来代替内存共享，实现并发安全。(不要通过共享内存通信，而是通过通信共享内存)

CSP(Communicating Sequential Process)通信顺序进程是 gorutine 推荐通信方式，是一种并发编程模式，**有序阻塞和可预测的并发模型**

通过消息来避免竞态的模型有CSP 和 Actor 两种

CSP

* * *

*   作为 CSP 核心，通道是显示的
*   操作双方必须知道数据类型和具体通道
*   如果其中一端为准备妥当，或消息未及时处理，会阻塞当前端

Actor

* * *

*   Actor 是透明的，不在乎数据类型及通道，只要知道接收者信箱
*   默认是异步方式，发送方对消息是否被接收和处理不关心

通道只是一个队列（FIFO)。同步模式下，发送和接收双方配对，然后直接复制数据给对方。如配对失败，则置入等待队列，直到另一方出现后才被唤醒。异步模式抢夺的则是数据缓冲槽。发送方要求有空槽可供写入，而接收方则要求有缓冲数据可读。需求不符时，同样加入等待队列，直到有另一方写入数据或腾出空槽后被唤醒。

除传递消息外，通道还常被用作事件通知。

```go
done:=make(chan struct{})
c:=make(chan string)

go func(){
    s:=<-c
    println(s)
    close(done)
}()
c<-"hi"
<-done
```

*   同步模式必须有配对操作的goroutine出现，否则会一直阻塞。
*   而异步模式在缓冲区未满或数据未读完前，不会阻塞。
*   多数时候异步通道有助于提升性能，减少排队阻塞。
*   缓冲区大小仅是属性，不属于类型组成部分
*   通道本身是指针，可用相等操作符判断是否是同一对象，或nil
*   传递指针避免数据复制，但注意数据并发安全
*   内置行数cap和len返回缓冲区大小和当前以缓冲数量
*   同步通道cap和len均返回0，可以判断通道是否是同步

异步模式貌似就是有缓冲区的通道。

### 收发

*   写入读取操作符
*   ok-idom或range模式
*   及时使用close函数关闭通道引发结束通知，否则可能会死锁

一次性事件用close效率更好，没多余开销。连续或多样性事件，可传递不同数据标志实现。还可使用sync.Cond实现单播或广播事件

对于closed或nil通道，发送和接收操作都有相应规则

*   向已关闭通道发送数据，引发panci
*   从已关闭通道接收数据，返回以缓冲数据或零值
*   无论收发，nil通道都会阻塞

重复关闭，或关闭nil通道都会引发panic错误。

单向
--

通常使用类型转换来获取单向通道，并分别赋予操作双方

通过make创建单向通道没有意义

```go
c:=make(chan int) 
var send chan <-int = c
var recv <-chan int = c
```

close函数只能用于写入端

单通道无法转换为双通道

选择
--

同时处理多个通道可用select语句。他随即选择一个通道做收发操作

```go
var wg sync.WaitGroup
wg.Add(1)
a,b:=make(chan int),make(chan int)

go func(){
    defer wg.Done()

    for{
        var (
            name string
            x int
            ok bool
        )
        select {
            case x,ok = <-a
                name = "a"
            case x,ok = <-b
                name = "b"
        }

        if!ok{
            return
        }
    }
}()

go func(){
    defer wg.Done()
    defer close(a)
    defer close(b)

    for i:=0;i<10;i++ {
        select {
            case a<-i:
            case b<-i*10
        }
    }

}()

wg.Wait()
```

等通道全部处理结束（closed）可将已完成通道置为nil，这样就不会被阻塞，不再被select选中

当所有通道都不可用时，select会执行default语句。可避开select阻塞，但需注意处理外层循环，以免空耗。也可以用default处理一些默认逻辑。

```go
done:=make(chan struct{})
c:=make(chan int)

go func(){
    defer close(done)

    for {
        select {
            case x,ok:=<-c:
            if !ok {
                return
            }
            println("data:",x)
            default: // 避免select阻塞
        }
        println(time.Now())
        time.Sleep(time.Second)
    }
}()

time.Sleep(time.Second*5)
c<-100
close(c)
<-done
```

模式
--

通常使用工厂方法将goroutine和通道绑定。

```go
type receiver struct {
    sync.WaitGroup
    data chan int
}

func newRecevier() *receiver {
    r:=&receiver{
        data: make(chan int),
    }

    r.Add(i)

    go func(){
        defer r.Done()
        for x:=range r.data{
            println("recv:",x)
        }
    }()
    return r
}

r:=newReceiver()
r.data<-1
r.data<-2
close(r.data)
r.Wait()
```

通道本身是一个并发安全队列，可做ID generator、Pool等用途

```go
type pool chan[]byte

func newPool(cap int) pool {
    return make(chan []byte,cap)
}

func(p pool) get() []byte {
    var v[]byte

    select {
        case v=<-p:
        default:
            v=make([]byte,10)
    }
    return v
}

func(p pool)put(b[]byte){
    select {
        case p<-b:
        default:
    }
}
```

通道实现信号量

```go
runtime.GOMAXPROCS(4)
var wg sync.WaitGroup

sem:=make(chan struct{},2) // 最多两个并发

for i:=0;i<5;i++{
    wg.Add(1)
    go func(){
        defer wg.Done()

        sem<-struct{}{}
        defer func(){<-sem>}()
        time.Sleep(time.Second*2)
        fmt.Println(id, time.Now())
    }(i)
}
wg.Wait()
```

*   time.After
*   time.Tick

捕获INT、TERM信号，顺便实现一个简易的atexit函数

```go
var exits=&struct{
    sync.RWMutex
    funcs []func()
    signals chan os.Signal
}{}

func atexit(f func()){
    exits.Lock()
    defer exits.Unlock()
    exits.funcs=append(exits.funcs,f)
}

func waitExit(){
    if exits.signals==nil{
        exits.signals=make(chan os.Signal)
        signal.Notify(exits.signals,syscall.SIGINT,syscall.SIGTERM)
    }
    exits.RLock()

    for _,f:=range exits.funcs{
        defer f()
    }

    exits.RUnlock()
    <-exits.signals
}

atexit(func(){})
atexit(func(){})
waitExit()
```

性能
--

*   将发往通道的数据打包，减少次数
*   实现上来看，通道队列依旧使用锁同步机制，单次获取更多数据（批处理），可改善因频繁加锁造成的性能问题

资源泄露

* * *

goroutine leak 指 goroutine处于发送或接收阻塞状态,但一直未被唤醒。垃圾回收器并不收集此类资源，导致他们会在等待队列里长久休眠，形成资源泄露。

使用channel与goroutine实现通信代替内存共享的CSP模型

channel 是语言级别提供的多个 goroutine 间通信方式。

跨进程通信，我们建议用 分布式系统的方法来解决，比如使用Socket或者HTTP等通信协议。

channel是类型相关的。也就是说，一个channel只能传递一种类型的值，这个类型需要在声 明channel时指定。

channel 的发送和接收是阻塞的，无缓冲 channel 是多个 goroutine 间同步很好的工具

### range

### close

注：记住应该在生产者的地方关闭channel，而不是消费的地方去关闭它，这样容易引起panic。 另外，channel不像文件之类需要经常去关闭，只有当你确实没有任何数据发送了，或者你想显式的结束range循环之类的操作。

### 基本语法

```go
package main

import "fmt"

func Count(ch chan int, i int){
    ch <- i
}

func main(){
    chs := make([]chan int, 10)
    for i:=0; i < 10; i++ {
      chs[i] = make(chan int)
      go Count(chs[i], i)
    }
    for _, ch := range(chs){
        chval := <-ch
        fmt.Println(chval)
    }
}
```

```js
// 声明 var <chan_name> chan <chan_ele_type>

var chanName chan ElementType

// 初始化  make方法

ch := make(chan int)

// 写入

ch <- value  // 写入数据通常会导致程序阻塞，直到有其他goroutine从这个chinnel中读取数据

// 读出

val := <-ch
```

#### close

channel 的 close 操作用于关闭 channel，已关闭的操作不能发送，但是可以读取已经发送的值，如果已经没有数据了会产生一个零值数据 因为关闭操作只用于断言不再向channel发送新的数据，所以只有在发送者所在的goroutine才会调 用close函数，因此对一个只接收的channel调用close将是一个编译错误。

### Wait

进程退出时不会等待并发任务结束，可用通道阻塞，然后发出退出信号。

*   关闭通道 exit
*   写入数据

等待多个任务结束推荐使用**sync.WaitGroup** 通过设定计数器，让每个goroutine在退出前递减，直至归零解除阻塞。

*   Add 要等待完成的goroutine个数 Add(n) 或 n次Add(1)
*   Done 表示goroutine完成，使计数器减1
*   Wait 计数器为0前，一直阻塞当前goroutine

```go
exit := make(chan struct{}) // 只用作通知，数据无意义

go func (){
    time.Sleep(time.Second)
    println("done")

    close(exit)
}()

println("main...")
<-exit // 通道关闭，解除阻塞
println("exit...)
```

```go
var wg sync.WaitGroup

for i:=0;i<10;i++{
    wg.Add(1)

    go func(){
        defer wg.Done()
        time.Sleep(time.Second)
        println("gorountine", id, "done.")
    }(i)
}
println("main ...)
wg.Wait()
pringln("main exit.")
```

WaitGroup.Add 实现了原子操作，但建议在goroutine外累加计数器，以免没Add没执行，Wait以退出。Wait可以在多处使用，他们能都收到通知

### GOMAXPROCS

运行时可能会创建很多线程，但任何时候仅有限的几个线程参与并发任务执行。该数量默认与处理器核数相等，可用runtime.GOMAXPROCS函数（或环境变量）修改。如参数小于2，GOMAXPROCS仅返回当前设置值，不做任何调整。

### local storage

不同与线程，goroutine任务

1.  无法设置优先级
2.  无法获取编号
3.  没有局部存储（TLS)
4.  返回值会被抛弃

除获取优先级外其他都可轻易实现

```go
var wg sync.WaitGroup
var gs [5]struct{ // 用于实现类似TLS功能
    id int // 编号
    result int // 返回值
}

for i:=0;i<len(gs);i++ {
    wg.Add(1)

    go func(id int){
        defer wg.Done()
        gs[id].id=id
        gs[id].result=(id+1)*100
    }(i)
}

wg.Wait()
```

### Gosched

暂停，释放线程去执行其他任务。当前任务被放回队列，等待下次调度时恢复执行

```go
runtime.GOMAXPROCS(1)
exit:=make(chan struct{})

go func (){ // task b
    defer close(exit)

    go func(){  // task b, a 先执行
        println("b")
    }()

    for i:=0;i<4;i++ {
        println("a:",i)
        if i==1{ // 让出当前进程,调度执行b
            runtime.Gosched()
        }
    }
}()

<-exit
```

该函数很少被使用，因为运行时会主动向长时间运行（10 ms）的任务发出抢占调度。只是当前版本实现的算法稍显粗糙，不能保证调度总能成功，所以主动切换还有适用场合。

### Goexit

立即终止当前任务，运行时确保所有已注册延迟调用被执行。该函数不会影响其他并发任务，不会引发panic，自然也就无法捕获

```go
exit:=make(chan struct{})

go func(){
    defer close(exit) // 执行
    defer println("a") // 执行

    func(){
        defer func(){
            println("b", recover()==nil) // 执行，recover 返回 nil
        }()

        func(){ // 在多层调用中执行Goexit
            println("c")
            runtime.Goexit() // 立即终止整个调用堆栈
            println("c done.") // 不会执行
        }()

        println("b done.") // 不会执行
    }()
        println("b done.") // 不会执行
}()

<-exit>
```

main 中调用Goexit会等待其他任务结束，然后直接让进程崩溃。Goexit无论处在那一层，都能立即终止整个调用栈，这与return仅退出当前函数不同。

### select

多个 channel 可以使用 select 监听。select 默认是阻塞的，只有监听的 channel 中发送或接收可以进行时才会运行，多个 channel 都准备好时会随机选择一个，还可以有 default 语句 select 的用法与switch语言非常类似，由 select 开始一个新的选择块，每个选择条件由 case 语句来描述。与 switch 语句可以选择任何可使用相等比较的条件相比，select 有比较多的限制，其中最大的一条限制就是每个 case 语句里必须是一个 IO 操作

```go
select {
    case <- chan1:  // 成功读取chan1的数据时
    case chan2 <- 1: // 成功向chan2写入数据时
    default: // 上面均不满足时
}
```

**select不像switch，后面并不带判断条件，而是直接去查看case语句。** 每个 case语句都必须是一个面向channel的操作。

```go
// 随机写入1 0
ch := make(chan int, 1)

for {
    select {
        case ch <- 0:
        case ch <- 1:
    }

i := <-ch

fmt.Println("Value received:", i)
}
```

### 超时

runtime goroutine

* * *

*   Goexit 退出当前 goroutine，但 defer 还会继续调用
*   Gosched 退出当前 goroutine 执行权限，调度器安排其他等待的任务运行，并在下次某时候恢复执行
*   NumCPU 返回 CPU 数量
*   NumGoroutine 返回正在执行和排队的任务总数
*   GOMAXPROCS 设置可以运行的 CPU 核数

### 缓冲机制

```go
// no cache
c := make(chan int)
// cache
c := make(chan int, 1024)
```

调用make时第二个参数作为缓冲区大小传入，缓冲区满之前可以一直写入 读取时可以使用常规方法，也可以使用range

```go
for i := range c {
    fmt.Println(i)
}
```

#### 不带缓存的 channel

一个基于无缓存Channels的发送操作将导致发送者goroutine阻塞，直到另一个goroutine在相同的 Channels上执行接收操作，当发送的值通过Channels成功传输之后，两个goroutine可以继续执行 后面的语句。反之，如果接收操作先发生，那么接收者goroutine也将阻塞，直到有另一个 goroutine在相同的Channels上执行发送操作。

基于无缓存Channels的发送和接收操作将导致两个goroutine做一次同步操作。因为这个原因，无 缓存Channels有时候也被称为同步Channels。当通过一个无缓存Channels发送数据时，接收者收 到数据发生在唤醒发送者goroutine之前(译注:_happens before_，这是Go语言并发内存模型的一 个关键术语!)

#### 串联的 channels（pipeline）

#### 带缓存的 channels

```golang
ch:=make(chan int, 3)
cat(ch) // 3 容量
len(ch) // 有效元素的个数
```

如果我们使用了无缓存的channel，那么两个慢的goroutines将会因为没有人接收而被永远卡住。 这种情况，称为goroutines泄漏，这将是一个BUG。和垃圾变量不同，泄漏的goroutines并不会被 自动回收，因此确保每个不再需要的goroutine能正常退出是重要的。#### 并发的循环

#### 基于 select 的多路复用

*   time.Tick
*   time.After
*   time.NewTicker
    *   time.NewTicker.Stop

channel的零值是nil。也许会让你觉得比较奇怪，nil的channel有时候也是有一些用处的。因为对一 个nil的channel发送和接收操作会永远阻塞，在select语句中操作nil的channel永远都不会被select 到。

这使得我们可以用nil来激活或者禁用case，来达成处理其它输入或输出事件时超时和取消的逻辑。 我们会在下一节中看到一个例子。

#### 并发的退出

利用关闭了的 channel 产生零值的特性，通过关闭一个 channel 来进行广播通知所有 goroutine 退出，关闭了的通道会立即返回零值，所以不是发送一个值，而是关闭他

```go
var done = make(chan struct{})

func cancelled() bool {
    select {
    case<-done:
        return true
    default:
        return false
    }
}

go func(){
    ...
    close(done) // 关闭一个通道
}()

for {
    select {
    case<-done:
        for range fileSizes {}
        return
    case size,ok:=<-fileSizes:
    }
}

func walkDir(dir string, n *sync.WaitGroup, fileSize chan<-int64){
defer n.Done()
if cancelled(){
return
}
for _,entry := range dirents(dir){}
}

func dirents(dir string) []os.FileInfo {
    select {
    case sema<-struct{}{}:
    case <-done:
        return nil

    defer func(){<-sema}()
    }
}
```

### 超时机制

go 中没有提供直接的超时处理机制，我们可以利用select机制，可以方便解决超时问题。因为select特点是只要其中一个case完成就会继续执行而不考虑其他

```go
// 超时等待函数
timeout := make(chan bool, 1)
go func (){
    time.Sleep(1e9)  // 等待一秒
    timeout <- true  // time.After(5 * time.Second)
}

select {
    case <- ch:
    case <-timeout
}
```

这种写法看起来是一个小技巧，但却是在Go语言开发中避免channel通信超时的最有效方法。 在实际的开发过程中，这种写法也需要被合理利用起来，从而有效地提高代码质量。

### channel的传递

channel 也是一个原生类型，就像 map 类型，因此channel本身也可以通过channel传递

#### 管道

利用channel可以被传递的特性来设计管道

```go
type PipeData struct {
    value int
    handler func(int) int
    next chan int
}

func handle(queue chan *PipeData {
    for data := range queue {
        data.next <- data.handler(data.value)
    }
}
```

### 单向channel

单向channel只能用于发送或者接收数据，channel本身必然是同时接收读写的，否则根本没法用。单向channel只是对channel的一种使用限制

我们在将一个channel变量传递到一个函数时，可以通过将其指定为单向channel变量，从 而限制该函数中可以对此channel的操作， 比如只能往这个channel写， 或者只能从这个 channel读。

```go
var ch1 chan int
var ch2 chan<- float64 // 只写channel
var ch3 <-chan int // 只读channel

// 单向channel初始化
// channel是原生类型所以支持类型转换
// 单向双向之间转换
ch4 := make(chan int)
ch5 := <- chan int(ch4)
ch6 := chan <- int(ch4)
```

单向channel，从设计的角度考虑，所有的代码都应该遵循”最小权限原则“ 从而避免没必要地使用泛滥问题，进而导致程序失控。 因为关闭操作只用于断言不再向channel发送新的数据，所以只有在发送者所在的goroutine才会调 用close函数，因此对一个只接收的channel调用close将是一个编译错误。

#### 用法

```go
func Parse(ch <- chan int) {
    for value := range ch {
        fmt.Println("Parsing value", value)
    }
}
```

### 关闭channel

close(channel)

使用多重返回值的方式判断channel是否被关闭`x, ok := <-ch`

多核并行化

* * *

runtime.NumCPU() // cup 个数

出让时间片

* * *

runtime.Gosched() // 出让时间片给其他goroutine

同步
--

即使成功地用channel来作为通信手段，还是避免不了多个goroutine之间共享数据的问题，Go 语言的设计者虽然对channel有极高的期望，但也提供了妥善的资源锁方案。

### 同步锁

sync 包提供sync.Mutex 和 sync.RWMutex 两种锁类型。

Mutex是最简单的一种锁类型，同时也比较暴力，当一个goroutine获得了Mutex后，其他goroutine就只能乖乖等到这个goroutine释放该Mutex。

RWMutex相对友好些，是经典的单写多读模型。在读锁占用的情况下，会阻止写，但不阻止读，也就是多个goroutine可同时获取读锁（调用RLock()方法）而写锁（调用Lock()方法）会阻止任何其他goroutine（无论读和写）进来，整个锁相当于由该goroutine 独占。从RWMutex的实现看，RWMutex类型其实组合了Mutex

```go
type RWMutex struct {
    w Mutex
    writerSem uint32
    readerSem uint32
    readerCount int32
    readerWait int32
}
```

对于这两种锁类型，任何一个Lock()或RLock()均需要保证对应有Unlock()或RUnlock() 调用与之对应，否则可能导致等待该锁的所有goroutine处于饥饿状态，甚至可能导致死锁。

```go
var l sync.Mutex
func foo(){
    l.Lock()
    defer l.Unlock()
}
```

### 全局唯一性操作

```go
var once sync.Once
once.Do(func())
```

once 的 Do()方法可以保证在全局范围内只调用指定的函数一次（这里指 setup() 函数）， 而且所有其他goroutine在调用到此语句时， 将会先被阻塞， 直至全局唯一的 once.Do()调用结束后才继续。

为了更好地控制并行中的原子性操作，sync包中还包含一个atomic子包，它提供了对于一 些基础数据类型的原子操作函数

goroutine 机理（协程机理）

* * *

### 协程

协程（轻量级线程）

*   能够在单一的系统线程中模拟多个任务的并发执行
*   在一个特定的时间，只有一个任务在运行，即并非真正的并行
*   被动的任务调度方式，即任务没有主动抢占时间片的说法。当一个任务正在执行时，外部没有办法中止它。要进行任务切换，只能通过由该任务自身调用yield()来主动出让 CPU使用权。
*   每个协程都有自己的堆栈和局部变量

协程三个状态：挂起（出让了时间片）、运行、停止

### 任务

*   任务上下文，用于在切换任务是保持当前任务的运行环境
*   栈
*   状态
*   任务所对应的任务函数
*   任务的调用参数
*   之前和之后的任务

### 调度

循环执行正在等待中的任务，直到所有任务执行完成

### 上下文切换

任务切换

*   该任务的业务代码主动要求切换，既主动让出执行权
*   发生了io，导致阻塞

### 通信机制

channel

*   内存缓存，用于存放元素
*   发送队列
*   接收队列

基于共享变量的并发

* * *

并发就是指不确定一个事件一定先于另一个事件发生

并发安全指一个函数在线性程序中可以正确地工作。并发的情况下依然可以正确地工作

并发安全的类型是所有它的访问方法和操作就都是并发安全的类型

对于绝大部分变量，如要回避并发访问，要么限制变量只存在于一个 goroutine 内，要么维护一个更高层的互斥不变量。导出包级别的函数一般情况下都是并发安全的。由于 package 级的变量没法被限制在单一的 gorouine，所以修改这些变量“必须”使用互斥条件。

函数不工作的原因可能是死锁、活锁或者资源耗尽

\==竞态==是指在多个goroutine 按某些交错顺序执行时程序无法给出正确的结果。

\==数据静态==发生于并发读写同一变量并且至少其中有一个写入时

\==为定义行为==

```go
var x []int
go func(){x = make([]int, 10)}()
go func(){x = make([]int, 1000000)}()
x[999999]=1 // 未定义行为
```

slice 的三个部分:指针、长度和容量。如果指针来自于第一个make调用,而长度来自第二个make调用，那么x会变成一个嵌合体，它名义上长度为1000000但底层的数组只有10个元素。在这种情况下，尝试存储到第999999个元素会伤及很遥远的一段内存，其恶果无法预测，问题也很难调试和定位。这种语义上的雷区称为末定义行为，C程序员应当对此很熟悉了。幸运的是，相比之下Go语言很少有这种问题

\==如何避免数据竞态==

1.  不要修改变量
2.  避免从多个 goroutine 访问同一个变量
3.  互斥机制（允许多个 goroutine 访问同一个变量，但同一时间只有一个 goroutine 可以访问）

goroutine 通过通道向受限的 goroutine 发送查询请求或更新变量，这就是所说的 ‘不要通过共享内存来通讯，而是要通过通讯来共享内存‘；==监控 goroutine==是指使用通道请求来代理**一个受限变量的所有访问**的 goroutine

```go
// bank 包提供了一个只有一个账户的并发安全银行

расkаgе bank

var deposits=make(chan int) //发送存款额
var balances=make(chan int)//接收余额
func Deposit(amountint){deposits<-amount}
func Balance()int { return<- balances}
func teller(){
  //balance被限制在 teller goroutine中
  var balance int
    for {
        select {
            case amount:=<-deposits:
                blance+=amount
            case balances <-balance
        }
    }
}
func init(
go teller()//启动监控goroutine
}
```

\==串行受限==借助通道共享变量的地址，从而在多个 goroutine 之间共享该变量，变量受限于每一步的 goroutine（监控 goroutine 每一步在变换）

### 互斥锁

一个计数上线为 1 的信号量称为==二进制信号量== （互斥量）

```go
// 通过二进制信号量实现互斥锁的模式
var (
sema = makee(chan struct{}, 1)
balance int
)

func Deposit(amount int){
sema <- struct{}{} // 获取令牌
balance += amount
<- sema // 释放令牌
}

func Balance() int {
sema <- struct{}{}
b:=balance
<- sema
return b
}
```

sync.Mutex 类型来支持互斥锁模式，其 Lock 方法用于获取令牌，Unlock 方法用于释放令牌。Unlock 一般放在 defer 语句中，避免执行不到的情况发生导致错误

互斥量保护共享变量， 按照惯例，被互斥量保护的变量声明应当紧接在互斥量的声明之后。如果实际情况不是如此，请确认已加了注释来说明此事。

\==临界区域==处于 Lock 与 Unlock 直接的可以自由地读取和修改共享变量的部分称为临界区域

每个函数在开始时申请一个互斥锁，在结束时再释放掉，通过这种方式来确保共享变量不会被并发访问。这种西数、互斥锁、变量的组合方式称为==监控(monitor)模式==。(之前在监控 goroutine 中也使用了监控(monitor)这个词，都代表使用一个==代理人(broker)==来确保变量按顺序访问。

### 读写互斥锁

只允许读操作可以并发执行，但写操作需要完全独享的访问权限，这种锁称为==多读单写锁==

mu.RLock 和 mu.RUnlock 读锁（又叫共享锁） mu.Lock 和 mu.Unlock 写锁（又叫互斥锁）（原子操作）

sync.RWMutex 类型来支持读写互斥锁

### 同步原语

\==同步原语==是一系列用于解决多个线程同时进入临界区造成的数据不同步的问题的==抽象同步机制==。在实际应用程序中，有很多需要同步的场景，为了正确、高效地解决这些同步问题，抽象出了一系列同步原语。其中==互斥锁==是最常用的同步原语之一，它可以确保同一时刻只有一个线程可以执行临界区，从而避免竞争冒险。除此之外，还有==条件变量==、==信号量==、==读写锁==、==RCU==等同步原语。这些同步原语都有各自的特点和适用场景，可以根据实际需求进行选择和使用

\==信号量==是一种用于提供不同进程之间或者一个给定的不同线程间同步手段的原语。它是一种计数器，用于保持在0至指定最大值之间的一个计数值。当线程完成一次对该信号量对象的等待（wait）时，该计数值减一；当线程完成一次对信号量对象的释放（release）时，计数值加一。信号量多用于进程间的同步与互斥。简单来说，同步是处理竞争，安排进程执行的先后顺序就是同步，每个进程都有一定的先后执行顺序；互斥是互斥访问不可共享的临界资源，同时会引发两个新的控制问题（互斥可以说是特殊的同步）；竞争是当并发进程竞争使用同一个资源的时候，我们就称为竞争进程。共享资源通常分为两类：一类是互斥共享资源，即任一时刻只允许一个进程访问该资源；另一类是同步共享资源，即同一时刻允许多个进程访问该资源；信号量是解决互斥共享资源的同步问题而引入的机制。

\==条件变量==是一种用于线程间同步的机制，它可以让一个线程等待另一个线程满足某个条件后再继续执行。条件变量通常与互斥锁一起使用，以确保线程安全。当一个线程等待条件变量时，它会释放互斥锁并进入阻塞状态，直到另一个线程通知它条件已经满足。条件变量的使用可以避免线程占用CPU资源。

\==RCU==是一种同步机制，全称为Read-Copy-Update。它的基本思想是先创建一个旧数据的副本，然后在副本上进行修改操作。在写者进行修改操作的过程中，旧数据没有做任何更新，不会产生读写竞争，因此依然可以被读者并行访问。当写者修改完成后，写者直接将新数据内存地址替换掉旧数据的内存地址，由于内存地址替换操作是原子的，因此可以保证读写不会产生冲突。内存地址替换后，原有读者访问旧数据，新的读者将访问新数据。当原有读者访问完旧数据，进入静默期后，旧数据将被写者删除回收。RCU适用于多读少写场景.RCU机制除了保护普通指针指向的数据之外, 还可以用于保护链表数据结构. Linux内核中, 提供了一系列的标准函数, 可以使用RCU机制保护双链表. 标准链表元素使用RCU机制保护的链表, 链表中的标准元素, 仍然可以使用. 遍历, 修改, 删除链表元素时, 需要调用标准函数的RCU变体.

### 内存同步

即在可能的情况下，把变量限制到单个goroutine 中，对于其他变量，使用互斥锁。

### 延迟初始化

sync.Once 类型用于针对一次性初始化问题；Once 包含 一个布尔变量和一个互 斥 量 ，布尔变量记录初始化是否已经完成，互斥量则负责保护这个布尔变量和客户端的数据结构。Once 的唯一方法 Do 以初始化函数作为它的参数

每次调用 Do 时先锁定互斥量然后检查布尔变量，第一次调用时布尔为假，调用初始函数后置为真，后续调用相当于空操作

### 竞态检测器(race detector)

`-race` 参数添加到 `go build`、 `go run`、 `go test` 命令即可

打开检测器的版本可以记录对共享变量的所有访问、读写共享变量的 goroutine 标识、所有同步事件（go 语句、通道操作、Lock、Wait等）

### goroutines 和线程

每个 ==OS 线程==都有一个固定大小的内存块（一般 2MB）来做栈，用来存储当前被存储或挂起（指调用其他函数时）的函数的内部变量。2MB对于一个小小的 goroutine 太大（内存浪费），go 会创建大量 goroutine，另外，固定大小的栈对于复杂或者深层次的递归来说又不太够用；修改固定大小可以提升空间的利用率允许创建更多的线程，并且可以允许更深的递归点用，但是这两者不可兼备

goroutine 则会以一个很小的栈（一般只需 2KB），和 OS 线程一样了，他也是保存其活跃或挂起的函数调用的本地变量，但不太一样的是 goroutine 的栈大小不固定==（动态栈）==，会根据需要动态伸缩。最大值有 1GB

OS 线程被系统内核调度，每隔几号秒硬件计时器会中断处理，内核函数 scheduler 会挂起当前执行的线程并保存内存中他的寄存器内容，检查线程列表决定下次那个线程被运行，并从内存中恢复该线程的寄存器信息，恢复执行线程的的现场并开始执行线程，由于是内核调度，所以一个线程向另一个线程移动需要完整的上下文切换；保存用户线程到内存，恢复另一线程的状态到寄存器，更新调度器的数据结构，这些操作比较耗时，需要多次访问内存，并且会增加运行的 CPU 周期

GO Runtime 包含自己的调度器，这个调度器使用了一些技术手段，如 ==m:n 调度==会在 n 个操作系统线程上多工（调度） m 个 goroutine，Go 调度器的工作和内核的调度是相似的，但是这个调度器只关注单独的 Go 程序中的 goroutine (译注:按程序独立)。

和操作系统的线程调度不同的是，Go 调度器并不是用一个硬件定时器而是被Go语言"建筑"本身进行调度的。例如当一个 goroutine 调用了 time.Sleep 或者被 channel 调用或者 mutex 操作阻塞时，调度器会使其进入休眠并开始执行另一个 goroutine 直到时机到了再去唤醒第一个 goroutine。因为这 种调度方式不需要进入内核的上下文，所以重新调度一个goroutine比调度一个线程代价要低得多。

GO 调度器使用了一个叫做 ==GOMAXPROCS== 的变量来决定会有多少个操作系统的线程同时执行 GO 代码。其默认值是所运行机器的 CPU 核心数。休眠中的或 者在通信中被阻塞的 goroutine 是不需要一个对应的线程来做调度的。在 I/O 中或系统调用中或调用 非 Go 语言函数时，是需要一个对应的操作系统线程的，但是 GOMAXPROCS 并不需要将这几种情况计数在内。

可以通过修改环境变量 GOMAXPROCS，或者运行时用 runtime.GOMAXPROCS 函数来修改

```go
for {
    go fmt.Print(0)
    fmt.Print(1) 
}

$ GOMAXPROCS=1 go run hacker‐cliché.go 111111111111111111110000000000000000000011111...

$ GOMAXPROCS=2 go run hacker‐cliché.go 010101010101010101011001100101011010010100110...
```

在第一次执行时，最多同时只能有一个 goroutine 被执行。初始情况下只有 main goroutine 被执行， 所以会打印很多 1。过了一段时间后， GO 调度器会将其置为休眠，并唤醒另一个 goroutine，这时候就开始打印很多 0 了，在打印的时候，goroutine 是被调度到操作系统线程上的。在第二次执行时，我们使用了两个操作系统线程，所以两个goroutine 可以一起被执行，以同样的频率交替打印 0 和 1。我们必须强调的是 goroutine 的调度是受很多因子影响的，而 runtime 也是在不断地发展演进的，所以这里的你实际得到的结果可能会因为版本的不同而与我们运行的结果有所不同。

在大多数支持多线程的操作系统和程序语言中，当前的线程都有一个独特的==身份(id)==，并且这个身份信息可以以一个普通值的形式被被很容易地获取到，典型的可以是一个 integer 或者指针值。这种情况下我们做一个抽象化的 thread­local storage(线程本地存储，多线程编程中不希望其它线程访问的内容)就很容易，只需要以线程的 id 作为 key 的一个 map 就可以解决问题，每一个线程以其 id 就能从中获取到值，且和其它线程互不冲突。

goroutine 没有可以被程序员获取到的身份(id)的概念。这一点是设计上故意而为之，由于 thread­ local storage 总是会被滥用。比如说，一个 web server 是用一种支持 tls 的语言实现的，而非常普遍 的是很多函数会去寻找 HTTP 请求的信息，这代表它们就是去其存储层(这个存储层有可能是 tls)查找的。这就像是那些过分依赖全局变量的程序一样，会导致一种非健康的“距离外行为”，在这种行 为下，一个函数的行为可能不是由其自己内部的变量所决定，而是由其所运行在的线程所决定。因 此，如果线程本身的身份会改变——比如一些 worker 线程之类的——那么函数的行为就会变得神秘 莫测。

Go 鼓励更为简单的模式，这种模式下参数对函数的影响都是显式的。这样不仅使程序变得更易读，而且会让我们自由地向一些给定的函数分配子任务时不用担心其身份信息影响行为。

你现在应该已经明白了写一个 Go 程序所需要的所有语言特性信息。在后面两章节中，我们会回顾 一些之前的实例和工具，支持我们写出更大规模的程序:如何将一个工程组织成一系列的包，如果 获取，构建，测试，性能测试，剖析，写文档，并且将这些包分享出去。# runtime
*   Goexit // 退出当前goroutine，defer会继续执行
*   Gosched // 出让当前goroutine执行权限
*   NumCPU // 返回CPU数量
*   NumGoroutine // 返回正在执行行和排队任务总数
*   GOMAXPROCS // 设置可以运行的CPU核数# safe
safe

安全编程

* * *

\[toc\]

数据加密

* * *

### 对称加密

*   采用单秘钥的加密算法
*   构成：明文+加密算法+秘钥
*   常见的算法：DES，AES，RC4

### 非对称加密

*   采用双秘钥加密算法
*   构成：明文+加密算法+私钥+公钥
*   公私钥均可加解密，公钥加密要私钥解密，私钥加密要公钥解密
*   常见算法：RSA
*   私钥不能暴露，公钥是公开的

### 哈希算法

*   只需要加密，生成密文，不需要解密或者不可解密
*   是一种从任意数据中创建固定长度摘要信息的办法
*   常见算法：MD5，SHA-1等

数字签名

* * *

*   指用于标记数字文件拥有者、创造者、分发者身份的字符串
*   数字签名拥有标记文件身份、分发的不可抵赖性等作用
*   常用的数字签名采用了非对称加密

a公司发布a.exe文件，a.exe加入a的签名（a公司私钥加密的哈希值），得到签名后的a.exe，查看签名。用a公司的公钥解密哈希从而验证是否篡改，是否是a公司发布

数字证书

* * *

数字证书包含公钥，使用公钥加密信息给公钥发布者。

PKI 体系

* * *

PKI，全称公钥基础设施，是使用非对称加密理论，提供数字签名、加密、数字证书等服务的体系，一般包括权威认证机构（CA)、数字证书库、秘钥备份及恢复系统、证书作废系统、应用接口等。

围绕PKI体系，建立了一些权威的、公益的机构。它们提供数字证书库、密钥备份及恢复系统、证书作废系统、应用接口等具体的服务

go 中的 hash 函数

* * *

*   crypto/sha1
*   crypto/md5

```go
// 直接生成
md5.New()
sha1.New()

// 计算文件
md5h := md5.New()
sha1h := sha1.New()
file, err := os.Open(p)
io.Copy(sha1h, file)
io.Copy(md5h, file)
```

加密通信

* * *

https = http + ssl/tls

ssl 是网景公司开发的位于TCP与HTTP协议间的透明安全协议

tls 是由IETF实现的建立在ssl v3.0之上的兼容协议，区别在于所支持的加密算法

### 加密通信流程

下面过程都是依赖于SSL/TLS层实现的。在实际开发中，SSL/TLS的实现和工作原理比较复杂，但基本流程一致

1.  输入https协议的网址
2.  服务器向浏览器返回证书，浏览器检查证书合法性
3.  验证和发行
4.  浏览器使用证书中的公钥加密一个随机对称秘钥，并将加密后的秘钥和使用秘钥加密后的请求URL一起发送到服务器
5.  服务器用私钥解密随机对称秘钥，并用获取的秘钥解密加密的请求URL
6.  服务器把用户请求的网页用秘钥加密，并返回给用户。
7.  浏览器用秘钥解密服务器发来的网页数据，并将其显示

ssl协议有两层组成，上层协议包括ssl握手协议、更改密码规格协议、警报协议，下层协议包括ssl记录协议

ssl握手协议建立在ssl记录协议之上，在实际数据传输前用于在客户端与服务器之间进行握手。握手是一个协商过程。这个协议使得客户和服务器能够互相鉴别身份，协商加密算法。在任何数据传输前必须先握手

握手之后才能进行ssl记录协议，它的主要功能是为高层协议提供数据封装、压缩、添加mac、加密等支持。

### 支持https的web服务器

*   crypto/x509 一种常用的数字证书格式
*   crypto/rand 伪随机函数发生器，产生基于时间和CPU时钟的伪随机函数
*   crypto/rsa 非对称加密算法
*   crypto/tls 传输层安全协议
*   crypto/pem 非对称加密体系下，一般用于存放公钥和私钥的文件
*   http.ListenAndServerTLS
*   fmt.Sprintf()
*   tls.Config
*   tls.Certificate
*   net.Listen
*   tls.NewListener
*   http.Serve
*   pem.Decode

### 支持https的文件服务器

### 基于SSL/TSL的ECHO程序

id: f329a6fbdfff4430b8e706cc72675c4a parent\_id: 0089871cb65c479da25a476e5fe78950 created\_time: 2022-03-01T08:07:32.000Z updated\_time: 2022-07-04T08:19:47.792Z is\_conflict: 0 latitude: 0.00000000 longitude: 0.00000000 altitude: 0.0000 author: source\_url: is\_todo: 0 todo\_due: 0 todo\_completed: 0 source: joplin-desktop source\_application: net.cozic.joplin-desktop application\_data: order: 1650118635360 user\_created\_time: 2022-03-01T08:07:32.000Z user\_updated\_time: 2022-04-16T14:17:15.376Z encryption\_cipher\_text: encryption\_applied: 0 markup\_language: 1 is\_shared: 0 share\_id: conflict\_original\_id: master\_key\_id: type\_: 1# toolchan
工具链

* * *

\[toc\]

安装
--

工具
--

### go build

每次都会重新编译除标准库以外的所有依赖包

参数

> \-o 可执行文件名（默认与目录同名） -a 强制重新编译所有包（含标准库） -p 并行编译所使用的CPU核数量 -v 显示待编译包名字 -n 仅显示编译命令，但不执行 -x 显示正在执行的编译命令 -work 显示临时工作目录，完成后不删除 -race 启动数据竞争检查（仅支持amd64） -gcflags 编译器参数
> 
> > \-B 禁用越界检查 -N 禁用优化 -l 禁用内联 -u 禁用unsafe -S 输出汇编代码 -m 输出优化信息
> 
> \-ldflags 链接器参数
> 
> > \-s 禁用符号表 -w 禁用DRAWF调试信息 -X 设置字符串全局变量值 -H 设置可执行文件格式

### go install

与build参数相同，但会将编译结果安装到bin、pkg目录，支持增量编译，没有修改的情况下，直接链接pkg目录中的静态包

编译器用buildid检查文件清单和导入依赖，对比现有静态库和所有源文件修改时间来判断源码是否变化，以此来决定是否需要对包进行重新编译。至于buildid算法，实现起来很简单：将包的全部文件名，运行时版本号，所有导入的第三方包信息（路径、buildid）数据合并后哈希

### go get

将第三方包下载到GOPATH列表的第一个工作空间，默认不更新，需要”-u“参数

> \-d 仅下载，不安装 -u 更新包，包括其依赖项 -f 和 -u配合，强制更新，不检查是否过期 -t 下载测试代码所需的依赖包 -insecure 使用HTTP等非安全协议 -v 输出详细信息 -x 显示正在执行的命令”

### go env

### go clean

清理工作目录，删除编译和安装遗留的目标文件

> \-i 清理go install安装的文件 -r 递归清理所有依赖包 -x 显示正在执行的清理命令 -n 仅显示清理命令，但不执行

编译
--

编译并不仅仅是执行“go build”命令，还有一些须额外注意的内容。 如习惯使用GDB这类调试器，建议编译时添加-gcflags "-N -l"参数阻止优化和内联，否则调试时会有各种“找不到”的情况。

发布时参数-ldfalgs "-w -s"会让链接器剔除符号表和调试信息，能减小可执行文件并稍稍增加反编译难度。

### 交叉编译

所谓交叉编译，是指在一个平台下编译出其他平台所需要的可执行文件。

GO自举后只需使用GOOS、GOARCH环境变量指定目标平台和架构

### 条件编译

代码中用runtime.GOOS判断外，编译器本身就支持文件级别的条件编译

#### 将平台和架构信息添加到主文件名尾部

*   hello\_darwin.go hello\_linux.go
*   使用GOOS交叉编译,编译器会选择对应源码编译
*   文件名除GOOS外，还可以加上GOARCH，或任选其一

```sh
$GOOS=darwin go build -x
compild ... -pack./hello_darwin.go./main.go

$GOOS=linux go build -x
compild ... -pack./hello_linux.go./main.go
```

#### 使用build编译指令

与用文件名区分多版本类似，build编译指令告知编译器：当前源码文件只能用于指定环境。

a.go

```go
// +build windows
                    <--- 必须要有空格
package main
...
```

b.go

```go
// +build darwin
                    <--- 必须要有空格
package main
...
```

可以有多条build指令，表示and

// +build linux darwin // +build 386,!cgo

相当于 (linux OR darwin) AND (386 AND (NOT cgo))

#### 使用自定义tag命令

// +build!release

// +build log

go build -tags "release log"

### 预处理

使用 go generate 命令扫描源码文件，找出所有 "go: generate" 注释，提取其中命令并执行

参数

> *   \-v 显示处理的包及文件名
> *   \-x 显示准备执行的命令
> *   \-n 仅显示命令，但不执行

*   命令必须放在.go源文件中。
*   命令必须以“//go：generate”开头（双斜线后不能有空格）。
*   每个文件可有多条generate命令。
*   命令支持环境变量。
*   必须显式执行go generate命令。
*   按文件名顺序提取命令并执行。
*   串行执行，出错后终止后续命令的执行

这种设计的初衷是为包开发者准备的，可用其完成一些自动处理命令。比如在发布时，清理掉一些包用户不会使用的测试代码。除此之外，还可用来完成基于模板生成代码（类似泛型功能），或将资源文件转换为源码（.resx嵌入资源）等工作。

a.go

```go
// go:generate echo $GOPATH
// go:generate ls -lh
// go:generate uname -a

package main
...
```

可以定义别名，但当前文件有效，可多次使用

```go
// go:generate-command LX ls -l
// go:generate LX /var
// go:generate LX /usr
```# session
\[toc\]

Cookie

* * *

*   会话期 Cookie 会话期 cookies 将会在客户端关闭时被移除。 会话期 cookie 不设置 Expires 或 Max-Age 指令。注意浏览器通常支持会话恢复功能。
*   持久化 Cookie 持久化 Cookie 不会在客户端关闭时失效，而是在特定的日期（Expires）或者经过一段特定的时间之后（Max-Age）才会失效。
*   非法域 属于特定域的 cookie，假如域名不能涵盖原始服务器的域名，那么应该被用户代理拒绝。
*   Cookie 前缀 名称中包含 \_\_Secure- 或 \_\_Host- 前缀的 cookie，只可以应用在使用了安全连接（HTTPS）的域中，需要同时设置 secure 指令。另外，假如 cookie 以 \_\_Host- 为前缀，那么 path 属性的值必须为 "/"（表示整个站点），且不能含有 domain 属性。对于不支持 cookie 前缀的客户端，无法保证这些附加的条件成立，所以 cookie 总是被接受的。

```
type Cookie struct {
Name string
Value string
Path string
Domain string
Expries time.Time
RawExpries string

MaxAge int
Secure bool
HttpOnly bool
Raw string
Unparsed []string
}
```

*   http.SetCookie(w http.ResponseWriter, &http.Cookie)
*   Request.Cookie(name string)
*   Requese.Cookies()

```
for _,cookie := range r.Cookies(){
cookie.Name
cookie.Value
}
```

Session

* * *

会话，有始有终的一系列动作/消息，当Session一词与网络协议相关联时，它又往往隐含了“面向连接”和/或“保持状态”这样两个含义

Session 在 Web 开发中，指一类用来在客户端与服务端之间保持状态的解决方案。有时亦指这种解决方案的存储结构。

Session 是一种服务端机制，服务端使用类似散列表的结构（或者就是散列表）来保存信息。

*   客户端请求创建 Session
*   服务端检查客户端请求是否包含 Session 表示（Session ID）
*   如果有 Session 标识，说明已创建过，按照 Session ID 把 Session 检索出来使用（如果检索不到（可能服务端已删除对应 Session，用户人为添加的 JSESSION 参数），可能会新建一个）
*   如果不包含 Session ID 则会创建一个 Session 并且生成一个相关联的 Session ID，返回给客户端保存

\==Session机制本身并不复杂，然而其实现和配置上的灵活性却使得具体情况复杂多变。这也要求我们不能把仅仅某一次的经验或者某一个浏览器、服务器的经验当作普遍适用的。==

### Session 创建

1.  生成全局唯一标识 Session ID
2.  开辟数据存储空间。服务端程序一般会在内存中创建相应的数据结构，但这种情况下，系统一旦断电，所有的会话数据就会丢失，如果是电子商务类网站，这将造成严重的后果。所以为了解决这类问题，你可以将会话数据写到文件里或存储在数据库中，当然这样会增加I/O开销，但是它可以实现某种程度的Session持久化，也更有利于Session的共享。
3.  Session ID 发送给客户端（最关键）
    *   方式一 Cookie
    *   方式二 URL 重写（在返回给用户的页面里的所有的URL后面追加 Session 标识符，比较麻烦，但客户端禁用 Cookie 的话是首选方案）

### Session 管理

*   全局 Session 管理器
*   保证 Session ID 全局唯一性
*   为每个客户关联一个 Session
*   Session 的存储（存储到内存 文件 数据库）
*   Session 过期处理

Session 劫持

* * *

Session 劫持是中间人攻击的一种类型，SessionId 这暴露后可以直接冒充用户

### 防范

#### 方法一

*   SessionId 只允许 Cookie 设置，而不是通过 URL 重置的方式，同时设置 httponly
    *   这样可以防止 Cookie 被 XSS 读取从而引起 Session 劫持
    *   Cookie 设置不会像 URL 重置那样容易获取 SessionId
*   每个请求中加上 token，加一个隐藏 token 每次验证 token 保证用户请求唯一性

#### 方法二

给 Session 额外设置一个创建时间的值，过期销毁，重新生成，一定程度可以防止劫持

上面两个手段的组合可以在实践中消除Session劫持的风险，一方面，由于SessionID频繁改变，使攻击者难有机会获取有效的SessionID；另一方面，因为SessionID只能在Cookie中传递，然后设置了httponly，所以基于URL攻击的可能性为零，同时被XSS获取SessionID也不可能。最后，由于我们还设置了MaxAge=0，这样就相当于Session、Cookie不会留在浏览器的历史记录里面。# HTTP
http

* * *

\[toc\]

Request

* * *

### 请求行

GET /domains/example/ HTTP/1.1

### 请求头

Host/User-Agent/Accept/Accept-Encoding/Accept-Charset/...

#### Cache-Control:

*   private 默认值，只被单个用户缓存，不能共享缓存（即代理服务器不能缓存）
*   no-cache 强制协商缓存，提交给原始服务器验证
*   no-store 不使用任何缓存
*   pubilc 可以被任何对象缓存（客户端，代理服务器）

### 主体（请求体)

与Header部分有个空行

### Method

*   PUT(增)
*   DELETE(删)
*   POST(改)
*   GET(查)

| Name | Ver. | Func |
| --- | --- | --- |
| GET | 1.0 | 只被用于数据读取(幂等) |
| HEAD | 1.0 | 获取响应头，无响应主体，常用于查看服务器性能 |
| POST | 1.0 | 创建或修改 |
| PUT | 1.1 | 更新，用于已有资源整体替换(幂等) |
| DELETE | 1.1 | 删除  |
| CONNECT | 1.1 | 预留，管道 |
| OPTIONS | 1.1 | 与HEAD类似，一般用于查看服务端性能，会返回资源所支持的请求方法；跨域时会用于嗅探，用以判断是否有权限 |
| TRANCE | 1.1 | 回显服务器收到的请求信息，用于测试或诊断 |
| PATCH | 1.1 | 与PUT类似，更新，用于部分更新，资源不存在时新建 |

Response

* * *

### 状态行

HTTP/1.1 200 OK

### 响应头

Server/Date/Content-Type/Transfer-Encoding/Connection/content-Length/...

Connection: Keep-Alive 根据服务器设置的保持时间(不会永久保持链接)维持已建立的TCP链接不关闭，达到复用的目的

### 主体

与Header部分有个空行

Conn

* * *

```go
c, err := srv.newConn(rw)
if err != nil {
    continue
}
go c.serve()
```

```go
type ServeMux struct {
    mu sync.RWMutex
    m map[string]muxEntry
}

func (mux *ServeMux) handler(r *Request) Handler {
    mux.mu.RLock()
    defer mux.mu.RUnlock()
    
    h:=mux.match(r.Host + r.URL.Path)
    if h == nil {
        h=match(r.URL.Path)
    }
    
    if h == nil {
        h=NotFoundHandler()
    }
    
    return h
}
```

```go
type muxEntry struct {
    explicit bool
    h Handler
}
```

```go
type Handler interface {
    ServeHTTP(ResponseWriter, *Request)
}

type HandlerFunc func(ResponseWriter, *Request)

func (f HandlerFunc) ServeHTTP(w ResponseWriter, r *Request){
    f(w, r)
}
```

```go
func (mux *ServeMux) handler(r *Request) Handler {
    mux.mu.RLock()
    defer mux.mu.RUnlock()
    
    h:=mux.match(r.Host + r.URL.Path)
    if h == nil {
        h = mux.match(r.URL.Path)
    }
    if h == nil {
        h = NotFoundHandler()
    }
    return h
}
```

Handler

* * *

![drawio](api/images/wCU7sNdHu0sK/drawio-{_sketch__false})# net
*   [net](#net)
    *   [Socket 编程](#socket-%E7%BC%96%E7%A8%8B)
        *   [Dial() 函数](#dial-%E5%87%BD%E6%95%B0)
        *   [一些其他函数](#%E4%B8%80%E4%BA%9B%E5%85%B6%E4%BB%96%E5%87%BD%E6%95%B0)
    *   [HTTP 编程](#http-%E7%BC%96%E7%A8%8B)
        *   [HTTP客户端](#http%E5%AE%A2%E6%88%B7%E7%AB%AF)
            *   [http.Get()](#httpget)
            *   [http.Post()](#httppost)
            *   [http.PostForm()](#httppostform)
            *   [http.Head()](#httphead)
            *   [(\*http.Client).Do()](#httpclientdo)
            *   [高级封装](#%E9%AB%98%E7%BA%A7%E5%B0%81%E8%A3%85)
            *   [自定义Client](#%E8%87%AA%E5%AE%9A%E4%B9%89client)
            *   [自定义 http.Transport](#%E8%87%AA%E5%AE%9A%E4%B9%89-httptransport)
            *   [http.RoundTripper 接口](#httproundtripper-%E6%8E%A5%E5%8F%A3)
            *   [Client](#client)
        *   [HTTP服务端](#http%E6%9C%8D%E5%8A%A1%E7%AB%AF)
            *   [处理http请求](#%E5%A4%84%E7%90%86http%E8%AF%B7%E6%B1%82)
            *   [处理https请求](#%E5%A4%84%E7%90%86https%E8%AF%B7%E6%B1%82)
    *   [RPC 编程](#rpc-%E7%BC%96%E7%A8%8B)
        *   [RPC 支持与处理](#rpc-%E6%94%AF%E6%8C%81%E4%B8%8E%E5%A4%84%E7%90%86)
        *   [Gob(go 专用无法用于其他语言)](#gobgo-%E4%B8%93%E7%94%A8%E6%97%A0%E6%B3%95%E7%94%A8%E4%BA%8E%E5%85%B6%E4%BB%96%E8%AF%AD%E8%A8%80)
        *   [RPC接口](#rpc%E6%8E%A5%E5%8F%A3)
    *   [JSON 处理](#json-%E5%A4%84%E7%90%86)
        *   [编码](#%E7%BC%96%E7%A0%81)
        *   [解码](#%E8%A7%A3%E7%A0%81)
        *   [未知结构的json](#%E6%9C%AA%E7%9F%A5%E7%BB%93%E6%9E%84%E7%9A%84json)
        *   [json流式读写](#json%E6%B5%81%E5%BC%8F%E8%AF%BB%E5%86%99)
    *   [网站](#%E7%BD%91%E7%AB%99)
        *   [模板](#%E6%A8%A1%E6%9D%BF)
            *   [模板缓存](#%E6%A8%A1%E6%9D%BF%E7%BC%93%E5%AD%98)
            *   [错误处理](#%E9%94%99%E8%AF%AF%E5%A4%84%E7%90%86)
            *   [动态请求和静态资源分离](#%E5%8A%A8%E6%80%81%E8%AF%B7%E6%B1%82%E5%92%8C%E9%9D%99%E6%80%81%E8%B5%84%E6%BA%90%E5%88%86%E7%A6%BB)
            *   [相关内容补充](#%E7%9B%B8%E5%85%B3%E5%86%85%E5%AE%B9%E8%A1%A5%E5%85%85)

Socket 编程

* * *

### Accept() 函数

listener对象的Accept方法会直接阻塞，直到一个新的连接被创建，然后会返回一个net.Conn对象来表示这个连接。

### Dial() 函数

```go
// net 为网络协议的名字
// addr 为 ip 地址或域名，端口号以 “ : ” 形式跟随在地址后，可选
// Conn 为连接对象，连接成功时返回
func Dial(net, addr string) (Conn, error)
```

```go
conn, err := net.Dial("tcp", "192.168.0.10:2100")

conn, err := net.Dial("udp", "192.168.0.10:2100")

conn, err := net.Dial("ip4:icmp", "www.domian.com") // icmp 链接，使用协议名称

conn, err := net.Dial("ip4:1", "192.168.0.10") // icmp 链接，使用协议编号
```

目前 Dial 支持如下协议

*   tcp
*   tcp4 (仅限ipv4）
*   tcp6 (仅限ipv6）
*   udp
*   udp4
*   udp6
*   ip
*   ip4
*   ip6

发送和接收分别使用 conn 的 Write() 和 Read() 方法

实际上Dial()函数是对DialTCP(),DialUDP(),DIalIP(),DialUnix()的封装，也可以调用这些函数功能是一样的

```go
func DialTCP(net string, laddr, raddr *TCPAddr) (c *TCPConn, err error)
func DialUDP(net string, laddr, raddr *UDPAddr) (c *UDPConn, err error)
func DialIP(net string, laddr, raddr *IPAddr) (*IPConn, error)
func DialUnix(net string, laddr, raddr *UnixAddr) (c *UnixConn, err error)
```

```go
conn, err := net.Dial("tcp", host)

// 下面这两个函数在Dial()中得到了封装
tcpAddr, err := net.ResolveTCPAddr("tpc4", host) // net.ResolveTCPAddr()  用于解析地址和端口号
conn, err := net.DialTCP("tcp", nil, tcpAddr) // net.DialTCP()  用于建立连接
```

### 一些其他函数

```go
// 验证IP地址有效性
func ParseIP()

// 创建子网掩码
func IPv4Mask(a, b, c, d byte) IPMask

// 获取默认子网掩
func (ip IP) DefaultMask() IPMask

// 根据域名查找IP的
func ResolveIPAddr(net, addr string) (*IPAddr, error) 
func LookupHost(name string) (cname string, addrs []string, err error)
```

HTTP 编程

* * *

net/http包，涵盖了HTTP客户端和服务端的具体实现

### HTTP客户端

提供的方法

```go
func (c *Client) Get(url string) (r *Response, err error)
func (c *Client) Post(url string, bodyType string, body io.Reader) (r *Response, err error)
func (c *Client) PostForm(url string, data url.Values) (r *Response, err error)
func (c *Client) Head(url string) (r *Response, err error)
func (c *Client) Do(req *Request) (resp *Response, err error)
```

#### http.Get()

```go
resp, err := http.Get("http://example.com/")
if err != nil {
    ...
    return
}
defer resp.Body.close()
io.Copy(os.Stdout, resp.Body)
```

#### http.Post()

参数依次为 URL， 数据资源类型，比特流

```go
resp, err := http.Post("url", "image/jpeg", &imageDataBuf)
if err != nil {
    ...
    return
}
if resp.StatusCode != http.StatusOK {
    ...
    return
}
```

#### http.PostForm()

实现了标准编码格式为application/x-www-form-urlencoded的提交

```go
resp, err := http.PostForm("url", url.Values{"title":{"article title"}, "content":{"article body"}})
if err != nil {
    ...
    return
}
```

#### http.Head()

#### (\*http.Client).Do()

如果需要自定义一些Http Header字段，比如自定义的User-Agent，传递Cookie等

```go
req, err := http.NewRequest("GET", "url", nil)
req.Header.Add("User-Agent", "Go book Custom User-Agent")
client := &http.Client{...}
resp, err := client.Do(req)
```

#### 高级封装

http 的 Get Post PostForm Head 等方法都是在http.DefaultClient 的基础上进行调用的，比如http.Get()等价于http.DefaultClient.Get()

```go
// Client 类型
type Client struct {
    // Transport 用于确定 HTTP 请求的创建机制（运行机制），为空时使用默认DefaultTransport，
    // Transport类型必须实现http.RoundTripper接口，http.Transport 也可以自定义
    Transport RoundTripper
    
    // CheckRedirect 定义重定向策略（处理重定向的策略）
    // Get Head 返回 30X 状态码时，Client会遵循跳转规则之前先调用这个CheckRedirect函数
    // 不为空时客户跟踪 HTTP 重定向前调用该函数
    // req 和 via 这两个参数分别为即将发起的请求和已经发起的所有请求，最早发起的在最前面
    // 如果返回错误，客户端将直接返回错误，不再发起请求
    // 为空 Client 将采用一种确认策略 将在10个连续请求后终止
    CheckRedirect func(req *Request, via []*Request) error
    
    // Jar用于设定Client的Cookie
    // Jar 必须实现http.CookieJar接口
    // CookieJar接口预定义SetCookies() 和 Cookies() 两个方法
    // Jar 为空，Cookie将不会在请求中发送，并会在响应中忽略
    // 实际一般都使用http.SetCookie() 方法来设定Cookie
    Jar CookieJar
}
```

使用自定义的Client及其Do方法我们可以很灵活的控制HTTP请求，比如自定义header，改写重定向策略等

#### 自定义Client

```go
client := &http.Client {
    CheckRedirect: redirectPolicyFunc,
}

resp, err := client.Get("url")
req, err := http.NewRequest("GET", "url",nil)
req.Header.Add("","")
resp, err := client.Do(req)
```

#### 自定义 http.Transport

其指定一个HTTP请求的运行规则

Transport结构

```go
type Transport struct {
// Proxy指定用于针对特定请求返回代理的函数。
// 如果返回非空错误，请求将终止并返回该错误
// 如果Proxy为空或者返回一个空的URL指针，将不使用代理
    Proxy func(*Request)(*url.URL, error)
    
// 指定用于创建TCP链接的dail()函数，默认使用net.Dial()函数
    Dial func(net, addr string)(c net.Conn, err error)
    
//指定用户tls.Client的TLS配置，有默认配置
    TLSClientConfig *tls.Config

    DisableKeepAlives bool // 是否取消长链接，默认false，启用长链接
    
    DisableCompression bool  // 是否取消压缩GZip，默认false，启用压缩
    
// 控制每个host所需要保持的最大空闲连接数，默认值使用DefaultMaxIdleConnsPerHost
    MaxIdleConnsPerHost int
}
```

其他成员方法

```go
// 用于关闭所有非活跃链接
func (t *Transport) CloseIdleConnections()

// 注册并启用新的传输协议，如websocket的传输协议标准ws，或ftp file等
func (t *Transport) RegisterProtocol(scheme string, rt RoundTripper)

// 用于实现http.RoundTripper接口
func (t *Transport) RoundTrip(req *Request) (resp *Response, err error)

tr := &http.Transport {
    TLSClientConfig: &tls.Config{RootCAs: pool},
    DisableCompression: true,
}
client := &http.Client{Transport: tr}
resp, err := client.Get('url')
```

#### http.RoundTripper 接口

自定义Client的第一个公开成员就是Transport，该成员必须实现RoundTripper接口

```go
type RoundTripper interface {
    RoundTrip(*Request) (*Response, error)
}
```

RoundTripper接口很简单只有一个方法RoundTrip。RoundTrip执行一个单一的HTTP事务，返回相应的响应信息。 RoundTrip函数的实现不应试图去理解响应的内容。如果RoundTrip得到一个响应， 无论该响应的HTTP状态码如何，都应将返回的err设置为nil。非空的err 只意味着没有成功获取到响应。 类似地，RoundTrip也不应试图处理更高级别的协议，比如重定向、认证和 Cookie等。 RoundTrip不应修改请求内容, 除非了是为了理解Body内容。每一个请求 的URL和Header域都应被正确初始化

#### Client

Client 设计为上下两层结构

*   一层是http.Client类及其封装的基础方法（业务层，只关心请求的业务逻辑本身）无需关心非业务技术细节
*   另一层传输层，抽象了http.RoundTripper接口，并通过http.Transport实现接口，从而处理更多细节
*   这些细节包括：
    *   http底层传输细节
    *   http代理
    *   gzip压缩
    *   连接池及其管理
    *   认证（ssl等）

### HTTP服务端

#### 处理http请求

http.ListenAndServe()

```go
// addr 监听地址
// handler 服务处理程序

func ListenAndServe(addr string, handler Handler) error
```

handler 服务处理程序，通常为空，由http.DefaultServeMux 进行处理，http.Handle() 或 http.HandleFunc() 默认注入http.DefaultServeMux中

```go
http.Handle("/foo", fooHandler)

// 第一个参数是目标路径，可以是字符串或者字符串形式的正则
// 第二个参数是集体的回调方法
// 回调的第一个参数是ResponseWrite，包装处理服务端的响应信息
// 回调的第二个参数是Request，请求的数据结构体，代表一个客户端
http.HandleFunc("/bar", func(w http.ResponseWriter, r *http.Request){
    fmt.Fprintf(w, "Hello, %q", html.EscapeString(r.URL.Path))
})
log.Fatal(http.ListenAndServe(":8080", nil))

// 自定义Server

s := &http.Server{
    Addr: ":8080",
    Handler: myHandler,
    ReadTimeout: 10*time.Second,
    WriteTimeout: 10*time.Second,
    MaxHeaderBytes: 1 << 20,
}
log.Fatal(s.ListenAndServe())
```

#### 处理https请求

http.ListenAndServeTLS()

```go
func ListenAndServeTLS(addr, certFile, keyFile string, handler Handler) error
```

ListenAndServeTLS 与 ListenAndServe 行为是一致的，区别在于只处理https。服务器上必须包含证书和与之匹配的私钥的相关文件，certFile对应ssl证书文件存放路径，keyFile对应证书私钥文件路径

```go
http.ListenAndServe(":8080","cert.pem","key.pem", nil))
serve.ListenAndServeTLS("cert.pem","key.pem")
```

RPC 编程

* * *

Remote Procedure Call -> 远程过程调用 RPC

RPC是一种通过网络从远程计算机程序上请求服务，而不需要了解底层网络细节的应用程序通信协议，其构建与TCP或UDP或HTTP之上，允许开发者直接调用另一计算机上的程序而无需额外的为这个调用过程编写网络通信相关代码，使得开发包括网络分布式程序在内的应用程序更加容易。

RPC采用C/S的工作模式,客户端程序发送一个带有参数的调用信息，服务端进程保持睡眠状态直到客户端的调用信息到达。服务端获得参数计算结果并发送应答信息，然后等待下个调用。客户端收到应答后继续执行。

### RPC 支持与处理

net/rpc

在RPC服务端，可将一个对象注册为可访问的服务，之后该对象的公开方法就能够以远程的方式提供访问。一个RPC服务端可以注册多个不同类型的对象，但不允许注册同一个类型的多个对象。

一个对象中只有满足以下条件的方法才能被服务端设置为可供远程访问：

*   必须是在对象外部可公开的方法
*   必须有两个参数，且参数的类型都必须是包外部可以访问的类型或者是Go内置的类型
*   第二个参数必须是一个指针
*   方法必须返回一个errror类型的值

```go
func (t *T) MethodName(argType T1, replyType *T2) error
```

T,T1,T2默认会使用内置的encoding/gob 包进行编码解码，第一个参数有客户端传入，第二个参数表示要返回给客户端的结果。

服务端可以通过rpc.ServeConn处理单个请求，多数下通过TCP或是HTTP监听网络地址来创建服务

net/rpc 包提供rpc.DIal()和rpc.DialHTTP()来于指定的RPC服务端建立连接，客户端使用同步或异步的方式处理结果，RPC客户端的Call()方法进行同步处理，客户端按顺序执行。接收完服务端处理结果后才能继续执行后面。Go()方法则可以进行异步处理，无需等待即可处理后面的程序。当有结果后在进行相应的处理。

### Gob(go 专用无法用于其他语言)

Gob( encoding/gob ) 是一个序列化数据结构的编码解码工具。数据使用 Gob 进行序列化后能够用于网络传输。Gob 是二进制编码数据流，Gob 流可以自解释的，保证高效的同时保证完备的表达力

### RPC接口

```go
type ClientCodec interface {
    WriteRequest (*Request, interface {}) error
    ReadResponseHeader (*Respinse) error
    ReadResponseBody (interface {}) error
    
    Close() error
}

type ServerCodec interface {
    ReadRequestHeader (*Request) error
    ReadRequestBody (interface {}) error
    WriteResponse (*Response, interface{}) error
    
    Close() error
}
```

JSON 处理

* * *

encoding/json

### 编码

```go
json.Marshal()
```

channel、complex、func 类型不可转换

```go
func Marshal(v interface{}) ([]byte, error) // stringify
```

如果转化前的数据结构中出现指针，那么将会转化指针所指向的值，如果指针指向的是零值， 那么null将作为转化后的结果输出

*   布尔转json还是布尔
*   浮点 整型会被转化为json里的常规数字
*   字符串以utf-8转化为unicode
*   数组和切片会转为json里的数组，\[\]byte会被转为base64编码后的字符串，slice类型0值转为null
*   结构体转为json对象，切只有大写开头的可被导出自字段才会转化输出
*   转化map，其类型必须是map\[string\] T

### 解码

```go
json.Unmarshal()
```

```go
func Unmarshal(data []byte, v interface{}) error
```

第一个参数是输入\[\]byte类型，第二个是一个类型的实例对象，是输出到的容器，放转化结果

### 未知结构的json

空接口是通用类型。如果结构未知将其输出到一个空接口即可

*   JSON中的布尔值将会转换为Go中的bool类型
*   数值会被转换为Go中的float64类型
*   字符串转换后还是string类型
*   JSON数组会转换为\[\]interface{}类型
*   JSON对象会转换为map\[string\]interface{}类型
*   null值会转换为nil。

```go
val.(Type)
```

### json流式读写

json包中有Decoder和Encoder两个用于json流式读写类型，提供了NewDecoder()和NewEncoder()的两个函数实现

```go
func NewDecoder(r io.Reader) *Decoder
func NewEncoder(r io.Writer) *Encoder
```

网站
--

```go
http.HandleFunc('path', callback) // 路由
http.ListenAndServe("", nil)
io.WriteString(target, content)
```

### 模板

html/template

```go
template.ParseFiles("htmlfile")
```

*   {{}} 模板代码
*   if 判断式
*   range 循环体
*   . 表示循环中的当前元素，.|formatter表示当前元素以formatte方式输出，.|html以html显示，转义等

#### 模板缓存

init函数会在main函数之前执行

```go
templates := make(map[string]*template.Template)
```

提前加载ParseFiles，存在templates中

template.Must() 确保模板解析不成功是一定会触发错误处理流程

```go
func Must(t *Template, err error) *Template
```

#### 错误处理

panic() 导致崩溃的问题，HandleFunc上层包裹一个函数使用闭包返回一个在defer中使用recover捕获的函数，参数与HandleFunc一致

#### 动态请求和静态资源分离

```go
http.ServerFile(http.ResponseWrite, *http.Request, path string)
```

读取文件写到http.ResponseWiter并返回

#### 相关内容补充

*   ResponseWrite/Request 都有啥
*   path.Ext(path string) string // 返回路径扩展名
*   os.Stat()
*   os.IsExist()
*   os.Create()
*   os.Copy()
*   ioutil.TempFile()
*   http.StatusFound
*   http.StatusInternalServerError
*   http.NotFound()
*   http.Error()
*   http.ServeMux
*   http.ServeMux.HandleFunc()
*   log.Println()
*   error.Error()# form
\[toc\]

*   http.Request.ParseForm 解析get中的params或者post中的body;只有就可以从Request中读取Form信息
*   Request.Form
*   Request.Form\[key\]

表单验证

* * *

*   表单中的文本框、文本域、上传文件，无值时在Form中是空值，复选框和单选按钮则不会在Form中产生对应函数，可以用Request.Form.Get来获取值，这样不管是否存在于Form无值的情况都会返回空值，再使用len判断是否填写
*   如果是数字就试着转成int类型（或者使用正则也可以），然后处理

XSS

* * *

应对：

1.  验证所有输入数据，有效监测攻击
2.  处理所有输出数据进行适当的处理，放置任何成功注入的脚本运行

### html/template

HTMLEscape(w io.Writer, b \[\]byte) // 把b进行转义之后写入到w HTMLEscapeString(s string) string // 转义s后返回结果字符串 HTMLEscaper(args ...interface{}) string // 支持多个参数一起转义，返回结果字符串

重复提交

* * *

token

文件上传

* * *

### 表单上传

form 标签 enctype 属性

*   application/x-www-form-urlencoded 发送前编码所有字符，默认为此项
*   multipart/form-data 部队字符编码。在使用包含文件上传控件的表单时，必须使用此项
*   text/plain 空格转换为 "+" 加号，但不对特殊字符编码
*   调用 `r.ParseMultipartForm(maxMemory)` 处理文件上传，maxMemory 参数表示最大内存，如果大小超过maxMemory，剩下部分将存储在系统临时文件中
*   r.FormFile() 获取文件句柄
*   os.OpenFile
*   io.Copy 来存储文件

“注：获取其他非文件字段信息的时候就不需要调用r.ParseForm，因为在需要的时候Go语言自动会去调用，而且ParseMultipartForm调用一次之后，后面再次调用不会再有效果。

文件的handler是multipart.FileHeader

```
type FileHeader struct {
    Filename string
    Header textproto.MIMEHeader
}
```

### 客户端上传

*   bytes.Buffer
*   multipart.NewWriter
*   Writer.CreateFormFile
*   os.Open
*   io.Copy
*   Writer.FormDataContentType
*   http.Post
*   ioutil.ReadAll# JSON
Javascript 对象表示法（JSON）用于发送和接收结构化信息的标准协议，类似的还有 XML、ASN、Google 的 Protocol Buffers 都是；由于简洁性、可读性、流行程度等，JSON 是应用最广泛的一个。

*   encoding/json
*   encoding/xml
*   encoding/asn1
*   github.com/golang/protobuf

JSON是对JavaScript中各种类型的值——字符串、数字、布尔值和对象——Unicode本文编码。它 可以用有效可读的方式表示第三章的基础数据类型和本章的数组、slice、结构体和map等聚合数据 类型。

### 编组

Go 数据转 JSON 的过程叫编组，通过 json.Marshal 函数完成

*   json.Marshal 紧凑格式的输出
*   json.MarshalIndent 缩进的输出
*   只有导出的（大写开头）结构体成员才会被编码

```go
func Marshal(v any) ([]byte, error)
// prefix 每行输出的前缀，indent 每个层级的缩进
func Marshal(v any, prefix, indent string) ([]byte, error)
```

#### Tag

*   一个构体成员 Tag 是和在编译阶段关联到该成员的元信息字符串
*   结构体的成员 Tag 可以是任意的字符串面值，通常是用空格分隔的 key:"value" 键值对序列；值中含有双引号字符，==成员 Tag 一般用**原生字符串面值**的形式书写==。
*   json 开头键名对应的值用于控制 encoding/json 包的编码和解码的行为，并且 encoding/... 下面其它的包也遵循这个约定。
*   成员 Tag 中 json 对应值的第一部分用于指定 JSON 对象的名字,额外的omitempty选项，表示当Go语言结构体成员为空或零值时不生成JSON对象

```go
type Move struct {
    Title string
    Year int `json:"released"`
    Color bool `json:"color,omitempty"`
    Actors []string
}

var movies = []Move{
    {Title: "A", Year: 1900, Color: false, Actors: []string{"E"}}
    {Title: "B", Year: 1878, Color: true, Actors: []string{"F"}}
}

data,err:=json.MarshalIndent(movies, "", "    ")
if err != nil {log.Fatalf("failed: %s", err)}
fmt.Printf("%s\n", data)
```

```json
[
    {
        "Title": "A",
        "released"": 1900,
        "Actors": [
            "E"
        ]
    {
        "Title": "B",
        "released": 1878,
        "color": true,
        "Actors": [
            "F"
        ]
]
```

### 解码

将 json 解码为 Go 数据结构（go 中一般叫 unmarshaling）,`json.Unmarshal` 完成

```go
func Unmarshal(data []byte, v any) error
```

*   通过定义合适的 Go 数据结构，可以选择性的解码 JSON 中成员

```go
var titles []struct{Title string}
if err:=json.Unmarshal(data, &titles);!err == nil {}
```

即使对应的JSON对象名是小写字母，每个结构体的成员名也是声明为大写字母开头的。因为有些JSON成员名字和Go结构体成员名字并不相同，因此需要Go语言结构体成员Tag来指定对应的JSON名字。同样，在解码的时候也需要做同样的处理

*   url.QueryEscape
*   json.NewDecoder
*   json.Decode
*   json.Encode

```go
func NewDecoder(r io.Reader) *Decode
func (dec *Decoder) Decode(v interface{}) error
func NewEncoder(w io.Writer) *Encoder
func (enc *Encoder) Encode(v interface{}) error
func QueryEscape(s string) string // QueryEscape函数对s进行转码使之可以安全的用在URL查询里
```

文本和HTML模板

* * *

提供了一个将变量值填充到一个文本或HTML格式的模板的机制

*   text/template
*   html/template
*   一个模板是一个字符串或一个文件，里面包含由双花括号包含的 {{action}}对象
*   actions 包含了一个用模板语言书写的表达式
*   模板语言包含通过选择结构体的成员、调用函数或方法、表达式控制流 if­else 语句和 range 循环语句，还有其它实例化模板等诸多特性
*   action，都有一个当前值的概念，对应点操作符，写作“.”。当前值“.”最初被初始化为调用模板时的参数
*   action中，`|`操作符表示将前一个表达式的结果作为后一个函数的输入，类似于UNIX中管道的概念。

```go
const templ = `{{.TotalCount}} issues:
{{range .Items}}‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐
Number: {{.Number}}
User: {{.User.Login}}
Title: {{.Title | printf "%.64s"}}
Age: {{.CreatedAt | daysAgo}} days
{{end}}`

report, err := template.New("report").
    Funcs(template.FuncMap{"daysAgo": daysAgo}).
    Parse(templ)
if err != nil {
    log.Fatal(err)
}

// report = template.Must(template.New("issuelist").
//	Funcs(template.FuncMap{"daysAgo": daysAgo}).
//  Parse(templ))

func main(){
result, err:=github.SearchIssues(os.Args[1:])
    if err != nil {
        log.Fatal(err)
    }
    if err := report.Execute(os.Stdout, result);err!=nil{
        log.Fatal(err)
    }
}
```

生成模板的输出需要两个处理步骤

1.  分析模板并转为内部表示

分析模板一般只需要执行一次。方法调用链的顺序：template.New 先创建并返回一个模板；Funcs 方法将 daysAgo 等自定义函数注册到模板中，并返回模板；最后调用 Parse 函数分析模板。

因为模板通常在编译时就测试好了，如果模板解析失败将是一个致命的错误。template.Must辅助 函数可以简化这个致命错误的处理：它接受一个模板和一个error类型的参数，检测error是否为 nil（如果不是nil则发出panic异常），然后返回传入的模板

1.  基于指定的输入执行模板

*   template.Must
*   template.New
*   template.Funcs
*   template.FuncMap
*   template.Parse
*   template.Execute

```go
type FuncMap map[string]any
func Must(t *Template, err error) *Template
func New(name string) *Template
func (t *Template) Funcs(funcMap FuncMap) *Template
func (t *Template) Parse(text string) (*Template, error)
func (t *Template) Execute(wr io.Writer, data any) error
```

html/template模板包。增加了一个将字符串自动转义特性，这可以避免输入字符串和HTML、JavaScript、CSS或URL语法产生冲突的问题。还可以避免一些长期存在的安全问题，比如通过生成HTML注入攻击，通过构造一个含有恶意代码的问题标题，这些都可能让模板输出错误的输出，从而让他们控制页面。# data
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
*   unsafe.Alignof 返回对应参数类型需要对齐的倍数# data convert
data\_convert

* * *

string \[\]byte

* * *

```go
// 标椎转换
[]byte(str)
string(bt)

// 强制转换
// unsafe 和 reflect
```# SQL
database/sql

* * *

Go语言没有官方提供数据库驱动，而是为开发者开发数据库驱动定义了一些标准接口，开发者可以根据定义的接口来开发相应的数据库驱动

这样做有一个好处，只要按照标准接口开发的代码，以后需要迁移数据库时，不需要任何修改。

### sql.Register 注册数据库驱动

当第三方开发者开发数据库驱动时，都会实现 init 函数，在 init 里面会调用这个 `Register(name string, driver driver.Driver)` 完成本驱动的注册

database/sql/driver 提供的接口基础上定义了一些更高阶的方法，用以简化数据库操作，同时内部还建议性的实现一个 conn pool ( freeConn )

```text-plain
type DB struct {
    driver driver.Driver
    dsn string
    mu sync.Mutex
    freeConn []driver.Conn
    closed bool
}
```

Open 函数返回 DB 对象， 里面有 freeConn， 是个简易连接池。当执行 Db.prepare 时会 defer db.putConn(ci,err)，把链接放入链接池，调用conn时hv先判断 freeConn 长度，大于0 说明有可以复用的conn，不大于0 则创建conn，然后返回他

```text-plain
func Open(driverName, dataSourceName string) (*DB, error)
```

### driver.Driver

```text-plain
type Driver interface {
    Open(name string) (Conn, error) // 返回的 Conn 只能用来做一次 goroutine 的操作
}
```

第三方驱动都会定义这个函数，解析 name 参数获取数据库相关链接信息，使用此信息初始化 Conn 并返回

### driver.Conn

Conn 只能用于一个 goroutine，不能用于多个 Conn，否则无法判断是哪个 goroutine 发起的，从而造成混乱

```text-plain
type Conn interface {
    Prepare(query string) (Stmt, error)  // 返回当前链接相关的执行 SQL 语句的准备状态，可以删除查询等
    Close() error  // 关闭连接，清理链接拥有的资源（清理工作，释放资源）
    Begin() (Tx, error)  // 返回一个代表事务处理的Tx，可以用于查询更新等操作，或对事务进行回滚，提交
}
```

因为驱动实现了database/sql里面建议的conn pool，所以读者不用再去实现缓存conn之类的，这样会容易引起问题。

### driver.Stmt

Stmt 是一种准备好的状态，和 Conn 相关，只能用于一个 goroutine

```text-plain
type Stmt interface {
    Close() error  // 关闭当前连接状态，如果正在执行 query，query 还是有效返回 rows 数据
    NumInput() init  // 函数返回当前预留参数的个数，返回 >= 0 时数据库驱动会智能检查调用者的参数。数据库不知道预留参数时返回 -1
    Exec(args []Value) (Result, error) // 执行 Prepare 准备好的 sql，传入参数执行 update/insert 等操作，返回 Result 数据
    Query(args []Value) (Rows, error)  // 执行 Prepare 准备好的 sql，传入需要的参数执行 select 操作，返回 Rows 结果集
}
```

### driver.Tx

事务处理一般就两个过程，递交或回滚。

```text-plain
type Tx interface {
    Commit() error
    Rollback() error
}
```

### driver.Execer

Conn 可选择实现的接口

```text-plain
type Execer interface {
    Exec(query string, args []Value) (Result, error)
}
```

此接口如果未定义，执行 DB.Exec 会首先调用 Prepare 返回 Stmt, 然后执行 Stmt 的 Exec ，最后关闭 Stmt

### driver.Result

执行 Update/Insert 等操作返回的结果接口定义

```text-plain
type Result interface {
    LastInsertId()(int64, error) // 返回有数据库执行插入操作得到的自增 ID 号
    RowsAffected()(int64, error) // 返回query操作影响的数据条目数
}
```

### driver.Rows

执行查询返回结果集接口定义

```text-plain
type Rows interface {
    Columns() []string // 返回查询数据库表的字段信息，返回的 slice 和 sql 查询字段一一对应，而不返回整个表所有字段
    Close() error // 关闭 Rows 迭代器
    Next(dest []Value) error // 返回下一条数据，把数据赋值给dest，dest 里面元素必是 driver，Value 返回的数据中所有string必须转为[]byte,无数据后Next返回io.EOF
}
```

### driver.RowsAffected

其实是一个int64别名，但实现了 Result 接口，以底层实现 Result 的表示方式

```text-plain
type RowsAffected int64
func (RowsAffected) LastInsertId()(int64, error)
func (v RowsAffected) RowsAffected()(int64, error)
```

### driver.Value

是一个可以容纳任何数据的空接口,driver 的 Value 是驱动必须能够操作的 Value，要么是 `nil`，要么是 `int64` `float64` `bool` `[]byte` `string` `time.Time` 之一

```text-plain
type Value interface {}
```

### driver.ValueConverter

定义如何将普通值转化成driver.Value的接口,开发数据库驱动包中实现这个接口的函数在很多地方会使用，有很多好处

*   转化 driver.value 到数据库表响应字段（如int64数据如何转化成数据库表uint16字段）
*   把数据库查询结果转化成 driver.Value 值
*   在 scan 函数里面如何吧 driver.Value 值转化成用户定义值

```text-plain
type ValueConverter interface {
    ConvertValue(v interface{}) (Value, error)
}
```

### driver.Valuer

定义一个返回 driver.Value 的方式

```text-plain
type Valuer interface {
    Value()(Value, error)
}
```

很多类型都实现这个 Value 方法，用来自身与 driver.Value 的转化

关键函数

* * *

*   sql.Open(driverName, DSN) 打开一个注册过的数据库驱动
    *   DSN(Data Source Name)

```text-plain
  [username[:password]@][protocol[(address)]]/dbname[?param1=value1&...&paramN=valueN]
  // user@unix(/path/to/socket)/dbname?charset=utf8
  // user:passwd@tcp(localhost:8088)/dbname?charset=utf8
  // user:passwd@/dbname
  // user:passwd@tcp([de:ad:be:ef::ca:fe]:80)/dbname
```

*   db.Prepare 用来返回准备要执行的SQL操作，然后返回执行完毕的执行状态，参数都是=？的形式，一定程度可以防止SQL注入
*   db.Query 用来执行SQL返回Rows结果
*   stmt.Exec用来执行stmt准备好的SQL

```text-plain
sql.Open -> DB
db.Prepare -> stmt
stmt.Exec -> res
res.LastInsertId -> id
res.RowsAffected -> count

db.Query -> rows
rows.Next
rows.Scan
```- [是否匹配](#%E6%98%AF%E5%90%A6%E5%8C%B9%E9%85%8D)
- [解析正则表达式](#%E8%A7%A3%E6%9E%90%E6%AD%A3%E5%88%99%E8%A1%A8%E8%BE%BE%E5%BC%8F)
- [其他辅助函数](#%E5%85%B6%E4%BB%96%E8%BE%85%E5%8A%A9%E5%87%BD%E6%95%B0)
## 是否匹配
判断 `pattern` 是否和输入源匹配，若匹配，就返回 `true`，如果解析正则出错，则返回 `error`。
- `func Match(pattern string, b []byte) (matched bool, error error)` 输入源为 byte slice
- `func MatchReader(pattern string, r io.RuneReader) (matched bool, error error)` 输入源为 RuneReader
- `func MatchString(pattern string, s string) (matched bool, error error)` 输入源为 string
## 解析正则表达式
`CompilePOSIX` 和 `Compile` 的不同点在于前者必须使用`POSIX`语法，它使用最左最长方式搜索，而后者则只采用最左方式搜索（例如，`\[a-z\]{2,4}` 这样一个正则表达式，应用于 "aa09aaa88aaaa" 这个文本串时，`CompilePOSIX` 返回了 `aaaa`，而Compile返回的是aa）
- `func Compile(expr string) (*Regexp, error)`
- `func CompilePOSIX(expr string) (*Regexp, error)`

前缀有 `Must` 的函数表示，在解析正则语法的时候，如果匹配模式串不满足正确的语法，则直接 `panic`，而不加 `Must` 的则只是返回错误

- `func MustCompile(str string) *Regexp`
- `func MustCompilePOSIX(str string) *Regexp`
## 查找函数
一共 18 个函数，分为 8 类，只是输入源为 `byte slice`、`string` 和 `RuneReader` 的区别
- `func (re *Regexp) Find(b []byte) []byte` 查找匹配的第一个
- `func (re *Regexp) FindAll(b []byte, n int) [][]byte`
- `func (re *Regexp) FindAllIndex(b []byte, n int) [][]int`
- `func (re *Regexp) FindAllSubmatch(b []byte, n int) [][][]byte`
- `func (re *Regexp) FindAllSubmatchIndex(b []byte, n int) [][]int`
- `func (re *Regexp) FindIndex(b []byte) (loc []int)`
- `func (re *Regexp) FindSubmatch(b []byte) [][]byte`
- `func (re *Regexp) FindSubmatchIndex(b []byte) []int`
* * *
- `func (re *Regexp) FindAllString(s string, n int) []string`
- `func (re *Regexp) FindAllStringIndex(s string, n int) [][]int`
- `func (re *Regexp) FindAllStringSubmatch(s string, n int) [][]string`
- `func (re *Regexp) FindAllStringSubmatchIndex(s string, n int) [][]int`
- `func (re *Regexp) FindString(s string) string`
- `func (re *Regexp) FindStringIndex(s string) (loc []int)`
- `func (re *Regexp) FindStringSubmatch(s string) []string`
- `func (re *Regexp) FindStringSubmatchIndex(s string) []int`
* * *
- `func (re *Regexp) FindReaderIndex(r io.RuneReader) (loc []int)`
- `func (re *Regexp) FindReaderSubmatchIndex(r io.RuneReader) []int`
---
- `func (re *Regexp) Match (b []byte) bool`
- `func (re *Regexp) MatchReader (r io. RuneReader) bool`
- `func (re *Regexp) MatchString(s string) bool`
## 替换函数
# file read write
file\_read\_write

* * *

写入
--

### 直接覆盖

```go
// 新覆盖旧，文件不存在会创建
// io/ioutil
func WriteFile(filename string, data []byte, perm os.FileMode) error

// 基于
os.OpenFile(filename string, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, perm os.FileMode)
f.Write(data []byte)
f.Close()
```

### 常规写入

```go
// 灵活，操作性强
// os
// flag
// O_RDONLY 只读
// O_WRONLY 只写
// O_RDWR   读写
// O_APPEND 追加
// O_CREATE 不存在时创建
// O_EXCL   配合 O_CREATE，创建文件必须不存在
// O_SYNC   开启同步 I/O
// O_TRUNC  截断常规可写文件

// 可读写模式创建
func Create(name string) (file *File, err error)
// 只读模式打开
func Open(name string) (file *File, err error)
// 综合 Create 和 Open 通用文件打开函数
func OpenFile(name string, flag init, perm os.FileMode) (file *File, err error)
// 写入字节
func (f *File) Write(b []byte) (n int, err error)
// 写入字符串
func (f *File) WriteString(s string) (ret int, err error)
func (f *File) Close() error
```

### 带缓冲区的写入

```go
// 先写入缓存，在写入文件
// 设置缓存大小，存储更多数据一次写入
// bufio
// 使用默认大小 4096，新建 Writer
func NewWriter(w io.Writer) *Writer
// 使用自定大小新建 Writer
func NewWriterSize(w io.Writer, size int) *Writer
// 字节写入
func (b *Writer) Write(p []byte) (n int, err error)
// 字符串写入
func (b *Writer) WriteString(s string) (int,error)
// 单字节写入
func (b *Writer) WriterByte(c byte) error
// 写入一个 unicode 码值
func (b *Writer) WriteRune(r rune) (size int, err error)
// 缓冲的数据写入下层 io.Writer 接口
func (b *Writer) Flush() error
```

### 复制操作的文件写入

```go
// io
func Copy(dst Writer,src Reader)(written int64, err error)
func CopyBuffer(dst Writer, src Reader, buf []byte)(written int64, err error)
```

读取
--

### 整体读取

```go
// ioutil
// 直接读取 []byte
func ReadFile(path string) ([]byte, error)

// os
func Open(name string)(file *File, err error)
func (f *File) Stat()(fi FileInfo, err error) 
func (f *File) Read(b []byte)(n int, err error)
```

### 分片读取

上一步中多个小 buff `buf:=make([]byte, size)`

### 逐行读取

```go
func Open(name string)(file *File, err error)
func NewReader(rd io.Reader) *Reader
func (b *Reader) ReadLine()(line []byte, isPrefix bool, err error)
```# flag
内置 flag 包实现命令行参数的解析，使得开发命令行工具更简单

os.Args

* * *

简单的获取命令行参数

flag

* * *

### 参数类型

| flag类型 | 有效值 |
| --- | --- |
| 字符串(String) | 字符串 |
| 整数(Int,int64,Uint,Uint64) | 12，064，0x88，复数等 |
| 浮点数(Float64) | 浮点数 |
| 布尔类型(Bool) | 1, 0, t, f, T, F, true, false, TRUE, FALSE, True, False |
| 时间段(Duration) | ns/us/ms/s/m/h,eg. -1.5h, 30ms |

### 定义 flag

```go
flag.<Type>(flag_name, default_value, help_message) *Type

name := flag.String("name", "张三", "姓名")
age := flag.Int("age", "18", "年龄")
```

```go
flag.<Type>Var(*Type, flag_name, default_value, help_message)

var name string
var age int
flag.StringVar(&name, "name", "张三", "姓名")
flag.IntVar(&age, "age", "18", "年龄")
```

flag.Parse()

* * *

参数解析，支持的参数格式如下（布尔类型必须使用等号方式）

*   `-flag xxx`
*   `--flag xxx`
*   `-flag=xxx`
*   `--flag=xxx`

Parse 解析在第一个非 flag 参数停止，或者终止符 “-” 后停止

### flag.Args()

其他参数

### flag.NArg()

其它参数个数

### flag.NFlag()

使用的参数个数# fmt
fmt包实现了类似C语言printf和scanf的格式化I/O。主要分为**向外输出**内容和**获取输入**内容两大部分。

向外输出

* * *

标准库fmt提供了以下几种输出相关函数。

#### Print Print

系列函数会将内容输出到系统的标准输出

*   Print函数直接输出内容
*   Printf函数支持格式化输出字符串
*   Println函数会在输出内容的结尾添加一个换行符

```go
func Print(a ...interface{}) (n int, err error)
func Printf(format string, a ...interface{}) (n int, err error)
func Println(a ...interface{}) (n int, err error)
```

#### Fprint Fprint

系列函数会将内容输出到一个io.Writer接口类型的变量中，我们通常用这个函数往文件中写入内容。

```go
func Fprint(w io.Writer, a ...interface{}) (n int, err error)
func Fprintf(w io.Writer, format string, a ...interface{}) (n int, err error)
func Fprintln(w io.Writer, a ...interface{}) (n int, err error)
```

#### Sprint Sprint

系列函数会把传入的数据生成并返回一个字符串。

```go
func Sprint(a ...interface{}) string
func Sprintf(format string, a ...interface{}) string
func Sprintln(a ...interface{}) string
```

#### Errorf Errorf

函数根据format参数生成格式化字符串并返回一个包含该字符串的错误。

```go
func Errorf(format string, a ...interface{}) error
```

格式化占位符

* * *

#### 通用占位符

| 占位符 | 说明  |
| --- | --- |
| `%v` | 值的默认格式表示 |
| `%+v` | 类似`%v`，但输出结构体时会添加字段名 |
| `%#v` | 值的 Go 语法表示 |
| `%T` | 打印值的类型 |
| `%%` | 百分号 |

示例代码如下：

```go
struct {age int} {98}
%v {98}
%+v {age: 98}
%#v struct {age int} {age: 98}
%T struct {age int}
```

#### 布尔型

| 占位符 | 说明  |
| --- | --- |
| `%t` | true 或 false |

#### 整型

| 占位符 | 说明  |
| --- | --- |
| %b  | 表示为二进制 |
| %c  | 该值对应的unicode码值 |
| %d  | 表示为十进制 |
| %o  | 表示为八进制 |
| %x  | 表示为十六进制，使用a-f |
| %X  | 表示为十六进制，使用A-F |
| %U  | 表示为Unicode格式：U+1234，等价于`”U+%04X”` |
| %q  | 该值对应的单引号括起来的go语法字符字面值，必要时会采用安全的转义表示 |

#### 浮点数与复数

| 占位符 | 说明  |
| --- | --- |
| %b  | 无小数部分、二进制指数的科学计数法，如-123456p-78 |
| %e  | 科学计数法，如-1234.456e+78 |
| %E  | 科学计数法，如-1234.456E+78 |
| %f  | 有小数部分但无指数部分，如123.456 |
| %F  | 等价于%f |
| %g  | 根据实际情况采用%e或%f格式（以获得更简洁、准确的输出） |
| %G  | 根据实际情况采用%E或%F格式（以获得更简洁、准确的输出） |

#### 字符串和\[\]byte

| 占位符 | 说明  |
| --- | --- |
| %s  | 直接输出字符串或者\[\]byte |
| %q  | 该值对应的双引号括起来的go语法字符串字面值，必要时会采用安全的转义表示 |
| %x  | 每个字节用两字符十六进制数表示（使用a-f |
| %X  | 每个字节用两字符十六进制数表示（使用A-F） |

```go
a:="a"
%s a
%q "a" 
```

#### 指针

| 占位符 | 说明  |
| --- | --- |
| %p  | 表示为十六进制，并加上前导的0x |

示例代码如下：

```
a := 18
fmt.Printf("%p\n", &a)
fmt.Printf("%#p\n", &a)
```

输出结果如下：

```
    0xc000054058
    c000054058
```

#### 宽度标识符

宽度通过一个紧跟在百分号后面的十进制数指定，如果未指定宽度，则表示值时除必需之外不作填充。精度通过（可选的）宽度后跟点号后跟的十进制数指定。如果未指定精度，会使用默认精度；如果点号后没有跟数字，表示精度为0。举例如下

| 占位符 | 说明  |
| --- | --- |
| %f  | 默认宽度，默认精度 |
| %9f | 宽度9，默认精度 |
| %.2f | 默认宽度，精度2 |
| %9.2f | 宽度9，精度2 |
| %9.f | 宽度9，精度0 |

宽度和精度格式化控制的是Unicode码值的数量（不同于C的printf，它的这两个因数指的是字节的数量）。两者任一个或两个都可以使用`'*'`号取代，此时它们的值将被对应的参数（按`'*'`号和verb出现的顺序，即控制其值的参数会出现在要表示的值前面）控制，这个操作数必须是int类型。

```go
fmt.Printf("%*s%s", depth, aft, str) // %*S 中的 * 会在字符串之前填充一些空格（填充数量为depth）再输出 aft，最后输出 str
```

对于大多数类型的值，宽度是输出字符数目的最小数量，如果必要会用空格填充。对于字符串，精度是输出字符数目的最大数量，如果必要会截断字符串。

对于整数，宽度和精度都设置输出总长度。采用精度时表示右对齐并用0填充，而宽度默认表示用空格填充。

对于浮点数，宽度设置输出总长度；精度设置小数部分长度（如果有的话），除了%g和%G，此时精度设置总的数字个数。例如，对数字123.45，格式%6.2f 输出123.45；格式%.4g输出123.5。%e和%f的默认精度是6，%g的默认精度是可以将该值区分出来需要的最小数字个数。

对复数，宽度和精度会分别用于实部和虚部，结果用小括号包裹。因此%f用于1.2+3.4i输出(1.200000+3.400000i)。

示例代码如下：

```
n := 88.88
fmt.Printf("%f\n", n)
fmt.Printf("%9f\n", n)
fmt.Printf("%.2f\n", n)
fmt.Printf("%9.2f\n", n)
fmt.Printf("%9.f\n", n)
```

输出结果如下：

```
    88.880000
    88.880000
    88.88
        88.88
           89
```

#### 其他falg

| 占位符 | 说明  |
| --- | --- |
| ’+’ | 总是输出数值的正负号；对%q（%+q）会生成全部是ASCII字符的输出（通过转义）； |
| ’ ‘ | 对数值，正数前加空格而负数前加负号；对字符串采用%x或%X时（% x或% X）会给各打印的字节之间加空格 |
| ’-’ | 在输出右边填充空白而不是默认的左边（即从默认的右对齐切换为左对齐）； |
| ’#’ | 八进制数前加0（%#o），十六进制数前加0x（%#x）或0X（%#X），指针去掉前面的0x（%#p）对%q（%#q），对%U（%#U）会输出空格和单引号括起来的go字面值； |
| ‘0’ | 使用0而不是空格填充，对于数值类型会把填充的0放在正负号后面； |

举个例子：

```
s := "枯藤"
fmt.Printf("%s\n", s)
fmt.Printf("%5s\n", s)
fmt.Printf("%-5s\n", s)
fmt.Printf("%5.7s\n", s)
fmt.Printf("%-5.7s\n", s)
fmt.Printf("%5.2s\n", s)
fmt.Printf("%05s\n", s)
```

输出结果如下：

```
    枯藤
       枯藤
    枯藤
       枯藤
    枯藤
       枯藤
    000枯藤
```

获取输入

* * *

#### Scan 系列

*   fmt.Scan 从标准输入扫描文本，读取由空白符分隔的值保存到传递给本函数的参数中，换行符视为空白符。本函数返回成功扫描的数据个数和遇到的任何错误。如果读取的数据个数比提供的参数少，会返回一个错误报告原因。
*   fmt.Scanf 从标准输入扫描文本，根据format参数指定的格式去读取由空白符分隔的值保存到传递给本函数的参数中。本函数返回成功扫描的数据个数和遇到的任何错误。
*   fmt.Scanln 类似Scan，它在遇到换行时才停止扫描。最后一个数据后面必须有换行或者到达结束位置。本函数返回成功扫描的数据个数和遇到的任何错误。

```go
func Scan(a ...interface{}) (n int, err error)
func Scanf(format string, a ...interface{}) (n int, err error)
func Scanln(a ...interface{}) (n int, err error)
```

```
func main() {
    var (
        name    string
        age     int
        married bool
    )
    fmt.Scan(&name, &age, &married)
    fmt.Printf("扫描结果 name:%s age:%d married:%t \n", name, age, married)

    fmt.Scanf("1:%s 2:%d 3:%t", &name, &age, &married)
    fmt.Printf("扫描结果 name:%s age:%d married:%t \n", name, age, married)

    fmt.Scanln(&name, &age, &married)
    fmt.Printf("扫描结果 name:%s age:%d married:%t \n", name, age, married)
}
```

#### bufio.NewReader

有时候我们想完整获取输入的内容，而输入的内容可能包含空格，这种情况下可以使用bufio包来实现。示例代码如下：

```
func bufioDemo() {
    reader := bufio.NewReader(os.Stdin) // 从标准输入生成读对象
    fmt.Print("请输入内容：")
    text, _ := reader.ReadString('\n') // 读到换行
    text = strings.TrimSpace(text)
    fmt.Printf("%#v\n", text)
}
```

#### Fscan系列

这几个函数功能分别类似于fmt.Scan、fmt.Scanf、fmt.Scanln三个函数，只不过它们不是从标准输入中读取数据而是从io.Reader中读取数据。

```
func Fscan(r io.Reader, a ...interface{}) (n int, err error)
func Fscanln(r io.Reader, a ...interface{}) (n int, err error)
func Fscanf(r io.Reader, format string, a ...interface{}) (n int, err error)
```

#### Sscan系列

这几个函数功能分别类似于fmt.Scan、fmt.Scanf、fmt.Scanln三个函数，只不过它们不是从标准输入中读取数据而是从指定字符串中读取数据。

```
func Sscan(str string, a ...interface{}) (n int, err error)
func Sscanln(str string, a ...interface{}) (n int, err error)
func Sscanf(str string, format string, a ...interface{}) (n int, err error)
```# mod
Modules

* * *

go.mod 是 Golang1.11 引入的依赖包管理工具，解决没有地方记录依赖包版本的问题

Modules 是相关 Go 包的集合，是源码交换和版本控制单元；其替换旧的基于GOPATH的方法来指定使用那些源文件

*   Modules 不需要 src，bin 等这样的子目录，只要其包含 go.mod 文件即可（哪怕是有 go.mod 的空文件夹）
*   GO111MODULE=off/on/auto(default);off 时使用vendor目录或GOPATH模式查找，on 使用modules，完全不使用GOPATH，auto 文件在包含 go.mod 文件的目录下或在GOPATH/src外且包含go.mod文件的目录- go mod init
- go get
- go mod tidy
- go mod vender
## go.mod
主要字段：
- module 定义模块路径，通常是导入路径
- go 指定版本
- require 列出项目依赖及版本
- replace 替换某个依赖的路径
- exclude 排除特定版本依赖
## go.sum
- 模块路径和版本 + 哈希值（模块内容）
- go.mod 文件路径 + go.mod 文件的哈希值# import
1.  相对路径 当前目录同目录
2.  绝对路径 gopath/src

点操作

* * *

```go
import (
    . fmt
)
Printf
```

别名
--

```go
import (
    f "fmt"
)
```

\_ 操作

* * *

```go
_ "github.com/user/restory/name"
```

\_ 操作的作用是引入包，不直接使用包内函数，只调用包内 init 函数# package
包
-

\[toc\]

工作空间

* * *

由 src、bin、pkg 三个目录组成，空间路径通常要添加到 GOPATH 环境变量中

*   src 源码
*   bin 可执行文件安装路径，不会创建额外子目录
*   pkg 包安装路径，按操作系统和平台隔离

环境变量

* * *

*   编译器按 GOPATH 设置的路径搜索目标。go get 默认将下载第三方包放到第一个工作空间
*   GOROOT 用于指示工具链和标准库的存放位置
*   GOBIN 强制代替工作空间的bin目录，作为go install目标保存路径

包
-

```
package <pkg_name>
```

### main 包

*   main 包是一个可独立运行的包，编译后产生可执行文件；
*   其他包会生成`*.a`文件（包文件）放置在 `$GOPATH/pkg/$GOOS_$GOARCH` 中；
*   main 包必须有一个入口函数 main，没有参数，会自动调用

### init 函数

没有任何参数和返回值,会自动调用

*   应用于所有包
*   init 函数是可选的，可以有多个

### 导入包

import 导入标准库或第三方包，参与是工作空间中以src为起始的绝对路径；一个包被多个包同时导入，那么它只会被导入一次

```go
import "net/http" // /usr/local/go/src/net/http
```

*   程序的初始化和执行都起始于main包；
*   一个包被导入时，会先将其导入的其他包导入进来
*   先对导入包的包级常量和变量进行初始化，接着执行init函数（如果有的话）依此类推。
*   所有被导入的包都加载完毕，就会开始对 main 包中的包级常量和变量进行初始化
*   然后执行main包中的init函数（如果存在的话），最后执行main函数

#### 别名

```go
import osx "github.com/apple/osx/lib"
```

\==import 导入参数是路径，而非包名。== ==习惯包和目录保持一致，但不是强制规定==。代码中引入包成员时，使用包名而非目录名。

四种导入包方式

```go
// 默认方式
// test.A
import "github.com/qyuhen/test"

// 别名方式
// X.A
import X "github.com/qyuhen/test"

// 简单方式
// 常用于单元测试，正式代码不推荐使用
// A
import . "github.com/qyuhen/test"

// 初始化方式
// 无法引用，仅用来初始化
// 仅仅是为让目标包初始化函数执行,而非引用其成员
import _ "github.com/qyuhen/test"
```

相对路径

* * *

除工作空间和绝对路径外部分工具还支持相对路径。可在非工作空间目录下，直接运行、编译一些测试代码

自定义路径

* * *

即便将代码托管在GitHub，但我们依然希望使用自有域名定义下载和导入路径。方法很简单，在Web服务器对应路径返回中包含“go-import”跳转信息即可。

```go
package main
  
import( 
    "fmt" 
    "net/http" 
) 
  
func handler(w http.ResponseWriter,r*http.Request) { 
   fmt.Fprint(w, `<meta name="go-import" content="qyuhen.com/test git https://github.com/qyuhen/test" />`) 
} 
  
func main() { 
   http.HandleFunc("/test",handler) 
   http.ListenAndServe(":80",nil) 
}

// go get-v-insecure qyuhen.com/test
```

组织结构

* * *

包有一个或多个保存在同一目录下（不包含子目录）的源码文件组成。包的用途类似命名空间，是成员作用域和访问权限的便捷。

*   包名与目录名并无关系，不要求一致
*   包名通常使用单数形式
*   源码文件必须使用UTF-8格式，否则报错
*   同目录下所有源码文件必须使用相同包名称
*   因导入时使用绝对路径，所以在搜索路径下，包必须有唯一路径，但无须是唯一名字

```go
go list net/... # 显示包路径列表
```

被保留、有特殊含义的包名称

*   main 可执行入口（入口函数main.main）
*   all 标准库以及GOPATH中能找到的所有包
*   std,cmd 标准库及工具链
*   documentation 存档文档信息，无法导入（和目录名无关）

相关工具会忽略以"."或"\_"开头的目录或文件，但允许导入保存这些目录中的包

### 权限

所有成员在包内均可访问，名称大写的为可导出成员，在包外可视。

可以通过指针转换等方式绕开限制

```go
// lib/data.go

package lib

type data struct{
    x int
    Y int
}

func NewData() *data{
    return new(data)
}

// test.go

package main

import (
    "test/lib"
    "unsafe"
)

d:=lib.NewDate()
d.Y=200
p:=(*struct{x int})(unsafe.Pointer(d)) // 利用指针转换访问私有字段
p.x=100
```

### 初始化

包内每个源文件都可定义一个到多个初始化函数，但编译器不保证执行次序

所有初始化函数（包括标准库和导入第三方包）都由编译器自动生成的一个包装函数进行调用，因此可保证在单一线程上执行，且仅执行一次。

编译器首先确保完成所有全局变量初始化，然后才开始执行初始化函数。

初始化函数中也可以有goroutine。

初始化函数无法手动调用。

### 内部包

内部包机制相当于增加了新的访问权限控制：所有保存在internal目录下的包（包括自身）仅能被其父目录下的包（含所有层次的子目录）访问。

src/ src/main.go src/lib/ src/lib/internal src/lib/internal/a src/lib/internal/b src/lib/x src/lib/x/y

内部包internal a b 仅能被 lib lib/x lib/x/y 访问，导入内部包必须使用完整路径 lib/internal/a

依赖管理

* * *

使用vendor机制，专门存放第三方包，实现将源码和依赖完成完整打包分发。如果说internal针对内部，那么vendor就是external。

src/ src/server/ src/server/vendor src/server/vendor/github.com src/server/vendor/github.com/qyuhen src/server/vendor/github.com/qyuhen/test src/server/main.go

```go
import "github.com/qyuhen/test"
```

优先使用vendor/github.com/qyuhen/test

导入vendor中第三方包，参数以vendor为起点绝对路径，这就避免vendor目录位置带来的麻烦，让导入无论使用vendor还是GOPATH都能保持一致，vendor比标准库优先级更高。

有多级vendor目录嵌套时，从当前源文件所在目录开始，逐级向上构造vendor全路径，直到发现路径匹配的目标为止。匹配失败，则依旧搜索GOPATH

```
src/ | +--server/ | +--vendor/ | | | +--p/ #p1:src/vendor/p# | | | +--x/ | | | +--test.go | | | +--vendor/ | | | +--p/ #p2:src/vendor/x/vendor/p# +--main.go
```

对于main.go而言构造出的路径是src/server/vendor/p

对于test.go而言构造出的路径是src/server/vendor/x/vendor/p

要使用vendor机制，需开启GO15VENDOREXPERIMENT=1，1.6版本默认开启，且必须设置了GOPATH工作空间# 9. packages
*   为了简化大型程序的设计和维护工作
*   将一组相关的特性放进一个独立的单元以便于理解和更新
*   在每个单元更新的同时保持和程序中其它单元的相对独立性
*   允许每个包可以被其它的不同项目共享和重用，在项目范围内、甚至全球范围统一的分发和复用。

go list str go env

\==编译速度快的三个原因==

1.  导入的包必须在每个文件开头显示声明，无需分析整个文件
2.  禁止包的环状依赖，没有循环依赖，依赖关系形成一个有向无环图，每个包可以独立编译、并发编译
3.  编译后包的目标文件不仅仅记录包本身的导出信息，目标文件同时还记录了包的依赖关系。编译时不需要遍历所有依赖的文件，只要读取导入包的目标文件

\==路径==

如果你计划分享或发布包，那么导入路径最好是全球唯一的。为了避免冲突，所有非标准库包的导入路径建议以所在组织的互联网域名为前缀；而且这样也有利于包的检索。

\==声明==

文件开头有包的声明语句，包名，作为导入时的默认标识。 通常默认包名就是导入路径的最后一段

三种例外

1.  main 包，导入路径无关紧要，名为 main 包是给 go build 构建命令一个信息，此包编译完后会调用连接器生成一个可执行文件
2.  目录中 `_test.go` 为后缀的 go 原文件，包名也是以 `_test` 结尾，这是测试的外部扩展包，由 go test 命令独立编译，普通包和测试的外部扩展包是相互独立的
3.  一些依赖版本号的管理工具会在导入路径后追加版本号信息 `gopkg.in/yaml.v2` 此时包名不包含版本号，而是 yaml

\==导入声明==

如果包名相同，需要在导入时指定一个新的包名避免冲突；导入包==重命名==可以解决包名冲突；还可以解决倒入包的包名笨重可以起一个简单的更方便；

```go
import (
"crypto/rand"
mrand "math/rand"
<别名> <path
)
```

\==匿名导入==

`import _ "image/png"` 导入包的==副作用==，会计算包级变量的初始化表达式和执行导入包的 init 初始化函数

\==包和命名==

*   用短小的包名，但要容易理解，常用的标准包 bufio, bytes, flag, fmt, http, io, json, os, sort, sync, time
*   一般采用单数形式，标准包 bytes、errors、strings 使用复数是为了避免和预定类型冲突

\==工具==

go 工具箱既是一个包管理工具，也是一个构建系统，也是一个单元测试基准测试的驱动程序

*   build 编译包
    
*   clean 清除 object 文件
    
*   doc 显示报的文档或标志
    
*   env 打印 go 的环境信息
    
*   fmt 在包的源码上运行 gofmt
    
*   get 下载并安装包及其依赖
    
*   install 编译安装包及其依赖
    
*   list 列出包
    
*   run 编译运行 go 程序
    
*   test 测试包
    
*   version 打印 go 版本
    
*   vet 在包上运行 go 工具 vet
    
*   GOPATH go 工作区目录
    
    *   src 源码
    *   bin 边以后的可执行文件
    *   pkg 边以后的目标文件
*   GOROOT go 的安装目录，标准库目录，一般不需要设置，默认为安装的路径
    
*   GOOS 指定目标操作系统
    
*   GOARCH 指定处理器类型
    

\==下载包==

```go
go get <name> 下载单个包
go get ... 下载整个子目录里的每个包
go get -u 可以确保所有包和依赖的包

go help importpath
```

*   go get 安装的包是完整的 git 仓库
*   包的导入路径含有的网站域名和 git 仓库对应的远程地址不一定相同
*   vendor 目录用于存储依赖包的固定版本的源代码（go help gopath）

\==构建包== go build

go install 和 go build 相似，前者会保存每个报的编译成果，编译的包放在 $GOPATH/pkg，路径与 src 目录对应，可执行文件放在$GOPATH/bin 目录；两者都不会重新编译没有发生变化的包；`go build -i` 安装每个目标所依赖的包；编译结果会放到 GOOS 和 GOARCH 对应的目录

*   如果包是一个库，则忽略输出结果；这可以用于检测包的可以正确编译的。
*   如果包的名字是main，go build将调用连接器在当前目录创建一个可执行程序；以导入路径的最后一段作为可执行程序的名字。

\==标准包== go list std

\==包文档==

go 鼓励为每个包提供良好的文档。每个导出的成员和包声明前都应包含目的和用法说明的注释

包文档注释一般是完整的句子，第一行是包的摘要说明，注释后紧跟着包声明语句，注释中函数的参数或其他的标识符并不需要额外的引号或其他标记注明。

```go
// Fprintf formats according to a format specifier and writes to w.
// It returns the number of bytes written and any write error encountered. 
func Fprintf(w io.Writer, format string, a ...interface{}) (int, error)
```

注释后紧跟着包声明语句，那注释对应整个包的文档。包文档对应的注释只能有一个（其实可以有多个，他们会组合成一个包文档注释），当注释特别长时一般会放到一个独立文件中，用于保存文档的源文件通常叫 `doc.go`

`go doc` 这个命令打印包的声明和每个成员的文档注释或者某个具体包的一个方法的注释文档。

```go
go doc time              // package
go doc time.Since        // method

go doc time.Duration     // type
go doc time.Duration.Abs // method

// 此命令大小写不敏感，切不需要输入完整的包导入路径

go doc time.abs      // time.Duration.Abs
go doc time.duration // time.Duration
```

`godoc` 提供相互交叉引用的 HTML 页面，包含与 `go doc` 相同以及更多的信息。

\==内部包== ==internal包== Go 语言构建工具对包含 internal 名字的路径段的包导入路径做特殊处理，这种包叫 internal 包。

internal 包只能被和 internal 目录有同一个父目录的包所导入，`net/http/internal/chunked` 只能被 `net/http/httputil` 或 `net/http` 包导入，但是不能被 `net/url` 包导入，`net/url` 可以导入 `net/http/httputil`

\==查询包==

`go list` 可以查询可用包的信息。可以检测包是否在工作区并打印导入路径，还可以使用 `...` 表示任意包，可以列出所有包

```go
$ go list github.com/go-sql-driver/mysql
github.com/go-sql-driver/mysql

$ go list ...
$ go list gopl.io/ch3/...
$ go list ...xml...
encoding/xml
gopl.io/ch7/xmmlselect
```

`go list -json hash` -json 参数表示用 JSON 格式打印每个包的元信息 -f 参数允许使用 text/template 包的模板语言定义文本输出的格式 `go list -f '{{join .Deps " "}}' strconv` windows 下需要转义双引号 `go list -f '{{join .Deps \" \"}}' strconv`# project
工程管理

* * *

\[toc\]

命令行工具

* * *

### 基本用法

gotool 可以：

*   代码格式化
*   代码质量分析和修复
*   单元测试与性能测试
*   工程构建
*   代码文档的提取和展示
*   依赖包管理
*   执行其他的包含指令

```bash
go version
go help
```

代码风格

* * *

go 代码规范分两类

1.  由go编译器进行强制的编码规范
2.  由gotool推行的非强制性编码风格建议

### 强制性编码规范

#### 命名

*   任何需要对外暴露的名字必须以大写字母开头，不需要对外暴露的用小写
*   使用驼峰命名法，禁止使用下划线命名法

#### 排列

*   左花括号紧跟代码
*   else等紧跟右花括号

### 非强制性编码风格

```go
// 带名称检查单个文件
// 不带名称检查目录下所有*.go
$ go fmt
```

远程import支持

* * *

```go
import (
 "github.com/myteam/exp/crc32"
)

go get github.com/myteam/exp/crc32
```

工程组织

* * *

### GOPATH

定位源码依赖GOPATH

### 目录结构

*   README 简单介绍项目目标和关键的注意事项
*   LICENSE 工程采用的分发协议

标准go语言工程包括：

*   src/ 包含所有源代码，这是个强制规则
*   pkg/ 自动创建
*   bin/ 自动创建

文档管理

* * *

程序包括代码和文档

软件产品包括源代码、可执行程序、文档和服务

文档，单行 // 多行 /\*\*/

*   代码中的注释、函数、接口的输入、输出、功能和参数说明
*   版权说明注释
*   包说明注释
*   函数说明注释
*   遗留问题说明

```go
// 提取文档
go doc <包名>

go doc -http=<PORT> -path=<PATH>
```

文档规则

*   注释需要紧贴在对应的包声明核函数之前，不能有空行
*   注释如果要新奇一个段落，应该用一个空白注释行隔开，因为直接换行书写会被认为是正常的段内折行
*   可以直接使用 // BUG(author): 的方式记录该代码片段中的遗留问题，这些遗留问题也会被抽到文档中

工程构建

* * *

```go
// 生成二进制文件
// 可执行文件放入/bin目录，如果是个包则放入/pkg目录
go build <包名>

// 执行install时，如果没有执行build，会先执行build
go install <包名>
```

跨平台开发

* * *

### 交叉编译

*   linux下可以生成以下目标格式x86 ELF、AMD64 ELF、ARM ELF、x86 PE和AMD64 PE
*   windows下x86 PE和AMD64 PE

可以通过设置GOOS和GOARCH两个环境变量来制定交叉编译的目标格式。

| $GOOS | $GOARCH |
| --- | --- |
| darwin | 386 |
| darwin | amd64 |
| freebsd | 386 |
| freebsd | amd64 |
| linux | 386 |
| linux | amd64 |
| linux | arm |
| windows | 386 |
| windows | amd64 |

### android 支持

android 基于linux所以也可以编译android go

单元测试

* * *

```go
// 单元测试
go test

// 性能测试,加-test.bench参数
go test -text.bench 
```

单元测试源文件命名规则：待测试包下创建\_test结尾的go文件

*   功能测试函数：以 Test 开头，\*testing.T 为单一参数的函数
*   性能测试函数：以 Benchmark 开头，\*testing.T 为单一参数的函数

打包分发

* * *

就目前而言，以二进制方式分发Go包并不是很现实。由于Go语言对于兼容性控制的非常严 格，任何一个版本号的不同都将导致无法链接包。因此，如果你使用Go语言开发了一个库，那 么最合适的库分发方式是直接打包源代码包并进行分发，由使用者自行编译。 当然，可执行文件没有这个问题。因此如果要避免这个包链接的问题，可以考虑如何将核心 功能以二进制的服务器程序形式提供，并辅以开源的客户端SDK。# gvm
*   gvm install \[goversion\]
*   gvm use \[goversion\] \[--default\]
*   gvm list
*   gvm listall
*   gvm pkgset
*   gvm pkgenv
*   gvm uninstall \[goversion\]
*   gvm implode ## 完全卸载掉 GVM 和所有安装的 Go 版本# cgo
与其他语言交互性

* * *

自C语言诞生以来，程序员们已经积累了无数的代码库。即使后面还出现了众多时髦的新语言，有无数的代码库都还很偏执地只提供了C语言版本。因此，如何快捷方便地直接引用这些功能强大且供量过硬的C语言库，就成了所有现代语言都不得不重视的话题。作为一门直接传承于C的语言，Go当然应该将与C语言的交互作为首要任务之一。Go确实也 提供了这一功能，称为Cgo。

```go
/*
#include <stdlib.h>
*/
import "C" // 告诉Cgo开始工作，工作内容就是将前面注释中的C源码自动生成包装性质的Go代码
```

函数调用从汇编的角度看，就是一个将参数按顺序压栈 (push)，然后进行函数调用(call)的过程。Cgo生成的代码只不过是帮你封装了这个压栈和调用 的过程，从外面看起来就是一个普通的Go函数调用。

只要是紧贴在import “C” 前，单行注释多行注释都可以生效

类型映射

* * *

跨语言交互有两个复杂问题

1.  类型映射
2.  跨越调用边界传递指针所带来的对象生命周期和内存管理问题

| Go  | C   |
| --- | --- |
| C.char/schar | signed char |
| C.uchar | unsigned char |
| C.short/ushort | unsigned short |
| C.int/uint | unsigned int |
| C.long/ulong | unsigned long |
| C.longlong | long long |
| C.ulonglong | unsigned long long |
| C.float |     |
| C.double |     |
| unsafe.Pointer | void\* |
| struct\_ | struct |
| union\_ | union |
| enum\_ | enum |

如果C语言中的类型名称或变量名称与Go语言的关键字相同，Cgo会自动给这些名字加上下 划线前缀。

字符串映射

* * *

Go中有字符串类型，C中是字符数组

Cgo提供C.Cstring、C.GoString、C.GoStringN

由于C.CString的内存管理方式与Go语言自身的内存管理方式不兼容，我们设法期待Go语 言可以帮我们做垃圾收集，因此在使用完后必须显式释放调用C.CString所生成的内存块，否则 将导致严重的内存泄露。结合我们之前已经学过的defer用法，所有用到C.CString的代码大致 都可以写成如下的风格:

```go
var gostr string
cstr := C.Cstring(gostr)
defer.C.Free(unsafe.Pointer(cstr))
```

C程序

* * *

```go
package hello

/*
#include <stdio.h>
void hello(){
printf("Hello,Cgo")
}
*/
import "C"

func Hello()int{
return int(C.hello())
}
```

cgo 伪C文法，指定依赖的第三方库和编译选项

* * *

```go
// #cgo CFLAGS: -DPNG_DEBUF=1
// #cgo linux CFLAGS: -DLINUX=1 
// #cgo LDFLAGS: -lpng
// #include <png.h>
import "C"
```

使用CFLAGS来传入编译选项，使用LDFLAGS来传入链接选项

```go
// #cgo pkg-config: png cairo 
// #include <png.h>
import "C"
```

函数调用

* * *

```go
n, err := C.atoi("a234")
n,err := C.f(&array[0])
```

编译Cgo

* * *# link
连接符号

* * *

链接符号关心的是如何将语言文法使用的符号转化为链接期使用的符号，在常规情况下，链 接期使用的符号对我们不可见，但是在一些特殊情况下，我们需要关心这一点，比如:在用 gdb 调试的时候，要设置断点:b <函数名>，这里的<函数名>是指“链接符号”，而非我们平常看到 的语言文法层面使用的符号。

```go
package Package

func Method(arg1 ArgType1, arr2....) (ret1 RetType1, ret2....)
func (v ClassType) Method(arg1 ArgType1, arr2....) (ret1 RetType1, ret2....)
func (v *ClassType) Method(arg1 ArgType1, arr2....) (ret1 RetType1, ret2....)
```

Go没有重载，所以语言的连接符号由如下信息组成

*   Package
*   ClassType
*   Method

连接符号组成规则

*   Package.Method
*   Package.ClassType.Method

```go
// qbox.us/mockfs模块

func New(cfg Config) *MockFS
func (fs *MockFS) Mkdir(dir string) (code int, err error) 
func (fs MockFS) Foo(bar Bar)

// 对应符号链接

qbox.us/mockfs.New
qbox.us/mockfs.*MockFS·Mkdir
qbox.us/mockfs.MockFS·Foo
```# source
源码
--

编译好的可执行文件真正的执行入口并非我们所写的main.main函数，编译器总会插入一段引导代码，完成如命令行参数、运行时初始化等工作，然后进入用户逻辑

调试程序时，建议使用`go build -gcflags "-N -l"` 参数关闭编译器代码优化和函数内联，避免断点和单步执行无法准确对应源码行

```sh
go build -gcflags "-N -l" -o test test.go
gdb test
(gdb)info files
Entry point:0x44dd00
(gdb)b*0x44dd00
(gdb)b runtime.rt0_go
```

使用断点命令可以轻松找到目标源文件信息

GDB常用的调试命令

* * *

*   （gdb）help：查看命令帮助，具体命令查询在gdb中输入help + 命令,简写h
*   （gdb）run：重新开始运行文件（run-text：加载文本文件，run-bin：加载二进制文件）,简写r
*   （gdb）start：单步执行，运行程序，停在第一执行语句
*   （gdb）list：查看原代码（list-n,从第n行开始查看代码。list+ 函数名：查看具体函数）,简写l
*   （gdb）set：设置变量的值
*   （gdb）next：单步调试（逐过程，函数直接执行）,简写n
*   （gdb）step：单步调试（逐语句：跳入自定义函数内部执行）,简写s
*   （gdb）backtrace：查看函数的调用的栈帧和层级关系,简写bt
*   （gdb）frame：切换函数的栈帧,简写f
*   （gdb）info：查看函数内部局部变量的数值,简写i
*   （gdb）finish：结束当前函数，返回到函数调用点
*   （gdb）continue：继续运行,简写c
*   （gdb）print：打印值及地址,简写p
*   （gdb）quit：退出gdb,简写q
*   （gdb）break+num：在第num行设置断点,简写b
*   （gdb）info breakpoints：查看当前设置的所有断点
*   （gdb）delete breakpoints num：删除第num个断点,简写d
*   （gdb）display：追踪查看具体变量值
*   （gdb）undisplay：取消追踪观察变量
*   （gdb）watch：被设置观察点的变量发生修改时，打印显示
*   （gdb）i watch：显示观察点
*   （gdb）enable breakpoints：启用断点
*   （gdb）disable breakpoints：禁用断点
*   （gdb）x：查看内存x/20xw 显示20个单元，16进制，4字节每单元
*   （gdb）run argv\[1\] argv\[2\]：调试时命令行传参# go汇编
go 汇编

ChatGPT

Go 汇编是指在 Go 语言中使用汇编语言进行编程。这通常是为了实现某些性能关键的操作或者访问特定的硬件功能。Go 语言提供了一些工具和约定，使得在 Go 代码中可以嵌入汇编代码。

### 基本概念

1.  **Plan 9 汇编语法**：Go 使用了一种类似 Plan 9 操作系统的汇编语法，不同于传统的 AT&T 或 Intel 汇编语法。
2.  **函数定义**：汇编函数定义使用 `.TEXT` 伪指令。
3.  **寄存器**：使用前缀 `$` 表示立即数，`R` 表示寄存器，`(R)` 表示寄存器指针，`(R)(R*scale)` 表示基址+索引。

### 基本示例

以下是一个简单的 Go 汇编示例：

go

复制代码

`package main // 声明汇编函数 func Add(a, b int) int func main() { result := Add(3, 5) println(result) // 输出 8 }`

对应的汇编代码（文件名：`add_amd64.s`）：

assembly

复制代码

`TEXT ·Add(SB), NOSPLIT, $0-24 MOVQ a+0(FP), AX // 将参数 a 移动到寄存器 AX MOVQ b+8(FP), BX // 将参数 b 移动到寄存器 BX ADDQ BX, AX // AX = AX + BX MOVQ AX, ret+16(FP) // 将结果放到返回值位置 RET`

### 详细说明

*   `TEXT ·Add(SB), NOSPLIT, $0-24`:
    *   `TEXT` 表示定义一个文本段。
    *   `·Add` 表示函数名 `Add`。
    *   `SB` 是一个符号基址。
    *   `NOSPLIT` 表示不进行栈拆分。
    *   `$0-24` 表示栈帧的大小。
*   `MOVQ a+0(FP), AX` 和 `MOVQ b+8(FP), BX`：
    *   `MOVQ` 表示移动 64 位数据。
    *   `a+0(FP)` 表示从参数 `a` 所在的位置获取值，`FP` 是帧指针。
    *   `AX` 和 `BX` 是 x86-64 的通用寄存器。
*   `ADDQ BX, AX`：将 `BX` 中的值加到 `AX` 中。
*   `MOVQ AX, ret+16(FP)`：将 `AX` 中的值放到返回值的位置。
*   `RET`：返回。

### 常用寄存器

*   **通用寄存器**：AX, BX, CX, DX, SI, DI, BP, SP, R8-R15。
*   **特殊寄存器**：IP（指令指针），FLAGS（标志寄存器）。

### 栈帧布局

在 Go 汇编中，栈帧布局对于函数调用和参数传递至关重要。栈帧通常包括：

1.  返回地址。
2.  保存的寄存器。
3.  本地变量。
4.  参数。

### 调试和优化

1.  **调试**：可以使用 `gdb` 或者 `delve` 等调试器。
2.  **优化**：通过了解 CPU 架构和指令集，可以手工优化一些性能关键的代码路径。

### 参考资料

*   [Go 官方文档中的汇编部分](https://golang.org/doc/asm)
*   [Go 汇编的官方示例](https://github.com/golang/go/tree/master/src/runtime/internal/sys)

通过理解这些基本概念和示例，你可以开始在 Go 代码中使用汇编来提高性能或实现特定的低级功能。

4o

go 汇编 常用指令

ChatGPT

在 Go 汇编中，常用指令与标准汇编指令相似，但由于 Go 汇编采用了 Plan 9 汇编语法，某些指令和使用方法可能与传统的 AT&T 或 Intel 语法略有不同。下面是一些常用的 Go 汇编指令及其用途：

### 数据传输指令

*   **MOVQ src, dst**: 移动 64 位数据。
*   **MOVL src, dst**: 移动 32 位数据。
*   **MOVW src, dst**: 移动 16 位数据。
*   **MOVB src, dst**: 移动 8 位数据。

示例：

assembly

复制代码

`MOVQ AX, BX // 将 AX 寄存器的值移动到 BX 寄存器 MOVQ $10, AX // 将立即数 10 移动到 AX 寄存器`

### 算术指令

*   **ADDQ src, dst**: 将 64 位的 src 加到 dst。
*   **ADDL src, dst**: 将 32 位的 src 加到 dst。
*   **SUBQ src, dst**: 将 64 位的 src 从 dst 中减去。
*   **SUBL src, dst**: 将 32 位的 src 从 dst 中减去。
*   **MULQ src**: 64 位无符号乘法，将结果存放在 AX。
*   **IMULQ src**: 64 位有符号乘法，将结果存放在 AX。
*   **DIVQ src**: 64 位无符号除法，商存放在 AX，余数存放在 DX。
*   **IDIVQ src**: 64 位有符号除法，商存放在 AX，余数存放在 DX。

示例：

assembly

复制代码

`ADDQ AX, BX // 将 AX 和 BX 的值相加，结果存放在 BX SUBQ $5, AX // 将 AX 中的值减去 5，结果存放在 AX`

### 逻辑指令

*   **ANDQ src, dst**: 进行 64 位按位与操作。
*   **ORQ src, dst**: 进行 64 位按位或操作。
*   **XORQ src, dst**: 进行 64 位按位异或操作。
*   **NOTQ dst**: 对 64 位的 dst 进行按位取反操作。

示例：

assembly

复制代码

`ANDQ AX, BX // 对 AX 和 BX 进行按位与操作，结果存放在 BX XORQ $0x1, AX // 对 AX 进行按位异或操作，结果存放在 AX`

### 移位指令

*   **SHLQ count, dst**: 将 64 位的 dst 左移 count 位。
*   **SHRQ count, dst**: 将 64 位的 dst 右移 count 位。
*   **SARQ count, dst**: 将 64 位的 dst 算术右移 count 位。

示例：

assembly

复制代码

`SHLQ $2, AX // 将 AX 中的值左移 2 位 SHRQ $3, BX // 将 BX 中的值右移 3 位`

### 流程控制指令

*   **JMP label**: 无条件跳转到指定标签。
*   **JE label**: 如果等于，跳转到指定标签。
*   **JNE label**: 如果不等于，跳转到指定标签。
*   **JG label**: 如果大于，跳转到指定标签。
*   **JL label**: 如果小于，跳转到指定标签。
*   **JGE label**: 如果大于等于，跳转到指定标签。
*   **JLE label**: 如果小于等于，跳转到指定标签。
*   **CALL target**: 调用函数。
*   **RET**: 返回。

示例：

assembly

复制代码

`CMPQ AX, BX // 比较 AX 和 BX JE label // 如果 AX == BX，跳转到 label JMP next // 无条件跳转到 next label: // 代码块 next: // 代码块`

### 比较指令

*   **CMPQ src, dst**: 比较 64 位的 src 和 dst。
*   **CMPL src, dst**: 比较 32 位的 src 和 dst。
*   **TESTQ src, dst**: 对 64 位的 src 和 dst 进行按位与操作并设置条件码。
*   **TESTL src, dst**: 对 32 位的 src 和 dst 进行按位与操作并设置条件码。

示例：

assembly

复制代码

`CMPQ AX, BX // 比较 AX 和 BX JE label // 如果 AX == BX，跳转到 label TESTQ AX, AX // 测试 AX 是否为零 JZ label // 如果 AX 为零，跳转到 label`

### 函数调用和返回

*   **CALL target**: 调用目标函数。
*   **RET**: 从函数返回。

示例：

assembly

复制代码

`CALL ·SomeFunction(SB) // 调用 Go 函数 SomeFunction RET // 从当前函数返回`

### 寄存器说明

*   **AX, BX, CX, DX**: 通用寄存器。
*   **SI, DI**: 源索引和目标索引寄存器。
*   **SP**: 栈指针。
*   **BP**: 基指针。
*   **R8-R15**: 额外的通用寄存器。

### 特殊指令

*   **LEAQ src, dst**: 计算内存地址，将结果存入 dst。
*   **NOP**: 空操作，不执行任何操作。

示例：

assembly

复制代码

`LEAQ 8(SP), AX // 计算 SP+8 的地址，将结果存入 AX NOP // 执行空操作`

### 汇编函数示例

以下是一个完整的汇编函数示例，该函数计算两个整数的和：

Go 代码：

go

复制代码

`package main func Add(a, b int) int func main() { result := Add(10, 20) println(result) // 输出 30 }`

汇编代码（`add_amd64.s`）：

assembly

复制代码

`TEXT ·Add(SB), NOSPLIT, $0-24 MOVQ a+0(FP), AX // 将第一个参数 a 移动到 AX MOVQ b+8(FP), BX // 将第二个参数 b 移动到 BX ADDQ BX, AX // 将 BX 加到 AX 上 MOVQ AX, ret+16(FP) // 将结果存放到返回值 RET // 返回`

这些常用指令和示例应该可以帮助你在 Go 汇编中编写高效的代码。了解这些指令的使用方法和语法规则是掌握 Go 汇编编程的基础。# 汇编
Go 汇编是指在 Go 语言中使用汇编语言进行编程。这通常是为了实现某些性能关键的操作或者访问特定的硬件功能。Go 语言提供了一些工具和约定，使得在 Go 代码中可以嵌入汇编代码。

### 基本概念

1.  **Plan 9 汇编语法**：Go 使用了一种类似 Plan 9 操作系统的汇编语法，不同于传统的 AT&T 或 Intel 汇编语法。
2.  **函数定义**：汇编函数定义使用 `.TEXT` 伪指令。
3.  **寄存器**：使用前缀 `$` 表示立即数，`R` 表示寄存器，`(R)` 表示寄存器指针，`(R)(R*scale)` 表示基址+索引。

### 基本示例

以下是一个简单的 Go 汇编示例：

```go
package main

// 声明汇编函数
func Add(a, b int) int

func main() {
    result := Add(3, 5)
    println(result) // 输出 8
}
```

对应的汇编代码（文件名：`add_amd64.s`）：

```assembly
TEXT ·Add(SB), NOSPLIT, $0-24
    MOVQ a+0(FP), AX // 将参数 a 移动到寄存器 AX
    MOVQ b+8(FP), BX // 将参数 b 移动到寄存器 BX
    ADDQ BX, AX      // AX = AX + BX
    MOVQ AX, ret+16(FP) // 将结果放到返回值位置
    RET
```

### 详细说明

*   `TEXT ·Add(SB), NOSPLIT, $0-24`:
    *   `TEXT` 表示定义一个文本段。
    *   `·Add` 表示函数名 `Add`。
    *   `SB` 是一个符号基址。
    *   `NOSPLIT` 表示不进行栈拆分。
    *   `$0-24` 表示栈帧的大小。
*   `MOVQ a+0(FP), AX` 和 `MOVQ b+8(FP), BX`：
    *   `MOVQ` 表示移动 64 位数据。
    *   `a+0(FP)` 表示从参数 `a` 所在的位置获取值，`FP` 是帧指针。
    *   `AX` 和 `BX` 是 x86-64 的通用寄存器。
*   `ADDQ BX, AX`：将 `BX` 中的值加到 `AX` 中。
*   `MOVQ AX, ret+16(FP)`：将 `AX` 中的值放到返回值的位置。
*   `RET`：返回。

### 常用寄存器

*   **通用寄存器**：AX, BX, CX, DX, SI, DI, BP, SP, R8-R15。
*   **特殊寄存器**：IP（指令指针），FLAGS（标志寄存器）。

### 栈帧布局

在 Go 汇编中，栈帧布局对于函数调用和参数传递至关重要。栈帧通常包括：

1.  返回地址。
2.  保存的寄存器。
3.  本地变量。
4.  参数。

### 调试和优化

1.  **调试**：可以使用 `gdb` 或者 `delve` 等调试器。
2.  **优化**：通过了解 CPU 架构和指令集，可以手工优化一些性能关键的代码路径。

### 参考资料

*   [Go 官方文档中的汇编部分](https://golang.org/doc/asm)
*   [Go 汇编的官方示例](https://github.com/golang/go/tree/master/src/runtime/internal/sys)

通过理解这些基本概念和示例，你可以开始在 Go 代码中使用汇编来提高性能或实现特定的低级功能。

指令
--

在 Go 汇编中，常用指令与标准汇编指令相似，但由于 Go 汇编采用了 Plan 9 汇编语法，某些指令和使用方法可能与传统的 AT&T 或 Intel 语法略有不同。下面是一些常用的 Go 汇编指令及其用途：

### 数据传输指令

*   **MOVQ src, dst**: 移动 64 位数据。
*   **MOVL src, dst**: 移动 32 位数据。
*   **MOVW src, dst**: 移动 16 位数据。
*   **MOVB src, dst**: 移动 8 位数据。

示例：

```assembly
MOVQ AX, BX   // 将 AX 寄存器的值移动到 BX 寄存器
MOVQ $10, AX  // 将立即数 10 移动到 AX 寄存器
```

### 算术指令

*   **ADDQ src, dst**: 将 64 位的 src 加到 dst。
*   **ADDL src, dst**: 将 32 位的 src 加到 dst。
*   **SUBQ src, dst**: 将 64 位的 src 从 dst 中减去。
*   **SUBL src, dst**: 将 32 位的 src 从 dst 中减去。
*   **MULQ src**: 64 位无符号乘法，将结果存放在 AX。
*   **IMULQ src**: 64 位有符号乘法，将结果存放在 AX。
*   **DIVQ src**: 64 位无符号除法，商存放在 AX，余数存放在 DX。
*   **IDIVQ src**: 64 位有符号除法，商存放在 AX，余数存放在 DX。

示例：

```assembly
ADDQ AX, BX   // 将 AX 和 BX 的值相加，结果存放在 BX
SUBQ $5, AX   // 将 AX 中的值减去 5，结果存放在 AX
```

### 逻辑指令

*   **ANDQ src, dst**: 进行 64 位按位与操作。
*   **ORQ src, dst**: 进行 64 位按位或操作。
*   **XORQ src, dst**: 进行 64 位按位异或操作。
*   **NOTQ dst**: 对 64 位的 dst 进行按位取反操作。

示例：

```assembly
ANDQ AX, BX   // 对 AX 和 BX 进行按位与操作，结果存放在 BX
XORQ $0x1, AX // 对 AX 进行按位异或操作，结果存放在 AX
```

### 移位指令

*   **SHLQ count, dst**: 将 64 位的 dst 左移 count 位。
*   **SHRQ count, dst**: 将 64 位的 dst 右移 count 位。
*   **SARQ count, dst**: 将 64 位的 dst 算术右移 count 位。

示例：

```assembly
SHLQ $2, AX  // 将 AX 中的值左移 2 位
SHRQ $3, BX  // 将 BX 中的值右移 3 位
```

### 流程控制指令

*   **JMP label**: 无条件跳转到指定标签。
*   **JE label**: 如果等于，跳转到指定标签。
*   **JNE label**: 如果不等于，跳转到指定标签。
*   **JG label**: 如果大于，跳转到指定标签。
*   **JL label**: 如果小于，跳转到指定标签。
*   **JGE label**: 如果大于等于，跳转到指定标签。
*   **JLE label**: 如果小于等于，跳转到指定标签。
*   **CALL target**: 调用函数。
*   **RET**: 返回。

示例：

```assembly
CMPQ AX, BX  // 比较 AX 和 BX
JE label     // 如果 AX == BX，跳转到 label
JMP next     // 无条件跳转到 next

label:
    // 代码块
next:
    // 代码块
```

### 比较指令

*   **CMPQ src, dst**: 比较 64 位的 src 和 dst。
*   **CMPL src, dst**: 比较 32 位的 src 和 dst。
*   **TESTQ src, dst**: 对 64 位的 src 和 dst 进行按位与操作并设置条件码。
*   **TESTL src, dst**: 对 32 位的 src 和 dst 进行按位与操作并设置条件码。

示例：

```assembly
CMPQ AX, BX  // 比较 AX 和 BX
JE label     // 如果 AX == BX，跳转到 label
TESTQ AX, AX // 测试 AX 是否为零
JZ label     // 如果 AX 为零，跳转到 label
```

### 函数调用和返回

*   **CALL target**: 调用目标函数。
*   **RET**: 从函数返回。

示例：

```assembly
CALL ·SomeFunction(SB)  // 调用 Go 函数 SomeFunction
RET                     // 从当前函数返回
```

### 寄存器说明

*   **AX, BX, CX, DX**: 通用寄存器。
*   **SI, DI**: 源索引和目标索引寄存器。
*   **SP**: 栈指针。
*   **BP**: 基指针。
*   **R8-R15**: 额外的通用寄存器。

### 特殊指令

*   **LEAQ src, dst**: 计算内存地址，将结果存入 dst。
*   **NOP**: 空操作，不执行任何操作。

示例：

```assembly
LEAQ 8(SP), AX  // 计算 SP+8 的地址，将结果存入 AX
NOP             // 执行空操作
```

### 汇编函数示例

以下是一个完整的汇编函数示例，该函数计算两个整数的和：

Go 代码：

```go
package main

func Add(a, b int) int

func main() {
    result := Add(10, 20)
    println(result) // 输出 30
}
```

汇编代码（`add_amd64.s`）：

```assembly
TEXT ·Add(SB), NOSPLIT, $0-24
    MOVQ a+0(FP), AX  // 将第一个参数 a 移动到 AX
    MOVQ b+8(FP), BX  // 将第二个参数 b 移动到 BX
    ADDQ BX, AX       // 将 BX 加到 AX 上
    MOVQ AX, ret+16(FP) // 将结果存放到返回值
    RET               // 返回
```

这些常用指令和示例应该可以帮助你在 Go 汇编中编写高效的代码。了解这些指令的使用方法和语法规则是掌握 Go 汇编编程的基础。# 内存模型
内存一致性模型简称内存模型，关注的是存储在内存中的数据更改的可见性和一致性

硬件内存模型

* * *

编程语言内存模型

* * *# atomic
原子操作

* * *

\==原子操作==是指不会被线程调度机制打断的操作；这种操作一旦开始，就一直运行到结束，中间不会有任何 context switch （切换到另一个线程）

原子操作由底层硬件支持，锁由系统提供api实现。所以原子操作通常更有效率。

\[TOC\]

原子操作种类

* * *

1.  增或减
2.  比较并交换（CAS，Compare And Swap）
3.  载入
4.  存储
5.  交换

atomic

* * *# 逃逸分析
变量是在堆上分配，还是在栈上分配，是经过编译器的`逃逸分析`之后得出的结论，这一切都是Go编译器在背后帮我们完成的

在编译原理中，分析指针动态范围的方法称之为`逃逸分析`。通俗来讲，当一个对象的指针被多个方法或线程引用时，我们称这个指针发生了逃逸。更简单来说，`逃逸分析`决定一个变量是分配在堆上还是分配在栈上。

栈内存分配和释放简单，堆内存分配复杂，要找大小合适的内存块，回收要靠 GC ( Garbage Collection )，减少 GC 压力会提高性能

逃逸分析的场景

* * *

Go逃逸分析最基本的原则是：如果一个函数返回对一个变量的引用，那么它就会发生逃逸。编译器会分析代码的特征和代码生命周期，在函数返回后不会再被引用的，才分配到栈上，其他情况下都是分配到堆上。

### 指针逃逸

```text-plain
func scape() *int {
  a:=10
  return &a
}
```

`go build -gcflags "-m -l" go_file.go`

### 栈空间不足

### 闭包引用

### 动态类型逃逸

对于不确定大小的变量或参数 `interface{}`

### 切片或 map 赋值

给切片或者map赋值对象指针（与对象共享内存地址时），对象会逃逸到堆上。但赋值对象值或者返回对象值切片是不会发生逃逸的。

gcflags

* * *

*   \-l
*   \-m

### \-S

`go build -gcflags=-S . > asm.s 2>&1`# 内连优化
编译器的内连优化

* * *

内联是编程语言编译器常用的优化手段，其优化的对象为函数，也称为函数内联。如果某函数支持内联，则意味着编译器可以直接使用==函数体/函数定义==替换掉对函数的调用代码，以消除调用函数带来的额外开销 \[\[Drawing 2024-05-23 10.10.31.excalidraw\]\]核心改进方向：性能（GC、编译器）、并发、泛型、模块化、工具链。
### **Go 1.5** (2015)
- **并发垃圾回收 (GC)**：引入并行 GC，显著减少停顿时间。
- **自举实现**：运行时完全用 Go 重写，移除 C 依赖（来源：早期版本特性）。
### **Go 1.6** (2016)
- **SSA 编译器**：优化代码生成，提升性能。
- **HTTP/2 支持**：`net/http` 默认支持 HTTP/2（来源：早期版本特性）。
### **Go 1.7** (2016)
- **Context 包**：引入 `context` 管理请求生命周期。
- **编译器改进**：SSA 后端进一步优化（来源：早期版本特性）。
### **Go 1.8** (2017)
- **插件支持**：通过 `plugin` 包动态加载共享库（Linux）。
- **GC 停顿优化**：降至亚毫秒级（来源：早期版本特性）。
### **Go 1.9** (2017)
- **类型别名**：支持 `type T1 = T2`，简化重构。
- **并发 Map**：`sync.Map` 提供线程安全 Map（来源：早期版本特性）。
### **Go 1.10** (2018)
- **构建缓存**：加速重复编译和测试（来源：早期版本特性）。
### **Go 1.11** (2018)
- **Go Modules**：实验性模块化依赖管理（`go.mod`）。
- **WebAssembly 支持**：编译为 WASM（来源：早期版本特性）。
### **Go 1.12** (2019)
- **TLS 1.3**：`crypto/tls` 默认支持（来源：早期版本特性）。
### **Go 1.13** (2019)
- **错误处理**：`errors.Is` 和 `errors.As` 简化错误链处理。
- **数字字面量**：支持二进制/十六进制浮点数（来源：早期版本特性）。
### **Go 1.14** (2020)
- **Defer 优化**：性能提升，减少开销。
- **Modules 默认启用**：取代 GOPATH（来源：早期版本特性）。
### **Go 1.15** (2020)
- **链接器优化**：减少二进制体积，提升编译速度（来源：早期版本特性）。
### **Go 1.16** (2021)
- **嵌入文件**：`//go:embed` 指令嵌入静态资源。
- **IO 文件系统**：`io/fs` 抽象文件系统接口（来源：网页6）。
### **Go 1.17** (2021)
- **泛型实验**：通过 `-G=3` 启用。
- **数学常量**：`math.MaxInt`、`MinInt`。
- **时间方法**：`UnixMilli()`、`UnixMicro()`（来源：网页1）。
### **Go 1.18** (2022)
- **泛型正式支持**：类型参数 `T any`。
- **工作区模式**：`go.work` 管理多模块。
- **IP 处理**：`net/netip` 高效操作 IP（来源：网页1、6）。
### **Go 1.19** (2022)
- **内存模型更新**：明确并发内存规则。
- **原子操作**：`atomic.Int64`、`atomic.Uint64`（来源：网页6）。
### **Go 1.20** (2023)
- **随机数改进**：`math/rand` 自动种子。
- **时间格式**：`time.DateTime`、`DateOnly`。
- **加密支持**：`crypto/ecdh`（来源：网页6）。
### **Go 1.21** (2023)
- **结构化日志**：`log/slog`。
- **泛型工具包**：`slices`、`maps` 操作函数（来源：网页1、6）。
### **Go 1.22** (2024)
- **模块优化**：严格依赖版本控制。
- **WASM 性能**：减少代码体积，增强 GC（来源：网页2、4）。
### **Go 1.23** (2024)
- **弱指针与终结器**：`runtime.AddCleanup` 替代 `SetFinalizer`。
- **模板迭代器**：简化数据遍历（来源：网页4）。
### **Go 1.24** (2025)
- **泛型类型别名**：`type VectorAlias[T] = Vector[T]`。
- **工具链增强**：`go.mod` 的 `tool` 指令管理工具。
- **性能提升**：
  - Map 改用 SwissTable，性能提升 30%。
  - WASM 支持并发与 GC 优化（来源：网页2、3、4、5）。
# 错误处理
错误
--

错误
--

错误
--

一个良好的程序永远不应该出发 panic 异常;对于那些将运行失败看作是预期结果的函数，它们会返回一个额外的返回值，通常是最后一个，来传递错误信息。如果导致失败的原因只有一个，额外的返回值可以是一个布尔值，通常被命名为 ok;通常，导致失败的原因不止一种，尤其是对I/O操作而言，用户需要了解更多的错误信息。因此， 额外的返回值不再是简单的布尔类型，而是error类型 通常，当函数返回 non-­nil 的 error 时，其他的返回值是未定义的(undefined),这些未定义的返回值应该被忽略。然而，==有少部分函数在发生错误时，仍然会返回一些有用的返回值==。比如，当读取文件发生错误时，Read 函数会返回可以读取的字节数以及错误信息。对于这种情况，正确的处理方式应该是先处理这些不完整的数据，再处理错误。==因此对函数的返回值要有清晰的说明==，以便于其他人使用 在Go中，函数运行失败时会返回错误信息，这些错误信息被认为是一种预期的值而非异常（exception），这使得Go有别于那些将函数运行失败看作是异常的语言。虽然Go有各种异常机制，但这些机制仅被使用在处理那些未被预料到的错误，即bug，而不是那些在健壮程序中应该被避免的程序错误 Go这样设计的原因是由于对于某个应该在控制流程中处理的错误而言，将这个错误以异常的形式抛出会混乱对错误的描述，这通常会导致一些糟糕的后果。当某个程序错误被当作异常处理后，这个错误会将堆栈根据信息返回给终端用户，这些信息复杂且无用，无法帮助定位错误。因此，Go使用控制流机制（如if和return）处理异常，这使得编码人员能更多的关注错误处理。

### 错误处理策略

#### 错误处理常用的五种方式

1.  传播错误，函数中某个子程序的失败，会变成该函数的失败;

*   http.Parse 失败时不会直接返回HTTP错误
*   缺少两条重要信息：1. 错误发生在解析器 2. url 已经被解析 这些信息有助于错误处理
*   构造新的错误信息，fmt.Errorf 使用 fmt.Sprintf 格式化错误信息并返回
*   使用该函数前缀添加额外上下文信息到原始错误信息
*   错误信息应提供清晰的从原因到后果的因果链,错误信息经常以链式组合在一起的，所以避免大写和换行
*   如果是很长的错误信息，可以通过 grep 工具处理
*   要确保错误信息对问题细节的描述是详尽的。尤其是要注意错误信息表达的一致性
*   即相同的函数或同包内的同一组函数返回的错误在构成和处理方式上是相似的
*   一般而言，被调函数f(x)会将调用信息和参数信息作为发生错误时的上下文放在错误信息中并返回给调用者，调用者需要添加一些错误信息中不包含的信息

```go
// http.Get 调用失败时直接返回这个HTTP错误
resp, err:=http.Get(url)
if err != nil {
    return nil, err
}

// http.Parse 失败时不会直接返回HTTP错误
doc, err :=html.Parse(resp.Body)
resp.Body.Close()
if err!=nil{
    return nil, fmt.Errorf("parsing %s as HTML: %v", url, err)
}
```

1.  有条件的重试（设置时间间隔或重试次数）

```go
func WaitForServer(url string) error {
    const timeout = 1 * time.Minute
    deadline := time.Now().Add(timeout)
    for tries :=0; time.Now().Before(deadline);tries++{
        _,err:=http.Head(url)
        if err == nil {
            return nil
        }
        log.Printf("server not responding (%s);retrying...", err)
        time.Sleep(time.Second << unit(tries))
    }
    return fmt.Errorf("server %s failed to respond after %s",url,timeout)
}
```

1.  输出错误信息并结束程序（需要注意的是，这种策略只应在main中执行。对库函数而言，应仅向上传播错误，除非该错误意味着程序内部包含不一致性，即遇到了bug，才能在库函数中结束程序。）

```go
if err := WaitForServer(url); err != nil {
    fmt.Fprintf(os.Stderr, "Site is down: %v\n", err)
    os.Exit(1)
}

// 同样效果

if err := WaitForServer(url); err != nil {
    log.Fatalf("Site is down: %v\n", err)
}
```

1.  不需要中断程序，只输出错误信息（通过 log 包相关函数或标准错误流输出错误信息）

```go
if err := Ping(); err != nil {
    log.Printf("ping failed: %v; networking disabled", err)
}

if err := Ping(); err != nil {
    fmt.Fprintf(os.Stderr, "ping failed : %v; networking disabled\n", err)
}
```

1.  直接忽略错误

```go
dir, err := ioutil.TempDir("", "scratch")
if err != nil {
    return fmt.Errorf("failed to create temp dir: %v", err)
}
os.RemoveAll(dir) // 此处没有错误处理因为系统会定期清理临时目录，不会对逻辑造成影响
```

在Go中，错误处理有一套独特的编码风格。检查某个子函数是否失败后，我们通常将处理失败的逻辑代码放在处理成功的代码之前。如果某个错误会导致函数返回，那么成功时的逻辑代码不应放在else语句块中，而应直接放在函数体中。Go中大部分函数的代码结构几乎相同，首先是一系列的初始检查，防止错误发生，之后是函数的实际逻辑。

### 文件结尾错误 EOF

io包保证任何由文件结束引起的读取失败都返回同一个错误 —— io.EOF，只需简单的比较就可以检测出这个错误

```go
package io

import "errors"

var EOF = errors.New("EOF")
```

```go
in := bufio.NewReader(os.Stdin)
for {
    r, _, err := in.ReadRune()
    if err == io.EOF {
        break
    }
    if err != nil {
        return fmt.Errorf("read feiled: %v", err)
    }
}
```

因为文件结束这种错误不需要更多的描述，所以io.EOF有固定的错误信息——“EOF”。对于其他错 误，我们可能需要在错误信息中描述错误的类型和数量，这使得我们不能像io.EOF一样采用固定的 错误信息 一个良好的程序永远不应该出发 panic 异常;对于那些将运行失败看作是预期结果的函数，它们会返回一个额外的返回值，通常是最后一个，来传递错误信息。如果导致失败的原因只有一个，额外的返回值可以是一个布尔值，通常被命名为 ok;通常，导致失败的原因不止一种，尤其是对I/O操作而言，用户需要了解更多的错误信息。因此， 额外的返回值不再是简单的布尔类型，而是error类型 通常，当函数返回 non-­nil 的 error 时，其他的返回值是未定义的(undefined),这些未定义的返回值应该被忽略。然而，==有少部分函数在发生错误时，仍然会返回一些有用的返回值==。比如，当读取文件发生错误时，Read 函数会返回可以读取的字节数以及错误信息。对于这种情况，正确的处理方式应该是先处理这些不完整的数据，再处理错误。==因此对函数的返回值要有清晰的说明==，以便于其他人使用 在Go中，函数运行失败时会返回错误信息，这些错误信息被认为是一种预期的值而非异常（exception），这使得Go有别于那些将函数运行失败看作是异常的语言。虽然Go有各种异常机制，但这些机制仅被使用在处理那些未被预料到的错误，即bug，而不是那些在健壮程序中应该被避免的程序错误 Go这样设计的原因是由于对于某个应该在控制流程中处理的错误而言，将这个错误以异常的形式抛出会混乱对错误的描述，这通常会导致一些糟糕的后果。当某个程序错误被当作异常处理后，这个错误会将堆栈根据信息返回给终端用户，这些信息复杂且无用，无法帮助定位错误。因此，Go使用控制流机制（如if和return）处理异常，这使得编码人员能更多的关注错误处理。

### 错误处理策略

#### 错误处理常用的五种方式

1.  传播错误，函数中某个子程序的失败，会变成该函数的失败;

*   http.Parse 失败时不会直接返回HTTP错误
*   缺少两条重要信息：1. 错误发生在解析器 2. url 已经被解析 这些信息有助于错误处理
*   构造新的错误信息，fmt.Errorf 使用 fmt.Sprintf 格式化错误信息并返回
*   使用该函数前缀添加额外上下文信息到原始错误信息
*   错误信息应提供清晰的从原因到后果的因果链,错误信息经常以链式组合在一起的，所以避免大写和换行
*   如果是很长的错误信息，可以通过 grep 工具处理
*   要确保错误信息对问题细节的描述是详尽的。尤其是要注意错误信息表达的一致性
*   即相同的函数或同包内的同一组函数返回的错误在构成和处理方式上是相似的
*   一般而言，被调函数f(x)会将调用信息和参数信息作为发生错误时的上下文放在错误信息中并返回给调用者，调用者需要添加一些错误信息中不包含的信息

```go
// http.Get 调用失败时直接返回这个HTTP错误
resp, err:=http.Get(url)
if err != nil {
    return nil, err
}

// http.Parse 失败时不会直接返回HTTP错误
doc, err :=html.Parse(resp.Body)
resp.Body.Close()
if err!=nil{
    return nil, fmt.Errorf("parsing %s as HTML: %v", url, err)
}
```

1.  有条件的重试（设置时间间隔或重试次数）

```go
func WaitForServer(url string) error {
    const timeout = 1 * time.Minute
    deadline := time.Now().Add(timeout)
    for tries :=0; time.Now().Before(deadline);tries++{
        _,err:=http.Head(url)
        if err == nil {
            return nil
        }
        log.Printf("server not responding (%s);retrying...", err)
        time.Sleep(time.Second << unit(tries))
    }
    return fmt.Errorf("server %s failed to respond after %s",url,timeout)
}
```

1.  输出错误信息并结束程序（需要注意的是，这种策略只应在main中执行。对库函数而言，应仅向上传播错误，除非该错误意味着程序内部包含不一致性，即遇到了bug，才能在库函数中结束程序。）

```go
if err := WaitForServer(url); err != nil {
    fmt.Fprintf(os.Stderr, "Site is down: %v\n", err)
    os.Exit(1)
}

// 同样效果

if err := WaitForServer(url); err != nil {
    log.Fatalf("Site is down: %v\n", err)
}
```

1.  不需要中断程序，只输出错误信息（通过 log 包相关函数或标准错误流输出错误信息）

```go
if err := Ping(); err != nil {
    log.Printf("ping failed: %v; networking disabled", err)
}

if err := Ping(); err != nil {
    fmt.Fprintf(os.Stderr, "ping failed : %v; networking disabled\n", err)
}
```

1.  直接忽略错误

```go
dir, err := ioutil.TempDir("", "scratch")
if err != nil {
    return fmt.Errorf("failed to create temp dir: %v", err)
}
os.RemoveAll(dir) // 此处没有错误处理因为系统会定期清理临时目录，不会对逻辑造成影响
```

在Go中，错误处理有一套独特的编码风格。检查某个子函数是否失败后，我们通常将处理失败的逻辑代码放在处理成功的代码之前。如果某个错误会导致函数返回，那么成功时的逻辑代码不应放在else语句块中，而应直接放在函数体中。Go中大部分函数的代码结构几乎相同，首先是一系列的初始检查，防止错误发生，之后是函数的实际逻辑。

### 文件结尾错误 EOF

io包保证任何由文件结束引起的读取失败都返回同一个错误 —— io.EOF，只需简单的比较就可以检测出这个错误

```go
package io

import "errors"

var EOF = errors.New("EOF")
```

```go
in := bufio.NewReader(os.Stdin)
for {
    r, _, err := in.ReadRune()
    if err == io.EOF {
        break
    }
    if err != nil {
        return fmt.Errorf("read feiled: %v", err)
    }
}
```

因为文件结束这种错误不需要更多的描述，所以io.EOF有固定的错误信息——“EOF”。对于其他错 误，我们可能需要在错误信息中描述错误的类型和数量，这使得我们不能像io.EOF一样采用固定的 错误信息 一个良好的程序永远不应该出发 panic 异常;对于那些将运行失败看作是预期结果的函数，它们会返回一个额外的返回值，通常是最后一个，来传递错误信息。如果导致失败的原因只有一个，额外的返回值可以是一个布尔值，通常被命名为 ok;通常，导致失败的原因不止一种，尤其是对I/O操作而言，用户需要了解更多的错误信息。因此， 额外的返回值不再是简单的布尔类型，而是error类型 通常，当函数返回 non-­nil 的 error 时，其他的返回值是未定义的(undefined),这些未定义的返回值应该被忽略。然而，==有少部分函数在发生错误时，仍然会返回一些有用的返回值==。比如，当读取文件发生错误时，Read 函数会返回可以读取的字节数以及错误信息。对于这种情况，正确的处理方式应该是先处理这些不完整的数据，再处理错误。==因此对函数的返回值要有清晰的说明==，以便于其他人使用 在Go中，函数运行失败时会返回错误信息，这些错误信息被认为是一种预期的值而非异常（exception），这使得Go有别于那些将函数运行失败看作是异常的语言。虽然Go有各种异常机制，但这些机制仅被使用在处理那些未被预料到的错误，即bug，而不是那些在健壮程序中应该被避免的程序错误 Go这样设计的原因是由于对于某个应该在控制流程中处理的错误而言，将这个错误以异常的形式抛出会混乱对错误的描述，这通常会导致一些糟糕的后果。当某个程序错误被当作异常处理后，这个错误会将堆栈根据信息返回给终端用户，这些信息复杂且无用，无法帮助定位错误。因此，Go使用控制流机制（如if和return）处理异常，这使得编码人员能更多的关注错误处理。

### 错误处理策略

#### 错误处理常用的五种方式

1.  传播错误，函数中某个子程序的失败，会变成该函数的失败;

*   http.Parse 失败时不会直接返回HTTP错误
*   缺少两条重要信息：1. 错误发生在解析器 2. url 已经被解析 这些信息有助于错误处理
*   构造新的错误信息，fmt.Errorf 使用 fmt.Sprintf 格式化错误信息并返回
*   使用该函数前缀添加额外上下文信息到原始错误信息
*   错误信息应提供清晰的从原因到后果的因果链,错误信息经常以链式组合在一起的，所以避免大写和换行
*   如果是很长的错误信息，可以通过 grep 工具处理
*   要确保错误信息对问题细节的描述是详尽的。尤其是要注意错误信息表达的一致性
*   即相同的函数或同包内的同一组函数返回的错误在构成和处理方式上是相似的
*   一般而言，被调函数f(x)会将调用信息和参数信息作为发生错误时的上下文放在错误信息中并返回给调用者，调用者需要添加一些错误信息中不包含的信息

```go
// http.Get 调用失败时直接返回这个HTTP错误
resp, err:=http.Get(url)
if err != nil {
    return nil, err
}

// http.Parse 失败时不会直接返回HTTP错误
doc, err :=html.Parse(resp.Body)
resp.Body.Close()
if err!=nil{
    return nil, fmt.Errorf("parsing %s as HTML: %v", url, err)
}
```

1.  有条件的重试（设置时间间隔或重试次数）

```go
func WaitForServer(url string) error {
    const timeout = 1 * time.Minute
    deadline := time.Now().Add(timeout)
    for tries :=0; time.Now().Before(deadline);tries++{
        _,err:=http.Head(url)
        if err == nil {
            return nil
        }
        log.Printf("server not responding (%s);retrying...", err)
        time.Sleep(time.Second << unit(tries))
    }
    return fmt.Errorf("server %s failed to respond after %s",url,timeout)
}
```

1.  输出错误信息并结束程序（需要注意的是，这种策略只应在main中执行。对库函数而言，应仅向上传播错误，除非该错误意味着程序内部包含不一致性，即遇到了bug，才能在库函数中结束程序。）

```go
if err := WaitForServer(url); err != nil {
    fmt.Fprintf(os.Stderr, "Site is down: %v\n", err)
    os.Exit(1)
}

// 同样效果

if err := WaitForServer(url); err != nil {
    log.Fatalf("Site is down: %v\n", err)
}
```

1.  不需要中断程序，只输出错误信息（通过 log 包相关函数或标准错误流输出错误信息）

```go
if err := Ping(); err != nil {
    log.Printf("ping failed: %v; networking disabled", err)
}

if err := Ping(); err != nil {
    fmt.Fprintf(os.Stderr, "ping failed : %v; networking disabled\n", err)
}
```

1.  直接忽略错误

```go
dir, err := ioutil.TempDir("", "scratch")
if err != nil {
    return fmt.Errorf("failed to create temp dir: %v", err)
}
os.RemoveAll(dir) // 此处没有错误处理因为系统会定期清理临时目录，不会对逻辑造成影响
```

在Go中，错误处理有一套独特的编码风格。检查某个子函数是否失败后，我们通常将处理失败的逻辑代码放在处理成功的代码之前。如果某个错误会导致函数返回，那么成功时的逻辑代码不应放在else语句块中，而应直接放在函数体中。Go中大部分函数的代码结构几乎相同，首先是一系列的初始检查，防止错误发生，之后是函数的实际逻辑。

### 文件结尾错误 EOF

io包保证任何由文件结束引起的读取失败都返回同一个错误 —— io.EOF，只需简单的比较就可以检测出这个错误

```go
package io

import "errors"

var EOF = errors.New("EOF")
```

```go
in := bufio.NewReader(os.Stdin)
for {
    r, _, err := in.ReadRune()
    if err == io.EOF {
        break
    }
    if err != nil {
        return fmt.Errorf("read feiled: %v", err)
    }
}
```

因为文件结束这种错误不需要更多的描述，所以io.EOF有固定的错误信息——“EOF”。对于其他错 误，我们可能需要在错误信息中描述错误的类型和数量，这使得我们不能像io.EOF一样采用固定的 错误信息# 10. test
1.  代码评审
2.  代码测试

*   测试以 `_test.go` 结尾的源文件
*   测试中有 测试函数、基准测试函数、示例函数 三中函数
    *   测试函数以 Test 为函数名前缀的函数用于测试程序逻辑是否正确
    *   基准函数以 Benchmark 为函数名前缀的函数用于衡量函数性能
    *   实例函数以 Example 为函数名前缀的函数提供一个由编译器保证正确性的示例文档

go test 命令会遍历所有的`*_test.go`文件中符合上述命名规则的函数，生成一个临时的 main 包用于 调用相应的测试函数，接着构建并运行、报告测试结果，最后清理测试中生成的临时文件。go test 无参数时表示测试当前目录对应的包

毎个测试函数必须导入 tesing 包 `func TestName(t *tesing.T){}`，以 Test 开头，后缀必须大写开头，t 用于报告测试失败和附加的日志信息

```go
func TestPalindrome(t *testing.T){
  if !IsPalindrome("kayak"){
    t.Error(`IsPalindrome("kaya") = false`)
  }
}
```

\-v 可用于打印每个测试函数的名字和运行时间 -run 对应一个正则表达式，只有测试函数名被他正确匹配的测试函数才会被 go test 执行

t.Errorf 调用不会引起 panic 异常或停止测试的执行，其后测试依然会运行 t.Fatal t.Fatalf 可以停止当前测试函数，其调用需和测试函数在同一个 goroutine

\==随机测试==对于随机输入确定其结果的方法有两种

1.  编写另一个对照函数
2.  生成的数据遵循特定模式

一种测试分类的方法是基于测试者是否需要了解被测试对象的内部工作原理。==黑盒测试==只需要测试包公开的文档和API行为，内部实现对测试代码是透明的。相反，==白盒测试==（传统的名称，称为 clear box 更准确）访问包内部函数和数据结构的权限，因此可以做到一下普通客户端无法实现的测试。

单元测试

* * *

### testing

*   测试代码需放在当前包以"\_test.go"结尾的文件中
*   测试函数以Test为名称前缀
*   测试命令（go test）忽略以"\_"或"."开头的测试文件
*   正常编译操作（go build/install）会忽略测试文件

标准库testing提供了专用类型T来控制测试结果和行为

*   t.Fail 失败：继续执行当前测试函数
*   t.FailNow 失败：立即终止执行当前测试函数 Failed
*   t.SkipNow 跳过：停止执行当前测试函数 Skip Skipf Skipped
*   t.Log 输出错误信息。仅失败或-v时输出 Logf
*   t.Parallel 与有同样设置的测试函数并行执行 // 可有效利用多核并行优势，缩短测试时间
*   t.Error Fail+Log Errorf
*   t.Fatal FailNow+Log Fatalf

```go
func TestA(t *testing.T){
    t.Parallel()
    time.Sleep(time.Second*2)
}

func TestB(t *testing.T){
    if os.Args[] == "b"{
        t.Parallel()
    }
    time.Sleep(time.Second*2)
}
```

### go test

*   \-args 命令行参数
*   \-v 输出详细信息
*   \-parallel 并发执行，默认值为GOMAXPROCS
*   \-run 指定测试函数，正则表达式 // -run "Add"
*   \-timeout 全部测试累计时间超时将引发panic，默认10ms
*   \-count 重复测试次数，默认1

### table driven

```go
func add(x,y int)int{
    return x+y
}

func TestAdd(t *testing.T){
    var tests = []struct{
        x,y,expect int
    }{
        {1,1,2},
        {2,1,3},
        {4,1,5},
    } // 测试数据与测试逻辑分离, 便于维护
    for _,v:=range tests{
        actual:=add(v.x,v,y)
        if actuan != v.expect{
            t.Errorf('')
        }
    }
}
```

### test main

某些时候，须为测试用例提供初始化和清理操作，但testing并没有setup/teardown机制。解决方法是自定义一个名为TestMain的函数，go test会改为执行该函数，而不再是具体的测试用例。

```go
func TestMain(m *testing.M){
    code:=m.Run() // 会调用具体的测试用例
    os.Exit(code) // os.Exit 不会执行defer
}
```

*   testing.InternalTest
*   testing.InternalBenchmark
*   testing.InternalExample
*   testing.MainStart

### example

例代码最大的用途不是测试，而是导入到GoDoc等工具生成的帮助文档中。它通过比对输出（stdout）结果和内部output注释是否一致来判断是否成功。如果没有output注释，该示例函数就不会被执行。另外，不能使用内置函数print/println，因为它们输出到stderr。

```go
func ExampleAdd() {
   fmt.Println(add(1,2))
   fmt.Println(add(2,2))

    //Output:
    //3
    //4
}
```

性能测试

* * *

性能测试函数以Benchmark为名称前缀，同样保存在"\*\_test.go"文件里。性能测试不会默认执行需要指定bench参数，通过反复调整B.N值反复执行测试函数，直到获得准确测量结果

```go
// go test -bench
func add(x,y int)int{
    return x+y
}

func BenchmarkAdd(b *testing.B){
    for i:=0;i<b.N;i++{
        _ = add(1,2)
    }
}
```

### timer

### memory

代码覆盖率

* * *

go test -cover

性能监控

* * *

引发性能的原因

*   执行时间长
*   内存占用多
*   意外的阻塞

两种捕获方式

1.  在测试时输出并保存相关数据，进行初期评估
2.  在运行阶段通过web接口获得实时数据，分析一段时间内健康状况

go test

> \-run -bench -cpuprofile 保存执行时间采样到指定文件 -memprofile 保存内存分配采样到指定文件 -memprofilerate 内存分配采样起始值，默认为512KB -blockprofile 保存阻塞时间采样到指定文件 -blockprofilerate 阻塞时间采样起始值，单位：ns

go tool# 一些定义
程序结构

* * *

\[toc\]

关键字

* * *

*   var 和 const
*   package 和 import
*   func
*   return
*   defer
*   go
*   select
*   interface
*   struct
*   break/case/continue/for/fallthrough/else/if/switch/goto/default
*   chan
*   type
*   map
*   range

预定义名称

* * *

### 内建常量

true false iota nil

### 内建类型

|     |     |     |     |     |     |
| --- | --- | --- | --- | --- | --- |
| int | int8 | int16 | int32 | int64 |     |
| unit | unit8 | unit16 | unit32 | unit64 | unitptr |
| float32 | float64 | complex128 | complex64 |     |     |
| bool | byte | rune | string | error |     |

### 内建函数

*   make
*   len
*   cap
*   new
*   append
*   copy
*   close
*   delete
*   complex
*   real
*   imag
*   panic
*   recover

声明
--

*   var
*   const
*   type
*   func

\*\*简短变量声明 \*\*​ **​**​ **​`:=`​**​**​**

**退化赋值操作**

```go
var i, j, k int
var m, n, j = true, 2, "ji"
```

变量
--

### 零值

零值初始化机制使得 Go 中不存在未初始化的变量

*   数字零值是 0
*   布尔零值是 false
*   字符串零值是 ""
*   接口或引用类型（slice ptr map chan func）零值是 nil
*   数组或结构体零值是 每个元素或字段都是对应类型的零值

### 指针

```go
var x int
// &x 指向变量的指针,其数据类型为 *int（指针为指向 int 类型的指针）
var p *int = &x
// p 指针指向变量 x（保存了变量 x 的内存地址）
// *p 读取指针指向的变量的值，值为 int 类型，*p 同时是个变量，可以改变指针指向的变量的值
*p = 4
```

指针特别有价值的地方在于我们可以不用名字而访问一个变量，但是这是一把双 刃剑:要找到一个变量的所有访问者并不容易，我们必须知道变量全部的别名(译注:这是Go语 言的垃圾回收器所做的工作)。不仅仅是指针会创建别名，很多其他引用类型也会创建别名，例如 slice、map和chan，甚至结构体、数组和接口都会创建所引用变量的别名。

### new

`new(T)` 创建 T 类型的匿名变量，初始化为 T 类型零值，返回变量地址 `*T` new 为语法糖，和普通变量声明语句方式创建变量没区别 new 为预定义函数，不是关键字，可以重新定义

```go
func delta(old, new int) int {return new - old} // new 被重新定义，函数 delta 中无法使用内置 new 函数
```

### 变量声明周期

*   包一级的变量和程序运行周期一直
*   局部变量生命周期到不被引用为止

\==函数的有右小括弧也可以另起一行缩进，同时为了防止编译器在行尾自动插入分号而导致的编译错误，可以在末尾的参数变量后面显式插入逗号。== 变量引用算法大概是，从每个包记得变量和每个运行的函数的么个局部变量开始，通过指针或引用的访问路径遍历，是否可以找到变量。如果不存在则说明变量不可达，就是说存在与否不影响运行结果。变量的有效期只取决于是否可达

赋值
--

```go
x = 1
*ptr = true
o.p = ""
a[i] *= x // a[i] = a[i] * x
```

### 元组赋值

是指一种赋值形式，允许同时更新多个变量值，赋值前右侧表达式会先求职

```go
x, y = y, x
m, n = m, m%n
a, b, c = 1, 2, 3

f, err := os.Open("...")
// ok-idom (map 查找, 类型断言, 通道接收)
v, ok := m[key]
v, ok := x.(T)
v, ok := <-ch
```

### 可赋值性

不同类型可赋值（隐式赋值，显示赋值）性规则有不同要求

*   类型必须完全匹配
*   nil可以赋值给任何指针或引用类型的变量
*   两个值是否可以用==或`!=`，比较的第二个值对第一个值是可赋值的，反之亦然

类型
--

`type 类型名 底层类型`

对于中文汉字，Unicode标志都作为小写字母处理，因此中文的命名默认不能导出;不过国 内的用户针对该问题提出了不同的看法，根据RobPike的回复，在Go2中有可能会将中日韩等字符 当作大写字母处理。

\==一个类型声明语句创建了一个新的类型名称，和现有类型具有相同的底层结构。新命名的类型提供 了一个方法，用来分隔不同概念的类型，这样即使它们底层类型相同也是不兼容的。==

\==对于每一个类型T，都有一个对应的类型转换操作T(x)，用于将x转为T类型(译注:如果T是指针类 型，可能会需要用小括弧包装T，比如 (\*int)(0) )。只有当两个类型的底层基础类型相同时，才允 许这种转型操作，或者是两者都是指向相同底层结构的指针类型，这些转换只改变类型而不会影响 值本身。如果x是可以赋值给T类型的值，那么x必然也可以被转为T类型，但是一般没有这个必要。==

\==数值类型之间的转型也是允许的，并且在字符串和一些特定类型的slice之间也是可以转换的==

\==比较运算符 == 和 `<` 也可以用来比较一个命名类型的变量和另一个有相同类型的变量，或有着相同底 层类型的未命名类型的值之间做比较。==

\==许多类型都会定义一个String方法，因为当使用fmt包的打印方法时，将会优先使用该类型对应的 String方法返回的结果打印==

包和文件

* * *

包的目的都是为了支持模块化、封装、单独编译和代码重用. 通常，包注释的第一句应该先是包的功能概要说明。一个包通常只有一个源文件有包注释，如果有多个包注释目前会按照文件名的先后链接为一个包注释，如果注释很大，通常会放到独立的`doc.go`文件中

### 初始化

首先包级变量按声明出现的顺序依次初始化，多个 go 文件按照文件名排序后依次编译 复杂的初始化工作可是使用 init 函数，一个包可以有多个 init 函数，init 函数会按照声明顺序在程序开始执行时依次自动调用

### 作用域

在包级别，声明的顺序并不会影响作用域范围，因此一个先声明的可以引用它自身或者是引用后面 的一个声明，这可以让我们定义一些相互嵌套或递归的类型或函数。但是如果一个变量或常量递归 引用了自身，则会产生编译错误。

```go
if f, err:=os.Open(fname); err != nil {
    return err
}

// f 作用域只在 if 语句内
f.ReadByte() // undefined f
f.Close() // undefined f
```

```go
var cwd string

func init() {
    // 这一句重新声明了 cwd 屏蔽了外部 cwd
    cwd, err := os.Getwd() // compile error: unused: cwd if err != nil {
    log.Fatalf("os.Getwd failed: %v", err) }
}
```# 规范
指导原则

* * *

### 指向 interface 的指针

您几乎不需要指向接口类型的指针。您应该将接口作为值进行传递，在这样的传递过程中，实质上传递的底层数据仍然可以是指针。

接口实质上在底层用两个字段表示：

1.  一个指向某些特定类型信息的指针。您可以将其视为"type"。
2.  数据指针。如果存储的数据是指针，则直接存储。如果存储的数据是一个值，则存储指向该值的指针。

如果希望接口方法修改基础数据，则必须使用指针传递 (将对象指针赋值给接口变量)。

```go
type F interface {
  f()
}

type S1 struct{}

func (s S1) f() {}

type S2 struct{}

func (s *S2) f() {}

// f1.f() 无法修改底层数据
// f2.f() 可以修改底层数据，给接口变量 f2 赋值时使用的是对象指针
var f1 F = S1{}
var f2 F = &S2{}
```

永远不要使用指向interface的指针，这个是没有意义的.在go语言中，接口本身就是引用类型，换句话说，接口类型本身就是一个指针。对于我的需求，其实test的参数只要是myinterface就可以了，只需要在传值的时候，传\_mystruct类型（也只能传\_mystruct类型）

```
type myinterface interface{
    print()
}
func test(value *myinterface){
    //someting to do ...
}

type mystruct struct {
    i int
}
//实现接口
func (this *mystruct) print(){
    fmt.Println(this.i)
    this.i=1
}
func main(){
m := &mystruct{0}
test(m)//错误
test(*m)//错误
}
```

### Interface 合理性验证

在编译时验证接口的符合性。这包括：

*   将实现特定接口的导出类型作为接口 API 的一部分进行检查
*   实现同一接口的 (导出和非导出) 类型属于实现类型的集合
*   任何违反接口合理性检查的场景，都会终止编译，并通知给用户

补充：上面 3 条是编译器对接口的检查机制， 大体意思是错误使用接口会在编译期报错。 所以可以利用这个机制让部分问题在编译期暴露。

| Bad | Good |
| --- | --- |
|     |     |

```go
// 如果 Handler 没有实现 http.Handler，会在运行时报错
type Handler struct {
  // ...
}
func (h *Handler) ServeHTTP(
  w http.ResponseWriter,
  r *http.Request,
) {
  ...
}
```

```go
type Handler struct {
  // ...
}
// 用于触发编译期的接口的合理性检查机制
// 如果 Handler 没有实现 http.Handler，会在编译期报错
var _ http.Handler = (*Handler)(nil)
func (h *Handler) ServeHTTP(
  w http.ResponseWriter,
  r *http.Request,
) {
  // ...
}
```

如果 `*Handler` 与 `http.Handler` 的接口不匹配， 那么语句 `var _ http.Handler = (*Handler)(nil)` 将无法编译通过。

赋值的右边应该是断言类型的零值。 对于指针类型（如 `*Handler`）、切片和映射，这是 `nil`； 对于结构类型，这是空结构。

```go
type LogHandler struct {
  h   http.Handler
  log *zap.Logger
}
var _ http.Handler = LogHandler{}
func (h LogHandler) ServeHTTP(
  w http.ResponseWriter,
  r *http.Request,
) {
  // ...
}
```

### 接收器 (receiver) 与接口

使用值接收器的方法既可以通过值调用，也可以通过指针调用。

带指针接收器的方法只能通过指针或 [addressable values](https://golang.org/ref/spec#Method_values) 调用。

例如，

```go
type S struct {
  data string
}

func (s S) Read() string {
  return s.data
}

func (s *S) Write(str string) {
  s.data = str
}

sVals := map[int]S{1: {"A"}}

// 你通过值只能调用 Read
sVals[1].Read()

// 这不能编译通过：
//  sVals[1].Write("test")

sPtrs := map[int]*S{1: {"A"}}

// 通过指针既可以调用 Read，也可以调用 Write 方法
sPtrs[1].Read()
sPtrs[1].Write("test")
```

类似的，即使方法有了值接收器，也同样可以用指针接收器来满足接口。

```go
type F interface {
  f()
}

type S1 struct{}

func (s S1) f() {}

type S2 struct{}

func (s *S2) f() {}

s1Val := S1{}
s1Ptr := &S1{}
s2Val := S2{}
s2Ptr := &S2{}

var i F
i = s1Val
i = s1Ptr
i = s2Ptr

//  下面代码无法通过编译。因为 s2Val 是一个值，而 S2 的 f 方法中没有使用值接收器
//   i = s2Val
```

[Effective Go](https://golang.org/doc/effective_go.html) 中有一段关于 [pointers vs. values](https://golang.org/doc/effective_go.html#pointers_vs_values) 的精彩讲解。

补充：

*   一个类型可以有值接收器方法集和指针接收器方法集
    *   值接收器方法集是指针接收器方法集的子集，反之不是
*   规则
    *   值对象只可以使用值接收器方法集
    *   指针对象可以使用 值接收器方法集 + 指针接收器方法集
*   接口的匹配 (或者叫实现)
    *   类型实现了接口的所有方法，叫匹配
    *   具体的讲，要么是类型的值方法集匹配接口，要么是指针方法集匹配接口

具体的匹配分两种：

*   值方法集和接口匹配
    *   给接口变量赋值的不管是值还是指针对象，都 ok，因为都包含值方法集
*   指针方法集和接口匹配
    *   只能将指针对象赋值给接口变量，因为只有指针方法集和接口匹配
    *   如果将值对象赋值给接口变量，会在编译期报错 (会触发接口合理性检查机制)

为啥 i = s2Val 会报错，因为值方法集和接口不匹配。

### 零值 Mutex 是有效的

零值 `sync.Mutex` 和 `sync.RWMutex` 是有效的。所以指向 mutex 的指针基本是不必要的。

| Bad | Good |
| --- | --- |
|     |     |

```go
mu := new(sync.Mutex)
mu.Lock()
```

```go
var mu sync.Mutex
mu.Lock()
```

如果你使用结构体指针，mutex 应该作为结构体的非指针字段。即使该结构体不被导出，也不要直接把 mutex 嵌入到结构体中。

| Bad | Good |
| --- | --- |
|     |     |

```go
type SMap struct {
  sync.Mutex

  data map[string]string
}

func NewSMap() *SMap {
  return &SMap{
    data: make(map[string]string),
  }
}

func (m *SMap) Get(k string) string {
  m.Lock()
  defer m.Unlock()

  return m.data[k]
}
```

```go
type SMap struct {
  mu sync.Mutex

  data map[string]string
}

func NewSMap() *SMap {
  return &SMap{
    data: make(map[string]string),
  }
}

func (m *SMap) Get(k string) string {
  m.mu.Lock()
  defer m.mu.Unlock()

  return m.data[k]
}
```

`Mutex` 字段， `Lock` 和 `Unlock` 方法是 `SMap` 导出的 API 中不刻意说明的一部分。

mutex 及其方法是 `SMap` 的实现细节，对其调用者不可见。

### 在边界处拷贝 Slices 和 Maps

slices 和 maps 包含了指向底层数据的指针，因此在需要复制它们时要特别注意。

#### 接收 Slices 和 Maps

请记住，当 map 或 slice 作为函数参数传入时，如果您存储了对它们的引用，则用户可以对其进行修改。

| Bad | Good |
| --- | --- |
|     |     |

```go
func (d *Driver) SetTrips(trips []Trip) {
  d.trips = trips
}

trips := ...
d1.SetTrips(trips)

// 你是要修改 d1.trips 吗？
trips[0] = ...
```

```go
func (d *Driver) SetTrips(trips []Trip) {
  d.trips = make([]Trip, len(trips))
  copy(d.trips, trips)
}

trips := ...
d1.SetTrips(trips)

// 这里我们修改 trips[0]，但不会影响到 d1.trips
trips[0] = ...
```

#### 返回 slices 或 maps

同样，请注意用户对暴露内部状态的 map 或 slice 的修改。

| Bad | Good |
| --- | --- |
|     |     |

```go
type Stats struct {
  mu sync.Mutex

  counters map[string]int
}

// Snapshot 返回当前状态。
func (s *Stats) Snapshot() map[string]int {
  s.mu.Lock()
  defer s.mu.Unlock()

  return s.counters
}

// snapshot 不再受互斥锁保护
// 因此对 snapshot 的任何访问都将受到数据竞争的影响
// 影响 stats.counters
snapshot := stats.Snapshot()
```

```go
type Stats struct {
  mu sync.Mutex

  counters map[string]int
}

func (s *Stats) Snapshot() map[string]int {
  s.mu.Lock()
  defer s.mu.Unlock()

  result := make(map[string]int, len(s.counters))
  for k, v := range s.counters {
    result[k] = v
  }
  return result
}

// snapshot 现在是一个拷贝
snapshot := stats.Snapshot()
```

### 使用 defer 释放资源

使用 defer 释放资源，诸如文件和锁。

| Bad | Good |
| --- | --- |
|     |     |

```go
p.Lock()
if p.count < 10 {
  p.Unlock()
  return p.count
}

p.count++
newCount := p.count
p.Unlock()

return newCount

// 当有多个 return 分支时，很容易遗忘 unlock
```

```go
p.Lock()
defer p.Unlock()

if p.count < 10 {
  return p.count
}

p.count++
return p.count

// 更可读
```

Defer 的开销非常小，只有在您可以证明函数执行时间处于纳秒级的程度时，才应避免这样做。使用 defer 提升可读性是值得的，因为使用它们的成本微不足道。尤其适用于那些不仅仅是简单内存访问的较大的方法，在这些方法中其他计算的资源消耗远超过 `defer`。

### Channel 的 size 要么是 1，要么是无缓冲的

channel 通常 size 应为 1 或是无缓冲的。默认情况下，channel 是无缓冲的，其 size 为零。任何其他尺寸都必须经过严格的审查。我们需要考虑如何确定大小，考虑是什么阻止了 channel 在高负载下和阻塞写时的写入，以及当这种情况发生时系统逻辑有哪些变化。(翻译解释：按照原文意思是需要界定通道边界，竞态条件，以及逻辑上下文梳理)

| Bad | Good |
| --- | --- |
|     |     |

```go
// 应该足以满足任何情况！
c := make(chan int, 64)
```

```go
// 大小：1
c := make(chan int, 1) // 或者
// 无缓冲 channel，大小为 0
c := make(chan int)
```

### 枚举从 1 开始

在 Go 中引入枚举的标准方法是声明一个自定义类型和一个使用了 iota 的 const 组。由于变量的默认值为 0，因此通常应以非零值开头枚举。

| Bad | Good |
| --- | --- |
|     |     |

```go
type Operation int

const (
  Add Operation = iota
  Subtract
  Multiply
)

// Add=0, Subtract=1, Multiply=2
```

```go
type Operation int

const (
  Add Operation = iota + 1
  Subtract
  Multiply
)

// Add=1, Subtract=2, Multiply=3
```

在某些情况下，使用零值是有意义的（枚举从零开始），例如，当零值是理想的默认行为时。

```go
type LogOutput int

const (
  LogToStdout LogOutput = iota
  LogToFile
  LogToRemote
)

// LogToStdout=0, LogToFile=1, LogToRemote=2
```

### 使用 time 处理时间

时间处理很复杂。关于时间的错误假设通常包括以下几点。

1.  一天有 24 小时
2.  一小时有 60 分钟
3.  一周有七天
4.  一年 365 天
5.  [还有更多](https://infiniteundo.com/post/25326999628/falsehoods-programmers-believe-about-time)

例如，_1_ 表示在一个时间点上加上 24 小时并不总是产生一个新的日历日。

因此，在处理时间时始终使用 [`&quot;time&quot;`](https://pkg.go.dev/time/) 包，因为它有助于以更安全、更准确的方式处理这些不正确的假设。

#### 使用 `time.Time` 表达瞬时时间

在处理时间的瞬间时使用 [`time.Time`](https://pkg.go.dev/time/#Time)，在比较、添加或减去时间时使用 `time.Time` 中的方法。

| Bad | Good |
| --- | --- |
|     |     |

```go
func isActive(now, start, stop int) bool {
  return start <= now && now < stop
}
```

```go
func isActive(now, start, stop time.Time) bool {
  return (start.Before(now) || start.Equal(now)) && now.Before(stop)
}
```

#### 使用 `time.Duration` 表达时间段

在处理时间段时使用 [`time.Duration`](https://pkg.go.dev/time/#Duration) .

| Bad | Good |
| --- | --- |
|     |     |

```go
func poll(delay int) {
  for {
    // ...
    time.Sleep(time.Duration(delay) * time.Millisecond)
  }
}
poll(10) // 是几秒钟还是几毫秒？
```

```go
func poll(delay time.Duration) {
  for {
    // ...
    time.Sleep(delay)
  }
}
poll(10*time.Second)
```

回到第一个例子，在一个时间瞬间加上 24 小时，我们用于添加时间的方法取决于意图。如果我们想要下一个日历日 (当前天的下一天) 的同一个时间点，我们应该使用 [`Time.AddDate`](https://pkg.go.dev/time/#Time.AddDate)。但是，如果我们想保证某一时刻比前一时刻晚 24 小时，我们应该使用 [`Time.Add`](https://pkg.go.dev/time/#Time.Add)。

```go
newDay := t.AddDate(0 /* years */, 0 /* months */, 1 /* days */)
maybeNewDay := t.Add(24 * time.Hour)
```

#### 对外部系统使用 `time.Time` 和 `time.Duration`

尽可能在与外部系统的交互中使用 `time.Duration` 和 `time.Time` 例如 :

*   Command-line 标志: [`flag`](https://pkg.go.dev/flag/) 通过 [`time.ParseDuration`](https://pkg.go.dev/time/#ParseDuration) 支持 `time.Duration`
*   JSON: [`encoding/json`](https://pkg.go.dev/encoding/json/) 通过其 [`UnmarshalJSON`](https://pkg.go.dev/time/#Time.UnmarshalJSON)​ [method](https://pkg.go.dev/time/#Time.UnmarshalJSON) 方法支持将 `time.Time` 编码为 [RFC 3339](https://tools.ietf.org/html/rfc3339) 字符串
*   SQL: [`database/sql`](https://pkg.go.dev/database/sql/) 支持将 `DATETIME` 或 `TIMESTAMP` 列转换为 `time.Time`，如果底层驱动程序支持则返回
*   YAML: [`gopkg.in/yaml.v2`](https://pkg.go.dev/gopkg.in/yaml.v2) 支持将 `time.Time` 作为 [RFC 3339](https://tools.ietf.org/html/rfc3339) 字符串，并通过 [`time.ParseDuration`](https://pkg.go.dev/time/#ParseDuration) 支持 `time.Duration`。

当不能在这些交互中使用 `time.Duration` 时，请使用 `int` 或 `float64`，并在字段名称中包含单位。

例如，由于 `encoding/json` 不支持 `time.Duration`，因此该单位包含在字段的名称中。

| Bad | Good |
| --- | --- |
|     |     |

```go
// {"interval": 2}
type Config struct {
  Interval int `json:"interval"`
}
```

```go
// {"intervalMillis": 2000}
type Config struct {
  IntervalMillis int `json:"intervalMillis"`
}
```

当在这些交互中不能使用 `time.Time` 时，除非达成一致，否则使用 `string` 和 [RFC 3339](https://tools.ietf.org/html/rfc3339) 中定义的格式时间戳。默认情况下，[`Time.UnmarshalText`](https://pkg.go.dev/time/#Time.UnmarshalText) 使用此格式，并可通过 [`time.RFC3339`](https://pkg.go.dev/time/#RFC3339) 在 `Time.Format` 和 `time.Parse` 中使用。

尽管这在实践中并不成问题，但请记住，`"time"` 包不支持解析闰秒时间戳（[8728](https://go.dev/issues/8728)），也不在计算中考虑闰秒（[15190](https://go.dev/issues/15190)）。如果您比较两个时间瞬间，则差异将不包括这两个瞬间之间可能发生的闰秒。

### Errors

#### 错误类型

声明错误的选项很少。 在选择最适合您的用例的选项之前，请考虑以下事项。

*   调用者是否需要匹配错误以便他们可以处理它？ 如果是，我们必须通过声明顶级错误变量或自定义类型来支持 [`errors.Is`](https://pkg.go.dev/errors/#Is) 或 [`errors.As`](https://pkg.go.dev/errors/#As) 函数。
*   错误消息是否为静态字符串，还是需要上下文信息的动态字符串？ 如果是静态字符串，我们可以使用 [`errors.New`](https://pkg.go.dev/errors/#New)，但对于后者，我们必须使用 [`fmt.Errorf`](https://pkg.go.dev/fmt/#Errorf) 或自定义错误类型。
*   我们是否正在传递由下游函数返回的新错误？ 如果是这样，请参阅[错误包装部分](#%E9%94%99%E8%AF%AF%E5%8C%85%E8%A3%85)。

| 错误匹配？ | 错误消息 | 指导  |
| --- | --- | --- |
| No  | static | [`errors.New`](https://pkg.go.dev/errors/#New) |
| No  | dynamic | [`fmt.Errorf`](https://pkg.go.dev/fmt/#Errorf) |
| Yes | static | top-level `var` with [`errors.New`](https://pkg.go.dev/errors/#New) |
| Yes | dynamic | custom `error` type |

例如， 使用 [`errors.New`](https://pkg.go.dev/errors/#New) 表示带有静态字符串的错误。 如果调用者需要匹配并处理此错误，则将此错误导出为变量以支持将其与 `errors.Is` 匹配。

| 无错误匹配 | 错误匹配 |
| --- | --- |
|     |     |

```go
// package foo

func Open() error {
  return errors.New("could not open")
}

// package bar

if err := foo.Open(); err != nil {
  // Can't handle the error.
  panic("unknown error")
}
```

```go
// package foo

var ErrCouldNotOpen = errors.New("could not open")

func Open() error {
  return ErrCouldNotOpen
}

// package bar

if err := foo.Open(); err != nil {
  if errors.Is(err, foo.ErrCouldNotOpen) {
    // handle the error
  } else {
    panic("unknown error")
  }
}
```

对于动态字符串的错误， 如果调用者不需要匹配它，则使用 [`fmt.Errorf`](https://pkg.go.dev/fmt/#Errorf)， 如果调用者确实需要匹配它，则自定义 `error`。

| 无错误匹配 | 错误匹配 |
| --- | --- |
|     |     |

```go
// package foo

func Open(file string) error {
  return fmt.Errorf("file %q not found", file)
}

// package bar

if err := foo.Open("testfile.txt"); err != nil {
  // Can't handle the error.
  panic("unknown error")
}
```

```go
// package foo

type NotFoundError struct {
  File string
}

func (e *NotFoundError) Error() string {
  return fmt.Sprintf("file %q not found", e.File)
}

func Open(file string) error {
  return &NotFoundError{File: file}
}


// package bar

if err := foo.Open("testfile.txt"); err != nil {
  var notFound *NotFoundError
  if errors.As(err, &notFound) {
    // handle the error
  } else {
    panic("unknown error")
  }
}
```

请注意，如果您从包中导出错误变量或类型， 它们将成为包的公共 API 的一部分。

#### 错误包装

如果调用其他方法时出现错误, 通常有三种处理方式可以选择：

*   将原始错误原样返回
*   使用 `fmt.Errorf` 搭配 `%w` 将错误添加进上下文后返回
*   使用 `fmt.Errorf` 搭配 `%v` 将错误添加进上下文后返回

如果没有要添加的其他上下文，则按原样返回原始错误。 这将保留原始错误类型和消息。 这非常适合底层错误消息有足够的信息来追踪它来自哪里的错误。

否则，尽可能在错误消息中添加上下文 这样就不会出现诸如“连接被拒绝”之类的模糊错误， 您会收到更多有用的错误，例如“调用服务 foo：连接被拒绝”。

使用 `fmt.Errorf` 为你的错误添加上下文， 根据调用者是否应该能够匹配和提取根本原因，在 `%w` 或 `%v` 动词之间进行选择。

*   如果调用者应该可以访问底层错误，请使用 `%w`。 对于大多数包装错误，这是一个很好的默认值， 但请注意，调用者可能会开始依赖此行为。因此，对于包装错误是已知`var`或类型的情况，请将其作为函数契约的一部分进行记录和测试。
*   使用 `%v` 来混淆底层错误。 调用者将无法匹配它，但如果需要，您可以在将来切换到 `%w`。

在为返回的错误添加上下文时，通过避免使用"failed to"之类的短语来保持上下文简洁，当错误通过堆栈向上渗透时，它会一层一层被堆积起来：

| Bad | Good |
| --- | --- |
|     |     |

```go
s, err := store.New()
if err != nil {
    return fmt.Errorf(
        "failed to create new store: %w", err)
}
```

```go
s, err := store.New()
if err != nil {
    return fmt.Errorf(
        "new store: %w", err)
}
```

```plain
failed to x: failed to y: failed to create new store: the error
```

```plain
x: y: new store: the error
```

然而，一旦错误被发送到另一个系统，应该清楚消息是一个错误（例如`err` 标签或日志中的"Failed"前缀）。

另见 [不要只检查错误，优雅地处理它们](https://dave.cheney.net/2016/04/27/dont-just-check-errors-handle-them-gracefully)。

#### 错误命名

对于存储为全局变量的错误值， 根据是否导出，使用前缀 `Err` 或 `err`。 请看指南 [对于未导出的顶层常量和变量，使用\_作为前缀](#%E5%AF%B9%E4%BA%8E%E6%9C%AA%E5%AF%BC%E5%87%BA%E7%9A%84%E9%A1%B6%E5%B1%82%E5%B8%B8%E9%87%8F%E5%92%8C%E5%8F%98%E9%87%8F%E4%BD%BF%E7%94%A8_%E4%BD%9C%E4%B8%BA%E5%89%8D%E7%BC%80)。

```go
var (
  // 导出以下两个错误，以便此包的用户可以将它们与 errors.Is 进行匹配。

  ErrBrokenLink = errors.New("link is broken")
  ErrCouldNotOpen = errors.New("could not open")

  // 这个错误没有被导出，因为我们不想让它成为我们公共 API 的一部分。 我们可能仍然在带有错误的包内使用它。

  errNotFound = errors.New("not found")
)
```

对于自定义错误类型，请改用后缀 `Error`。

```go
// 同样，这个错误被导出，以便这个包的用户可以将它与 errors.As 匹配。

type NotFoundError struct {
  File string
}

func (e *NotFoundError) Error() string {
  return fmt.Sprintf("file %q not found", e.File)
}

// 并且这个错误没有被导出，因为我们不想让它成为公共 API 的一部分。 我们仍然可以在带有 errors.As 的包中使用它。
type resolveError struct {
  Path string
}

func (e *resolveError) Error() string {
  return fmt.Sprintf("resolve %q", e.Path)
}
```

#### 一次处理错误

当调用方从被调用方接收到错误时，它可以根据对错误的了解，以各种不同的方式进行处理。

其中包括但不限于：

*   如果被调用者约定定义了特定的错误，则将错误与`errors.Is`或`errors.As`匹配，并以不同的方式处理分支
*   如果错误是可恢复的，则记录错误并正常降级
*   如果该错误表示特定于域的故障条件，则返回定义明确的错误
*   返回错误，无论是 [wrapped](#%E9%94%99%E8%AF%AF%E5%8C%85%E8%A3%85) 还是逐字逐句

无论调用方如何处理错误，它通常都应该只处理每个错误一次。例如，调用方不应该记录错误然后返回，因为\_its\_调用方也可能处理错误。

例如，考虑以下情况：

| Description | Code |
| --- | --- |
|     |     |

**Bad**: 记录错误并将其返回

堆栈中的调用程序可能会对该错误采取类似的操作。这样做会在应用程序日志中造成大量噪音，但收效甚微。

```go
u, err := getUser(id)
if err != nil {
  // BAD: See description
  log.Printf("Could not get user %q: %v", id, err)
  return err
}
```

**Good**: 将错误换行并返回

堆栈中更靠上的调用程序将处理该错误。使用`%w`可确保它们可以将错误与`errors.Is`或`errors.As`相匹配 （如果相关）。

```go
u, err := getUser(id)
if err != nil {
  return fmt.Errorf("get user %q: %w", id, err)
}
```

**Good**: 记录错误并正常降级

如果操作不是绝对必要的，我们可以通过从中恢复来提供降级但不间断的体验。

```go
if err := emitMetrics(); err != nil {
  // Failure to write metrics should not
  // break the application.
  log.Printf("Could not emit metrics: %v", err)
}
```

**Good**: 匹配错误并适当降级

如果被调用者在其约定中定义了一个特定的错误，并且失败是可恢复的，则匹配该错误案例并正常降级。对于所有其他案例，请包装错误并返回。

堆栈中更靠上的调用程序将处理其他错误。

```go
tz, err := getUserTimeZone(id)
if err != nil {
  if errors.Is(err, ErrUserNotFound) {
    // User doesn't exist. Use UTC.
    tz = time.UTC
  } else {
    return fmt.Errorf("get user %q: %w", id, err)
  }
}
```

### 处理断言失败

[类型断言](https://golang.org/ref/spec#Type_assertions) 将会在检测到不正确的类型时，以单一返回值形式返回 panic。 因此，请始终使用“逗号 ok”习语。

| Bad | Good |
| --- | --- |
|     |     |

```go
t := i.(string)
```

```go
t, ok := i.(string)
if !ok {
  // 优雅地处理错误
}
```

### 不要使用 panic

在生产环境中运行的代码必须避免出现 panic。panic 是 [级联失败](https://en.wikipedia.org/wiki/Cascading_failure) 的主要根源 。如果发生错误，该函数必须返回错误，并允许调用方决定如何处理它。

| Bad | Good |
| --- | --- |
|     |     |

```go
func run(args []string) {
  if len(args) == 0 {
    panic("an argument is required")
  }
  // ...
}

func main() {
  run(os.Args[1:])
}
```

```go
func run(args []string) error {
  if len(args) == 0 {
    return errors.New("an argument is required")
  }
  // ...
  return nil
}

func main() {
  if err := run(os.Args[1:]); err != nil {
    fmt.Fprintln(os.Stderr, err)
    os.Exit(1)
  }
}
```

panic/recover 不是错误处理策略。仅当发生不可恢复的事情（例如：nil 引用）时，程序才必须 panic。程序初始化是一个例外：程序启动时应使程序中止的不良情况可能会引起 panic。

```go
var _statusTemplate = template.Must(template.New("name").Parse("_statusHTML"))
```

即使在测试代码中，也优先使用`t.Fatal`或者`t.FailNow`而不是 panic 来确保失败被标记。

| Bad | Good |
| --- | --- |
|     |     |

```go
// func TestFoo(t *testing.T)

f, err := os.CreateTemp("", "test")
if err != nil {
  panic("failed to set up test")
}
```

```go
// func TestFoo(t *testing.T)

f, err := os.CreateTemp("", "test")
if err != nil {
  t.Fatal("failed to set up test")
}
```

### 使用 go.uber.org/atomic

使用 [sync/atomic](https://pkg.go.dev/sync/atomic/) 包的原子操作对原始类型 (`int32`, `int64`等）进行操作，因为很容易忘记使用原子操作来读取或修改变量。

[go.uber.org/atomic](https://pkg.go.dev/go.uber.org/atomic) 通过隐藏基础类型为这些操作增加了类型安全性。此外，它包括一个方便的`atomic.Bool`类型。

| Bad | Good |
| --- | --- |
|     |     |

```go
type foo struct {
  running int32  // atomic
}

func (f* foo) start() {
  if atomic.SwapInt32(&f.running, 1) == 1 {
     // already running…
     return
  }
  // start the Foo
}

func (f *foo) isRunning() bool {
  return f.running == 1  // race!
}
```

```go
type foo struct {
  running atomic.Bool
}

func (f *foo) start() {
  if f.running.Swap(true) {
     // already running…
     return
  }
  // start the Foo
}

func (f *foo) isRunning() bool {
  return f.running.Load()
}
```

### 避免可变全局变量

使用选择依赖注入方式避免改变全局变量。 既适用于函数指针又适用于其他值类型

| Bad | Good |
| --- | --- |
|     |     |

```go
// sign.go
var _timeNow = time.Now
func sign(msg string) string {
  now := _timeNow()
  return signWithTime(msg, now)
}
```

```go
// sign.go
type signer struct {
  now func() time.Time
}
func newSigner() *signer {
  return &signer{
    now: time.Now,
  }
}
func (s *signer) Sign(msg string) string {
  now := s.now()
  return signWithTime(msg, now)
}
```

```go
// sign_test.go
func TestSign(t *testing.T) {
  oldTimeNow := _timeNow
  _timeNow = func() time.Time {
    return someFixedTime
  }
  defer func() { _timeNow = oldTimeNow }()
  assert.Equal(t, want, sign(give))
}
```

```go
// sign_test.go
func TestSigner(t *testing.T) {
  s := newSigner()
  s.now = func() time.Time {
    return someFixedTime
  }
  assert.Equal(t, want, s.Sign(give))
}
```

### 避免在公共结构中嵌入类型

这些嵌入的类型泄漏实现细节、禁止类型演化和模糊的文档。

假设您使用共享的 `AbstractList` 实现了多种列表类型，请避免在具体的列表实现中嵌入 `AbstractList`。 相反，只需手动将方法写入具体的列表，该列表将委托给抽象列表。

```go
type AbstractList struct {}
// 添加将实体添加到列表中。
func (l *AbstractList) Add(e Entity) {
  // ...
}
// 移除从列表中移除实体。
func (l *AbstractList) Remove(e Entity) {
  // ...
}
```

| Bad | Good |
| --- | --- |
|     |     |

```go
// ConcreteList 是一个实体列表。
type ConcreteList struct {
  *AbstractList
}
```

```go
// ConcreteList 是一个实体列表。
type ConcreteList struct {
  list *AbstractList
}
// 添加将实体添加到列表中。
func (l *ConcreteList) Add(e Entity) {
  l.list.Add(e)
}
// 移除从列表中移除实体。
func (l *ConcreteList) Remove(e Entity) {
  l.list.Remove(e)
}
```

Go 允许 [类型嵌入](https://golang.org/doc/effective_go.html#embedding) 作为继承和组合之间的折衷。外部类型获取嵌入类型的方法的隐式副本。默认情况下，这些方法委托给嵌入实例的同一方法。

结构还获得与类型同名的字段。 所以，如果嵌入的类型是 public，那么字段是 public。为了保持向后兼容性，外部类型的每个未来版本都必须保留嵌入类型。

很少需要嵌入类型。 这是一种方便，可以帮助您避免编写冗长的委托方法。

即使嵌入兼容的抽象列表 _interface_，而不是结构体，这将为开发人员提供更大的灵活性来改变未来，但仍然泄露了具体列表使用抽象实现的细节。

| Bad | Good |
| --- | --- |
|     |     |

```go
// AbstractList 是各种实体列表的通用实现。
type AbstractList interface {
  Add(Entity)
  Remove(Entity)
}
// ConcreteList 是一个实体列表。
type ConcreteList struct {
  AbstractList
}
```

```go
// ConcreteList 是一个实体列表。
type ConcreteList struct {
  list AbstractList
}
// 添加将实体添加到列表中。
func (l *ConcreteList) Add(e Entity) {
  l.list.Add(e)
}
// 移除从列表中移除实体。
func (l *ConcreteList) Remove(e Entity) {
  l.list.Remove(e)
}
```

无论是使用嵌入结构还是嵌入接口，都会限制类型的演化。

*   向嵌入接口添加方法是一个破坏性的改变。
*   从嵌入结构体删除方法是一个破坏性改变。
*   删除嵌入类型是一个破坏性的改变。
*   即使使用满足相同接口的类型替换嵌入类型，也是一个破坏性的改变。

尽管编写这些委托方法是乏味的，但是额外的工作隐藏了实现细节，留下了更多的更改机会，还消除了在文档中发现完整列表接口的间接性操作。

### 避免使用内置名称

Go [语言规范](https://golang.org/ref/spec) 概述了几个内置的， 不应在 Go 项目中使用的 [预先声明的标识符](https://golang.org/ref/spec#Predeclared_identifiers)。

根据上下文的不同，将这些标识符作为名称重复使用， 将在当前作用域（或任何嵌套作用域）中隐藏原始标识符，或者混淆代码。 在最好的情况下，编译器会报错；在最坏的情况下，这样的代码可能会引入潜在的、难以恢复的错误。

| Bad | Good |
| --- | --- |
|     |     |

```go
var error string
// `error` 作用域隐式覆盖

// or

func handleErrorMessage(error string) {
    // `error` 作用域隐式覆盖
}
```

```go
var errorMessage string
// `error` 指向内置的非覆盖

// or

func handleErrorMessage(msg string) {
    // `error` 指向内置的非覆盖
}
```

```go
type Foo struct {
    // 虽然这些字段在技术上不构成阴影，但`error`或`string`字符串的重映射现在是不明确的。
    error  error
    string string
}

func (f Foo) Error() error {
    // `error` 和 `f.error` 在视觉上是相似的
    return f.error
}

func (f Foo) String() string {
    // `string` and `f.string` 在视觉上是相似的
    return f.string
}
```

```go
type Foo struct {
    // `error` and `string` 现在是明确的。
    err error
    str string
}

func (f Foo) Error() error {
    return f.err
}

func (f Foo) String() string {
    return f.str
}
```

注意，编译器在使用预先分隔的标识符时不会生成错误， 但是诸如`go vet`之类的工具会正确地指出这些和其他情况下的隐式问题。

### 避免使用 `init()`

尽可能避免使用`init()`。当`init()`是不可避免或可取的，代码应先尝试：

1.  无论程序环境或调用如何，都要完全确定。
2.  避免依赖于其他`init()`函数的顺序或副作用。虽然`init()`顺序是明确的，但代码可以更改， 因此`init()`函数之间的关系可能会使代码变得脆弱和容易出错。
3.  避免访问或操作全局或环境状态，如机器信息、环境变量、工作目录、程序参数/输入等。
4.  避免`I/O`，包括文件系统、网络和系统调用。

不能满足这些要求的代码可能属于要作为`main()`调用的一部分（或程序生命周期中的其他地方）， 或者作为`main()`本身的一部分写入。特别是，打算由其他程序使用的库应该特别注意完全确定性， 而不是执行“init magic”

| Bad | Good |
| --- | --- |
|     |     |

```go
type Foo struct {
    // ...
}
var _defaultFoo Foo
func init() {
    _defaultFoo = Foo{
        // ...
    }
}
```

```go
var _defaultFoo = Foo{
    // ...
}
// or，为了更好的可测试性：
var _defaultFoo = defaultFoo()
func defaultFoo() Foo {
    return Foo{
        // ...
    }
}
```

```go
type Config struct {
    // ...
}
var _config Config
func init() {
    // Bad: 基于当前目录
    cwd, _ := os.Getwd()
    // Bad: I/O
    raw, _ := os.ReadFile(
        path.Join(cwd, "config", "config.yaml"),
    )
    yaml.Unmarshal(raw, &_config)
}
```

```go
type Config struct {
    // ...
}
func loadConfig() Config {
    cwd, err := os.Getwd()
    // handle err
    raw, err := os.ReadFile(
        path.Join(cwd, "config", "config.yaml"),
    )
    // handle err
    var config Config
    yaml.Unmarshal(raw, &config)
    return config
}
```

考虑到上述情况，在某些情况下，`init()`可能更可取或是必要的，可能包括：

*   不能表示为单个赋值的复杂表达式。
*   可插入的钩子，如`database/sql`、编码类型注册表等。
*   对 [Google Cloud Functions](https://cloud.google.com/functions/docs/bestpractices/tips#use_global_variables_to_reuse_objects_in_future_invocations) 和其他形式的确定性预计算的优化。

### 追加时优先指定切片容量

追加时优先指定切片容量

在尽可能的情况下，在初始化要追加的切片时为`make()`提供一个容量值。

| Bad | Good |
| --- | --- |
|     |     |

```go
for n := 0; n < b.N; n++ {
  data := make([]int, 0)
  for k := 0; k < size; k++{
    data = append(data, k)
  }
}
```

```go
for n := 0; n < b.N; n++ {
  data := make([]int, 0, size)
  for k := 0; k < size; k++{
    data = append(data, k)
  }
}
```

```
BenchmarkBad-4    100000000    2.48s
```

```
BenchmarkGood-4   100000000    0.21s
```

### 主函数退出方式 (Exit)

Go 程序使用 [`os.Exit`](https://pkg.go.dev/os/#Exit) 或者 [`log.Fatal\*`](https://pkg.go.dev/log/#Fatal) 立即退出 (使用`panic`不是退出程序的好方法，请 [不要使用 panic](#%E4%B8%8D%E8%A6%81%E4%BD%BF%E7%94%A8-panic)。)

**仅在**​**​**​**​`main()`​**​**​** 中调用其中一个 `os.Exit` 或者 `log.Fatal*`。所有其他函数应将错误返回到信号失败中。

| Bad | Good |
| --- | --- |
|     |     |

```go
func main() {
  body := readFile(path)
  fmt.Println(body)
}
func readFile(path string) string {
  f, err := os.Open(path)
  if err != nil {
    log.Fatal(err)
  }
  b, err := os.ReadAll(f)
  if err != nil {
    log.Fatal(err)
  }
  return string(b)
}
```

```go
func main() {
  body, err := readFile(path)
  if err != nil {
    log.Fatal(err)
  }
  fmt.Println(body)
}
func readFile(path string) (string, error) {
  f, err := os.Open(path)
  if err != nil {
    return "", err
  }
  b, err := os.ReadAll(f)
  if err != nil {
    return "", err
  }
  return string(b), nil
}
```

原则上：退出的具有多种功能的程序存在一些问题：

*   不明显的控制流：任何函数都可以退出程序，因此很难对控制流进行推理。
*   难以测试：退出程序的函数也将退出调用它的测试。这使得函数很难测试，并引入了跳过 `go test` 尚未运行的其他测试的风险。
*   跳过清理：当函数退出程序时，会跳过已经进入`defer`队列里的函数调用。这增加了跳过重要清理任务的风险。

#### 一次性退出

如果可能的话，你的`main（）`函数中 **最多一次** 调用 `os.Exit`或者`log.Fatal`。如果有多个错误场景停止程序执行，请将该逻辑放在单独的函数下并从中返回错误。 这会缩短 `main()` 函数，并将所有关键业务逻辑放入一个单独的、可测试的函数中。

| Bad | Good |
| --- | --- |
|     |     |

```go
package main
func main() {
  args := os.Args[1:]
  if len(args) != 1 {
    log.Fatal("missing file")
  }
  name := args[0]
  f, err := os.Open(name)
  if err != nil {
    log.Fatal(err)
  }
  defer f.Close()
  // 如果我们调用 log.Fatal 在这条线之后
  // f.Close 将会被执行。
  b, err := os.ReadAll(f)
  if err != nil {
    log.Fatal(err)
  }
  // ...
}
```

```go
package main
func main() {
  if err := run(); err != nil {
    log.Fatal(err)
  }
}
func run() error {
  args := os.Args[1:]
  if len(args) != 1 {
    return errors.New("missing file")
  }
  name := args[0]
  f, err := os.Open(name)
  if err != nil {
    return err
  }
  defer f.Close()
  b, err := os.ReadAll(f)
  if err != nil {
    return err
  }
  // ...
}
```

上面的示例使用`log.Fatal`，但该指南也适用于`os.Exit`或任何调用`os.Exit`的库代码。

```go
func main() {
  if err := run(); err != nil {
    fmt.Fprintln(os.Stderr, err)
    os.Exit(1)
  }
}
```

您可以根据需要更改`run()`的签名。例如，如果您的程序必须使用特定的失败退出代码退出，`run()`可能会返回退出代码而不是错误。这也允许单元测试直接验证此行为。

```go
func main() {
  os.Exit(run(args))
}

func run() (exitCode int) {
  // ...
}
```

请注意，这些示例中使用的`run()`函数并不是强制性的。 `run()`函数的名称、签名和设置具有灵活性。除其他外，您可以：

*   接受未分析的命令行参数 (e.g., `run(os.Args[1:])`)
*   解析`main()`中的命令行参数并将其传递到`run`
*   使用自定义错误类型将退出代码传回`main（）`
*   将业务逻辑置于不同的抽象层 `package main`

本指南只要求在`main()`中有一个位置负责实际的退出流程。

### 在序列化结构中使用字段标记

任何序列化到JSON、YAML、， 或其他支持基于标记的字段命名的格式应使用相关标记进行注释。

| Bad | Good |
| --- | --- |
|     |     |

```go
type Stock struct {
  Price int
  Name  string
}
bytes, err := json.Marshal(Stock{
  Price: 137,
  Name:  "UBER",
})
```

```go
type Stock struct {
  Price int    `json:"price"`
  Name  string `json:"name"`
  // Safe to rename Name to Symbol.
}
bytes, err := json.Marshal(Stock{
  Price: 137,
  Name:  "UBER",
})
```

理论上： 结构的序列化形式是不同系统之间的契约。 对序列化表单结构（包括字段名）的更改会破坏此约定。在标记中指定字段名使约定明确， 它还可以通过重构或重命名字段来防止意外违反约定。

### 不要一劳永逸地使用 goroutine

Goroutines 是轻量级的，但它们不是免费的： 至少，它们会为堆栈和 CPU 的调度消耗内存。 虽然这些成本对于 Goroutines 的使用来说很小，但当它们在没有受控生命周期的情况下大量生成时会导致严重的性能问题。 具有非托管生命周期的 Goroutines 也可能导致其他问题，例如防止未使用的对象被垃圾回收并保留不再使用的资源。

因此，不要在代码中泄漏 goroutine。 使用 [go.uber.org/goleak](https://pkg.go.dev/go.uber.org/goleak) 来测试可能产生 goroutine 的包内的 goroutine 泄漏。

一般来说，每个 goroutine:

*   必须有一个可预测的停止运行时间； 或者
*   必须有一种方法可以向 goroutine 发出信号它应该停止

在这两种情况下，都必须有一种方式代码来阻塞并等待 goroutine 完成。

For example:

| Bad | Good |
| --- | --- |
|     |     |

```go
go func() {
  for {
    flush()
    time.Sleep(delay)
  }
}()
```

```go
var (
  stop = make(chan struct{}) // 告诉 goroutine 停止
  done = make(chan struct{}) // 告诉我们 goroutine 退出了
)
go func() {
  defer close(done)
  ticker := time.NewTicker(delay)
  defer ticker.Stop()
  for {
    select {
    case <-tick.C:
      flush()
    case <-stop:
      return
    }
  }
}()
// 其它...
close(stop)  // 指示 goroutine 停止
<-done       // and wait for it to exit
```

没有办法阻止这个 goroutine。这将一直运行到应用程序退出。

这个 goroutine 可以用 `close(stop)`, 我们可以等待它退出 `<-done`.

#### 等待 goroutines 退出

给定一个由系统生成的 goroutine， 必须有一种方案能等待 goroutine 的退出。 有两种常用的方法可以做到这一点：

*   使用 `sync.WaitGroup`. 如果您要等待多个 goroutine，请执行此操作
    
    ```go
    var wg sync.WaitGroup
    for i := 0; i < N; i++ {
      wg.Add(1)
      go func() {
        defer wg.Done()
        // ...
      }()
    }
    
    // To wait for all to finish:
    wg.Wait()
    ```
    
*   添加另一个 `chan struct{}`，goroutine 完成后会关闭它。 如果只有一个 goroutine，请执行此操作。
    
    ```go
    done := make(chan struct{})
    go func() {
      defer close(done)
      // ...
    }()
    
    // To wait for the goroutine to finish:
    <-done
    ```
    

#### 不要在 `init()` 使用 goroutines

`init()` 函数不应该产生 goroutines。 另请参阅 [避免使用 init()](#%E9%81%BF%E5%85%8D%E4%BD%BF%E7%94%A8-init)。

如果一个包需要一个后台 goroutine， 它必须公开一个负责管理 goroutine 生命周期的对象。 该对象必须提供一个方法（`Close`、`Stop`、`Shutdown` 等）来指示后台 goroutine 停止并等待它的退出。

| Bad | Good |
| --- | --- |
|     |     |

```go
func init() {
  go doWork()
}
func doWork() {
  for {
    // ...
  }
}
```

```go
type Worker struct{ /* ... */ }
func NewWorker(...) *Worker {
  w := &Worker{
    stop: make(chan struct{}),
    done: make(chan struct{}),
    // ...
  }
  go w.doWork()
}
func (w *Worker) doWork() {
  defer close(w.done)
  for {
    // ...
    case <-w.stop:
      return
  }
}
// Shutdown 告诉 worker 停止
// 并等待它完成。
func (w *Worker) Shutdown() {
  close(w.stop)
  <-w.done
}
```

当用户导出这个包时，无条件地生成一个后台 goroutine。 用户无法控制 goroutine 或停止它的方法。

仅当用户请求时才生成工作人员。 提供一种关闭工作器的方法，以便用户可以释放工作器使用的资源。

请注意，如果工作人员管理多个 goroutine，则应使用`WaitGroup`。 请参阅 [等待 goroutines 退出](#%E7%AD%89%E5%BE%85-goroutines-%E9%80%80%E5%87%BA)。

性能
--

性能方面的特定准则只适用于高频场景。

### 优先使用 strconv 而不是 fmt

将原语转换为字符串或从字符串转换时，`strconv`速度比`fmt`快。

| Bad | Good |
| --- | --- |
|     |     |

```go
for i := 0; i < b.N; i++ {
  s := fmt.Sprint(rand.Int())
}
```

```go
for i := 0; i < b.N; i++ {
  s := strconv.Itoa(rand.Int())
}
```

```plain
BenchmarkFmtSprint-4    143 ns/op    2 allocs/op
```

```plain
BenchmarkStrconv-4    64.2 ns/op    1 allocs/op
```

### 避免字符串到字节的转换

不要反复从固定字符串创建字节 slice。相反，请执行一次转换并捕获结果。

| Bad | Good |
| --- | --- |
|     |     |

```go
for i := 0; i < b.N; i++ {
  w.Write([]byte("Hello world"))
}
```

```go
data := []byte("Hello world")
for i := 0; i < b.N; i++ {
  w.Write(data)
}
```

```plain
BenchmarkBad-4   50000000   22.2 ns/op
```

```plain
BenchmarkGood-4  500000000   3.25 ns/op
```

### 指定容器容量

尽可能指定容器容量，以便为容器预先分配内存。这将在添加元素时最小化后续分配（通过复制和调整容器大小）。

#### 指定 Map 容量提示

在尽可能的情况下，在使用 `make()` 初始化的时候提供容量信息

```go
make(map[T1]T2, hint)
```

向`make()`提供容量提示会在初始化时尝试调整 map 的大小，这将减少在将元素添加到 map 时为 map 重新分配内存。

注意，与 slices 不同。map 容量提示并不保证完全的、预先的分配，而是用于估计所需的 hashmap bucket 的数量。 因此，在将元素添加到 map 时，甚至在指定 map 容量时，仍可能发生分配。

| Bad | Good |
| --- | --- |
|     |     |

```go
m := make(map[string]os.FileInfo)

files, _ := os.ReadDir("./files")
for _, f := range files {
    m[f.Name()] = f
}
```

```go

files, _ := os.ReadDir("./files")

m := make(map[string]os.FileInfo, len(files))
for _, f := range files {
    m[f.Name()] = f
}
```

`m` 是在没有大小提示的情况下创建的； 在运行时可能会有更多分配。

`m` 是有大小提示创建的；在运行时可能会有更少的分配。

#### 指定切片容量

在尽可能的情况下，在使用`make()`初始化切片时提供容量信息，特别是在追加切片时。

```go
make([]T, length, capacity)
```

与 maps 不同，slice capacity 不是一个提示：编译器将为提供给`make()`的 slice 的容量分配足够的内存， 这意味着后续的`append()`操作将导致零分配（直到 slice 的长度与容量匹配，在此之后，任何 append 都可能调整大小以容纳其他元素）。

| Bad | Good |
| --- | --- |
|     |     |

```go
for n := 0; n < b.N; n++ {
  data := make([]int, 0)
  for k := 0; k < size; k++{
    data = append(data, k)
  }
}
```

```go
for n := 0; n < b.N; n++ {
  data := make([]int, 0, size)
  for k := 0; k < size; k++{
    data = append(data, k)
  }
}
```

```
BenchmarkBad-4    100000000    2.48s
```

```
BenchmarkGood-4   100000000    0.21s
```

规范
--

### 避免过长的行

避免使用需要读者水平滚动或过度转动头部的代码行。

我们建议将行长度限制为 **99 characters** (99 个字符). 作者应该在达到这个限制之前换行， 但这不是硬性限制。 允许代码超过此限制。

### 一致性

本文中概述的一些标准都是客观性的评估，是根据场景、上下文、或者主观性的判断；

但是最重要的是，**保持一致**.

一致性的代码更容易维护、是更合理的、需要更少的学习成本、并且随着新的约定出现或者出现错误后更容易迁移、更新、修复 bug

相反，在一个代码库中包含多个完全不同或冲突的代码风格会导致维护成本开销、不确定性和认知偏差。所有这些都会直接导致速度降低、代码审查痛苦、而且增加 bug 数量。

将这些标准应用于代码库时，建议在 package（或更大）级别进行更改，子包级别的应用程序通过将多个样式引入到同一代码中，违反了上述关注点。

### 相似的声明放在一组

Go 语言支持将相似的声明放在一个组内。

| Bad | Good |
| --- | --- |
|     |     |

```go
import "a"
import "b"
```

```go
import (
  "a"
  "b"
)
```

这同样适用于常量、变量和类型声明：

| Bad | Good |
| --- | --- |
|     |     |

```go

const a = 1
const b = 2

var a = 1
var b = 2

type Area float64
type Volume float64
```

```go
const (
  a = 1
  b = 2
)

var (
  a = 1
  b = 2
)

type (
  Area float64
  Volume float64
)
```

仅将相关的声明放在一组。不要将不相关的声明放在一组。

| Bad | Good |
| --- | --- |
|     |     |

```go
type Operation int

const (
  Add Operation = iota + 1
  Subtract
  Multiply
  EnvVar = "MY_ENV"
)
```

```go
type Operation int

const (
  Add Operation = iota + 1
  Subtract
  Multiply
)

const EnvVar = "MY_ENV"
```

分组使用的位置没有限制，例如：你可以在函数内部使用它们：

| Bad | Good |
| --- | --- |
|     |     |

```go
func f() string {
  red := color.New(0xff0000)
  green := color.New(0x00ff00)
  blue := color.New(0x0000ff)

  ...
}
```

```go
func f() string {
  var (
    red   = color.New(0xff0000)
    green = color.New(0x00ff00)
    blue  = color.New(0x0000ff)
  )

  ...
}
```

例外：如果变量声明与其他变量相邻，则应将变量声明（尤其是函数内部的声明）分组在一起。对一起声明的变量执行此操作，即使它们不相关。

| Bad | Good |
| --- | --- |
|     |     |

```go
func (c *client) request() {
  caller := c.name
  format := "json"
  timeout := 5*time.Second
  var err error
  // ...
}
```

```go
func (c *client) request() {
  var (
    caller  = c.name
    format  = "json"
    timeout = 5*time.Second
    err error
  )
  // ...
}
```

### import 分组

导入应该分为两组：

*   标准库
*   其他库

默认情况下，这是 goimports 应用的分组。

| Bad | Good |
| --- | --- |
|     |     |

```go
import (
  "fmt"
  "os"
  "go.uber.org/atomic"
  "golang.org/x/sync/errgroup"
)
```

```go
import (
  "fmt"
  "os"

  "go.uber.org/atomic"
  "golang.org/x/sync/errgroup"
)
```

### 包名

当命名包时，请按下面规则选择一个名称：

*   全部小写。没有大写或下划线。
*   大多数使用命名导入的情况下，不需要重命名。
*   简短而简洁。请记住，在每个使用的地方都完整标识了该名称。
*   不用复数。例如`net/url`，而不是`net/urls`。
*   不要用“common”，“util”，“shared”或“lib”。这些是不好的，信息量不足的名称。

另请参阅 [Go 包命名规则](https://go.dev/blog/package-names) 和 [Go 包样式指南](https://rakyll.org/style-packages/).

### 函数名

我们遵循 Go 社区关于使用 [MixedCaps 作为函数名](https://golang.org/doc/effective_go.html#mixed-caps) 的约定。有一个例外，为了对相关的测试用例进行分组，函数名可能包含下划线，如：`TestMyFunction_WhatIsBeingTested`.

### 导入别名

如果程序包名称与导入路径的最后一个元素不匹配，则必须使用导入别名。

```go
import (
  "net/http"

  client "example.com/client-go"
  trace "example.com/trace/v2"
)
```

在所有其他情况下，除非导入之间有直接冲突，否则应避免导入别名。

| Bad | Good |
| --- | --- |
|     |     |

```go
import (
  "fmt"
  "os"

  nettrace "golang.net/x/trace"
)
```

```go
import (
  "fmt"
  "os"
  "runtime/trace"

  nettrace "golang.net/x/trace"
)
```

### 函数分组与顺序

*   函数应按粗略的调用顺序排序。
*   同一文件中的函数应按接收者分组。

因此，导出的函数应先出现在文件中，放在`struct`, `const`, `var`定义的后面。

在定义类型之后，但在接收者的其余方法之前，可能会出现一个 `newXYZ()`/`NewXYZ()`

由于函数是按接收者分组的，因此普通工具函数应在文件末尾出现。

| Bad | Good |
| --- | --- |
|     |     |

```go
func (s *something) Cost() {
  return calcCost(s.weights)
}

type something struct{ ... }

func calcCost(n []int) int {...}

func (s *something) Stop() {...}

func newSomething() *something {
    return &something{}
}
```

```go
type something struct{ ... }

func newSomething() *something {
    return &something{}
}

func (s *something) Cost() {
  return calcCost(s.weights)
}

func (s *something) Stop() {...}

func calcCost(n []int) int {...}
```

### 减少嵌套

代码应通过尽可能先处理错误情况/特殊情况并尽早返回或继续循环来减少嵌套。减少嵌套多个级别的代码的代码量。

| Bad | Good |
| --- | --- |
|     |     |

```go
for _, v := range data {
  if v.F1 == 1 {
    v = process(v)
    if err := v.Call(); err == nil {
      v.Send()
    } else {
      return err
    }
  } else {
    log.Printf("Invalid v: %v", v)
  }
}
```

```go
for _, v := range data {
  if v.F1 != 1 {
    log.Printf("Invalid v: %v", v)
    continue
  }

  v = process(v)
  if err := v.Call(); err != nil {
    return err
  }
  v.Send()
}
```

### 不必要的 else

如果在 if 的两个分支中都设置了变量，则可以将其替换为单个 if。

| Bad | Good |
| --- | --- |
|     |     |

```go
var a int
if b {
  a = 100
} else {
  a = 10
}
```

```go
a := 10
if b {
  a = 100
}
```

### 顶层变量声明

在顶层，使用标准`var`关键字。请勿指定类型，除非它与表达式的类型不同。

| Bad | Good |
| --- | --- |
|     |     |

```go
var _s string = F()

func F() string { return "A" }
```

```go
var _s = F()
// 由于 F 已经明确了返回一个字符串类型，因此我们没有必要显式指定_s 的类型
// 还是那种类型

func F() string { return "A" }
```

如果表达式的类型与所需的类型不完全匹配，请指定类型。

```go
type myError struct{}

func (myError) Error() string { return "error" }

func F() myError { return myError{} }

var _e error = F()
// F 返回一个 myError 类型的实例，但是我们要 error 类型
```

### 对于未导出的顶层常量和变量，使用\_作为前缀

在未导出的顶级`vars`和`consts`， 前面加上前缀\_，以使它们在使用时明确表示它们是全局符号。

基本依据：顶级变量和常量具有包范围作用域。使用通用名称可能很容易在其他文件中意外使用错误的值。

| Bad | Good |
| --- | --- |
|     |     |

```go
// foo.go

const (
  defaultPort = 8080
  defaultUser = "user"
)

// bar.go

func Bar() {
  defaultPort := 9090
  ...
  fmt.Println("Default port", defaultPort)

  // We will not see a compile error if the first line of
  // Bar() is deleted.
}
```

```go
// foo.go

const (
  _defaultPort = 8080
  _defaultUser = "user"
)
```

**例外**：未导出的错误值可以使用不带下划线的前缀 `err`。 参见[错误命名](#%E9%94%99%E8%AF%AF%E5%91%BD%E5%90%8D)。

### 结构体中的嵌入

嵌入式类型（例如 mutex）应位于结构体内的字段列表的顶部，并且必须有一个空行将嵌入式字段与常规字段分隔开。

| Bad | Good |
| --- | --- |
|     |     |

```go
type Client struct {
  version int
  http.Client
}
```

```go
type Client struct {
  http.Client

  version int
}
```

内嵌应该提供切实的好处，比如以语义上合适的方式添加或增强功能。 它应该在对用户没有任何不利影响的情况下使用。（另请参见：[避免在公共结构中嵌入类型](#%E9%81%BF%E5%85%8D%E5%9C%A8%E5%85%AC%E5%85%B1%E7%BB%93%E6%9E%84%E4%B8%AD%E5%B5%8C%E5%85%A5%E7%B1%BB%E5%9E%8B#)）。

例外：即使在未导出类型中，Mutex 也不应该作为内嵌字段。另请参见：[零值 Mutex 是有效的](#%E9%9B%B6%E5%80%BC-mutex-%E6%98%AF%E6%9C%89%E6%95%88%E7%9A%84#)。

嵌入 **不应该**:

*   纯粹是为了美观或方便。
*   使外部类型更难构造或使用。
*   影响外部类型的零值。如果外部类型有一个有用的零值，则在嵌入内部类型之后应该仍然有一个有用的零值。
*   作为嵌入内部类型的副作用，从外部类型公开不相关的函数或字段。
*   公开未导出的类型。
*   影响外部类型的复制形式。
*   更改外部类型的 API 或类型语义。
*   嵌入内部类型的非规范形式。
*   公开外部类型的实现详细信息。
*   允许用户观察或控制类型内部。
*   通过包装的方式改变内部函数的一般行为，这种包装方式会给用户带来一些意料之外情况。

简单地说，有意识地和有目的地嵌入。一种很好的测试体验是， "是否所有这些导出的内部方法/字段都将直接添加到外部类型" 如果答案是`some`或`no`，不要嵌入内部类型 - 而是使用字段。

| Bad | Good |
| --- | --- |
|     |     |

```go
type A struct {
    // Bad: A.Lock() and A.Unlock() 现在可用
    // 不提供任何功能性好处，并允许用户控制有关 A 的内部细节。
    sync.Mutex
}
```

```go
type countingWriteCloser struct {
    // Good: Write() 在外层提供用于特定目的，
    // 并且委托工作到内部类型的 Write() 中。
    io.WriteCloser
    count int
}
func (w *countingWriteCloser) Write(bs []byte) (int, error) {
    w.count += len(bs)
    return w.WriteCloser.Write(bs)
}
```

```go
type Book struct {
    // Bad: 指针更改零值的有用性
    io.ReadWriter
    // other fields
}
// later
var b Book
b.Read(...)  // panic: nil pointer
b.String()   // panic: nil pointer
b.Write(...) // panic: nil pointer
```

```go
type Book struct {
    // Good: 有用的零值
    bytes.Buffer
    // other fields
}
// later
var b Book
b.Read(...)  // ok
b.String()   // ok
b.Write(...) // ok
```

```go
type Client struct {
    sync.Mutex
    sync.WaitGroup
    bytes.Buffer
    url.URL
}
```

```go
type Client struct {
    mtx sync.Mutex
    wg  sync.WaitGroup
    buf bytes.Buffer
    url url.URL
}
```

### 本地变量声明

如果将变量明确设置为某个值，则应使用短变量声明形式 (`:=`)。

| Bad | Good |
| --- | --- |
|     |     |

```go
var s = "foo"
```

```go
s := "foo"
```

但是，在某些情况下，`var` 使用关键字时默认值会更清晰。例如，[声明空切片](https://go.dev/wiki/CodeReviewComments#declaring-empty-slices)。

| Bad | Good |
| --- | --- |
|     |     |

```go
func f(list []int) {
  filtered := []int{}
  for _, v := range list {
    if v > 10 {
      filtered = append(filtered, v)
    }
  }
}
```

```go
func f(list []int) {
  var filtered []int
  for _, v := range list {
    if v > 10 {
      filtered = append(filtered, v)
    }
  }
}
```

### nil 是一个有效的 slice

`nil` 是一个有效的长度为 0 的 slice，这意味着，

*   您不应明确返回长度为零的切片。应该返回`nil` 来代替。
    
    | Bad | Good |
    | --- | --- |
    |     |     |
    
    ```go
    if x == "" {
      return []int{}
    }
    ```
    
    ```go
    if x == "" {
      return nil
    }
    ```
    
*   要检查切片是否为空，请始终使用`len(s) == 0`。而非 `nil`。
    
    | Bad | Good |
    | --- | --- |
    |     |     |
    
    ```go
    func isEmpty(s []string) bool {
      return s == nil
    }
    ```
    
    ```go
    func isEmpty(s []string) bool {
      return len(s) == 0
    }
    ```
    
*   零值切片（用`var`声明的切片）可立即使用，无需调用`make()`创建。
    
    | Bad | Good |
    | --- | --- |
    |     |     |
    
    ```go
    nums := []int{}
    // or, nums := make([]int)
    
    if add1 {
      nums = append(nums, 1)
    }
    
    if add2 {
      nums = append(nums, 2)
    }
    ```
    
    ```go
    var nums []int
    
    if add1 {
      nums = append(nums, 1)
    }
    
    if add2 {
      nums = append(nums, 2)
    }
    ```
    

记住，虽然 nil 切片是有效的切片，但它不等于长度为 0 的切片（一个为 nil，另一个不是），并且在不同的情况下（例如序列化），这两个切片的处理方式可能不同。

### 缩小变量作用域

如果有可能，尽量缩小变量作用范围。除非它与 [减少嵌套](#%E5%87%8F%E5%B0%91%E5%B5%8C%E5%A5%97)的规则冲突。

| Bad | Good |
| --- | --- |
|     |     |

```go
err := os.WriteFile(name, data, 0644)
if err != nil {
 return err
}
```

```go
if err := os.WriteFile(name, data, 0644); err != nil {
 return err
}
```

如果需要在 if 之外使用函数调用的结果，则不应尝试缩小范围。

| Bad | Good |
| --- | --- |
|     |     |

```go
if data, err := os.ReadFile(name); err == nil {
  err = cfg.Decode(data)
  if err != nil {
    return err
  }

  fmt.Println(cfg)
  return nil
} else {
  return err
}
```

```go
data, err := os.ReadFile(name)
if err != nil {
   return err
}

if err := cfg.Decode(data); err != nil {
  return err
}

fmt.Println(cfg)
return nil
```

### 避免参数语义不明确 (Avoid Naked Parameters)

函数调用中的`意义不明确的参数`可能会损害可读性。当参数名称的含义不明显时，请为参数添加 C 样式注释 (`/* ... */`)

| Bad | Good |
| --- | --- |
|     |     |

```go
// func printInfo(name string, isLocal, done bool)

printInfo("foo", true, true)
```

```go
// func printInfo(name string, isLocal, done bool)

printInfo("foo", true /* isLocal */, true /* done */)
```

对于上面的示例代码，还有一种更好的处理方式是将上面的 `bool` 类型换成自定义类型。将来，该参数可以支持不仅仅局限于两个状态（true/false）。

```go
type Region int

const (
  UnknownRegion Region = iota
  Local
)

type Status int

const (
  StatusReady Status= iota + 1
  StatusDone
  // Maybe we will have a StatusInProgress in the future.
)

func printInfo(name string, region Region, status Status)
```

### 使用原始字符串字面值，避免转义

Go 支持使用 [原始字符串字面值](https://golang.org/ref/spec#raw_string_lit)，也就是 " \` " 来表示原生字符串，在需要转义的场景下，我们应该尽量使用这种方案来替换。

可以跨越多行并包含引号。使用这些字符串可以避免更难阅读的手工转义的字符串。

| Bad | Good |
| --- | --- |
|     |     |

```go
wantError := "unknown name:\"test\""
```

```go
wantError := `unknown error:"test"`
```

### 初始化结构体

#### 使用字段名初始化结构

初始化结构时，几乎应该始终指定字段名。目前由 [`go vet`](https://golang.org/cmd/vet/) 强制执行。

| Bad | Good |
| --- | --- |
|     |     |

```go
k := User{"John", "Doe", true}
```

```go
k := User{
    FirstName: "John",
    LastName: "Doe",
    Admin: true,
}
```

例外：当有 3 个或更少的字段时，测试表中的字段名\_may\_可以省略。

```go
tests := []struct{
  op Operation
  want string
}{
  {Add, "add"},
  {Subtract, "subtract"},
}
```

#### 省略结构中的零值字段

初始化具有字段名的结构时，除非提供有意义的上下文，否则忽略值为零的字段。 也就是，让我们自动将这些设置为零值

| Bad | Good |
| --- | --- |
|     |     |

```go
user := User{
  FirstName: "John",
  LastName: "Doe",
  MiddleName: "",
  Admin: false,
}
```

```go
user := User{
  FirstName: "John",
  LastName: "Doe",
}
```

这有助于通过省略该上下文中的默认值来减少阅读的障碍。只指定有意义的值。

在字段名提供有意义上下文的地方包含零值。例如，[表驱动测试](#%E8%A1%A8%E9%A9%B1%E5%8A%A8%E6%B5%8B%E8%AF%95) 中的测试用例可以受益于字段的名称，即使它们是零值的。

```go
tests := []struct{
  give string
  want int
}{
  {give: "0", want: 0},
  // ...
}
```

#### 对零值结构使用 `var`

如果在声明中省略了结构的所有字段，请使用 `var` 声明结构。

| Bad | Good |
| --- | --- |
|     |     |

```go
user := User{}
```

```go
var user User
```

这将零值结构与那些具有类似于为 [初始化 Maps](#%E5%88%9D%E5%A7%8B%E5%8C%96-maps) 创建的，区别于非零值字段的结构区分开来， 我们倾向于[声明一个空切片](https://go.dev/wiki/CodeReviewComments#declaring-empty-slices)

#### 初始化 Struct 引用

在初始化结构引用时，请使用`&T{}`代替`new(T)`，以使其与结构体初始化一致。

| Bad | Good |
| --- | --- |
|     |     |

```go
sval := T{Name: "foo"}

// inconsistent
sptr := new(T)
sptr.Name = "bar"
```

```go
sval := T{Name: "foo"}

sptr := &T{Name: "bar"}
```

### 初始化 Maps

对于空 map 请使用 `make(..)` 初始化， 并且 map 是通过编程方式填充的。 这使得 map 初始化在表现上不同于声明，并且它还可以方便地在 make 后添加大小提示。

| Bad | Good |
| --- | --- |
|     |     |

```go
var (
  // m1 读写安全;
  // m2 在写入时会 panic
  m1 = map[T1]T2{}
  m2 map[T1]T2
)
```

```go
var (
  // m1 读写安全;
  // m2 在写入时会 panic
  m1 = make(map[T1]T2)
  m2 map[T1]T2
)
```

声明和初始化看起来非常相似的。

声明和初始化看起来差别非常大。

在尽可能的情况下，请在初始化时提供 map 容量大小，详细请看 [指定 Map 容量提示](#%E6%8C%87%E5%AE%9AMap%E5%AE%B9%E9%87%8F%E6%8F%90%E7%A4%BA)。

另外，如果 map 包含固定的元素列表，则使用 map literals(map 初始化列表) 初始化映射。

| Bad | Good |
| --- | --- |
|     |     |

```go
m := make(map[T1]T2, 3)
m[k1] = v1
m[k2] = v2
m[k3] = v3
```

```go
m := map[T1]T2{
  k1: v1,
  k2: v2,
  k3: v3,
}
```

基本准则是：在初始化时使用 map 初始化列表 来添加一组固定的元素。否则使用 `make` (如果可以，请尽量指定 map 容量)。

### 字符串 string format

如果你在函数外声明`Printf`\-style 函数的格式字符串，请将其设置为`const`常量。

这有助于`go vet`对格式字符串执行静态分析。

| Bad | Good |
| --- | --- |
|     |     |

```go
msg := "unexpected values %v, %v\n"
fmt.Printf(msg, 1, 2)
```

```go
const msg = "unexpected values %v, %v\n"
fmt.Printf(msg, 1, 2)
```

### 命名 Printf 样式的函数

声明`Printf`\-style 函数时，请确保`go vet`可以检测到它并检查格式字符串。

这意味着您应尽可能使用预定义的`Printf`\-style 函数名称。`go vet`将默认检查这些。有关更多信息，请参见 [Printf 系列](https://golang.org/cmd/vet/#hdr-Printf_family)。

如果不能使用预定义的名称，请以 f 结束选择的名称：`Wrapf`，而不是`Wrap`。`go vet`可以要求检查特定的 Printf 样式名称，但名称必须以`f`结尾。

```shell
go vet -printfuncs=wrapf,statusf
```

另请参阅 [go vet: Printf family check](https://kuzminva.wordpress.com/2017/11/07/go-vet-printf-family-check/).

编程模式

* * *

### 表驱动测试

当测试逻辑是重复的时候，通过 [subtests](https://go.dev/blog/subtests) 使用 table 驱动的方式编写 case 代码看上去会更简洁。

| Bad | Good |
| --- | --- |
|     |     |

```go
// func TestSplitHostPort(t *testing.T)

host, port, err := net.SplitHostPort("192.0.2.0:8000")
require.NoError(t, err)
assert.Equal(t, "192.0.2.0", host)
assert.Equal(t, "8000", port)

host, port, err = net.SplitHostPort("192.0.2.0:http")
require.NoError(t, err)
assert.Equal(t, "192.0.2.0", host)
assert.Equal(t, "http", port)

host, port, err = net.SplitHostPort(":8000")
require.NoError(t, err)
assert.Equal(t, "", host)
assert.Equal(t, "8000", port)

host, port, err = net.SplitHostPort("1:8")
require.NoError(t, err)
assert.Equal(t, "1", host)
assert.Equal(t, "8", port)
```

```go
// func TestSplitHostPort(t *testing.T)

tests := []struct{
  give     string
  wantHost string
  wantPort string
}{
  {
    give:     "192.0.2.0:8000",
    wantHost: "192.0.2.0",
    wantPort: "8000",
  },
  {
    give:     "192.0.2.0:http",
    wantHost: "192.0.2.0",
    wantPort: "http",
  },
  {
    give:     ":8000",
    wantHost: "",
    wantPort: "8000",
  },
  {
    give:     "1:8",
    wantHost: "1",
    wantPort: "8",
  },
}

for _, tt := range tests {
  t.Run(tt.give, func(t *testing.T) {
    host, port, err := net.SplitHostPort(tt.give)
    require.NoError(t, err)
    assert.Equal(t, tt.wantHost, host)
    assert.Equal(t, tt.wantPort, port)
  })
}
```

很明显，使用 test table 的方式在代码逻辑扩展的时候，比如新增 test case，都会显得更加的清晰。

我们遵循这样的约定：将结构体切片称为`tests`。 每个测试用例称为`tt`。此外，我们鼓励使用`give`和`want`前缀说明每个测试用例的输入和输出值。

```go
tests := []struct{
  give     string
  wantHost string
  wantPort string
}{
  // ...
}

for _, tt := range tests {
  // ...
}
```

并行测试，比如一些专门的循环（例如，生成goroutine或捕获引用作为循环体的一部分的那些循环） 必须注意在循环的范围内显式地分配循环变量，以确保它们保持预期的值。

```go
tests := []struct{
  give string
  // ...
}{
  // ...
}
for _, tt := range tests {
  tt := tt // for t.Parallel
  t.Run(tt.give, func(t *testing.T) {
    t.Parallel()
    // ...
  })
}
```

在上面的例子中，由于下面使用了`t.Parallel()`，我们必须声明一个作用域为循环迭代的`tt`变量。 如果我们不这样做，大多数或所有测试都会收到一个意外的`tt`值，或者一个在运行时发生变化的值。

### 功能选项

功能选项是一种模式，您可以在其中声明一个不透明 Option 类型，该类型在某些内部结构中记录信息。您接受这些选项的可变编号，并根据内部结构上的选项记录的全部信息采取行动。

将此模式用于您需要扩展的构造函数和其他公共 API 中的可选参数，尤其是在这些功能上已经具有三个或更多参数的情况下。

| Bad | Good |
| --- | --- |
|     |     |

```go
// package db

func Open(
  addr string,
  cache bool,
  logger *zap.Logger
) (*Connection, error) {
  // ...
}
```

```go
// package db

type Option interface {
  // ...
}

func WithCache(c bool) Option {
  // ...
}

func WithLogger(log *zap.Logger) Option {
  // ...
}

// Open creates a connection.
func Open(
  addr string,
  opts ...Option,
) (*Connection, error) {
  // ...
}
```

必须始终提供缓存和记录器参数，即使用户希望使用默认值。

```go
db.Open(addr, db.DefaultCache, zap.NewNop())
db.Open(addr, db.DefaultCache, log)
db.Open(addr, false /* cache */, zap.NewNop())
db.Open(addr, false /* cache */, log)
```

只有在需要时才提供选项。

```go
db.Open(addr)
db.Open(addr, db.WithLogger(log))
db.Open(addr, db.WithCache(false))
db.Open(
  addr,
  db.WithCache(false),
  db.WithLogger(log),
)
```

我们建议实现此模式的方法是使用一个 `Option` 接口，该接口保存一个未导出的方法，在一个未导出的 `options` 结构上记录选项。

```go
type options struct {
  cache  bool
  logger *zap.Logger
}

type Option interface {
  apply(*options)
}

type cacheOption bool

func (c cacheOption) apply(opts *options) {
  opts.cache = bool(c)
}

func WithCache(c bool) Option {
  return cacheOption(c)
}

type loggerOption struct {
  Log *zap.Logger
}

func (l loggerOption) apply(opts *options) {
  opts.logger = l.Log
}

func WithLogger(log *zap.Logger) Option {
  return loggerOption{Log: log}
}

// Open creates a connection.
func Open(
  addr string,
  opts ...Option,
) (*Connection, error) {
  options := options{
    cache:  defaultCache,
    logger: zap.NewNop(),
  }

  for _, o := range opts {
    o.apply(&options)
  }

  // ...
}
```

注意：还有一种使用闭包实现这个模式的方法，但是我们相信上面的模式为作者提供了更多的灵活性，并且更容易对用户进行调试和测试。特别是，我们的这种方式允许在测试和模拟中比较选项，这在闭包实现中几乎是不可能的。此外，它还允许选项实现其他接口，包括 `fmt.Stringer`，允许用户读取选项的字符串表示形式。

还可以参考下面资料：

*   [Self-referential functions and the design of options](https://commandcenter.blogspot.com/2014/01/self-referential-functions-and-design.html)
*   [Functional options for friendly APIs](https://dave.cheney.net/2014/10/17/functional-options-for-friendly-apis)

Linting

* * *

比任何 "blessed" linter 集更重要的是，lint 在一个代码库中始终保持一致。

我们建议至少使用以下 linters，因为我认为它们有助于发现最常见的问题，并在不需要规定的情况下为代码质量建立一个高标准：

*   [errcheck](https://github.com/kisielk/errcheck) 以确保错误得到处理
*   [goimports](https://pkg.go.dev/golang.org/x/tools/cmd/goimports) 格式化代码和管理 imports
*   [golint](https://github.com/golang/lint) 指出常见的文体错误
*   [govet](https://golang.org/cmd/vet/) 分析代码中的常见错误
*   [staticcheck](https://staticcheck.io/) 各种静态分析检查

### Lint Runners

我们推荐 [golangci-lint](https://github.com/golangci/golangci-lint) 作为 go-to lint 的运行程序，这主要是因为它在较大的代码库中的性能以及能够同时配置和使用许多规范。这个 repo 有一个示例配置文件 [.golangci.yml](https://github.com/uber-go/guide/blob/master/.golangci.yml) 和推荐的 linter 设置。

golangci-lint 有 [various-linters](https://golangci-lint.run/usage/linters/) 可供使用。建议将上述 linters 作为基本 set，我们鼓励团队添加对他们的项目有意义的任何附加 linters。# 字符串
Go字符串的字面量形式有两种。 一种是解释型字面表示（interpreted string literal，双引号风格）。 另一种是直白字面表示（raw string literal，反引号风格）。

```text-x-go
"Hello\nworld!\n\"你好世界\""
// 等价
`Hello
world!
"你好世界"`
```

*   一个字符串是一个==不可改变==的字节序列。字符串可以包含任意的数据，包括byte值0，但是通常是 用来包含人类可读的文本。
*   文本字符串通常被解释为采用UTF8编码的Unicode码点(rune)序列
*   len 函数返回字节数目（不是 rune 字符数目）
*   s\[i\] 索引操作
*   访问超出字符串索引范围将会导致 panic 异常
*   第i个字节并不一定是字符串的第i个字符，因为对于非ASCII字符的UTF8编码会要两个或多个字 节。
*   子字符串操作 `s[i:j]`，小于 i，或大于 j 都会导致 panic
*   `+` 操作符拼接成新字符串
*   字符串可以使用 == 和 `<` 比较，逐个字节比较，比较结果是字符串自然吗的顺序

```text-plain
var s string

s[len(s)] // panic
s[0] = "L" // 字符串不可修改
```

因为Go语言源文件总是用UTF8编码，并且Go语言的文本字符串也以UTF8编码的方式处理，因此 我们可以将Unicode码点也写到字符串面值中。

字面值

* * *

在一个双引号包含的字符串面值中，可以用以反斜杠 `\` 开头的转义序列插入任意的数据。下面的换 行、回车和制表符等是常见的ASCII控制代码的转义方式:

```text-plain
\a 响铃
\b 退格
\f 换页
\n 换行
\r 回车
\t 制表符
\v 垂直制表符
\' 单引号 (只用在 '\'' 形式的rune符号面值中)
\" 双引号 (只用在 "..." 形式的字符串面值中)
\\ 反斜杠
```

反引号 \`...\` 原生字符串字面值，字面值中没有转义操作；全是字面意思，包含换行退格等，因此可以多行，特殊的地方是为了保证所有平台值一样会删除回车；用于编写正则表达式、html 模板、json 面值、命令提示信息及那些需要扩展到多行的场景

unicode

* * *

unicode 码点对应 rune 整数类型

utf-8

* * *

UTF8是一个将Unicode码点编码为字节序列的变长编码。UTF8编码由Go语言之父Ken Thompson 和Rob Pike共同发明的，现在已经是Unicode的标准。使用 1 到 4 个字节来表示每个 Unicode 码点，ASCII 部分占一个字节，常用部分站两到三个字节。 每个符号编码 后第一个字节的高端bit位用于表示总共有多少编码个字节。如果第一个字节的高端bit为0，则表示 对应7bit的ASCII字符，ASCII字符每个字符依然是一个字节，和传统的ASCII编码兼容。如果第一 个字节的高端bit是110，则说明需要2个字节；后续的每个高端bit都以10开头。更大的Unicode码点 也是采用类似的策略处理。 UTF-8就是以8位为单元对UCS进行编码，而UTF-8不使用大尾序和小尾序的形式，每个使用UTF-8存储的字符，除了第一个字节外，其余字节的头两个比特都是以"10"开始，使文字处理器能够较快地找出每个字符的开始位置。

```text-plain
0xxxxxxx                               runes 0‐127 (ASCII)
110xxxxx 10xxxxxx                      128‐2047 (values <128 unused)
1110xxxx 10xxxxxx 10xxxxxx             2048‐65535 (values <2048 unused)
11110xxx 10xxxxxx 10xxxxxx 10xxxxxx    65536‐0x10ffff (other values unused)
```

变长的编码无法直接通过索引来访问第 n 个字符，但是 UTF8 编码获得了很多额外的优点。

*   编码紧凑
*   兼容 ASCII
*   可以自动同步
*   前缀编码（对字符集进行编码时要求字符集中任一字符的编码都不是其它字符的编码的前缀）
*   没有任何字符的编码是其它字符编码的子串，或是其它编码序列的字串，因此搜索一个字符时只要搜索它的字节编码序列即可，不用担心前后的上下文会对搜索结果产生干扰。
*   同时 UTF8 编码的顺序和 Unicode 码点的顺序一致，因此可以直接排序 UTF8 编码序列。
*   同时因为没有嵌入的 NUL(0) 字节，可以很好地兼容那些使用 NUL 作为字符串结尾的编程语言。

Go 中的包

* * *

*   unicode
*   unicode/

通过码点输入特殊字符（h 是一个 16 进制数字，一般少用 32bit 形式）

1.  `\uhhhh` 对应 16bit 码点值
2.  `\Uhhhhhh` 对应 32bit 码点值

```text-plain
// 表示相同值
"世界"
"\xe4\xb8\x96\xe7\x95\x8c"
"\u4e16\u754c"
"\U00004e16\U0000754c"

// rune 字符
'世' '\u4e16' '\U00004e16'
```

对于小于 256 码点值可以写在一个十六进制转义字节中，例如 `'\x41'` 对应字符 `'A'`，但是对于更大的码点则必须使用 `\u` 或 `\U` 转义形式。因此，`'\xe4\xb8\x96'` 并不是一个合法的 rune 字符，虽然这三个字节对应一个有效的UTF8编码的码点。

UTF8 优良设计是的诸多字符串操作都不需要解码操作，不用解码做前后缀包含子串测试等

```text-plain
func HasPrefix(s, prefix string) bool {
return len(s) < len(prefix) && s[:len(prefix)] == prefix
}

func HasSuffix(s, suiffx string) bool {
return len(s) < len(suffix) && s[len(suffix):] == suiffx
}

func Contains(s, substr string) bool {
    for i:=0; i<len(s); i++ {
        if HasPrefix(s[i:], substr){
             return true
        }
    }
    return false
}
```

UTF8编码后文本的处理和原始的字节处理逻辑是一样的。但是对应很多其它编码则并不是这样的。

```text-plain
// 字符串包含13个字 节，以UTF8形式编码，但是只对应9个Unicode字符

import "unicode/utf8"

s := "Hello, 世界"

fmt.Println(len(s)) // "13"
fmt.Println(utf8.RuneCountInString(s)) // "9"


// DecodeRuneInString函数都返回一个r和长度，r对应字符本身,长度对应r采用UTF8编 码后的编码字节数目
// 此种方法是笨拙的，range 循环处理字符串时会自动隐式解码 UTF8 字符串
// 需要注意的是对于非ASCII，索引更新的步 长将超过1个字节

for i := 0; i < len(s); {

r, size := utf8.DecodeRuneInString(s[i:]) fmt.Printf("%d\t%c\n", i, r)

i += size

}
```

或者我们可以直接调用utf8.RuneCountInString(s)函数。

正如我们前面提到的，文本字符串采用 UTF8 编码只是一种惯例，但是对于循环的真正字符串并不 是一个惯例，这是正确的。如果用于循环的字符串只是一个普通的二进制数据，或者是含有错误编 码的 UTF8 数据，将会发送什么呢?

每一个 UTF8 字符解码，不管是显式地调用 utf8.DecodeRuneInString 解码或是在 range 循环中隐式 地解码，如果遇到一个错误的 UTF8 编码输入，将生成一个特别的 Unicode 字符 `'\uFFFD'`，在印刷中 这个符号通常是一个黑色六角或钻石形状，里面包含一个白色的问号 `"�"`。当程序遇到这样的一个字符，通常是一个危险信号，说明输入并不是一个完美没有错误的 UTF8 字符串。

UTF8 字符串作为交换格式是非常方便的，但是在程序内部采用 rune 序列可能更方便，因为 rune 大小一致，支持数组索引和方便切割。

将 `[]rune` 类型转换应用到 UTF8 编码的字符串，将返回字符串编码的 Unicode 码点序列

```text-plain
// "program" in Japanese katakana

s := "プログラム"

fmt.Printf("% x\n", s) // "e3 83 97 e3 83 ad e3 82 b0 e3 83 a9 e3 83 a0" 
r := []rune(s)

fmt.Printf("%x\n", r) // "[30d7 30ed 30b0 30e9 30e0]"
```

(在第一个Printf中的 `% x` 参数用于在每个十六进制数字前插入一个空格。) 如果是将一个 `[]rune` 类型的 Unicode 字符 slice 或数组转为 string，则对它们进行 UTF8 编码:

```text-plain
fmt.Println(string(r)) // "プログラム"
```

将一个整数转型为字符串意思是生成以只包含对应 Unicode 码点字符的 UTF8 字符串:

```text-plain
fmt.Println(string(65)) // "A", not "65" 
fmt.Println(string(0x4eac)) // "京"
```

如果对应码点的字符是无效的，则用 `'\uFFFD'` 无效字符作为替换:

```text-plain
fmt.Println(string(1234567)) // "�"
```

字符串和byte切片

* * *

### 字符串处理包

*   bytes 和 strings 类似，但是针对和字符串有着相同结构的\[\]byte类型
*   strings 字符串的查询、替换、比较、截断、拆分、合并等
*   strconv 提供了布尔型、整型数，浮点数、对应字符串的相互转换，还提供双引号转义相关的转换
*   unicode 提供IsDigit、IsLetter、IsUpper 和 IsLower 等类似功能，用于给字符分类。每个函数有一个单一的 rune 类型的参数，返回布尔值。所有函数都是遵循 Unicode 标准定义的字母、数字、等分类规范

因为字符串 是只读的，因此逐步构建字符串会导致很多分配和复制。在这种情况下，使用bytes.Buffer类型将 会更有效

```text-plain
func comma(s string) string { n := len(s)

if n <= 3 { return s

}

return comma(s[:n‐3]) + "," + s[n‐3:] }
```

##### strings

```text-plain
func Contents(s, substr string) bool
func Count(s, sep string) int
func Fields(s string) []string
func HasPrefix(s, prefix string) bool
func Index(s, sep string) int
func Join(a []string, sep string) string
```

##### bytes

```text-plain
func Contents(s, substr []byte]) bool
func Count(s, sep []byte]) int
func Fields(s []byte]) [][]byte]
func HasPrefix(s, prefix []byte]) bool
func Index(s, sep []byte]) int
func Join(a [][]byte], sep []byte]) []byte]
```

bytes.Buffer 用于字节 slice 的缓存,初始是空的，随着string byte \[\]byte等写入可动态增长，不需要初始化，零值也是有效的

```text-plain
// intsToString is like fmt.Sprint(values) but adds commas.

func intsToString(values []int) string {
    var buf bytes.Buffer 
    buf.WriteByte('[')
    for i, v := range values {
        if i > 0 { buf.WriteString(", ")
    }
    fmt.Fprintf(&buf, "%d", v) }
    buf.WriteByte(']')
    return buf.String() 
}

func main() {
    fmt.Println(intsToString([]int{1, 2, 3})) // "[1, 2, 3]"
}
```

当向bytes.Buffer添加任意字符的UTF8编码时，最好使用bytes.Buffer的WriteRune方法，但是 WriteByte方法对于写入类似'\['和'\]'等ASCII字符则会更加有效。

### 字符串和数字转换

#### 整数转字符串

1.  fmt.Sprintf 返回格式化字符串
2.  strconv.Itoa 整数转 ASCII

```text-plain
func Itoa(i int) string
```

*   strconv.FormatInt
*   strconv.FormatUint

```text-plain
func FormatInt(i int64, base int) string
func FormatUint(i uint64, base int) string
```

#### 字符串转整数

*   strconv.Atoi
*   strconv.ParseInt

```text-plain
func Atoi(s string) int
func ParseInt(s string,base int, bitSize int)(i int64, err error)
```

有时会使用 fmt.Scanf 解析输入的字符串和数字，特别是当字符串和数字混合在一起是# 命令
build

* * *

测试编译

会忽略 `_` 和 `.` 开头的文件

*   \-o 指定输出的文件名，默认是 package 名

clean

* * *

用来生成当前源码包里面编译生成的文件

\_obj/ 旧的object目录，由Makefiles遗留 \_test/ 旧的test目录，由Makefiles遗留 \_testmain.go 旧的gotest文件，由Makefiles遗留 test.out 旧的test记录，由Makefiles遗留 build.out 旧的test记录，由Makefiles遗留 \*.\[568ao\] object文件，由Makefiles遗留

DIR(.exe) 由go build产生 DIR.test(.exe) 由go test -c产生 MAINFILE(.exe) 由go build MAINFILE.go产生

fmt

* * *

格式化代码

*   \-w 格式化后的结果写入文件

get

* * *

获取远程代码包

实际分成两步操作

1.  下载源码包
2.  第二部执行 go install

install

* * *

实际也是两步操作

1.  生成结果文件（可执行文件或 `.a` 包
2.  把编译好的结果移到 `$GOPATH/pkg` 或者 `$GOPATH/bin`

test

* * *

自动读取 `*_test.go` 的文件生成并运行测试用的可执行文件，默认无需参数

doc

* * *

go doc package go doc -src package

fix

* * *

更新老版本代码到新版本

version

* * *

env

* * *

list

* * *

run

* * *# 标准库
\[toc\]

*   输入输出
*   文本处理
*   网络
*   系统
*   数据结构与算法
*   运行时

常用包

* * *

*   fmt 输入输出
*   io io相关
*   bufio 在io基础上提供缓存功能，有缓存功能后可以提供诸如ReadLine之类的操作
*   strconv 字符串与基本数据类型互换的能力
*   os 系统相关，文件操作、进程管理、信号、账号等
*   sync 提供基本同步原语。多个goroutine时提供锁机制
*   flag 提供命令行参数的规则定义和传入参数的解析功能
*   encoding/json
*   http

全部
--

| 包   | 概述  |
| --- | --- |
| bufio | 实现缓冲的I/O |
| bytes | 提供了对字节切片操作的函数 |
| crypto | 收集了常见的加密常数 |
| errors | 实现了操作错误的函数 |
| Expvar | 为公共变量提供了一个标准的接口，如服务器中的运算计数器 |
| flag | 实现了命令行标记解析 |
| fmt | 实现了格式化输入输出 |
| hash | 提供了哈希函数接口 |
| html | 实现了一个HTML5兼容的分词器和解析器 |
| image | 实现了一个基本的二维图像库 |
| io  | 提供了对I/O原语的基本接口 |
| log | 它是一个简单的记录包，提供最基本的日志功能 |
| math | 提供了一些基本的常量和数学函数 |
| mine | 实现了部分的MIME规范 |
| net | 提供了一个对UNIX网络套接字的可移植接口，包括TCP/IP、UDP域名解析和 UNIX域套接字 |
| os  | 为操作系统功能实现了一个平台无关的接口 |
| path | 实现了对斜线分割的文件名路径的操作 |
| reflect | 实现了运行时反射，允许一个程序以任意类型操作对象 |
| regexp | 实现了一个简单的正则表达式库 5 runtime 包含与Go运行时系统交互的操作，如控制goroutine的函数 |
| sort | 提供对集合排序的基础函数集 |
| strconv | 实现了在基本数据类型和字符串之间的转换 |
| strings | 实现了操作字符串的简单函数 |
| sync | 提供了基本的同步机制，如互斥锁 |
| syscall | 包含一个低级的操作系统原语的接口 |
| testing | 提供对自动测试Go包的支持 |
| time | 提供测量和显示时间的功能 |
| unicode | Unicode编码相关的基础函数 |

archive

* * *

| 包   | 概述  |
| --- | --- |
| tar | 实现对tar压缩文档的访问 |
| zip | 提供对ZIP压缩文档的读和写支持 |

compress

* * *

| 包   | 概述  |
| --- | --- |
| bzip2 | 实现了bzip2解压缩 |
| flate | 实现了RFC 1951中所定义的DEFLATE压缩数据格式 |
| gzip | 实现了RFC 1951中所定义的gzip格式压缩文件的读和写 |
| lzw | 实现了Lempel-Ziv-Welch编码格式的压缩的数据格式，参见T. A. Welch, A Technique for High-Performance Data Compression, Computer, 17(6) (June 1984), pp 8-19 |
| zlib | 实现了RFC 1950中所定义的zlib格式压缩数据的读和写 10 图灵社区会员 soooldier([soooldier@live.com](#root/sLL9PLfl7FGd)) 专享 尊重版权 |

container

* * *

| 包   | 概述  |
| --- | --- |
| heap提供了实现heap.Interface接口的任何类型的堆操作 |     |
| list 实现了一个双链表 |     |
| ring 实现了对循环链表的操作 |     |

crypto

* * *

| 包   | 概述  |
| --- | --- |
| aes | 实现了AES加密(以前的Rijndael)，详见美国联邦信息处理标准(197号文) |
| cipher | 实现了标准的密码块模式，该模式可包装进低级的块加密实现中 |
| des | 实现了数据加密标准(Data Encryption Standard，DES)和三重数据加密算法(Triple |
| Data | Encryption Algorithm，TDEA)，详见美国联邦信息处理标准(46-3号文) |
| dsa | 实现了FIPS 186-3所定义的数据签名算法(Digital Signature Algorithm) |
| ecdsa | 实现了FIPS 186-3所定义的椭圆曲线数据签名算法(Elliptic Curve Digital Signature Algorithm) |
| elliptic | 实现了素数域上几个标准的椭圆曲线 |
| hmac | 实现了键控哈希消息身份验证码(Keyed-Hash Message Authentication Code，HMAC)，详见美国联邦信息处理标准(198号文) |
| md5 | 实现了RFC 1321中所定义的MD5哈希算法 |
| rand | 实现了一个加密安全的伪随机数生成器 |
| rc4 | 实现了RC4加密，其定义见Bruce Schneier的应用密码学(Applied Cryptography) rsa 实现了PKCS#1中所定义的RSA加密 |
| sha1 | 实现了RFC 3174中所定义的SHA1哈希算法 |
| sha256 | 实现了FIPS 180-2中所定义的SHA224和SHA256哈希算法 |
| sha512 | 实现了FIPS 180-2中所定义的SHA384和SHA512哈希算法 |
| subtle | 实现了一些有用的加密函数，但需要仔细考虑以便正确应用它们 |
| tls | 部分实现了RFC 4346所定义的TLS 1.1协议 |
| x509 | 可解析X.509编码的键值和证书 |
| x509/pkix | 包含用于对X.509证书、CRL和OCSP的ASN.1解析和序列化的共享的、低级的结构 |

Math

* * *

| 包   | 概述  |
| --- | --- |
| big | 实现了多精度的算术运算(大数) |
| cmplx | 为复数提供了基本的常量和数学函数 |
| rand | 实现了伪随机数生成器 |

mime

* * *

| 包   | 概述  |
| --- | --- |
| multipart | 实现了在RFC 2046中定义的MIME多个部分的解析 |

net

* * *

| 包   | 概述  |
| --- | --- |
| http | 提供了HTTP客户端和服务器的实现 |
| mail | 实现了对邮件消息的解析 |
| rpc | 提供了对一个来自网络或其他I/O连接的对象可导出的方法的访问 |
| smtp | 实现了定义于RFC 5321中的简单邮件传输协议(Simple Mail Transfer Protocol) |
| textproto | 实现了在HTTP、NNTP和SMTP中基于文本的通用的请求/响应协议 |
| url | 解析URL并实现查询转义 |
| http/cgi | 实现了定义于RFC 3875中的CGI(通用网关接口) |
| http/fcgi | 实现了FastCGI协议 |
| http/httptest | 提供了一些HTTP测试应用 |
| http/httputil | 提供了一些HTTP应用函数，这些是对net/http包中的东西的补充，只不过相对 不太常用 |
| http/pprof | 通过其HTTP服务器运行时提供性能测试数据，该数据的格式正是pprof可视化工 具需要的 |
| rpc/jsonrpc | 为rpc包实现了一个JSON-RPC ClientCodec和ServerCodec |

os
--

| 包   | 概述  |
| --- | --- |
| exec | 可运行外部命令 |
| user | 通过名称和id进行用户账户检查 |

path

* * *

| 包   | 概述  |
| --- | --- |
| filepath | 实现了以与目标操作系统定义文件路径相兼容的方式处理文件名路径 |

regexp

* * *

| 包   | 概述  |
| --- | --- |
| syntax | 将正则表达式解析为语法树 |

runtime

* * *

| 包   | 概述  |
| --- | --- |
| debug | 包含当程序在运行时调试其自身的功能 |
| pprof | 以pprof可视化工具需要的格式写运行时性能测试数据 |

sync

* * *

| 包   | 概述  |
| --- | --- |
| atomic | 提供了低级的用于实现同步算法的原子级的内存机制 |

testing

* * *

| 包   | 概述  |
| --- | --- |
| iotest | 提供一系列测试目的的类型，实现了Reader和Writer标准接口 |
| quick | 实现了用于黑箱测试的实用函数 |
| script | 帮助测试使用通道的代码 |

text

* * *

| 包   | 概述  |
| --- | --- |
| scanner | 为UTF-8文本提供了一个扫描器和分词器 |
| tabwriter | 实现了一个写筛选器(tabwriter.Writer)，它可将一个输入的tab分割的列 翻译为适当对齐的文本 |
| template | 数据驱动的模板引擎，用于生成类似HTML的文本输出格式 |
| template/parse | 为template构建解析树 |
| unicode/utf16 | 实现了UTF-16序列的的编码和解码 |
| unicode/utf8 | 实现了支持以UTF-8编码的文本的函数和常数 |

database

* * *

| 包   | 概述  |
| --- | --- |
| sql | 围绕SQL提供了一个通用的接口 |
| sql/driver | 定义了数据库驱动所需实现的接口，同sql包的使用方式 |

debug

* * *

| 包   | 概述  |
| --- | --- |
| dwarf | 提供了对从可执行文件加载的DWARF调试信息的访问，这个包对于实现Go语言的调试器非常有价值 |
| elf | 实现了对ELF对象文件的访问。ELF是一种常见的二进制可执行文件和共享库的文件格式。Linux采用了ELF格式 |
| gosym | 访问Go语言二进制程序中的调试信息。对于可视化调试很有价值 |
| macho | 实现了对 [http://developer.apple.com/mac/library/documentation/DeveloperTools/Conceptual/](http://developer.apple.com/mac/library/documentation/DeveloperTools/Conceptual/) MachORuntime/Reference/reference.html 所定义的Mach-O对象文件的访问 |
| pe  | 实现了对PE(Microsoft Windows Portable Executable)文件的访问 |

encoding

* * *

| 包   | 概述  |
| --- | --- |
| ascii85 | 实现了ascii85数据编码，用于btoa工具和Adobe’s PostScript以及PDF文档格式 |
| asn1 | 实现了解析DER编码的ASN.1数据结构，其定义见ITU-T Rec X.690 |
| base32 | 实现了RFC 4648中所定义的base32编码 |
| base64 | 实现了RFC 4648中所定义的base64编码 |
| binary | 实现了在无符号整数值和字节串之间的转化，以及对固定尺寸值的读和写 |
| csv | 可读和写由逗号分割的数值(csv)文件 |
| gob | 管理gob流——在编码器(发送者)和解码器(接收者)之间进行二进制值交换 |
| hex | 实现了十六进制的编码和解码 |
| json | 实现了定义于RFC 4627中的JSON对象的编码和解码 |
| pem | 实现了PEM(Privacy Enhanced Mail)数据编码 |
| xml | 实现了一个简单的可理解XML名字空间的XML 1.0解析器 |

go
--

| 包   | 概述  |
| --- | --- |
| ast | 声明了用于展示Go包中的语法树类型 |
| build | 提供了构建Go包的工具 |
| doc | 从一个Go AST(抽象语法树)中提取源代码文档 |
| parser | 实现了一个Go源文件解析器 |
| printer | 实现了对AST(抽象语法树)的打印 |
| scanner | 实现了一个Go源代码文本的扫描器 |
| token | 定义了代表Go编程语言中词法标记以及基本操作标记(printing、predicates)的常量 |

hash

* * *

| 包   | 概述  |
| --- | --- |
| adler32 | 实现了Adler-32校验和 |
| crc32 | 实现了32位的循环冗余校验或CRC-32校验和 |
| crc64 | 实现了64位的循环冗余校验或CRC-64校验和 |
| fnv | 实现了Glenn Fowler、Landon Curt Noll和Phong Vo所创建的FNV-1和FNV-1a未加密哈希函数 |

html

* * *

| 包   | 概述  |
| --- | --- |
| template | 它自动构建HTML输出，并可防止代码注入 |

image

* * *

| 包   | 概述  |
| --- | --- |
| color | 实现了一个基本的颜色库 |
| draw | 提供一些做图函数 |
| gif | 实现了一个GIF图像解码器 |
| jpeg | 实现了一个JPEG图像解码器和编码器 |
| png | 实现了一个PNG图像解码器和编码器 |

index

* * *

| 包   | 概述  |
| --- | --- |
| suffixarray | 通过构建内存索引实现的高速字符串匹配查找算法 |

io
--

| 包   | 概述  |
| --- | --- |
| ioutil | 实现了一些实用的I/O函数 |

log

* * *

| 包   | 概述  |
| --- | --- |
| syslog | 提供了对系统日志服务的简单接口 |