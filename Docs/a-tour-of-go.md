# A Tour of Go 完整知识要点

## 一、基础 (Basics)

### 1. 包、变量与函数

**包 (Packages)**
- 每个 Go 程序由包组成,程序从 `main` 包开始运行
- 导入使用 `import`,支持分组(factored)导入
- **首字母大写的名称是导出的**(exported),小写则包外不可见

```go
package main
import (
    "fmt"
    "math"
)
func main() {
    fmt.Println(math.Pi) // Pi 大写,已导出
}
```

**函数 (Functions)**
- 参数类型写在变量名**之后**
- 同类型连续参数可省略重复类型
- 支持多返回值、命名返回值(naked return)

```go
func add(x, y int) int { return x + y }
func swap(x, y string) (string, string) { return y, x }
func split(sum int) (x, y int) {
    x = sum * 4 / 9
    y = sum - x
    return // naked return,直接返回命名返回值
}
```

**变量 (Variables)**
- `var` 声明,类型在后;可省略类型由初始值推断
- `:=` 短变量声明**只能在函数内**使用
- 基本类型:
  - `bool`、`string`
  - `int int8 int16 int32 int64`、`uint...`、`byte`(=uint8)、`rune`(=int32,Unicode 码点)
  - `float32 float64`、`complex64 complex128`
- **零值**:数值 `0`、布尔 `false`、字符串 `""`

```go
var i, j int = 1, 2
var c, python, java = true, false, "no!"
k := 3                  // 短变量声明
const Pi = 3.14         // 常量,不能用 :=
```

**类型转换与推导**
- 显式转换 `T(v)`,Go **没有隐式类型转换**
- `:=` 时根据右值推导;未指定类型常量由上下文决定类型

---

### 2. 流程控制

**for 循环**(Go 只有 `for`,没有 while)
```go
for i := 0; i < 10; i++ {}   // 经典形式
for sum < 1000 { sum += 1 }  // 等价于 while
for {}                        // 无限循环
```
- `for` 的三个部分(初始化、条件、后置)都可省略,分号也可省

**if 语句**
- 不需要小括号,但**花括号必须**
- 可在条件前执行简短语句,变量作用域仅在 if-else 块内

```go
if v := math.Pow(x, n); v < lim {
    return v
} else {
    // v 在此处也可用
}
```

**switch 语句**
- 自动 `break`,不会顺延到下一 case
- 需要顺延用 `fallthrough`
- 无条件 switch 等价于 `if-else` 链

```go
switch os := runtime.GOOS; os {
case "darwin": fmt.Println("macOS")
default: fmt.Println(os)
}
switch {              // 无条件
case t.Hour() < 12: fmt.Println("AM")
default:             fmt.Println("PM")
}
```

**defer 语句**
- 延迟到外层函数返回时执行
- 多个 defer **后进先出**(栈)

```go
defer fmt.Println("world")
fmt.Println("hello")  // 先输出 hello,后 world
```

---

### 3. 更多类型:struct、slice、map

**指针 (Pointers)**
- `&T` 取地址,`*T` 指针类型,`*p` 解引用
- **Go 没有指针运算**

**结构体 (Struct)**
- `type` 定义;字段用 `.` 访问
- 指针访问字段可省略显式解引用 `p.X` 等价于 `(*p).X`
- 结构体字面量、结构体指针字面量

```go
type Vertex struct { X, Y int }
v := Vertex{1, 2}
p := &v
p.X = 10              // 隐式解引用
```

**数组 (Arrays)**
- `[n]T` 固定长度,长度是类型的一部分
- 实际中**切片更常用**

**切片 (Slices)**
- `[]T` 引用底层数组,不存储数据
- `a[low:high]` 半开区间;可省略 low/high
- 切片字面量 `[]int{1,2,3}`
- `len(s)` 长度、`cap(s)` 容量
- 切片的零值是 `nil`
- `make([]T, len, cap)` 创建切片
- `append(s, elems...)` 追加,可能返回新底层数组

```go
s := make([]int, 5)       // len=5,cap=5
s = append(s, 1, 2, 3)
```

**range 遍历切片**
- `for i, v := range s`:index + 副本值
- 用 `_` 忽略 index 或 value

**Map**
- `map[K]V` 引用类型,必须用 `make` 创建
- `delete(m, key)` 删除
- 双赋值检测 key 是否存在:`elem, ok = m[key]`

```go
m := make(map[string]int)
m["a"] = 1
v, ok := m["a"]
delete(m, "a")
```

**函数值与闭包**
- 函数是一等值,可作为参数、返回值
- 闭包:函数捕获外部变量,可修改并保持状态

```go
func adder() func(int) int {
    sum := 0
    return func(x int) int {
        sum += x        // 闭包引用 sum
        return sum
    }
}
```

---

## 二、方法与接口

### 1. 方法定义
- 方法是带**接收者参数**的函数
- 值接收者 vs 指针接收者

```go
type Vertex struct { X, Y float64 }
func (v Vertex) Abs() float64 {           // 值接收者
    return math.Sqrt(v.X*v.X + v.Y*v.Y)
}
func (v *Vertex) Scale(f float64) {       // 指针接收者
    v.X *= f; v.Y *= f
}
```

### 2. 指针接收者
- 需要修改接收者,或结构体很大时使用
- **指针方法可以通过值调用**(Go 自动取地址,前提是值可寻址)
- **值方法可通过指针调用**(自动解引用)
- 建议同一类型的方法接收者保持一致(通常都用指针)

