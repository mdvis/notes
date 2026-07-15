## 第一部分：Nginx 基础与实战配置

### 1. Nginx 基础配置结构

#### 配置文件结构
Nginx 配置文件通常位于 `/etc/nginx/nginx.conf`，采用分层结构：

```
nginx.conf                    # 主配置文件
├── /etc/nginx/conf.d/       # 额外配置文件目录
│   ├── default.conf         # 默认站点配置
│   └── ssl.conf             # SSL配置
├── /etc/nginx/sites-enabled/ # 启用的站点配置
├── /etc/nginx/sites-available/ # 可用的站点配置
└── /var/www/                # 网站根目录
```

#### 主配置文件详解
```nginx
# 定义运行Nginx的用户和用户组
user www-data;

# 定义工作进程数，通常设置为CPU核心数
worker_processes auto;

# 定义错误日志路径和日志级别
error_log /var/log/nginx/error.log warn;

# 定义PID文件路径
pid /var/run/nginx.pid;

# 事件模块配置
events {
    # 每个工作进程的最大连接数
    worker_connections 1024;

    # 使用epoll事件模型（Linux推荐）
    use epoll;

    # 启用多连接accept
    multi_accept on;
}

# HTTP模块配置
http {
    # MIME类型定义文件
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # 日志格式定义
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    # 访问日志配置
    access_log /var/log/nginx/access.log main;

    # 基础性能配置
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip压缩配置
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # 包含其他配置文件
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
```

### 2. 虚拟主机配置

#### 基础 HTTP 虚拟主机
```nginx
server {
    listen 80;
    listen [::]:80;

    # 域名配置
    server_name example.com www.example.com;

    # 网站根目录
    root /var/www/example.com;
    index index.html index.htm index.php;

    # 访问日志
    access_log /var/log/nginx/example.com.access.log main;
    error_log /var/log/nginx/example.com.error.log;

    # 位置配置
    location / {
        try_files $uri $uri/ =404;
    }

    # 静态文件缓存
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 拒绝访问隐藏文件
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

#### HTTPS 虚拟主机配置
```nginx
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;

    server_name example.com www.example.com;

    root /var/www/example.com;
    index index.html index.htm index.php;

    # SSL证书配置
    ssl_certificate /etc/ssl/certs/example.com.crt;
    ssl_certificate_key /etc/ssl/private/example.com.key;

    # SSL安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    # HSTS安全标头
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # 其他安全标头
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;

    # 访问日志
    access_log /var/log/nginx/example.com-ssl.access.log main;
    error_log /var/log/nginx/example.com-ssl.error.log;

    location / {
        try_files $uri $uri/ =404;
    }
}

