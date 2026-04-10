
|分类|短参数|长参数|作用描述|示例|
|---|---|---|---|---|
|**基础请求**​|`-X`|`--request`|指定 HTTP 请求方法|`curl -X POST https://api.com`|
||`-L`|`--location`|跟随重定向|`curl -L https://a.com`|
||`-I`|`--head`|只获取响应头（HEAD请求）|`curl -I https://a.com`|
||`-G`|`--get`|将 -d 数据作为 URL 查询参数发送|`curl -G -d "q=test" https://api.com`|
|||`--compressed`|请求压缩响应并自动解压|`curl --compressed https://a.com`|
|**数据发送**​|`-d`|`--data`|发送 POST 数据（支持 @文件读取）|`curl -d "a=1&b=2" https://api.com`|
|||`--data-raw`|发送原始数据（不解释 @ 符号）|`curl --data-raw "@test" https://api.com`|
|||`--data-binary`|发送二进制数据，不做任何处理|`curl --data-binary @file.json https://api.com`|
||`-F`|`--form`|发送 multipart/form-data 数据|`curl -F "file=@/path/to/file" https://api.com`|
|**请求头**​|`-H`|`--header`|自定义请求头|`curl -H "Content-Type: application/json" https://api.com`|
||`-A`|`--user-agent`|设置 User-Agent 头|`curl -A "MyBrowser" https://a.com`|
||`-e`|`--referer`|设置 Referer 头|`curl -e "https://from.example" https://a.com`|
|**认证**​|`-u`|`--user`|Basic 认证|`curl -u user:pass https://api.com`|
|||`--basic`|强制使用 HTTP Basic 认证|`curl --basic -u user:pass https://api.com`|
|||`--bearer`|发送 Bearer Token 认证|`curl --bearer "token" https://api.com`|
|**输出控制**​|`-i`|`--include`|输出包含响应头|`curl -i https://a.com`|
||`-o`|`--output`|保存为指定文件|`curl -o file.html https://a.com`|
||`-O`|`--remote-name`|用远程文件名保存|`curl -O https://a.com/file.zip`|
||`-s`|`--silent`|静默模式（不显示进度/错误）|`curl -s https://a.com`|
||`-S`|`--show-error`|显示错误（配合 -s 使用）|`curl -sS https://a.com`|
||`-w`|`--write-out`|自定义输出格式|`curl -w "%{http_code}" https://a.com`|
||`-D`|`--dump-header`|将响应头保存到文件|`curl -D headers.txt https://a.com`|
||`-N`|`--no-buffer`|禁用输出缓冲|`curl -N https://stream.example.com`|
|**调试**​|`-v`|`--verbose`|显示详细传输过程|`curl -v https://a.com`|
|||`--trace`|生成更详细跟踪日志|`curl --trace log.txt https://a.com`|
|||`--trace-ascii`|生成 ASCII 格式跟踪日志|`curl --trace-ascii log.txt https://a.com`|
|**网络连接**​||`--connect-timeout`|连接超时时间|`curl --connect-timeout 5 https://a.com`|
||`-m`|`--max-time`|整个传输最大耗时|`curl --max-time 10 https://a.com`|
||`-x`|`--proxy`|使用代理服务器|`curl -x http://127.0.0.1:7890 https://a.com`|
||`-k`|`--insecure`|允许不安全的 SSL 连接|`curl -k https://self-signed.example.com`|
|||`--retry`|自动重试次数|`curl --retry 3 https://a.com`|
|||`--retry-delay`|重试间隔时间（秒）|`curl --retry 3 --retry-delay 2 https://a.com`|
|||`--retry-max-time`|最大重试总时间|`curl --retry 3 --retry-max-time 30 https://a.com`|
|**Cookie**​|`-b`|`--cookie`|发送 Cookie|`curl -b "session=abc123" https://a.com`|
||`-c`|`--cookie-jar`|保存收到的 Cookie 到文件|`curl -c cookie.txt https://a.com`|
||`-j`|`--junk-session-cookies`|忽略会话 cookie|`curl -j -b cookies.txt https://a.com`|
|**文件传输**​|`-T`|`--upload-file`|上传文件（PUT 方法）|`curl -T file.txt https://example.com/upload`|
||`-C`|`--continue-at`|断点续传（-C - 自动检测）|`curl -C - -O https://a.com/large.zip`|
||`-r`|`--range`|下载指定字节范围|`curl -r 0-999 -o part1 https://a.com`|
||`-B`|`--use-ascii`|使用 ASCII 文本传输|`curl -B ftp://example.com/file`|
|**其他**​|`-h`|`--help`|显示帮助信息|`curl --help`|
||`-V`|`--version`|显示版本信息|`curl --version`|

## 常用组合示例

```sh
# 发送 JSON 数据 POST 请求
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer xxxx" \
  -d '{"key":"value"}' \
  https://api.example.com/endpoint

# 发送表单数据并保存响应
curl -d "user=admin&pass=123" \
  -o response.txt \
  https://example.com/login

# 上传文件（multipart）
curl -F "file=@/path/to/file" \
  -F "description=我的文件" \
  https://example.com/upload

# 下载大文件（断点续传）
curl -C - -O https://example.com/largefile.zip

# 通过代理访问并跟随重定向
curl -x http://proxy:8080 \
  -L \
  -o result.html \
  https://example.com

# 调试 API 请求
curl -v -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer xxxx" \
  --data-binary @data.json \
  https://api.example.com/endpoint

# 带有重试和超时的请求
curl --retry 3 \
  --retry-delay 2 \
  --connect-timeout 5 \
  --max-time 30 \
  https://example.com
```
