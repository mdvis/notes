**curl命令** 是一个利用URL规则在命令行下工作的文件传输工具。它支持文件的上传和下载，所以是综合传输工具，但按传统，习惯称curl为下载工具。作为一款强力工具，curl支持包括HTTP、HTTPS、ftp等众多协议，还支持POST、cookies、认证、从指定偏移处下载部分文件、用户代理字符串、限速、文件大小、进度条等特征。做网页处理流程和数据检索自动化，curl可以助一臂之力。
## 语法
```shell
curl [选项] [参数]
```

| 选项                                                 | 作用                                     | 示例                                                                                                                             |
| -------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `-A [user-agent]`                                  | 设置请求的 User-Agent 头                     | `curl -A "Mozilla/5.0" http://example.com`                                                                                     |
| `-b`, `--cookie`                                   | 发送指定的 Cookie                           | `curl -b "name=value" http://example.com`                                                                                      |
| `-c [cookie 文件]`<br><br>`--cookie-jar [cookie 文件]` | 将服务器响应的 Cookie 保存到指定的文件中               | `curl -c cookies.txt http://example.com`                                                                                       |
| `-C -`, `--continue-at`                            | 断点续传，继续上次未完成的下载                        | `curl -C - -O http://example.com/largefile.zip`                                                                                |
| `-d`, `--data`                                     | 发送 POST 请求并传递数据，可直接跟数据或从文件读取           | `curl -d "param1=value1&param2=value2" https://api.example.com/submit`  <br>`curl -d @data.txt https://api.example.com/submit` |
| `-e [referer]`                                     | 设置请求的 Referer 头                        | `curl -e http://referrer.com http://example.com`                                                                               |
| `-H`, `--header`                                   | 自定义 HTTP 请求头                           | `curl -H "Authorization: Bearer your_token" https://api.example.com/protected`                                                 |
| `-I`                                               | 只显示 HTTP 响应头信息                         | `curl -I https://www.example.com`                                                                                              |
| `-k`, `--insecure`                                 | 在使用 HTTPS 时，忽略证书验证                     | `curl -k https://example.com`                                                                                                  |
| `-L`                                               | 让 `curl` 跟随 HTTP 重定向                   | `curl -L https://example.com/redirect`                                                                                         |
| `-m [秒数]`, `--max-time [秒数]`                       | 设置整个操作的最大允许时间（秒）                       | `curl --max-time 10 https://example.com/large_file`                                                                            |
| `-n`, `--netrc`                                    | 从用户主目录的 `.netrc` 文件中读取登录信息             | `curl -n http://example.com`                                                                                                   |
| `-O`                                               | 将远程文件下载到当前目录，文件名保持不变                   | `curl -O https://example.com/file.zip`                                                                                         |
| `-o`                                               | 指定下载文件的本地文件名                           | `curl -o local_name.zip https://example.com/file.zip`                                                                          |
| `-s`, `--silent`                                   | 静默模式，不显示进度信息和错误信息                      | `curl -s https://example.com`                                                                                                  |
| `-S`, `--show-error`                               | 与 `-s` 一起使用时，若发生错误则显示错误信息              | `curl -sS https://nonexistent.example.com`                                                                                     |
| `-T`, `--upload-file`                              | 上传文件                                   | `curl -T file.txt ftp://example.com/upload/`                                                                                   |
| `-u`, `--user`                                     | 进行基本认证                                 | `curl -u username:password https://api.example.com/protected`                                                                  |
| `-v`                                               | 显示详细的请求和响应过程，便于调试。                     | `curl -v http://example.com`                                                                                                   |
| `-w "格式化字符串"`, `--write-out [format]`              | 在操作完成后，输出指定的格式化信息                      | `curl -w "HTTP 状态码: %{http_code}\n" -o /dev/null -s http://example.com`                                                        |
| `-x`, `--proxy`                                    | 设置代理服务器                                | `curl --proxy http://proxy.example.com:8080 https://example.com`                                                               |
| `-X`                                               | 指定请求方法，如 `GET`、`POST`、`PUT`、`DELETE` 等 | `curl -X PUT -d "data=updated" https://api.example.com/resource`                                                               |
| `-z [时间]`                                          | 仅在文件比指定时间更新时才下载                        | `curl -z "2025-02-18" -O http://example.com/file.zip`                                                                          |
| `-#`                                               | 显示下载或上传的进度条                            | `curl -# https://example.com/file.zip`                                                                                         |
| `--connect-timeout`                                | 设置连接超时时间（秒）                            | `curl --connect-timeout 5 https://example.com`                                                                                 |
| `--digest`                                         | 进行摘要认证，需结合 `-u` 使用                     | `curl --digest -u username:password https://api.example.com/protected`                                                         |
| `--limit-rate`                                     | 限制下载或上传的速度                             | `curl --limit-rate 100K https://example.com/large_file.zip`                                                                    |
### 实例

