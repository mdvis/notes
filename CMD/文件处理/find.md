`find` 是最常用的文件查找工具。直接上干货，按使用频率排序。

## 基本语法

```
find [路径] [选项] [动作]
```

## 常用选项

### 1. 按名称查找

| 选项 | 作用 | 示例 |
|------|------|------|
| `-name` | 按文件名（区分大小写） | `find . -name "*.log"` |
| `-iname` | 按文件名（不区分大小写） | `find . -iname "*.JPG"` |
| `-regex` | 正则匹配全路径 | `find . -regex ".*\.[ch]$"` |

### 2. 按类型查找

| 选项 | 作用 | 示例 |
|------|------|------|
| `-type f` | 普通文件 | `find . -type f -name "*.py"` |
| `-type d` | 目录 | `find . -type d -name "node_modules"` |
| `-type l` | 符号链接 | `find . -type l` |

### 3. 按时间查找

| 选项 | 作用 | 示例 |
|------|------|------|
| `-mtime -7` | 7 天内修改过 | `find . -mtime -7` |
| `-mtime +30` | 30 天前修改过 | `find . -mtime +30` |
| `-mmin -60` | 60 分钟内修改过 | `find . -mmin -60` |
| `-atime` / `-ctime` | 访问时间 / 状态变更时间 | 同上用法 |

> 单位：`-atime/-ctime/-mtime` 按天，`-amin/-cmin/-mmin` 按分钟。`-` 表示"内"，`+` 表示"前"。

### 4. 按大小查找

| 选项 | 作用 | 示例 |
|------|------|------|
| `-size +100M` | 大于 100MB | `find . -size +100M` |
| `-size -1k` | 小于 1KB | `find . -size -1k` |
| `-empty` | 空文件/空目录 | `find . -type f -empty` |

> 单位：`c`(字节) `k`(KB) `M`(MB) `G`(GB)。

### 5. 按权限/属主

| 选项 | 作用 | 示例 |
|------|------|------|
| `-perm 644` | 权限等于 644 | `find . -perm 644` |
| `-perm /u+w` | 用户有写权限（任一匹配） | `find . -perm /u+w` |
| `-user root` | 属主是 root | `find / -user root` |
| `-group staff` | 属组是 staff | `find . -group staff` |

### 6. 限制深度

| 选项 | 作用 | 示例 |
|------|------|------|
| `-maxdepth 2` | 最大深度 2 层 | `find . -maxdepth 2 -name "*.js"` |
| `-mindepth 2` | 最小深度 2 层 | `find . -mindepth 2 -type f` |

> 放在表达式最前面，否则会有警告。

## 动作（对找到的文件做什么）

| 动作 | 作用 | 示例 |
|------|------|------|
| `-print` | 默认，打印路径 | `find . -name "*.log" -print` |
| `-ls` | 详细列表（类似 ls -dils） | `find . -name "*.log" -ls` |
| `-delete` | 删除找到的文件 | `find . -name "*.tmp" -delete` |
| `-exec CMD {} \;` | 对每个文件执行命令 | `find . -name "*.log" -exec wc -l {} \;` |
| `-exec CMD {} +` | 批量执行（高效） | `find . -name "*.log" -exec grep ERROR {} +` |

## 逻辑组合

```bash
# 与（默认）
find . -name "*.py" -size +10k

# 或
find . -name "*.jpg" -o -name "*.png"

# 非
find . -not -name "*.log"
find . ! -name "*.log"

# 分组
find . \( -name "*.jpg" -o -name "*.png" \) -size +1M
```

## 实战高频组合

```bash
# 查找并删除 7 天前的日志
find /var/log -name "*.log" -mtime +7 -delete

# 查找大文件（按大小排序）
find . -type f -size +100M -exec ls -lh {} + | sort -k5 -h

# 排除目录（不在 node_modules 里找）
find . -name "node_modules" -prune -o -name "*.js" -print

# 批量改权限
find . -type d -exec chmod 755 {} +
find . -type f -exec chmod 644 {} +

# 找出最近的空目录
find . -type d -empty -mtime -1
```

## 几个坑

1. **`-delete` 会自动开启 `-depth`**，目录会先清空再删。但它**不能和 `-depth` 显式连用**会报错。
2. **`-exec ... \;` 对每个文件 fork 一次**，文件多时极慢。能用 `+` 就别用 `\;`。
3. **`-prune` 必须放在 `-o` 前**，否则被排除的目录照样会被遍历。
4. **`-name` 的模式匹配的是 basename**，不是全路径。要匹配路径用 `-path` 或 `-regex`。
5. **macOS 的 BSD find 和 GNU find 有差异**：BSD 版 `-regex` 默认 Basic 正则，GNU 默认 Emacs 正则。要兼容用 `-regextype` 指定。

### 📊 10 个参数难度速览表

| 排名  | 参数        | 难懂指数  | 核心坑点         | 推荐程度  |
| --- | --------- | ----- | ------------ | ----- |
| 1   | -xtype    | ★★★★★ | 符号链接 + -L 组合 | 最高    |
| 2   | -L/-H/-P  | ★★★★★ | 全局生效         | 必学    |
| 3   | -prune    | ★★★★☆ | 必须配 -o       | 日常    |
| 4   | -samefile | ★★★★☆ | inode 而非路径   | 强烈推荐  |
| 5   | -printf   | ★★★★  | % 格式符太多      | 高级输出  |
| 6   | -execdir  | ★★★☆  | 安全 vs -exec  | 安全优先  |
| 7   | -newerXY  | ★★★☆  | X/Y 组合       | 时间搜索  |
| 8   | -links    | ★★★   | 只对硬链接        | 硬链接专用 |
| 9   | -inum     | ★★★   | 数字难获取        | 少用    |
| 10  | -xdev     | ★★☆   | 跨文件系统        | 全盘必加  |