# HTTP重定向到HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name example.com www.example.com;

    return 301 https://$server_name$request_uri;
}
```

### 3. 反向代理与负载均衡

#### 简单反向代理
```nginx
server {
    listen 80;
    server_name api.example.com;

    # 反向代理配置
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 负载均衡配置
```nginx
# 定义上游服务器组
upstream backend {
    # 负载均衡算法（默认轮询）
    # least_conn;    # 最少连接
    # ip_hash;       # IP哈希

    # 服务器列表
    server 192.168.1.10:8000 weight=3 max_fails=3 fail_timeout=30s;
    server 192.168.1.11:8000 weight=2 max_fails=3 fail_timeout=30s;
    server 192.168.1.12:8000 weight=1 backup;  # 备用服务器

    # 健康检查（需要第三方模块）
    # check interval=5000 rise=2 fall=3 timeout=1000;
}

server {
    listen 80;
    server_name loadbalancer.example.com;

    location / {
        proxy_pass http://backend;
        # 代理头设置...
        
        # 连接和超时配置
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
}
```

#### PHP 处理配置
```nginx
server {
    listen 80;
    server_name example.com;

    root /var/www/example.com;
    index index.php index.html;

    # PHP文件处理
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.0-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;

        # FastCGI缓存
        fastcgi_cache_path /var/cache/nginx/fastcgi levels=1:2 keys_zone=WORDPRESS:100m inactive=60m;
        fastcgi_cache_key "$scheme$request_method$host$request_uri";
        fastcgi_cache_use_stale error timeout invalid_header http_500;
        fastcgi_cache_valid 200 60m;
        fastcgi_cache_bypass $cookie_nocache $arg_nocache;
        add_header X-FastCGI-Cache $upstream_cache_status;
    }
}
```

### 4. 特殊指令详解：try_files

`try_files` 指令按顺序检查文件是否存在，返回第一个找到的文件或文件夹（结尾加斜杠 `/` 的表示文件夹），若所有的文件或文件夹都找不到，会进行一个内部重定向到最后一个参数。

**作用：**
*   美化 URL
*   伪静态

**变量说明：**
*   `$uri`: 经过一系列内部重定向后最终的 URL
*   `$request_uri`: 请求的原始 URL（含参数），如果没有内部重定向，去掉参数后其值和 `$uri` 一致
*   `$document_uri`: 同 `$uri`

**示例表：**
| URL | 目录是否在服务上存在 | uri | request_uri |
| :--- | :--- | :--- | :--- |
| ext.com/test/ | 是 | /test/test.html | /test/ |
| ext.com/ | 是 | /index.html | / |
| ext.com/test/ | 否 | /test | /test |

**语法：**
```nginx
try_files file1 [file2 ... fileN] fallback
# 示例
try_files $uri $uri/ /index.html?$args;
try_files $uri $uri/ /index.html =404;
```

**配合 @ 符号使用：**
`@` 符号用于定义一个 Location 块，该块不能被外部 Client 所访问，只能被 Nginx 内部配置指令访问。
```nginx
error_page 400 = @fallback;
location / {
    try_files $uri @linuxhub;
}
location @linuxhub {
    proxy_pass http://www.linuxhub.org;
}
```

### 5. 高级配置（限流）

#### 速率限制
```nginx
# 定义速率限制区域
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

server {
    listen 80;
    server_name api.example.com;

    # API端点限制
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://127.0.0.1:3000;
    }

    # 登录端点限制
    location /api/login {
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://127.0.0.1:3000;
    }
}
```

#### 连接限制
```nginx
# 定义连接限制区域
limit_conn_zone $binary_remote_addr zone=addr:10m;
limit_conn_zone $server_name zone=server:10m;

server {
    listen 80;
    server_name example.com;

    # 每个IP最多10个连接
    limit_conn addr 10;
    # 整个服务器最多100个连接
    limit_conn server 100;
}
```

---

## 第二部分：Nginx 核心原理深度解析 (进阶)

本部分包含对 Nginx 变量、请求处理阶段及指令执行顺序的深度解析。

### 1. Nginx 变量漫谈

在 Nginx 配置中，变量只能存字符串，变量都须带上 `$` 前缀。

**变量插值与创建**
```nginx
set $a hello;
set $b "$a, world"; # 变量插值
```
`set` 指令不仅有赋值的功能，它还有创建 Nginx 变量的副作用。变量的创建发生在配置加载时，而赋值发生在请求处理时。
变量名的可见范围是整个 Nginx 配置（甚至跨 `server`），但每个请求都有独立的变量副本，互不干扰。变量生命周期与请求绑定，而非与 `location` 绑定。

**内部跳转**
```nginx
location /foo {
    set $a hello;
    echo_exec /bar; # 内部跳转，变量副本保留
}
location /bar {
    echo "a = [$a]"; # 输出 a = [hello]
}
```
内部跳转（如 `rewrite`, `echo_exec`, `try_files`）发生在服务器内部，客户端无感知。跳转后仍是同一个请求，共享同一套变量容器副本。

**内建变量**
*   `$request_uri`: 请求最原始的 URI（未经解码，包含参数）。
*   `$uri`: 解码后的 URI，不含参数。
*   `$arg_XXX`: 获取名为 XXX 的 URL 参数（不区分大小写）。
*   `$args`: URL 参数串。修改 `$args` 会影响 `$arg_XXX`。

**变量映射 (Map)**
`map` 指令用于定义变量间的函数关系，具有“惰性求值”特性，且结果会被缓存。
```nginx
map $args $foo {
    default 0;
    debug   1;
}
```

**主请求与子请求**
*   **主请求**：外部客户端发起的请求。
*   **子请求**：Nginx 内部发起的级联请求（如 `echo_location`, `auth_request`）。子请求不是网络调用，效率极高。
*   **变量共享**：通常父子请求变量隔离，但 `auth_request` 等模块发起的子请求可能共享变量，需小心副作用。

### 2. Nginx 配置指令的执行顺序

Nginx 的请求处理划分为 11 个阶段，指令的执行顺序由其所属阶段决定，而非书写顺序。

**常见阶段执行顺序：**
1.  **post-read**: 读取请求头后立即执行（如 `ngx_realip`）。
2.  **server-rewrite**: `server` 块中的 rewrite 指令。
3.  **find-config**: 匹配 `location`。
4.  **rewrite**: `location` 中的 rewrite 指令（如 `set`, `rewrite`, `set_by_lua`）。
5.  **post-rewrite**: 处理 rewrite 产生的内部跳转。
6.  **preaccess**: 访问控制前（如 `ngx_limit_req`, `ngx_realip` in location）。
7.  **access**: 访问控制（如 `allow`, `deny`, `access_by_lua`, `auth_request`）。
8.  **try-files**: 处理 `try_files` 指令。
9.  **content**: 生成响应内容（如 `echo`, `proxy_pass`, `content_by_lua`, 静态文件服务）。
10. **log**: 记录日志。

**关键原则：**
*   **同阶段有序**：同一模块在同一阶段的指令通常按书写顺序执行。
*   **跨阶段有序**：`rewrite` 阶段指令总是早于 `access` 阶段，`access` 早于 `content`。
*   **示例**：
    ```nginx
    location /test {
        echo "content";      # content 阶段
        set $a 1;            # rewrite 阶段
        deny all;            # access 阶段
    }
    ```
    执行顺序为：`set` -> `deny` -> (如果允许) `echo`。
*   **Content 阶段排他性**：一个 `location` 通常只能有一个“内容处理程序”。`echo` 和 `proxy_pass` 同时存在时，只有一个会生效。

---

## 第三部分：运维管理与优化

### 1. Nginx 日志管理

#### 日志变量详解
下表列出了 `log_format` 中常用的变量：

| 变量 | 含义 |
| :--- | :--- |
| `$remote_addr` | 客户端 IP 地址（若有代理可能是代理 IP） |
| `$remote_user` | HTTP 认证用户名 |
| `$time_local` | 本地时间 |
| `$request` | 完整的原始请求行（方法 URI 协议） |
| `$status` | HTTP 响应状态码 |
| `$body_bytes_sent` | 发送给客户端的响应体大小 |
| `$http_referer` | 引用页面地址 |
| `$http_user_agent` | 用户代理（浏览器信息） |
| `$http_x_forwarded_for` | X-Forwarded-For 头（真实 IP 列表） |
| `$request_time` | 请求处理时间（秒），分析慢请求关键变量 |
| `$upstream_response_time` | 上游服务器（如 PHP-FPM）处理时间 |

#### 日志配置示例
```nginx
log_format json escape=json '{'
                    '"time_local":"$time_local",'
                    '"remote_addr":"$remote_addr",'
                    '"request":"$request",'
                    '"status": "$status",'
                    '"request_time":$request_time,'
                    '"upstream_response_time":$upstream_response_time'
                    '}';
access_log /var/log/nginx/access.log json;
```

#### 日志切割 (Logrotate)
`/etc/logrotate.d/nginx` 配置：
```bash
/var/log/nginx/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data adm
    sharedscripts
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 `cat /var/run/nginx.pid`
        fi
    endscript
}
```
*原理：重命名日志文件 -> 发送 USR1 信号给 Nginx -> Nginx 重新打开日志文件写入新内容。*

#### 日志分析常用命令
```bash
# 统计访问量最高的IP
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -10
# 查找慢请求（超过3秒）
awk -v limit=3 '{if ($NF > limit) print $NF, $0}' /var/log/nginx/access.log | sort -nr
# 统计HTTP状态码
awk '{print $9}' /var/log/nginx/access.log | sort | uniq -c | sort -nr
```

### 2. Nginx 命令行选项

*   `nginx -t`: 测试配置文件语法。
*   `nginx -T`: 测试并打印当前生效的完整配置（包含 include 的文件）。
*   `nginx -s [signal]`: 发送信号。
    *   `reload`: 重载配置。
    *   `quit`: 优雅停止。
    *   `stop`: 快速停止。
    *   `reopen`: 重新打开日志。
*   `nginx -c <file>`: 指定配置文件路径。
*   `nginx -v`: 显示版本。
*   `nginx -V`: 显示版本及编译参数（查看安装了哪些模块）。

### 3. Nginx 性能优化

#### 工作进程
```nginx
worker_processes auto;          # 自动绑定CPU核心
worker_cpu_affinity auto;       # 绑定亲和性
events {
    worker_connections 4096;    # 提高单进程连接数
    use epoll;
    multi_accept on;
}
```

#### 网络与 Gzip
```nginx
http {
    tcp_nopush on;              # 优化文件传输
    tcp_nodelay on;             # 降低延迟
    keepalive_timeout 30;       # 调整连接保持时间
    
    gzip on;
    gzip_comp_level 6;          # 压缩级别平衡 CPU与效果
    gzip_min_length 1000;
    gzip_types text/plain application/json application/javascript text/css;
}
```

#### 缓存优化
```nginx
# 静态文件浏览器缓存
location ~* \.(jpg|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
# 打开文件描述符缓存
open_file_cache max=200000 inactive=20s;
```

### 4. Nginx 安全配置

*   **隐藏版本**: `server_tokens off;`
*   **限制方法**: `if ($request_method !~ ^(GET|HEAD|POST)$ ) { return 405; }`
*   **安全头部**:
    ```nginx
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    ```
*   **防止 DDoS**: 使用 `limit_conn` 和 `limit_req` 模块限制连接数和请求速率。

### 5. 故障排除

*   **服务无法启动**: 检查 `nginx -t`，查看 `error.log`，检查端口占用 `netstat -tulpn | grep :80`。
*   **502 Bad Gateway**: 通常是后端（如 PHP-FPM）挂了或配置错误，检查后端服务状态和日志。
*   **413 Request Entity Too Large**: 上传文件过大，调整 `client_max_body_size`。
*   **调试模式**: 编译时开启 `--with-debug`，在 `error_log` 中开启 `debug` 级别。

---

## 附录：完整配置示例

这是一个集成了多种最佳实践的完整 `nginx.conf` 示例。

```nginx
user nginx;
worker_processes auto;
pid /run/nginx.pid;
error_log /var/log/nginx/error.log;

events {
    worker_connections 1024;
    multi_accept on;
    use epoll;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    gzip on;
    gzip_disable "msie6";
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 负载均衡组
    upstream backend {
        server backend1.example.com weight=5;
        server backend2.example.com;
        keepalive 16;
    }

    server {
        listen 80;
        server_name example.com;
        root /var/www/example.com;

        location / {
            try_files $uri $uri/ @fallback;
        }

        location /api {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        location @fallback {
            root /var/www/error;
            index index.html;
        }

        location ~ \.php$ {
            include fastcgi_params;
            fastcgi_pass unix:/var/run/php/php-fpm.sock;
        }
        
        # 静态资源缓存
        location ~* \.(jpg|jpeg|gif|png|css|js|ico|xml)$ {
            expires 30d;
        }
    }
    
    include /etc/nginx/conf.d/*.conf;
}
```
