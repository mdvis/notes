- **更新软件包列表**：
```bash
sudo apt update
```
此命令用于从软件源获取最新的软件包信息。
- **升级已安装的软件包**：
```bash
sudo apt upgrade
```
该命令会将已安装的软件包更新到最新版本。
- **安装软件包**：
```bash
sudo apt install <package_name>
```
用软件包名称替换 `<package_name>` 来安装指定软件包。
- **移除软件包**：
```bash
sudo apt remove <package_name>
```
这会移除指定的软件包，但会保留配置文件。
- **彻底移除软件包**：
```bash
sudo apt purge <package_name>
```
此命令不仅移除软件包，还会删除其配置文件。
- **自动清理不再需要的依赖包**：
```bash
sudo apt autoremove
```
