# cgo
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

* * *