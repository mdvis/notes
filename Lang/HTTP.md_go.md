# HTTP
http

* * *

\[toc\]

Request

* * *

### 请求行

GET /domains/example/ HTTP/1.1

### 请求头

Host/User-Agent/Accept/Accept-Encoding/Accept-Charset/...

#### Cache-Control:

*   private 默认值，只被单个用户缓存，不能共享缓存（即代理服务器不能缓存）
*   no-cache 强制协商缓存，提交给原始服务器验证
*   no-store 不使用任何缓存
*   pubilc 可以被任何对象缓存（客户端，代理服务器）

### 主体（请求体)

与Header部分有个空行

### Method

*   PUT(增)
*   DELETE(删)
*   POST(改)
*   GET(查)

| Name | Ver. | Func |
| --- | --- | --- |
| GET | 1.0 | 只被用于数据读取(幂等) |
| HEAD | 1.0 | 获取响应头，无响应主体，常用于查看服务器性能 |
| POST | 1.0 | 创建或修改 |
| PUT | 1.1 | 更新，用于已有资源整体替换(幂等) |
| DELETE | 1.1 | 删除  |
| CONNECT | 1.1 | 预留，管道 |
| OPTIONS | 1.1 | 与HEAD类似，一般用于查看服务端性能，会返回资源所支持的请求方法；跨域时会用于嗅探，用以判断是否有权限 |
| TRANCE | 1.1 | 回显服务器收到的请求信息，用于测试或诊断 |
| PATCH | 1.1 | 与PUT类似，更新，用于部分更新，资源不存在时新建 |

Response

* * *

### 状态行

HTTP/1.1 200 OK

### 响应头

Server/Date/Content-Type/Transfer-Encoding/Connection/content-Length/...

Connection: Keep-Alive 根据服务器设置的保持时间(不会永久保持链接)维持已建立的TCP链接不关闭，达到复用的目的

### 主体

与Header部分有个空行

Conn

* * *

```go
c, err := srv.newConn(rw)
if err != nil {
    continue
}
go c.serve()
```

```go
type ServeMux struct {
    mu sync.RWMutex
    m map[string]muxEntry
}

func (mux *ServeMux) handler(r *Request) Handler {
    mux.mu.RLock()
    defer mux.mu.RUnlock()
    
    h:=mux.match(r.Host + r.URL.Path)
    if h == nil {
        h=match(r.URL.Path)
    }
    
    if h == nil {
        h=NotFoundHandler()
    }
    
    return h
}
```

```go
type muxEntry struct {
    explicit bool
    h Handler
}
```

```go
type Handler interface {
    ServeHTTP(ResponseWriter, *Request)
}

type HandlerFunc func(ResponseWriter, *Request)

func (f HandlerFunc) ServeHTTP(w ResponseWriter, r *Request){
    f(w, r)
}
```

```go
func (mux *ServeMux) handler(r *Request) Handler {
    mux.mu.RLock()
    defer mux.mu.RUnlock()
    
    h:=mux.match(r.Host + r.URL.Path)
    if h == nil {
        h = mux.match(r.URL.Path)
    }
    if h == nil {
        h = NotFoundHandler()
    }
    return h
}
```

Handler

* * *

![drawio](api/images/wCU7sNdHu0sK/drawio-{_sketch__false})