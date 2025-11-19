# net
*   [net](#net)
    *   [Socket 编程](#socket-%E7%BC%96%E7%A8%8B)
        *   [Dial() 函数](#dial-%E5%87%BD%E6%95%B0)
        *   [一些其他函数](#%E4%B8%80%E4%BA%9B%E5%85%B6%E4%BB%96%E5%87%BD%E6%95%B0)
    *   [HTTP 编程](#http-%E7%BC%96%E7%A8%8B)
        *   [HTTP客户端](#http%E5%AE%A2%E6%88%B7%E7%AB%AF)
            *   [http.Get()](#httpget)
            *   [http.Post()](#httppost)
            *   [http.PostForm()](#httppostform)
            *   [http.Head()](#httphead)
            *   [(\*http.Client).Do()](#httpclientdo)
            *   [高级封装](#%E9%AB%98%E7%BA%A7%E5%B0%81%E8%A3%85)
            *   [自定义Client](#%E8%87%AA%E5%AE%9A%E4%B9%89client)
            *   [自定义 http.Transport](#%E8%87%AA%E5%AE%9A%E4%B9%89-httptransport)
            *   [http.RoundTripper 接口](#httproundtripper-%E6%8E%A5%E5%8F%A3)
            *   [Client](#client)
        *   [HTTP服务端](#http%E6%9C%8D%E5%8A%A1%E7%AB%AF)
            *   [处理http请求](#%E5%A4%84%E7%90%86http%E8%AF%B7%E6%B1%82)
            *   [处理https请求](#%E5%A4%84%E7%90%86https%E8%AF%B7%E6%B1%82)
    *   [RPC 编程](#rpc-%E7%BC%96%E7%A8%8B)
        *   [RPC 支持与处理](#rpc-%E6%94%AF%E6%8C%81%E4%B8%8E%E5%A4%84%E7%90%86)
        *   [Gob(go 专用无法用于其他语言)](#gobgo-%E4%B8%93%E7%94%A8%E6%97%A0%E6%B3%95%E7%94%A8%E4%BA%8E%E5%85%B6%E4%BB%96%E8%AF%AD%E8%A8%80)
        *   [RPC接口](#rpc%E6%8E%A5%E5%8F%A3)
    *   [JSON 处理](#json-%E5%A4%84%E7%90%86)
        *   [编码](#%E7%BC%96%E7%A0%81)
        *   [解码](#%E8%A7%A3%E7%A0%81)
        *   [未知结构的json](#%E6%9C%AA%E7%9F%A5%E7%BB%93%E6%9E%84%E7%9A%84json)
        *   [json流式读写](#json%E6%B5%81%E5%BC%8F%E8%AF%BB%E5%86%99)
    *   [网站](#%E7%BD%91%E7%AB%99)
        *   [模板](#%E6%A8%A1%E6%9D%BF)
            *   [模板缓存](#%E6%A8%A1%E6%9D%BF%E7%BC%93%E5%AD%98)
            *   [错误处理](#%E9%94%99%E8%AF%AF%E5%A4%84%E7%90%86)
            *   [动态请求和静态资源分离](#%E5%8A%A8%E6%80%81%E8%AF%B7%E6%B1%82%E5%92%8C%E9%9D%99%E6%80%81%E8%B5%84%E6%BA%90%E5%88%86%E7%A6%BB)
            *   [相关内容补充](#%E7%9B%B8%E5%85%B3%E5%86%85%E5%AE%B9%E8%A1%A5%E5%85%85)

Socket 编程

* * *

### Accept() 函数

listener对象的Accept方法会直接阻塞，直到一个新的连接被创建，然后会返回一个net.Conn对象来表示这个连接。

### Dial() 函数

```go
// net 为网络协议的名字
// addr 为 ip 地址或域名，端口号以 “ : ” 形式跟随在地址后，可选
// Conn 为连接对象，连接成功时返回
func Dial(net, addr string) (Conn, error)
```

```go
conn, err := net.Dial("tcp", "192.168.0.10:2100")

conn, err := net.Dial("udp", "192.168.0.10:2100")

conn, err := net.Dial("ip4:icmp", "www.domian.com") // icmp 链接，使用协议名称

conn, err := net.Dial("ip4:1", "192.168.0.10") // icmp 链接，使用协议编号
```

目前 Dial 支持如下协议

*   tcp
*   tcp4 (仅限ipv4）
*   tcp6 (仅限ipv6）
*   udp
*   udp4
*   udp6
*   ip
*   ip4
*   ip6

发送和接收分别使用 conn 的 Write() 和 Read() 方法

实际上Dial()函数是对DialTCP(),DialUDP(),DIalIP(),DialUnix()的封装，也可以调用这些函数功能是一样的

```go
func DialTCP(net string, laddr, raddr *TCPAddr) (c *TCPConn, err error)
func DialUDP(net string, laddr, raddr *UDPAddr) (c *UDPConn, err error)
func DialIP(net string, laddr, raddr *IPAddr) (*IPConn, error)
func DialUnix(net string, laddr, raddr *UnixAddr) (c *UnixConn, err error)
```

```go
conn, err := net.Dial("tcp", host)

// 下面这两个函数在Dial()中得到了封装
tcpAddr, err := net.ResolveTCPAddr("tpc4", host) // net.ResolveTCPAddr()  用于解析地址和端口号
conn, err := net.DialTCP("tcp", nil, tcpAddr) // net.DialTCP()  用于建立连接
```

### 一些其他函数

```go
// 验证IP地址有效性
func ParseIP()

// 创建子网掩码
func IPv4Mask(a, b, c, d byte) IPMask

// 获取默认子网掩
func (ip IP) DefaultMask() IPMask

// 根据域名查找IP的
func ResolveIPAddr(net, addr string) (*IPAddr, error) 
func LookupHost(name string) (cname string, addrs []string, err error)
```

HTTP 编程

* * *

net/http包，涵盖了HTTP客户端和服务端的具体实现

### HTTP客户端

提供的方法

```go
func (c *Client) Get(url string) (r *Response, err error)
func (c *Client) Post(url string, bodyType string, body io.Reader) (r *Response, err error)
func (c *Client) PostForm(url string, data url.Values) (r *Response, err error)
func (c *Client) Head(url string) (r *Response, err error)
func (c *Client) Do(req *Request) (resp *Response, err error)
```

#### http.Get()

```go
resp, err := http.Get("http://example.com/")
if err != nil {
    ...
    return
}
defer resp.Body.close()
io.Copy(os.Stdout, resp.Body)
```

#### http.Post()

参数依次为 URL， 数据资源类型，比特流

```go
resp, err := http.Post("url", "image/jpeg", &imageDataBuf)
if err != nil {
    ...
    return
}
if resp.StatusCode != http.StatusOK {
    ...
    return
}
```

#### http.PostForm()

实现了标准编码格式为application/x-www-form-urlencoded的提交

```go
resp, err := http.PostForm("url", url.Values{"title":{"article title"}, "content":{"article body"}})
if err != nil {
    ...
    return
}
```

#### http.Head()

#### (\*http.Client).Do()

如果需要自定义一些Http Header字段，比如自定义的User-Agent，传递Cookie等

```go
req, err := http.NewRequest("GET", "url", nil)
req.Header.Add("User-Agent", "Go book Custom User-Agent")
client := &http.Client{...}
resp, err := client.Do(req)
```

#### 高级封装

http 的 Get Post PostForm Head 等方法都是在http.DefaultClient 的基础上进行调用的，比如http.Get()等价于http.DefaultClient.Get()

```go
// Client 类型
type Client struct {
    // Transport 用于确定 HTTP 请求的创建机制（运行机制），为空时使用默认DefaultTransport，
    // Transport类型必须实现http.RoundTripper接口，http.Transport 也可以自定义
    Transport RoundTripper
    
    // CheckRedirect 定义重定向策略（处理重定向的策略）
    // Get Head 返回 30X 状态码时，Client会遵循跳转规则之前先调用这个CheckRedirect函数
    // 不为空时客户跟踪 HTTP 重定向前调用该函数
    // req 和 via 这两个参数分别为即将发起的请求和已经发起的所有请求，最早发起的在最前面
    // 如果返回错误，客户端将直接返回错误，不再发起请求
    // 为空 Client 将采用一种确认策略 将在10个连续请求后终止
    CheckRedirect func(req *Request, via []*Request) error
    
    // Jar用于设定Client的Cookie
    // Jar 必须实现http.CookieJar接口
    // CookieJar接口预定义SetCookies() 和 Cookies() 两个方法
    // Jar 为空，Cookie将不会在请求中发送，并会在响应中忽略
    // 实际一般都使用http.SetCookie() 方法来设定Cookie
    Jar CookieJar
}
```

使用自定义的Client及其Do方法我们可以很灵活的控制HTTP请求，比如自定义header，改写重定向策略等

#### 自定义Client

```go
client := &http.Client {
    CheckRedirect: redirectPolicyFunc,
}

resp, err := client.Get("url")
req, err := http.NewRequest("GET", "url",nil)
req.Header.Add("","")
resp, err := client.Do(req)
```

#### 自定义 http.Transport

其指定一个HTTP请求的运行规则

Transport结构

```go
type Transport struct {
// Proxy指定用于针对特定请求返回代理的函数。
// 如果返回非空错误，请求将终止并返回该错误
// 如果Proxy为空或者返回一个空的URL指针，将不使用代理
    Proxy func(*Request)(*url.URL, error)
    
// 指定用于创建TCP链接的dail()函数，默认使用net.Dial()函数
    Dial func(net, addr string)(c net.Conn, err error)
    
//指定用户tls.Client的TLS配置，有默认配置
    TLSClientConfig *tls.Config

    DisableKeepAlives bool // 是否取消长链接，默认false，启用长链接
    
    DisableCompression bool  // 是否取消压缩GZip，默认false，启用压缩
    
// 控制每个host所需要保持的最大空闲连接数，默认值使用DefaultMaxIdleConnsPerHost
    MaxIdleConnsPerHost int
}
```

其他成员方法

```go
// 用于关闭所有非活跃链接
func (t *Transport) CloseIdleConnections()

// 注册并启用新的传输协议，如websocket的传输协议标准ws，或ftp file等
func (t *Transport) RegisterProtocol(scheme string, rt RoundTripper)

// 用于实现http.RoundTripper接口
func (t *Transport) RoundTrip(req *Request) (resp *Response, err error)

tr := &http.Transport {
    TLSClientConfig: &tls.Config{RootCAs: pool},
    DisableCompression: true,
}
client := &http.Client{Transport: tr}
resp, err := client.Get('url')
```

#### http.RoundTripper 接口

自定义Client的第一个公开成员就是Transport，该成员必须实现RoundTripper接口

```go
type RoundTripper interface {
    RoundTrip(*Request) (*Response, error)
}
```

RoundTripper接口很简单只有一个方法RoundTrip。RoundTrip执行一个单一的HTTP事务，返回相应的响应信息。 RoundTrip函数的实现不应试图去理解响应的内容。如果RoundTrip得到一个响应， 无论该响应的HTTP状态码如何，都应将返回的err设置为nil。非空的err 只意味着没有成功获取到响应。 类似地，RoundTrip也不应试图处理更高级别的协议，比如重定向、认证和 Cookie等。 RoundTrip不应修改请求内容, 除非了是为了理解Body内容。每一个请求 的URL和Header域都应被正确初始化

#### Client

Client 设计为上下两层结构

*   一层是http.Client类及其封装的基础方法（业务层，只关心请求的业务逻辑本身）无需关心非业务技术细节
*   另一层传输层，抽象了http.RoundTripper接口，并通过http.Transport实现接口，从而处理更多细节
*   这些细节包括：
    *   http底层传输细节
    *   http代理
    *   gzip压缩
    *   连接池及其管理
    *   认证（ssl等）

### HTTP服务端

#### 处理http请求

http.ListenAndServe()

```go
// addr 监听地址
// handler 服务处理程序

func ListenAndServe(addr string, handler Handler) error
```

handler 服务处理程序，通常为空，由http.DefaultServeMux 进行处理，http.Handle() 或 http.HandleFunc() 默认注入http.DefaultServeMux中

```go
http.Handle("/foo", fooHandler)

// 第一个参数是目标路径，可以是字符串或者字符串形式的正则
// 第二个参数是集体的回调方法
// 回调的第一个参数是ResponseWrite，包装处理服务端的响应信息
// 回调的第二个参数是Request，请求的数据结构体，代表一个客户端
http.HandleFunc("/bar", func(w http.ResponseWriter, r *http.Request){
    fmt.Fprintf(w, "Hello, %q", html.EscapeString(r.URL.Path))
})
log.Fatal(http.ListenAndServe(":8080", nil))

// 自定义Server

s := &http.Server{
    Addr: ":8080",
    Handler: myHandler,
    ReadTimeout: 10*time.Second,
    WriteTimeout: 10*time.Second,
    MaxHeaderBytes: 1 << 20,
}
log.Fatal(s.ListenAndServe())
```

#### 处理https请求

http.ListenAndServeTLS()

```go
func ListenAndServeTLS(addr, certFile, keyFile string, handler Handler) error
```

ListenAndServeTLS 与 ListenAndServe 行为是一致的，区别在于只处理https。服务器上必须包含证书和与之匹配的私钥的相关文件，certFile对应ssl证书文件存放路径，keyFile对应证书私钥文件路径

```go
http.ListenAndServe(":8080","cert.pem","key.pem", nil))
serve.ListenAndServeTLS("cert.pem","key.pem")
```

RPC 编程

* * *

Remote Procedure Call -> 远程过程调用 RPC

RPC是一种通过网络从远程计算机程序上请求服务，而不需要了解底层网络细节的应用程序通信协议，其构建与TCP或UDP或HTTP之上，允许开发者直接调用另一计算机上的程序而无需额外的为这个调用过程编写网络通信相关代码，使得开发包括网络分布式程序在内的应用程序更加容易。

RPC采用C/S的工作模式,客户端程序发送一个带有参数的调用信息，服务端进程保持睡眠状态直到客户端的调用信息到达。服务端获得参数计算结果并发送应答信息，然后等待下个调用。客户端收到应答后继续执行。

### RPC 支持与处理

net/rpc

在RPC服务端，可将一个对象注册为可访问的服务，之后该对象的公开方法就能够以远程的方式提供访问。一个RPC服务端可以注册多个不同类型的对象，但不允许注册同一个类型的多个对象。

一个对象中只有满足以下条件的方法才能被服务端设置为可供远程访问：

*   必须是在对象外部可公开的方法
*   必须有两个参数，且参数的类型都必须是包外部可以访问的类型或者是Go内置的类型
*   第二个参数必须是一个指针
*   方法必须返回一个errror类型的值

```go
func (t *T) MethodName(argType T1, replyType *T2) error
```

T,T1,T2默认会使用内置的encoding/gob 包进行编码解码，第一个参数有客户端传入，第二个参数表示要返回给客户端的结果。

服务端可以通过rpc.ServeConn处理单个请求，多数下通过TCP或是HTTP监听网络地址来创建服务

net/rpc 包提供rpc.DIal()和rpc.DialHTTP()来于指定的RPC服务端建立连接，客户端使用同步或异步的方式处理结果，RPC客户端的Call()方法进行同步处理，客户端按顺序执行。接收完服务端处理结果后才能继续执行后面。Go()方法则可以进行异步处理，无需等待即可处理后面的程序。当有结果后在进行相应的处理。

### Gob(go 专用无法用于其他语言)

Gob( encoding/gob ) 是一个序列化数据结构的编码解码工具。数据使用 Gob 进行序列化后能够用于网络传输。Gob 是二进制编码数据流，Gob 流可以自解释的，保证高效的同时保证完备的表达力

### RPC接口

```go
type ClientCodec interface {
    WriteRequest (*Request, interface {}) error
    ReadResponseHeader (*Respinse) error
    ReadResponseBody (interface {}) error
    
    Close() error
}

type ServerCodec interface {
    ReadRequestHeader (*Request) error
    ReadRequestBody (interface {}) error
    WriteResponse (*Response, interface{}) error
    
    Close() error
}
```

JSON 处理

* * *

encoding/json

### 编码

```go
json.Marshal()
```

channel、complex、func 类型不可转换

```go
func Marshal(v interface{}) ([]byte, error) // stringify
```

如果转化前的数据结构中出现指针，那么将会转化指针所指向的值，如果指针指向的是零值， 那么null将作为转化后的结果输出

*   布尔转json还是布尔
*   浮点 整型会被转化为json里的常规数字
*   字符串以utf-8转化为unicode
*   数组和切片会转为json里的数组，\[\]byte会被转为base64编码后的字符串，slice类型0值转为null
*   结构体转为json对象，切只有大写开头的可被导出自字段才会转化输出
*   转化map，其类型必须是map\[string\] T

### 解码

```go
json.Unmarshal()
```

```go
func Unmarshal(data []byte, v interface{}) error
```

第一个参数是输入\[\]byte类型，第二个是一个类型的实例对象，是输出到的容器，放转化结果

### 未知结构的json

空接口是通用类型。如果结构未知将其输出到一个空接口即可

*   JSON中的布尔值将会转换为Go中的bool类型
*   数值会被转换为Go中的float64类型
*   字符串转换后还是string类型
*   JSON数组会转换为\[\]interface{}类型
*   JSON对象会转换为map\[string\]interface{}类型
*   null值会转换为nil。

```go
val.(Type)
```

### json流式读写

json包中有Decoder和Encoder两个用于json流式读写类型，提供了NewDecoder()和NewEncoder()的两个函数实现

```go
func NewDecoder(r io.Reader) *Decoder
func NewEncoder(r io.Writer) *Encoder
```

网站
--

```go
http.HandleFunc('path', callback) // 路由
http.ListenAndServe("", nil)
io.WriteString(target, content)
```

### 模板

html/template

```go
template.ParseFiles("htmlfile")
```

*   {{}} 模板代码
*   if 判断式
*   range 循环体
*   . 表示循环中的当前元素，.|formatter表示当前元素以formatte方式输出，.|html以html显示，转义等

#### 模板缓存

init函数会在main函数之前执行

```go
templates := make(map[string]*template.Template)
```

提前加载ParseFiles，存在templates中

template.Must() 确保模板解析不成功是一定会触发错误处理流程

```go
func Must(t *Template, err error) *Template
```

#### 错误处理

panic() 导致崩溃的问题，HandleFunc上层包裹一个函数使用闭包返回一个在defer中使用recover捕获的函数，参数与HandleFunc一致

#### 动态请求和静态资源分离

```go
http.ServerFile(http.ResponseWrite, *http.Request, path string)
```

读取文件写到http.ResponseWiter并返回

#### 相关内容补充

*   ResponseWrite/Request 都有啥
*   path.Ext(path string) string // 返回路径扩展名
*   os.Stat()
*   os.IsExist()
*   os.Create()
*   os.Copy()
*   ioutil.TempFile()
*   http.StatusFound
*   http.StatusInternalServerError
*   http.NotFound()
*   http.Error()
*   http.ServeMux
*   http.ServeMux.HandleFunc()
*   log.Println()
*   error.Error()