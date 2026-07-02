# Nix（只讲新体系：`nix-command` + `flakes`）全面教程

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

---

# 一、先建立正确认知

很多教程一开始就讲：

- derivation
- lazy evaluation
- purity
- store
- overlays

这会把新人直接劝退。

正确顺序应该是：

1. flakes 是项目入口
2. nix develop 是开发环境
3. nix run 是运行
4. nix build 是构建
5. packages/devShells/apps 是标准输出
6. nixpkgs 是软件仓库
7. module system 是高级层

你作为前端转后端的人，建议：

> 先把它当成“声明式 pnpm + Docker + CI + SDK manager + Homebrew”的统一体。

这是最容易理解的。

---

# 二、安装 Nix（必须开启 flakes）

官方：

```bash
sh <(curl -L https://nixos.org/nix/install) --daemon
```

然后启用现代命令：

编辑：

```bash
~/.config/nix/nix.conf
```

加入：

```conf
experimental-features = nix-command flakes
```

验证：

```bash
nix --version
```

然后：

```bash
nix flake --help
```

如果正常，就进入现代 Nix 世界了。

---

# 三、现代 Nix 的核心结构

现代 Nix 基本围绕：

```txt
flake.nix
```

展开。

这是项目入口。

类似：

| 技术   | 文件         |
| ------ | ------------ |
| Node   | package.json |
| Rust   | Cargo.toml   |
| Docker | Dockerfile   |
| Nix    | flake.nix    |

---

# 四、最小 flake

创建：

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

这里：

---

## 1. description

纯描述。

---

## 2. inputs

依赖。

类似：

```json
dependencies
```

但这里依赖的是：

- nixpkgs
- 其他 flakes
- github 仓库
- 本地目录

例如：

```nix
inputs = {
  nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
};
```

意思：

> 使用 nixpkgs 的 unstable 分支。

---

## 3. outputs

最重要。

你定义：

- package
- dev shell
- app
- formatter
- system config

全部从这里导出。

---

# 五、先学最重要的：devShell

这是你最先应该掌握的。

因为：

> 90% 人使用 Nix 的真正价值，是开发环境可复现。

---

# 六、创建开发环境

创建：

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

---

进入环境：

```bash
nix develop
```

然后：

```bash
java -version
mvn -version
```

退出：

```bash
exit
```

你会发现：

> 机器没装 Java，但环境里有 Java。

这就是 Nix 的核心魅力。

---

# 七、system 是什么

你必须理解：

```nix
system = "aarch64-darwin";
```

因为 Nix 所有包都按平台区分。

常见：

| 平台              | 值             |
| ----------------- | -------------- |
| Apple Silicon Mac | aarch64-darwin |
| Intel Mac         | x86_64-darwin  |
| Linux x64         | x86_64-linux   |

---

# 八、不要手写 system（正确写法）

现代 flake 通常用：

```nix
flake-utils
```

---

## 引入 flake-utils

```nix
inputs.flake-utils.url = "github:numtide/flake-utils";
```

然后：

```nix
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
```

这会自动支持：

- macOS
- Linux
- x64
- arm64

这是现代标准写法。

---

# 九、nix develop

这是日常使用最多的命令。

进入 shell：

```bash
nix develop
```

临时运行：

```bash
nix develop --command bash
```

运行命令：

```bash
nix develop --command mvn test
```

---

# 十、nix shell（临时环境）

临时安装：

```bash
nix shell nixpkgs#nodejs
```

等价：

> “给我一个带 node 的 shell”。

退出即消失。

这是替代：

- brew install
- apt install
- sdkman

的神器。

---

# 十一、nix run

直接运行程序：

```bash
nix run nixpkgs#cowsay
```

或者：

```bash
nix run github:sharkdp/bat
```

不用安装。

---

# 十二、packages

你可以导出自己的构建结果。

---

## 示例

```nix
packages.${system}.hello =
  pkgs.writeShellScriptBin "hello" ''
    echo hello
  '';
```

构建：

```bash
nix build .#hello
```

运行：

```bash
./result/bin/hello
```

---

# 十三、apps

让 `nix run` 能运行你的项目。

```nix
apps.${system}.default = {
  type = "app";
  program = "${self.packages.${system}.hello}/bin/hello";
};
```

