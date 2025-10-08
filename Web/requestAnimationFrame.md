`requestAnimationFrame`（简称 rAF）是专门用于实现平滑动画的 API。它会在浏览器下一次重绘之前调用指定的回调函数，确保动画帧的更新与屏幕刷新率同步。

#### **核心功能与用途**
- **与屏幕刷新同步**：专为动画设计，确保回调函数在浏览器下一次重绘前执行，与显示器刷新率（通常60Hz）同步，避免丢。
- **高优先级任务**：适用于需要流畅视觉效果的场景，如 CSS 动画、Canvas 绘制、滚动效果等。
- **时间戳参数**：回调接收高精度时间戳（`DOMHighResTimeStamp`），用于精确计算动画进度。

#### **示例代码**
```javascript
let start;
function animate(timestamp) {
  if (!start) start = timestamp;
  const progress = timestamp - start;
  // 更新动画状态
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate); // 启动动画循环 [[9]]
```

#### **注意事项**
- 避免在回调中执行耗时操作，否则会导致动画卡顿[[8]]。
- 兼容性较好，主流浏览器均支持[[5]]。