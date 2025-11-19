### HTTP Authorization 头的详细解释

HTTP `Authorization` 请求头是 HTTP 协议中用于客户端向服务器提供身份验证凭据的头部字段。它主要用于访问受保护的资源，当客户端首次请求此类资源时，如果未携带凭据，服务器通常会返回 401 Unauthorized 状态码，并附带 `WWW-Authenticate` 响应头。该响应头会列出服务器支持的身份验证方案（authentication schemes）以及所需的其他参数。客户端收到后，会选择最安全的支持方案，收集用户凭据（如用户名和密码），编码后放入 `Authorization` 头中重新发送请求，从而完成认证过程。

此头部属于通用的 HTTP 身份验证框架（General HTTP authentication framework），支持多种认证机制。它在跨域重定向（cross-origin redirects）中会被自动移除，以防止凭据泄露。该头部自 2015 年 7 月起在主流浏览器中广泛支持，且不属于禁止修改的请求头（forbidden request header）。在实际应用中，它常用于 API 认证、Web 服务访问控制等领域。

#### 语法（Syntax）
`Authorization` 头的通用语法格式为：
```
Authorization: <auth-scheme> <authorization-parameters>
```
- `<auth-scheme>`：身份验证方案的名称（如 Basic、Bearer、Digest），区分大小写。
- `<authorization-parameters>`：方案特定的凭据参数，通常是编码后的字符串。

例如：
- Basic 方案：`Authorization: Basic <base64-encoded-credentials>`
- Bearer 方案：`Authorization: Bearer <token>`

头部值不允许换行，且必须严格遵循方案的编码规则。

#### 指令（Directives）
`Authorization` 头本身没有独立的指令（directives），其内容完全取决于所使用的认证方案。每个方案定义了自己的参数格式，例如：
- Basic 方案：参数为 Base64 编码的 "username:password" 字符串。
- Digest 方案：参数包括多个键值对，如 username、realm、nonce、uri、response 等，用于更复杂的哈希计算。
- Bearer 方案：参数通常是一个不透明的访问令牌（access token），无需进一步解析。

#### 常见身份验证方案（Common Authentication Schemes）
HTTP 支持多种认证方案，以下是常见的几种：

1. **Basic**：
   - 描述：最简单的认证方案，使用 Base64 编码用户名和密码。易实现，但安全性低，因为 Base64 不是加密，仅是编码，易被解码。
   - 适用场景：内部网络或结合 HTTPS 使用。
   - 参数格式：Base64(username:password)。
   - 安全考虑：必须通过 HTTPS 传输，否则凭据易被窃取。

2. **Bearer**：
   - 描述：常用于 OAuth 2.0 和 JWT（JSON Web Tokens），携带一个令牌（token）作为凭据。服务器验证令牌的有效性，而非用户名/密码。
   - 适用场景：API 认证、单点登录（SSO）。
   - 参数格式：直接是令牌字符串，如访问令牌或 ID 令牌。
   - 安全考虑：令牌应有过期时间，并使用 HTTPS 防止中间人攻击。

3. **Digest**：
   - 描述：基于 MD5 或 SHA 哈希的认证方案，避免明文传输密码。客户端使用服务器提供的 nonce（一次性随机数）计算哈希响应。
   - 适用场景：对安全性要求较高的遗留系统。
   - 参数格式：多个逗号分隔的键值对，如 `username="user", realm="test", nonce="abc123", uri="/resource", response="hashed-value"`。
   - 安全考虑：比 Basic 安全，但 nonce 需防重放攻击，且 MD5 已不推荐使用（建议升级到更强的哈希）。

其他方案还包括 Negotiate（Kerberos）、AWS4-HMAC-SHA256（AWS 签名）等，具体取决于服务器配置。

#### 示例（Examples）
1. **Basic 方案示例**：
   - 假设用户名 "aladdin"，密码 "open sesame"。
   - 编码：Base64("aladdin:open sesame") = "YWxhZGRpbjpvcGVuIHNlc2FtZQ=="。
   - 请求头：`Authorization: Basic YWxhZGRpbjpvcGVuIHNlc2FtZQ==`。

2. **Bearer 方案示例**：
   - 假设 OAuth 访问令牌为 "mF_9.B5f-4.1JqM"。
   - 请求头：`Authorization: Bearer mF_9.B5f-4.1JqM`。

3. **Digest 方案示例**：
   - 请求头：`Authorization: Digest username="Mufasa", realm="testrealm@host.com", nonce="dcd98b7102dd2f0e8b11d0f600bfb0c093", uri="/dir/index.html", qop=auth, nc=00000001, cnonce="0a4f113b", response="6629fae49393a05397450978507c4ef1", opaque="5ccc069c403ebaf9f0171e9517f40e41"`。

这些示例假设在 HTTPS 连接中使用。

#### 安全考虑（Security Considerations）
- **传输安全**：始终结合 HTTPS 使用，否则凭据可能被嗅探（man-in-the-middle attack）。
- **凭据存储**：客户端不应持久存储明文凭据；服务器端需安全哈希密码。
- **攻击风险**：Basic 易遭字典攻击；Bearer 令牌泄露可能导致会话劫持；Digest 需防重放和彩虹表攻击。
- **最佳实践**：优先使用现代方案如 Bearer + JWT；实施速率限制防暴力破解；定期轮换密钥或令牌。
- **跨域问题**：在 CORS（Cross-Origin Resource Sharing）中，需显式允许 Authorization 头。
- **隐私**：避免在日志中记录完整头部，以防敏感信息泄露。

#### 相关头部和状态码（Related Headers and Status Codes）
- **WWW-Authenticate**：服务器响应头，用于指定认证方案和参数（如 `WWW-Authenticate: Basic realm="Access to the staging site"`）。
- **Proxy-Authorization**：类似 Authorization，但用于代理服务器认证。
- **401 Unauthorized**：表示缺少或无效凭据，需要认证。
- **403 Forbidden**：认证通过但权限不足。
- **407 Proxy Authentication Required**：代理服务器要求认证。

如果服务器支持多种方案，客户端应选择最安全的（如优先 Digest 过 Basic）。更多细节可参考 RFC 7235（HTTP/1.1 Authentication）和 RFC 7617（Basic Authentication）。