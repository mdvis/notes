正确学习顺序应该是：
1. flakes 是项目入口
2. nix develop 是开发环境
3. nix run 是运行
4. nix build 是构建
5. packages/devShells/apps 是标准输出
6. nixpkgs 是软件仓库
7. module system 是高级层

然后启用现代命令，编辑 `~/.config/nix/nix.conf`（或系统级 `/etc/nix/nix.conf`），加入：

```conf
experimental-features = nix-command flakes
```

Nix 是一门函数式、惰性求值的领域特定语言（DSL）。先了解三个基础语法即可：

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

> 不要一开始就研究 λ 演算、lazy evaluation、functional purity 等语言理论。先会“用”最重要。

现代 Nix 基本围绕 `flake.nix` 展开，**Flake** 是一个包含 `flake.nix` 文件的目录。它解决了 Nix 过去最大的痛点：**版本锁定**。 一个 `flake.nix` 主要由两部分组成：
1. **Inputs（输入）**：依赖项。比如你想用哪个版本的 `nixpkgs`。
2. **Outputs（输出）**：你产出的东西。可以是软件包、开发环境、或者是整个系统配置。
### 最小 flake
```nix
{
  description = "my first flake";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }:
    {
    };
}
```
字段说明：
- **description**：纯描述。
- **inputs**：依赖。类似 `dependencies`，但依赖的是 nixpkgs、其他 flakes、github 仓库、本地目录。例如 `nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable"` 表示使用 nixpkgs 的 unstable 分支。
- **outputs**：最重要。你定义的 package、dev shell、app、formatter、system config 全部从这里导出。

现代指令统一以 `nix <subcommand>` 开头，逻辑极其清晰。
### 常用命令对比表

| 旧指令 (Legacy)          | 现代指令 (Flakes/Command)                 | 作用                     |
| --------------------- | ------------------------------------- | ---------------------- |
| `nix-shell -p pkg`    | **`nix shell nixpkgs#pkg`**           | 临时进入包含该包的环境            |
| `nix-env -iA pkg`     | **`nix profile install nixpkgs#pkg`** | 像传统包管理器一样安装包           |
| `nix-build`           | **`nix build`**                       | 构建当前目录的 Flake          |
| `nix-shell`           | **`nix develop`**                     | 进入开发环境（读取 `devShells`） |
| `nix-collect-garbage` | **`nix store gc`**                    | 清理没用的文件（垃圾回收）          |
### 1. 临时环境：`nix shell`
```bash
nix shell nixpkgs#nodejs
```
### 2. 开发环境：`nix develop`（日常使用最多）
进入项目目录（含有 `flake.nix`），运行此命令。它会根据配置文件自动配置好所有编译器、依赖项和环境变量。
```bash
nix develop
```
临时运行：
```bash
nix develop --command bash
nix develop --command mvn test
```
### 3. 运行命令：`nix run`（杀手锏指令）
直接运行一个远程或本地 Flake 定义的可执行文件，不用安装：
```bash
nix run nixpkgs#cowsay -- "Hello Flakes!"
nix run nixpkgs#cowsay
nix run github:sharkdp/bat
nix run github:edolstra/dwarffs -- --help
```
这会自动下载、缓存并运行，运行完后你的系统依然干净如初。
### 4. 构建项目：`nix build`
构建 Flake 定义的默认包，结果会生成一个名为 `result` 的软链接指向 `/nix/store`。
```bash
nix build
nix build .#hello
./result/bin/hello
```

devShell 你最先应该掌握的。因为：

> 90% 人使用 Nix 的真正价值，是开发环境可复现。
### 创建开发环境

```nix
{
  description = "java dev";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      system = "aarch64-darwin";
      pkgs = import nixpkgs {
        inherit system;
      };
    in
    {
      devShells.${system}.default =
        pkgs.mkShell {
          packages = [
            pkgs.jdk21
            pkgs.maven
          ];
        };
    };
}
```
进入环境：
```bash
nix develop
java -version
mvn -version
exit
```
你会发现：机器没装 Java，但环境里有 Java。这就是 Nix 的核心魅力。
你必须理解：
```nix
system = "aarch64-darwin";
```
因为 Nix 所有包都按平台区分。

