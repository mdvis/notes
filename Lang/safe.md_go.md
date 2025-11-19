# safe
safe

安全编程

* * *

\[toc\]

数据加密

* * *

### 对称加密

*   采用单秘钥的加密算法
*   构成：明文+加密算法+秘钥
*   常见的算法：DES，AES，RC4

### 非对称加密

*   采用双秘钥加密算法
*   构成：明文+加密算法+私钥+公钥
*   公私钥均可加解密，公钥加密要私钥解密，私钥加密要公钥解密
*   常见算法：RSA
*   私钥不能暴露，公钥是公开的

### 哈希算法

*   只需要加密，生成密文，不需要解密或者不可解密
*   是一种从任意数据中创建固定长度摘要信息的办法
*   常见算法：MD5，SHA-1等

数字签名

* * *

*   指用于标记数字文件拥有者、创造者、分发者身份的字符串
*   数字签名拥有标记文件身份、分发的不可抵赖性等作用
*   常用的数字签名采用了非对称加密

a公司发布a.exe文件，a.exe加入a的签名（a公司私钥加密的哈希值），得到签名后的a.exe，查看签名。用a公司的公钥解密哈希从而验证是否篡改，是否是a公司发布

数字证书

* * *

数字证书包含公钥，使用公钥加密信息给公钥发布者。

PKI 体系

* * *

PKI，全称公钥基础设施，是使用非对称加密理论，提供数字签名、加密、数字证书等服务的体系，一般包括权威认证机构（CA)、数字证书库、秘钥备份及恢复系统、证书作废系统、应用接口等。

围绕PKI体系，建立了一些权威的、公益的机构。它们提供数字证书库、密钥备份及恢复系统、证书作废系统、应用接口等具体的服务

go 中的 hash 函数

* * *

*   crypto/sha1
*   crypto/md5

```go
// 直接生成
md5.New()
sha1.New()

// 计算文件
md5h := md5.New()
sha1h := sha1.New()
file, err := os.Open(p)
io.Copy(sha1h, file)
io.Copy(md5h, file)
```

加密通信

* * *

https = http + ssl/tls

ssl 是网景公司开发的位于TCP与HTTP协议间的透明安全协议

tls 是由IETF实现的建立在ssl v3.0之上的兼容协议，区别在于所支持的加密算法

### 加密通信流程

下面过程都是依赖于SSL/TLS层实现的。在实际开发中，SSL/TLS的实现和工作原理比较复杂，但基本流程一致

1.  输入https协议的网址
2.  服务器向浏览器返回证书，浏览器检查证书合法性
3.  验证和发行
4.  浏览器使用证书中的公钥加密一个随机对称秘钥，并将加密后的秘钥和使用秘钥加密后的请求URL一起发送到服务器
5.  服务器用私钥解密随机对称秘钥，并用获取的秘钥解密加密的请求URL
6.  服务器把用户请求的网页用秘钥加密，并返回给用户。
7.  浏览器用秘钥解密服务器发来的网页数据，并将其显示

ssl协议有两层组成，上层协议包括ssl握手协议、更改密码规格协议、警报协议，下层协议包括ssl记录协议

ssl握手协议建立在ssl记录协议之上，在实际数据传输前用于在客户端与服务器之间进行握手。握手是一个协商过程。这个协议使得客户和服务器能够互相鉴别身份，协商加密算法。在任何数据传输前必须先握手

握手之后才能进行ssl记录协议，它的主要功能是为高层协议提供数据封装、压缩、添加mac、加密等支持。

### 支持https的web服务器

*   crypto/x509 一种常用的数字证书格式
*   crypto/rand 伪随机函数发生器，产生基于时间和CPU时钟的伪随机函数
*   crypto/rsa 非对称加密算法
*   crypto/tls 传输层安全协议
*   crypto/pem 非对称加密体系下，一般用于存放公钥和私钥的文件
*   http.ListenAndServerTLS
*   fmt.Sprintf()
*   tls.Config
*   tls.Certificate
*   net.Listen
*   tls.NewListener
*   http.Serve
*   pem.Decode

### 支持https的文件服务器

### 基于SSL/TSL的ECHO程序

id: f329a6fbdfff4430b8e706cc72675c4a parent\_id: 0089871cb65c479da25a476e5fe78950 created\_time: 2022-03-01T08:07:32.000Z updated\_time: 2022-07-04T08:19:47.792Z is\_conflict: 0 latitude: 0.00000000 longitude: 0.00000000 altitude: 0.0000 author: source\_url: is\_todo: 0 todo\_due: 0 todo\_completed: 0 source: joplin-desktop source\_application: net.cozic.joplin-desktop application\_data: order: 1650118635360 user\_created\_time: 2022-03-01T08:07:32.000Z user\_updated\_time: 2022-04-16T14:17:15.376Z encryption\_cipher\_text: encryption\_applied: 0 markup\_language: 1 is\_shared: 0 share\_id: conflict\_original\_id: master\_key\_id: type\_: 1