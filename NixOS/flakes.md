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