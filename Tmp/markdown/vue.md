## **单文件组件（.vue 文件结构）**
```vue
<template>
  <!-- HTML 模板 -->
</template>

<script setup>
// 组合式 API（推荐）
</script>

<style scoped>
/* 样式，scoped 只作用于当前组件 */
</style>
```
## **响应式数据（Composition API）**
```js
import { ref, reactive, computed, watch } from 'vue'

const count = ref(0)           // 基本类型
const state = reactive({ name: '张三' })  // 对象/数组

const double = computed(() => count.value * 2)

watch(count, (newVal) => { ... })
```
## **模板语法**
- 插值：`{{ message }}`
- 指令：
  - `v-bind:` / `:`（绑定属性）
  - `v-on:` / `@`（绑定事件）
  - `v-if / v-else-if / v-else`
  - `v-for="(item, index) in list"`
  - `v-model`（双向绑定）
  - `v-show`
## **组件通信**
- **Props**：父传子
  ```js
  defineProps(['title']); // 简单写法
  // 或
  defineProps({ title: String });
  ```
- **Emits**：子传父
  ```js
  const emit = defineEmits(['add']);
  emit('add', payload);
  ```
- **Slots**：内容插槽（默认插槽 + 具名插槽）

### 3. 必备工具（项目中几乎都会用到）

- **Vue Router**（路由）
  ```js
  createRouter({
    history: createWebHistory(),
    routes: [{ path: '/', component: Home }],
  });
  ```
- **Pinia**（状态管理）—— 比 Vuex 更简单
  ```js
  import { defineStore } from 'pinia';
  export const useCounterStore = defineStore('counter', () => {
    const count = ref(0);
    return { count, increment: () => count.value++ };
  });
  ```

### 4. 开发流程最低要求

1. 用 `npm create vue@latest` 创建项目（官方推荐）
2. 掌握 `ref`、`reactive`、`computed`、`defineProps`、`defineEmits`
3. 能拆分组件、传递数据
4. 会用 `v-for`、`v-if`、`@click` 等指令

---

**学习建议顺序**：

1. 看官方文档 **入门** 部分（https://cn.vuejs.org/guide/introduction.html）
2. 完成 **Todo List** 小项目
3. 掌握 Composition API（`script setup`）
4. 再学 Router + Pinia

掌握以上内容，你已经可以独立开发中等复杂度的 Vue 前端项目了。

需要我给你一个**最小可运行的 Vue 项目模板**吗？
