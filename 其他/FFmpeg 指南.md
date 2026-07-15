`-i <file>` 输入文件（远程/本地）
`-y` 强制覆盖文件
`-n` 禁止覆盖文件
`-f` 强制输入/输出格式
- `-f <type> -i <file>` 输入
- `-f <type> <file>` 输出
`-acodec` / `-c:a` 指定音频解码器
`-vcodec` / `-c:v` 指定视频解码器
`-protocol_whitelist` 允许的网络协议，限制输入输出源的协议类型
## 📂 基础信息
```bash
# 查看媒体文件信息
ffmpeg -i input.mp4
```
### 查询支持的功能
```
ffmpeg -formats 查看支持的格式
ffmpeg -codecs 查看支持的编解码器
ffmpeg -filters 滤镜
ffmpeg -protocols 协议
ffmpeg -devices 查询设备支持
ffmpeg -buildconf 查看编译时支持的库
```
## 🎬 视频处理
### 1. 格式转换
```bash
# MP4 → MKV（仅转封装，不重新编码，速度快、无损）
ffmpeg -i input.mp4 -c copy output.mkv
```
### 2. 视频压缩
```bash
# 压缩为 H.264，降低比特率
ffmpeg -i input.mp4 -vcodec libx264 -crf 23 -preset fast -acodec aac output.mp4
# crf：质量控制，0=无损，18~28 常用（数值越大体积越小，质量越差）
```
### 3. 裁剪片段
```bash
# 从 00:01:00 开始，截取 30 秒
ffmpeg -ss 00:01:00 -i input.mp4 -t 30 -c copy output.mp4
```
### 4. 改变分辨率/帧率
```bash
# 4K → 1080p
ffmpeg -i input.mp4 -vf scale=1920:1080 output.mp4
# 改为 30fps
ffmpeg -i input.mp4 -r 30 output.mp4
```
### 5. 添加水印
```bash
ffmpeg -i input.mp4 -i logo.png -filter_complex "overlay=10:10" output.mp4
```
---
## 🎵 音频处理
### 1. 提取音频
```bash
ffmpeg -i input.mp4 -vn -acodec copy output.aac
```
### 2. 格式转换
```bash
ffmpeg -i input.wav -acodec mp3 output.mp3
```
### 3. 裁剪音频
```bash
ffmpeg -ss 00:00:30 -t 15 -i input.mp3 output.mp3
```
### 4. 改变音量
```bash
# 提高一倍音量
ffmpeg -i input.mp3 -filter:a "volume=2.0" output.mp3
```
## 📜 字幕处理
### 1. 添加外挂字幕（烧录到画面里）
```bash
ffmpeg -i input.mp4 -vf subtitles=subtitles.srt output.mp4
```
### 2. 提取字幕流
```bash
ffmpeg -i input.mkv -map 0:s:0 subs.srt
```
## 🔗 文件合并
### 1. 无损合并（格式和编码一致）
```bash
# 创建 file_list.txt 文件，内容如下：
# file 'part1.mp4'
# file 'part2.mp4'
ffmpeg -f concat -safe 0 -i file_list.txt -c copy output.mp4
```

```
ffmpeg -i file -i file -filter_complex "[0:a][1:a][2:a]:"
```
### 2. 重新编码合并
```bash
ffmpeg -i part1.mp4 -i part2.mp4 -filter_complex "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1" output.mp4
```
## 🌐 流媒体
### 1. 下载 HLS 流（.m3u8）
```bash
ffmpeg -i "http://example.com/playlist.m3u8" -c copy output.mp4
```
### 2. 推流到 RTMP 服务器（例如直播）
```bash
ffmpeg -re -i input.mp4 -c copy -f flv rtmp://server/live/streamkey
```
## 📸 截图
```bash
# 提取一帧画面
ffmpeg -i input.mp4 -ss 00:00:05 -vframes 1 frame.jpg
# 每秒导出一帧
ffmpeg -i input.mp4 -vf fps=1 frame_%04d.jpg
```
## ✅ 总结
- **格式转换** → `-c copy`（无损）、`-crf`（压缩质量控制）
- **裁剪/拼接** → `-ss`、`-t`、concat
- **字幕** → `-vf subtitles=`
- **流媒体** → 下载/推流
- **截图** → `-vf fps`
## 编码解码器
- `-c:v <编码器>` 指定视频编码器
- `-c:a <编码器>` 指定音频编码器
	 - 常用值
		 - copy: 直接复制流，不重新编码
		 - libx264: H.264 视频编码
		 - aac: AAC 音频编码
```bash
ffmpeg -i input.mp4 -c:v libx264 -c:a aac output.mp4
```

- `-b:v <比特率>` 设置视频比特率
- `-b:a <比特率>` 设置音频比特率
	- 视频常用值
		- 128k(bps) 普通
		- 192/256k(bps) 较高音质
		- 320k(bps) 接近无损
	- 音频常用值
		- 500-1500k(bps) 标清(480p)
		- 1500-4000k(bps) 高清(720p)
		- 3000-8000k(bps) 全高清(1080p)
		- 15000-40000k(bps) 超高清(4k)
