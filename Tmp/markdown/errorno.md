**errno 是 Unix/Linux 系统编程中用于报告错误的全局整数变量（或线程局部存储）。** 它在 `<errno.h>` 头文件中定义，由系统调用（syscall）和许多库函数在发生错误时设置。

### 1. errno 的基本使用规则

- **大多数系统调用** 出错时返回 `-1`（或 `NULL` 对于返回指针的函数），同时将 `errno` 设置为具体的错误码。
- **成功时** 通常不修改 `errno`，但规范允许成功函数也可以改变它，因此**只在明确检测到错误后** 才检查 `errno`。
- `errno` 是**线程局部**的（thread-local），多线程程序中每个线程有独立的副本。
- 错误码都是**正整数**，0 表示无错误。
- 常用辅助函数：
  - `perror(const char *s)`：打印 `s` 字符串 + 冒号 + 错误描述到 stderr。
  - `strerror(int errnum)`：返回错误码对应的字符串描述（注意非线程安全，推荐 `strerror_r`）。
  - 命令行：`errno -l`（moreutils 包）列出所有错误，或 `errno ENOENT` 查询单个。

**正确用法示例**（C 语言）：

```c
#include <errno.h>
#include <stdio.h>
#include <string.h>
#include <fcntl.h>
#include <unistd.h>

int main() {
    int fd = open("nonexistent.txt", O_RDONLY);
    if (fd == -1) {
        perror("open failed");           // 自动使用 errno
        fprintf(stderr, "Error %d: %s\n", errno, strerror(errno));
        return 1;
    }
    close(fd);
    return 0;
}
```

### 2. 标准错误码（POSIX + Linux 常用）

以下是 Linux 上最常用和 POSIX 标准定义的部分错误码（数值在不同架构/系统上可能略有差异，但符号名是标准的）。数据来源于 Linux man page 和标准头文件。

| 错误码 | 符号名           | 含义（中文解释）                    | 典型场景                           |
| ------ | ---------------- | ----------------------------------- | ---------------------------------- | ----------------- |
| 1      | **EPERM**        | 操作不被允许（权限不够）            | 非 root 用户尝试特权操作           |
| 2      | **ENOENT**       | 无此文件或目录                      | open/stat 时路径不存在             |
| 3      | **ESRCH**        | 无此进程                            | kill 不存在的 PID                  |
| 4      | **EINTR**        | 系统调用被信号中断                  | 慢调用被 SIGINT 等打断（常需重试） |
| 5      | **EIO**          | I/O 错误                            | 硬件/磁盘读写失败                  |
| 6      | **ENXIO**        | 无此设备或地址                      | 设备不存在                         |
| 7      | **E2BIG**        | 参数列表过长                        | execve 时 argv/envp 太大           |
| 8      | **ENOEXEC**      | 执行格式错误                        | 尝试执行非可执行文件               |
| 9      | **EBADF**        | 坏的文件描述符                      | 对无效 fd 操作                     |
| 10     | **ECHILD**       | 无子进程                            | wait 没有子进程                    |
| 11     | **EAGAIN**       | 资源暂时不可用（重试）              | 非阻塞 socket、锁、fork 资源限     |
| 12     | **ENOMEM**       | 内存不足                            | malloc / mmap 失败                 |
| 13     | **EACCES**       | 权限被拒绝                          | 没有读/写/执行权限                 |
| 14     | **EFAULT**       | 坏地址（用户空间指针无效）          | 传递非法指针给 syscall             |
| 15     | **ENOTBLK**      | 需要块设备                          | 某些操作要求块设备                 |
| 16     | **EBUSY**        | 设备或资源忙                        | 设备已被占用                       |
| 17     | **EEXIST**       | 文件已存在                          | O_CREAT                            | O_EXCL 时文件存在 |
| 18     | **EXDEV**        | 跨设备链接                          | rename 跨文件系统                  |
| 19     | **ENODEV**       | 无此设备                            | 设备驱动未加载                     |
| 20     | **ENOTDIR**      | 不是目录                            | 在非目录上用 mkdir 等              |
| 21     | **EISDIR**       | 是目录                              | 尝试对目录做写操作（如 write）     |
| 22     | **EINVAL**       | 无效参数                            | 参数值非法（如负数长度）           |
| 23     | **ENFILE**       | 系统打开文件数达到上限              | 全局文件表满                       |
| 24     | **EMFILE**       | 进程打开文件数达到上限              | ulimit -n 限制                     |
| 25     | **ENOTTY**       | 不是 tty 设备                       | ioctl 用于非终端                   |
| 26     | **ETXTBSY**      | 文本文件忙（正在执行）              | 修改正在运行的二进制               |
| 27     | **EFBIG**        | 文件太大                            | 超过文件大小限制                   |
| 28     | **ENOSPC**       | 设备无剩余空间                      | 磁盘满                             |
| 29     | **ESPIPE**       | 非法 seek（管道/ socket 不能 seek） | lseek 用于 pipe                    |
| 30     | **EROFS**        | 只读文件系统                        | 尝试写只读分区                     |
| 31     | **EMLINK**       | 链接数过多                          | 硬链接太多                         |
| 32     | **EPIPE**        | 管道破裂（写端已关闭）              | 写已关闭读端的 pipe                |
| 35     | **EWOULDBLOCK**  | 操作会阻塞（同 EAGAIN）             | 非阻塞模式                         |
| 36     | **EINPROGRESS**  | 操作正在进行                        | 非阻塞 connect                     |
| 37     | **EALREADY**     | 操作已在进行                        | 重复 connect                       |
| 38     | **ENOTSOCK**     | 不是 socket                         | 对普通 fd 用 socket 操作           |
| 39     | **EDESTADDRREQ** | 目标地址未指定                      | sendto 未给地址                    |
| ...    | ...              | ...                                 | ...                                |

**网络相关常见**（继续增加）：

- **ECONNRESET** (104)：连接被对端重置
- **ETIMEDOUT** (110)：连接超时
- **ECONNREFUSED** (111)：连接被拒绝
- **EHOSTUNREACH** (113)：主机不可达
- **EADDRINUSE** (98)：地址已被使用（端口被占）

**更多**：Linux 实际定义了 100+ 个错误码，可用 `errno -l` 查看完整列表。

### 3. 编程注意事项

- **EINTR 处理**：很多慢系统调用（如 read、write、wait）被信号中断后返回 EINTR，**通常需要循环重试**。
- **线程安全**：errno 是 thread-local 的，但 `strerror` 不是；生产环境用 `strerror_r`。
- **不要依赖具体数值**：不同系统/架构数值可能不同，**始终使用符号名**（EPERM、ENOENT 等）。
- **自定义错误**：用户程序可以设置 `errno = XXX;` 后调用 perror，但最好只用于和系统一致的错误。
- **C++**：推荐 `<system_error>`（std::error_code），但底层仍是 errno。

### 4. 参考资源

- Linux man page：`man 3 errno`、`man 2 intro`
- POSIX 标准：`<errno.h>`
- 命令：`errno -l` 或 `errno -s "permission"`

掌握 errno 是 Unix/Linux 系统编程的基础，几乎所有 syscall 错误处理都围绕它展开。实际开发中结合 `perror`/`strerror` 和具体 syscall 的 man page 就能快速定位问题。
