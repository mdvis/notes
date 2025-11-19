## fork
```sh
path/script.sh
```
会在子shell中执行，从父shell继承环境变量，子shell环境变量不会带回父shell，执行完返回父shell
## exec
```sh
exec path/script.sh
```
不需要子shell，脚本在同一个shell执行，但是父脚本exec语句后的部分不再执行(与source区别)
## source
```sh
source path/script.sh
```
无子shell，在同一个shell中执行。被调用脚本变量和环境变量都可在主脚本中进行