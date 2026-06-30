**文章总结：《你不知道的关于索引的那些事》**

**作者**：Jon Charter
**发布日期**：2026年4月15日
**原文链接**：https://jon.chrt.dev/2026/04/15/things-you-didnt-know-about-indexes.html

### 1. 索引基础概念（教科书类比）

文章用教科书后面的索引来比喻数据库索引：

- 查“Phosphorus”（磷）时，不用翻整本书，直接看索引找到页码。
- 数据库中，对 `pokemon` 表的 `name` 列建索引后，数据按顺序排序，支持**二分查找**，避免全表扫描。
- 示例表：`pokemon(id, name, type_1, type_2, generation, is_legendary, base_attack)`。
- Postgres 默认用 **B-tree**（B树）实现索引。

**没有索引**时，查询 `WHERE name = 'Pikachu'` 必须逐行扫描（Seq Scan），数据量一大就极慢。

### 2. 索引的代价（为什么不能乱建）

索引提升读性能，但代价很高：

- **写操作变慢**：每次 `INSERT`、`UPDATE`、`DELETE` 都要同步更新索引，多索引时开销成倍增加。
- **存储开销**：索引也占磁盘和内存空间，表有8个索引就等于要维护9份缓存。
- **查询计划开销**：优化器要评估更多选项，简单查询的规划时间甚至可能超过执行时间。

### 3. 为什么你的索引经常“不起作用”

即使建了索引，也可能被浪费：

#### 复合索引（多列索引）非常在意顺序

```sql
CREATE INDEX ON pokemon (type_1, type_2);
```

- 索引先按 `type_1` 排序，再按 `type_2` 排序。
- 支持：`WHERE type_1 = 'Fire'` 或 `WHERE type_1 = 'Fire' AND type_2 = 'Flying'`。
- **不支持**：单独查 `WHERE type_2 = 'Flying'`（因为“Flying”散落在不同 `type_1` 下，无法利用排序）。
- 建议：如果经常单独查 `type_2`，就单独再建一个索引。

#### 函数会彻底破坏索引

```sql
WHERE lower(name) = 'pikachu'   -- 无法使用 name 上的索引！
```

- 索引是基于原始列建的，函数/计算后就无法利用排序。
- 隐式类型转换（如 `text` 与 `integer` 比较）也会触发同样问题。
- **解决办法**：建**表达式索引**（见下文）。

**诊断方法**：用 Postgres 的 `EXPLAIN` / `EXPLAIN ANALYZE` 查看执行计划：

- 显示 `Index Scan` → 用了索引
- 显示 `Seq Scan` → 全表扫描（索引没起作用）

### 4. 你可能不知道的高级索引类型

#### ① 函数索引（Functional / Expression Index）

直接索引**计算结果**：

```sql
CREATE INDEX ON pokemon (lower(name));           -- 区分大小写搜索
CREATE INDEX ON pokemon ((base_attack * 2));     -- 索引计算值
CREATE INDEX ON users ((created_at::date));      -- 只索引日期部分
```

注意：滥用函数索引可能是设计坏味道，考虑直接存转换后的值。

#### ② 部分索引（Partial Index）

只索引**满足特定条件的行**，体积小、维护成本低。
示例（传说宝可梦只占8%）：

```sql
CREATE INDEX ON pokemon (name) WHERE is_legendary = true;
```

- 查询 `WHERE is_legendary = true` 时极快。
- 另一经典用途：`WHERE deleted_at IS NULL`（不索引已软删除的数据）。

#### ③ 覆盖索引（Covering Index / Index Only Scan）

索引里包含查询需要的所有列，无需回表查原表。

- Postgres 用 `INCLUDE` 关键字实现：

```sql
CREATE INDEX ON pokemon (name) INCLUDE (base_attack);
```

- 查询 `SELECT name, base_attack WHERE name = 'Pikachu'` 可直接从索引拿数据。
- 额外好处：可把无法做 B-tree key 的类型（如 `box`）放进 `INCLUDE`，或在唯一索引里附加列而不影响唯一性。

（文章中作者补充更正：`INCLUDE` 并不直接提升写速度，主要解决“无法做 key 的列”和“唯一索引附加列”的场景。）

### 5. 总结与建议

- 索引是性能优化的利器，但**过度索引**会严重拖累写入和存储。
- 关键在于**正确设计**：注意复合索引顺序、避免函数破坏索引、善用部分索引和覆盖索引。
- 永远用 `EXPLAIN` 验证索引是否真的被使用。
- 推荐深入学习资源：《Use The Index, Luke》（https://use-the-index-luke.com/）

这篇文章用 Pokémon 表作为贯穿始终的例子，讲解得非常接地气，适合对 Postgres 索引有基础但想进阶的开发者阅读。核心观点是：**索引不是越多越好，而是要“用对地方”**。
