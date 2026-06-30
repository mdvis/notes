# CLAUDE.md 中英文对照

> 左侧/上方为英文原文，右侧/下方为中文译文。

---

**EN:**
# CLAUDE.md

This file exists because LLMs make predictable mistakes when writing code. Not random mistakes. The same ones, over and over. I've watched it happen enough times to write them down.

These are not suggestions. These are rules. Follow them and you'll produce code that doesn't need to be rewritten. Ignore them and you'll produce code that looks impressive and breaks in production.

**ZH:**
# CLAUDE.md

这个文件的存在，是因为大语言模型在写代码时会犯可预见的错误。不是随机错误，而是同样的问题，一次又一次。我见过太多次了，所以把它们写下来。

这些不是建议，是规则。遵循它们，你产出的代码就不需要返工。无视它们，你产出的代码看起来很惊艳，但会在生产环境中崩溃。

---

**EN:**
## 1. Read Before You Write

The single biggest source of bad LLM code is not reading the existing codebase before writing new code. You see a task, you pattern-match to something in your training data, and you start generating. This is almost always wrong.

**ZH:**
## 1. 先读再写

LLM 生成烂代码最大的根源，就是在写新代码之前没有读现有代码库。你看到一个任务，在你的训练数据里模式匹配到某个东西，然后开始生成。这几乎总是错的。

---

**EN:**
Before writing anything:

- Read the files you're about to modify. Not skim. Read.
- Look at how similar things are done elsewhere in the project. If there's a pattern for API routes, follow that pattern. If there's a utility function that does half of what you need, use it.
- Check the imports at the top of the file. They tell you what libraries this project actually uses. Don't introduce axios if the project uses fetch everywhere. Don't introduce lodash if the project uses native methods.
- Look at the test files. They tell you what the expected behavior actually is, not what you think it should be.

**ZH:**
在写任何东西之前：

- 读一遍你要修改的文件。不是略读，是通读。
- 看看项目里其他地方是怎么做类似事情的。如果有 API 路由的写法惯例，就遵循那个惯例。如果有现成的工具函数已经做了一半你需要的事，就用它。
- 检查文件顶部的 import。它们告诉你这个项目实际用了哪些库。项目里到处用的是 fetch，就别引入 axios。项目里用的是原生方法，就别引入 lodash。
- 看测试文件。它们告诉你预期行为到底是什么，而不是你以为应该是什么。

---

**EN:**
The failure mode here is obvious: you generate "correct" code that's completely alien to the codebase it lives in. It works but it looks like a different person wrote it (because a different entity did). The human then has to either rewrite it to match the project style or live with inconsistency forever. Both are bad.

If you're not sure how something is done in this project, say so. "I don't see a pattern for X in the codebase, should I follow the approach in Y or do something different?" is always better than guessing.

**ZH:**
这里的失败模式很明显：你生成了"正确"的代码，但跟它所在的代码库完全格格不入。能用，但看起来像是另一个人写的（因为确实是另一个实体写的）。然后人类要么重写成符合项目风格的，要么永远忍受不一致。两种结果都很糟。

如果你不确定某个东西在这个项目里是怎么做的，就直说。"我没在代码库里看到 X 的写法惯例，我应该参照 Y 的方式还是另想办法？"这永远比瞎猜要好。

---

**EN:**
## 2. Think Before You Code

Don't start writing code until you've figured out what you're actually doing. This sounds obvious but it's the most common failure mode.

**ZH:**
## 2. 编码前先思考

在你搞清楚自己到底要做什么之前，不要开始写代码。这听起来显而易见，但却是最常见的失败模式。

---

**EN:**
What this looks like in practice:

**State your assumptions.** If the user says "add authentication" that could mean session cookies, JWTs, OAuth, basic auth, or five other things. Don't pick one silently. Say "I'm assuming you want JWT-based auth with refresh tokens, stored in httpOnly cookies. If you want something different, let me know." If you're wrong, you've lost 10 seconds. If you silently guess wrong, you've lost an hour.

**ZH:**
在实践中这意味着：

**说出你的假设。** 如果用户说"加个认证"，那可能是 session cookie、JWT、OAuth、basic auth，或者其他五种东西。不要默默选一个。说"我假设你要的是基于 JWT 的认证，带 refresh token，存在 httpOnly cookie 里。如果你要的是别的，告诉我。"如果你错了，浪费 10 秒。如果你默默猜错了，浪费一小时。

---

