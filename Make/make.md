好的，我根据你提供的文章整理了一份学习笔记，提炼了重点，方便你之后查阅。

---

# 学习笔记：使用 `make` 编译 C 程序（面向非 C 程序员）

## 一、准备工作

1. **安装编译器**
    
    - **Ubuntu/Debian**: `sudo apt-get install build-essential`（安装 gcc, g++, make）
        
    - **Fedora**: `sudo dnf groupinstall "Development Tools"`
        
    - **Arch Linux**: `sudo pacman -S base-devel`
        
    - **macOS**: 安装 Xcode Command Line Tools（`xcode-select --install`）
        
2. **安装依赖**
    
    - C 没有类似 Python 的 `pip`，依赖需要手动安装。
        
    - 一般在项目 `README` 里会写明，例如：
        
        ```bash
        sudo apt install -y libqpdf-dev libpaper-dev
        ```
        
    - 注意：README 通常是针对 Debian 系的命名，macOS/Linux 其它发行版需要换包名。
        
    - **技巧**：Linux 各大发行版（Debian/Fedora/Arch/NixOS）都有打包脚本，可以参考它们的构建配置。
        

---

## 二、编译流程

1. **运行 `./configure`（如果有的话）**
    
    - 作用：检测系统环境，生成合适的 Makefile。
        
    - 如果失败，多半是缺少依赖。
        
2. **运行 `make`**
    
    - 常见命令：
        
        - `make`（默认编译所有目标）
            
        - `make -j8`（并行编译，加快速度）
            
        - `make target`（只编译指定目标，如 `make qf`）
            
    - 可能遇到的问题：
        
        - 大量 **编译警告**：通常可以忽略。
            
        - **编译错误**：往往和依赖路径或缺少库有关。
            

---

## 三、理解编译与链接

- **编译阶段**：源文件 → 对象文件（`gcc/clang` 完成）
    
- **链接阶段**：对象文件 → 可执行文件（`ld` 完成）
    

关键参数：

- `-I/path`：指定头文件目录（编译时用）
    
- `-L/path`：指定库文件目录（链接时用）
    
- `-lname`：指定库名（如 `-liconv` 表示 `libiconv`）
    

---

## 四、Make 的环境变量

1. **常用变量**
    
    - `CPPFLAGS`：传递给编译器的预处理参数（如 `-I...`）
        
    - `CXXFLAGS` / `CFLAGS`：编译器优化或警告相关参数
        
    - `LDLIBS`：传递给链接器的库（如 `-L... -l...`）
        
2. **两种设置方式**
    
    - `CPPFLAGS="..." LDLIBS="..." make`
        
    - `make CPPFLAGS="..." LDLIBS="..."`
        
    
    > 第二种会覆盖 Makefile 内已有的定义。
    
3. **示例**
    
    ```bash
    CPPFLAGS="-I/opt/homebrew/include" \
    LDLIBS="-L/opt/homebrew/lib -liconv" \
    make paperjam
    ```
    

---

## 五、实用技巧

- **快速编译单文件**：
    
    ```bash
    make qf
    ```
    
- **没有 Makefile 也能用 make**：
    
    ```bash
    make blah   # 自动执行 cc -o blah blah.c
    ```
    
- **借鉴其他发行版的构建脚本**：
    
    - 例如 Nix 的构建文件中会告诉你需要加 `-liconv` 之类的参数。
        

---

## 六、安装和打包

1. **安装**
    
    - 有些项目提供 `make install`
        
    - 更安全：手动复制可执行文件，例如：
        
        ```bash
        cp qf ~/bin
        ```
        
2. **打包**
    
    - 学会后可以为自己常用工具写 Homebrew 包、Arch PKGBUILD 或 Debian 包，方便未来直接 `brew install` 或 `apt install`。
        

---

## 七、还未深入的话题

- **LD_LIBRARY_PATH / DYLD_LIBRARY_PATH**：动态库运行时搜索路径。
    
- **pkg-config**：自动管理依赖的编译/链接参数（值得学习）。
    

---

👉 总结：  
即使不是 C 程序员，理解 **编译 + 链接**、**依赖路径** 和 **make 的变量传递**，就足够应付大部分编译需求了。

---

要不要我帮你把这个学习笔记再整理成一个 **对比表格**（分别展示在 Ubuntu/Debian、Fedora、Arch、macOS 上安装依赖和编译的差异）？这样你以后遇到问题可以直接对照查。