## 概念
- 字节码：java 编译后的中间代码格式，平台无关，jvm，class 形式存在
- 机器码：CPU 理解的二进制指令，硬件相关，执行快，不同平台机器码不同
- 即时编译：将执行最频繁的字节码序列转换成机器码称为即时编译
- JDK 编写 java 时，使用的程序 java development kit
- JRE 运行 java 时，使用的程序 java runtime environment
- SE 标准版 standard editor
- ME 微型版 micro editor
- EE 企业版 enterprise editor
- SJRE server jre
- openJDK java SE 免费开源实现
- java FX 图形化界面备选工具包
- 过时术语 
	- java2 98-06
	- sdk software development kit 98-06
## 数据类型
```java
int score; // 变量
final int score; // 常量
```
### 基本类型（8个）
`int/short/long/byte/float/double/char/boolean`

```
100l
100L
3.14f
3.14F
0.0d
'A'
```

- 整型
	1. int           4b    -2,147,483,648 ~ 2,147,483,647
	2. short      2b     -32,768 ~ 32,767
	3. long        8b    -9,223,372,036,854,775,808 ~  9,223,372,036,854,775,807
	4. byte        1b     -128 ~ -127
- 浮点
	1. float        4b      有效数字 6-7 位
	2. double    8b      有效数字 15 位
- char 单个字符，但有的 Unicode 字符需要两个 char
	 1. char 类型的字面量要用单引号括起来，如 'A' 编码值为 65 的字符常量，"A" 表示一个字符 A 的字符串
	 2. char 可以表示十六进制值，`\u0000 - \uFFFF`
	 3. `\b` 退格     `\u0008`
	 4. `\t` 制表     `\u0009`
	 5. `\n` 换行     `\u000a`
	 6. `\r` 回车     `\u000d`
	 7. `\"` 双引号 `\u0022`
	 8. `\'` 单引号 `\u0027`
	 9. `\\` 反斜杠 `\u005c`
- boolean
```
10       // int
4000000l // long
4000000L // long
010      // 8进制
0x10     // 16进制
0b1001   // 2进制
0B1001   // 2进制
100_100  // 下划线可以做分割，编译器会去除
```
### 数组
```java
// 定长
new int[5];
{1,2,3}
```
### 集合
集合分为两大体系：Collection（单一元素）和 Map（键值对）
- List：有序可重复，继承自 Collection 接口，是其子接口
	- ArrayList：基于动态数组，查询快，增删慢(涉及扩容和位移)
	- LinkedList：基于双向链表，查询慢，增删快
		- Queue:FIFO，继承自 Collection 接口，是其子接口
			- PriorityQueue：优先级队列
```java
new ArrayList<>(); // add()
Arrays.asList(...) //  j8+,长度固定不能执行 add，remove
List.of(...) // j9+, 推荐方式，完全不可变长度元素均不能改，不允许 null 元素
```
- Set：无序不可重复，继承自 Collection 接口，是其子接口
	- HashSet：基于哈希表，存取最快无序
	- TreeSet：基于红黑树，元素处于排序状态
	- LinkedHashSet：维护插入顺序
```java
new HashSet<>(); //add()
Set.of(...); // j9+,推荐方式，不可变集合，元素不能重复，不能有 null
new HashSet<>(list) // 列表转集合，去重
```
```java

```
- Map：键值对存储，不继承 Collection 接口
	- HashMap：最常用 Map，允许 null 键和 null 值，无序
	- TreeMap：基于红黑树实现，键处于自然排序或指定比较器排序状态
	- Hashtable：古老线程安全类，现在通常用 ConcurrentHashMap 代替
	- LinkedHashMap：维护键值对的插入顺序
```java
new HashMap<>(); // put 方法
Map.of(...); // j9+,适用少量数据最多 20 个变量（10 个键值对）k:v 不可变
Map.ofEntries(entry(k,v)[,...]) // j9+,较多数据
new HashMap<>(){{put(k,v)[,...]}} // 匿名内部类，不推荐
```