**EN:**
**Name the tradeoffs.** Almost every implementation choice has a tradeoff. If you're adding caching, say "this trades memory for speed and introduces cache invalidation as a thing we now have to think about." The user might say "actually I don't want that complexity." Better to know before you write 200 lines.

**ZH:**
**点明取舍。** 几乎每个实现选择都有取舍。如果你要加缓存，就说"这是用内存换速度，代价是我们现在要多考虑缓存失效的问题。"用户可能会说"其实我不想要这种复杂度。"在写 200 行代码之前知道这个，比写完再知道要好。

---

**EN:**
**If multiple approaches exist, present them briefly.** Not five. Two, maybe three. With a recommendation. "There are two ways to do this. Option A is simpler but doesn't handle edge case X. Option B handles everything but adds a dependency on Z. I'd go with A unless you expect X to actually happen."

**ZH:**
**如果有多种方案，简要呈现。** 不要列五个。两个，最多三个。带上推荐。"有两种做法。方案 A 更简单，但处理不了边界情况 X。方案 B 全都能处理，但多了一个对 Z 的依赖。除非你预期 X 真的会发生，否则我选 A。"

---

**EN:**
**If something is confusing, stop.** Don't fill confusion with plausible-sounding code. The result of generating code when you don't understand the requirements is code that passes a casual review but fails when it matters. Just say what's confusing and ask.

**ZH:**
**如果有什么不清楚的，停下来。** 不要用听起来合理的代码去填补困惑。在你不理解需求时生成代码，结果是代码能通过随意一瞥的 review，但在关键时刻会失败。直接说哪里不清楚，然后问。

---

**EN:**
## 3. Simplicity

Write the minimum amount of code that solves the problem. Not the minimum amount of code you can imagine theoretically solving the problem. The minimum amount that actually solves this specific problem right now.

**ZH:**
## 3. 简洁

写最少量的、能解决问题的代码。不是你想象中理论上能解决问题的最少代码量，而是现在实际能解决这个具体问题的最少代码量。

---

**EN:**
The instinct to over-engineer is strong. Resist it. Here's what over-engineering looks like in practice:

**ZH:**
过度设计的冲动很强。抵制它。以下是过度设计在实践中长什么样：

---

**EN:**
**Premature abstraction.** You need to send one type of email. You write an EmailService class with a strategy pattern that supports multiple providers, template engines, and retry policies. The user wanted `sendWelcomeEmail(user)`. Write that function. If they need more later, they'll ask.

**ZH:**
**过早抽象。** 你需要发一种邮件。你写了一个 EmailService 类，用策略模式支持多个服务商、模板引擎和重试策略。用户要的是 `sendWelcomeEmail(user)`。写那个函数。如果以后需要更多，他们会说的。

---

**EN:**
```python
# bad: you wrote this
class EmailService:
    def __init__(self, provider: EmailProvider, template_engine: TemplateEngine):
        self.provider = provider
        self.template_engine = template_engine

    async def send(self, template: str, context: dict, recipient: str, **kwargs):
        rendered = self.template_engine.render(template, context)
        await self.provider.send(recipient, rendered, **kwargs)

# good: you should have written this
async def send_welcome_email(user):
    body = f"Welcome {user.name}! Your account is ready."
    await send_email(to=user.email, subject="Welcome", body=body)
```

**ZH:**
```python
# 坏：你写了这个
class EmailService:
    def __init__(self, provider: EmailProvider, template_engine: TemplateEngine):
        self.provider = provider
        self.template_engine = template_engine

    async def send(self, template: str, context: dict, recipient: str, **kwargs):
        rendered = self.template_engine.render(template, context)
        await self.provider.send(recipient, rendered, **kwargs)

# 好：你应该写这个
async def send_welcome_email(user):
    body = f"Welcome {user.name}! Your account is ready."
    await send_email(to=user.email, subject="Welcome", body=body)
```

---

**EN:**
**Speculative error handling.** You wrap everything in try/catch blocks for errors that can't happen. You validate inputs that come from your own code and are already validated upstream. You add null checks on values that are never null. Every line of error handling is a line someone has to read and understand. Only handle errors that can actually occur.

**ZH:**
**投机性错误处理。** 你为不可能发生的错误包了 try/catch。你验证来自自己代码、上游已经验证过的输入。你给永远不会是 null 的值加 null 检查。每一行错误处理都是一行需要有人去读和理解的东西。只处理实际会发生的错误。

---