#### **文件下载**

curl命令可以用来执行下载、发送各种HTTP请求，指定HTTP头部等操作。如果系统没有curl可以使用`yum install curl`安装，也可以下载安装。curl是将下载文件输出到stdout，将进度信息输出到stderr，不显示进度信息使用`--silent`选项。

```shell
curl URL --silent
```

这条命令是将下载文件输出到终端，所有下载的数据都被写入到stdout。

使用选项`-O`将下载的数据写入到文件，必须使用文件的绝对地址：

```shell
curl http://example.com/text.iso --silent -O
```

选项`-o`将下载数据写入到指定名称的文件中，并使用`--progress`显示进度条：

```shell
curl http://example.com/test.iso -o filename.iso --progress
######################################### 100.0%
```

#### **不输出错误和进度信息**

`-s` 参数将不输出错误和进度信息。

```shell
curl -s https://www.example.com
# 上面命令一旦发生错误，不会显示错误信息。不发生错误的话，会正常显示运行结果。
```

如果想让 curl 不产生任何输出，可以使用下面的命令。

```shell
curl -s -o /dev/null https://example.com
```

#### **断点续传**

curl能够从特定的文件偏移处继续下载，它可以通过指定一个偏移量来下载部分文件：

```shell
curl URL/File -C 偏移量

#偏移量是以字节为单位的整数，如果让curl自动推断出正确的续传位置使用-C -：
curl -C -URL
```

#### **使用curl设置参照页字符串**

参照页是位于HTTP头部中的一个字符串，用来表示用户是从哪个页面到达当前页面的，如果用户点击网页A中的某个连接，那么用户就会跳转到B网页，网页B头部的参照页字符串就包含网页A的URL。

使用 `--referer` 选项指定参照页字符串：

```shell
curl --referer http://www.example.com http://example.com
```

#### **用curl设置用户代理字符串**

有些网站访问会提示只能使用IE浏览器来访问，这是因为这些网站设置了检查用户代理，可以使用curl把用户代理设置为IE，这样就可以访问了。使用 `--user-agent` 或者 `-A` 选项：

```shell
curl URL --user-agent "Mozilla/5.0"
curl URL -A "Mozilla/5.0"
```

其他HTTP头部信息也可以使用curl来发送，使用`-H`"头部信息" 传递多个头部信息，例如：

```shell
curl -H "Host:example.com" -H "accept-language:zh-cn" URL
```

#### **curl的带宽控制和下载配额**

使用`--limit-rate`限制curl的下载速度：

```shell
curl URL --limit-rate 50k
```

命令中用k（千字节）和m（兆字节）指定下载速度限制。

使用`--max-filesize`指定可下载的最大文件大小：

```shell
curl URL --max-filesize bytes
```

如果文件大小超出限制，命令则返回一个非0退出码，如果命令正常则返回0。

```shell
curl --limit-rate 200k https://example.com
# 上面命令将带宽限制在每秒 200K 字节。
```

#### **用curl进行认证**

使用curl选项 -u 可以完成HTTP或者FTP的认证，可以指定密码，也可以不指定密码在后续操作中输入密码：

```shell
curl -u user:pwd http://example.com
curl -u user http://example.com
```

#### **只打印响应头部信息**

通过`-I`或者`-head`可以只打印出HTTP头部信息：

```shell
[root@localhost text]# curl -I http://example.com
HTTP/1.1 200 OK
Content-Encoding: gzip
Accept-Ranges: bytes
Age: 275552
Cache-Control: max-age=604800
Content-Type: text/html; charset=UTF-8
Date: Mon, 24 Apr 2023 14:39:36 GMT
Etag: "3147526947+gzip"
Expires: Mon, 01 May 2023 14:39:36 GMT
Last-Modified: Thu, 17 Oct 2019 07:18:26 GMT
Server: ECS (sec/96EE)
X-Cache: HIT
Content-Length: 648
```

#### **GET 请求**

```shell
curl "http://www.example.com"    # 如果这里的URL指向的是一个文件或者一幅图都可以直接下载到本地
curl -i "http://www.example.com" # 显示全部信息
curl -l "http://www.example.com" # 显示页面内容
curl -v "http://www.example.com" # 显示get请求全过程解析
```

