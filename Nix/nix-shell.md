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

