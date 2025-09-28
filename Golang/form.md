# form
\[toc\]

*   http.Request.ParseForm 解析get中的params或者post中的body;只有就可以从Request中读取Form信息
*   Request.Form
*   Request.Form\[key\]

表单验证

* * *

*   表单中的文本框、文本域、上传文件，无值时在Form中是空值，复选框和单选按钮则不会在Form中产生对应函数，可以用Request.Form.Get来获取值，这样不管是否存在于Form无值的情况都会返回空值，再使用len判断是否填写
*   如果是数字就试着转成int类型（或者使用正则也可以），然后处理

XSS

* * *

应对：

1.  验证所有输入数据，有效监测攻击
2.  处理所有输出数据进行适当的处理，放置任何成功注入的脚本运行

### html/template

HTMLEscape(w io.Writer, b \[\]byte) // 把b进行转义之后写入到w HTMLEscapeString(s string) string // 转义s后返回结果字符串 HTMLEscaper(args ...interface{}) string // 支持多个参数一起转义，返回结果字符串

重复提交

* * *

token

文件上传

* * *

### 表单上传

form 标签 enctype 属性

*   application/x-www-form-urlencoded 发送前编码所有字符，默认为此项
*   multipart/form-data 部队字符编码。在使用包含文件上传控件的表单时，必须使用此项
*   text/plain 空格转换为 "+" 加号，但不对特殊字符编码
*   调用 `r.ParseMultipartForm(maxMemory)` 处理文件上传，maxMemory 参数表示最大内存，如果大小超过maxMemory，剩下部分将存储在系统临时文件中
*   r.FormFile() 获取文件句柄
*   os.OpenFile
*   io.Copy 来存储文件

“注：获取其他非文件字段信息的时候就不需要调用r.ParseForm，因为在需要的时候Go语言自动会去调用，而且ParseMultipartForm调用一次之后，后面再次调用不会再有效果。

文件的handler是multipart.FileHeader

```
type FileHeader struct {
    Filename string
    Header textproto.MIMEHeader
}
```

### 客户端上传

*   bytes.Buffer
*   multipart.NewWriter
*   Writer.CreateFormFile
*   os.Open
*   io.Copy
*   Writer.FormDataContentType
*   http.Post
*   ioutil.ReadAll