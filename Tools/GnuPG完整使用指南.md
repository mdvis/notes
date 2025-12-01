# GnuPG 使用指南

## 目录
1. [GnuPG 基本概念](#gnupg-基本概念)
2. [基础命令](#基础命令)
3. [密钥管理](#密钥管理)
4. [加密与解密](#加密与解密)
5. [数字签名](#数字签名)
6. [子密钥管理](#子密钥管理)
7. [交互式编辑](#交互式编辑)
8. [高级配置](#高级配置)
9. [安全最佳实践](#安全最佳实践)

## GnuPG 基本概念

### GnuPG 目录结构
```
~/.gnupg/
├── private-keys-v1.d/    # 存放私钥
├── pubring.kbx           # 以其他格式存放的公钥环，与 gpgsm 共享
├── trustdb.gpg           # 存放信任数据
└── openpgp-revocs.d/     # gpg 存储预先生成的吊销证书的目录。文件名对应于相应密钥的OpenPGP指纹。建议备份这些证书
```

### GnuPG 常见缩写及概念

| **简写**                     | **含义** | **描述**                |
| -------------------------- | ------ | -------------- |
| key pair                   |        | 密钥对(包含两部分)     |
| primary key [master key]   |        | 主密钥（包括主公钥，主私钥） |
| public key                 | pub    | 主公钥            |
| secret key                 | sec    | 主私钥            |
| sub-key                    | sub    | 子公钥            |
| secret sub-key             | ssb    | 子私钥            |
| key fingerprint            |        | 密钥指纹           |

### 密钥功能标识

| **标识** | **含义**       | **作用**                                                      |
| ------ | ------------ | ----------------------------------------------------------- |
| S      | sign         | 签名功能                                                        |
| E      | encrypt      | 加密功能                                                        |
| A      | authenticate | 身份验证功能,在其他协议中用于身份验证，例如SSH TLS。只能通过 `--expert`选项制作具有该功能的子公钥。 |
| C      | certify      | 认证，主密钥必备能力，且只有主密钥具有                                         |

### 信任等级

五个信任等级:

1. **Ultimate**：绝对信任，只会出现在你自己的密钥上。
2. **Full**：完全信任，你相信这个密钥，并信任它可以很好地管理签发密钥。使用这个密钥签名的其他密钥也会受到信任。比如，你完全信任了`小明的密钥` ，那么由小明签名过的`小美的密钥`也会受到信任。
3. **Marginal**：相对信任，你相信这个密钥本身，但不确定它签名的密钥是否一定正确。如果一个密钥被至少三个 Marginal 级别的密钥签名，那么该密钥也是可信的。
4. **Never**：绝不信任，这个密钥是完全不可信的。这也许以为着密钥的所有者并不能确保它签名的密钥有效，或是该密钥已被泄露因此不再可信。
5. **Unknown**：未知，这是密钥的默认信任级别，该级别的密钥不会被信任。

### GnuPG 特性
- 具备同一功能的密钥优先使用 ==最新== ==未吊销== 的密钥
- 密钥过期时间相当于自签名（自己的私钥给公钥签名）（签名只能覆盖不能删除）
- 公私钥 keyID 是相同的，一起创建，每个公钥对应一个私钥
- 主密钥可绑定多个子密钥，平时使用的均为子密钥，主密钥只在新建、撤销、废除、认证密钥等某些特定情况才使用
- 正确使用方式是导出主私钥备份，删除本机主私钥，只使用保留的子私钥用于日常操作

### 用户身份（UID）简介

uid 即 user id, 一个 uid 由三个部分组成：
- 全名（一般是实名）
- 注释（用 ( ) 包括）
- 邮箱地址（用 < > 包括）

这三个部分都是可选的，只要有一项即可。

```
全名   注释    邮箱
mdvis (mdvis) <xn***is@out***.com>
```

- 一个密钥可以有多个 uid，方便不同场合使用
- uid 与哪个子密钥无关，uid 是作用于整个密钥的
- uid 可以随时添加，但已有的 uid 不能修改，只能单独吊销
- uid 单独吊销后，只需要重新发布公钥即可

如果你希望只用一个密钥，但某些身份不公开，你需要小心配置你的公钥，不过最好还是另外用一个密钥。

## 基础命令

### 创建新的密钥对
```bash
# 简单交互生成密钥，算法默认
gpg --gen-key

# 完整交互生成密钥
gpg --full-gen-key

# 更精细的交互，启用更多参数调整
gpg --full-gen-key --expert
```

### 密钥列表
```bash
# 列出公钥环中的密钥
gpg --list-keys
gpg --list-key
gpg -k

# 列出密钥环中的密钥
gpg --list-secret-keys
gpg -K

# 显示密钥ID (默认不显示，需要添加参数)
gpg -k --keyid-format short
# keyid-format 可选: none | short | 0xshort | long | 0xlong

# 输出公钥指纹
gpg --fingerprint <UserID>  # 如果省略UserID则打印所有用户的
```

### 删除密钥
```bash
# 删除公钥
gpg --delete-key <key>

# 删除私钥
gpg --delete-secret-key <key>
```

### 密钥导入导出
```bash
# 导出公钥
gpg --export --armor <User Name> --output public.key

# 导出私钥
gpg --export-secret-keys -a <User Name> -o private.key

# 导入公钥
gpg --import public.key

# 导入私钥 (需要建立信任关系)
gpg --import private.key
gpg --edit-key KEY
gpg> trust
gpg> quit
```

### 密钥服务器操作
```bash
# 上传公钥到公钥服务器
gpg --send-keys "KEY ID"

# 在公钥服务器搜索并导入指定ID的公钥
gpg --keyserver keyserver.ubuntu.com --search-keys <key>

# 直接根据KeyID导入公钥
gpg --recv-keys KeyID

# 更新所有公钥
gpg --refresh-keys
```

**注意**：不能从公钥服务器删除公钥。将 Key 上传至 Key Server 基本上是一个不可逆的行为，即使你吊销了 Key 或者 Key 过期了， Key Server 会将该 Key 标记为已吊销或者已过期，但不会删除。

## 加密与解密

### 加密文件
```bash
gpg -a -r "Receiver" -o output.enc -e filename
```
- `-r/--recipient <Receiver>` 用于指定接收用户，可多次使用`-r xxx`以实现对多个用户的加密
- `-e/--encrypt`指定加密的文件名
- `-a/--armor` 采用ASCII码形式显示

### 解密文件
```bash
gpg -o mydata.dec -d mydata.gpg
```
- `-d/--decrypt` 指定解密的文件名

## 数字签名

有三种签名方式：

### 1. 分离签名 (`--detach-sign` 或 `-b`)
单独生成签名文件

```bash
# 生成签名
gpg -o file.asc -b data

# 验证方式
gpg --verify file.asc data
```

### 2. 明文签名 (`--clearsign`)
在原文件保持明文的基础上加入签名

```bash
# 生成签名
gpg -o file --clearsign data

# 验证方式
gpg --verify test
# 或
gpg -d test (推荐前者，会检测是不是分离签名)

# 将签名中的数据单独提取到 output 文件中
gpg -o output -d test
```

**特点**：此选项用于 ASCII（文本）数据

### 3. 标准签名 (`--sign`)
不存在明文（但是实际上没有加密），可以使用 `--verify` 验证签名，但是看不到明文。使用 `gpg -d` 时能看到明文与签名。很少单独使用，常见用法见下一项。

### 签名并加密文件
```bash
gpg -r User1 -r User2 -s -o data.enc -e data
```

以 User1，User2 为接收者，签名并加密文件 data，输出加密后的文件到 data.enc 中

```bash
gpg --local-user [发信者ID] --recipient [接收者ID] --armor --sign --encrypt demo.txt
```
- `--local-user` 指定用发信者的私钥签名
- `--recipient` 指定用接收者的公钥加密
- `--armor` 表示采用ASCII码形式显示
- `--sign` 表示需要签名
- `--encrypt` 表示指定源文件。

**补充**：
```bash
gpg --edit-key id  //对导入秘钥签名
gpg> fpr           # 显示指纹
gpg> sign          # 签名
gpg> quit
```

## 子密钥管理

### 生成子密钥
1. `gpg --expert --edit-key UserID`
   - `--expert`可以启用更多调整选项，可以不启用
   - `--edit-key` 编辑已经生成好的主密钥，进入 `gpg` 提示符模式

2. 输入 `addkey`，添加子密钥
   - 美国国家标准与技术研究院（NIST）系列椭圆曲线、Brainpool系列椭圆曲线、secp256k1都存在不同的安全风险，不予考虑。
   - 25519椭圆曲线是最快的椭圆曲线之一，而且没有专利壁垒，是公有领域的产品，25519 曲线作为 P-256 的成功替代者，被众多应用广泛使用，支持良好。
   - 设置过期时间，子密钥过期时间可以较短，这里设置为3年，之后的确认，输入密码即可。
   - 同理创建分别用于E,S,A的三个子密钥，save 保存并退出

### 子密钥备份
```bash
# 备份所有子密钥到文件 subkeys
gpg -a --export-secret-subkeys [UserID] > subkeys
```

### 子密钥导入
与普通密钥相同，使用`--import`

### 子密钥删除
与普通密钥相同，使用`--delete-keys ID`
如果`gpg -K`看不到子密钥ID，可使用`gpg -K --keyid-format short`

### 子密钥吊销
与密钥吊销部分相同，使用`--edit-key UserID`进入终端来吊销，参看使用交互终端吊销章节。

**注意**：GPG 不允许用户生成子密钥的吊销证书，而是把变更都放在唯一的公钥中，简洁且不易出错。你只需要编辑主公钥，将子密钥单独吊销，然后重新发布公钥即可，这样大家就都知道了。

## 交互式编辑

### 进入编辑模式
```bash
gpg --edit-key [USERID]  # 进入交互式窗口
gpg> help  # 获取帮助
```

### 编辑模式常用子命令

| 子命令       | 作用                     |
| --------- | ---------------------- |
| addkey    | 添加子密钥（加密、签名、认证）        |
| delkey    | 删除子密钥                  |
| adduid    | 添加用户标识（邮件、名称）          |
| deluid    | 删除用户标识                 |
| fpr       | 显示当前密钥指纹               |
| keyserver | 设置或查看用于密钥同步的密钥服务器      |
| list      | 列出主密钥和子密钥的详细信息         |
| save      | 保存并退出                  |
| quit      | 退出不保存                  |
| sign      | 使用密钥签署其他密钥或主密钥，以认证其可信度 |
| trust     | 设置密钥的信任级别              |
| revuid    | 撤销用户标识                 |
| revkey    | 撤销当前密钥,使其不可用           |
| expire    | 设置或修改密钥的过期时间           |
| passwd    | 更改密钥密码                 |
| setpref   | 设置或更改密钥的首选加密算法         |
| revoke    | 项密钥添加撤销证书，使该密钥不可用      |
| edit      | 进入编辑模式，可以修改密钥配置或密钥标识   |
| uid       | 选择用户标识                 |
| key       | 选择子密钥                  |

### 常用修改操作
```bash
passwd    # 修改密码
uid       # 选择用户标识 N(可以使用索引和ID)
key       # 选择子密钥 N(可以使用索引和ID)
expire    # 变更密钥或所选子密钥的使用期限
primary   # 标记所选的用户标识为主要
trust     # 修改对该密钥的信任程度（会立即更新信任数据库，无需保存）
delkey    # 删除选定的子密钥
revsig    # 吊销所选用户标识上的签名
revuid    # 吊销选定的用户标识
revkey    # 吊销密钥或选定的子密钥
save      # 保存并退出
quit      # 退出交互式终端

change-usage  # 修改密钥权限
```

## 高级配置

### 指定 GnuPG 的主目录
用于指定 GnuPG 的主目录（home directory）。GnuPG 的主目录是存储密钥环（公钥和私钥）、配置文件以及其他相关数据的地方。默认情况下，GnuPG 的主目录是 `~/.gnupg`（即用户主目录下的 `.gnupg` 文件夹）。

```bash
--homedir <directory>  # 指定主目录
-- command <command>    # 要执行的 gpg 命令
```

### 公钥服务器
hkp(HTTP Keyserver Protocol)：[HTTP Keyserver Protocol](https://tools.ietf.org/html/draft-shaw-openpgp-hkp-00),公钥服务器可以通过交换机制同步新上传的公钥,公钥服务器没有检查机制，任何人都可以用你的名义上传公钥，所以没有办法保证服务器上的公钥的可靠性,一般可以通过公钥的指纹来核对，但是指纹也会被伪造

### 配置文件
默认的配置文件是 `~/.gnupg/gpg.conf` 和 `~/.gnupg/dirmngr.conf`. 不会自动创建，需要手动创建并添加需要的配置

```bash
# 创建配置文件 ~/.gnupg/gpg.conf

# 添加如下内容
################################################################################
# GnuPG View Options

# 显示keyId 16位 16进制数字
# Select how to display key IDs. "long" is the more accurate (but less
# convenient) 16-character key ID. Add an "0x" to include an "0x" at the
# beginning of the key ID.
keyid-format 0xlong

# 显示指纹标识
# List all keys with their fingerprints. This is the same output as --list-keys
# but with the additional output of a line with the fingerprint. If this
# command is given twice, the fingerprints of all secondary keys are listed too.
with-fingerprint

# 保存退出
```

### gpg-agent 重启
```bash
gpg-connect-agent /bye
```

## 安全最佳实践

### GPG 常规安全流程
基本思想：主私钥只保留签名功能，平时离线保存不使用，仅使用子密钥，若子密钥泄露则单独吊销子密钥。

1. **创建主密钥对**
   ```bash
   gpg --full-gen-key --expert
   ```
   使用完全版密钥生成，并启用更多参数调整。取消主密钥SAE功能，仅保留C功能，使用时间可以是永久。

2. **创建子私钥**
   可使用ECC算法+Curve 25519曲线，分别创建S，A，E功能的子私钥，使用时间几年即可

3. **备份重要文件**
   导出所有子私钥 `subkeys`，所有私钥 `allkeys`，吊销证书 `revoke` 三个文件（不用公钥）使用智能卡或U盘等离线备份 `allkeys`，`revoke` 文件，原文件记得删

4. **删除本地主私钥**
   ```bash
   # 删除所有私钥（不删公钥）
   gpg --delete-secret-keys <keyid>
   ```

5. **导入子私钥**
   ```bash
   gpg --import subkeys
   ```
   若再次用`-K`参数列出私钥，可以看到主密钥私钥一行 `sec` 后有了一个 `#` 字符，这说明在本设备上缺失主密钥的私钥，也即成功离线备份了主密钥的私钥。

6. **发布公钥**
   上传公钥到服务器

### 修改密钥相关数据
```bash
gpg --edit-key [USERID]  # 进入交互式窗口
```

### 使用交互终端吊销子密钥
1. 使用 `list` 查看需要吊销的子密钥ID
2. 使用 `key <ID>` 选中子密钥（或者使用索引），被选中的子密钥ssb后会有 `*`号
3. 输入 `revkey` 吊销选定的子密钥，如果公钥上传到了服务器上，在本地吊销后还需使用 `gpg --send-keys [USER_NAME]` 发布吊销信息。

### 使用吊销证书吊销整个密钥
1. 生成吊销证书
   ```bash
   gpg --gen-revoke USER_NAME > revoke
   ```

2. 导入吊销证书
   ```bash
   gpg --import revoke
   ```
   此时本地对应的密钥已经是吊销状态

3. 发布吊销信息
   ```bash
   gpg --send-keys [USER_NAME]
   ```
   如果之前已经发布到密钥服务器上，需要发布吊销信息