### 3. 接口 (Interfaces)
- 接口 = 方法签名集合
- **隐式实现**:无需 `implements` 关键字,只要实现了全部方法
- 接口值 = (具体类型, 具体值)的元组
- 调用接口方法时,若值为 nil 可能 panic(取决于实现)
- **空接口 `interface{}` / `any`** 持有任意类型值

```go
type Abser interface { Abs() float64 }
type Reader interface { Read(p []byte) (n int, err error) }
type Writer interface { Write(p []byte) (n int, err error) }
type ReadWriter interface { Reader; Writer }  // 组合接口
```

### 4. 类型断言与类型选择
```go
t := i.(T)              // 失败会 panic
t, ok := i.(T)          // 失败 ok=false,不 panic

switch v := i.(type) {  // 类型选择
case int:  fmt.Printf("int %d\n", v)
case string: fmt.Printf("str %s\n", v)
default:   fmt.Printf("other %T\n", v)
}
```

### 5. 常用标准接口

| 接口 | 方法 | 用途 |
|------|------|------|
| `fmt.Stringer` | `String() string` | 控制字符串显示 |
| `error` | `Error() string` | 错误类型 |
| `io.Reader` | `Read(p []byte) (n int, err error)` | 读取数据流 |
| `image.Image` | `ColorModel()`, `Bounds()`, `At()` | 图像表示 |

**错误处理**
```go
type MyError struct { When time.Time; What string }
func (e *MyError) Error() string { ... }
func run() error { return &MyError{time.Now(), "boom"} }
if err := run(); err != nil { fmt.Println(err) }
```

**Reader 示例**:实现一个无限生成 'A' 的 Reader
```go
type MyReader struct{}
func (r MyReader) Read(b []byte) (int, error) {
    for i := range b { b[i] = 'A' }
    return len(b), nil
}
```

---

## 三、泛型

### 1. 类型参数 (Type Parameters)
- 函数和类型都可带类型参数
- `[T any]` 或 `[T comparable]` 指定约束
- `any` = `interface{}`,`comparable` 允许 `==` / `!=`

```go
func Print[T any](s []T) {
    for _, v := range s { fmt.Println(v) }
}

func Index[T comparable](s []T, x T) int {
    for i, v := range s { if v == x { return i } }
    return -1
}
```

### 2. 泛型类型
```go
type List[T any] struct {
    next *List[T]
    val  T
}
```

### 3. 约束 (Constraints)
- 约束本质是接口
- `any` 允许任意类型,`comparable` 允许比较
- 可用类型集(type set)语法 `interface{ int | float64 | ~string }` 限制允许的具体类型

```go
type Number interface { int64 | float64 }
func Sum[V Number](numbers []V) V {
    var sum V
    for _, n := range numbers { sum += n }
    return sum
}
```

---

## 四、并发

### 1. Goroutines
- `go f(args)` 启动轻量级线程,由 Go runtime 调度
- 与主程序共享地址空间

```go
go func(msg string) { fmt.Println(msg) }("going")
```

### 2. Channels
- `chan T` 类型;`make(chan T)` 创建无缓冲通道
- `ch <- v` 发送,`v := <-ch` 接收
- **无缓冲通道**:发送和接收同步(会阻塞直到对方就绪)——可作同步原语
- **带缓冲通道**:`make(chan T, n)`,缓冲满前发送不阻塞

```go
ch := make(chan int, 100)
ch <- 1
v := <-ch
```

### 3. range 与 close
- `close(ch)` 由**发送者**调用,表示没有更多数据
- `for v := range ch` 循环接收直到通道关闭
- 向已关闭通道发送会 panic;从关闭通道接收返回零值
- 只有发送方应关闭,接收方通常不关

```go
func fibonacci(n int, c chan int) {
    x, y := 0, 1
    for i := 0; i < n; i++ {
        c <- x; x, y = y, x+y
    }
    close(c)
}
c := make(chan int, 10)
go fibonacci(cap(c), c)
for i := range c { fmt.Println(i) }
```

### 4. select
- 多路复用,等待多个通道操作
- 多个 case 就绪时**随机**选一个
- `default` 分支使 select 非阻塞

```go
select {
case c <- x:           // 发送成功
case <-quit:           // 收到退出信号
default:               // 无就绪则执行
}
```

### 5. sync.Mutex
- 互斥锁保护共享状态,避免数据竞争
- `Lock()` / `Unlock()`,通常用 `defer` 确保 Unlock

```go
type SafeCounter struct {
    mu sync.Mutex
    v  map[string]int
}
func (c *SafeCounter) Inc(key string) {
    c.mu.Lock(); defer c.mu.Unlock()
    c.v[key]++
}
```

---

## 五、关键思想速记

| 概念 | 要点 |
|------|------|
| 导出规则 | 首字母大写 = 包外可见 |
| 变量声明 | 类型在后;`:=` 仅函数内 |
| 零值 | 数值 0 / 布尔 false / 字符串 "" / 引用 nil |
| 循环 | 只有 `for`,无 while |
| 指针 | 无指针运算 |
| 接口 | 隐式实现,鸭子类型 |
| 错误 | error 接口,显式处理无异常 |
| 并发 | goroutine + channel,优先用通信共享内存 |
| 泛型 | `[T any]` / `comparable`,1.18+ |
