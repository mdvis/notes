# Nix & NixOS 全面指南

本文档整合了 Nix 语言基础、NixOS 系统安装配置、以及现代 Nix Flakes 的详细指南，旨在提供一份从入门到进阶的完整参考。

## 目录
1. [简介与核心概念](#1-简介与核心概念)
2. [Nix 语言详解](#2-nix-语言详解)
3. [NixOS 命令行安装实战](#3-nixos-命令行安装实战-国内优化版)
4. [现代 Nix 命令体系](#4-现代-nix-命令体系)
5. [Flakes：现代项目管理](#5-flakes-现代项目管理)
6. [Home Manager 入门](#6-home-manager-入门)
7. [最佳实践与学习资源](#7-最佳实践与学习资源)

---

## 1. 简介与核心概念

### Nix 与 NixOS
*   **Nix**: 一个革命性的包管理器和构建系统，采用声明式、可复现的方法管理配置和软件。
*   **NixOS**: 基于 Nix 的 Linux 发行版，将"声明式配置"和"不可变基础设施"的理念融入了操作系统设计。
    *   **传统 Linux**: 命令式 (运行 `apt install`，修改 `/etc` 文件)，容易导致"环境漂移"。
    *   **NixOS**: 声明式 (编写 `configuration.nix`，运行 `nixos-rebuild`)，确保系统状态严格符合配置文件。

### 核心概念一句话总结
1.  **Nix Store (`/nix/store`)**: 所有包和构建产物存储的不可变目录，每个路径以内容哈希命名。
2.  **纯函数式部署**: 包构建被视为纯函数，相同输入始终产生相同输出。
3.  **可重现性 (Reproducibility)**: 确保在任何机器上都能产生 bit-for-bit 相同的构建结果。
4.  **Derivation (派生)**: 描述如何构建输出路径的最小原子单位。
5.  **世代 (Generations) 与回滚**: 每次变更生成新世代，支持原子回滚。
6.  **声明式配置**: 通过 Nix 文件描述系统最终状态。

---

## 2. Nix 语言详解

Nix 语言是 Nix 生态的核心，用于编写配置文件和包定义。它是一种**惰性求值**的**纯函数式**语言。

### 2.1 基础语法与类型

*   **注释**: 使用 `#`。
*   **基本类型**:
    *   字符串: `"string"` (支持插值 `${var}`)
    *   多行字符串: `'' ... ''`
    *   数字: `1`, `3.14`
    *   布尔: `true`, `false`
    *   空值: `null`
    *   路径: `./foo.txt` (不能以 `/` 结尾，绝对路径以 `/` 开头)
    *   检索路径: `<nixpkgs>` (尖括号语法，通过 `NIX_PATH` 查找)

### 2.2 列表与属性集

**列表 (`[]`)**:
*   空格分隔: `[ 1 2 "three" ]`
*   拼接: `++`

**属性集 (`{}`)**:
*   键值对，末尾必须加 `;`。
*   **递归属性集 (`rec {}`)**: 允许属性相互引用。
    ```nix
    rec {
      a = 1;
      b = a + 1; # b = 2
    }
    ```
*   **访问**: `set.attr` 或 `set.${var}`。

### 2.3 关键表达式

**`let ... in`**: 定义局部变量
```nix
let
  a = 1;
  b = 2;
in
  a + b
```

**`with`**: 将属性集引入当前作用域
```nix
with pkgs; [ git vim ] # 等同于 [ pkgs.git pkgs.vim ]
```

**`inherit`**: 继承变量
```nix
let a = 1; in { inherit a; } # 等同于 { a = a; }
```

### 2.4 函数
Nix 函数是匿名的，默认单参数。

*   **定义**: `参数: 函数体` -> `x: x + 1`
*   **调用**: `f arg` (空格分隔)
*   **多参数 (柯里化)**: `x: y: x + y` -> 调用 `(f 1) 2`
*   **属性集参数 (模式匹配)**:
    ```nix
    { x, y, ... }: x + y  # ... 允许传入多余参数而不报错
    { a, b } @ args: a + b + args.c # @ 捕获完整集合
    ```
*   **默认值**: `{ x ? 1 }: x`

### 2.5 控制结构
*   **条件判断**:
    ```nix
    if a > b then "a is greater" else "b is greater"
    ```
*   **循环**: Nix 没有 `for/while` 循环，通常使用递归函数或 `map` 等高阶函数处理列表。

### 2.6 模块系统 (Modules)
NixOS 配置的基础结构：
```nix
{ config, pkgs, ... }:
{
  imports = [ ./hardware-configuration.nix ]; # 导入其他模块
  
  options = { ... }; # 定义选项 (供其他模块使用)
  
  config = { ... };  # 设置选项 (实现具体配置)
}
```

---

## 3. NixOS 命令行安装实战 (国内优化版)

推荐使用命令行安装以配置国内镜像源，解决下载慢的问题。

### 3.1 准备与分区
1.  **LiveCD 网络优化**:
    ```bash
    sudo -i
    
    nixos-install --option substituters "https://mirrors.tuna.tsinghua.edu.cn/nix-channels/store"
    ```
2.  **分区 (UEFI + GPT)**:
```
parted /dev/sda -- mklabel gpt
parted /dev/sda -- mkpart primary fat32 512MiB 100%
parted /dev/sda -- mkpart ESP fat32 1MiB 512MiB
parted /dev/sda -- set 2 esp on

mkfs.fat -F 32 -n boot /dev/sda2
mkfa.ext4 -L nixos /dev/sda1

mount /dev/sda1 /mnt
mkdir -p /mnt/boot
mount /dev/sda2 /mnt/boot

# 生成配置
nixos-generate-config --root /mnt
```

### 3.2 配置文件 (`configuration.nix`)
编辑 `/mnt/etc/nixos/configuration.nix`，关键是添加国内源：

```nix
{ config, pkgs, ... }: {
  imports = [ ./hardware-configuration.nix ];

  boot.loader.systemd-boot.enable = true;
  boot.loader.efi.canTouchEfiVariables = true;
  
  networking.hostName = "nixos";
  networking.networkmanager.enable = true;
  
  # --- 关键：国内镜像源 ---
  nix.settings = {
    substituters = [
      "https://mirrors.tuna.tsinghua.edu.cn/nix-channels/store"
      "https://cache.nixos.org"
    ];
    trusted-public-keys = [
      "mirrors.tuna.tsinghua.edu.cn-1:9y0vJ0Dg4+9oZ5g0hFJqf9N7k1E+P4p8p6b8zL2yY="
      "cache.nixos.org-1:6NCHdD59X431o0gWypbMrAURkbJ16ZPMQFGspcDShjY="
    ];
    experimental-features = [ "nix-command" "flakes" ]; # 开启 Flakes
  };

  users.users.yourname = {
    isNormalUser = true;
    extraGroups = [ "wheel" "networkmanager" ];
    initialPassword = "password123";
  };

  environment.systemPackages = with pkgs; [ vim git wget ];
  system.stateVersion = "24.11"; # 不要修改此版本号
}
```

### 3.3 安装与收尾
```bash
nixos-install --verbose
reboot
```
重启后建议修改密码 (`passwd`) 并执行垃圾回收 (`nix-collect-garbage -d`)。

---

## 4. 现代 Nix 命令体系

请遗弃 `nix-env`，拥抱新的 CLI (需开启 `nix-command` 特性)。

| 任务 | 旧命令 | 现代命令 | 说明 |
| :--- | :--- | :--- | :--- |
| **临时运行** | `nix-shell -p` | `nix run nixpkgs#hello` | 下载并运行，不安装 |
| **开发环境** | `nix-shell` | `nix develop` | 进入 Flake 定义的 Shell |
| **安装工具** | `nix-env -i` | `nix profile install` | 安装到用户环境 |
| **构建** | `nix-build` | `nix build` | 构建当前目录的 Flake |
| **交互式** | `nix repl` | `nix repl` | 交互式环境 |

---

## 5. Flakes：现代项目管理

Flake 是 Nix 的现代标准，用于解决可重现性问题。它通过 `flake.nix` 和 `flake.lock` 锁定所有依赖。

### 5.1 核心结构 (`flake.nix`)

```nix
{
  description = "项目描述";

  # Inputs: 定义依赖来源
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    # 国内加速示例
    # nixpkgs.url = "git+https://mirrors.tuna.tsinghua.edu.cn/git/nixpkgs.git?ref=nixos-unstable&shallow=1";
  };

  # Outputs: 定义构建产物
  outputs = { self, nixpkgs, ... }@inputs: 
  let
    system = "x86_64-linux";
    pkgs = nixpkgs.legacyPackages.${system};
  in {
    # 1. 软件包
    packages.${system}.default = pkgs.hello;
    
    # 2. 开发环境 (nix develop)
    devShells.${system}.default = pkgs.mkShell {
      buildInputs = [ pkgs.go pkgs.nodejs ];
    };

    # 3. NixOS 系统配置 (nixos-rebuild)
    nixosConfigurations.myhost = nixpkgs.lib.nixosSystem {
      inherit system;
      modules = [ ./configuration.nix ];
    };
  };
}
```

### 5.2 Outputs 四大分类

1.  **核心业务类**: `packages` (软件包), `legacyPackages` (海量包集), `overlays` (扩展).
2.  **环境与运行类**: `apps` (可运行程序), `devShells` (开发环境).
3.  **系统集成类**: `nixosConfigurations` (系统配置), `nixosModules` (复用模块).
4.  **工程辅助类**: `checks` (测试), `formatter` (格式化), `templates` (模板).

### 5.3 常用操作
*   **初始化**: `nix flake init -t templates#full`
*   **查看详情**: `nix flake show`
*   **更新锁文件**: `nix flake update`
*   **系统重建**: `nixos-rebuild switch --flake .#myhost` (优先读取 `flake.nix`)

---

## 6. Home Manager 入门

Home Manager 用于管理用户级配置 (Dotfiles, Shell, Git 等)。

**在 NixOS 中集成 (作为模块):**
```nix
{ config, pkgs, ... }:
let
  hm = builtins.fetchTarball "https://github.com/nix-community/home-manager/archive/release-24.11.tar.gz";
in
{
  imports = [ (import "${hm}/nixos") ];

  home-manager.users.yourname = { pkgs, ... }: {
    home.stateVersion = "24.11";
    home.packages = [ pkgs.ripgrep pkgs.htop ];
    programs.git = {
      enable = true;
      userName = "Me";
      userEmail = "me@example.com";
    };
  };
}
```

---

## 7. 最佳实践与学习资源

### 最佳实践
1.  **拥抱 Flakes**: 总是使用 Flakes 锁定依赖版本，确保可重现性。
2.  **模块化**: 将 `configuration.nix` 拆分为多个功能模块，保持配置整洁。
3.  **声明式优先**: 避免使用 `nix-env` 或 `nix profile` 进行命令式安装，尽量写入配置文件。
4.  **版本控制**: 将 `/etc/nixos` (或你的配置目录) 纳入 Git 管理。
5.  **定期清理**: 使用 `nix-collect-garbage -d` 清理旧世代，释放磁盘空间。

### 学习资源
*   **搜索包/选项**: [search.nixos.org](https://search.nixos.org/) (必备)
*   **Wiki**: [nixos.wiki](https://nixos.wiki/)
*   **清华镜像站**: [mirrors.tuna.tsinghua.edu.cn/help/nix/](https://mirrors.tuna.tsinghua.edu.cn/help/nix/)
