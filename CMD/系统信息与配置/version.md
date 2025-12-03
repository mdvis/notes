## /etc/issue
## /etc/issue.net
## /etc/os-release
## uname
* `-a, --all`
* `-s, --kernel-name`
* `-n, --nodename`
* `-r, --kernel-release`
* `-v, --kernel-version`
* `-m, --machine`
* `-p, --processor`
* `-i, --hardware-platform`
* `-o, --operating-system`
* `--help`
* `--version`
## /proc/version
## dmesg
kernel 会将开机信息存储在 ring buffer 中。您若是开机时来不及查看信息，可利用 dmesg 来查看。开机信息亦保存在 /var/log 目录中，名称为 dmesg 的文件里。
* `-c` 显示信息后清除 ring buffer 中的内容。
* `-n` 设置记录信息的层级
* `-s` <缓冲区大小> 预设为 8196，刚好等于 ring buffer 的大小