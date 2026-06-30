Maven 是一个强大的**项目构建工具**（Build Tool），主要用于 Java 项目（也支持其他 JVM 语言）。它由 Apache 基金会维护，是目前 Java 生态中最主流的构建工具之一（另一个是 Gradle）。

### 1. Maven 到底解决了什么问题？

在没有 Maven 之前，Java 项目需要手动：

- 管理 JAR 包依赖（下载、版本冲突）
- 编译代码
- 打包（jar/war）
- 运行测试
- 部署

Maven 把这些事情**标准化、自动化**，通过一个 `pom.xml` 文件就能描述整个项目。

### 2. Maven 的核心概念

#### **POM (Project Object Model)**

项目对象模型，是 Maven 的灵魂。每个 Maven 项目根目录下必须有一个 `pom.xml` 文件。

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>      <!-- 组织/公司域名反写 -->
    <artifactId>my-app</artifactId>     <!-- 项目名称 -->
    <version>1.0.0-SNAPSHOT</version>   <!-- 版本 -->
    <packaging>jar</packaging>          <!-- 打包类型：jar/war/ear/pom 等 -->

    <dependencies>
        <!-- 这里写依赖 -->
    </dependencies>
</project>
```

- **groupId + artifactId + version** 唯一确定一个构件（GAV 坐标）。
- **SNAPSHOT** 表示开发中的版本，会经常更新。

#### **仓库 (Repository)**

Maven 会从仓库下载依赖：

1. **本地仓库**：`~/.m2/repository`（默认）
2. **中央仓库**：https://repo.maven.apache.org
3. **私服**（公司内部常用：Nexus、Artifactory）

#### **生命周期 (Lifecycle)**

Maven 定义了标准的构建生命周期，最常用的是 **Default Lifecycle**：

| 阶段（Phase） | 说明           | 常用命令    |
| ------------- | -------------- | ----------- |
| validate      | 验证项目       | -           |
| **compile**   | 编译源码       | mvn compile |
| test          | 运行测试       | mvn test    |
| **package**   | 打包成 jar/war | mvn package |
| **verify**    | 验证打包结果   | -           |
| **install**   | 安装到本地仓库 | mvn install |
| **deploy**    | 部署到远程仓库 | mvn deploy  |

**重要**：执行一个阶段时，会自动执行它之前的所有阶段。

### 3. 你遇到的第一个命令详解

```bash
mvn clean install -DskipTests
```

- **`clean`**：属于 **Clean Lifecycle**，删除 `target` 目录（上一次构建产物），防止旧文件干扰。
- **`install`**：属于 Default Lifecycle，会依次执行：`validate → compile → test → package → install`。
- **`-DskipTests`**：属性开关，跳过测试阶段（`test` 和 `integration-test`）。等价于 `-Dmaven.test.skip=true`（更彻底，连测试类都不编译）。

**实际执行顺序**：clean → validate → compile → package → install（跳过 test）。

### 4. 你遇到的第二个命令详解

```bash
mvn spring-boot:run -pl gnosis-web
```

- **`spring-boot:run`**：这是 **Spring Boot Maven Plugin** 提供的 goal（目标），直接运行 Spring Boot 应用（无需打包成 jar 再运行）。
- **`-pl gnosis-web`**：`--projects` 的缩写，只在多模块项目的 `gnosis-web` 子模块中执行该命令。

这是典型的多模块（Multi-Module）项目用法。

### 5. 多模块项目结构（你正在接触的类型）

```
gnosis-parent/                  # 父模块 (packaging=pom)
├── pom.xml
├── gnosis-web/                 # 子模块1
├── gnosis-service/             # 子模块2
├── gnosis-dao/                 # 子模块3
└── ...
```

父 pom.xml 关键配置：

```xml
<modules>
    <module>gnosis-web</module>
    <module>gnosis-service</module>
</modules>

<dependencyManagement>   <!-- 统一管理版本 -->
    ...
</dependencyManagement>
```

### 6. 常用 Maven 命令速查

**基础**：

- `mvn clean` → 清空 target
- `mvn compile` → 编译
- `mvn test` → 运行测试
- `mvn package` → 打包
- `mvn install` → 安装到本地仓库
- `mvn deploy` → 发布到远程仓库

**常用参数**：

- `-DskipTests` / `-Dmaven.test.skip=true`
- `-pl module-name` 或 `-pl :artifactId`（多模块）
- `-am`（also-make）：同时构建依赖的模块
- `-U`：强制更新 SNAPSHOT 依赖
- `-o`（offline）：离线模式
- `-e`：显示详细错误
- `-X`：debug 模式
- `-B`：批处理模式（CI/CD 用）

**Spring Boot 常用**：

- `mvn spring-boot:run`
- `mvn spring-boot:run -Dspring-boot.run.profiles=dev`
- `mvn spring-boot:build-image`（构建 Docker 镜像）

### 7. Maven 插件（Plugin）

Maven 本身很轻量，功能都来自插件：

- `maven-compiler-plugin`：编译 Java 代码（Java 21 需要配置）
- `maven-surefire-plugin`：运行测试
- `spring-boot-maven-plugin`：打包可执行 jar、run 等
- `maven-jar-plugin`、`maven-war-plugin` 等

Java 21 配置示例（pom.xml）：

```xml
<properties>
    <maven.compiler.source>21</maven.compiler.source>
    <maven.compiler.target>21</maven.compiler.target>
    <java.version>21</java.version>
</properties>
```

### 8. 学习建议（针对 Java 21 + Spring Boot）

1. 掌握 `pom.xml` 基本结构（dependencies、plugins、parent）
2. 理解依赖范围（compile、test、provided、runtime）
3. 学会处理版本冲突（`mvn dependency:tree`）
4. 熟悉多模块项目
5. 推荐 IDE：IntelliJ IDEA（Maven 支持最好）

**实用命令**：

```bash
mvn dependency:tree          # 查看依赖树
mvn help:effective-pom       # 查看合并后的完整 pom
mvn versions:display-dependency-updates  # 检查依赖更新
```

---

需要我继续深入讲解哪个部分？

- POM 详细配置
- 依赖管理与冲突解决
- 多模块最佳实践
- Maven + Spring Boot 完整配置
- settings.xml 配置（镜像、私服等）

随时问，我可以给你配示例代码。
