# HTTP 综合指南


## HTTP 方法

HTTP（超文本传输协议）方法是Web通信中用来指示客户端和服务器之间进行特定操作的一种机制。常见的HTTP方法（或称为HTTP动词）有以下几种，每个方法代表不同的操作类型：
## GET
- **作用**：用于请求指定资源的表示，通常用于获取数据。
- **特点**：GET请求是安全的、幂等的（多次请求相同的资源，结果是相同的）。
- **用途**：查看数据或获取页面。
- **示例**：`GET /users` —— 获取用户列表。
## POST
- **作用**：用于向指定资源提交数据（如表单提交）。POST请求一般会产生副作用，例如向服务器添加数据。
- **特点**：POST请求用于创建资源，非幂等（多次请求可能导致重复提交）。
- **用途**：提交表单，上传文件。
- **示例**：`POST /users` —— 提交新的用户信息。
## PUT
- **作用**：用于更新指定资源的全部数据。如果资源不存在，通常会创建新的资源。
- **特点**：PUT是幂等的。多次提交相同的PUT请求，效果是一样的。
- **用途**：更新数据，替换已有资源。
- **示例**：`PUT /users/123` —— 更新ID为123的用户数据。
## PATCH
- **作用**：用于更新指定资源的部分数据。相比PUT，PATCH只更新部分资源，而不是全部资源。
- **特点**：PATCH是幂等的，但它只改变部分内容。
- **用途**：部分更新数据。
- **示例**：`PATCH /users/123` —— 更新ID为123的用户的一些信息（例如修改用户的邮箱）。
## DELETE
- **作用**：用于删除指定资源。
- **特点**：DELETE是幂等的，多次请求删除相同的资源不会产生不同的效果。
- **用途**：删除数据。
- **示例**：`DELETE /users/123` —— 删除ID为123的用户。
## HEAD
- **作用**：与GET方法类似，但服务器在响应中不会返回消息体，只返回头信息。
- **特点**：常用于检查资源的存在性或获取资源的meta信息（如内容类型、修改时间等）。
- **用途**：获取资源的元数据，不获取实际内容。
- **示例**：`HEAD /users/123` —— 获取ID为123的用户的元数据。
## OPTIONS
- **作用**：用于查询服务器支持的HTTP方法（如GET、POST等）。
- **特点**：用于了解当前资源所支持的操作。
- **用途**：获取请求支持的HTTP方法或执行跨域请求时的预检请求。
- **示例**：`OPTIONS /users` —— 查询用户资源支持的操作方法。
## TRACE
- **作用**：用于回显服务器收到的请求，通常用于调试或诊断。
- **特点**：TRACE会返回请求的完整内容。
- **用途**：调试工具。
- **示例**：`TRACE /users` —— 调试请求。
## CONNECT
- **作用**：将客户端连接到代理服务器，通常用于通过代理建立隧道（比如HTTPS请求）。
- **特点**：CONNECT常用于HTTP代理服务，允许客户端与服务器建立一个“隧道”。
- **用途**：代理请求，常见于HTTPS访问。
- **示例**：`CONNECT example.com:443` —— 建立一个到example.com的HTTPS连接。
## 小结
不同的HTTP方法被用于不同的操作：  
- **GET** 用于读取数据。  
- **POST** 用于提交数据或创建资源。  
- **PUT** 和 **PATCH** 用于更新资源。  
- **DELETE** 用于删除资源。  
- **HEAD** 和 **OPTIONS** 用于获取资源的元数据或支持的信息。  
- **TRACE** 用于调试，**CONNECT** 用于代理和隧道连接。

这些方法各自有其特点和使用场景，理解它们的区别对于设计RESTful API以及Web应用非常重要。


## HTTP Status Code

HTTP状态码是服务器在响应客户端请求时返回的代码，用于表示请求的处理状态。以下是一些常见的HTTP状态码及其含义：
## 1xx（信息性状态码）
* **100 Continue**：客户端应继续其请求。
* **101 Switching Protocols**：服务器根据客户端的请求切换协议。
## 2xx（成功状态码）
* **200 OK**：请求成功，服务器返回请求的数据。
* **201 Created**：请求成功，并且服务器创建了新资源。
* **202 Accepted**：请求已接受，但未处理完成。
* **204 No Content**：请求成功，但服务器没有返回任何内容。
* **205 Reset Content**：请求成功，要求客户端重置视图。
* **206 Partial Content**：服务器成功处理了部分GET请求。
## 3xx（重定向状态码）
* **300 Multiple Choices**：请求有多种选择，客户端可以选择其中之一。
* **301 Moved Permanently**：请求的资源已永久移动到新的URL。
* **302 Found**：请求的资源临时移动到新的URL。
* **303 See Other**：客户端应使用GET方法请求另一个URL。
* **304 Not Modified**：请求的资源未修改，客户端可以使用缓存。
* **307 Temporary Redirect**：请求的资源临时移动到新的URL，客户端应使用原方法请求新的URL。
* **308 Permanent Redirect**：请求的资源已永久移动到新的URL，客户端应使用原方法请求新的URL。
## 4xx（客户端错误状态码）
* **400 Bad Request**：服务器无法理解请求，客户端应修改请求。
* **401 Unauthorized**：请求未授权，需验证用户身份。
* **403 Forbidden**：服务器拒绝请求，客户端无权访问资源。
* **404 Not Found**：请求的资源不存在。
* **405 Method Not Allowed**：请求方法不被允许。
* **406 Not Acceptable**：请求的资源不满足客户端的条件。
* **408 Request Timeout**：请求超时，服务器未收到完整请求。
* **409 Conflict**：请求与资源的当前状态冲突。
* **410 Gone**：请求的资源已永久删除。
* **411 Length Required**：请求未定义Content-Length头。
* **413 Payload Too Large**：请求体过大，服务器无法处理。
* **414 URI Too Long**：请求的URI过长，服务器无法处理。
* **415 Unsupported Media Type**：请求的媒体类型不支持。
* **416 Range Not Satisfiable**：请求的范围无效。
* **417 Expectation Failed**：服务器无法满足Expect头的要求。
* **429 Too Many Requests**：客户端发送的请求过多，需限速。
## 5xx（服务器错误状态码）
* **500 Internal Server Error**：服务器内部错误，无法完成请求。
* **501 Not Implemented**：服务器不支持请求的方法。
* **502 Bad Gateway**：服务器作为网关或代理，收到无效响应。
* **503 Service Unavailable**：服务器临时过载或维护，无法处理请求。
* **504 Gateway Timeout**：服务器作为网关或代理，未及时响应请求。
* **505 HTTP Version Not Supported**：服务器不支持请求的HTTP版本。


