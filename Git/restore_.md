`git restore` 是 Git 2.23 版本引入的新命令，主要用于恢复工作树中的文件，还能操作暂存区。
常用选项的详细介绍：
## 操作暂存区相关选项
### `--staged`
- **功能**：该选项用于将指定文件从暂存区中移除，也就是撤销之前的 `git add` 操作，但不会影响工作目录中的文件内容。
- **示例**：若要撤销 `example.txt` 文件的 `git add` 操作，可执行以下命令： ```bash git restore --staged example.txt ``` 
- **解释**：执行此命令后，`example.txt` 文件将从暂存区移除，但工作目录中的 `example.txt` 文件内容不会改变。 
### `--worktree`（默认）
- **功能**：用于恢复工作目录中文件的内容。如果指定了某个提交或文件版本，工作目录中的文件会被恢复到该版本的状态。
- **示例**：将 `example.txt` 文件恢复到上一次提交时的状态： ```bash git restore example.txt ``` 这里省略了 `--worktree`，因为它是默认选项。
- **解释**：执行该命令后，`example.txt` 文件在工作目录中的内容会被恢复为上一次提交时的内容，未提交的更改将丢失。 
## 指定恢复版本相关选项 
### `-s` 或 `--source`
- **功能**：指定恢复文件内容的源版本，可以是提交哈希、分支名、标签名等。 
- **示例**：将 `example.txt` 文件恢复到 `feature-branch` 分支上的版本： ```bash git restore -s feature-branch example.txt ``` 
- **解释**：此命令会把工作目录中的 `example.txt` 文件内容替换为 `feature-branch` 分支上该文件的内容。 
### `-SWITCH` 或 `--switch`
- **功能**：用于切换分支并更新工作目录。它会检查当前分支是否有未提交的更改，如果没有则切换到指定分支，并将工作目录更新为该分支的状态。 
- **示例**：从当前分支切换到 `new-feature` 分支： ```bash git restore --switch new-feature ``` 
- **解释**：执行该命令后，HEAD 会指向 `new-feature` 分支，工作目录也会更新为 `new-feature` 分支上文件的状态。 
## 交互式操作选项 
### `--patch` 
- **功能**：以交互式的方式选择要恢复的文件更改块。它会逐块显示文件的更改，让你可以选择是否恢复每一块更改。 
- **示例**：交互式地恢复 `example.txt` 文件的部分更改： ```bash git restore --patch example.txt ``` 
- **解释**：执行该命令后，Git 会逐块显示 `example.txt` 文件的更改，你可以通过按不同的键（如 `y` 表示恢复，`n` 表示不恢复）来选择是否恢复每个更改块。 
## 强制操作选项 
### `--force`
- **功能**：当存在冲突或有未提交的更改时，默认情况下 `git restore` 可能会拒绝操作。使用 `--force` 选项可以强制进行恢复操作，即使有未提交的更改也会被覆盖。 
- **示例**：强制将 `example.txt` 文件恢复到上一次提交时的状态： ```bash git restore --force example.txt ``` 
- **解释**：此命令会忽略工作目录中 `example.txt` 文件的未提交更改，直接将其恢复为上一次提交时的内容。