然后：

```bash
nix run
```

---

# 十四、现代 Nix 工作流

你以后会这样工作：

```txt
git clone
↓
nix develop
↓
开始开发
```

结束。

不再需要：

- 安装 SDK
- 配环境变量
- 文档写“请安装 xxx”
- 版本不一致

这就是 Nix 的真正革命性。

---

# 十五、lock 文件

第一次运行：

```bash
nix develop
```

会生成：

```txt
flake.lock
```

这类似：

- package-lock.json
- pnpm-lock.yaml

它锁定：

- nixpkgs 版本
- 所有依赖

保证可复现。

---

# 十六、升级依赖

更新：

```bash
nix flake update
```

更新单个：

```bash
nix flake lock --update-input nixpkgs
```

---

# 十七、理解 nixpkgs

这是全世界最大的包仓库之一。

你会频繁：

```nix
pkgs.nodejs
pkgs.jdk21
pkgs.gradle
pkgs.docker
```

搜索：

```bash
nix search nixpkgs jdk
```

---

# 十八、Java 21 开发环境（推荐模板）

这是适合你的。

---

## Java + Gradle

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

# 十九、direnv（强烈推荐）

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

离开目录自动退出。

体验会直接提升一个量级。

---

# 二十、nix profile（现代安装方式）

现代用户级安装：

```bash
nix profile install nixpkgs#nodejs
```

查看：

```bash
nix profile list
```

卸载：

```bash
nix profile remove 0
```

但注意：

> 真正推荐的是 devShell，而不是 profile。

因为 profile 会污染全局。

---

# 二十一、理解 store

所有东西都在：

```txt
/nix/store
```

例如：

```txt
/nix/store/xxxxx-openjdk-21
```

特点：

- 不覆盖
- 不共享 mutable 状态
- 不依赖系统目录

所以：

> 不会出现“升级导致全炸”。

---

# 二十二、为什么 Nix 很强

因为它解决的是：

## 1. 环境漂移

“你电脑能跑我电脑不能跑”。

---

## 2. 不可复现

半年后项目跑不起来。

---

## 3. 多版本冲突

Java17/21
Node18/22

同时存在。

---

## 4. CI 不一致

本地和 GitHub Actions 不同。

---

# 二十三、未来学习路线

掌握顺序：

---

## 第一阶段（必须）

你现在应该专注：

- flakes
- nix develop
- mkShell
- packages
- nixpkgs

这是核心中的核心。

---

## 第二阶段（开始高级）

学习：

- overlays
- modules
- home-manager
- devenv.sh
- nix-darwin / NixOS

---

## 第三阶段（真正深入）

学习：

- derivation
- stdenv
- callPackage
- overrideAttrs
- fixed-output derivation

---

# 二十四、你应该避免的坑

---

## 1. 不要学旧版教程

避免：

```bash
nix-env
```

避免：

```nix
shell.nix
default.nix
```

除非维护旧项目。

---

## 2. 不要一开始研究语言理论

很多 Nix 教程会变成：

- λ 演算
- lazy evaluation
- functional purity

新人会直接迷失。

你应该先会“用”。

---

## 3. 不要把 Nix 当 Docker 替代品

它们解决不同问题。

最强组合是：

```txt
Nix + Docker
```

---

# 二十五、一个现代项目推荐结构

```txt
project/
├── flake.nix
├── flake.lock
├── .envrc
├── src/
└── README.md
```

---

# 二十六、你现在最该做的事

不要继续读理论。

直接做这三件事：

---

## 1. 给一个 Java 项目写 flake

目标：

```bash
nix develop
```

后直接能开发。

---

## 2. 给一个 Node 项目写 flake

体验：

- node
- pnpm
- typescript

自动进入环境。

---

## 3. 配 direnv

这是体验质变点。

---

# 二十七、最后给你一句真正重要的话

Nix 最大价值不是“安装包”。

而是：

> “把开发环境变成代码”。

一旦你真正适应：

```txt
git clone
nix develop
```

这个工作流，

你会很难再回到：

- 手动装 SDK
- 配 PATH
- wiki 写环境文档
- brew 冲突
- 版本不一致

的世界。
