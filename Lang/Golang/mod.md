# mod
Modules

* * *

go.mod 是 Golang1.11 引入的依赖包管理工具，解决没有地方记录依赖包版本的问题

Modules 是相关 Go 包的集合，是源码交换和版本控制单元；其替换旧的基于GOPATH的方法来指定使用那些源文件

*   Modules 不需要 src，bin 等这样的子目录，只要其包含 go.mod 文件即可（哪怕是有 go.mod 的空文件夹）
*   GO111MODULE=off/on/auto(default);off 时使用vendor目录或GOPATH模式查找，on 使用modules，完全不使用GOPATH，auto 文件在包含 go.mod 文件的目录下或在GOPATH/src外且包含go.mod文件的目录