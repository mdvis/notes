IANA（Internet Assigned Numbers Authority）维护了一系列的HTTP身份验证方案（Authentication Schemes），这些方案用于在HTTP协议中实现权限控制和认证。以下是其中最常用的几种验证方案及其特点：
## 1. Basic Authentication
- **简介**：Basic 是最常见的HTTP认证方案，定义于RFC 7617。它使用用户的ID和密码作为凭证，并通过Base64编码传输。
- **流程**：
    - 服务器返回401状态码，并在`WWW-Authenticate`头中指定验证方式为`Basic`。
    - 客户端将用户名和密码用冒号连接（如`username:password`），进行Base64编码后，通过`Authorization`头发送给服务器。
    - 服务器解码并验证凭证。
- **安全性**：由于Base64是可逆编码，凭证以明文形式传输，因此必须与HTTPS/TLS协议结合使用，否则容易被嗅探178。
- **适用场景**：适用于内部系统或安全性要求不高的场景，如路由器管理界面15。
## 2. Bearer Authentication
- **简介**：Bearer 方案定义于RFC 6750，通常用于OAuth 2.0协议中，通过令牌（Token）保护资源。
- **流程**：
    - 客户端在`Authorization`头中携带Bearer令牌，格式为：`Authorization: Bearer <token>`。
    - 服务器验证令牌的有效性。
- **安全性**：令牌通常通过HTTPS传输，避免泄露。但令牌一旦泄露，攻击者可以冒充用户访问资源18。
- **适用场景**：适用于RESTful API的认证，尤其是OAuth 2.0保护的资源15。
## 3. Digest Authentication
- **简介**：Digest 方案定义于RFC 7616，是对Basic方案的改进，使用哈希算法（如MD5或SHA-256）保护凭证。
- **流程**：
    - 服务器返回401状态码，并在`WWW-Authenticate`头中提供随机数（nonce）和哈希算法信息。
    - 客户端使用用户名、密码、nonce等信息生成哈希值，并通过`Authorization`头发送给服务器。
    - 服务器验证哈希值。
- **安全性**：相比Basic方案，Digest方案更安全，因为密码不会以明文形式传输。但MD5哈希已被认为不够安全，推荐使用SHA-256178。
- **适用场景**：适用于需要较高安全性的场景，但实现复杂度较高15。
## 4. HOBA (HTTP Origin-Bound Authentication)
- **简介**：HOBA 方案定义于RFC 7486，基于数字签名实现认证，适用于HTTP服务器或代理。
- **流程**：
    - 客户端生成数字签名，并通过`Authorization`头发送给服务器。
    - 服务器验证签名。
- **安全性**：由于使用数字签名，HOBA方案具有较高的安全性，但实现复杂度较高28。
- **适用场景**：适用于需要高安全性和防篡改的场景28。
## 5. Mutual Authentication
- **简介**：Mutual 方案定义于RFC 8120，是一种双向认证机制，客户端和服务器相互验证身份。
- **流程**：
    - 客户端和服务器交换证书，并验证对方的身份。
- **安全性**：双向认证提供了更高的安全性，但需要复杂的证书管理和配置28。
- **适用场景**：适用于高安全性要求的场景，如金融或政府系统28。
## 6. AWS4-HMAC-SHA256
- **简介**：这是Amazon Web Services（AWS）使用的认证方案，基于HMAC-SHA256算法。
- **流程**：
    - 客户端使用密钥和请求内容生成签名，并通过`Authorization`头发送给服务器。
    - 服务器验证签名。
- **安全性**：由于使用HMAC-SHA256，该方案具有较高的安全性18。
- **适用场景**：适用于AWS服务的API认证18。
## 总结
- **Basic**：简单易用，但安全性低，需结合HTTPS。
- **Bearer**：适用于OAuth 2.0，令牌需妥善保护。
- **Digest**：比Basic更安全，但实现复杂。
- **HOBA**：基于数字签名，安全性高。
- **Mutual**：双向认证，安全性最高，但配置复杂。
- **AWS4-HMAC-SHA256**：适用于AWS服务，安全性高。