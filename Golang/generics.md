# generics
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
```