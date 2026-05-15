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
### 基本类型（8个）
`int/short/long/byte/float/double/char/boolean`
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
### 集合
集合分为两大体系：Collection（单一元素）和 Map（键值对）
- List：有序可重复，继承自 Collection 接口，是其子接口
	- ArrayList：基于动态数组，查询快，增删慢(涉及扩容和位移)
	- LinkedList：基于双向链表，查询慢，增删快
- Set：无序不可重复，继承自 Collection 接口，是其子接口
	- HashSet：基于哈希表，存取最快无序
	- TreeSet：基于红黑树，元素处于排序状态
	- LinkedHashSet：维护插入顺序
- Queue:FIFO，继承自 Collection 接口，是其子接口
	- PriorityQueue：优先级队列
- Map：键值对存储，不继承 Collection 接口
	- HashMap：最常用 Map，允许 null 键和 null 值，无序
	- TreeMap：基于红黑树实现，键处于自然排序或指定比较器排序状态
	- Hashtable：古老线程安全类，现在通常用 ConcurrentHashMap 代替
	- LinkedHashMap：维护键值对的插入顺序
#### 线程安全问题
大部分基础集合类都是**非线程安全**的。如果需要在多线程环境下使用，可以使用：
1. `Collections.synchronizedList()` 等包装方法。
2. **JUC (java.util.concurrent) 包**：如 `ConcurrentHashMap`, `CopyOnWriteArrayList`。
## 常量
`final`
## 控制流程
- if-else
- switch-case
- for
- while
- do-while
- for-each
## 异常处理
所有异常均继承自`java.lang.Throwable`类，分为 `Error`（严重问题，通常无法处理）和 `Exception`（可处理的问题；Checked Exception 受检异常；Unchecked Exception/RuntimeException 运行时异常）
- try-catch-finally
- throw 手动抛出异常
- throws 在方法签名上声明该方法可能抛出的异常，交给调用者处理
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
