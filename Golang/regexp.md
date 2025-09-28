- [是否匹配](#%E6%98%AF%E5%90%A6%E5%8C%B9%E9%85%8D)
- [解析正则表达式](#%E8%A7%A3%E6%9E%90%E6%AD%A3%E5%88%99%E8%A1%A8%E8%BE%BE%E5%BC%8F)
- [其他辅助函数](#%E5%85%B6%E4%BB%96%E8%BE%85%E5%8A%A9%E5%87%BD%E6%95%B0)
## 是否匹配
判断 `pattern` 是否和输入源匹配，若匹配，就返回 `true`，如果解析正则出错，则返回 `error`。
- `func Match(pattern string, b []byte) (matched bool, error error)` 输入源为 byte slice
- `func MatchReader(pattern string, r io.RuneReader) (matched bool, error error)` 输入源为 RuneReader
- `func MatchString(pattern string, s string) (matched bool, error error)` 输入源为 string
## 解析正则表达式
`CompilePOSIX` 和 `Compile` 的不同点在于前者必须使用`POSIX`语法，它使用最左最长方式搜索，而后者则只采用最左方式搜索（例如，`\[a-z\]{2,4}` 这样一个正则表达式，应用于 "aa09aaa88aaaa" 这个文本串时，`CompilePOSIX` 返回了 `aaaa`，而Compile返回的是aa）
- `func Compile(expr string) (*Regexp, error)`
- `func CompilePOSIX(expr string) (*Regexp, error)`

前缀有 `Must` 的函数表示，在解析正则语法的时候，如果匹配模式串不满足正确的语法，则直接 `panic`，而不加 `Must` 的则只是返回错误

- `func MustCompile(str string) *Regexp`
- `func MustCompilePOSIX(str string) *Regexp`
## 查找函数
一共 18 个函数，分为 8 类，只是输入源为 `byte slice`、`string` 和 `RuneReader` 的区别
- `func (re *Regexp) Find(b []byte) []byte` 查找匹配的第一个
- `func (re *Regexp) FindAll(b []byte, n int) [][]byte`
- `func (re *Regexp) FindAllIndex(b []byte, n int) [][]int`
- `func (re *Regexp) FindAllSubmatch(b []byte, n int) [][][]byte`
- `func (re *Regexp) FindAllSubmatchIndex(b []byte, n int) [][]int`
- `func (re *Regexp) FindIndex(b []byte) (loc []int)`
- `func (re *Regexp) FindSubmatch(b []byte) [][]byte`
- `func (re *Regexp) FindSubmatchIndex(b []byte) []int`
* * *
- `func (re *Regexp) FindAllString(s string, n int) []string`
- `func (re *Regexp) FindAllStringIndex(s string, n int) [][]int`
- `func (re *Regexp) FindAllStringSubmatch(s string, n int) [][]string`
- `func (re *Regexp) FindAllStringSubmatchIndex(s string, n int) [][]int`
- `func (re *Regexp) FindString(s string) string`
- `func (re *Regexp) FindStringIndex(s string) (loc []int)`
- `func (re *Regexp) FindStringSubmatch(s string) []string`
- `func (re *Regexp) FindStringSubmatchIndex(s string) []int`
* * *
- `func (re *Regexp) FindReaderIndex(r io.RuneReader) (loc []int)`
- `func (re *Regexp) FindReaderSubmatchIndex(r io.RuneReader) []int`
---
- `func (re *Regexp) Match (b []byte) bool`
- `func (re *Regexp) MatchReader (r io. RuneReader) bool`
- `func (re *Regexp) MatchString(s string) bool`
## 替换函数
