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

