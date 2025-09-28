# import
1.  相对路径 当前目录同目录
2.  绝对路径 gopath/src

点操作

* * *

```go
import (
    . fmt
)
Printf
```

别名
--

```go
import (
    f "fmt"
)
```

\_ 操作

* * *

```go
_ "github.com/user/restory/name"
```

\_ 操作的作用是引入包，不直接使用包内函数，只调用包内 init 函数