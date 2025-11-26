```
qpdf [options] input.pdf outpuf.pdf
```
- `--password`
- `--decrypt`
- `--encrypt <user-passwd> <owner-passwd> <length>`
- `--pages`
- `--empty`
- `--stream-data`
- `--rotate [[page]:]<deg>`
- `--check` 检查语法
- `--show-npages`
- `--show-metadata`
- `--replace-input` 直接在源文件上修改
- `--help`
- `--version`
- `--qdf` 生成可编辑格式
- `--json`
- `--repair` 修复损坏文件
- `--progress`
- `--` 命令中的`--`用于分隔选项和文件名，在大多数情况下，如果选项和文件名不会混淆，可以省略，但为了清晰，建议保留

```
# 加密
qpdf --encrypt "user-pwd" "owner-pwd" 128 -- file.pdf encrypted.pdf

# 解密
qpdf --password --decrypt encrypted.pdf decrypted.pdf

# 提取页面
qpdf --pages file.pdf 1-5 -- -- out.pdf

# 删除页面
qpdf --pages file.pdf 1-3,6-z -- -- out.pdf

# 合并页面
qpdf --empty --pages file1.pdf file2.pdf -- merged.pdf

# 旋转
qpdf --rotate=+90:2-5 file.pdf rotated.pdf
```