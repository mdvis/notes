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