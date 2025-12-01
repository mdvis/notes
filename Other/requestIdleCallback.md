`requestIdleCallback` 是一种低优先级的任务调度工具，允许开发者在浏览器空闲时执行非紧急任务。它的设计目的是利用浏览器的空闲时间来处理一些不紧急但必要的工作，比如日志记录、数据预加载等。
#### **使用场景**
- 处理不需要立即完成的任务，例如批量 DOM 更新、非关键性数据处理、分析数据上报等。
- 避免阻塞主线程，提升用户体验。
#### **核心功能与用途**
- **空闲时间调度**：利用浏览器空闲时段执行低优先级任务（如日志上报、数据预处理），避免阻塞关键操作。
- **时间限制机制**：通过 `IdleDeadline` 对象的 `timeRemaining()` 方法控制执行时长，建议单次回调耗时不超过50ms。
- **超时兜底**：可通过 `timeout` 参数强制执行回调，防止任务无限延迟。
#### **语法**
```javascript
let handle = requestIdleCallback(callback, options);
```
- `callback`: 回调函数，接收一个 `IdleDeadline` 对象。
- `options`: 可选参数，支持设置 `timeout`（单位为毫秒）。
- 返回值 `handle` 可以用于取消回调：
  ```javascript
  cancelIdleCallback(handle);
  ```

#### **示例代码**
```javascript
function processIdle(deadline) {
  while (deadline.timeRemaining() > 0 && tasks.length > 0) {
    // 处理任务
  }
  if (tasks.length > 0) {
    requestIdleCallback(processIdle, { timeout: 1000 });
  }
}
requestIdleCallback(processIdle); // 开始调度 [[7]]
```
#### **注意事项**
- 避免在回调中操作 DOM，因空闲时段可能紧接渲染阶段，可能引发重绘[[7]]。
- 兼容性较差（如 IE 不支持），需 polyfill 或降级方案[[10]]。
### 3. **对比与选型**
| 特性             | `requestAnimationFrame`    | `requestIdleCallback`  |
| -------------- | -------------------------- | ---------------------- |
| **优先级**        | 高（与渲染同步）                   | 低（利用空闲时间）              |
| **典型场景**       | 动画、游戏、实时交互                 | 日志、数据分析、预加载            |
| **触发时机**       | 每帧渲染前                      | 浏览器空闲时                 |
| **时间参数**       | 时间戳（当前帧开始时间）               | `IdleDeadline`（剩余空闲时间） |
| **超时支持**       | 无                          | 支持（通过 `timeout`）       |
| **主要用途**       | 平滑动画、视觉效果                  | 非紧急任务、低优先级工作           |
| **触发时机**       | 浏览器下一帧渲染前                  | 浏览器空闲时间                |
| **时间参数**       | 时间戳（`DOMHighResTimeStamp`） | `IdleDeadline` 对象      |
| **是否受屏幕刷新率影响** | 是                          | 否                      |
| **是否可超时**      | 否                          | 是（通过 `timeout` 参数）     |
| **典型场景**       | Canvas 动画、滚动效果、游戏渲染        | 日志记录、数据分析、预加载          |
**选型建议**：  
- 动画或高频渲染任务优先使用 `requestAnimationFrame`[[2]][[4]]。  
- 后台任务或可延迟操作使用 `requestIdleCallback`，但需注意任务拆分和超时[[6]][[10]]。
### 4. **总结**
- **`requestAnimationFrame`** 是动画流畅性的保障，确保与屏幕刷新同步。  
- **`requestIdleCallback`** 是性能优化的利器，充分利用空闲时间提升用户体验。  
- 两者结合使用可实现高效的任务调度，兼顾渲染性能和后台任务处理。