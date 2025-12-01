# Nginx服务器配置指南

本文档整合了Nginx的核心知识，包括基础配置、日志管理、命令行选项和最佳实践。

## 目录
1. [Nginx基础配置](#nginx基础配置)
2. [Nginx日志管理](#nginx日志管理)
3. [Nginx命令行选项](#nginx命令行选项)
4. [Nginx性能优化](#nginx性能优化)
5. [Nginx安全配置](#nginx安全配置)
6. [Nginx故障排除](#nginx故障排除)

## Nginx基础配置

### 配置文件结构

Nginx配置文件通常位于 `/etc/nginx/nginx.conf`，采用分层结构：

```
nginx.conf                    # 主配置文件
├── /etc/nginx/conf.d/       # 额外配置文件目录
│   ├── default.conf         # 默认站点配置
│   └── ssl.conf             # SSL配置
├── /etc/nginx/sites-enabled/ # 启用的站点配置
├── /etc/nginx/sites-available/ # 可用的站点配置
└── /var/www/                # 网站根目录
```

### 主配置文件详解

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

### 虚拟主机配置

#### 基础HTTP虚拟主机

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

#### HTTPS虚拟主机配置

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

### 反向代理配置

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
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 连接和超时配置
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
}
```

#### PHP处理配置

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

    # 拒绝访问隐藏文件
    location ~ /\. {
        deny all;
    }
}
```

### 高级配置

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

    location / {
        root /var/www/example.com;
    }
}
```

## Nginx日志管理

### 日志类型和格式

#### 访问日志配置

```nginx
# 自定义日志格式
log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                  '$status $body_bytes_sent "$http_referer" '
                  '"$http_user_agent" "$http_x_forwarded_for"';

log_format detailed '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for" '
                    'rt=$request_time uct="$upstream_connect_time" '
                    'uht="$upstream_header_time" urt="$upstream_response_time"';

log_format json escape=json '{'
                    '"time_local":"$time_local",'
                    '"remote_addr":"$remote_addr",'
                    '"remote_user":"$remote_user",'
                    '"request":"$request",'
                    '"status": "$status",'
                    '"body_bytes_sent":$body_bytes_sent,'
                    '"request_time":$request_time,'
                    '"http_referrer":"$http_referer",'
                    '"http_user_agent":"$http_user_agent"'
                    '}';

# 应用日志格式
access_log /var/log/nginx/access.log main;
```

#### 错误日志配置

```nginx
# 错误日志配置
error_log /var/log/nginx/error.log warn;

# 不同虚拟主机的错误日志
server {
    error_log /var/log/nginx/example.com.error.log;

    location / {
        # 特定位置的错误日志
        error_log /var/log/nginx/example.com.api.error.log;
    }
}
```

### 日志切割和管理

#### Logrotate配置

```bash
# /etc/logrotate.d/nginx
/var/log/nginx/*.log {
    daily                       # 每天切割一次
    missingok                   # 日志文件丢失不报错
    rotate 52                   # 保留52个日志文件
    compress                    # 压缩旧日志
    delaycompress               # 延迟压缩
    notifempty                  # 空日志不切割
    create 644 www-data adm     # 创建新日志的权限
    sharedscripts
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 `cat /var/run/nginx.pid`
        fi
    endscript
}
```

#### 手动日志切割

```bash
#!/bin/bash
# 日志切割脚本

LOGDIR="/var/log/nginx"
DATE=$(date +%Y%m%d)

# 创建备份目录
BACKUP_DIR="$LOGDIR/archive/$DATE"
mkdir -p $BACKUP_DIR

# 切割并压缩日志文件
for logfile in access.log error.log; do
    if [ -f "$LOGDIR/$logfile" ]; then
        mv "$LOGDIR/$logfile" "$BACKUP_DIR/$logfile"
        gzip "$BACKUP_DIR/$logfile"
    fi
done

# 重新打开日志文件
if [ -f /var/run/nginx.pid ]; then
    kill -USR1 `cat /var/run/nginx.pid`
fi

echo "Log rotation completed for $DATE"
```

### 日志分析和监控

#### 常用日志分析命令

```bash
# 查看实时日志
tail -f /var/log/nginx/access.log

# 统计访问量最高的IP
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -10

# 统计HTTP状态码
awk '{print $9}' /var/log/nginx/access.log | sort | uniq -c | sort -nr

# 查找404错误
awk '$9 == 404 {print $7}' /var/log/nginx/access.log | sort | uniq -c | sort -nr

# 分析访问时间最长的请求
awk '{print $NF, $0}' /var/log/nginx/access.log | sort -nr | head -10

# 统计用户代理
awk -F'"' '{print $6}' /var/log/nginx/access.log | sort | uniq -c | sort -nr
```

#### 使用GoAccess分析

```bash
# 安装GoAccess
sudo apt install goaccess  # Ubuntu/Debian
sudo yum install goaccess  # CentOS/RHEL

# 生成HTML报告
goaccess /var/log/nginx/access.log -c -a > /var/www/report.html

# 实时监控
goaccess /var/log/nginx/access.log --real-time-html --ws-url=ws://yourdomain.com:7890

# 处理压缩日志
zcat /var/log/nginx/access.log.*.gz | goaccess access.log -
```

#### 自定义监控脚本

```bash
#!/bin/bash
# Nginx监控脚本

ACCESS_LOG="/var/log/nginx/access.log"
ERROR_LOG="/var/log/nginx/error.log"
ALERT_EMAIL="admin@example.com"

# 检查5xx错误
FIVEXX_COUNT=$(grep "$(date '+%d/%b/%Y')" $ERROR_LOG | grep -c "HTTP/1.[01]\" [5]")
if [ $FIVEXX_COUNT -gt 10 ]; then
    echo "5xx错误数量过高: $FIVEXX_COUNT" | mail -s "Nginx告警" $ALERT_EMAIL
fi

# 检查高响应时间
HIGH_RESPONSE=$(awk '$NF > 5 {print $0}' $ACCESS_LOG | wc -l)
if [ $HIGH_RESPONSE -gt 50 ]; then
    echo "高响应时间请求过多: $HIGH_RESPONSE" | mail -s "Nginx性能告警" $ALERT_EMAIL
fi

# 检查磁盘空间
DISK_USAGE=$(df /var/log/nginx | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "日志目录磁盘空间不足: ${DISK_USAGE}%" | mail -s "磁盘空间告警" $ALERT_EMAIL
fi
```

## Nginx命令行选项

### 基本命令

#### 启动和停止

```bash
# 启动Nginx
sudo nginx
sudo systemctl start nginx

# 停止Nginx
sudo nginx -s stop      # 快速停止
sudo nginx -s quit      # 优雅停止
sudo systemctl stop nginx

# 重启Nginx
sudo systemctl restart nginx

# 重新加载配置（不中断服务）
sudo nginx -s reload
sudo systemctl reload nginx
```

#### 配置测试

```bash
# 测试配置文件语法
sudo nginx -t

# 详细测试配置文件
sudo nginx -T

# 指定配置文件测试
sudo nginx -t -c /path/to/nginx.conf
```

#### 版本和帮助信息

```bash
# 显示版本信息
nginx -v

# 显示详细版本和编译信息
nginx -V

# 显示帮助信息
nginx -h
```

### 高级命令

#### 信号控制

```bash
# 发送信号到Nginx主进程
# TERM, INT: 快速关闭
# QUIT: 优雅关闭
# HUP: 重新加载配置
# USR1: 重新打开日志文件
# USR2: 升级可执行文件
# WINCH: 优雅关闭工作进程

# 获取Nginx主进程ID
cat /var/run/nginx.pid

# 发送信号
sudo kill -HUP $(cat /var/run/nginx.pid)
sudo kill -USR1 $(cat /var/run/nginx.pid)
```

#### 配置管理

```bash
# 查看当前生效的配置
nginx -T

# 从配置中提取特定部分
nginx -T | grep -A 10 "server_name example.com"

# 检查配置文件包含关系
nginx -T | grep "include"
```

#### 模块管理

```bash
# 查看编译的模块
nginx -V 2>&1 | grep --color=always "configure arguments:"

# 动态加载模块（如果支持）
load_module modules/ngx_http_geoip_module.so;
```

### 维护和调试

#### 调试模式

```bash
# 启用调试模式
sudo nano /etc/nginx/nginx.conf

# 添加到events块
events {
    debug_connection 192.168.1.100;  # 只调试特定IP
}

# 重新加载配置
sudo nginx -s reload

# 查看调试日志
tail -f /var/log/nginx/error.log
```

#### 性能分析

```bash
# 使用strace分析
sudo strace -p $(cat /var/run/nginx.pid) -e trace=network

# 使用perf分析
sudo perf top -p $(cat /var/run/nginx.pid)

# 查看连接状态
ss -tuln | grep nginx
netstat -tulpn | grep nginx
```

## Nginx性能优化

### 工作进程优化

```nginx
# 根据CPU核心数设置工作进程
worker_processes auto;

# 绑定工作进程到CPU核心
worker_cpu_affinity auto;

# 设置每个工作进程的最大连接数
events {
    worker_connections 4096;
    use epoll;
    multi_accept on;
}
```

### 内存和缓存优化

```nginx
http {
    # 设置客户端请求体大小限制
    client_max_body_size 64m;
    client_body_buffer_size 128k;

    # 设置客户端头部缓冲区大小
    client_header_buffer_size 1k;
    large_client_header_buffers 4 4k;

    # 设置打开文件缓存
    open_file_cache max=200000 inactive=20s;
    open_file_cache_valid 30s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;
}
```

### 网络优化

```nginx
http {
    # 启用TCP_NOPUSH
    tcp_nopush on;

    # 启用TCP_NODELAY
    tcp_nodelay on;

    # 设置keep-alive超时
    keepalive_timeout 30;

    # 设置keep-alive请求数
    keepalive_requests 1000;

    # 设置重置连接超时
    reset_timedout_connection on;

    # 设置客户端超时
    client_body_timeout 10;
    client_header_timeout 10;
    send_timeout 2;
}
```

### Gzip压缩优化

```nginx
http {
    # 启用Gzip压缩
    gzip on;

    # 压缩级别（1-9，越高CPU消耗越大）
    gzip_comp_level 6;

    # 设置压缩最小文件大小
    gzip_min_length 1000;

    # 设置压缩的HTTP版本
    gzip_http_version 1.1;

    # 设置压缩的MIME类型
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        application/xml;

    # 设置Vary头部
    gzip_vary on;

    # 设置代理压缩
    gzip_proxied any;
}
```

### 缓存优化

#### 静态文件缓存

```nginx
server {
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary Accept-Encoding;
    }
}
```

#### FastCGI缓存

```nginx
http {
    # 定义FastCGI缓存路径
    fastcgi_cache_path /var/cache/nginx/fastcgi levels=1:2 keys_zone=WORDPRESS:100m inactive=60m;
    fastcgi_cache_key "$scheme$request_method$host$request_uri";
    fastcgi_cache_use_stale error timeout invalid_header http_500;
    fastcgi_cache_valid 200 60m;

    server {
        location ~ \.php$ {
            fastcgi_pass unix:/var/run/php/php8.0-fpm.sock;
            fastcgi_cache WORDPRESS;
            fastcgi_cache_valid 200 60m;
            fastcgi_cache_bypass $cookie_nocache $arg_nocache;
            fastcgi_no_cache $cookie_nocache $arg_nocache;
            add_header X-FastCGI-Cache $upstream_cache_status;
        }
    }
}
```

## Nginx安全配置

### 基础安全配置

```nginx
http {
    # 隐藏Nginx版本信息
    server_tokens off;

    # 限制请求方法
    if ($request_method !~ ^(GET|HEAD|POST)$ ) {
        return 405;
    }

    # 防止缓冲区溢出
    client_body_buffer_size 1K;
    client_header_buffer_size 1k;
    client_max_body_size 1k;
    large_client_header_buffers 2 1k;

    # 设置请求超时
    client_body_timeout 10;
    client_header_timeout 10;
    keepalive_timeout 5 5;
    send_timeout 10;
}

server {
    # 防止访问隐藏文件
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    # 防止访问备份文件
    location ~ ~$ {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

### SSL/TLS安全配置

```nginx
server {
    listen 443 ssl http2;

    # 使用强加密套件
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers on;

    # SSL会话缓存
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;

    # OCSP装订
    ssl_stapling on;
    ssl_stapling_verify on;

    # 安全头部
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

### 访问控制

```nginx
server {
    # 基于IP的访问控制
    location /admin/ {
        allow 192.168.1.0/24;
        allow 10.0.0.0/8;
        deny all;
    }

    # 基于地理位置的访问控制（需要GeoIP模块）
    location / {
        deny 192.168.1.1;
        allow 192.168.1.0/24;
    }

    # HTTP基本认证
    location /private/ {
        auth_basic "Restricted Area";
        auth_basic_user_file /etc/nginx/.htpasswd;
    }
}
```

### 防止DDoS攻击

```nginx
http {
    # 限制连接数
    limit_conn_zone $binary_remote_addr zone=conn_limit_per_ip:10m;

    # 限制请求速率
    limit_req_zone $binary_remote_addr zone=req_limit_per_ip:10m rate=10r/s;

    server {
        # 应用连接限制
        limit_conn conn_limit_per_ip 20;

        # 应用请求速率限制
        limit_req zone=req_limit_per_ip burst=20 nodelay;

        location / {
            # 正常配置
        }
    }
}
```

## Nginx故障排除

### 常见问题及解决方案

#### 1. 服务无法启动

```bash
# 检查配置文件语法
sudo nginx -t

# 查看错误日志
sudo tail -f /var/log/nginx/error.log

# 检查端口占用
sudo netstat -tulpn | grep :80
sudo lsof -i :80

# 检查权限
ls -la /var/log/nginx/
ls -la /var/run/nginx.pid
```

#### 2. 502 Bad Gateway错误

```bash
# 检查上游服务状态
systemctl status php8.0-fpm
systemctl status mysql

# 检查网络连接
telnet 127.0.0.1 9000

# 检查配置
nginx -t | grep upstream

# 查看详细错误日志
tail -f /var/log/nginx/error.log | grep "upstream"
```

#### 3. 413 Request Entity Too Large

```nginx
# 增加client_max_body_size
http {
    client_max_body_size 50M;
}

# 或者在特定位置设置
location /upload/ {
    client_max_body_size 100M;
}
```

#### 4. 高CPU使用率

```bash
# 查看Nginx进程
ps aux | grep nginx

# 使用strace分析
sudo strace -p $(pgrep nginx) -c

# 检查worker_processes设置
nginx -t | grep worker_processes

# 分析日志查看异常请求
awk '$NF > 5 {print $0}' /var/log/nginx/access.log
```

### 性能监控

#### 监控脚本

```bash
#!/bin/bash
# Nginx性能监控脚本

# 获取进程信息
NGINX_PID=$(cat /var/run/nginx.pid 2>/dev/null)
WORKER_PROCESSES=$(pgrep -P $NGINX_PID 2>/dev/null | wc -l)

# 获取连接信息
ACTIVE_CONNECTIONS=$(ss -an | grep :80 | grep ESTAB | wc -l)
TOTAL_CONNECTIONS=$(ss -an | grep :80 | wc -l)

# 获取内存使用
MEMORY_USAGE=$(ps -p $NGINX_PID -o rss=)
CPU_USAGE=$(ps -p $NGINX_PID -o %cpu=)

# 输出监控信息
echo "=== Nginx性能监控 ==="
echo "主进程PID: $NGINX_PID"
echo "工作进程数: $WORKER_PROCESSES"
echo "活跃连接数: $ACTIVE_CONNECTIONS"
echo "总连接数: $TOTAL_CONNECTIONS"
echo "内存使用: ${MEMORY_USAGE}KB"
echo "CPU使用率: ${CPU_USAGE}%"

# 检查磁盘空间
DISK_USAGE=$(df /var/log/nginx | tail -1 | awk '{print $5}')
echo "日志目录使用率: $DISK_USAGE"
```

#### 使用Prometheus监控

```nginx
# 添加监控状态页面
server {
    listen 127.0.0.1:8080;
    location /nginx_status {
        stub_status;
        access_log off;
        allow 127.0.0.1;
        deny all;
    }
}
```

### 日志分析技巧

#### 高级日志分析

```bash
# 分析慢请求
awk '$NF > 5 {print $NF, $7}' /var/log/nginx/access.log | sort -nr

# 分析User-Agent分布
awk -F'"' '{print $6}' /var/log/nginx/access.log | sort | uniq -c | sort -nr

# 分析请求大小
awk '{print $10}' /var/log/nginx/access.log | awk '{sum+=$1} END {print sum/NR}'

# 分析错误日志模式
awk '{print $9}' /var/log/nginx/error.log | sort | uniq -c | sort -nr
```

通过这些配置和最佳实践，可以构建一个高性能、安全且可靠的Nginx服务器。