#### **POST 请求**

```shell
$ curl -d "param1=value1&param2=value2" "http://www.example.com/login"

$ curl -d'login=emma＆password=123' -X POST https://example.com/login
# 或者
$ curl -d 'login=emma' -d 'password=123' -X POST  https://example.com/login
```

`--data-urlencode` 参数等同于 `-d`，发送 `POST` 请求的数据体，区别在于会自动将发送的数据进行 `URL` 编码。

```shell
curl --data-urlencode 'comment=hello world' https://example.com/login
# 上面代码中，发送的数据hello world之间有一个空格，需要进行 URL 编码。
```

#### **发送本地文件中的文字**

```shell
curl -d '@data.txt' https://example.com/upload
# 读取data.txt文件的内容，作为数据体向服务器发送。
```

#### **JSON 格式的 POST 请求**

```shell
curl -l -H "Content-type: application/json" -X POST -d '{"phone":"13888888888","password":"test"}' http://example.com/apis/users.json
```

#### **向服务器发送 Cookie**

使用`--cookie "COKKIES"`选项来指定cookie，多个cookie使用分号分隔：

```shell
curl http://example.com --cookie "user=root;pass=123456"
```

将cookie另存为一个文件，使用`--cookie-jar`选项：

```shell
curl URL --cookie-jar cookie_file
```

`-b` 参数用来向服务器发送 Cookie。

```shell
curl -b 'foo=bar' https://example.com
# 上面命令会生成一个标头Cookie: foo=bar，向服务器发送一个名为foo、值为bar的 Cookie。
```

