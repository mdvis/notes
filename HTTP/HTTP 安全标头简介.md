HTTP 安全标头是 Web 安全的重要组成部分，它们可以帮助保护网站免受各种攻击，如跨站脚本（XSS）、点击劫持和 MIME 嗅探等。通过在服务器响应中正确配置这些标头，网站可以提高安全性并为用户提供更安全的浏览体验。
## X-Content-Type-Options标头
X-Content-Type-Options标头阻止浏览器执行 MIME 嗅探，未配置可能会导致安全漏洞。
**策略**
• nosniff -> 如果 MIME 类型与资源类型不匹配，则阻止请求（例如，阻止未使用正确 MIME 类型提供的脚本）。
**攻击场景**
攻击者将恶意脚本文件作为 CSS 文件提供，并诱骗浏览器执行它。如果没有nosniff ，浏览器可能会认为它是一个脚本并执行它。
**Apache 上的防御**
Header set X-Content-Type-Options "nosniff"
**Nginx 上的防御**
add\_header X-Content-Type-Options "nosniff";
## Access-Control-Allow-Origin标头
此标头定义哪些来源被允许通过跨源请求访问资源。
**策略**
• \* -> 允许所有来源（有风险）。
• -> 仅允许来自特定来源的请求。
**攻击场景**
不当的跨域资源共享 (CORS) 可能允许跨不同来源的敏感资源未经授权的访问，从而导致安全漏洞。
**Apache 上的防御**
Header set Access-Control-Allow-Origin " [https://trustedsite.com](https://trustedsite.com) "
**Nginx 上的防御**
add\_header Access-Control-Allow-Origin " [https://trustedsite.com](https://trustedsite.com) ";
## X-Frame-Options标头
当恶意行为者用透明的 iframe 覆盖合法页面，诱骗用户点击隐藏内容时，就会发生点击劫持。
**策略**
• X-Frame-Options: DENY -> 防止网站显示在 iframe 中。
• X-Frame-Options: SAMEORIGIN -> 允许站点仅由来自同一来源的页面构建。
**攻击场景**
钓鱼网站将银行网站嵌入隐藏的 iframe 中，诱骗用户输入凭证。
**Apache 上的防御**
Header always set X-Frame-Options "DENY"
**Nginx 上的防御**
add\_header X-Frame-Options "DENY";
## X-XSS-Protection标头
X-XSS-Protection是一个 HTTP 响应头，用于配置浏览器内置的跨站脚本（XSS）过滤器。其目的是防止跨站脚本攻击，即防止恶意脚本在用户浏览器中执行。
**策略**
X-XSS-Protection 标头曾经是防御 XSS 攻击的常用方法之一，但由于其局限性和现代浏览器的弃用，现已不再推荐使用。开发者应转而使用更强大、更可靠的安全机制，如 Content Security Policy（CSP），来保护应用程序免受 XSS 和其他类型的攻击。
• X-XSS-Protection: 1; mode=block -> 在浏览器中启用 XSS 过滤，在检测到攻击时阻止页面呈现。
• Content-Security-Policy -> 限制浏览器可以加载哪些资源（脚本、媒体等）。
**攻击场景**
攻击者通过表单字段注入恶意 JavaScript，并在访问该页面的用户的浏览器中执行。
**Apache 上的防御**
Header set X-XSS-Protection "1; mode=block" Header set Content-Security-Policy "default-src 'self'; script-src 'self'"
**Nginx 上的防御**
add\_header X-XSS-Protection "1; mode=block"; add\_header Content-Security-Policy "default-src 'self'; script-src 'self'";
## Strict-Transport-Security(HSTS)标头
Strict-Transport-Security强制浏览器仅通过 HTTPS 与服务器通信，防止中间人攻击（MITM）。
**策略**
• Strict-Transport-Security: max-age=31536000; includeSubDomains ->指示浏览器仅在指定时间内使用 HTTPS 访问网站。
**攻击场景**
攻击者拦截连接并将其降级为 HTTP，从而窃取 cookie 和会话数据。
**Apache 上的防御**
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
**Nginx 上的防御**
add\_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
## cookie标头
在未安全配置cookie的情况下，攻击者可以窃取会话 cookie 来冒充用户并获得未经授权的访问。
**策略**
• Secure -> 确保 cookie 仅通过 HTTPS 发送。
• HttpOnly -> 阻止 JavaScript 访问 cookie。
• SameSite：控制 Cookie 的跨站发送行为，防止 CSRF 攻击。
**攻击场景**
攻击者拦截 HTTP 连接上的 cookie 并使用它们冒充用户。
**Apache/Nginx 上的防御**
确保在您的应用程序和服务器设置中将cookie配置为Secure和HttpOnly 。
Set-Cookie: sessionid=abc123; Secure; HttpOnly; SameSite=Strict
## Referer标头
Referrer用于标识从哪个网页发起的请求。它告诉服务器当前请求是从哪个 URL 跳转或链接过来的，对于分析流量来源、日志记录和统计有重要作用。
**策略**
• Referrer-Policy -> 限制与第三方网站共享的引荐来源信息量，减少 CSRF 的暴露。
**攻击场景**
CSRF（跨站脚本攻击），攻击者诱骗用户点击链接，该链接在未经用户同意的情况下在合法网站上执行操作。
**Apache 上的防御**
Header set Referrer-Policy "no-referrer-when-downgrade"
**Nginx 上的防御**
add\_header Referrer-Policy "no-referrer-when-downgrade";
## Cache-Control标头
Cache-Control标头指定浏览器和共享缓存中的缓存策略。配置错误可能会导致敏感数据泄露或与缓存相关的攻击。
**策略**
• no-cache -> 强制浏览器在重新使用响应之前与原始服务器验证响应。
• no-store -> 确保响应不会存储在缓存中。
**攻击场景：缓存检查和欺骗**
攻击者可以利用错误配置的缓存，通过诱骗浏览器重复使用缓存的响应来提供过时或恶意内容。
**Apache 上的防御**
Header set Cache-Control "no-store, no-cache, must-revalidate"
**Nginx 上的防御**
add\_header Cache-Control "no-store, no-cache, must-revalidate";
## Content-Disposition标头
Content-Disposition标头指示浏览器是否以内联方式显示内容或将其作为附件下载。
**策略**
• inline >指示浏览器直接在浏览器中显示文件。
• attachment; filename="file.jpg" -> 强制浏览器以特定名称的附件形式下载文件。
**攻击场景：RFD 和点击劫持**
如果配置不当，攻击者可以传播伪装成合法内容的恶意文件。
**Apache 上的防御**
Header set Content-Disposition "attachment; filename=securefile.txt"
**Nginx 上的防御**
add\_header Content-Disposition "attachment; filename=securefile.txt";
## Cross-Origin-Resource-Policy标头
Cross-Origin-Resource-Policy(CORP) 限制了来自不同来源的请求如何共享资源，从而防止未经授权的资源访问。
**策略**
• same-site -> 只有来自同一站点的请求才能访问资源。
• same-origin -> 只有来自同一来源（方案 + 主机 + 端口）的请求才能访问资源。
• cross-origin -> 任何来源都可以读取资源。
**攻击场景：XSS、点击劫持和 CSRF**
如果没有适当的跨域限制，攻击者可以通过对您的资源发出未经授权的请求来利用 XSS、点击劫持或 CSRF 漏洞。
**Apache 上的防御**
Header set Cross-Origin-Resource-Policy "same-origin"
**Nginx 上的防御**
add\_header Cross-Origin-Resource-Policy "same-origin";
## Content-Encoding标头
Content-Encoding标头指定应用于内容的编码类型（例如gzip ，compress ，deflate ，br ）。
**策略**
• gzip 、compress 、deflate 、br > 对内容应用压缩方法以便通过网络传输。
**攻击场景：DDoS和网络窃听**
如果内容编码配置错误，攻击者可以通过发送压缩负载来导致网络问题，甚至利用压缩算法中的漏洞。
**Apache 上的防御**
AddOutputFilterByType DEFLATE text/html text/plain text/xml
**Nginx 上的防御**
gzip on; gzip\_types text/plain application/xml;
## X-Rate-Limit 和 X-Forwarded标头
• X-Rate-Limit -> 控制来自客户端的请求的速率限制。
• X-Forwarded-IP -> 使用代理或负载均衡器时捕获客户端的真实 IP 地址。
**攻击场景：速率限制绕过**
攻击者可能尝试通过欺骗 IP 地址来绕过速率限制，从而导致服务器资源滥用。
**Apache 上的防御**
实现诸如mod\_ratelimit之类的速率限制模块，并确保正确记录转发的 IP。
**Nginx 上的防御**
limit\_req zone=one burst=5 nodelay;
## X-Permitted-Cross-Domain-Policies 标头
控制客户端（如 Flash Player、Adobe Reader）是否可以加载网站内容的跨域策略文件，防止未授权的跨域访问。
**策略**
• none：不允许加载任何跨域策略文件。
• master-only：仅允许加载根目录下的 crossdomain.xml 文件。
• by-content-type：仅允许加载指定 Content-Type 的策略文件。
• all：允许加载所有位置的策略文件。
**攻击场景**
攻击者控制客户端（如 Flash Player、Adobe Reader）加载网站内容的跨域策略文件，造成未授权的跨域访问
**Apache 上的防御**
Header set X-Permitted-Cross-Domain-Policies "none"
**Nginx 上的防御**
add\_header X-Permitted-Cross-Domain-Policies "none";
## 额外的HTTP标头注入
对标头的不当处理允许攻击者注入任意标头，从而导致缓存中毒、XSS 和其他基于注入的攻击。
**攻击场景：缓存中毒和标头注入**
攻击者注入恶意标头，可能会覆盖缓存策略，从而允许向用户提供有毒或恶意内容。
**Apache/Nginx 上的防御**
净化所有用户输入并避免通过标题暴露敏感数据，确保输入已清理，并且标题在设置之前已正确验证。
## 总结
实施安全标头是一种简单而有效的方法，可增强 web 应用程序的安全性。通过指示浏览器不要进行非预期或者宽松的配置，可以降低某些类型的基于 web 前端攻击的风险。建议开发者可以按需配置适合的HTTP安全标头。