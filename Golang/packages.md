# 9. packages
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

`go list -json hash` -json 参数表示用 JSON 格式打印每个包的元信息 -f 参数允许使用 text/template 包的模板语言定义文本输出的格式 `go list -f '{{join .Deps " "}}' strconv` windows 下需要转义双引号 `go list -f '{{join .Deps \" \"}}' strconv`