**EN:**
**Unnecessary configurability.** You make the batch size a parameter. You make the retry count configurable. You add environment variables for things that will never change. Configuration is not free. Every config option is a decision someone has to make and a value someone has to set correctly. Hardcode things until there's a real reason not to.

**ZH:**
**不必要的可配置性。** 你把批处理大小做成参数。你把重试次数做成可配置的。你给永远不会变的东西加环境变量。配置不是免费的。每个配置项都是某人要做的一个决定、某人要正确设置的一个值。在真正有理由之前，写死就好。

---

**EN:**
**Dead flexibility.** Interfaces with one implementation. Abstract base classes with one child. Generic type parameters that are only ever instantiated with one type. These things have a cost (cognitive overhead, indirection, more files to navigate) and zero benefit until a second implementation actually exists.

**ZH:**
**死灵活性。** 只有一个实现的接口。只有一个子类的抽象基类。只被一种类型实例化的泛型参数。这些东西有成本（认知负担、间接层、要翻阅的更多文件），而在第二个实现真正出现之前，零收益。

---

**EN:**
The test for simplicity: show your code to someone unfamiliar with the project. If they have to ask "why is this abstracted like this?" and the answer is "in case we need to..." then you've over-engineered it. "In case we need to" is not a requirement. It's a guess about the future, and guesses about the future are usually wrong.

**ZH:**
简洁的检验标准：把你的代码给一个不熟悉项目的人看。如果他们要问"为什么这个要这样抽象？"而答案是"万一我们需要……"那你就是过度设计了。"万一我们需要"不是需求，是对未来的猜测，而对未来的猜测通常是错的。

---

**EN:**
## 4. Surgical Changes

When you edit existing code, your diff should be as small as possible. Every line you change is a line that could introduce a bug, a line someone has to review, and a line that shows up in git blame forever.

**ZH:**
## 4. 外科手术式修改

当你修改现有代码时，你的 diff 应该尽可能小。你改的每一行都可能引入 bug，都是一行需要有人 review 的，都是一行会永远出现在 git blame 里的。

---

**EN:**
Rules:

**Don't touch what you weren't asked to touch.** If you're fixing a bug in function A and you notice function B has a weird variable name, leave it. If function C has a comment with a typo, leave it. If the import order doesn't match your preference, leave it. Your job is to fix the bug in function A.

**ZH:**
规则：

**不要碰你没被要求碰的东西。** 如果你在修函数 A 的 bug，发现函数 B 有个奇怪的变量名，别管它。如果函数 C 的注释里有个错别字，别管它。如果 import 顺序不符合你的偏好，别管它。你的工作是修函数 A 的 bug。

---

**EN:**
**Match the existing style.** If the file uses single quotes, use single quotes. If the file uses `snake_case`, use `snake_case`. If the file has no semicolons, don't add semicolons. If the file uses `var` (yes, even in 2025), use `var` in your additions unless the user asked you to modernize. Consistency within a file beats your personal preference.

**ZH:**
**匹配现有风格。** 如果文件用单引号，你就用单引号。如果文件用 `snake_case`，你就用 `snake_case`。如果文件没有分号，就别加分号。如果文件用 `var`（没错，即使到了 2025 年），在你的新增代码里也用 `var`，除非用户要求你现代化。文件内的一致性胜过你的个人偏好。

---

**EN:**
**Clean up after yourself, not after others.** If your change makes an import unused, remove that import. If your change makes a variable unused, remove that variable. If your change makes a function unused, remove that function. But only if YOUR change caused it. Pre-existing dead code is not your problem unless someone asked you to clean it up.

**ZH:**
**收拾自己的烂摊子，不是别人的。** 如果你的改动导致某个 import 不再被使用，删掉它。如果你的改动导致某个变量不再被使用，删掉它。如果你的改动导致某个函数不再被使用，删掉它。但仅限于你的改动导致的。既有的死代码不是你的问题，除非有人让你清理。

---

**EN:**
**Don't reformat.** Don't run prettier on a file that wasn't formatted with prettier. Don't change indentation from 4 spaces to 2. Don't reorder imports alphabetically if they weren't alphabetical before. Reformatting creates massive diffs that hide your actual changes and make code review painful.

**ZH:**
**不要重新格式化。** 不要对没用 prettier 格式化过的文件跑 prettier。不要把 4 空格缩进改成 2 空格。如果 import 之前不是按字母排序的，别重新按字母排。重新格式化会产生巨大的 diff，掩盖你实际的改动，让 code review 痛苦不堪。

---

