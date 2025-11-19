# JSON
Javascript 对象表示法（JSON）用于发送和接收结构化信息的标准协议，类似的还有 XML、ASN、Google 的 Protocol Buffers 都是；由于简洁性、可读性、流行程度等，JSON 是应用最广泛的一个。

*   encoding/json
*   encoding/xml
*   encoding/asn1
*   github.com/golang/protobuf

JSON是对JavaScript中各种类型的值——字符串、数字、布尔值和对象——Unicode本文编码。它 可以用有效可读的方式表示第三章的基础数据类型和本章的数组、slice、结构体和map等聚合数据 类型。

### 编组

Go 数据转 JSON 的过程叫编组，通过 json.Marshal 函数完成

*   json.Marshal 紧凑格式的输出
*   json.MarshalIndent 缩进的输出
*   只有导出的（大写开头）结构体成员才会被编码

```go
func Marshal(v any) ([]byte, error)
// prefix 每行输出的前缀，indent 每个层级的缩进
func Marshal(v any, prefix, indent string) ([]byte, error)
```

#### Tag

*   一个构体成员 Tag 是和在编译阶段关联到该成员的元信息字符串
*   结构体的成员 Tag 可以是任意的字符串面值，通常是用空格分隔的 key:"value" 键值对序列；值中含有双引号字符，==成员 Tag 一般用**原生字符串面值**的形式书写==。
*   json 开头键名对应的值用于控制 encoding/json 包的编码和解码的行为，并且 encoding/... 下面其它的包也遵循这个约定。
*   成员 Tag 中 json 对应值的第一部分用于指定 JSON 对象的名字,额外的omitempty选项，表示当Go语言结构体成员为空或零值时不生成JSON对象

```go
type Move struct {
    Title string
    Year int `json:"released"`
    Color bool `json:"color,omitempty"`
    Actors []string
}

var movies = []Move{
    {Title: "A", Year: 1900, Color: false, Actors: []string{"E"}}
    {Title: "B", Year: 1878, Color: true, Actors: []string{"F"}}
}

data,err:=json.MarshalIndent(movies, "", "    ")
if err != nil {log.Fatalf("failed: %s", err)}
fmt.Printf("%s\n", data)
```

```json
[
    {
        "Title": "A",
        "released"": 1900,
        "Actors": [
            "E"
        ]
    {
        "Title": "B",
        "released": 1878,
        "color": true,
        "Actors": [
            "F"
        ]
]
```

### 解码

将 json 解码为 Go 数据结构（go 中一般叫 unmarshaling）,`json.Unmarshal` 完成

```go
func Unmarshal(data []byte, v any) error
```

*   通过定义合适的 Go 数据结构，可以选择性的解码 JSON 中成员

```go
var titles []struct{Title string}
if err:=json.Unmarshal(data, &titles);!err == nil {}
```

即使对应的JSON对象名是小写字母，每个结构体的成员名也是声明为大写字母开头的。因为有些JSON成员名字和Go结构体成员名字并不相同，因此需要Go语言结构体成员Tag来指定对应的JSON名字。同样，在解码的时候也需要做同样的处理

*   url.QueryEscape
*   json.NewDecoder
*   json.Decode
*   json.Encode

```go
func NewDecoder(r io.Reader) *Decode
func (dec *Decoder) Decode(v interface{}) error
func NewEncoder(w io.Writer) *Encoder
func (enc *Encoder) Encode(v interface{}) error
func QueryEscape(s string) string // QueryEscape函数对s进行转码使之可以安全的用在URL查询里
```

文本和HTML模板

* * *

提供了一个将变量值填充到一个文本或HTML格式的模板的机制

*   text/template
*   html/template
*   一个模板是一个字符串或一个文件，里面包含由双花括号包含的 {{action}}对象
*   actions 包含了一个用模板语言书写的表达式
*   模板语言包含通过选择结构体的成员、调用函数或方法、表达式控制流 if­else 语句和 range 循环语句，还有其它实例化模板等诸多特性
*   action，都有一个当前值的概念，对应点操作符，写作“.”。当前值“.”最初被初始化为调用模板时的参数
*   action中，`|`操作符表示将前一个表达式的结果作为后一个函数的输入，类似于UNIX中管道的概念。

```go
const templ = `{{.TotalCount}} issues:
{{range .Items}}‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐
Number: {{.Number}}
User: {{.User.Login}}
Title: {{.Title | printf "%.64s"}}
Age: {{.CreatedAt | daysAgo}} days
{{end}}`

report, err := template.New("report").
    Funcs(template.FuncMap{"daysAgo": daysAgo}).
    Parse(templ)
if err != nil {
    log.Fatal(err)
}

// report = template.Must(template.New("issuelist").
//	Funcs(template.FuncMap{"daysAgo": daysAgo}).
//  Parse(templ))

func main(){
result, err:=github.SearchIssues(os.Args[1:])
    if err != nil {
        log.Fatal(err)
    }
    if err := report.Execute(os.Stdout, result);err!=nil{
        log.Fatal(err)
    }
}
```

生成模板的输出需要两个处理步骤

1.  分析模板并转为内部表示

分析模板一般只需要执行一次。方法调用链的顺序：template.New 先创建并返回一个模板；Funcs 方法将 daysAgo 等自定义函数注册到模板中，并返回模板；最后调用 Parse 函数分析模板。

因为模板通常在编译时就测试好了，如果模板解析失败将是一个致命的错误。template.Must辅助 函数可以简化这个致命错误的处理：它接受一个模板和一个error类型的参数，检测error是否为 nil（如果不是nil则发出panic异常），然后返回传入的模板

1.  基于指定的输入执行模板

*   template.Must
*   template.New
*   template.Funcs
*   template.FuncMap
*   template.Parse
*   template.Execute

```go
type FuncMap map[string]any
func Must(t *Template, err error) *Template
func New(name string) *Template
func (t *Template) Funcs(funcMap FuncMap) *Template
func (t *Template) Parse(text string) (*Template, error)
func (t *Template) Execute(wr io.Writer, data any) error
```

html/template模板包。增加了一个将字符串自动转义特性，这可以避免输入字符串和HTML、JavaScript、CSS或URL语法产生冲突的问题。还可以避免一些长期存在的安全问题，比如通过生成HTML注入攻击，通过构造一个含有恶意代码的问题标题，这些都可能让模板输出错误的输出，从而让他们控制页面。