经常增删改用 `new ArrayList<>();new HashSet<>();new HashMap<>()`
只读常量集合 `List.of();Set.of();Map.of();`
#### 线程安全问题
大部分基础集合类都是**非线程安全**的。如果需要在多线程环境下使用，可以使用：
1. `Collections.synchronizedList()` 等包装方法。
2. **JUC (java.util.concurrent) 包**：如 `ConcurrentHashMap`, `CopyOnWriteArrayList`。
## 控制流程
- if-else 同 js
- switch-case 同 js
- for 同 js
- while 同 js
- do-while
- for-each `for (<type> <var>:<obj>){}` 直接取元素没有索引概念
```java
for (int score : scores){
	System.out.println(score);
}
```
## 异常处理
所有异常均继承自`java.lang.Throwable`类，分为 `Error`（严重问题，通常无法处理）和 `Exception`（可处理的问题；Checked Exception 受检异常；Unchecked Exception/RuntimeException 运行时异常）
- try-catch-finally
- throw 手动抛出异常
- throws 在方法签名上声明该方法可能抛出的异常，交给调用者处理
**try-with-resources** 任何实现了 `AutoCloseable` 接口的类，只要在 `try(...)` 的括号中被声明和初始化，**在 `try` 代码块执行完毕后（无论是有异常退出还是正常结束），Java 都会自动调用该资源的 `close()` 方法。**
下面是 try-with-resources 实例
```java
try (FileWriter fw = new FileWriter("test.txt")) {
    fw.write("Hello");
} catch (IOException e) {
    e.printStackTrace();
} // fw 自动关闭，无需写 finally

// 支持多个资源，‘；’分隔
try (FileReader fr = new FileReader("input.txt");
     FileWriter fw = new FileWriter("output.txt")) {
    // 业务逻辑
} catch (IOException e) {
    // 异常处理
} // 先关闭 fw，再关闭 fr
```
## OOP
- 类：一个蓝图或模版，定义行为和属性
- 对象：类的实例
### 封装
隐藏细节，保护数据
- private
- public
- getter/setter
### 继承
代码复用
- extends
### 多态
一个接口，多种形态;@Override，接口引用指向子类对象
- 编译时多态：方法重载，方法名相同参数不同
- 运行时多态：方法重写，子类覆盖父类方法
### 抽象
关注做什么，不关注怎么做
- interface
- obstract class
## 泛型
参数化类型；可用于类、接口和方法上；常用标识 (T)ype, (E)lement, (K)ey, (V)alue.
```java
public class Box<T>{
	private T data;
	
	public void set(T data) {this.data = data;}
	public T get(){return data;}
}

Box<Integer> intBox = new Box();
intBox.set(123)
```

```java
public interface Generator<T> {
	T next()
}

public class StringGenerator implements Generator<String> {
	@Override
	public String next(){return "Hello";}
}

public class GenericGenerator implements Generator<T> {
	@Override
	public T next(){return null;}
}
```

```java
public class Util {
	public static <E> void printArray(E[] inputArray) {
		for (E element:inputArray) {
			System.out.printf("%s", element);
		}
		System.out.println();
	}
}
```

