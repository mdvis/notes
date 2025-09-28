# package
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

src/ | +--server/ | +--vendor/ | | | +--p/ #p1:src/vendor/p# | | | +--x/ | | | +--test.go | | | +--vendor/ | | | +--p/ #p2:src/vendor/x/vendor/p# +--main.go

对于main.go而言构造出的路径是src/server/vendor/p

对于test.go而言构造出的路径是src/server/vendor/x/vendor/p

要使用vendor机制，需开启GO15VENDOREXPERIMENT=1，1.6版本默认开启，且必须设置了GOPATH工作空间