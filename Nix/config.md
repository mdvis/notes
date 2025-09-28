NixOS 配置（`/etc/nixos/configuration.nix`）

如果你使用的是 **NixOS** 系统，那么软件、系统服务、用户、桌面环境等配置都是通过声明性文件管理的，这就是 **NixOS 配置**。

### 配置文件位置

- 主配置文件：`/etc/nixos/configuration.nix`
    
- 还可以有：`/etc/nixos/hardware-configuration.nix`（硬件检测生成）
    
- 你可以把这些文件放在 Git 仓库里，实现完整的系统备份和迁移
    

### 基本结构

```nix
{ config, pkgs, ... }:

{
  imports = [ ./hardware-configuration.nix ];

  # 启用服务
  services.openssh.enable = true;

  # 安装系统级软件
  environment.systemPackages = with pkgs; [
    vim
    htop
    git
  ];

  # 用户配置
  users.users.m = {
    isNormalUser = true;
    extraGroups = [ "wheel" "networkmanager" ];
  };

  # 网络 & 桌面
  networking.hostName = "my-nixos";
  services.xserver.enable = true;
}
```

### 应用配置

```bash
sudo nixos-rebuild switch
```

会：

1. 解析 `configuration.nix`
    
2. 构建一个新的系统配置
    
3. 切换到新版本
    
4. 保留旧版本（可随时回滚）
    

> **特点**
> 
> - 完全声明化，配置就是系统
>     
> - 任何人拿到同样的配置文件，就能重现你的系统
>     
> - 与 `nix-env` 不同，它是系统级管理
>     
> - 非 NixOS 用户无法使用这种声明式系统配置（但可用 Home Manager 模拟）
>     
