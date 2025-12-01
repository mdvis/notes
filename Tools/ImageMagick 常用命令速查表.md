## 📂 基础操作
```bash
# 查看文件信息
magick identify image.jpg
# 转换格式 (JPG → PNG)
magick input.jpg output.png
# 批量转换格式
magick mogrify -format png *.jpg
```
## ✂️ 图像裁剪 / 调整
```bash
# 裁剪 (100x100 从左上角开始)
magick input.jpg -crop 100x100+0+0 output.jpg
# 缩放 (保持比例，宽度 800)
magick input.jpg -resize 800x output.jpg
# 缩放 (固定宽高 800x600，可能变形)
magick input.jpg -resize 800x600! output.jpg
# 居中裁剪为正方形
magick input.jpg -gravity center -crop 500x500+0+0 +repage output.jpg
```
## 🎨 图像优化 / 调整
```bash
# 调整质量 (JPEG 压缩)
magick input.jpg -quality 85 output.jpg
# 转灰度
magick input.jpg -colorspace Gray output.jpg
# 调整亮度/对比度
magick input.jpg -brightness-contrast 10x20 output.jpg
# 调整饱和度 (modulate: 亮度,饱和度,色相)
magick input.jpg -modulate 100,120,100 output.jpg
```
## 📝 文本与水印
```bash
# 添加文字水印
magick input.jpg -gravity southeast -pointsize 36 -fill white -annotate +10+10 "© MyBrand" output.jpg
# 添加图片水印
magick composite -gravity southeast -geometry +10+10 logo.png input.jpg output.jpg
```
## 📚 多图操作
```bash
# 合并多图 (水平拼接)
magick convert +append img1.jpg img2.jpg output.jpg
# 合并多图 (垂直拼接)
magick convert -append img1.jpg img2.jpg output.jpg
# 生成 GIF 动画
magick convert -delay 50 -loop 0 *.png animation.gif
```
## 🔍 图像特效
```bash
# 模糊
magick input.jpg -blur 0x8 output.jpg
# 高斯模糊
magick input.jpg -gaussian-blur 0x4 output.jpg
# 边缘检测
magick input.jpg -edge 1 output.jpg
# 反相
magick input.jpg -negate output.jpg
```
## 🧩 图像合成
```bash
# 两图叠加 (50% 透明)
magick composite -dissolve 50 input1.png input2.png output.png
# 层叠合并 (左上角贴图)
magick composite -gravity northwest overlay.png background.jpg output.jpg
```
## ⚡ 批量处理
```bash
# 批量缩放图片到宽度 800
magick mogrify -resize 800x *.jpg
# 批量转灰度
magick mogrify -colorspace Gray *.png
```
## 🚀 小贴士
- 新版用 `magick` 代替 `convert`，避免与系统命令冲突
- `mogrify` 用于批量修改原文件（会覆盖）
- `composite` 专门用于图片叠加合成
- 建议先用 `identify` 查看图片信息再处理