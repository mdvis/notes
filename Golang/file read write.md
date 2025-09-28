# file read write
file\_read\_write

* * *

写入
--

### 直接覆盖

```go
// 新覆盖旧，文件不存在会创建
// io/ioutil
func WriteFile(filename string, data []byte, perm os.FileMode) error

// 基于
os.OpenFile(filename string, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, perm os.FileMode)
f.Write(data []byte)
f.Close()
```

### 常规写入

```go
// 灵活，操作性强
// os
// flag
// O_RDONLY 只读
// O_WRONLY 只写
// O_RDWR   读写
// O_APPEND 追加
// O_CREATE 不存在时创建
// O_EXCL   配合 O_CREATE，创建文件必须不存在
// O_SYNC   开启同步 I/O
// O_TRUNC  截断常规可写文件

// 可读写模式创建
func Create(name string) (file *File, err error)
// 只读模式打开
func Open(name string) (file *File, err error)
// 综合 Create 和 Open 通用文件打开函数
func OpenFile(name string, flag init, perm os.FileMode) (file *File, err error)
// 写入字节
func (f *File) Write(b []byte) (n int, err error)
// 写入字符串
func (f *File) WriteString(s string) (ret int, err error)
func (f *File) Close() error
```

### 带缓冲区的写入

```go
// 先写入缓存，在写入文件
// 设置缓存大小，存储更多数据一次写入
// bufio
// 使用默认大小 4096，新建 Writer
func NewWriter(w io.Writer) *Writer
// 使用自定大小新建 Writer
func NewWriterSize(w io.Writer, size int) *Writer
// 字节写入
func (b *Writer) Write(p []byte) (n int, err error)
// 字符串写入
func (b *Writer) WriteString(s string) (int,error)
// 单字节写入
func (b *Writer) WriterByte(c byte) error
// 写入一个 unicode 码值
func (b *Writer) WriteRune(r rune) (size int, err error)
// 缓冲的数据写入下层 io.Writer 接口
func (b *Writer) Flush() error
```

### 复制操作的文件写入

```go
// io
func Copy(dst Writer,src Reader)(written int64, err error)
func CopyBuffer(dst Writer, src Reader, buf []byte)(written int64, err error)
```

读取
--

### 整体读取

```go
// ioutil
// 直接读取 []byte
func ReadFile(path string) ([]byte, error)

// os
func Open(name string)(file *File, err error)
func (f *File) Stat()(fi FileInfo, err error) 
func (f *File) Read(b []byte)(n int, err error)
```

### 分片读取

上一步中多个小 buff `buf:=make([]byte, size)`

### 逐行读取

```go
func Open(name string)(file *File, err error)
func NewReader(rd io.Reader) *Reader
func (b *Reader) ReadLine()(line []byte, isPrefix bool, err error)
```