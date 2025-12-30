我帮你把内容**结构化、排版清晰**，顺便把零散的说明补全成一份**可直接当速查表的 Git tag 使用说明**。

---

## Git tag 常用操作整理

### 一、查看标签

- **列出所有标签**
    

```bash
git tag
```

- **列出匹配指定模式的标签**
    

```bash
git tag -l 'v1.2.*'
```

---

### 二、创建标签

#### 1️⃣ 附注（Annotated）标签（推荐）

- 创建附注标签
    

```bash
git tag -a <tag_name> -m "comment"
```

说明：

- `-a`：指定创建附注标签
    
- `-m`：标签说明信息
    
- 查看标签详细信息
    

```bash
git show <tag_name>
```

#### 2️⃣ GPG 签署标签

- 创建 GPG 签署的标签
    

```bash
git tag -s <tag_name> -m "comment"
```

---

#### 3️⃣ 轻量级（Lightweight）标签

```bash
git tag <tag_name>
```

说明：

- 不包含额外信息
    
- 只是某个提交的引用指针
    

---

### 三、验证标签（GPG）

```bash
git tag -v <tag_name>
```

---

### 四、给历史提交打标签

```bash
git tag -a <tag_name> <commit_hash> -m "comment"
```

---

### 五、分享（推送）标签到远程

- **推送指定标签**
    

```bash
git push origin <tag_name>
```

- **推送所有标签**
    

```bash
git push origin --tags
```

---

### 六、删除标签

#### 1️⃣ 删除本地标签

```bash
git tag -d <tag_name>
```

#### 2️⃣ 删除远程标签

- 旧方式：
    

```bash
git push origin :refs/tags/<tag_name>
```

- Git 1.7+ 推荐方式：
    

```bash
git push origin --delete <tag_name>
```

---

### 七、恢复已删除的标签

#### 1️⃣ 找到无法访问（unreachable）的标签对象

```bash
git fsck --unreachable | grep tag
```

记录输出中的 **tag hash**。

#### 2️⃣ 通过 `update-ref` 恢复标签

```bash
git update-ref refs/tags/<tag_name> <tag_hash>
```

---

## 建议实践（经验总结）

- **发布版本时优先使用附注标签**
    
- **团队协作时务必推送标签**
    
- **重要发布使用 GPG 签署标签**
    
- **删除远程标签要非常谨慎**
    

如果你需要，我可以帮你整理成 **Markdown 版本 / 一页速查表 / 加上常见场景示例**。