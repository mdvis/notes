# Nix 全面教程（现代体系：`nix-command` + `flakes`）

## 引言：现代 Nix 是什么

你可以把现代 Nix 理解成：

> 一个“可复现的软件与环境描述系统”。

它不是“包管理器增强版”，而是：

- 描述环境
- 描述构建过程
- 描述开发 Shell
- 描述系统配置
- 描述 CI
- 描述部署

然后：

> Nix 保证任何机器得到同样结果。

如果你之前听说 Nix 很难学，那通常是因为旧版的 Nix 充满了隐式逻辑和全局变量（如 `NIX_PATH`）。

**现代 Nix（Nix 2.0+ 与 Flakes）** 的核心目标是：**显式、纯净、可重现**。

> 先把它当成“声明式 pnpm + Docker + CI + SDK manager + Homebrew”的统一体。这是最容易理解的。

---

## 一、核心思想：声明式与不可变性

- **不可变商店 (`/nix/store`)**：所有包都安装在 `/nix/store/<hash>-<name>-<version>` 下。由于路径包含 Hash，不同版本的软件可以完美共存，互不干扰。
- **声明式配置**：你不再通过运行命令来安装软件，而是通过编写一个 `.nix` 文件描述你想要的状态，然后让 Nix 去实现它。

---

## 二、先建立正确认知

很多教程一开始就讲：

- derivation
- lazy evaluation
- purity
- store
- overlays

这会把新人直接劝退。

正确学习顺序应该是：

1. flakes 是项目入口
2. nix develop 是开发环境
3. nix run 是运行
4. nix build 是构建
5. packages/devShells/apps 是标准输出
6. nixpkgs 是软件仓库
7. module system 是高级层

---

## 三、安装 Nix（必须开启 flakes）

官方安装：

```bash
sh <(curl -L https://nixos.org/nix/install) --daemon
```

