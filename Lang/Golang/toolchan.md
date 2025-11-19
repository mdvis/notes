# toolchan
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
```