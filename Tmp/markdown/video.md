下面按**架构、关键组件、实现步骤、优缺点**来展开说明这四种方案。

---

# 方案一：RTSP + AI（最推荐、最通用）

## 架构

```text
IP Camera
    │
    └── RTSP
            │
            ▼
      AI服务器
      (OpenCV)
            │
            ▼
      YOLO/AI模型
            │
            ▼
      识别结果
```

---

## 技术栈

### 视频采集

* OpenCV
* FFmpeg
* GStreamer

例如：

```python
import cv2

cap = cv2.VideoCapture(
    "rtsp://admin:123456@192.168.1.100:554/Streaming/Channels/101"
)

while True:
    ret, frame = cap.read()
```

---

### AI分析

常用模型：

| 任务   | 模型          |
| ---- | ----------- |
| 目标检测 | YOLO        |
| 人脸识别 | InsightFace |
| OCR  | PaddleOCR   |
| 姿态识别 | MediaPipe   |
| 行为识别 | SlowFast    |

例如：

```python
from ultralytics import YOLO

model = YOLO("yolo11n.pt")

results = model(frame)
```

---

### 输出结果

可以写入：

```text
数据库
MQTT
Kafka
WebSocket
REST API
```

例如：

```json
{
  "camera":"cam01",
  "object":"person",
  "confidence":0.96
}
```

---

## 适用

* 1~50路摄像头
* AI自定义需求

这是目前最常见方案。

---

# 方案二：ONVIF + RTSP + AI

适合大量摄像头管理。

---

## 架构

```text
            ONVIF
               │
               ▼
摄像机 ←→ 管理平台
               │
      获取RTSP地址
               │
               ▼
           AI分析
```

---

## 自动发现摄像机

使用 ONVIF：

```python
from onvif import ONVIFCamera

cam = ONVIFCamera(
    '192.168.1.100',
    80,
    'admin',
    '123456'
)
```

获取：

* 设备名称
* 型号
* RTSP URL

---

## PTZ控制

例如：

```python
ptz_service.ContinuousMove(...)
```

实现：

```text
自动追踪人员
自动跟踪车辆
```

---

## AI分析

与方案一完全一样。

区别只是：

```text
ONVIF负责管理
RTSP负责视频
```

---

## 适用

```text
园区
工厂
学校
商场
```

100~1000路设备。

---

# 方案三：摄像机内置AI

现代摄像机自身运行AI。

---

## 架构

```text
Camera
  │
  ├─ 人脸识别
  ├─ 车牌识别
  ├─ 越界检测
  └─ 人员统计
          │
          ▼
     事件推送
```

---

## 设备例子

### 海康 AcuSense

支持：

```text
人
车
周界
```

---

### 大华 WizSense

支持：

```text
人脸
车辆
人数统计
```

---

### Axis

支持：

```text
边缘AI
容器部署
```

---

## 接收事件

HTTP：

```http
POST /event
```

MQTT：

```text
person_detected
```

ONVIF Event：

```xml
<PersonDetected>
```

---

## 实现

服务器只需要：

```text
接收事件
存储结果
展示报表
```

无需自己跑 YOLO。

---

## 优点

CPU/GPU压力极小。

---

## 缺点

算法受厂家限制。

---

# 方案四：WebRTC实时分析

用于超低延迟。

---

## 架构

```text
Camera
   │
 RTSP
   │
   ▼
Media Server
(Janus/SRS)
   │
 WebRTC
   │
 Browser
   │
 AI分析
```

---

## 媒体服务器

常见：

### SRS

开源：

```text
RTSP
RTMP
WebRTC
```

支持转换：

```text
RTSP -> WebRTC
```

---

### Janus

专业 WebRTC Server

---

### ZLMediaKit

国内非常流行。

支持：

```text
RTSP
RTMP
WebRTC
HLS
```

---

## 浏览器分析

例如：

```javascript
navigator.mediaDevices
```

接收视频流后：

```javascript
TensorFlow.js
ONNX Runtime Web
```

实时推理。

---

## 延迟

RTSP：

```text
1~5秒
```

WebRTC：

```text
100~500毫秒
```

---

# 企业级最佳实践（2026）

如果是自己开发视频识别平台，常见架构是：

```text
摄像机
   │
ONVIF发现
   │
RTSP拉流
   │
FFmpeg/GStreamer
   │
GPU推理(YOLO)
   │
Kafka
   │
业务系统
```

技术选型：

```text
ONVIF       设备管理
RTSP        视频流
FFmpeg      解码
YOLO        AI识别
Kafka       消息队列
PostgreSQL  数据存储
Redis       缓存
```

如果规模较小（几路到几十路摄像头），实际上只需要：

```text
RTSP + OpenCV + YOLO
```

就能完成大多数视频内容识别需求，而且开发成本最低、可定制性最高。
