信号是一种简单且轻量级的进程间通信形式。是一种单向通知。可是是内核发给进程，一个进程发给另一个进程，一个进程发送给自己。
## 一些重要信号

| 信号名称    | 信号值 | 行为                                          |
| ------- | --- | ------------------------------------------- |
| SIGHUP  | 1   | 重启（Hang up or shut down and restart process |
| SIGINT  | 2   | 中断`<C-c>`                                   |
| SIGQUT  | 3   | 退出`<C-\>`                                   |
| SIGKILL | 9   | 强制终止                                        |
| SIGTERM | 15  | 终止，终端正常终止                                   |
| SIGCONT | 18  | 继续`fg/bg`                                   |
| SIGSTOP | 19  | 暂停`C-z`                                     |
| SIGTSTP | 20  |                                             |
*   1-31 31 个标准信号，命名是以“SIG”+后缀的形式
*   32-64 33 个实时信号，是以“SIGRTMIN+`<number>`"
## dd 执行进度
方法一：
```shell
watch -n 5 pkill -USR1 ^dd$
```
方法二：
```shell
watch -n 5 killall -USR1 dd
```
方法三：
```shell
# mac 用-INFO，linux 用 -USR1
while killall -USR1 dd; do sleep 5; done
```
方法四：
```shell
while (ps auxww |grep " dd " |grep -v grep |awk '{print $2}' |while read pid; do kill -USR1 $pid; done) ; do sleep 5; done
```
上述四种方法中使用三个命令：pkill、killall、kill向dd命令发送SIGUSR1信息，dd命令进程接收到信号之后就打印出自己当前的进度。