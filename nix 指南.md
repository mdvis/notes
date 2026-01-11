# Nix 指南

## 目录
1. [简介](#简介)
2. [核心概念](#核心概念)
3. [安装与配置](#安装与配置)
4. [现代 Nix 命令](#现代-nix-命令)
5. [Nix 语言基础](#nix-语言基础)
6. [Flakes 详解](#flakes-详解)
7. [开发环境管理](#开发环境管理)
8. [系统配置管理](#系统配置管理)
9. [最佳实践](#最佳实践)
10. [学习资源](#学习资源)

## 简介

Nix 是一个革命性的包管理器和构建系统，它采用声明式、可复现的方法来管理系统配置和软件包。NixOS 是一个基于 Nix 包管理器的 Linux 发行版，它将声明式配置和不可变基础设施理念融入操作系统设计。

Nix 不仅仅是一个包管理器，它更是一个完全可复现的构建系统。与传统的命令式系统管理方式不同，Nix 采用声明式方法，用户只需描述期望的系统状态，Nix 会处理其余部分。

## 核心概念

### 1. 不可变性与 Store
- 所有包都存储在 `/nix/store` 下的唯一哈希路径中（例如 `/nix/store/b6gv...-python-3.9`）
- 这意味着你可以同时安装同一软件的多个不同版本，它们互不干扰
- 一旦构建完成，包就是不可变的，确保可复现性

### 2. 环境隔离
- 每个包都有唯一的哈希标识，防止版本冲突
- 不同项目可以使用不同版本的依赖而不会相互影响

### 3. 声明式配置
- 通过配置文件描述你想要的系统状态，而不是一步步手动安装
- 配置是纯文本，易于版本控制

### 4. Flakes (薄片)
- 现代 Nix 的项目结构标准，用于锁定依赖版本
- 确保"在我这也由用"变成"在任何地方都可用"
- 提供可复现的开发和构建环境

## 安装与配置

### 安装 Nix

在 Linux 或 macOS 上，使用官方脚本安装：

```bash
sh <(curl -L https://nixos.org/nix/install) --daemon
```

### 开启 Flakes (实验性功能)

现代 Nix 命令（如 `nix shell`, `nix build`）需要开启 Flakes。
编辑配置文件（通常在 `~/.config/nix/nix.conf` 或 `/etc/nix/nix.conf`），加入以下内容：

```properties
experimental-features = nix-command flakes
```

保存后可能需要重启 Nix 守护进程或重新登录 Shell。

## 现代 Nix 命令

现代 Nix 使用统一的 `nix <subcommand>` 格式。

### 🔍 搜索包 (Search)

不需要更新本地索引，直接从 Nixpkgs 搜索：

```bash
# 搜索 ripgrep
nix search nixpkgs ripgrep
```

### 🚀 临时运行环境 (Shell & Run)

这是 Nix 最强大的功能之一。你可以使用某个软件，而无需将其安装到系统中。

- **一次性运行 (Run):** 下载并直接执行程序。
```bash
# 直接运行 hello 程序，运行完即"消失"
nix run nixpkgs#hello
```

- **进入临时环境 (Shell):** 打开一个包含该工具的新 Shell。
```bash
# 进入一个包含 python3 和 ffmpeg 的环境
nix shell nixpkgs#python3 nixpkgs#ffmpeg

# 验证（退出 shell 后这些命令将不可用）
python3 --version
```

> **注意：** `#` 后面的名称通常对应 `nix search` 结果中的名称。

### 📦 安装到用户环境 (Profile)

如果你确实想把工具"安装"到你的 PATH 中（类似 `apt` 或 `brew`），使用 `nix profile`。

```bash
# 安装
nix profile install nixpkgs#ripgrep nixpkgs#neovim

# 查看已安装列表
nix profile list

# 卸载 (通过索引号或名称)
nix profile remove <index>
# 或者
nix profile remove nixpkgs#ripgrep
```

### 🏗️ 构建 (Build)

构建软件包并生成结果链接：

```bash
# 构建 hello 程序
nix build nixpkgs#hello

# 查看结果
ls -l result
# 输出: result -> /nix/store/xxxxxx-hello-2.10

# 运行
./result/bin/hello
```

### 🧪 开发环境 (Develop)

进入项目的开发环境：

```bash
# 进入当前项目定义的开发环境
nix develop
```

### 🧹 清理与维护 (Garbage Collection)

Nix 从不删除旧版本，除非你显式要求。这很安全，但会占用磁盘空间。

- **清理不再使用的包：**
```bash
# 删除未被任何 profile 或正在运行的 shell 引用的存储路径
nix store gc
```

- **优化存储 (去重)：**
Nix 可以通过硬链接去重相同的文件，节省空间。
```bash
nix store optimise
```

### 旧版 vs 新版命令对照表

| 动作 | 旧版 (Legacy) | **新版 (Modern/Flakes)** |
| --- | --- | --- |
| 安装包 | `nix-env -iA nixpkgs.git` | `nix profile install nixpkgs#git` |
| 临时 Shell | `nix-shell -p git` | `nix shell nixpkgs#git` |
| 开发环境 | `nix-shell` (使用 `shell.nix`) | `nix develop` (使用 `flake.nix`) |
| 构建 | `nix-build` | `nix build` |
| 更新 | `nix-channel --update` | `nix flake update` (针对项目) |

## Nix 语言基础

Nix 语言是 Nix 生态系统的核心，掌握其基础语法对于编写配置文件至关重要。

### 1. 属性集 (Attribute Sets)
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

### 2. 列表 (Lists)
```nix
[ "item1" "item2" "item3" ]
```

### 3. Let…In 表达式
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

### 4. With 表达式
为了避免反复写 `pkgs.xxx`，我们用 `with`。
```nix
let
  pkgs = { git = "git-pkg"; vim = "vim-pkg"; };
in
with pkgs; [ git vim ] # 等同于 [ pkgs.git pkgs.vim ]
```

### 5. 函数 (Functions)
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

### 6. 模式匹配 (Pattern Matching)
这是在 `flake.nix` 头部最常见的写法，用于解构传入的属性集。
```nix
# 这里的 { pkgs, ... } 表示函数接收一个属性集，
# 我们只取出里面的 pkgs，忽略其他参数（...）
myConfig = { pkgs, ... }: {
  home.packages = [ pkgs.htop ];
};
```

### 7. 字符串插值 (Interpolation)
使用 `${ }` 将 Nix 变量嵌入字符串。
```nix
let
  name = "Alice";
in
"Hello, ${name}!" # => "Hello, Alice!"
```

## Flakes 详解

Flakes 是现代 Nix 的核心，它解决了版本复现性的最后一块拼图。

### flake.nix 结构

一个典型的 `flake.nix` 文件结构如下：

```nix
{
  description = "我的 Python 开发环境";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          # 在这里列出项目需要的工具
          buildInputs = with pkgs; [
            python311
            poetry
            nodejs_20
          ];

          # 启动环境时自动执行的命令
          shellHook = ''
            echo "欢迎进入 Nix 开发环境！"
            echo "Python 版本: $(python --version)"
          '';
        };
        
        packages.default = pkgs.python311.pkgs.buildPythonApplication {
          pname = "mypackage";
          version = "0.1.0";
          src = ./.;
          propagatedBuildInputs = with pkgs.python311.pkgs; [
            flask
            requests
          ];
        };
      });
}
```

### 核心组件

1. **inputs**: 定义项目依赖，如 nixpkgs 或其他 flake
2. **outputs**: 定义 flake 的输出，如包、开发环境、NixOS 配置等
3. **flake.lock**: 锁定文件，确保复现性（类似 package-lock.json）

### 常用命令

```bash
# 更新 flake 输入
nix flake update

# 运行 flake 中定义的包
nix run

# 构建 flake 中定义的包
nix build

# 进入开发环境
nix develop
```

## 开发环境管理

### 创建可复现的开发环境

使用 `flake.nix` 创建可复现的开发环境：

1. 在项目根目录创建 `flake.nix` 文件
2. 定义所需的开发工具和依赖
3. 使用 `nix develop` 进入环境

### Overrides 与 Overlays

Nixpkgs 提供两种主要定制机制：

- **覆盖（Overrides）**: 适用于单包修改
- **叠加（Overlays）**: 适用于跨包依赖调整

官方文档建议：简单场景使用覆盖，复杂定制采用叠加。

```nix
# 使用 overlay 的示例
self: super: {
  hello = super.hello.overrideAttrs (oldAttrs: {
    src = fetchurl {
      url = "https://example.com/hello-modified.tar.gz";
      sha256 = "...";
    };
  });
}
```

## 系统配置管理

### NixOS 配置

NixOS 使用 `configuration.nix` 文件进行系统配置：

```nix
{ config, pkgs, ... }:

{
  imports =
    [ # Include the results of the hardware scan.
      ./hardware-configuration.nix
    ];

  # Bootloader.
  boot.loader.systemd-boot.enable = true;
  boot.loader.efi.canTouchEfiVariables = true;

  networking.hostName = "nixos"; # Define your hostname.
  networking.networkmanager.enable = true;

  # Configure network proxy if necessary
  # networking.proxy.default = "http://proxy.company.com:8080/";
  # networking.proxy.noProxy = "127.0.0.1,localhost,internal.domain";

  # Select internationalisation properties.
  i18n.defaultLocale = "en_US.UTF-8";
  console = {
    font = "Lat2-Terminus16";
    keyMap = "us";
  };

  # Enable the X11 windowing system.
  services.xserver.enable = true;
  services.xserver.layout = "us";
  services.xserver.xkbOptions = "eurosign:e";

  # Enable the GNOME Desktop Environment.
  services.xserver.displayManager.gdm.enable = true;
  services.xserver.desktopManager.gnome.enable = true;

  # Configure keymap in X11
  services.xserver.xkb = {
    layout = "us";
    variant = "";
  };

  # Define a user account. Don't forget to set a password with ‘passwd’.
  users.users.alice = {
    isNormalUser = true;
    description = "Alice Foobar";
    extraGroups = [ "networkmanager" "wheel" ];
  };

  # Install firefox.
  environment.systemPackages = with pkgs; [
    firefox
    wget
  ];

  # Some programs need SUID wrappers, can be configured further or are
  # started in user sessions.
  # programs.mtr.enable = true;
  # programs.gnupg.agent = { enable = true; enableSSHSupport = true; };

  # List services that you want to enable:

  # Enable the OpenSSH daemon.
  services.openssh.enable = true;

  # Open ports in the firewall.
  # networking.firewall.allowedTCPPorts = [ ... ];
  # networking.firewall.allowedUDPPorts = [ ... ];
  # Or disable the firewall altogether.
  # networking.firewall.enable = false;

  # This value determines the NixOS release from which the default
  # settings for stateful data that may be modified by the user are
  # taken. It's perfectly fine and recommended to leave this value at
  # the release version of the first install of this system.
  # Before changing this value read the documentation for this option
  # (e.g. man configuration.nix or on https://nixos.org/nixos/options.html).
  system.stateVersion = "23.11"; # Did you read the comment?
}
```

### Home Manager

Home Manager 允许你使用 Nix 管理用户配置：

```nix
{ config, pkgs, ... }:

{
  # Home Manager needs a bit of information about you and the
  # paths it should manage.
  home.username = "alice";
  home.homeDirectory = "/home/alice";

  # This value determines the Home Manager release that your
  # configuration is compatible with. This helps avoid breakage
  # when a new Home Manager release introduces backwards
  # incompatible changes.
  home.stateVersion = "23.11"; # Please read the comment before changing.

  # The home.packages option allows you to install Nix packages into
  # your environment.
  home.packages = with pkgs; [
    firefox
    thunderbird
    # There are many packages, search for them on
    # https://search.nixos.org/packages
  ];

  # Home Manager is pretty good at managing dotfiles. The primary way
  # to manage plain files is through the home.file option.
  home.file = {
    # This copies the file to ~/.emacs.d/init.el.
    ".emacs.d/init.el".source = ./emacs-config.el;
    # This creates a directory ~/.config/nix with a nix.conf inside.
    ".config/nix".source = ./nix-config;
  };

  # Programs that have dedicated modules in Home Manager can be
  # configured through special options. Here are some examples.

  # Enable the Fish shell.
  programs.fish.enable = true;

  # Enable VIM.
  programs.vim = {
    enable = true;
    plugins = with pkgs.vimPlugins; [
      vim-nix
      gruvbox-vim
    ];
  };

  # Enable Git and configure basic settings.
  programs.git = {
    enable = true;
    userName = "Alice Foobar";
    userEmail = "alice@example.org";
  };

  # Nicely reload system units when changing configs.
  systemd.user.startServices = "sd-switch";

  # Fonts
  fonts.fonts = with pkgs; [
    fira-code
    noto-fonts
    liberation_ttf
  ];
}
```

## 最佳实践

### 1. 使用 Flakes
- 总是使用 Flakes 来确保依赖版本锁定
- 利用 `flake.lock` 确保复现性

### 2. 模块化配置
- 将大型配置拆分为多个模块
- 使用 `imports` 组合模块

### 3. 声明式管理
- 尽可能使用声明式配置而非命令式操作
- 避免手动修改系统文件

### 4. 版本控制
- 将配置文件纳入版本控制系统
- 定期提交更改以便回滚

### 5. 定期清理
- 定期运行 `nix store gc` 清理未使用的包
- 使用 `nix store optimise` 优化存储空间

### 6. 团队协作
- 在团队开发中统一固定 NIX_PATH 的值
- 维护清晰的文档说明项目配置

## 学习资源

### 官方文档
- [Nix 官方网站](https://nixos.org/)
- [NixOS 官方文档](https://nixos.org/learn.html)
- [Nix Flakes 官方文档](https://nixos.org/manual/nix/stable/command-ref/new-cli/nix3-flake.html)

### 推荐教程
1. [Nix.dev](https://nix.dev/) - 官方推荐入门教程，非常现代化
2. [Nix Pills](https://nixos.org/guides/nix-pills/) - 深入理解 Nix 内部原理
3. [Zero to Nix](https://zero-to-nix.com/) - 最适合新手的 Flakes 导向教程
4. [NixOS-CN 中文手册](https://nixos-cn.org/manual/)

### 社区资源
- [NixOS Wiki](https://nixos.wiki/)
- [Nix Search](https://search.nixos.org/) - 查询 Packages 和 Options 的必备工具
- [Noogle](https://noogle.dev/) - 社区 Nix 函数库搜索引擎

### 实践建议
1. 先用 `nix profile` 装包，熟悉基本操作
2. 感到不爽时，尝试写一个 `flake.nix` 管理包
3. 想同步配置时，引入 Home Manager
4. 最后再深入研究 Nix 语言的底层函数

记住，Nix 的学习曲线虽然陡峭，但一旦掌握，它将极大提高你的系统管理和开发效率。不要试图一次搞懂所有东西，循序渐进是最好的学习方式。