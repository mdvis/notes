# revison
```bash
> git reset dandian
> fatal: ambiguous argument 'dandian': both revision and filename
> Use '--' to separate paths from revisions, like this:
> 'git <commoand> [<revision>...] -- [<file>...]'
```

原因是当前操作目录下文件名与某个分支名重复，可以使用 `--` 分割即可，`--` 前面可以是分支、tag等，`--` 后面为文件

```bash
> git reset -- dandian # 即表示此时 dandian 为一个文件
```