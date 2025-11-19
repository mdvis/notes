# 10. test
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

go tool