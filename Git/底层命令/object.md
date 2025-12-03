# object
```shell
❯ git log -1 --pretty=raw
commit f89fc72f392383132d76c418bce3204c7389c6ef
tree c9134df227ccf5703e866bb9baa3e675df8f4ecf
parent 8e5c6dabf2a2824c0f6f46fe06cbfdce987aeb71
parent 1dc28664256801e2d2fff218ef90c25f2ee37944
author dewei.ma <xnmageis@outlook.com> 1696819580 +0800
committer dewei.ma <xnmageis@outlook.com> 1696819580 +0800

    Merge branch 'ueba-dev' into feature-glb
```

`commit <SHA1>` 本次提交的唯一ID `tree <SHA1>` 本次提交对应的目录树 `parent <SHA1>` 本次提交的父提交（上次提交）

*   根据ID查看其类型

```shell
git cat-file -t f89fc7 // commit
git cat-file -t c913   // tree
git cat-file -t 8e5c   // parent
```

*   根据ID查看其内容

```bash
git cat-file -p f89fc7 // commit 内容
git cat-file -p c913   // tree 目录内容 tree blob
git cat-file -p 8e5c   // commit 内容
git cat-file -p efaa63 // blob 内容(文件内容)
```

上面所有的对象均存在 `.git/objects` 中