**EN:**
The test: look at your diff. Can you justify every single changed line with a direct connection to what was asked? If any line is there because "while I was in there I thought I'd..." then revert it.

**ZH:**
检验标准：看你的 diff。每一行改动你能不能直接关联到被要求的任务来解释？如果有任何一行是因为"既然都在这了，我想顺手……"那就回退它。

---

**EN:**
## 5. Verification

The difference between code that works and code you think works is testing. You should be paranoid about this distinction.

**ZH:**
## 5. 验证

能用的代码和你以为能用的代码之间的区别，就是测试。你应该对这个区别保持偏执。

---

**EN:**
**Write the test first when fixing bugs.** Before you fix anything, write a test that reproduces the bug. Run it. Watch it fail. Then fix the bug. Run the test. Watch it pass. This is not optional and not TDD dogma. It's the only way to prove you actually fixed the thing and didn't just make the symptoms go away.

**ZH:**
**修 bug 时先写测试。** 在修任何东西之前，先写一个能复现 bug 的测试。跑它。看它失败。然后修 bug。再跑测试。看它通过。这不是可选的，也不是 TDD 教条。这是唯一能证明你确实修了问题、而不是让症状消失的方法。

---

**EN:**
**Run existing tests before and after your changes.** If tests passed before your change and fail after, you broke something. This is obvious. What's less obvious: if tests were already failing before your change, say so. Don't silently ignore pre-existing failures and let your changes get blamed for them.

**ZH:**
**在改动前后都跑现有测试。** 如果测试在改动前通过、改动后失败，你弄坏了什么。这很显然。不那么显然的是：如果测试在改动前就已经失败了，说出来。不要默默忽略既有的失败，让你的改动背锅。

---

**EN:**
**Don't write tests for the sake of writing tests.** A test that checks whether a constructor sets properties is worthless. A test that checks whether your validation actually rejects bad input is valuable. Test behavior, not implementation. Test the interesting cases, not the trivial ones.

**ZH:**
**不要为了写测试而写测试。** 检查构造函数是否设置了属性的测试一文不值。检查你的验证是否真的拒绝了坏输入的测试才有价值。测行为，不测实现。测有意义的场景，不测琐碎的。

---

**EN:**
**If you can't write a test, say why.** Sometimes the architecture makes testing hard. That's useful information. "I can't easily test this because the database calls are tightly coupled to the business logic" is a signal that something might need to be restructured. Don't just skip testing and hope.

**ZH:**
**如果写不了测试，说明原因。** 有时候架构让测试变得困难。这是有用的信息。"我没法轻易测这个，因为数据库调用和业务逻辑耦合得太紧"这本身就是一个信号，说明可能需要重构。不要只是跳过测试然后祈祷。

---

**EN:**
## 6. Goal-Driven Execution

Every task should have a clear success criterion before you start writing code. If the criterion is vague, make it specific. If you can't make it specific, ask.

**ZH:**
## 6. 目标驱动执行

每个任务在开始写代码之前都应该有明确的成功标准。如果标准模糊，就把它具体化。如果没法具体化，就问。

---

**EN:**
Transform vague tasks into verifiable ones:

- "Add validation" becomes "reject inputs where email is missing or invalid, return 400 with a message that says what's wrong, add tests for both cases"
- "Fix the bug" becomes "write a test that reproduces the reported behavior, make the test pass, verify existing tests still pass"
- "Improve performance" becomes "profile first, identify the bottleneck, fix that specific thing, measure again"

**ZH:**
把模糊的任务转化成可验证的：

- "加验证"变成"拒绝 email 缺失或无效的输入，返回 400 并带上说明哪里不对的消息，为两种情况都加测试"
- "修 bug"变成"写一个能复现报告行为的测试，让测试通过，验证现有测试仍然通过"
- "提升性能"变成"先做性能分析，定位瓶颈，修那个具体问题，再测一次"

---

**EN:**
For anything that takes more than one step, state the plan before executing:

```
Plan:
1. Add the new database column with a migration
2. Update the model to include the new field
3. Modify the API endpoint to accept and return the field
4. Add validation for the field
5. Write tests for the new behavior
6. Run full test suite to check for regressions
```

**ZH:**
对于需要多步骤的事情，在执行前先陈述计划：

```
计划：
1. 通过 migration 添加新的数据库字段
2. 更新 model 包含新字段
3. 修改 API 端点以接受和返回该字段
4. 为该字段添加验证
5. 为新行为编写测试
6. 运行完整测试套件检查回归
```
