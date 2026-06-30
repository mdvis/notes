Nix 是一门独特的包管理器和构建系统。掌握它的最新工作流，核心在于理解 **Flakes** 和 **Nix 命令** 这两个相辅相成的概念。Flakes 为项目提供了一套统一、可复现的结构和依赖管理，而新的命令行界面则让与 Nix 生态的交互变得前所未有的便捷。

下面，我会围绕这套现代工作流，为你梳理一份全面的入门与实践指南。

### 🚀 第一步：启航前的准备

在开始之前，需要先在你的系统上安装 Nix，并启用这两个实验性功能。

#### 安装 Nix

访问 Nix 官方网站，运行其提供的安装脚本即可轻松完成安装。其核心是将所有软件包隔离存储在 `/nix/store` 目录下，从根本上解决了依赖冲突的问题。

#### 启用实验性功能

Flakes 和新的 `nix` 命令目前仍是实验性功能，需要手动启用。你可以选择永久启用或临时启用。

- **💡 推荐方案：永久启用**
  编辑 Nix 配置文件（通常位于 `~/.config/nix/nix.conf` 或 `/etc/nix/nix.conf`），添加或修改以下行：

  ```
  experimental-features = nix-command flakes
  ```

  如果你使用的是 NixOS，可以在 `configuration.nix` 中进行如下声明式配置：

  ```nix
  nix.settings.experimental-features = [ "nix-command" "flakes" ];
  ```

  保存并（在 NixOS 上）重建配置后，即可永久生效。

- **临时方案：命令行启用**
  如果不想修改全局配置，也可以在每次执行 Nix 命令时，通过添加 `--experimental-features 'nix-command flakes'` 参数来临时启用。例如：
  ```bash
  nix --experimental-features 'nix-command flakes' flake show
  ```

#### 安全性提醒

请注意，`flake.nix` 文件中的内容会被复制到全局可读的 Nix store 中，切勿在其中存放任何未加密的敏感信息（如密码、密钥等）。敏感信息应使用 `sops-nix`、`agenix` 等专门的方案进行管理。

### 🧱 第二步：Flakes 核心概念 - 从输入到输出

一个 Flake 本质上是一个包含 `flake.nix` 文件的目录，它定义了项目的 **输入 (inputs)** 和 **输出 (outputs)**，类似于一个可配置的函数。

#### 📄 `flake.nix` 模板解析

一个最简的 `flake.nix` 文件结构如下：

```nix
{
  # 描述信息：清晰地说明这个 Flake 的用途
  description = "A very basic flake";

  # 输入 (Inputs): 声明项目所依赖的外部源
  inputs = {
    # nixpkgs 是最核心的输入，它包含了 Nix 生态中几乎所有的软件包
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.11";
  };

  # 输出 (Outputs): 定义这个 Flake 能提供什么
  # 它是一个函数，参数通常是这个 Flake 自身 (self) 和所有 inputs
  outputs = { self, nixpkgs }: {
    # 在这里定义你的包、开发环境等
  };
}
```

- **输入 (Inputs)**：通过 `url` 属性定义。最常用的 `url` 语法与 GitHub 仓库地址类似，如 `github:owner/repo`。执行命令（如 `nix run`）时，Nix 会根据 `url` 抓取输入，并锁定其版本。你也可以引用**本地路径**作为输入，这在进行本地开发或模块化配置时非常有用。
- **输出 (Outputs)**：它是一个接受参数并返回属性集的函数。最重要的两个参数是 `self`（代表这个 Flake 自身）和你在 `inputs` 中声明的依赖（例如上面的 `nixpkgs`）。

#### 🔑 解锁关键的输出类型

`outputs` 属性集是 Flake 的核心，你可以通过不同的属性名来声明不同类型的产出。

