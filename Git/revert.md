```
git revert -n <commit-hash>
git revert -m <parent-number> <merge-commit>
git revert --strategy=ours <commit-hash>
```
- -n, --no-commit 咱不提交撤销结果，允许提交前修改内容
- -m, --mainline 撤销合并提交。合并提交有两个父提交，指定以哪个为基准撤销
	- parent-number=1 主分支
	- parent-number=2 从分支
- --strategy 指定合并策略。
	1. Fast-forward：直接把当前分支指针前移到被合并分支的最新提交，不产生合并提交，仅适用于目标分支无新提交、历史完全线性的场景。
	2. Recursive（含 ort）：通过寻找共同祖先进行三路合并并生成新的合并提交，可处理重命名与复杂拓扑，是日常多人协作、存在分叉历史时的默认首选。
	    1. ort: recursive 的升级版，算法相同但性能更高，尤其在大仓库、大量重命名场景。2.33 以后代替 Recursive 成为默认
	3. Resolve：与 Recursive 类似但功能简化，只做基本三路合并，不处理重命名，适合早期 Git 版本或仅两分支且结构简单的临时合并。
	4. Octopus：一次性把三个及以上分支合并成一个合并提交，常用于 CI 或发布流程中需要同时集成多个特性分支的场景。
	5. Ours：假装合并成功但完全保留当前分支内容、丢弃对方更改，用于需要保留历史却忽略对方全部修改的特殊整合场景。
	6. Theirs：与 ours 相反，结果完全采用被合并分支内容而丢弃当前分支修改，适用于快速回退或强制替换当前分支的极端需求。
	7. Subtree：把另一个仓库的整个历史并入当前仓库的指定子目录，适合将外部项目作为子模块或子树长期维护的场景。
- --abort
- --continue