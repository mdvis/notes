`nix-env` —— 用户级包管理器

`nix-env` 是 **Nix 包管理的用户接口**，主要用于**在当前用户环境安装、升级、卸载软件**，类似于 `apt install` 或 `brew install`，但具备 Nix 的特性：**不破坏系统，版本可并存，可回滚**。

### 常用操作

| 命令                          | 功能                       |
| --------------------------- | ------------------------ |
| `nix-env -iA nixpkgs.<pkg>` | 安装某个包（A 表示按属性名安装）        |
| `nix-env -u`                | 升级已安装的所有包                |
| `nix-env -e <pkg>`          | 卸载包                      |
| `nix-env -q`                | 查询当前已安装的包                |
| `nix-env -qaP <keyword>`    | 搜索可用包（a 表示所有，P 表示显示属性路径） |

#### 示例

```bash
nix-env -iA nixpkgs.htop   # 安装 htop
nix-env -qaP python        # 搜索 Python 相关的包
nix-env -e htop            # 卸载 htop
```

> **特点**
>
> - 对当前用户生效，不影响系统其他用户
>
> - 安装的包会放在 `~/.nix-profile`，并通过 symlink 链接到 Nix store
>
> - 不需要 root 权限
>
> - 缺点：不声明化，不方便系统迁移（更适合临时性安装）
>

`nix-shell` —— 临时开发环境

`nix-shell` 用于**进入一个带有指定依赖的临时 shell 环境**，常用于开发时加载依赖而不污染全局系统。

### 两种用法

#### ① 直接命令行临时环境

```bash
nix-shell -p python39 git
```

进入后，你会有一个临时 shell，内置 `python3.9` 和 `git`。退出后，这些包不会保留在系统中。

#### ② 使用 `shell.nix` 或 `default.nix`

适合开发项目，把依赖写在 `shell.nix` 里，让团队所有人进入相同环境：

```nix
# shell.nix
{ pkgs ? import <nixpkgs> {} }:
pkgs.mkShell {
  buildInputs = [
    pkgs.python39
    pkgs.git
  ];
}
```

然后：

```bash
nix-shell   # 自动加载 shell.nix
```

> **特点**
>
> - 环境是**临时的**，退出后不影响系统
>
> - 非常适合构建 reproducible（可复现）的开发环境
>
> - 支持自动下载、隔离依赖
>
> - 常与 CI/CD、科研、开源项目配合
>