或者使用官方推荐的 [Determinate Systems 安装脚本](https://determinate.systems/nix-installer)，它会自动为你开启 Flakes 支持：

```bash
curl -sSf -L https://install.determinate.systems/nix | sh -s -- install
```

然后启用现代命令，编辑 `~/.config/nix/nix.conf`（或系统级 `/etc/nix/nix.conf`），加入：

```conf
experimental-features = nix-command flakes
```

验证：

```bash
nix --version
nix flake --help
```

如果正常，就进入现代 Nix 世界了。

---

## 四、Nix 语言速成

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

---

## 五、现代 Nix 的核心结构

现代 Nix 基本围绕 `flake.nix` 展开，这是项目入口。

| 技术   | 文件         |
| ------ | ------------ |
| Node   | package.json |
| Rust   | Cargo.toml   |
| Docker | Dockerfile   |
| Nix    | flake.nix    |

**Flake** 是一个包含 `flake.nix` 文件的目录。它解决了 Nix 过去最大的痛点：**版本锁定**。

一个 `flake.nix` 主要由两部分组成：

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

---

## 六、核心指令：再见 nix-env，你好 nix profile

现代指令统一以 `nix <subcommand>` 开头，逻辑极其清晰。

### 常用命令对比表

| 旧指令 (Legacy)       | 现代指令 (Flakes/Command)             | 作用                             |
| --------------------- | ------------------------------------- | -------------------------------- |
| `nix-shell -p pkg`    | **`nix shell nixpkgs#pkg`**           | 临时进入包含该包的环境           |
| `nix-env -iA pkg`     | **`nix profile install nixpkgs#pkg`** | 像传统包管理器一样安装包         |
| `nix-build`           | **`nix build`**                       | 构建当前目录的 Flake             |
| `nix-shell`           | **`nix develop`**                     | 进入开发环境（读取 `devShells`） |
| `nix-collect-garbage` | **`nix store gc`**                    | 清理没用的文件（垃圾回收）       |

### 1. 临时环境：`nix shell`

想试用某个软件而不想污染系统？

```bash
nix shell nixpkgs#nodejs
# 等价："给我一个带 node 的 shell"。
# 退出即消失，nodejs 不会留在你的 PATH 里
```

这是替代 `brew install`、`apt install`、`sdkman` 的神器。

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

---

## 七、先学最重要的：devShell

这是你最先应该掌握的。因为：

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

---

## 八、system 是什么

你必须理解：

```nix
system = "aarch64-darwin";
```

因为 Nix 所有包都按平台区分。

| 平台              | 值             |
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

这是现代标准写法。

---

## 九、packages 与 apps

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

---

## 十、现代 Nix 工作流

你以后会这样工作：

```txt
git clone
↓
nix develop
↓
开始开发
```

结束。不再需要：安装 SDK、配环境变量、文档写“请安装 xxx”、版本不一致。这就是 Nix 的真正革命性。

---

## 十一、lock 文件与升级依赖

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

---

## 十二、理解 nixpkgs

这是全世界最大的包仓库之一。去 [search.nixos.org](https://search.nixos.org/packages) 搜索你需要的软件（记得切换到 "Flakes" 选项卡）。

你会频繁使用：

```nix
pkgs.nodejs
pkgs.jdk21
pkgs.gradle
pkgs.docker
```

命令行搜索：

```bash
nix search nixpkgs jdk
```

---

## 十三、Java 21 开发环境（推荐模板）

```nix
{
  description = "java21";

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
              pkgs.jdk21
              pkgs.gradle
              pkgs.jetbrains.idea-community
            ];

            shellHook = ''
              export JAVA_HOME=${pkgs.jdk21}
            '';
          };
      });
}
```

进入：

```bash
nix develop
```

---

## 十四、direnv（强烈推荐，体验质变点）

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

---

## 十五、nix profile（现代安装方式）

现代用户级安装：

```bash
nix profile install nixpkgs#nodejs
nix profile list
nix profile remove 0
```

但注意：**真正推荐的是 devShell，而不是 profile**。因为 profile 会污染全局。

---

## 十六、理解 /nix/store

所有东西都在 `/nix/store` 下，例如 `/nix/store/xxxxx-openjdk-21`。

特点：

- 不覆盖
- 不共享 mutable 状态
- 不依赖系统目录

所以：**不会出现“升级导致全炸”**。

---

## 十七、引用路径的魔法 (Flake Refs)

现代 Nix 允许你直接引用 GitHub 上的配置，而无需下载：

- 运行远程 Flake 里的包：`nix run github:edolstra/dwarffs`
- 使用特定的分支：`nix shell github:NixOS/nixpkgs/nixos-23.11#htop`

---

## 十八、进阶：管理系统或用户环境

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

---

## 十九、为什么 Nix 很强

因为它解决的是：

1. **环境漂移**：“你电脑能跑我电脑不能跑”。
2. **不可复现**：半年后项目跑不起来。
3. **多版本冲突**：Java17/21、Node18/22 同时存在。
4. **CI 不一致**：本地和 GitHub Actions 不同。

---

## 二十、学习路径建议

掌握顺序：

### 第一阶段（必须）

专注：flakes、nix develop、mkShell、packages、nixpkgs。这是核心中的核心。

### 第二阶段（开始高级）

学习：overlays、modules、home-manager、devenv.sh、nix-darwin / NixOS。

### 第三阶段（真正深入）

学习：derivation、stdenv、callPackage、overrideAttrs、fixed-output derivation。

当你习惯了 Nix 的逻辑，再考虑通过 Home Manager 管理你的整个点文件（Dotfiles）。

---

## 二十一、你应该避免的坑

### 1. 不要学旧版教程

避免 `nix-env`，避免 `shell.nix`、`default.nix`，除非维护旧项目。

### 2. 不要一开始研究语言理论

很多 Nix 教程会变成 λ 演算、lazy evaluation、functional purity，新人会直接迷失。你应该先会“用”。

### 3. 不要把 Nix 当 Docker 替代品

它们解决不同问题。最强组合是：`Nix + Docker`。

### 4. 忘记 `NIX_PATH`

在 Flake 模式下，一切依赖都应该写在 `inputs` 里，不要依赖系统变量。

### 5. Git 是必须的

**重要！** Flake 会忽略任何未被 Git 追踪 (`git add`) 的文件。如果你新建了一个 `.nix` 文件却发现 Nix 报错找不到它，请先 `git add`。

---

## 二十二、一个现代项目推荐结构

```txt
project/
├── flake.nix
├── flake.lock
├── .envrc
├── src/
└── README.md
```

---

## 二十三、你现在最该做的事

不要继续读理论。直接做这三件事：

1. **给一个 Java 项目写 flake**：目标 `nix develop` 后直接能开发。
2. **给一个 Node 项目写 flake**：体验 node、pnpm、typescript 自动进入环境。
3. **配 direnv**：这是体验质变点。

---

## 二十四、最后一句真正重要的话

> **底层逻辑：** 现代 Nix 就像是软件包管理界的 Git。`flake.nix` 是你的代码，`flake.lock` 是你的 Commit ID，而 `/nix/store` 是你的仓库，`nix build/run` 则是你的 CI/CD。

Nix 最大价值不是“安装包”，而是：

> “把开发环境变成代码”。

一旦你真正适应 `git clone` → `nix develop` 这个工作流，你会很难再回到：手动装 SDK、配 PATH、wiki 写环境文档、brew 冲突、版本不一致的世界。
