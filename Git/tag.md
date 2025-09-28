# tag
列印 git tag 列印匹配指定模式的tag git tag -l 'v1.2.\*' 含附注的tag git tag -a\[nnotated\] -m 'comment' -a指定标签名-m指定标签说明 查看标签信息 git show 签署(GPG)标签 git tag -s\[igned\] -m 'comment' 轻量级tag git tag 验证(GPG签署)标签 git tag -v\[erify\] 后期加注标签(早先的提交) git tag -a 分享标签(上传 git push origin #指定标签# git push origin --tags #所有标签# 删除tag git tag -d git push origin :refs/tags/ git push origin --delete tag #1.7之后#

恢复已删除tag
--------

首先, 需要找到无法访问的标签 (unreachable tag):
----------------------------------

$ git fsck --unreachable | grep tag

记下这个标签 (tag) 的 hash，然后用 Git 的 update-ref:
-----------------------------------------

$ git update-ref refs/tags/