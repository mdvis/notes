NixOS 采用 Nix 作为包管理器，它具备原子性、可复现性等优点。下面是 Nix 包管理器的一些常用命令：
### 安装包
- 临时安装包（仅对当前 shell 会话有效）：
```bash
nix-shell -p <package-name>
```
例如，要临时安装 `htop` 工具，可以运行：
```bash
nix-shell -p htop
```
- 全局安装包：
```bash
nix-env -iA nixos.<package-name>
```
例如，要全局安装 `git`，可以运行：
```bash
nix-env -iA nixos.git
```
### 卸载包
```bash
nix-env -e <package-name>
```
比如，若要卸载 `htop`，可以运行：
```bash
nix-env -e htop
```
### 升级包
- 升级所有已安装的包：
```bash
nix-env -u
```
- 升级特定的包：
```bash
nix-env -u <package-name>
```
### 搜索包
```bash
nix-env -qaP <search-term>
```
例如，要搜索包含 `vim` 的包，可以运行：
```bash
nix-env -qaP vim
```
### 查看已安装的包
```bash
nix-env -q
```
### 更新 Nix 软件源
```bash
nix-channel --update
```
### 回滚系统配置
```bash
nixos-rebuild switch --rollback
```
### 生成新的系统配置
```bash
nixos-rebuild switch
```
## 查看已安装的包：
### 使用 `nix-env -q` 命令
此命令可用于查看当前用户环境中已安装的包。运行以下命令：
```bash
nix-env -q
```
执行后，系统会列出当前用户环境里所有已安装的包名称。
### 使用 `nix-env -q --installed` 命令
`--installed` 选项能明确指定仅显示已安装的包，尽管 `nix-env -q` 本身默认就是这样，但使用此选项能使命令意图更清晰。命令如下：
```bash
nix-env -q --installed
```
### 查看详细信息
如果你希望查看已安装包的详细信息，例如版本号等，可以使用 `-qa` 选项：
```bash
nix-env -qa
```
### 查看所有用户安装的包
若要查看系统中所有用户安装的包，可使用 `--profile` 选项指定系统级的配置文件，命令如下：
```bash
nix-env -q --profile /nix/var/nix/profiles/system
```