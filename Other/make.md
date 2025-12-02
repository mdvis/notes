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

## Makefile 相关内容

## 伪目标
在 Makefile 中，伪目标是一个特殊类型的目标，它不代表实际要生成的文件，而是代表一系列需要执行的操作或命令。

**伪目标的特点**
- 不创建文件：伪目标不对应任何实际的文件，它只是一个标签，用于组织要执行的任务
- 总是执行：无论同名文件是否存在，执行伪目标时，其命令总是会被执行
- 避免冲突：防止当存在与目标同名的文件时，Make 误认为该目标已经是最新的
```
.PHONY: <name>

target: prerequisites
	recipe
```
**target**
规则的目标，通常是要生成的文件名或动作名
**prerequisites**
先决条件，是生成 target 所需要的文件或其他目标（依赖）
**recipe**
配方，make 为生成 target 需要执行的一或多条 shell，==必须以一个 Tab 键开头，不能用空格==。
```makefile
.PHONY: run.js

run.js: run.ts
	npx tsc run.ts
clean:
	rm -f *.ts
```
- make 命令查找 Makefile 文件并执行第一条规则
- 执行其他规则 make clean
## 常见变量
- CC： C 编译器（默认 cc）
- CXX：C++编译器（默认g++）
- CFLAGS：C 编译器的选项
- CXXFLAGS：C++编译器的选项
- LDFLAGS：连接器选项
- LDLIBS：连接的库
```makefile
OBJS = main.o utils.o algorithm.o
TARGET = my_program
CXX = g++
CXXFLAGS = -Wall -g -O2

$(TARGET): $(OBJS)
    $(CXX) $(OBJS) -o $(TARGET)

main.o: main.cpp utils.h algorithm.h
    $(CXX) $(CXXFLAGS) -c main.cpp -o main.o

utils.o: utils.cpp utils.h
    $(CXX) $(CXXFLAGS) -c utils.cpp -o utils.o

algorithm.o: algorithm.cpp algorithm.h
    $(CXX) $(CXXFLAGS) -c algorithm.cpp -o algorithm.o

clean:
    rm -f *.o $(TARGET)
```
## 自动变量
常用自动变量：
- `$@`： 当前规则中的目标 (Target)
- `$<`： 第一个先决条件 (Prerequisite)
- `$^`： 所有先决条件的列表(OBJS)
- `$?`： 所有比目标更新的先决条件列表
```makefile
OBJS = main.o utils.o algorithm.o
TARGET = my_program
CXX = g++
CXXFLAGS = -Wall -g -O2

$(TARGET): $(OBJS)
    $(CXX) $^ -o $@

# 这是一条模式规则
%.o: %.cpp
    $(CXX) $(CXXFLAGS) -c $< -o $@

.PHONY: clean
clean:
    rm -f $(OBJS) $(TARGET)
```
## make 替换语法
```
$(VAR:<old_suffix>=<new_suffix>)
${VAR:<old_suffix>=<new_suffix>}
```
## 模式替换 patsubst
```
$(patsubst <pattern>,<replacement>,$(VAR))

OBJS = main.o utils.o algorithm.o
# 生成 SRCS = main.cpp utils.cpp algorithm.cpp
SRCS = $(patsubst %.o,%.cpp,$(OBJS))
```
## 获取目录列表
```
$(dir <list>)

FILES = /usr/src/main.c ./utils/helper.o /bin/bash
DIRS = $(dir $(FILES)) # DIRS 变为 /usr/src/ ./utils/ /bin/
```
## 获取文件名
```
$(nodir <list>)
FILES = $(nodir $(FILES)) # main.c helper.o bash
```
## 添加后缀
```
$(addsuffix <suffix>,<list>)
```
## 通配符扩展
```
$(wildcard <pattern>)

# 获取当前目录下所有的 .cpp 文件
SRCS = $(wildcard *.cpp)
# 获取 src 目录下所有的 .c 文件
SRCS += $(wildcard src/*.c)
# 然后可以用 patsubst 生成 OBJS
OBJS = $(patsubst %.cpp,%.o,$(SRCS))
```
## 示例
```
# 1. 找到所有源文件
SRC_DIR = src
SRCS = $(wildcard $(SRC_DIR)/*.cpp)

# 2. 生成对应的对象文件列表，并放在 build/obj 目录下
OBJS = $(patsubst $(SRC_DIR)/%.cpp,build/obj/%.o,$(SRCS))

# 3. 生成对应的依赖文件列表 (.d 文件)
DEP_FILES = $(patsubst %.o,%.d,$(OBJS)) # 等价于 $(OBJS:.o=.d)

# 最终，如果 SRCS 是 src/main.cpp src/utils.cpp，那么：
# OBJS 就是 build/obj/main.o build/obj/utils.o
# DEP_FILES 就是 build/obj/main.d build/obj/utils.d

TARGET = myapp

$(TARGET): $(OBJS)
    $(CXX) $(OBJS) -o $@

# 编译规则，同时生成依赖信息
build/obj/%.o: $(SRC_DIR)/%.cpp
    @mkdir -p $(@D) # 创建目标目录
    $(CXX) $(CXXFLAGS) -MMD -c $< -o $@

# 包含依赖文件
-include $(DEP_FILES)
```