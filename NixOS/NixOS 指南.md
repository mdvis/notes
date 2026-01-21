## 目录
1. [Nix 与 NixOS 简介](#1-nix-与-nixos-简介)
2. [核心概念](#2-核心概念)
3. [NixOS 命令行安装实战 (国内优化版)](#3-nixos-命令行安装实战-国内优化版)
4. [安装后的首次配置](#4-安装后的首次配置)
5. [现代 Nix 命令体系](#5-现代-nix-命令体系)
6. [Nix 语言基础](#6-nix-语言基础)
7. [Flakes 详解与开发环境](#7-flakes-详解与开发环境)
8. [Home Manager 入门](#8-home-manager-入门)
9. [最佳实践](#9-最佳实践)
10. [学习资源](#10-学习资源)

---
### Nix 核心概念一句话总结

1. **Nix Store（/nix/store）**  
   Nix Store 是所有包和构建产物存储的不可变目录，每个路径以内容哈希命名，确保内容唯一且不可修改。

2. **纯函数式部署模型（Purely Functional Deployment）**  
   Nix 将包构建视为纯函数，相同输入始终产生相同输出，消除依赖冲突并允许多版本并存。

3. **可重现性（Reproducibility）**  
   Nix 确保相同 Nix 表达式在任何时间、任何机器上都能产生 bit-for-bit 相同的构建结果。

4. **Derivation（派生）**  
   Derivation 是 Nix 中描述如何从输入构建出固定输出路径的最小原子单位。

5. **Nix 表达式语言**  
   Nix 表达式语言是一种懒求值的纯函数式语言，用于声明式地定义包和系统配置。

6. **声明式配置（Declarative Configuration）**  
   Nix（尤其是 NixOS）通过纯声明式 Nix 文件描述系统最终状态，由工具自动实现并原子切换。

7. **世代（Generations）和回滚**  
   每次配置变更都会生成一个新世代，支持在启动菜单中选择并轻松回滚到任意历史状态。

8. **垃圾回收（Garbage Collection）**  
   Nix 只保留被当前世代、profile 或运行进程引用的 Store 路径，未引用路径可安全删除。

9. **Channels 和 Nixpkgs**  
   Nixpkgs 是 Nix 生态的巨型软件仓库，Channels 是其按分支发布的可订阅快照，用于同步包集合。

10. **Profiles 和用户环境**  
    每个用户拥有独立的 profile，用于管理个人安装的包集合，而不影响系统或其他用户。
## 1. Nix 与 NixOS 简介

Nix 是一个革命性的包管理器和构建系统，采用声明式、可复现的方法管理配置和软件。NixOS 是基于 Nix 的 Linux 发行版，它将"声明式配置"和"不可变基础设施"的理念融入了操作系统设计。

*   **传统 Linux**: 命令式 (运行 `apt install`，修改 `/etc` 文件)。容易导致"环境漂移"。
*   **NixOS**: 声明式 (编写 `configuration.nix`，运行 `nixos-rebuild`)。确保系统状态严格符合配置文件。

---

## 2. 核心概念

### 2.1 不可变性与 Store
所有包都存储在 `/nix/store` 下的唯一哈希路径中（例如 `/nix/store/b6gv...-python-3.9`）。一旦构建完成，包就是不可变的。这允许同一软件的多个版本共存，且互不干扰。

### 2.2 声明式配置
通过配置文件描述期望的系统状态。如果配置文件中没有列出某个包，该包就不应该存在于系统环境中（除非是临时运行）。

### 2.3 Flakes (薄片)
现代 Nix 的项目结构标准，用于锁定依赖版本（类似 `lock` 文件），确保"在我这也由用"变成"在任何地方都可用"。

---

## 3. NixOS 命令行安装实战 (国内优化版)

图形化安装程序在国内网络环境下常因下载超时卡在 46%。**推荐使用命令行安装**，配合国内镜像源，快速且稳定。

### 3.1 准备工作：LiveCD 环境配置

启动进入 NixOS LiveCD 后，首先进行网络优化。

1.  **切换到 Root**:
    ```bash
    sudo -i
    ```
2.  **配置 Live 环境的镜像源** (解决安装时下载慢的问题):
    ```ini
    nixos-install --option substituters "tsinghua"
    ```
### 3.2 磁盘分区 (UEFI + GPT)

假设目标磁盘为 `/dev/sda` (请先用 `lsblk` 确认)。

**方案 A: 标准 EXT4 分区 (推荐新手)**

```bash
# 1. 创建分区表
parted /dev/sda -- mklabel gpt

# 2. 创建 EFI 分区 (512MB)
parted /dev/sda -- mkpart ESP fat32 1MiB 512MiB
parted /dev/sda -- set 1 esp on

# 3. 创建根分区 (剩余空间)
parted /dev/sda -- mkpart primary 512MiB 100%

# 4. 格式化
mkfs.fat -F 32 -n BOOT /dev/sda1
mkfs.ext4 -L nixos /dev/sda2

# 5. 挂载
mount /dev/sda2 /mnt
mkdir -p /mnt/boot
mount /dev/sda1 /mnt/boot
```

**方案 B: Btrfs 分区 (进阶)**

```bash
mkfs.btrfs -L nixos -f /dev/sda2
mount /dev/sda2 /mnt
btrfs subvolume create /mnt/@
btrfs subvolume create /mnt/@home
umount /mnt
mount -o subvol=@,compress=zstd /dev/sda2 /mnt
mkdir -p /mnt/home
mount -o subvol=@home,compress=zstd /dev/sda2 /mnt/home
# 别忘了挂载 EFI
mkdir -p /mnt/boot
mount /dev/sda1 /mnt/boot
```

### 3.3 生成并修改系统配置 (关键步骤)

1.  **生成基础配置**:
    ```bash
    nixos-generate-config --root /mnt
    ```

2.  **编辑配置文件**:
    这是安装成败的关键。必须将国内源写入新系统的配置中。
    ```bash
    nano /mnt/etc/nixos/configuration.nix
    ```

    在 `{ config, pkgs, ... }: { ... }` 块中，添加/修改以下内容：

    ```nix
    { config, pkgs, ... }: {
      imports = [ ./hardware-configuration.nix ];

      # --- 1. 引导程序 (UEFI) ---
      boot.loader.systemd-boot.enable = true;
      boot.loader.efi.canTouchEfiVariables = true;

      # --- 2. 网络与本地化 ---
      networking.hostName = "nixos";
      networking.networkmanager.enable = true;
      time.timeZone = "Asia/Shanghai";
      i18n.defaultLocale = "en_US.UTF-8"; # 推荐系统语言保持英文，避免终端乱码

      # --- 3. 关键：国内镜像源配置 ---
      nix.settings = {
        substituters = [
          "https://mirrors.tuna.tsinghua.edu.cn/nix-channels/store"
          "https://mirrors.ustc.edu.cn/nix-channels/store"
          "https://cache.nixos.org"
        ];
        trusted-public-keys = [
          "mirrors.tuna.tsinghua.edu.cn-1:9y0vJ0Dg4+9oZ5g0hFJqf9N7k1E+P4p8p6b8zL2yY="
          "cache.nixos.org-1:6NCHdD59X431o0gWypbMrAURkbJ16ZPMQFGspcDShjY="
        ];
        experimental-features = [ "nix-command" "flakes" ]; # 开启 Flakes
      };

      # --- 4. 用户配置 ---
      users.users.yourname = {
        isNormalUser = true;
        extraGroups = [ "wheel" "networkmanager" ]; # wheel 允许 sudo
        initialPassword = "password123"; # 登录后请立即修改
      };

      # --- 5. 常用软件 ---
      environment.systemPackages = with pkgs; [
        vim
        git
        wget
        curl
      ];

      # 开启 SSH (可选)
      services.openssh.enable = true;

      system.stateVersion = "24.11"; # 保持生成时的版本号，不要手动修改
    }
    ```

### 3.4 执行安装

由于配置了国内源，这一步通常很快。

```bash
nixos-install --verbose
```
*   `--verbose` 允许你看到详细的下载进度，包括每个 `.narinfo` 的下载情况。
*   如果遇到网络中断报错（如 `error: unexpected end of file`），直接重新运行该命令即可断点续传。

安装完成后：
```bash
reboot
```

---

## 4. 安装后的首次配置

重启并登录系统后，建议进行以下操作：

1.  **修改密码**:
    ```bash
    passwd
    ```

2.  **切换到 Unstable 通道 (可选，适合开发者)**:
    ```bash
    sudo nix-channel --add https://mirrors.tuna.tsinghua.edu.cn/nix-channels/nixos-unstable nixos
    sudo nix-channel --update
    sudo nixos-rebuild switch --upgrade
    ```

3.  **清理旧版本 (Garbage Collection)**:
    NixOS 每次构建都会保留旧版本以便回滚。定期清理可以释放空间。
    ```bash
    # 删除旧的一代配置
    sudo nix-collect-garbage -d
    ```

---

## 5. 现代 Nix 命令体系

请遗弃 `nix-env`，拥抱新的 CLI。需要开启 `experimental-features = nix-command flakes`。

| 任务 | 现代命令 | 说明 |
| :--- | :--- | :--- |
| **临时运行** | `nix run nixpkgs#hello` | 下载并运行，不安装到 PATH |
| **临时 Shell** | `nix shell nixpkgs#python3` | 进入包含该工具的 Shell |
| **搜索包** | `nix search nixpkgs ripgrep` | 搜索包名 |
| **安装工具** | `nix profile install nixpkgs#git` | 安装到用户环境 (类似 brew) |
| **开发环境** | `nix develop` | 根据当前目录 `flake.nix` 进入环境 |

---

## 6. Nix 语言基础

Nix 语言是 Nix 生态系统的核心，掌握其基础语法对于编写配置文件至关重要。

### 6.1 属性集 (Attribute Sets)
Nix 的配置本质上就是一个巨大的 JSON+函数。
```nix
{
  # 这里的 key 不需要引号（除非有特殊字符）
  name = "Nix";
  count = 10;
  # 嵌套结构
  nested = {
    isTrue = true;
  };
}
```

### 6.2 列表 (Lists)
```nix
[ "item1" "item2" "item3" ]
```

### 6.3 Let…In 表达式
用于在 `in` 之后的代码块中使用定义的变量。
```nix
let
  user = "nixuser";
  pkgs = import <nixpkgs> {};
in
{
  # 只有在这里面才能使用 user 变量
  home.username = user;
}
```

### 6.4 With 表达式
为了避免反复写 `pkgs.xxx`，我们用 `with`。
```nix
let
  pkgs = { git = "git-pkg"; vim = "vim-pkg"; };
in
with pkgs; [ git vim ] # 等同于 [ pkgs.git pkgs.vim ]
```

### 6.5 函数 (Functions)
Nix 函数是匿名的，且只带一个参数。多个参数通过嵌套实现。
```nix
# 定义：参数 : 返回值
double = x: x * 2;
# 调用：函数名 空格 参数
# double 5 => 结果是 10

# 带多个参数的函数（柯里化）
add = a: b: a + b;
# add 1 2 => 结果是 3
```

### 6.6 模式匹配 (Pattern Matching)
这是在 `flake.nix` 头部最常见的写法，用于解构传入的属性集。
```nix
# 这里的 { pkgs, ... } 表示函数接收一个属性集，
# 我们只取出里面的 pkgs，忽略其他参数（...）
myConfig = { pkgs, ... }: {
  home.packages = [ pkgs.htop ];
};
```

### 6.7 字符串插值 (Interpolation)
使用 `${ }` 将 Nix 变量嵌入字符串。
```nix
let
  name = "Alice";
in
"Hello, ${name}!" # => "Hello, Alice!"
```

---

## 7. Flakes 详解与开发环境

Flakes 是管理项目依赖的最佳实践。

### 7.1 `flake.nix` 模板
在项目根目录创建 `flake.nix`：

```nix
{
  description = "Python 开发环境";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};
    in
    {
      devShells.${system}.default = pkgs.mkShell {
        buildInputs = with pkgs; [
          python311
          poetry
        ];

        shellHook = ''
          echo "Environment ready!"
        '';
      };
    };
}
```

### 7.2 使用
*   进入环境: `nix develop`
*   更新锁定: `nix flake update`

---

## 8. Home Manager 入门

Home Manager 专门用于管理用户级的配置（Dotfiles、Shell 配置、用户软件）。

在 `configuration.nix` 中引入（最简单的方式）：

```nix
{ config, pkgs, ... }:
let
  home-manager = builtins.fetchTarball "https://github.com/nix-community/home-manager/archive/release-24.11.tar.gz";
in
{
  imports = [
    (import "${home-manager}/nixos")
  ];

  home-manager.users.yourname = { pkgs, ... }: {
    home.stateVersion = "24.11";
    home.packages = [ pkgs.htop pkgs.ripgrep ];
    programs.git = {
      enable = true;
      userName = "Me";
      userEmail = "me@example.com";
    };
  };
}
```

---

## 9. 最佳实践

### 9.1 使用 Flakes
*   总是使用 Flakes 来确保依赖版本锁定
*   利用 `flake.lock` 确保复现性

### 9.2 模块化配置
*   将大型配置拆分为多个模块
*   使用 `imports` 组合模块

### 9.3 声明式管理
*   尽可能使用声明式配置而非命令式操作
*   避免手动修改系统文件

### 9.4 版本控制
*   将配置文件纳入版本控制系统 (Git)
*   定期提交更改以便回滚

### 9.5 定期清理
*   定期运行 `nix store gc` 清理未使用的包
*   使用 `nix store optimise` 优化存储空间

---

## 10. 学习资源

*   **NixOS Search**: [search.nixos.org](https://search.nixos.org/) (查询包和配置项)
*   **NixOS Wiki**: [nixos.wiki](https://nixos.wiki/)
*   **Zero to Nix**: [zero-to-nix.com](https://zero-to-nix.com/) (新手友好)
*   **清华大学开源软件镜像站**: [mirrors.tuna.tsinghua.edu.cn/help/nix/](https://mirrors.tuna.tsinghua.edu.cn/help/nix/)