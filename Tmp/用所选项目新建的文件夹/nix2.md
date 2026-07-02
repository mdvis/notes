欢迎来到“现代 Nix”的世界。如果你之前听说 Nix 很难学，那通常是因为旧版的 Nix 充满了隐式逻辑和全局变量（如 `NIX_PATH`）。

**现代 Nix（Nix 2.0+ 与 Flakes）** 的核心目标是：**显式、纯净、可重现**。

---

## 1. 开启现代 Nix 模式

在安装 Nix 后，你需要手动开启 `nix-command` 和 `flakes` 这两个实验性特性（它们已经是事实上的行业标准）。

编辑或创建 `~/.config/nix/nix.conf`（或系统级的 `/etc/nix/nix.conf`）：

```nix
experimental-features = nix-command flakes

```

---

## 2. 核心指令：再见 nix-env，你好 nix profile

现代指令统一以 `nix <subcommand>` 开头，逻辑极其清晰。

### 常用命令对比表

| 旧指令 (Legacy)       | 现代指令 (Flakes/Command)             | 作用                             |
| --------------------- | ------------------------------------- | -------------------------------- |
| `nix-shell -p pkg`    | **`nix shell nixpkgs#pkg`**           | 临时进入包含该包的环境           |
| `nix-env -iA pkg`     | **`nix profile install nixpkgs#pkg`** | 像传统包管理器一样安装包         |
| `nix-build`           | **`nix build`**                       | 构建当前目录的 Flake             |
| `nix-shell`           | **`nix develop`**                     | 进入开发环境（读取 `devShells`） |
| `nix-collect-garbage` | **`nix store gc`**                    | 清理没用的文件（垃圾回收）       |

### 杀手锏指令：`nix run`

如果你只想运行一个程序而不安装它（比如 `cowsay`）：

```bash
nix run nixpkgs#cowsay -- "Hello Flakes!"

```

这会自动下载、缓存并运行，运行完后你的系统依然干净如初。

---

## 3. 什么是 Flake？

**Flake** 是一个包含 `flake.nix` 文件的目录。它解决了 Nix 过去最大的痛点：**版本锁定**。

一个 `flake.nix` 主要由两个部分组成：

1. **Inputs（输入）**：依赖项。比如你想用哪个版本的 `nixpkgs`。
2. **Outputs（输出）**：你产出的东西。可以是软件包、开发环境、或者是整个系统的配置。

### Flake 结构示例

```nix
{
  description = "我的第一个 Flake";

  # 输入：获取依赖
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  # 输出：定义产物
  outputs = { self, nixpkgs }:
    let
      system = "x86_64-linux"; # 或 "aarch64-darwin" 等
      pkgs = nixpkgs.legacyPackages.${system};
    in {
      # 定义当你运行 `nix build` 时构建什么
      packages.${system}.default = pkgs.hello;

      # 定义当你运行 `nix develop` 时进入什么环境
      devShells.${system}.default = pkgs.mkShell {
        buildInputs = [ pkgs.nodejs pkgs.git ];
      };
    };
}

```

---

## 4. 现代工作流实例：创建一个开发环境

假设你正在写一个 Python 项目，但不想在全局安装 Python 插件。

1. **初始化**：

```bash
nix flake init -t github:nix-community/nix-direnv

```

_(或者手动创建一个简易的 `flake.nix`)_ 2. **定义环境**：
在 `devShells` 里加入 `python3` 和 `pandas`。3. **进入环境**：

```bash
nix develop

```

现在你就在一个拥有 Python 环境的隔离 Shell 中了。输入 `exit` 即可退出，系统不会留下任何痕迹。4. **版本锁定 (`flake.lock`)**：
当你第一次运行指令时，Nix 会生成一个 `flake.lock` 文件。它记录了 `nixpkgs` 的精确哈希值。这意味着 **10 年后你在另一台机器上运行 `nix develop`，得到的环境将完全一致**。

---

## 5. 引用路径的魔法 (Flake Refs)

现代 Nix 允许你直接引用 GitHub 上的配置，而无需下载：

- 运行远程 Flake 里的包：
  `nix run github:edolstra/dwarffs`
- 使用特定的分支：
  `nix shell github:NixOS/nixpkgs/nixos-23.11#htop`

---

## 6. 避坑指南：给新手的三个建议

1. **忘记 `NIX_PATH**`：在 Flake 模式下，一切依赖都应该写在 `inputs` 里，不要依赖系统变量。
2. **善用查询**：去 [search.nixos.org](https://search.nixos.org/packages) 查找包名，记得切换到 "Flakes" 选项卡。
3. **Git 是必须的**：**重要！** Flake 会忽略任何未被 Git 追踪 (`git add`) 的文件。如果你新建了一个 `.nix` 文件却发现 Nix 报错找不到它，请先 `git add`。

> **底层逻辑：** 现代 Nix 就像是软件包管理界的 Git。`flake.nix` 是你的代码，`flake.lock` 是你的 Commit ID，而 `nix build/run` 则是你的 CI/CD。

你现在准备好开始构建你的第一个不可变开发环境了吗？

```

```
