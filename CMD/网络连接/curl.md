| 分类     | 参数                  | 作用           | 示例                                              |
| ------ | ------------------- | ------------ | ----------------------------------------------- |
| 基础     | `-X`                | 指定请求方法       | `curl -X POST https://api.com`                  |
| 基础     | `-L`                | 跟随重定向        | `curl -L https://a.com`                         |
| 基础     | `-I`                | 只获取响应头       | `curl -I https://a.com`                         |
| 数据     | `-d`                | 发送表单数据       | `curl -d "a=1&b=2" https://api.com`             |
| 数据     | `--data-binary`     | 发送原始数据       | `curl --data-binary @file.json https://api.com` |
| 头部     | `-H`                | 自定义请求头       | `curl -H "Content-Type: application/json"`      |
| 认证     | `-u`                | Basic Auth   | `curl -u user:pass https://api.com`             |
| 认证     | `Authorization`     | Bearer Token | `curl -H "Authorization: Bearer xxx"`           |
| 输出     | `-o`                | 保存为指定文件      | `curl -o file.html https://a.com`               |
| 输出     | `-O`                | 用远程文件名保存     | `curl -O https://a.com/file.zip`                |
| 输出     | `-s`                | 静默模式         | `curl -s https://a.com`                         |
| 输出     | `-S`                | 显示错误（配合 -s）  | `curl -sS https://a.com`                        |
| 调试     | `-v`                | 显示详细过程       | `curl -v https://a.com`                         |
| 调试     | `--trace`           | 更详细日志        | `curl --trace log.txt`                          |
| 超时     | `--connect-timeout` | 连接超时         | `curl --connect-timeout 5 https://a.com`        |
| 超时     | `--max-time`        | 最大耗时         | `curl --max-time 10 https://a.com`              |
| 重试     | `--retry`           | 自动重试         | `curl --retry 3 https://a.com`                  |
| Cookie | `-c`                | 保存 Cookie    | `curl -c cookie.txt https://a.com`              |
| Cookie | `-b`                | 发送 Cookie    | `curl -b cookie.txt https://a.com`              |
| 代理     | `-x`                | 使用代理         | `curl -x http://127.0.0.1:7890 https://a.com`   |
