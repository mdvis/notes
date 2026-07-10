# XDG 全面参考

## 一、XDG 是什么

**Cross-Desktop Group**（前身 X Desktop Group），是一套让不同桌面环境和应用**互操作**的规范集合。

核心产出：

- XDG Base Directory Specification（最知名）
- Desktop Entry（.desktop 文件）
- Autostart 规范
- MIME 类型
- Icon / Sound Theme
- Trash（回收站）
- User Dirs

## 二、Base Directory Specification

核心理念：把 home 目录的 dotfile 地狱变成有序的目录树。

### 2.1 五个核心环境变量

| 变量              | 默认路径         | 用途                         | 持久性       |
| ----------------- | ---------------- | ---------------------------- | ------------ |
| `XDG_DATA_HOME`   | `~/.local/share` | 应用数据（字体、图标、插件） | 长期         |
| `XDG_CONFIG_HOME` | `~/.config`      | 配置文件                     | 长期         |
| `XDG_CACHE_HOME`  | `~/.cache`       | 缓存（可安全删除）           | 非必要       |
| `XDG_STATE_HOME`  | `~/.local/state` | 状态数据（日志、历史）       | 持久但可重建 |
| `XDG_RUNTIME_DIR` | `/run/user/$UID` | 运行时文件（socket、pipe）   | 重启即清空   |

### 2.2 搜索路径（DIRS）

| 变量              | 默认值                        | 作用           |
| ----------------- | ----------------------------- | -------------- |
| `XDG_DATA_DIRS`   | `/usr/local/share:/usr/share` | 系统级数据搜索 |
| `XDG_CONFIG_DIRS` | `/etc/xdg`                    | 系统级配置搜索 |

- **写入**：始终写入 `XDG_*_HOME`（单一路径）
- **读取**：先查 HOME，再逐级查 DIRS（从左到右），第一节匹配生效

### 2.3 解析优先级

```
应用启动
  ├─ 环境变量已设置？ → 使用环境变量值
  └─ 否则 → 使用默认路径
       ├─ 写入：HOME（单一路径）
       └─ 读取：HOME → DIRS（多路径搜索链）
```

### 2.4 RUNTIME_DIR 的特殊约束

- 必须由 PAM/systemd 创建，应用自身不能建
- 权限强制 `700`，其他用户不可读
- 生命周期严格绑定会话，重启后保证清空

### 2.5 STATE_HOME（2021 新增）

填补 cache 和 data 之间的空白。「丢了不合适，但不是核心数据」——bash history、Neovim shada、应用日志等应在此处。

## 三、路径迁移对照

| 传统路径       | XDG 路径                                        |
| -------------- | ----------------------------------------------- |
| `~/.bashrc`    | `$XDG_CONFIG_HOME/bash/bashrc`                  |
| `~/.gitconfig` | `$XDG_CONFIG_HOME/git/config`                   |
| `~/.npmrc`     | `$XDG_CONFIG_HOME/npm/npmrc`                    |
| `~/.vim/`      | `$XDG_CONFIG_HOME/vim/` + `$XDG_DATA_HOME/vim/` |
| `~/.ssh/`      | **不迁移（SSH 安全约束）**                      |

## 四、Desktop Entry（.desktop 文件）

### 4.1 基本结构

INI 风格，由 `[Group]` 分组。最小文件只有 `[Desktop Entry]` 一个组，外加 Type / Name / Exec 三个必填键。

```
[Desktop Entry]
Type=Application
Name=Firefox
GenericName=Web Browser
Comment=Browse the World Wide Web
Exec=firefox %u
Icon=firefox
Terminal=false
Categories=Network;WebBrowser;
MimeType=text/html;x-scheme-handler/http;x-scheme-handler/https;
StartupWMClass=Firefox
```

### 4.2 三种 Type

| Type          | 用途               |
| ------------- | ------------------ |
| `Application` | 可执行程序启动器   |
| `Link`        | HTTP/FTP 快捷方式  |
| `Directory`   | 应用菜单中的子目录 |

### 4.3 Type=Application 关键键名