## HTTP 接口设计指北

# HTTP 接口设计指北

文档主要目的是为大家在设计接口时提供建议，给大家参考 HTTP 或者其他协议/指南已经设计过的内容

**只是建议，不是必须遵从的要求**

大家有什么问题想法或者建议欢迎 [创建 Issue](https://github.com/bolasblack/http-api-guide/issues/new) 或者 [提交 Pull Request](https://github.com/bolasblack/http-api-guide/compare/)

* [README.md](.) 主要是简单介绍和列出对设计可能会有帮助的资料，少放一些私货
* [SUPPLEMENT.md](./SUPPLEMENT.md) 有一些更细节的接口设计方面的我自己的想法，全是私货

## 目录

* [HTTP 协议](#user-content-http-协议)
* [URL](#user-content-url)
* [空字段](#user-content-空字段)
* [国际化](#user-content-国际化)
* [请求方法](#user-content-请求方法)
* [状态码](#user-content-状态码)
* [身份验证](#user-content-身份验证)
* [超文本驱动和资源发现](#user-content-超文本驱动和资源发现)
* [数据缓存](#user-content-数据缓存)
* [并发控制](#user-content-并发控制)
* [跨域](#user-content-跨域)
* [其他资料](#user-content-其他资料)
* [其他接口设计指南](#user-content-其他接口设计指南)

## HTTP 协议

### HTTP/1.1

2014 年 6 月的时候 IETF 已经正式的废弃了 [RFC 2616](http://tools.ietf.org/html/rfc2616) ，将它拆分为六个单独的协议说明，并重点对原来语义模糊的部分进行了解释：

* RFC 7230 - HTTP/1.1: [Message Syntax and Routing](http://tools.ietf.org/html/rfc7230) - low-level message parsing and connection management
* RFC 7231 - HTTP/1.1: [Semantics and Content](http://tools.ietf.org/html/rfc7231) - methods, status codes and headers
* RFC 7232 - HTTP/1.1: [Conditional Requests](http://tools.ietf.org/html/rfc7232) - e.g., If-Modified-Since
* RFC 7233 - HTTP/1.1: [Range Requests](http://tools.ietf.org/html/rfc7233) - getting partial content
* RFC 7234 - HTTP/1.1: [Caching](http://tools.ietf.org/html/rfc7234) - browser and intermediary caches
* RFC 7235 - HTTP/1.1: [Authentication](http://tools.ietf.org/html/rfc7235) - a framework for HTTP authentication

相关资料：

* [RFC2616 is Dead](https://www.mnot.net/blog/2014/06/07/rfc2616_is_dead) （[中文版](http://www.infoq.com/cn/news/2014/06/http-11-updated)）

### HTTP/2

HTTP 协议的 2.0 版本还没有正式发布，但目前已经基本稳定下来了。

[2.0 版本的设计目标是尽量在使用层面上保持与 1.1 版本的兼容，所以，虽然数据交换的格式发生了变化，但语义基本全部被保留下来了](http://http2.github.io/http2-spec/index.html#rfc.section.8)。

因此，作为使用者而言，我们并不需要为了支持 2.0 而大幅修改代码。

* [HTTP/2 latest draft](http://http2.github.io/http2-spec/index.html)
* [HTTP/2 草案的中文版](https://github.com/fex-team/http2-spec/blob/master/HTTP2%E4%B8%AD%E8%8B%B1%E5%AF%B9%E7%85%A7%E7%89%88(06-29).md)
* [HTTP/1.1 和 HTTP/2 数据格式的对比](http://http2.github.io/http2-spec/index.html#rfc.section.8.1.3)

## URL

URL 的设计都需要遵守 [RFC 3986](http://tools.ietf.org/html/rfc3986) 的的规范。

URL 的长度，在 HTTP/1.1: Message Syntax and Routing([RFC 7230](https://tools.ietf.org/html/rfc7230)) 的 [3.1.1](https://tools.ietf.org/html/rfc7230#section-3.1.1) 小节中有说明，本身不限制长度。但是在实践中，服务器和客户端本身会施加限制*，因此需要根据自己的场景和需求做对应的调整

* 比如 IE8 的 URL 最大长度是 2083 个字符；nginx 的 [`large_client_header_buffers`](http://nginx.org/en/docs/http/ngx_http_core_module.html#large_client_header_buffers) 默认值是 8k ，整个 [request-line](https://tools.ietf.org/html/rfc7230#section-3.1.1) 超过 8k 时就会返回 414 (Request-URI Too Large)
* [Microsoft REST API Guidelines - 7.2. URL length](https://github.com/microsoft/api-guidelines/blob/vNext/Guidelines.md#72-url-length)

**强烈建议 API 部署 SSL 证书**，这样接口传递的数据的安全性才能获得一定的保障。

## 空字段

接口遵循“输入宽容，输出严格”原则，输出的数据结构中空字段的值一律为 `null`

## 国际化

### 语言标签

[RFC 5646](http://tools.ietf.org/html/rfc5646) ([BCP 47](http://tools.ietf.org/html/bcp47)) 规定的语言标签的格式如下：

```
language-script-region-variant-extension-privateuse
```

1. `language`：这部分使用的是 ISO 639-1, ISO 639-2, ISO 639-3, ISO 639-5 中定义的语言代码，必填
   * 这个部分由 `primary-extlang` 两个部分构成
   * `primary` 部分使用 ISO 639-1, ISO 639-2, ISO 639-3, ISO 639-5 中定义的语言代码，优先使用 ISO 639-1 中定义的条目，比如汉语 `zh`
   * `extlang` 部分是在某些历史性的兼容性的原因，在需要非常细致地区别 `primary` 语言的时候使用，使用 ISO 639-3 中定义的三个字母的代码，比如普通话 `cmn`
   * 虽然 `language` 可以只写 `extlang` 省略 `primary` 部分，但出于兼容性的考虑，还是**建议**加上 `primary` 部分
2. `script`: 这部分使用的是 [ISO 15924](http://www.unicode.org/iso15924/codelists.html) ([Wikipedia](http://zh.wikipedia.org/wiki/ISO_15924)) 中定义的语言代码，比如简体汉字是 `zh-Hans` ，繁体汉字是 `zh-Hant` 。
3. `region`: 这部分使用的是 [ISO 3166-1][iso3166-1] ([Wikipedia][iso3166-1_wiki]) 中定义的地理区域代码，比如 `zh-Hans-CN` 就是中国大陆使用的简体中文。
4. `variant`: 用来表示 `extlang` 的定义里没有包含的方言，具体的使用方法可以参考 [RFC 5646](http://tools.ietf.org/html/rfc5646#section-2.2.5) 。
5. `extension`: 用来为自己的应用做一些语言上的额外的扩展，具体的使用方法可以参考 [RFC 5646](http://tools.ietf.org/html/rfc5646#section-2.2.6) 。
6. `privateuse`: 用来表示私有协议中约定的一些语言上的区别，具体的使用方法可以参考 [RFC 5646](http://tools.ietf.org/html/rfc5646#section-2.2.7) 。

其中只有 `language` 部分是必须的，其他部分都是可选的；不过为了便于编写程序，建议设计接口时约定语言标签的结构，比如统一使用 `language-script-region` 的形式（ `zh-Hans-CN`, `zh-Hant-HK` 等等）。

语言标签是大小写不敏感的，但按照惯例，建议 `script` 部分首字母大写， `region` 部分全部大写，其余部分全部小写。

**有一点需要注意，任何合法的标签都必须经过 IANA 的认证，已通过认证的标签可以在[这个网页](http://www.iana.org/assignments/language-subtag-registry)查到。此外，网上还有一个非官方的[标签搜索引擎](http://people.w3.org/rishida/utils/subtags/)。**

相关资料：

* ISO 639-1 Code List ([Wikipedia](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes))
* [ISO 639-2 Code List](http://www.loc.gov/standards/iso639-2/php/code_list.php) ([Wikipedia](https://en.wikipedia.org/wiki/List_of_ISO_639-2_codes))
* [ISO 639-3 Code List](http://www-01.sil.org/iso639-3/codes.asp?order=639_3&letter=%25)
* [ISO 639-5 Code List](http://www.loc.gov/standards/iso639-5/id.php) ([Wikipedia](https://en.wikipedia.org/wiki/List_of_ISO_639-5_codes))
* [ISO 639-3 Macrolanguage Mappings](http://www-01.sil.org/iso639-3/macrolanguages.asp) ([Wikipedia](https://en.wikipedia.org/wiki/ISO_639_macrolanguage))
* [Relationship between ISO 639-3 and the other parts of ISO 639](http://www-01.sil.org/iso639-3/relationship.asp)
* [网页头部的声明应该是用 lang="zh" 还是 lang="zh-cn"？ - 知乎](http://www.zhihu.com/question/20797118)
* [IETF language tag - Wikipedia](https://en.wikipedia.org/wiki/IETF_language_tag)
* [语种名称代码](http://www.ruanyifeng.com/blog/2008/02/codes_for_language_names.html) ：文中对带有方言（ `extlang` ）部分的标签介绍有误
* [Language tags in HTML and XML](http://www.w3.org/International/articles/language-tags/)
* [Choosing a Language Tag](http://www.w3.org/International/questions/qa-choosing-language-tags)

### 时区

客户端请求服务器时，如果对时间有特殊要求（如某段时间每天的统计信息），则可以参考 [IETF 相关草案](http://tools.ietf.org/html/draft-sharhalakis-httptz-05) 增加请求头 `Timezone` 。

```
Timezone: 2016-11-06 23:55:52+08:00;;Asia/Shanghai
```

具体格式说明：

```
Timezone: RFC3339 约定的时间格式;POSIX 1003.1 约定的时区字符串;tz datebase 里的时区名称
```

客户端最好提供所有字段，如果没有办法提供，则应该使用空字符串

如果客户端请求时没有指定相应的时区，则服务端默认使用最后一次已知时区或者 [UTC](http://zh.wikipedia.org/wiki/%E5%8D%8F%E8%B0%83%E4%B8%96%E7%95%8C%E6%97%B6) 时间返回相应数据。

PS 考虑到存在[夏时制](https://en.wikipedia.org/wiki/Daylight_saving_time)这种东西，所以不推荐客户端在请求时使用 Offset 。

相关资料：

* [RFC3339](https://tools.ietf.org/html/rfc3339)
* [tz datebase](http://www.iana.org/time-zones) ([Wikipedia](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones))
* POSIX 1003.1 时区字符串的说明文档
  * [GNU 的文档](https://www.gnu.org/software/libc/manual/html_node/TZ-Variable.html)
  * [IBM 的文章](https://www.ibm.com/developerworks/aix/library/au-aix-posix/)

### 时间格式

时间格式遵循 [ISO 8601](https://www.iso.org/obp/ui/#iso:std:iso:8601:ed-3:v1:en)([Wikipedia](https://en.wikipedia.org/wiki/ISO_8601)) 建议的格式：

* 日期 `2014-07-09`
* 时间 `14:31:22+0800`
* 具体时间 `2007-11-06T16:34:41Z`
* 持续时间 `P1Y3M5DT6H7M30S` （表示在一年三个月五天六小时七分三十秒内）
* 时间区间 `2007-03-01T13:00:00Z/2008-05-11T15:30:00Z` 、 `2007-03-01T13:00:00Z/P1Y2M10DT2H30M` 、 `P1Y2M10DT2H30M/2008-05-11T15:30:00Z`
* 重复时间 `R3/2004-05-06T13:00:00+08/P0Y6M5DT3H0M0S` （表示从2004年5月6日北京时间下午1点起，在半年零5天3小时内，重复3次）

相关资料：

* [What's the difference between ISO 8601 and RFC 3339 Date Formats?](http://stackoverflow.com/questions/522251/whats-the-difference-between-iso-8601-and-rfc-3339-date-formats)
* [JSON风格指南 - Google 风格指南（中文版）](https://github.com/darcyliu/google-styleguide/blob/master/JSONStyleGuide.md#%E5%B1%9E%E6%80%A7%E5%80%BC%E6%95%B0%E6%8D%AE%E7%B1%BB%E5%9E%8B)

### 货币名称

货币名称可以参考 [ISO 4217](javascript:;)([Wikipedia](http://en.wikipedia.org/wiki/ISO_4217)) 中的约定，标准为货币名称规定了三个字母的货币代码，其中的前两个字母是 [ISO 3166-1][iso3166-1]([Wikipedia][iso3166-1_wiki]) 中定义的双字母国家代码，第三个字母通常是货币的首字母。在货币上使用这些代码消除了货币名称（比如 dollar ）或符号（比如 $ ）的歧义。

相关资料：

* 《RESTful Web Services Cookbook 中文版》 3.9 节《如何在表述中使用可移植的数据格式》

## 请求方法

* 如果请求头中存在 `X-HTTP-Method-Override` 或参数中存在 `_method`（拥有更高权重），且值为 `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `OPTIONS`, `HEAD` 之一，则视作相应的请求方式进行处理
* `GET`, `DELETE`, `HEAD` 方法，参数风格为标准的 `GET` 风格的参数，如 `url?a=1&b=2`
* `POST`, `PUT`, `PATCH`, `OPTIONS` 方法
  * 默认情况下请求实体会被视作标准 json 字符串进行处理，当然，依旧推荐设置头信息的 `Content-Type` 为 `application/json`
  * 在一些特殊接口中（会在文档中说明），可能允许 `Content-Type` 为 `application/x-www-form-urlencoded` 或者 `multipart/form-data` ，此时请求实体会被视作标准 `POST` 风格的参数进行处理

关于方法语义的说明：

* `OPTIONS` 用于获取资源支持的所有 HTTP 方法
* `HEAD` 用于只获取请求某个资源返回的头信息
* `GET` 用于从服务器获取某个资源的信息
  * 完成请求后返回状态码 `200 OK`
  * 完成请求后需要返回被请求的资源详细信息
* `POST` 用于创建新资源
  * 创建完成后返回状态码 `201 Created`
  * 完成请求后需要返回被创建的资源详细信息
* `PUT` 用于完整的替换资源或者创建指定身份的资源，比如创建 id 为 123 的某个资源
  * 如果是创建了资源，则返回 `201 Created`
  * 如果是替换了资源，则返回 `200 OK`
  * 完成请求后需要返回被修改的资源详细信息
* `PATCH` 用于局部更新资源
  * 完成请求后返回状态码 `200 OK`
  * 完成请求后需要返回被修改的资源详细信息
* `DELETE` 用于删除某个资源
  * 完成请求后返回状态码 `204 No Content`

相关资料：

* [RFC 7231 中对请求方法的定义](http://tools.ietf.org/html/rfc7231#section-4.3)
* [RFC 5789](http://tools.ietf.org/html/rfc5789) - PATCH 方法的定义
* [维基百科](http://zh.wikipedia.org/wiki/%E8%B6%85%E6%96%87%E6%9C%AC%E4%BC%A0%E8%BE%93%E5%8D%8F%E8%AE%AE#.E8.AF.B7.E6.B1.82.E6.96.B9.E6.B3.95)

## 状态码

### 请求成功

* 200 **OK** : 请求执行成功并返回相应数据，如 `GET` 成功
* 201 **Created** : 对象创建成功并返回相应资源数据，如 `POST` 成功；创建完成后响应头中应该携带头标 `Location` ，指向新建资源的地址
* 202 **Accepted** : 接受请求，但无法立即完成创建行为，比如其中涉及到一个需要花费若干小时才能完成的任务。返回的实体中应该包含当前状态的信息，以及指向处理状态监视器或状态预测的指针，以便客户端能够获取最新状态。
* 204 **No Content** : 请求执行成功，不返回相应资源数据，如 `PATCH` ， `DELETE` 成功

### 重定向

**重定向的新地址都需要在响应头 `Location` 中返回**

* 301 **Moved Permanently** : 被请求的资源已永久移动到新位置
* 302 **Found** : 请求的资源现在临时从不同的 URI 响应请求
* 303 **See Other** : 对应当前请求的响应可以在另一个 URI 上被找到，客户端应该使用 `GET` 方法进行请求。比如在创建已经被创建的资源时，可以返回 `303`
* 307 **Temporary Redirect** : 对应当前请求的响应可以在另一个 URI 上被找到，客户端应该保持原有的请求方法进行请求

### 条件请求

* 304 **Not Modified** : 资源自从上次请求后没有再次发生变化，主要使用场景在于实现[数据缓存](#user-content-数据缓存)
* 409 **Conflict** : 请求操作和资源的当前状态存在冲突。主要使用场景在于实现[并发控制](#user-content-并发控制)
* 412 **Precondition Failed** : 服务器在验证在请求的头字段中给出先决条件时，没能满足其中的一个或多个。主要使用场景在于实现[并发控制](#user-content-并发控制)

### 客户端错误

* 400 **Bad Request** : 请求体包含语法错误
* 401 **Unauthorized** : 需要验证用户身份，如果服务器就算是身份验证后也不允许客户访问资源，应该响应 `403 Forbidden` 。如果请求里有 `Authorization` 头，那么必须返回一个 [`WWW-Authenticate`](https://tools.ietf.org/html/rfc7235#section-4.1) 头
* 403 **Forbidden** : 服务器拒绝执行
* 404 **Not Found** : 找不到目标资源
* 405 **Method Not Allowed** : 不允许执行目标方法，响应中应该带有 `Allow` 头，内容为对该资源有效的 HTTP 方法
* 406 **Not Acceptable** : 服务器不支持客户端请求的内容格式，但响应里会包含服务端能够给出的格式的数据，并在 `Content-Type` 中声明格式名称
* 410 **Gone** : 被请求的资源已被删除，只有在确定了这种情况是永久性的时候才可以使用，否则建议使用 `404 Not Found`
* 413 **Payload Too Large** : `POST` 或者 `PUT` 请求的消息实体过大
* 415 **Unsupported Media Type** : 服务器不支持请求中提交的数据的格式
* 422 **Unprocessable Entity** : 请求格式正确，但是由于含有语义错误，无法响应
* 428 **Precondition Required** : 要求先决条件，如果想要请求能成功必须满足一些预设的条件

### 服务端错误

* 500 **Internal Server Error** : 服务器遇到了一个未曾预料的状况，导致了它无法完成对请求的处理。
* 501 **Not Implemented** : 服务器不支持当前请求所需要的某个功能。
* 502 **Bad Gateway** : 作为网关或者代理工作的服务器尝试执行请求时，从上游服务器接收到无效的响应。
* 503 **Service Unavailable** : 由于临时的服务器维护或者过载，服务器当前无法处理请求。这个状况是临时的，并且将在一段时间以后恢复。如果能够预计延迟时间，那么响应中可以包含一个 `Retry-After` 头用以标明这个延迟时间（内容可以为数字，单位为秒；或者是一个 [HTTP 协议指定的时间格式](http://tools.ietf.org/html/rfc2616#section-3.3)）。如果没有给出这个 `Retry-After` 信息，那么客户端应当以处理 500 响应的方式处理它。

`501` 与 `405` 的区别是：`405` 是表示服务端不允许客户端这么做，`501` 是表示客户端或许可以这么做，但服务端还没有实现这个功能

相关资料：

* [RFC 里的状态码列表](http://tools.ietf.org/html/rfc7231#page-49)
* [RFC 4918](http://tools.ietf.org/html/rfc4918) - 422 状态码的定义
* [RFC 6585](http://tools.ietf.org/html/rfc6585) - 新增的四个 HTTP 状态码，[中文版](http://www.oschina.net/news/28660/new-http-status-codes)
* [维基百科上的《 HTTP 状态码》词条](http://zh.wikipedia.org/wiki/HTTP%E7%8A%B6%E6%80%81%E7%A0%81)
* [Do I need to use http redirect code 302 or 307? - Stack Overflow](http://stackoverflow.com/questions/2467664/do-i-need-to-use-http-redirect-code-302-or-307)
* [400 vs 422 response to POST of data](http://stackoverflow.com/questions/16133923/400-vs-422-response-to-post-of-data)
* [HTTP Status Codes Decision Diagram – Infographic](https://www.loggly.com/blog/http-status-code-diagram/)
* [HTTP Status Codes](https://httpstatuses.com/)

## 身份验证

部分接口需要通过某种身份验证方式才能请求成功（这些接口**应该**在文档中标注出来），合适的身份验证解决方案目前有两种：

* [HTTP 基本认证](http://zh.wikipedia.org/wiki/HTTP%E5%9F%BA%E6%9C%AC%E8%AE%A4%E8%AF%81)，**最好只在部署了 SSL 证书的情况下才可以使用，否则用户密码会有暴露的风险**
* [OAuth 2.0](https://tools.ietf.org/html/rfc6749)
  * [官网](http://oauth.net/2/)
  * [理解OAuth 2.0 - 阮一峰](http://www.ruanyifeng.com/blog/2014/05/oauth_2_0.html) 以及对[文中 `state` 参数的介绍的修正](http://www.ruanyifeng.com/blog/2014/05/oauth_2_0.html#comment-323002)
  * [JSON Web Token](https://tools.ietf.org/html/draft-ietf-oauth-json-web-token-25) ，一种 Token 的生成标准
    * [Json Web Tokens: Introduction](http://angular-tips.com/blog/2014/05/json-web-tokens-introduction/)
    * [Json Web Tokens: Examples](http://angular-tips.com/blog/2014/05/json-web-tokens-examples/)

## 超文本驱动和资源发现

REST 服务的要求之一就是[超文本驱动](http://roy.gbiv.com/untangled/2008/rest-apis-must-be-hypertext-driven)，客户端不再需要将某些接口的 URI 硬编码在代码中，唯一需要存储的只是 API 的 HOST 地址，能够非常有效的降低客户端与服务端之间的耦合，服务端对 URI 的任何改动都不会影响到客户端的稳定。

目前有几种方案试图实现这个效果：

* [JSON HAL](http://tools.ietf.org/html/draft-kelly-json-hal-07) ，示例可以参考 [JSON HAL 作者自己的介绍](http://stateless.co/hal_specification.html)
* [GitHub API 使用的方案](https://developer.github.com/v3/#hypermedia) ，应该是一种 JSON HAL 的变体
* [JSON API](http://jsonapi.org/) ，（这里有 [@迷渡](https://github.com/justjavac) 发起的 [中文版](http://jsonapi.org.cn/) ），另外一种类似 JSON HAL 的方案
* [Micro API](http://micro-api.org/) ，一种试图与 [JSON-LD](http://json-ld.org/) 兼容的方案

目前所知的方案都实现了发现资源的功能，服务端同时需要实现 `OPTIONS` 方法，并在响应中携带 `Allow` 头来告知客户端当前拥有的操作权限。

## 数据缓存

大部分接口应该在响应头中携带 `Last-Modified`, `ETag`, `Vary`, `Date` 信息，客户端可以在随后请求这些资源的时候，在请求头中使用 `If-Modified-Since`, `If-None-Match` 等请求头来确认资源是否经过修改。

如果资源没有进行过修改，那么就可以响应 `304 Not Modified` 并且不在响应实体中返回任何内容。

```bash
$ curl -i http://api.example.com/#{RESOURCE_URI}
HTTP/1.1 200 OK
Cache-Control: public, max-age=60
Date: Thu, 05 Jul 2012 15:31:30 GMT
Vary: Accept, Authorization
ETag: "644b5b0155e6404a9cc4bd9d8b1ae730"
Last-Modified: Thu, 05 Jul 2012 15:31:30 GMT

Content
```

```bash
$ curl -i http://api.example.com/#{RESOURCE_URI} -H "If-Modified-Since: Thu, 05 Jul 2012 15:31:30 GMT"
HTTP/1.1 304 Not Modified
Cache-Control: public, max-age=60
Date: Thu, 05 Jul 2012 15:31:45 GMT
Vary: Accept, Authorization
Last-Modified: Thu, 05 Jul 2012 15:31:30 GMT
```

```bash
$ curl -i http://api.example.com/#{RESOURCE_URI} -H 'If-None-Match: "644b5b0155e6404a9cc4bd9d8b1ae730"'
HTTP/1.1 304 Not Modified
Cache-Control: public, max-age=60
Date: Thu, 05 Jul 2012 15:31:55 GMT
Vary: Accept, Authorization
ETag: "644b5b0155e6404a9cc4bd9d8b1ae730"
Last-Modified: Thu, 05 Jul 2012 15:31:30 GMT
```

相关资料：

* [RFC 7232](http://tools.ietf.org/html/rfc7232)
* [HTTP 缓存 - Google Developers](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/http-caching?hl=zh-cn)
* [RFC 2616 中缓存过期时间的算法](http://tools.ietf.org/html/rfc2616#section-13.2.3), [MDN 版](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching_FAQ), [中文版](http://blog.csdn.net/woxueliuyun/article/details/41077671)
* [HTTP 协议中 Vary 的一些研究](https://www.imququ.com/post/vary-header-in-http.html)
* [Cache Control 與 ETag](https://blog.othree.net/log/2012/12/22/cache-control-and-etag/)

## 并发控制

不严谨的实现，或者缺少并发控制的 `PUT` 和 `PATCH` 请求可能导致 “更新丢失”。这个时候可以使用 `Last-Modified` 和/或 `ETag` 头来实现条件请求，支持乐观并发控制。

下文只考虑使用 `PUT` 和 `PATCH` 方法更新资源的情况。

* 客户端发起的请求如果没有包含 `If-Unmodified-Since` 或者 `If-Match` 头，那就返回状态码 `403 Forbidden` ，在响应正文中解释为何返回该状态码
* 客户端发起的请求提供的 `If-Unmodified-Since` 或者 `If-Match` 头与服务器记录的实际修改时间或 `ETag` 值不匹配的时候，返回状态码 `412 Precondition Failed`
* 客户端发起的请求提供的 `If-Unmodified-Since` 或者 `If-Match` 头与服务器记录的实际修改时间或 `ETag` 的历史值匹配，但资源已经被修改过的时候，返回状态码 `409 Conflict`
* 客户端发起的请求提供的条件符合实际值，那就更新资源，响应 `200 OK` 或者 `204 No Content` ，并且包含更新过的 `Last-Modified` 和/或 `ETag` 头，同时包含 `Content-Location` 头，其值为更新后的资源 URI

相关资料：

* 《RESTful Web Services Cookbook 中文版》 10.4 节 《如何在服务器端实现条件 PUT 请求》
* [RFC 7232 "Conditional Requests"](https://tools.ietf.org/html/rfc7232)
* [Location vs. Content-Location](https://www.subbu.org/blog/2008/10/location-vs-content-location)

## 跨域

### CORS

接口支持[“跨域资源共享”（Cross Origin Resource Sharing, CORS）](http://www.w3.org/TR/cors)，[这里](http://enable-cors.org/)和[这里](http://code.google.com/p/html5security/wiki/CrossOriginRequestSecurity)和[这份中文资料](http://newhtml.net/using-cors/)有一些指导性的资料。

简单示例：

```bash
$ curl -i https://api.example.com -H "Origin: http://example.com"
HTTP/1.1 302 Found
```

```bash
$ curl -i https://api.example.com -H "Origin: http://example.com"
HTTP/1.1 302 Found
Access-Control-Allow-Origin: *
Access-Control-Expose-Headers: ETag, Link, X-Total-Count
Access-Control-Allow-Credentials: true
```

预检请求的响应示例：

```bash
$ curl -i https://api.example.com -H "Origin: http://example.com" -X OPTIONS
HTTP/1.1 302 Found
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: Authorization, Content-Type, If-Match, If-Modified-Since, If-None-Match, If-Unmodified-Since, X-Requested-With
Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE
Access-Control-Expose-Headers: ETag, Link, X-Total-Count
Access-Control-Max-Age: 86400
Access-Control-Allow-Credentials: true
```

### JSON-P

如果在任何 `GET` 请求中带有参数 `callback` ，且值为非空字符串，那么接口将返回如下格式的数据

```bash
$ curl http://api.example.com/#{RESOURCE_URI}?callback=foo
```

```javascript
foo({
  "meta": {
    "status": 200,
    "X-Total-Count": 542,
    "Link": [
      {"href": "http://api.example.com/#{RESOURCE_URI}?cursor=0&count=100", "rel": "first"},
      {"href": "http://api.example.com/#{RESOURCE_URI}?cursor=90&count=100", "rel": "prev"},
      {"href": "http://api.example.com/#{RESOURCE_URI}?cursor=120&count=100", "rel": "next"},
      {"href": "http://api.example.com/#{RESOURCE_URI}?cursor=200&count=100", "rel": "last"}
    ]
  },
  "data": // data
})
```

## 其他资料

* [Httpbis Status Pages](https://tools.ietf.org/wg/httpbis/)
* [所有在 IANA 注册的消息头和相关标准的列表](http://www.iana.org/assignments/message-headers/message-headers.xhtml)
* [Standards.REST](https://standards.rest/) 里面收集了不少对 REST API 设计有借鉴意义的标准和规范

## 其他接口设计指南

这里还有一些其他参考资料：

* [Microsoft REST API Guidelines](https://github.com/microsoft/api-guidelines/blob/vNext/Guidelines.md) ，很多设计都很有意思，比如：
  * [7.10.2. Error condition responses](https://github.com/microsoft/api-guidelines/blob/vNext/Guidelines.md#7102-error-condition-responses)
  * [9.8. Pagination](https://github.com/microsoft/api-guidelines/blob/vNext/Guidelines.md#98-pagination)
  * [10. Delta queries](https://github.com/microsoft/api-guidelines/blob/vNext/Guidelines.md#10-delta-queries)
  * [13. Long running operations](https://github.com/microsoft/api-guidelines/blob/vNext/Guidelines.md#13-long-running-operations)
* [GitHub Developer - REST API v3](https://developer.github.com/v3/)
* [HTTP API Design Guide](https://github.com/interagent/http-api-design/) ，有以下两点我个人并不建议参考：
  * [Use consistent path formats](https://github.com/interagent/http-api-design/#use-consistent-path-formats)
      还是不建议将动作写在 URL 中，像文档中的情况，可以将这个行为抽象成一个事务资源 `POST /runs/:run_id/stop-logs` 或者 `POST /runs/:run_id/stoppers` 来解决
  * [Paginate with Ranges](https://github.com/interagent/http-api-design/#paginate-with-ranges)
      确实是一个巧妙的设计，但似乎并不符合 `Content-Range` 的设计意图，而且有可能和需要使用到 `Content-Range` 的正常场景冲突（虽然几乎不可能），所以不推荐
* [Best Practices for Designing a Pragmatic RESTful API](http://www.vinaysahni.com/best-practices-for-a-pragmatic-restful-api)
* [Thoughts on RESTful API Design](http://restful-api-design.readthedocs.org/en/latest/)
* [The RESTful CookBook](http://restcookbook.com/)

[iso3166-1]: javascript:;
[iso3166-1_wiki]: http://en.wikipedia.org/wiki/ISO_3166-1_alpha-2



## HTTP 安全标头简介

HTTP 安全标头是 Web 安全的重要组成部分，它们可以帮助保护网站免受各种攻击，如跨站脚本（XSS）、点击劫持和 MIME 嗅探等。通过在服务器响应中正确配置这些标头，网站可以提高安全性并为用户提供更安全的浏览体验。
## X-Content-Type-Options标头
X-Content-Type-Options标头阻止浏览器执行 MIME 嗅探，未配置可能会导致安全漏洞。
**策略**
• nosniff -> 如果 MIME 类型与资源类型不匹配，则阻止请求（例如，阻止未使用正确 MIME 类型提供的脚本）。
**攻击场景**
攻击者将恶意脚本文件作为 CSS 文件提供，并诱骗浏览器执行它。如果没有nosniff ，浏览器可能会认为它是一个脚本并执行它。
**Apache 上的防御**
Header set X-Content-Type-Options "nosniff"
**Nginx 上的防御**
add\_header X-Content-Type-Options "nosniff";
## Access-Control-Allow-Origin标头
此标头定义哪些来源被允许通过跨源请求访问资源。
**策略**
• \* -> 允许所有来源（有风险）。
• -> 仅允许来自特定来源的请求。
**攻击场景**
不当的跨域资源共享 (CORS) 可能允许跨不同来源的敏感资源未经授权的访问，从而导致安全漏洞。
**Apache 上的防御**
Header set Access-Control-Allow-Origin " [https://trustedsite.com](https://trustedsite.com) "
**Nginx 上的防御**
add\_header Access-Control-Allow-Origin " [https://trustedsite.com](https://trustedsite.com) ";
## X-Frame-Options标头
当恶意行为者用透明的 iframe 覆盖合法页面，诱骗用户点击隐藏内容时，就会发生点击劫持。
**策略**
• X-Frame-Options: DENY -> 防止网站显示在 iframe 中。
• X-Frame-Options: SAMEORIGIN -> 允许站点仅由来自同一来源的页面构建。
**攻击场景**
钓鱼网站将银行网站嵌入隐藏的 iframe 中，诱骗用户输入凭证。
**Apache 上的防御**
Header always set X-Frame-Options "DENY"
**Nginx 上的防御**
add\_header X-Frame-Options "DENY";
## X-XSS-Protection标头
X-XSS-Protection是一个 HTTP 响应头，用于配置浏览器内置的跨站脚本（XSS）过滤器。其目的是防止跨站脚本攻击，即防止恶意脚本在用户浏览器中执行。
**策略**
X-XSS-Protection 标头曾经是防御 XSS 攻击的常用方法之一，但由于其局限性和现代浏览器的弃用，现已不再推荐使用。开发者应转而使用更强大、更可靠的安全机制，如 Content Security Policy（CSP），来保护应用程序免受 XSS 和其他类型的攻击。
• X-XSS-Protection: 1; mode=block -> 在浏览器中启用 XSS 过滤，在检测到攻击时阻止页面呈现。
• Content-Security-Policy -> 限制浏览器可以加载哪些资源（脚本、媒体等）。
**攻击场景**
攻击者通过表单字段注入恶意 JavaScript，并在访问该页面的用户的浏览器中执行。
**Apache 上的防御**
Header set X-XSS-Protection "1; mode=block" Header set Content-Security-Policy "default-src 'self'; script-src 'self'"
**Nginx 上的防御**
add\_header X-XSS-Protection "1; mode=block"; add\_header Content-Security-Policy "default-src 'self'; script-src 'self'";
## Strict-Transport-Security(HSTS)标头
Strict-Transport-Security强制浏览器仅通过 HTTPS 与服务器通信，防止中间人攻击（MITM）。
**策略**
• Strict-Transport-Security: max-age=31536000; includeSubDomains ->指示浏览器仅在指定时间内使用 HTTPS 访问网站。
**攻击场景**
攻击者拦截连接并将其降级为 HTTP，从而窃取 cookie 和会话数据。
**Apache 上的防御**
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
**Nginx 上的防御**
add\_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
## cookie标头
在未安全配置cookie的情况下，攻击者可以窃取会话 cookie 来冒充用户并获得未经授权的访问。
**策略**
• Secure -> 确保 cookie 仅通过 HTTPS 发送。
• HttpOnly -> 阻止 JavaScript 访问 cookie。
• SameSite：控制 Cookie 的跨站发送行为，防止 CSRF 攻击。
**攻击场景**
攻击者拦截 HTTP 连接上的 cookie 并使用它们冒充用户。
**Apache/Nginx 上的防御**
确保在您的应用程序和服务器设置中将cookie配置为Secure和HttpOnly 。
Set-Cookie: sessionid=abc123; Secure; HttpOnly; SameSite=Strict
## Referer标头
Referrer用于标识从哪个网页发起的请求。它告诉服务器当前请求是从哪个 URL 跳转或链接过来的，对于分析流量来源、日志记录和统计有重要作用。
**策略**
• Referrer-Policy -> 限制与第三方网站共享的引荐来源信息量，减少 CSRF 的暴露。
**攻击场景**
CSRF（跨站脚本攻击），攻击者诱骗用户点击链接，该链接在未经用户同意的情况下在合法网站上执行操作。
**Apache 上的防御**
Header set Referrer-Policy "no-referrer-when-downgrade"
**Nginx 上的防御**
add\_header Referrer-Policy "no-referrer-when-downgrade";
## Cache-Control标头
Cache-Control标头指定浏览器和共享缓存中的缓存策略。配置错误可能会导致敏感数据泄露或与缓存相关的攻击。
**策略**
• no-cache -> 强制浏览器在重新使用响应之前与原始服务器验证响应。
• no-store -> 确保响应不会存储在缓存中。
**攻击场景：缓存检查和欺骗**
攻击者可以利用错误配置的缓存，通过诱骗浏览器重复使用缓存的响应来提供过时或恶意内容。
**Apache 上的防御**
Header set Cache-Control "no-store, no-cache, must-revalidate"
**Nginx 上的防御**
add\_header Cache-Control "no-store, no-cache, must-revalidate";
## Content-Disposition标头
Content-Disposition标头指示浏览器是否以内联方式显示内容或将其作为附件下载。
**策略**
• inline >指示浏览器直接在浏览器中显示文件。
• attachment; filename="file.jpg" -> 强制浏览器以特定名称的附件形式下载文件。
**攻击场景：RFD 和点击劫持**
如果配置不当，攻击者可以传播伪装成合法内容的恶意文件。
**Apache 上的防御**
Header set Content-Disposition "attachment; filename=securefile.txt"
**Nginx 上的防御**
add\_header Content-Disposition "attachment; filename=securefile.txt";
## Cross-Origin-Resource-Policy标头
Cross-Origin-Resource-Policy(CORP) 限制了来自不同来源的请求如何共享资源，从而防止未经授权的资源访问。
**策略**
• same-site -> 只有来自同一站点的请求才能访问资源。
• same-origin -> 只有来自同一来源（方案 + 主机 + 端口）的请求才能访问资源。
• cross-origin -> 任何来源都可以读取资源。
**攻击场景：XSS、点击劫持和 CSRF**
如果没有适当的跨域限制，攻击者可以通过对您的资源发出未经授权的请求来利用 XSS、点击劫持或 CSRF 漏洞。
**Apache 上的防御**
Header set Cross-Origin-Resource-Policy "same-origin"
**Nginx 上的防御**
add\_header Cross-Origin-Resource-Policy "same-origin";
## Content-Encoding标头
Content-Encoding标头指定应用于内容的编码类型（例如gzip ，compress ，deflate ，br ）。
**策略**
• gzip 、compress 、deflate 、br > 对内容应用压缩方法以便通过网络传输。
**攻击场景：DDoS和网络窃听**
如果内容编码配置错误，攻击者可以通过发送压缩负载来导致网络问题，甚至利用压缩算法中的漏洞。
**Apache 上的防御**
AddOutputFilterByType DEFLATE text/html text/plain text/xml
**Nginx 上的防御**
gzip on; gzip\_types text/plain application/xml;
## X-Rate-Limit 和 X-Forwarded标头
• X-Rate-Limit -> 控制来自客户端的请求的速率限制。
• X-Forwarded-IP -> 使用代理或负载均衡器时捕获客户端的真实 IP 地址。
**攻击场景：速率限制绕过**
攻击者可能尝试通过欺骗 IP 地址来绕过速率限制，从而导致服务器资源滥用。
**Apache 上的防御**
实现诸如mod\_ratelimit之类的速率限制模块，并确保正确记录转发的 IP。
**Nginx 上的防御**
limit\_req zone=one burst=5 nodelay;
## X-Permitted-Cross-Domain-Policies 标头
控制客户端（如 Flash Player、Adobe Reader）是否可以加载网站内容的跨域策略文件，防止未授权的跨域访问。
**策略**
• none：不允许加载任何跨域策略文件。
• master-only：仅允许加载根目录下的 crossdomain.xml 文件。
• by-content-type：仅允许加载指定 Content-Type 的策略文件。
• all：允许加载所有位置的策略文件。
**攻击场景**
攻击者控制客户端（如 Flash Player、Adobe Reader）加载网站内容的跨域策略文件，造成未授权的跨域访问
**Apache 上的防御**
Header set X-Permitted-Cross-Domain-Policies "none"
**Nginx 上的防御**
add\_header X-Permitted-Cross-Domain-Policies "none";
## 额外的HTTP标头注入
对标头的不当处理允许攻击者注入任意标头，从而导致缓存中毒、XSS 和其他基于注入的攻击。
**攻击场景：缓存中毒和标头注入**
攻击者注入恶意标头，可能会覆盖缓存策略，从而允许向用户提供有毒或恶意内容。
**Apache/Nginx 上的防御**
净化所有用户输入并避免通过标题暴露敏感数据，确保输入已清理，并且标题在设置之前已正确验证。
## 总结
实施安全标头是一种简单而有效的方法，可增强 web 应用程序的安全性。通过指示浏览器不要进行非预期或者宽松的配置，可以降低某些类型的基于 web 前端攻击的风险。建议开发者可以按需配置适合的HTTP安全标头。


## HTTP 验证方案（IANA）

IANA（Internet Assigned Numbers Authority）维护了一系列的HTTP身份验证方案（Authentication Schemes），这些方案用于在HTTP协议中实现权限控制和认证。以下是其中最常用的几种验证方案及其特点：
## 1. Basic Authentication
- **简介**：Basic 是最常见的HTTP认证方案，定义于RFC 7617。它使用用户的ID和密码作为凭证，并通过Base64编码传输。
- **流程**：
    - 服务器返回401状态码，并在`WWW-Authenticate`头中指定验证方式为`Basic`。
    - 客户端将用户名和密码用冒号连接（如`username:password`），进行Base64编码后，通过`Authorization`头发送给服务器。
    - 服务器解码并验证凭证。
- **安全性**：由于Base64是可逆编码，凭证以明文形式传输，因此必须与HTTPS/TLS协议结合使用，否则容易被嗅探178。
- **适用场景**：适用于内部系统或安全性要求不高的场景，如路由器管理界面15。
## 2. Bearer Authentication
- **简介**：Bearer 方案定义于RFC 6750，通常用于OAuth 2.0协议中，通过令牌（Token）保护资源。
- **流程**：
    - 客户端在`Authorization`头中携带Bearer令牌，格式为：`Authorization: Bearer <token>`。
    - 服务器验证令牌的有效性。
- **安全性**：令牌通常通过HTTPS传输，避免泄露。但令牌一旦泄露，攻击者可以冒充用户访问资源18。
- **适用场景**：适用于RESTful API的认证，尤其是OAuth 2.0保护的资源15。
## 3. Digest Authentication
- **简介**：Digest 方案定义于RFC 7616，是对Basic方案的改进，使用哈希算法（如MD5或SHA-256）保护凭证。
- **流程**：
    - 服务器返回401状态码，并在`WWW-Authenticate`头中提供随机数（nonce）和哈希算法信息。
    - 客户端使用用户名、密码、nonce等信息生成哈希值，并通过`Authorization`头发送给服务器。
    - 服务器验证哈希值。
- **安全性**：相比Basic方案，Digest方案更安全，因为密码不会以明文形式传输。但MD5哈希已被认为不够安全，推荐使用SHA-256178。
- **适用场景**：适用于需要较高安全性的场景，但实现复杂度较高15。
## 4. HOBA (HTTP Origin-Bound Authentication)
- **简介**：HOBA 方案定义于RFC 7486，基于数字签名实现认证，适用于HTTP服务器或代理。
- **流程**：
    - 客户端生成数字签名，并通过`Authorization`头发送给服务器。
    - 服务器验证签名。
- **安全性**：由于使用数字签名，HOBA方案具有较高的安全性，但实现复杂度较高28。
- **适用场景**：适用于需要高安全性和防篡改的场景28。
## 5. Mutual Authentication
- **简介**：Mutual 方案定义于RFC 8120，是一种双向认证机制，客户端和服务器相互验证身份。
- **流程**：
    - 客户端和服务器交换证书，并验证对方的身份。
- **安全性**：双向认证提供了更高的安全性，但需要复杂的证书管理和配置28。
- **适用场景**：适用于高安全性要求的场景，如金融或政府系统28。
## 6. AWS4-HMAC-SHA256
- **简介**：这是Amazon Web Services（AWS）使用的认证方案，基于HMAC-SHA256算法。
- **流程**：
    - 客户端使用密钥和请求内容生成签名，并通过`Authorization`头发送给服务器。
    - 服务器验证签名。
- **安全性**：由于使用HMAC-SHA256，该方案具有较高的安全性18。
- **适用场景**：适用于AWS服务的API认证18。
## 总结
- **Basic**：简单易用，但安全性低，需结合HTTPS。
- **Bearer**：适用于OAuth 2.0，令牌需妥善保护。
- **Digest**：比Basic更安全，但实现复杂。
- **HOBA**：基于数字签名，安全性高。
- **Mutual**：双向认证，安全性最高，但配置复杂。
- **AWS4-HMAC-SHA256**：适用于AWS服务，安全性高。


## Authorization 头

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