```shell
curl -b 'foo1=bar' -b 'foo2=baz' https://example.com
# 上面命令发送两个 Cookie。

```shell
curl -b cookies.txt https://www.example.com
# 上面命令读取本地文件 cookies.txt，里面是服务器设置的 Cookie（参见-c参数），将其发送到服务器。
```

#### **Cookie 写入一个文件**

```shell
curl -c cookies.txt https://www.example.com
# 上面命令将服务器的 HTTP 回应所设置 Cookie 写入文本文件cookies.txt。
```

#### **请求的来源**

`-e` 参数用来设置 `HTTP` 的标头 `Referer`，表示请求的来源。

```shell
curl -e 'https://example.com?q=example' https://www.example.com
# 上面命令将Referer标头设为 https://example.com?q=example。
```

`-H` 参数可以通过直接添加标头 `Referer`，达到同样效果。

```shell
curl -H 'Referer: https://example.com?q=example' https://www.example.com
```

#### **上传二进制文件**

`-F` 参数用来向服务器上传二进制文件。

```shell
curl -F 'file=@photo.png' https://example.com/profile
# 上面命令会给 HTTP 请求加上标头 Content-Type: multipart/form-data ，然后将文件photo.png作为file字段上传。
```

`-F` 参数可以指定 `MIME` 类型。

```shell
curl -F 'file=@photo.png;type=image/png' https://example.com/profile
# 上面命令指定 MIME 类型为image/png，否则 curl 会把 MIME 类型设为 application/octet-stream。
```

`-F` 参数也可以指定文件名。

```shell
curl -F 'file=@photo.png;filename=me.png' https://example.com/profile
# 上面命令中，原始文件名为photo.png，但是服务器接收到的文件名为me.png。
```

#### **设置请求头**

`-H` 参数添加 `HTTP` 请求的标头。

```shell
curl -H 'Accept-Language: en-US' https://example.com
# 上面命令添加 HTTP 标头 Accept-Language: en-US。
```

```shell
curl -H 'Accept-Language: en-US' -H 'Secret-Message: xyzzy' https://example.com
# 上面命令添加两个 HTTP 标头。
```

```shell
curl -d '{"login": "emma", "pass": "123"}' -H 'Content-Type: application/json' https://example.com/login
# 上面命令添加 HTTP 请求的标头是 Content-Type: application/json，然后用 -d 参数发送 JSON 数据。
```

#### **跳过 SSL 检测**

```shell
curl -k https://www.example.com
# 上面命令不会检查服务器的 SSL 证书是否正确。
```

#### **请求跟随服务器的重定向**

`-L` 参数会让 `HTTP` 请求跟随服务器的重定向。`curl` 默认不跟随重定向。

```shell
curl -L -d 'tweet=hi' https://api.example.com/tweet
```

值得注意的是，这种重定向方式不适用于在返回的 HTML 中的重定向，比如这种是不被 curl 识别的重定向(这部分内容由 `curl -v -L <url>` 生成)

```curl
* Connected to example.com (*.*.*.*) port 80 (#0)
> GET / HTTP/1.1
> Host: example.com
> User-Agent: curl/8.0.1
> Accept: */*
>
< HTTP/1.1 200 OK
....
< Content-Type: text/html
<
<html>
<meta http-equiv="refresh" content="0;url=http://www.example.com/">
</html>

```

#### **调试参数**

`-v` 参数输出通信的整个过程，用于调试。

```shell
curl -v https://www.example.com
# --trace参数也可以用于调试，还会输出原始的二进制数据。
```

```shell
curl --trace - https://www.example.com
```

#### **获取本机外网 IP**

```shell
curl ipecho.net/plain
```

#### **使用 curl 测试网站加载速度**

命令有一个鲜为人知的选项，`-w`，该选项在请求结束之后打印本次请求的统计数据到标准输出。

首先，我们定义控制打印行为的格式化字符串。新建文本文件 `fmt.txt`，并填入下面的内容：

```ruby
\n
Response Time for: %{url_effective}\n\n
DNS Lookup Time:\t\t%{time_namelookup}s\n
Redirection Time:\t\t%{time_redirect}s\n
Connection Time:\t\t%{time_connect}s\n
App Connection Time:\t\t%{time_appconnect}s\n
Pre-transfer Time:\t\t%{time_pretransfer}s\n
Start-transfer Time:\t\t%{time_starttransfer}s\n\n
Total Time:\t\t\t%{time_total}s\n
```

curl 提供了很多置换变量，可以在格式化字符串中通过 `%{var}` 的形式使用。完整的变量列表可以在 `curl` 的 `manpage` 中查看。简单介绍一下我们使用的这几个变量：

- `url_effective`: 执行完地址重定向之后的最终 URL；
- `time_namelookup`: 从请求开始至完成名称解析所花的时间，单位为秒，下同；
- `time_redirect`: 执行所有重定向所花的时间；
- `time_connect`: 从请求开始至建立 TCP 连接所花的时间；
- `time_appconnect`: 从请求开始至完成 SSL/SSH 握手所花的时间；
- `time_pretransfer`: 从请求开始至服务器准备传送文件所花的时间，包含了传送协商时间；
- `time_starttransfer`: 从请求开始至服务器准备传送第一个字节所花的时间；
- `time_total`: 完整耗时。

然后执行请求，通过 @filename 指定保存了格式化字符串的文件：

```shell
curl -L -s -w @fmt.txt -o /dev/null http://www.example.com
```

输出：

```c
Response Time for: http://www.google.co.jp/?gfe_rd=cr&dcr=0&ei=cjIaWpTkHeiQ8QfnxYzoBA

DNS Lookup Time:        0.000038s
Redirection Time:       0.207271s
Connection Time:        0.000039s
App Connection Time:    0.000039s
Pre-transfer Time:      0.000067s
Start-transfer Time:    0.260115s

Total Time:             0.467691s
```

#### **要求返回是压缩的状态**

```shell
$ curl --compressed -o- -L https://yarnpkg.com/install.sh | bash
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100    54  100    54    0     0     42      0  0:00:01  0:00:01 --:--:--    42
100  2341  100  2341    0     0   1202      0  0:00:01  0:00:01 --:--:--  9289
Installing Yarn!
> Downloading tarball...

[1/2]: https://yarnpkg.com/latest.tar.gz --> /var/folders/j7/3xly5sk567s65ny5dnr__3b80000gn/T/yarn.tar.gz.XXXXXXXXXX.9hJsBsrA
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100    57  100    57    0     0     72      0 --:--:-- --:--:-- --:--:--    72
100    93  100    93    0     0     63      0  0:00:01  0:00:01 --:--:--    63
100   643  100   643    0     0    248      0  0:00:02  0:00:02 --:--:--   707
100 1215k  100 1215k    0     0   153k      0  0:00:07  0:00:07 --:--:--  305k

[2/2]: https://yarnpkg.com/latest.tar.gz.asc --> /var/folders/j7/3xly5sk567s65ny5dnr__3b80000gn/T/yarn.tar.gz.XXXXXXXXXX.9hJsBsrA.asc
100    61  100    61    0     0    356      0 --:--:-- --:--:-- --:--:--   356
100    97  100    97    0     0    325      0 --:--:-- --:--:-- --:--:--   325
100   647  100   647    0     0   1283      0 --:--:-- --:--:-- --:--:--  1283
100   832  100   832    0     0   1107      0 --:--:-- --:--:-- --:--:--  812k
```
