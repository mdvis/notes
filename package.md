## 📦 package.json 核心配置项总表

| 分类         | 配置项                    | 作用                     | 用法示例                                                                                  |
| ---------- | ---------------------- | ---------------------- | ------------------------------------------------------------------------------------- |
| **基础信息**​  | `name`                 | 包名（npm 唯一标识）           | `"name": "my-project"`                                                                |
|            | `version`              | 版本号（SemVer）            | `"version": "1.0.0"`                                                                  |
|            | `description`          | 项目描述                   | `"description": "A utils lib"`                                                        |
|            | `private`              | 禁止发布到 npm              | `"private": true`                                                                     |
|            | `license`              | 开源协议                   | `"license": "MIT"`                                                                    |
|            | `author`               | 作者信息                   | `"author": "Your Name"`                                                               |
|            | `homepage`             | 项目主页                   | `"homepage": "https://example.com"`                                                   |
|            | `repository`           | 源码仓库                   | `"repository": { "type": "git", "url": "https://github.com/user/repo.git" }`          |
|            | `bugs`                 | 问题反馈地址                 | `"bugs": { "url": "https://github.com/user/repo/issues" }`                            |
|            | `funding`              | 赞助链接                   | `"funding": "https://github.com/sponsors/user"`                                       |
| **入口与模块**​ | `main`                 | CommonJS 入口            | `"main": "dist/index.cjs.js"`                                                         |
|            | `module`               | ESM 入口（Tree Shaking）   | `"module": "dist/index.esm.js"`                                                       |
|            | `types`/ `typings`     | TypeScript 类型入口        | `"types": "dist/index.d.ts"`                                                          |
|            | `type`                 | 模块系统类型                 | `"type": "module"`                                                                    |
|            | `exports`              | 现代包入口（条件导出）            | `"exports": { ".": { "import": "./dist/index.mjs", "require": "./dist/index.cjs" } }` |
|            | `browser`              | 浏览器环境适配                | `"browser": { "./lib/node.js": false }`                                               |
|            | `bin`                  | CLI 命令入口               | `"bin": { "my-cli": "bin/cli.js" }`                                                   |
| **脚本**​    | `scripts`              | npm 脚本命令               | `"scripts": { "dev": "nodemon app.js", "build": "tsc" }`                              |
| **依赖管理**​  | `dependencies`         | 生产依赖                   | `"dependencies": { "express": "^4.18.2" }`                                            |
|            | `devDependencies`      | 开发依赖                   | `"devDependencies": { "jest": "^29.0.0" }`                                            |
|            | `peerDependencies`     | 宿主依赖（插件）               | `"peerDependencies": { "react": ">=18.0.0" }`                                         |
|            | `optionalDependencies` | 可选依赖                   | `"optionalDependencies": { "fsevents": "^2.3.0" }`                                    |
|            | `engines`              | Node / npm 版本限制        | `"engines": { "node": ">=18", "npm": ">=9" }`                                         |
|            | `os`                   | 操作系统限制                 | `"os": ["linux", "darwin"]`                                                           |
|            | `cpu`                  | CPU 架构限制               | `"cpu": ["x64", "arm64"]`                                                             |
| **构建与优化**​ | `sideEffects`          | 标记是否有副作用（Tree Shaking） | `"sideEffects": false`或 `"sideEffects": ["**/*.css"]`                                 |
|            | `files`                | 发布时包含的文件               | `"files": ["dist", "README.md"]`                                                      |
|            | `publishConfig`        | 发布配置                   | `"publishConfig": { "access": "public", "registry": "https://registry.npmjs.org/" }`  |
| **工程配置**​  | `workspaces`           | Monorepo 子包管理          | `"workspaces": ["packages/*"]`                                                        |
|            | `config`               | 自定义脚本配置                | `"config": { "port": 3000 }`                                                          |
|            | `browserslist`         | 浏览器兼容目标                | `"browserslist": "> 1%, last 2 versions"`                                             |
## 🔎 高频面试 / 实战速查表（精简版）

| 场景       | 必选配置                                                         |
| -------- | ------------------------------------------------------------ |
| npm 库    | name / version / main / module / types / files / sideEffects |
| CLI 工具   | bin / preferGlobal                                           |
| 前端库      | module / sideEffects / browser                               |
| 后端服务     | type / engines / scripts                                     |
| Monorepo | workspaces / private                                         |
| TS 项目    | types / scripts / devDependencies                            |
| 发布控制     | files / publishConfig / private                              |