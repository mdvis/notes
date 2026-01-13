好问题，这正是 **git 从“能用”到“好用”**的分水岭 😄  
我按**从常用到进阶**给你一套「精细控制 git stage（暂存区）」的完整打法。

---

## 一、最核心：`git add -p`（必学）

👉 **逐块（hunk）选择要 stage 的改动**

```bash
git add -p
```

Git 会把一个文件拆成多个 _hunk_，然后问你：

```
Stage this hunk [y,n,q,a,d,s,e,?]?
```

常用选项：

|键|含义|
|---|---|
|`y`|stage 当前块|
|`n`|不 stage|
|`s`|再拆分（超好用）|
|`e`|手动编辑（核武器级）|
|`q`|退出|
|`a`|后面全部 stage|
|`d`|后面全部不 stage|

📌 **典型场景**

> 一个文件里既有重构，又顺手改了个 bug  
> → 用 `git add -p` 把它们拆成两个 commit

---

## 二、只 stage 某个文件的一部分

### 1️⃣ 针对单个文件

```bash
git add -p path/to/file
```

### 2️⃣ 用 GUI（强烈推荐）

```bash
git gui
```

或 VS Code / JetBrains / Magit  
👉 **可视化点选行级别**，效率极高

---

## 三、撤销 / 回退 stage（反向精细控制）

### 1️⃣ 把已 stage 的内容退回工作区

```bash
git restore --staged file
# 老版本
git reset HEAD file
```

### 2️⃣ 只退回部分（hunk）

```bash
git restore --staged -p
```

---

## 四、只 stage 已追踪文件（不加新文件）

```bash
git add -u
```

或

```bash
git add --update
```

📌 常用于：

- 不想把新生成的文件误加进来
    
- 大型 repo 清理修改
    

---

## 五、跳过空白字符 / 格式化噪音

如果你 **只想 stage 逻辑变化，不要格式化**：

```bash
git add -p --ignore-whitespace
```

或 diff 时：

```bash
git diff -w
```

---

## 六、终极核武：手动编辑 hunk（`e`）

在 `git add -p` 时按 `e`，你会看到类似：

```diff
- old line
+ new line
```

👉 **你可以直接删掉不想 stage 的 `+` 行**  
⚠️ 不要破坏 diff 结构（`+ -` 不能乱）

适合：

- 同一行里混合了多个修改
    
- 自动拆分也不够细
    

---

## 七、把“精细 stage”变成日常习惯的 workflow

我推荐的 **专业级流程**：

```bash
git status
git diff        # 看整体
git add -p      # 精选
git status
git commit
```

Commit 信息自然会变得：

- 更小
    
- 更清晰
    
- 更容易 review / rebase / cherry-pick
    

---

## 八、你可能会爱上的别名（强烈建议）

```bash
git config --global alias.ap "add -p"
git config --global alias.rs "restore --staged"
```

之后：

```bash
git ap
git rs -p
```

爽。

---

## 九、一句话总结

> **git 的精髓不是 commit，而是 stage。**  
> 学会 `git add -p`，你已经是团队里 git 用得最好的人之一了。

如果你愿意，我可以：

- 给你一套 **“如何拆 commit 的思维模板”**
    
- 或对比 **CLI vs VS Code / Magit 精细 stage**
    
- 或直接帮你设计一个 **适合你当前项目的 git workflow**
    

随便点一个 👀