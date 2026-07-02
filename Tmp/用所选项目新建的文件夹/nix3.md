## 核心思想：声明式与不可变性
- **不可变商店 (`/nix/store`)**：所有包都安装在 `/nix/store/<hash>-<name>-<version>` 下。由于路径包含 Hash，不同版本的软件可以完美共存，互不干扰。
- **声明式配置**：你不再通过运行命令来安装软件，而是通过编写一个 `.nix` 文件描述你想要的状态，然后让 Nix 去实现它。
## 基础基石：Nix 语言速成

Nix 是一门函数式、惰性求值的领域特定语言（DSL）。
- **属性集 (Attribute Sets)**：类似 JSON 对象。
```nix
{ a = 1; b = "hello"; }

```
- **函数 (Functions)**：用冒号分隔参数和主体。
```nix
x: x + 1  # 接收 x，返回 x+1
```
- **Let 绑定**：定义局部变量。
```nix
let
  name = "Nix";
in
"Hello ${name}"
```
## 核心工具：Flakes (雪片)

**Flakes** 是 Nix 的未来，它解决了“代码在我的机器上能跑，在你的机器上不行”的问题。它通过 `flake.lock` 文件锁定所有依赖的版本。

一个典型的 `flake.nix` 结构如下：
```nix
{
  description = "我的第一个 Flake 项目";

  # 输入：你的依赖（如 Nixpkgs）
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  # 输出：你想提供的东西（包、开发环境等）
  outputs = { self, nixpkgs }:
    let
      system = "x86_64-linux"; # 或 "aarch64-darwin" (Mac M1/M2)
      pkgs = nixpkgs.legacyPackages.${system};
    in {
      devShells.${system}.default = pkgs.mkShell {
        buildInputs = [ pkgs.nodejs pkgs.git ];
      };
    };
}

````
## 必备的新一代命令 (Nix-command)
忘记老的 `nix-env` 或 `nix-build` 吧，现在你只需要记住 `nix` 后接子命令：
### A. 临时环境：`nix shell`
想试用某个软件而不想污染系统？
```bash
nix shell nixpkgs#htop
# 运行完退出后，htop 不会留在你的 PATH 里

```
### B. 开发环境：`nix develop`
进入项目目录（含有 `flake.nix`），运行此命令。它会根据配置文件自动配置好所有编译器、依赖项和环境变量。
```bash
nix develop
```
### C. 运行命令：`nix run`
直接运行一个远程或本地 Flake 定义的可执行文件：
```bash
nix run github:edolstra/dwarfs -- --help
```
### D. 构建项目：`nix build`
构建 Flake 定义的默认包，结果会生成一个名为 `result` 的软链接指向 `/nix/store`。
```bash
nix build
```
## 进阶：如何管理系统或用户环境？
虽然 `nix shell` 很好用，但你总归需要一些常驻工具。
1. **NixOS (Linux 用户)**：在 `/etc/nixos/configuration.nix` 中声明式管理整个操作系统。
2. **Home Manager (Mac 或其他 Linux 发行版)**：使用 Nix 的方式管理你的 `$HOME` 目录（如 `.zshrc`, `.vimrc` 和常用软件）。
### Home Manager 示例片段
```nix
home.packages = [
  pkgs.vscode
  pkgs.ripgrep
];

programs.git = {
  enable = true;
  userName = "Your Name";
};

```
## 学习路径建议
1. **安装 Nix**：使用官方推荐的 [Determinate Systems 安装脚本](https://determinate.systems/nix-installer)，它会自动为你开启 Flakes 支持。
2. **探索包管理器**：在 [search.nixos.org](https://search.nixos.org/packages) 搜索你需要的软件。
3. **从 DevShell 开始**：为你现在的每个项目写一个 `flake.nix`，从此摆脱环境变量噩梦。
4. **逐步原子化**：当你习惯了 Nix 的逻辑，再考虑通过 Home Manager 管理你的整个点文件（Dotfiles）。

**总结：** 新时代的 Nix 就像是**软件分发的 Git**。`flake.nix` 是你的代码，`flake.lock` 是你的提交记录，而 `/nix/store` 是你的仓库。一旦你适应了这种“一切皆计算”的思维方式，你就再也不会想回到传统的包管理模式了。