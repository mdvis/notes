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