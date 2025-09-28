以下是 **Testing Library** 常用 API 及其作用的总结，适用于 React、Vue 等不同框架的实现（核心概念一致）：

---

### **核心 API**
1. **`render`**
   - **作用**：将组件渲染到测试环境的 DOM 中。
   - **示例**：
     ```javascript
     const { container } = render(<MyComponent />);
     ```

2. **查询方法**
   - **`getBy...`** (如 `getByText`, `getByRole`)
     - **作用**：同步查找元素，若未找到则 **立即抛出错误**。用于确定元素必须存在的场景。
   - **`queryBy...`** (如 `queryByText`)
     - **作用**：同步查找元素，未找到时返回 `null`。用于断言元素 **不存在**。
   - **`findBy...`** (如 `findByText`)
     - **作用**：异步查找元素，返回 Promise。用于等待异步渲染的元素（如数据加载后的 UI）。

3. **常用查询类型**
   - **`getByText(text)`**：通过文本内容查找元素。
   - **`getByRole(role)`**：通过 ARIA 角色查找（优先推荐，增强可访问性）。
   - **`getByTestId(testId)`**：通过 `data-testid` 属性查找（用于复杂或动态内容）。
   - **`getByLabelText(text)`**：通过关联的 `<label>` 查找表单元素。

4. **用户交互**
   - **`fireEvent`**
     - **作用**：触发 DOM 事件（如点击、输入）。
     - **示例**：
       ```javascript
       fireEvent.click(button);
       fireEvent.change(input, { target: { value: 'text' } });
       ```
   - **`userEvent`**（需安装 `@testing-library/user-event`）
     - **作用**：更真实的用户交互模拟（如逐字符输入、拖拽）。
     - **示例**：
       ```javascript
       await userEvent.type(input, 'Hello');
       ```

5. **异步操作**
   - **`waitFor`**
     - **作用**：等待异步操作完成（如 API 请求、状态更新）。
     - **示例**：
       ```javascript
       await waitFor(() => expect(element).toBeInTheDocument());
       ```
   - **`findBy...`**
     - 结合 `waitFor` 的语法糖，直接等待元素出现。

6. **辅助工具**
   - **`screen`**
     - **作用**：全局 DOM 查询对象，替代 `render` 返回的查询方法。
     - **示例**：
       ```javascript
       render(<Component />);
       expect(screen.getByText('Submit')).toBeInTheDocument();
       ```
   - **`act`**
     - **作用**：包裹可能触发状态更新的代码，确保 React 完成渲染（通常由 `render` 或 `userEvent` 自动处理）。

---

### **最佳实践**
1. **优先使用 `getByRole`**：通过 ARIA 角色查询，确保组件可访问性。
2. **避免过度使用 `data-testid`**：仅在无法通过语义化方式查询时使用。
3. **异步操作用 `findBy` 或 `waitFor`**：确保测试稳定性。
4. **模拟真实用户行为**：优先使用 `userEvent` 而非 `fireEvent`。

---

### **示例场景**
```javascript
test('提交表单后显示成功消息', async () => {
  render(<Form />);
  const input = screen.getByLabelText('Email');
  const button = screen.getByRole('button', { name: 'Submit' });

  await userEvent.type(input, 'test@example.com');
  await userEvent.click(button);

  const successMessage = await screen.findByText('提交成功');
  expect(successMessage).toBeInTheDocument();
});
```

通过组合这些 API，可以编写出贴近用户行为、高可维护性的组件测试。
