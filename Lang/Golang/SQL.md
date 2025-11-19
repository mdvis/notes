# SQL
database/sql

* * *

Go语言没有官方提供数据库驱动，而是为开发者开发数据库驱动定义了一些标准接口，开发者可以根据定义的接口来开发相应的数据库驱动

这样做有一个好处，只要按照标准接口开发的代码，以后需要迁移数据库时，不需要任何修改。

### sql.Register 注册数据库驱动

当第三方开发者开发数据库驱动时，都会实现 init 函数，在 init 里面会调用这个 `Register(name string, driver driver.Driver)` 完成本驱动的注册

database/sql/driver 提供的接口基础上定义了一些更高阶的方法，用以简化数据库操作，同时内部还建议性的实现一个 conn pool ( freeConn )

```text-plain
type DB struct {
    driver driver.Driver
    dsn string
    mu sync.Mutex
    freeConn []driver.Conn
    closed bool
}
```

Open 函数返回 DB 对象， 里面有 freeConn， 是个简易连接池。当执行 Db.prepare 时会 defer db.putConn(ci,err)，把链接放入链接池，调用conn时hv先判断 freeConn 长度，大于0 说明有可以复用的conn，不大于0 则创建conn，然后返回他

```text-plain
func Open(driverName, dataSourceName string) (*DB, error)
```

### driver.Driver

```text-plain
type Driver interface {
    Open(name string) (Conn, error) // 返回的 Conn 只能用来做一次 goroutine 的操作
}
```

第三方驱动都会定义这个函数，解析 name 参数获取数据库相关链接信息，使用此信息初始化 Conn 并返回

### driver.Conn

Conn 只能用于一个 goroutine，不能用于多个 Conn，否则无法判断是哪个 goroutine 发起的，从而造成混乱

```text-plain
type Conn interface {
    Prepare(query string) (Stmt, error)  // 返回当前链接相关的执行 SQL 语句的准备状态，可以删除查询等
    Close() error  // 关闭连接，清理链接拥有的资源（清理工作，释放资源）
    Begin() (Tx, error)  // 返回一个代表事务处理的Tx，可以用于查询更新等操作，或对事务进行回滚，提交
}
```

因为驱动实现了database/sql里面建议的conn pool，所以读者不用再去实现缓存conn之类的，这样会容易引起问题。

### driver.Stmt

Stmt 是一种准备好的状态，和 Conn 相关，只能用于一个 goroutine

```text-plain
type Stmt interface {
    Close() error  // 关闭当前连接状态，如果正在执行 query，query 还是有效返回 rows 数据
    NumInput() init  // 函数返回当前预留参数的个数，返回 >= 0 时数据库驱动会智能检查调用者的参数。数据库不知道预留参数时返回 -1
    Exec(args []Value) (Result, error) // 执行 Prepare 准备好的 sql，传入参数执行 update/insert 等操作，返回 Result 数据
    Query(args []Value) (Rows, error)  // 执行 Prepare 准备好的 sql，传入需要的参数执行 select 操作，返回 Rows 结果集
}
```

### driver.Tx

事务处理一般就两个过程，递交或回滚。

```text-plain
type Tx interface {
    Commit() error
    Rollback() error
}
```

### driver.Execer

Conn 可选择实现的接口

```text-plain
type Execer interface {
    Exec(query string, args []Value) (Result, error)
}
```

此接口如果未定义，执行 DB.Exec 会首先调用 Prepare 返回 Stmt, 然后执行 Stmt 的 Exec ，最后关闭 Stmt

### driver.Result

执行 Update/Insert 等操作返回的结果接口定义

```text-plain
type Result interface {
    LastInsertId()(int64, error) // 返回有数据库执行插入操作得到的自增 ID 号
    RowsAffected()(int64, error) // 返回query操作影响的数据条目数
}
```

### driver.Rows

执行查询返回结果集接口定义

```text-plain
type Rows interface {
    Columns() []string // 返回查询数据库表的字段信息，返回的 slice 和 sql 查询字段一一对应，而不返回整个表所有字段
    Close() error // 关闭 Rows 迭代器
    Next(dest []Value) error // 返回下一条数据，把数据赋值给dest，dest 里面元素必是 driver，Value 返回的数据中所有string必须转为[]byte,无数据后Next返回io.EOF
}
```

### driver.RowsAffected

其实是一个int64别名，但实现了 Result 接口，以底层实现 Result 的表示方式

```text-plain
type RowsAffected int64
func (RowsAffected) LastInsertId()(int64, error)
func (v RowsAffected) RowsAffected()(int64, error)
```

### driver.Value

是一个可以容纳任何数据的空接口,driver 的 Value 是驱动必须能够操作的 Value，要么是 `nil`，要么是 `int64` `float64` `bool` `[]byte` `string` `time.Time` 之一

```text-plain
type Value interface {}
```

### driver.ValueConverter

定义如何将普通值转化成driver.Value的接口,开发数据库驱动包中实现这个接口的函数在很多地方会使用，有很多好处

*   转化 driver.value 到数据库表响应字段（如int64数据如何转化成数据库表uint16字段）
*   把数据库查询结果转化成 driver.Value 值
*   在 scan 函数里面如何吧 driver.Value 值转化成用户定义值

```text-plain
type ValueConverter interface {
    ConvertValue(v interface{}) (Value, error)
}
```

### driver.Valuer

定义一个返回 driver.Value 的方式

```text-plain
type Valuer interface {
    Value()(Value, error)
}
```

很多类型都实现这个 Value 方法，用来自身与 driver.Value 的转化

关键函数

* * *

*   sql.Open(driverName, DSN) 打开一个注册过的数据库驱动
    *   DSN(Data Source Name)

```text-plain
  [username[:password]@][protocol[(address)]]/dbname[?param1=value1&...&paramN=valueN]
  // user@unix(/path/to/socket)/dbname?charset=utf8
  // user:passwd@tcp(localhost:8088)/dbname?charset=utf8
  // user:passwd@/dbname
  // user:passwd@tcp([de:ad:be:ef::ca:fe]:80)/dbname
```

*   db.Prepare 用来返回准备要执行的SQL操作，然后返回执行完毕的执行状态，参数都是=？的形式，一定程度可以防止SQL注入
*   db.Query 用来执行SQL返回Rows结果
*   stmt.Exec用来执行stmt准备好的SQL

```text-plain
sql.Open -> DB
db.Prepare -> stmt
stmt.Exec -> res
res.LastInsertId -> id
res.RowsAffected -> count

db.Query -> rows
rows.Next
rows.Scan
```