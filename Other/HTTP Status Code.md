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