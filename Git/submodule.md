# submodule
Git Submodule 允许一个git仓库，作为另一个git仓库的子目录，并且保持父项目和子项目相互独立。

添加子仓库
-----

```
$ git submodule add <仓库地址> <本地路径>
```

父仓库根目录增加了.gitmodule文件

```
[submodule "sub"]
 path = lib
 url = ssh://git@10.2.237.56:23/dennis/sub.git
```

父仓库的git 配置文件中加入了submodule段

```
[submodule "sub"]
 url = ssh://git@10.2.237.56:23/dennis/sub.git
```

注意：添加子仓库之后，主仓库的对应目录下（这里为lib），并不是sub仓库的文件，而是对应的commit id。如图所示：

检出(checkout)
------------

克隆一个包含子仓库的仓库目录，并不会clone下子仓库的文件，只是会克隆下.gitmodule描述文件，需要进一步克隆子仓库文件。

```
// 初始化本地配置文件
$ git submodule init

// 检出父仓库列出的commit
$ git submodule update

或者使用组合指令。
$ git submodule update --init --recursive
```

注意：此时子目录的HEAD为submodule最后一次commit。

删除子仓库
-----

*   删除.gitsubmodule里相关部分
*   删除.git/config 文件里相关字段
*   删除子仓库目录。
*   `$ git rm --cached <本地路径>` 如果未按照上述步骤删除，可能残留在.git/modudles文件夹内。