| 平台                | 值              |
| ----------------- | -------------- |
| Apple Silicon Mac | aarch64-darwin |
| Intel Mac         | x86_64-darwin  |
| Linux x64         | x86_64-linux   |
### 不要手写 system（正确写法）
现代 flake 通常用 `flake-utils`，自动支持 macOS、Linux、x64、arm64。
```nix
{
  description = "node dev";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };
      in
      {
        devShells.default =
          pkgs.mkShell {
            packages = [
              pkgs.nodejs
            ];
          };
      });
}
```

你可以导出自己的构建结果。
```nix
packages.${system}.hello =
  pkgs.writeShellScriptBin "hello" ''
    echo hello
  '';
```

让 `nix run` 能运行你的项目：

```nix
apps.${system}.default = {
  type = "app";
  program = "${self.packages.${system}.hello}/bin/hello";
};
```
然后：
```bash
nix build .#hello
nix run
```
你以后会这样工作：
```txt
git clone
↓
nix develop
↓
开始开发
```

第一次运行 `nix develop` 会生成 `flake.lock`，类似 `package-lock.json` / `pnpm-lock.yaml`。它锁定 nixpkgs 版本和所有依赖，保证可复现。

> 这意味着 10 年后你在另一台机器上运行 `nix develop`，得到的环境将完全一致。

更新所有依赖：

```bash
nix flake update
```

更新单个：

```bash
nix flake lock --update-input nixpkgs
```

这是 Nix 真正的完全体。

安装：

```bash
nix profile install nixpkgs#direnv
```

然后：

```bash
echo "use flake" > .envrc
direnv allow
```

以后：

```txt
cd project
↓
自动进入环境
```

离开目录自动退出。体验会直接提升一个量级。

现代用户级安装：

```bash
nix profile install nixpkgs#nodejs
nix profile list
nix profile remove 0
```

但注意：**真正推荐的是 devShell，而不是 profile**。因为 profile 会污染全局。

所有东西都在 `/nix/store` 下，例如 `/nix/store/xxxxx-openjdk-21`。

特点：

- 不覆盖
- 不共享 mutable 状态
- 不依赖系统目录

所以：**不会出现“升级导致全炸”**。

现代 Nix 允许你直接引用 GitHub 上的配置，而无需下载：

- 运行远程 Flake 里的包：`nix run github:edolstra/dwarffs`
- 使用特定的分支：`nix shell github:NixOS/nixpkgs/nixos-23.11#htop`

虽然 `nix shell` 很好用，但你总归需要一些常驻工具。

1. **NixOS (Linux 用户)**：在 `/etc/nixos/configuration.nix` 中声明式管理整个操作系统。
2. **Home Manager (Mac 或其他 Linux 发行版)**：使用 Nix 的方式管理你的 `$HOME` 目录（如 `.zshrc`、`.vimrc` 和常用软件）。

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

掌握顺序：
### 第一阶段（必须）
专注：flakes、nix develop、mkShell、packages、nixpkgs。这是核心中的核心。
### 第二阶段（开始高级）
学习：overlays、modules、home-manager、devenv.sh、nix-darwin / NixOS。
### 第三阶段（真正深入）
学习：derivation、stdenv、callPackage、overrideAttrs、fixed-output derivation。
当你习惯了 Nix 的逻辑，再考虑通过 Home Manager 管理你的整个点文件（Dotfiles）。

### 1. 不要学旧版教程

避免 `nix-env`，避免 `shell.nix`、`default.nix`，除非维护旧项目。
### 2. 不要一开始研究语言理论
很多 Nix 教程会变成 λ 演算、lazy evaluation、functional purity，新人会直接迷失。你应该先会“用”。
### 3. 不要把 Nix 当 Docker 替代品
它们解决不同问题。最强组合是：`Nix + Docker`。
### 5. Git 是必须的
**重要！** Flake 会忽略任何未被 Git 追踪 (`git add`) 的文件。如果你新建了一个 `.nix` 文件却发现 Nix 报错找不到它，请先 `git add`。

现代项目推荐结构

```txt
project/
├── flake.nix
├── flake.lock
├── .envrc
├── src/
└── README.md
```

> **底层逻辑：** 现代 Nix 就像是软件包管理界的 Git。`flake.nix` 是你的代码，`flake.lock` 是你的 Commit ID，而 `/nix/store` 是你的仓库，`nix build/run` 则是你的 CI/CD。