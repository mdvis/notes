# session
\[toc\]

Cookie

* * *

*   会话期 Cookie 会话期 cookies 将会在客户端关闭时被移除。 会话期 cookie 不设置 Expires 或 Max-Age 指令。注意浏览器通常支持会话恢复功能。
*   持久化 Cookie 持久化 Cookie 不会在客户端关闭时失效，而是在特定的日期（Expires）或者经过一段特定的时间之后（Max-Age）才会失效。
*   非法域 属于特定域的 cookie，假如域名不能涵盖原始服务器的域名，那么应该被用户代理拒绝。
*   Cookie 前缀 名称中包含 \_\_Secure- 或 \_\_Host- 前缀的 cookie，只可以应用在使用了安全连接（HTTPS）的域中，需要同时设置 secure 指令。另外，假如 cookie 以 \_\_Host- 为前缀，那么 path 属性的值必须为 "/"（表示整个站点），且不能含有 domain 属性。对于不支持 cookie 前缀的客户端，无法保证这些附加的条件成立，所以 cookie 总是被接受的。

```
type Cookie struct {
Name string
Value string
Path string
Domain string
Expries time.Time
RawExpries string

MaxAge int
Secure bool
HttpOnly bool
Raw string
Unparsed []string
}
```

*   http.SetCookie(w http.ResponseWriter, &http.Cookie)
*   Request.Cookie(name string)
*   Requese.Cookies()

```
for _,cookie := range r.Cookies(){
cookie.Name
cookie.Value
}
```

Session

* * *

会话，有始有终的一系列动作/消息，当Session一词与网络协议相关联时，它又往往隐含了“面向连接”和/或“保持状态”这样两个含义

Session 在 Web 开发中，指一类用来在客户端与服务端之间保持状态的解决方案。有时亦指这种解决方案的存储结构。

Session 是一种服务端机制，服务端使用类似散列表的结构（或者就是散列表）来保存信息。

*   客户端请求创建 Session
*   服务端检查客户端请求是否包含 Session 表示（Session ID）
*   如果有 Session 标识，说明已创建过，按照 Session ID 把 Session 检索出来使用（如果检索不到（可能服务端已删除对应 Session，用户人为添加的 JSESSION 参数），可能会新建一个）
*   如果不包含 Session ID 则会创建一个 Session 并且生成一个相关联的 Session ID，返回给客户端保存

\==Session机制本身并不复杂，然而其实现和配置上的灵活性却使得具体情况复杂多变。这也要求我们不能把仅仅某一次的经验或者某一个浏览器、服务器的经验当作普遍适用的。==

### Session 创建

1.  生成全局唯一标识 Session ID
2.  开辟数据存储空间。服务端程序一般会在内存中创建相应的数据结构，但这种情况下，系统一旦断电，所有的会话数据就会丢失，如果是电子商务类网站，这将造成严重的后果。所以为了解决这类问题，你可以将会话数据写到文件里或存储在数据库中，当然这样会增加I/O开销，但是它可以实现某种程度的Session持久化，也更有利于Session的共享。
3.  Session ID 发送给客户端（最关键）
    *   方式一 Cookie
    *   方式二 URL 重写（在返回给用户的页面里的所有的URL后面追加 Session 标识符，比较麻烦，但客户端禁用 Cookie 的话是首选方案）

### Session 管理

*   全局 Session 管理器
*   保证 Session ID 全局唯一性
*   为每个客户关联一个 Session
*   Session 的存储（存储到内存 文件 数据库）
*   Session 过期处理

Session 劫持

* * *

Session 劫持是中间人攻击的一种类型，SessionId 这暴露后可以直接冒充用户

### 防范

#### 方法一

*   SessionId 只允许 Cookie 设置，而不是通过 URL 重置的方式，同时设置 httponly
    *   这样可以防止 Cookie 被 XSS 读取从而引起 Session 劫持
    *   Cookie 设置不会像 URL 重置那样容易获取 SessionId
*   每个请求中加上 token，加一个隐藏 token 每次验证 token 保证用户请求唯一性

#### 方法二

给 Session 额外设置一个创建时间的值，过期销毁，重新生成，一定程度可以防止劫持

上面两个手段的组合可以在实践中消除Session劫持的风险，一方面，由于SessionID频繁改变，使攻击者难有机会获取有效的SessionID；另一方面，因为SessionID只能在Cookie中传递，然后设置了httponly，所以基于URL攻击的可能性为零，同时被XSS获取SessionID也不可能。最后，由于我们还设置了MaxAge=0，这样就相当于Session、Cookie不会留在浏览器的历史记录里面。