| 输出属性                     | 用途                          | 示例命令                                  |
| :--------------------------- | :---------------------------- | :---------------------------------------- |
| `packages.<system>.<name>`   | 构建一个具体的软件包          | `nix build .#hello`                       |
| `apps.<system>.<name>`       | 定义一个可以直接运行的“应用”  | `nix run .#my-app`                        |
| `devShells.<system>.<name>`  | 定义一个可复现的开发环境      | `nix develop`                             |
| `checks.<system>.<name>`     | 定义自动化测试，确保代码质量  | `nix flake check`                         |
| `nixosConfigurations.<name>` | 定义一个完整的 NixOS 系统配置 | `nixos-rebuild switch --flake .#my-nixos` |
| `formatter.<system>`         | 指定用于格式化代码的程序      | `nix fmt`                                 |

> **注**：`<system>` 是你的目标系统架构，如 `x86_64-linux`、`aarch64-darwin` 等。使用第三方库（如 `flake-utils`）可以简化对多系统的支持。

#### 🔒 锁定文件 `flake.lock`

当你第一次使用一个 Flake（例如运行 `nix run`）时，Nix 会计算出所有输入（依赖）的确切版本，并生成一个 `flake.lock` 文件。这个文件确保了整个团队的开发环境和生产环境使用的是完全相同的依赖版本，是实现真正可复现构建的关键。

### 🛠️ 第三步：现代 Nix 命令实战

新的 `nix` 命令是与 Flakes 交互的主要方式，它比旧式命令更加统一和强大。

#### 创建与探索

你可以快速创建一个新的 Flake 项目，并查看其中定义的内容：

```bash
# 在当前目录创建一个简单的 Flake 模板
nix flake init

# 使用 GitHub 上的模板来创建项目
nix flake init -t github:nix-community/templates#python

# 查看当前 Flake 提供了哪些输出
nix flake show
```

`nix flake init` 命令会自动生成一个 `flake.nix` 文件。

#### 构建与运行

构建和运行 Flake 中定义的内容也变得异常简单：

```bash
# 构建 Flake 中定义的 'default' 包
nix build

# 构建 Flake 中一个特定的包，比如 'hello'
nix build .#hello

# 直接运行一个应用
nix run .#my-app

# 也可以不进入目录，直接运行远程 Flake 中的包
nix run github:NixOS/nixpkgs#hello
```

当你想将 `nix run` 指向 `apps` 输出时，可以直接使用应用名。

#### 开发与维护

这套现代工作流同样简化了开发环境的维护：

```bash
# 进入 Flake 中定义的开发环境
nix develop

# 更新所有依赖到最新版本，并更新 flake.lock 文件
nix flake update

# 添加或更新一个特定的依赖
nix flake lock --update-input nixpkgs

# 执行 Flake 中定义的检查
nix flake check
```

`nix flake check` 命令会根据你在 `checks` 输出中定义的测试来验证 Flake 的完整性和正确性。

### 💎 总结

至此，你已经掌握了使用 Nix 现代工作流的核心技能。其精髓在于 **Flakes 的标准化结构与 `nix` 命令的强大功能**。

#### 🔍 更多资源

想要进一步深入，推荐以下高质量的学习资源：

- **官方文档**：[Nix Reference Manual](https://nix.dev/manual/nix/stable/) 和 [NixOS Wiki](https://wiki.nixos.org/) 是最权威的信息源。
- **社区书籍**：[《NixOS and Flakes Book》](https://nixos-and-flakes.thiscute.world/) 对 Nix 语言和 Flakes 有非常深入的讲解，并且有完整的中文版。
- **进阶工具**：[flake-utils](https://github.com/numtide/flake-utils) 和 [flake-parts](https://github.com/hercules-ci/flake-parts) 可以帮助你编写更简洁、模块化的 Flakes。

如果对教程中的某个具体部分（比如如何编写 `devShell` 来构建完美的开发环境）想有更深入的了解，可以随时告诉我，我很乐意为你提供更详细的讲解。
