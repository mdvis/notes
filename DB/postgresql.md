# 基础操作
## 建立连接
接入PostgreSQL数据库:
```bash
# 不指定库名默认打开 postgres
psql -h IP地址 -p 端口 -U 用户名 数据库名
psql -h 服务器 -U 用户名 -d 数据库 -p 端口地址
# 快速登录(全部使用默认设置)
psql -U postgres
```
## 字符集
-  `\encoding utf-8` 设置客户端字符集为 utf-8
-  `\encoding` 显示客户端的字元集
- `show client_encoding;` 显示客户端的字元集 
- `show server_encoding;` 显示服务器的字元集
## 访问数据库
1. 列举数据库：`\l`
2. 选择数据库：`\c 数据库名`
3. 切换数据库：`\c interface`
4. 查看某个库中某个表的记录：`select * from apps limit 1;`
5. 显示字符集：`\encoding`
6. 重设用户密码：`\password <user>`
7. 显示当前数据库和连接信息`\conninfo`
8. 精细显示SQL命令中的select命令的使用方：`\h select`
9. 退出psgl：`\quit` `\q`
10. 进入记事本sql脚本编辑状态`\e`
11. 提示用户设定内部变数`\prompt \[文本\] 名称`
12. 将aaa.sql导入(到当前数据库)`\i aaa.sql`
13.  获取版本信息`select version();` 
14. 删除用户`drop User 用户名` 
15. 获取系统用户信息 `select usename from pg_user;` 
16. 查看某一存储过程`\df+ name`
17. 查看所有存储过程（函数）`\df` 
18. 查看索引(要建立关联)`\di`
19. 显示所用用户：`\du`
20. 查看该某个库中的所有表：`\dt`
21. 查看某个库中的表或某个表的结构：`\d 表名` `\d 库名`
22. `\df <t|i|s|v|S|u>`
	- t 表
	- i 索引
	- s
	- v 视图
	- u 用户
	- V
	- f 存储过程

---

- 列出所有表名的查询语句
```
SELECT tablename FROM pg_tables WHERE tablename NOT LIKE 'pg%' AND tablename NOT LIKE 'sql_%' ORDER BY tablename;
```
- 列出表中所有的数据
```
SELECT * FROM someTable;
```
- 执行外部脚本
`\i` 命令用于执行一个外部的sql脚本文件。
```
psql - U postgres; 
\i /root/db. sql
```
- 导出数据库为外部的脚本
```
pg_dump -U postgres -C -f db.sql database
```
- postgresql 插入16进制数
```
INSERT INTO tableAAA VALUES( x'0001f' : : integer, '鉴权' , 'Authority' )
```
## 导出
```
pg_dump -h HOST -U USERNAME DBNAME(缺省时与用户名相同) > FILENAME
```
*  `-h`
*  `-U`
*  `-p`
*  `-Fp`
*  `-Fc`
*  `-Ft`
*  `-Z`
*  `-t` 表名，导出表
*  `-v`
## 导入
```
psql -U USERNAME DBNAME < FILENAME
```