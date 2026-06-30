**Java 21 入门教程（面向前端开发者）**

作为前端开发者，你已经熟悉编程逻辑、异步（Promise/async-await）、模块化等概念。Java 21 的很多现代特性（如记录类型、模式匹配、虚拟线程）会让你感觉亲切，它更像“加强版 TypeScript + 更好的并发”。本教程帮你快速上手，从零到能写实际代码。

### 1. 环境搭建（10-20 分钟）

1. **下载 JDK 21**
   推荐：
   - Oracle JDK 或 OpenJDK（Temurin/Adoptium）。
     官网：https://jdk.java.net/21/ 或 https://adoptium.net/
     下载对应操作系统的 **JDK 21**（不是 JRE）。

2. **安装并配置**
   - 解压后设置环境变量：
     - `JAVA_HOME` = JDK 安装目录
     - `PATH` 添加 `%JAVA_HOME%\bin`（Windows）或 `$JAVA_HOME/bin`（macOS/Linux）
   - 验证：终端运行 `java -version` 和 `javac -version`，看到 21 即可。

3. **推荐 IDE**
   - **IntelliJ IDEA Community**（免费，最友好）
   - VS Code + Extension Pack for Java
   - Eclipse（可选）

4. **构建工具**（强烈推荐）
   - **Maven**（最简单，新手友好）或 **Gradle**。
     先装 Maven（https://maven.apache.org/download.cgi），类似 npm。

### 2. 第一个 Java 21 程序（Hello World）

创建一个目录 `hello-java`，里面建 `Hello.java`：

```java
public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello, Java 21! 来自前端开发者 👋");

        // Java 21 字符串模板（Preview，需要 --enable-preview）
        String name = "前端";
        System.out.println(STR."欢迎 {name} 学习 Java 21！");
    }
}
```

编译运行（终端）：

```bash
javac --enable-preview --release 21 Hello.java
java --enable-preview Hello
```

**用 IDE**：新建 Java 项目，直接运行 `main` 方法。

### 3. Java 基础语法（快速过一遍，你会觉得熟悉）

- **变量与类型**：`int`、`double`、`boolean`、`String`（不可变，像 JS string）。
  用 `var` 类型推断（Java 10+）：`var list = List.of(1,2,3);`

- **类与对象**（类似 TS class）：

```java
public record User(String name, int age) {}  // Java 16+ Record，超好用！
```

- **集合**（类似 JS Array/Map）：

```java
var list = List.of("a", "b");           // 不可变
var mutable = new ArrayList<String>();

// Java 21 Sequenced Collections
list.getFirst();
list.getLast();
```

- **控制流**（if、for、switch 超级强大）：

```java
// Java 21 Pattern Matching for switch（稳定）
String result = switch (obj) {
    case String s -> "字符串: " + s;
    case Integer i when i > 10 -> "大整数";
    case null -> "空";
    default -> "其他";
};
```

### 4. Java 21 亮点特性（重点掌握，这些让你高效）

- **Records**（数据类）：自动生成 constructor、getters、equals、toString。

```java
record Point(int x, int y) {}
```

- **Pattern Matching**（解构，像 TS）：

```java
if (shape instanceof Circle c) {
    System.out.println(c.radius());
}
```

- **Virtual Threads**（革命性！解决并发痛点）
  前端 async/await 的 Java 版。传统线程贵，虚拟线程轻量（百万级无压力）。

```java
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    for (int i = 0; i < 1000; i++) {  // 轻松上千/万
        int taskId = i;
        executor.submit(() -> {
            System.out.println("任务 " + taskId + " 在虚拟线程: " + Thread.currentThread());
            // 模拟 IO（如 HTTP 请求）
            Thread.sleep(100);
        });
    }
}  // 自动关闭
```

对比 Node.js event loop，这让你写高并发后端超简单。

- **其他**：Unnamed patterns/variables、String Templates（STR."..."）、Sequenced Collections 等。

### 5. 构建工具 + 项目结构（类似 npm 项目）

**Maven 项目示例**（推荐）：

```xml
<!-- pom.xml -->
<project>
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.example</groupId>
    <artifactId>myapp</artifactId>
    <version>1.0</version>

    <properties>
        <maven.compiler.source>21</maven.compiler.source>
        <maven.compiler.target>21</maven.compiler.target>
    </properties>
</project>
```

目录结构：

```
src/
  main/java/com/example/  # 你的代码
  test/java/              # 测试
```

常用命令：

- `mvn compile` / `mvn exec:java -Dexec.mainClass="com.example.Hello"`
- `mvn clean package`

**Gradle** 类似 `build.gradle.kts` 设置 `java.toolchain.languageVersion = JavaLanguageVersion.of(21)`。

### 6. 作为前端开发者，推荐下一步：Spring Boot 后端

Java 最强生态是 **Spring Boot**（类似 Express/NestJS，但企业级）。

快速启动：

1. https://start.spring.io/ 生成项目（选 Java 21 + Spring Web）。
2. 添加依赖，写 Controller（REST API），直接返回 JSON 给你的前端。

示例 Controller：

```java
@RestController
@RequestMapping("/api")
public class UserController {
    @GetMapping("/users")
    public List<User> getUsers() {
        return List.of(new User("张三", 30));
    }
}
```

虚拟线程在 Spring Boot 3.2+ 一行配置启用：`spring.threads.virtual.enabled=true`。

### 7. 学习资源（中文友好）

- **官方**：https://dev.java/learn/
- **新特性**：Baeldung Java 21、GeeksforGeeks。
- **视频**：Bilibili 搜索 “Java 21 教程” 或 “Spring Boot 3 入门”。
- **实践**：LeetCode（Java）、写一个小后端 API + 你的前端项目对接。
- **书籍/课程**：Udemy “Java 21 Programming Masterclass” 或 《Java 核心技术》。

### 8. 练习建议（逐步进阶）

1. 写一个命令行 Todo List（用 Record + List）。
2. 用虚拟线程并发爬取/处理数据。
3. 搭 Spring Boot 项目，返回 JSON 给你的 React/Vue 前端。
4. 尝试 Pattern Matching 重构旧代码。

**常见坑**：

- Java 是静态类型，编译时检查多（比 JS 严格，好处是 bug 少）。
- 包名 + 目录结构必须匹配。
- 记得 `public class` 文件名一致。

坚持 1-2 周，每天写点代码，你就能轻松写 Java 21 后端了！有具体问题（如“怎么连数据库”或“Spring Boot 报错”）随时问我，我可以给你代码示例。

加油，前端转全栈很香！🚀
