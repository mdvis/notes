| origin              | target               | feature               |
| ------------------- | -------------------- | --------------------- |
| nix-channel         | nix register         | 为交互式命令提供全局默认的 nixpkgs |
| nix-env             | nix profile          |                       |
| nix-shell           | nix develop          |                       |
|                     | nix run              |                       |
|                     | nix shell            |                       |
| nix-build           | nix build            |                       |
| nix-collect-garbage |                      |                       |
|                     | nix store gc --debug |                       |
|                     | nix repl             | 可交互的 nix 环境           |
开启 flakes 后 `nixos-rebuild switch` 命令优先读取 `/etc/nixos/flake.nix`，不能命中再使用`/etc/nixos/configuration.nix`
## 查看 flake 模板
```
nix flake show templates

nix flake init -t templates#full
```
## inputs
它是一个属性集，定义 flake 所有依赖，依赖被拉取后作为参数传递给 outputs 函数
## outputs
其为一个以 inputs 依赖项作为参数的函数，返回一个属性集，这个属性集即为该 flake 的构建结果
### nix packages
- `apps.<system>.<name>`
- `packages.<system>.<name>`
- `legacyPackages.<system>.<name>`

`nix build .#name`
### nix helper functions(lib)
### nix development environments(devShells)
### nixos configurations(`nixosConfigurations.<hostname>`)
`nixos-rebuild switch .#<hostname>`
### nix templates