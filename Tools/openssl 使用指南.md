OpenSSL 是一个强大的开源加密工具包，广泛用于 SSL/TLS 协议实现、证书管理、加密解密等操作。

## 一、基础操作

### 1. **版本信息**
```bash
openssl version           # 查看版本
openssl version -a        # 查看详细版本信息
```

### 2. **生成随机数**
```bash
openssl rand -hex 32      # 生成32字节的十六进制随机数
openssl rand -base64 32   # 生成32字节的base64编码随机数
```

## 二、证书操作

### 1. **生成 RSA 密钥**
```bash
# 生成2048位RSA私钥
openssl genrsa -out private.key 2048

# 生成带密码保护的私钥
openssl genrsa -aes256 -out private.key 2048

# 从私钥提取公钥
openssl rsa -in private.key -pubout -out public.key
```

### 2. **生成 ECC 密钥**
```bash
# 查看支持的椭圆曲线
openssl ecparam -list_curves

# 生成ECC私钥（使用prime256v1曲线）
openssl ecparam -genkey -name prime256v1 -out ecc.key
```

### 3. **创建证书请求（CSR）**
```bash
# 交互式创建CSR
openssl req -new -key private.key -out request.csr

# 非交互式创建CSR
openssl req -new -key private.key -out request.csr \
  -subj "/C=CN/ST=Beijing/L=Beijing/O=Company/CN=example.com"

# 查看CSR内容
openssl req -in request.csr -text -noout
```

### 4. **自签名证书**
```bash
# 生成自签名证书（有效期365天）
openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -nodes

# 使用现有密钥创建
openssl req -x509 -key private.key -in request.csr -out certificate.crt -days 365
```

### 5. **证书格式转换**
```bash
# PEM 转 DER
openssl x509 -in cert.pem -outform der -out cert.der

# DER 转 PEM
openssl x509 -inform der -in cert.der -out cert.pem

# PEM 转 PKCS#12（包含私钥和证书）
openssl pkcs12 -export -out cert.pfx -inkey private.key -in cert.pem
```

## 三、加密解密

### 1. **对称加密**
```bash
# AES加密
openssl enc -aes-256-cbc -salt -in plaintext.txt -out encrypted.enc

# AES解密
openssl enc -d -aes-256-cbc -in encrypted.enc -out decrypted.txt

# 使用密码文件
openssl enc -aes-256-cbc -salt -in file.txt -out file.enc -pass file:password.txt
```

### 2. **非对称加密**
```bash
# 使用公钥加密
openssl rsautl -encrypt -inkey public.key -pubin -in plain.txt -out encrypted.bin

# 使用私钥解密
openssl rsautl -decrypt -inkey private.key -in encrypted.bin -out decrypted.txt
```

### 3. **数字签名**
```bash
# 创建签名
openssl dgst -sha256 -sign private.key -out signature.bin document.txt

# 验证签名
openssl dgst -sha256 -verify public.key -signature signature.bin document.txt
```

## 四、哈希与摘要

```bash
# MD5哈希
openssl md5 file.txt

# SHA256哈希
openssl sha256 file.txt

# 多种哈希算法
openssl dgst -sha512 file.txt
openssl dgst -sha3-256 file.txt
```

## 五、SSL/TLS 测试

### 1. **服务器测试**
```bash
# 测试SSL连接
openssl s_client -connect example.com:443

# 详细连接信息
openssl s_client -connect example.com:443 -showcerts

# 指定SNI（服务器名称指示）
openssl s_client -connect example.com:443 -servername example.com
```

### 2. **检查证书链**
```bash
openssl s_client -connect example.com:443 -verify_return_error -verify 5
```

## 六、实用示例

### 1. **创建完整的自签名CA**
```bash
# 1. 创建CA私钥
openssl genrsa -out ca.key 4096

# 2. 创建CA证书
openssl req -new -x509 -days 3650 -key ca.key -out ca.crt \
  -subj "/C=CN/ST=Beijing/L=Beijing/O=MyCA/CN=My Root CA"

# 3. 创建服务器私钥
openssl genrsa -out server.key 2048

# 4. 创建证书请求
openssl req -new -key server.key -out server.csr \
  -subj "/C=CN/ST=Beijing/L=Beijing/O=MyCompany/CN=server.example.com"

# 5. 用CA签发证书
openssl x509 -req -days 365 -in server.csr -CA ca.crt -CAkey ca.key \
  -CAcreateserial -out server.crt
```

### 2. **检查证书信息**
```bash
# 查看证书内容
openssl x509 -in certificate.crt -text -noout

# 检查证书有效期
openssl x509 -in certificate.crt -dates -noout

# 检查证书的Subject和Issuer
openssl x509 -in certificate.crt -subject -issuer -noout
```

### 3. **检查密钥信息**
```bash
# 查看RSA密钥信息
openssl rsa -in private.key -text -noout

# 检查密钥是否为加密状态
openssl rsa -in private.key -check -noout
```

## 七、常用参数说明

| 参数 | 说明 |
|------|------|
| `-in` | 输入文件 |
| `-out` | 输出文件 |
| `-key` | 私钥文件 |
| `-pubin` | 输入为公钥 |
| `-text` | 以文本形式输出 |
| `-noout` | 不输出编码版本 |
| `-nodes` | 不加密私钥 |
| `-days` | 有效期天数 |
| `-subj` | 证书主题信息 |
| `-newkey` | 生成新密钥并创建请求 |

## 八、安全注意事项

1. **私钥保护**：私钥文件应设置适当权限（如600）
2. **密码强度**：使用强密码保护私钥
3. **密钥长度**：RSA建议至少2048位，ECC建议至少256位
4. **证书有效期**：合理设置证书有效期
5. **算法选择**：优先使用安全算法（如SHA256、AES-256）

## 九、故障排除

1. **权限错误**：检查文件读写权限
2. **格式错误**：确保文件格式正确（PEM/DER）
3. **密码错误**：确认加密密码正确
4. **证书链不完整**：确保包含所有中间证书

## 十、常用组合命令

```bash
# 一键生成测试证书
openssl req -newkey rsa:2048 -nodes -keyout test.key -x509 -days 365 -out test.crt \
  -subj "/C=CN/ST=Test/L=Test/O=Test/CN=localhost"

# 快速检查网站证书
echo | openssl s_client -connect example.com:443 2>/dev/null | \
  openssl x509 -noout -subject -dates
```

这个指南涵盖了 OpenSSL 的常用功能，实际使用时请根据具体需求调整参数。对于生产环境，建议参考官方文档进行更详细的配置。