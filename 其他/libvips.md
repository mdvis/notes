| 功能     | 正确命令                                              |
| ------ | ------------------------------------------------- |
| 查看信息   | `vipsheader -a img.png`                           |
| 转 WebP | `vips copy img.png out.webp[Q=80]`                |
| 裁剪     | `vips crop img.png out.png 100 50 300 300`        |
| 缩放     | `vips resize img.png out.png 0.5`                 |
| 横向拼接   | `vips arrayjoin "a.png b.png" out.png --across 2` |