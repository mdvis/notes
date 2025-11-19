- **同步软件包数据库并升级所有软件包**：
```bash
sudo pacman -Syu
```
此命令会同步软件包数据库并将所有可升级的软件包升级到最新版本。
- **安装软件包**：
```bash
sudo pacman -S <package_name>
```
使用软件包名称替换 `<package_name>` 来安装软件。
- **移除软件包**：
```bash
sudo pacman -R <package_name>
```
此命令用于移除指定的软件包，但会保留依赖它的其他软件包。
- **彻底移除软件包及其依赖**：
```bash
sudo pacman -Rs <package_name>
```
这会移除指定软件包及其不再被其他软件依赖的依赖包。
- **查找软件包**：
```bash
sudo pacman -Ss <keyword>
```
用关键词替换 `<keyword>` 来查找包含该关键词的软件包。 