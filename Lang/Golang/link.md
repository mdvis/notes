# link
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
```