API 是现代应用的核心，但它们暴露在公网上，容易成为攻击目标。文章强调：**API 安全不是单一功能，而是一个多层防御体系**（Defense in Depth），需要从设计阶段就开始融入安全（Security by Design）。

## 主要安全实践（关键章节内容）

1. **认证（Authentication）**
   - 推荐使用 **JWT (JSON Web Tokens)** 或 **OAuth 2.0 + OpenID Connect**。
   - 避免使用弱的 Basic Auth 或 Session-based 认证（尤其在分布式系统中）。
   - 最佳实践：短 token 有效期 + Refresh Token 机制。

2. **授权（Authorization）**
   - 实施 **RBAC（Role-Based Access Control）** 或 **ABAC（Attribute-Based Access Control）**。
   - 最小权限原则（Principle of Least Privilege）。
   - 在每个 API 端点都进行细粒度权限检查。

3. **数据加密**
   - **传输层**：强制使用 **HTTPS/TLS 1.3**，禁用旧版本 TLS。
   - **存储层**：敏感数据加密（at-rest encryption）。
   - **字段级加密**：对特别敏感的信息（如支付信息）额外加密。

4. **输入验证与防护常见漏洞**
   - 防范 **OWASP API Top 10** 中的风险：
     - Broken Object Level Authorization (BOLA)
     - Broken Authentication
     - Excessive Data Exposure
     - Lack of Rate Limiting
     - Injection attacks 等。
   - 严格的输入验证、参数化查询、避免直接拼接 SQL/NoSQL。

5. **速率限制与防滥用（Rate Limiting & Throttling）**
   - 基于 IP、用户、API Key 进行限流。
   - 实现 Token Bucket 或 Leaky Bucket 算法。
   - 区分不同客户端的限流策略（免费用户 vs 付费用户）。

6. **API Gateway 的作用**
   - 推荐在 **API Gateway**（如 Kong、AWS API Gateway、Apigee 等）层面统一处理：
     - 认证/授权
     - 限流
     - 日志与监控
     - WAF（Web Application Firewall）

7. **其他高级防护**
   - **mTLS（Mutual TLS）**：服务间通信的双向认证。
   - **API Key + IP Whitelisting**（适用于内部或合作伙伴 API）。
   - **日志与监控**：记录可疑请求，集成 SIEM 系统。
   - **版本控制与弃用策略**：避免长期维护不安全的旧版本 API。
   - **CORS** 配置严格化，防止跨域攻击。

## 推荐实施步骤（典型 Checklist）

- 设计阶段：定义安全需求和威胁模型。
- 开发阶段：集成安全库（如 Spring Security、OAuth 框架）。
- 测试阶段：进行渗透测试（Penetration Testing）和自动化安全扫描。
- 运行阶段：持续监控、日志分析、定期审计。
- 响应阶段：制定 Incident Response 流程。

**总结一句话**：
实现安全的 API 关键在于**分层防御 + 最小权限 + 持续监控**，而不是依赖单一措施。开发者/架构师应从认证、授权、加密、限流、输入验证等多个维度构建防护体系，并借助 API Gateway 统一执行策略。