##  编码参数与质量控制
- `-crf` 恒定质量因子（0-51），值越低质量越高，文件越大，常用于 H.264/H.265 编码，推荐值18-28（23 为默认平衡值）
- `-preset` 平衡编码速度与压缩效率，可选 `ultrafast`（极速低质）到 `veryslow`（极慢高质）
## 时间定位与截取
* `-ss <时间>` 定位到输入文件的指定时间点，值为 `秒数` 或 `hh:mm:ss` 格式
* `-t <时长>` 截取指定时长
* `-to <时间>` 截取到指定时间
## 时间控制与同步
- `-itsoffset` 设置输入的时间偏移，用于校正音视频同步问题
- `-shortest` 以最短流的时长结束输出，常用于合并音视频时强制同步
- `-vsync` 控制视频帧同步模式，解决帧率不匹配或时间戳跳跃问题。 处理不同帧率的输入源或需要固定输出帧率
	- 常用模式
		- 0(passthrough)：直接复制输入时间戳，可能导致丢帧或重复
		- 1(cfr - 恒定帧率)：通过插值或丢帧强制固定帧率
		- 2(vfr - 可变频率)：保留原始时间戳，适用于动态帧率场景
```bash
ffmpeg -itsoffset 2 -i audio.mp3 # 延迟音频两秒
ffmpeg -i input.mp4 -vsync 1 output.mp4
```
## 流处理与过滤、映射
* `-vn` 禁用视频流
* `-an` 禁用音频流
```bash
# 提取纯音频
ffmpeg -i input.mp4 -vn -c:a copy output.acc
```
* `-vf <滤镜>` 应用视频滤镜 
* `-af <滤镜>` 应用音频滤镜 
	- 常用滤镜
		- scale=宽:高: 调整分辨率,`scale=640:-1` 保持比例
		- setpts=表达式: 调整时间戳(视频)
		- asetpts=表达式: 调整时间戳(音频)
- `-map` 精确控制输入流到输出流的映射，支持选择/排除特定流（如音频流、视频流、字幕流等）
- `-bsf` 是比特流过滤器（Bitstream Filter）的缩写。它用于在编码后、封装前对编码比特流进行处理，例如去除多余的元数据、修复比特流中的错误等
```bash
ffmpeg -i input.mp4 -vf "scale=1280:720" output.mp4
# 重置音频时间戳
ffmpeg -i input.mp4 -af "asetpts=N/SR/TB" output.mp4

# 提取输入的文件中索引为 0 文件的视频流
ffmpeg -i input.mp4 -map 0:v output.mp4
# 排除输入的文件中索引为 0 文件的音频流
ffmpeg -i input.mp4 -map -0:a output.mp4

ffmpeg -i input.mp4 -c:v copy -bsf:v h264_mp4toannexb output.h264
```
## 格式转换与参数调整
帧率 24fps(电影行业)、30fps(电视，网络视频)、60fps(游戏，体育赛事直播)、120fps以上(专业高速摄影)
采样率 8000Hz(电话)、44100Hz(CD)、48000Hz(数字音频广播，影视制作等)、96000Hz更高(专业音频制作，母带处理等)
声道数 Mono（单声道）Stereo（双声道）5.1 声道 7.1 声道
- `-r <帧率>`: 设置输出视频帧率，老版本为 `-fps`
```
ffmpeg -i input.mp4 -r 30 output.mp4
```
- `-ar <采样率>` 设置音频采样率
- `-ac <声道数>` 设置音频声道数
```bash
ffmpeg -i input.wav -ar 48000 -ac 2 output.mp3
```
## 硬件加速
- `-hwaccel <设备>` 启用硬件加速（需显卡支持）
```bash
ffmpeg -hwaccel cuda -i input.mp4 -c:v h264_nvenc output.mp4
```
## 日志与调试
- `-loglevel <级别>` 设置日记级别（warning,error,debug等)
```bash
ffmpeg -loglevel error -i input.mp4 output.avi
```
- `-hide_banner` 隐藏 ffmpeg 版本和编译信息
## 典型事例
```bash
# 合并视频和音频
ffmpeg -i video.mp4 -i audio.wav -c:v copy -c:a aac output.mp4

# 提取 PCM 音频
ffmpeg -i input.mp4 -vn -ar 44100 -ac 2 -f s16le output.pcm
```
## 元数据与格式控制
- `-metadata` 设置元数据（如标题、作者）
- `-map_metadata` 复制元数据（如标题、作者）
- `-pix_fmt` 设置或复制元数据（如标题、作者）
```bash
# -metadata title="My Video" 设置标题  
# -map_metadata 0 复制输入文件的元数据  
ffmpeg -metadata title="My Video" -map_metadata 0
```
## 特殊处理与限制
- `-strict` 设置编解码器兼容性（如 `-strict -2` 允许实验性编解码器）
- `-vframes` 限制输出视频的帧数（如截取前 100 帧）