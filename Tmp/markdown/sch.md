**排班系统架构与数据库表设计方案**

根据你的描述，一个医生的**一条排班记录**（通常按**天**维度）需要关联该医生当天**多个时段**（如上午门诊、下午手术、晚上急诊等）的详细排班信息。我的方案采用**关系型数据库**（推荐 PostgreSQL 或 MySQL）+ **RESTful/GraphQL API** 的经典三层架构，既满足灵活关联，又便于后续扩展（预约、冲突校验、统计等）。

### 1. 整体系统架构设计（推荐）

- **前端**：Web 管理后台（医生/管理员排班、查看日历） + 患者预约小程序/H5（可选）。技术栈建议 Vue3/React + Element Plus / Ant Design。
- **后端**：单体服务即可（后期可拆微服务）。推荐技术栈：
  - Java Spring Boot（企业级强）或 Go（高性能）或 Node.js NestJS。
  - API 风格：RESTful + OpenAPI 文档。
- **数据库**：PostgreSQL（推荐，支持 JSONB 扩展、时间范围类型 `tstzrange`）。
- **缓存**：Redis（缓存医生当天可用时段，加速查询）。
- **其他组件**：
  - 消息队列（RabbitMQ/Kafka）：排班变更通知医生、患者。
  - 定时任务（Quartz / XXL-JOB）：每日生成默认排班模板、过期清理。
  - 文件/对象存储：排班导出 Excel、PDF。
- **关键设计原则**：
  - **一天一条排班记录** → 用 `schedule_records` 做父表。
  - **多时段** → 用 `schedule_slots` 子表 1:N 关联。
  - 强约束：同一医生同一天只能有一条 `schedule_record`。
  - 业务规则在后端 Service 层统一校验（时间不重叠、最大预约数等）。

**架构图（文字版）**：
```
前端 (Vue/React)
   ↓ HTTPS
API Gateway / Backend Service (Spring Boot / Go)
   ↓
   ├── 业务层 (ScheduleService)
   ├── 仓储层 (Repository + JPA / GORM)
   └── 缓存层 (Redis)
         ↓
数据库 (PostgreSQL) + Redis
```

### 2. 数据库表设计（核心表）

以下是核心 ER 关系（1:N）：

**医生表**（doctors）—— 基础信息
```sql
CREATE TABLE doctors (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(50) NOT NULL,
    department_id BIGINT REFERENCES departments(id),
    title       VARCHAR(30),           -- 主治/主任等
    phone       VARCHAR(20),
    is_active   BOOLEAN DEFAULT true,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```

**部门表**（可选，departments）—— 按科室过滤排班
```sql
CREATE TABLE departments (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(50) NOT NULL,
    code        VARCHAR(20) UNIQUE
);
```

**排班记录表**（schedule_records）—— **一条记录 = 医生 + 日期**
```sql
CREATE TABLE schedule_records (
    id              BIGSERIAL PRIMARY KEY,
    doctor_id       BIGINT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    schedule_date   DATE NOT NULL,                    -- 排班日期
    notes           TEXT,                             -- 备注（如“值班”）
    created_by      BIGINT,                           -- 操作人
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),

    -- 唯一约束：一个医生一天只能有一条主记录
    UNIQUE (doctor_id, schedule_date)
);
```

**排班时段表**（schedule_slots）—— **多条记录 = 一个记录关联多个时段**
```sql
CREATE TABLE schedule_slots (
    id                   BIGSERIAL PRIMARY KEY,
    schedule_record_id   BIGINT NOT NULL REFERENCES schedule_records(id) ON DELETE CASCADE,

    start_time           TIMESTAMPTZ NOT NULL,      -- 开始时间（带时区）
    end_time             TIMESTAMPTZ NOT NULL,      -- 结束时间
    slot_type            VARCHAR(20) NOT NULL,      -- 时段类型：'morning','afternoon','evening','night','custom'
    slot_name            VARCHAR(50),               -- 自定义名称（如“上午门诊”）

    max_appointments     INT DEFAULT 20,            -- 该时段最大可预约数
    current_appointments INT DEFAULT 0,             -- 当前已预约数
    status               VARCHAR(10) DEFAULT 'open' -- open / closed / full

    -- 可扩展字段
    extra_info           JSONB,                     -- 额外信息（如手术室号）

    CHECK (start_time < end_time),                 -- 时间合法性
    CHECK (date_trunc('day', start_time) = schedule_date) -- 强制属于当天
);
```

**预约表**（appointments）—— 后续必然需要的关联表（可选先建）
```sql
CREATE TABLE appointments (
    id                 BIGSERIAL PRIMARY KEY,
    schedule_slot_id   BIGINT NOT NULL REFERENCES schedule_slots(id),
    patient_id         BIGINT REFERENCES patients(id),
    status             VARCHAR(20) DEFAULT 'pending', -- pending/confirmed/cancelled
    appointment_time   TIMESTAMPTZ NOT NULL,
    created_at         TIMESTAMPTZ DEFAULT NOW()
);
```

**索引建议**（性能关键）：
```sql
CREATE INDEX idx_schedule_records_doctor_date ON schedule_records(doctor_id, schedule_date);
CREATE INDEX idx_schedule_slots_record ON schedule_slots(schedule_record_id);
CREATE INDEX idx_schedule_slots_time ON schedule_slots(start_time, end_time);
```

### 3. 关键业务实现要点

1. **创建排班流程**：
   - 前端提交 `{doctor_id, schedule_date, slots: [{start_time, end_time, slot_type, ...}, ...]}`
   - Service 层：
     - 先插入/更新 `schedule_records`（upsert）
     - 删除该记录原有所有 `schedule_slots`
     - 批量插入新的 slots
     - 校验：时段不重叠、同一医生当天只能一条记录

2. **查询医生某天排班**（最常用接口）：
   ```sql
   SELECT sr.*,
          json_agg(
            json_build_object(
              'id', ss.id,
              'start_time', ss.start_time,
              'end_time', ss.end_time,
              'slot_type', ss.slot_type,
              'max_appointments', ss.max_appointments,
              'current_appointments', ss.current_appointments
            )
          ) AS slots
   FROM schedule_records sr
   LEFT JOIN schedule_slots ss ON ss.schedule_record_id = sr.id
   WHERE sr.doctor_id = ? AND sr.schedule_date = ?
   GROUP BY sr.id;
   ```

3. **冲突与规则**：
   - 数据库层面：`CHECK` 约束 + 唯一索引
   - 应用层面：Service 用 Redis 分布式锁防止并发创建
   - 可增加 `doctor_unavailable_dates` 表处理请假/停诊

4. **扩展性考虑**：
   - 想支持**模板排班**（每周固定）？再加 `schedule_templates` 表 + 定时任务生成 `schedule_records`。
   - 想支持**重复排班**（每两周重复）？在 `schedule_records` 加 `recurrence_rule` 字段（RRULE 标准）。
   - 大数据量？分表按 `schedule_date`（按月/年）或使用 TimescaleDB 扩展。

### 4. 推荐下一步

1. 先实现上面 4 张核心表 + 创建/查询接口。
2. 用 dbdiagram.io 或 Draw.io 画 ER 图快速确认。
3. 如果需要我可以立刻给出：
   - 完整的 Spring Boot / Go 示例代码（实体类 + Repository + Service）
   - 预约流程完整设计
   - 患者端可用时段查询优化 SQL
   - 导出 Excel 排班表的实现

这个设计既严格满足“你的一条排班记录关联多条时段”，又保持了高度扩展性。你对哪部分需要更详细的设计（比如代码示例、索引调优、或微服务拆分）？随时告诉我，我可以继续细化！