##  注解
静态元数据标签；通常分为三类
1. 编译器使用的注解（内置注解）；只在写代码和编译时有效
- `@Override`：检查是否成功重写父类方法
- `@Deprecated`：标记方法已过时，调用时会有删除线，警告‘不建议使用’
- `@SuppressWarnings`：让编译器闭嘴，忽略特定警告信息
2. 元注解（meta-annotations）；用来修饰其他注解的注解
- `@Target`：定义注解可以贴在谁头上
- `@Retention`：定义注解的生命周期（编译有效还是运行期也保留）
3. 运行期留存的注解（高级框架的灵魂）
- 这类注解会被保留到程序运行的时候。框架（如 Spring Boot）利用 **反射机制（Reflection）** 去读取这些标签，从而实现类似装饰器的神奇效果。
```java
// 定义注解
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)          // 告诉编译器：这个注解只能贴在方法上
@Retention(RetentionPolicy.RUNTIME)  // 告诉编译器：程序运行的时候这个标签也要留着
public @interface AdminOnly {
    String reason() default "此操作需要管理员权限"; // 注解可以带属性
}

// 使用注解
class UserService {
    public void viewProfile() {
        System.out.println("普通用户：查看个人资料。");
    }

    @AdminOnly(reason = "删库跑路太危险，必须是管理员！") // 贴上我们的自定义标签
    public void deleteDatabase() {
        System.out.println("管理员：成功删除数据库。");
    }
}

// 反射机制
import java.lang.reflect.Method;

public class SecurityCheck {
    public static void main(String[] args) throws Exception {
        UserService service = new UserService();
        
        // 假设当前登录的用户是普通用户 "Jack"
        String currentUserRole = "NORMAL_USER"; 

        // 模拟执行 deleteDatabase 方法前的权限拦截
        Method method = UserService.class.getMethod("deleteDatabase");

        // 检查这个方法上是否贴了 @AdminOnly 标签
        if (method.isAnnotationPresent(AdminOnly.class)) {
            if (!"ADMIN".equals(currentUserRole)) {
                // 读取标签里写着的理由
                AdminOnly annotation = method.getAnnotation(AdminOnly.class);
                System.out.println("【权限拦截】拒绝访问！原因: " + annotation.reason());
            } else {
                service.deleteDatabase();
            }
        }
    }
}

// 伪装饰器
@RestController
public class OrderController {

    @Autowired
    private OrderService orderService;

    // @LogExecutionTime 是框架/我们自定义的运行时注解
    // 只要贴上它，Spring 就会在后台悄悄把这个方法包装起来（类似装饰器）
    // 在方法执行前记录时间，执行后计算差值并打印日志
    @GetMapping("/createOrder")
    @LogExecutionTime 
    public String createOrder() {
        orderService.doSomeHeavyLyfting(); // 模拟耗时业务
        return "订单创建成功！";
    }
}
```
###  ElementType（决定注解能贴在哪里）
`ElementType` 是一个枚举类，它定义了注解可以应用在 Java 源代码的哪些语法部位。如果你试图把注解贴在未允许的地方，编译器会直接报错。
常用的取值包括：
- **`ElementType.TYPE`**：可以贴在 **类、接口（包括注解类型）或枚举声明** 上。
- **`ElementType.METHOD`**：可以贴在 **方法** 上（最常用，比如 `@Override`、Spring 的 `@GetMapping`）。
- **`ElementType.FIELD`**：可以贴在 **成员变量（属性）** 上（包括枚举常量）。
- **`ElementType.PARAMETER`**：可以贴在 **方法参数** 上。
- **`ElementType.CONSTRUCTOR`**：可以贴在 **构造方法** 上。
- **`ElementType.LOCAL_VARIABLE`**：可以贴在 **局部变量** 上。
```java
import java.lang.annotation.ElementType;
import java.lang.annotation.Target;

// 限制这个注解只能贴在 类/接口 上，或者 方法 上
@Target({ElementType.TYPE, ElementType.METHOD}) 
public @interface MyWebTag {
    String value();
}

// 使用场景：
@MyWebTag("Controller级") // 正确：TYPE 允许贴在类上
class OrderController {

    @MyWebTag("Method级")   // 正确：METHOD 允许贴在方法上
    public void save() {}

    // @MyWebTag("Field级")  // ❌ 错误：编译报错！因为没有指定 ElementType.FIELD
    private String orderId;
}
```
### RetentionPolicy（决定注解能活多久）
`RetentionPolicy` 同样是一个枚举类，它定义了注解的 **生命周期（留存策略）**。Java 程序的生命周期会经历：`源码 (Source) -> 字节码 (Class) -> 内存运行 (Runtime)` 三个阶段。
它只有三个取值，对应这三个阶段：
### ① `RetentionPolicy.SOURCE`（只活在源码阶段）
- **特性**：注解只保留在 `.java` 源码文件中。当编译器把源码编译成 `.class` 字节码文件时，这个注解就会被**彻底抹去**。
- **用途**：纯粹给**编译器**看，用来做语法检查或代码生成。
- **经典代表**：`@Override`、`@SuppressWarnings`。
### ② `RetentionPolicy.CLASS`（活到字节码阶段 —— 默认选项）
- **特性**：注解会被编译器记录在 `.class` 字节码文件中。但是，当 JVM（虚拟机）加载这个字节码文件到内存中运行时，JVM **不会**把它读入内存。
- **用途**：给**编译工具**或**类加载器**做静态分析。通常在底层字节码处理工具（如 ASM、AspectJ）中才会用到，普通业务开发极少手动指定它。
### ③ `RetentionPolicy.RUNTIME`（活到运行阶段 —— 最常用）
- **特性**：注解不仅会被编译进 `.class` 文件，在程序运行期间，JVM 也会将它加载并保留在内存中。
- **用途**：可以通过 **反射机制（Reflection）** 在程序运行的时候动态读取注解的信息。
- **经典代表**：Spring 框架中几乎所有的注解（如 `@Service`、`@Autowired`）、所有的权限拦截标签。
```java
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

@Retention(RetentionPolicy.RUNTIME) // 告诉 JVM：程序运行的时候这个标签也要留着
public @interface AuthCheck {
    String role() default "USER";
}
```

| **元注解**                               | **核心解决的问题**           | **常见搭配示范**                         |
| ------------------------------------- | --------------------- | ---------------------------------- |
| **`@Target(ElementType.xxx)`**        | **Where**：这个标签能贴在哪？   | 方法（`METHOD`）、属性（`FIELD`）、类（`TYPE`） |
| **`@Retention(RetentionPolicy.xxx)`** | **When**：这个标签能活到什么时候？ | 编译完就丢（`SOURCE`）、运行期还能读（`RUNTIME`）  |
```
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface 你的自定义注解 { ... }
```