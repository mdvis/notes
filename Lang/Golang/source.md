# source
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
*   （gdb）run argv\[1\] argv\[2\]：调试时命令行传参