| 键                | 必须 | 说明                         |
| ----------------- | ---- | ---------------------------- |
| `Type`            | 是   | 固定 `Application`           |
| `Name`            | 是   | 显示名称                     |
| `Exec`            | 是   | 启动命令，支持字段码         |
| `Icon`            | 否   | 图标名或图标文件路径         |
| `Terminal`        | 否   | `true` 时在终端中启动        |
| `Categories`      | 否   | 分号结尾；决定菜单位置       |
| `MimeType`        | 否   | 可打开的文件类型列表         |
| `NoDisplay`       | 否   | `true` 时从菜单隐藏          |
| `Hidden`          | 否   | `true` 时等同于 NoDisplay    |
| `OnlyShowIn`      | 否   | 分号分隔，限定桌面环境       |
| `NotShowIn`       | 否   | 分号分隔，排除桌面环境       |
| `StartupWMClass`  | 否   | 窗口类名，用于 dock 图标分组 |
| `Actions`         | 否   | 右键快捷操作列表             |
| `DBusActivatable` | 否   | `true` 表示通过 D-Bus 启动   |

#### Exec 字段码

| 码   | 含义              |
| ---- | ----------------- |
| `%f` | 单个文件名        |
| `%F` | 多个文件名        |
| `%u` | 单个 URL          |
| `%U` | 多个 URL          |
| `%i` | `--icon IconName` |
| `%c` | 翻译后的 Name     |

### 4.4 Type=Link

```
Type=Link
Name=GitHub
URL=https://github.com
Icon=web-browser
```

### 4.5 Actions（右键菜单）

```
Actions=new-window;new-private-window;

[Desktop Action new-window]
Name=New Window
Exec=firefox --new-window

[Desktop Action new-private-window]
Name=New Private Window
Exec=firefox --private-window
```

### 4.6 安装位置

| 层级    | 路径                                                            |
| ------- | --------------------------------------------------------------- |
| 用户级  | `$XDG_DATA_HOME/applications/`                                  |
| 系统级  | `$XDG_DATA_DIRS/applications/`（如 `/usr/share/applications/`） |
| Flatpak | `~/.local/share/flatpak/exports/share/applications/`            |

### 4.7 Autostart

同样是 `.desktop` 文件，放在 `autostart/` 子目录下。支持额外键：

| 键                          | 说明                             |
| --------------------------- | -------------------------------- |
| `X-GNOME-Autostart-enabled` | GNOME 专用开关                   |
| `X-KDE-autostart-phase`     | KDE 启动阶段控制                 |
| `StartupDelay`              | 延迟秒数（非标准，部分 DM 支持） |

## 五、其他 XDG 规范速览（续）

| 规范        | 说明                | 路径                           |
| ----------- | ------------------- | ------------------------------ |
| MIME Types  | 文件类型 - 应用关联 | `mime/`                        |
| Icon Theme  | 图标主题            | `icons/`                       |
| Sound Theme | 音效主题            | `sounds/`                      |
| Trash       | 回收站              | `Trash/files/` + `Trash/info/` |
| User Dirs   | 翻译标准目录名      | `user-dirs.dirs`               |

## 六、Session 元数据（非 Base Directory）

由登录管理器在会话创建时注入。

| 变量                  | 示例值                       | 含义                     |
| --------------------- | ---------------------------- | ------------------------ |
| `XDG_SESSION_TYPE`    | `x11` / `wayland`            | 图形显示服务器类型       |
| `XDG_CURRENT_DESKTOP` | `GNOME` / `KDE` / `Hyprland` | 桌面环境名称（冒号分隔） |
| `XDG_SESSION_DESKTOP` | `gnome`                      | DES 文件名               |
| `XDG_SESSION_CLASS`   | `user` / `greeter`           | 会话类别                 |
| `XDG_SEAT`            | `seat0`                      | 物理座位号               |
| `XDG_VTNR`            | `2`                          | 虚拟终端号               |

### 启动流程

```
DM 验证 → 启动 session 进程
            ├─ 设置 SESSION_TYPE（选择图形后端）
            ├─ 设置 CURRENT_DESKTOP（选择 portal 后端）
            └─ 启动 compositor / shell
                  └─ 子进程继承全部 XDG_SESSION_* 变量
```

- `SESSION_TYPE` → 应用选图形栈（X11/Wayland）
- `CURRENT_DESKTOP` → xdg-desktop-portal 选集成方案

## 七、XDG 抵抗者及其原因

| 项目       | 路径         | 原因                                                                      |
| ---------- | ------------ | ------------------------------------------------------------------------- |
| **SSH**    | `~/.ssh/`    | 权限检查在内核级认证链中，早于环境变量可用；改变路径 = 安全审计面失效     |
| **Docker** | `~/.docker/` | 自身即容器标准，路径是生态约定的一部分（被 K8s/podman 直接读取）          |
| **GNUPG**  | `~/.gnupg/`  | 比 XDG 早 10+ 年，trustdb 等有独立安全语义；提供 `GNUPGHOME` 但不主动适配 |
