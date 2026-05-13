import type { Post } from './index'

const post: Post = {
  id: 'campus-activity',
  title: '校园活动管理系统',
  titleEn: 'Campus Activity Management System',
  summary: 'Spring Boot 3.3 全栈项目：Redis 缓存 + MySQL 乐观锁实现原子报名，支持高并发防超卖。',
  summaryEn: 'Full-stack Spring Boot 3.3 project: atomic registration with MySQL optimistic locking + Redis caching, preventing overselling under high concurrency.',
  category: 'fullstack',
  tags: ['Spring Boot', 'Redis', 'MySQL', '乐观锁'],
  date: '2024-12',
  cover: '🎓',
  demoUrl: 'https://yuan-666.github.io/exp8-static/',
  sections: [
    { type: 'heading', content: '项目概述', id: 'overview' },
    { type: 'text', content: '校园活动管理系统基于 Spring Boot 3.3 + MyBatis-Plus + MySQL + Redis 构建，实现管理员/用户双角色管理。核心亮点是使用 MySQL 乐观锁实现原子报名操作，防止高并发下的超卖问题。' },
    { type: 'heading', content: '乐观锁报名核心逻辑', id: 'optimistic-lock' },
    { type: 'text', content: '报名操作是最核心的并发场景。我们通过 SQL 的 WHERE 条件实现乐观锁：UPDATE 时检查当前参与人数是否小于容量，如果被其他线程抢先修改，则 affected rows 为 0，表示名额已满。' },
    { type: 'code', lang: 'java', content: `@Transactional
@CacheEvict(value = {"activity", "activities"}, allEntries = true)
public String joinActivity(Integer userId, Integer activityId) {
    // 1. 重复报名检查
    if (registrationMapper.checkUserRegistration(userId, activityId) > 0)
        return "您已报名该活动";

    Activity activity = activityMapper.selectActivityById(activityId);
    if (activity == null) return "活动不存在";
    if (LocalDateTime.now().isAfter(activity.getEndTime()))
        return "活动已结束";

    // 2. 核心：乐观锁原子更新参与人数
    int rows = activityMapper.updateParticipantCount(activityId, 1);
    if (rows == 0) return "报名失败：名额已满";

    // 3. 插入报名记录
    ActivityRegistration reg = new ActivityRegistration();
    reg.setUserId(Long.valueOf(userId));
    reg.setActivityId(Long.valueOf(activityId));
    registrationMapper.insertRegistration(reg);
    return "success";
}`, explanation: '关键在第 2 步：updateParticipantCount 的 SQL 是 UPDATE activity SET participant_count = participant_count + 1 WHERE id = ? AND participant_count < capacity。当并发时，只有第一个线程的 WHERE 条件成立（rows=1），后续线程的 participant_count 已不满足 < capacity（rows=0），从而防止超卖。整个过程在 @Transactional 事务中保证原子性。' },
    { type: 'heading', content: 'Redis 缓存策略', id: 'redis' },
    { type: 'text', content: '使用 Spring Cache + Redis 实现活动列表和详情的缓存，减少数据库压力。关键原则：读多写少的场景用缓存，写操作时清除缓存。' },
    { type: 'code', lang: 'java', content: `// 查询时缓存
@Cacheable(value = "activities", key = "'list_' + (#keyword?:'all') + '_' + (#sort?:'def')")
public List<Activity> search(String keyword, String sort) {
    return activityMapper.selectActivities(keyword, sort);
}

// 写操作时清除所有相关缓存
@Transactional
@CacheEvict(value = {"activities", "activity"}, allEntries = true)
public void createActivity(Activity activity) {
    activityMapper.insertActivity(activity);
}`, explanation: '@Cacheable 在方法执行前检查缓存，命中则直接返回；未命中则执行方法并将结果存入 Redis。@CacheEvict 在写操作后清除缓存，allEntries=true 清除该缓存空间的所有条目，避免脏数据。注意：报名等操作必须清除 activity 和 activities 两个缓存空间。' },
    { type: 'heading', content: 'Controller 层设计', id: 'controller' },
    { type: 'text', content: 'Controller 统一处理 Session 鉴权、参数接收和页面跳转，使用 RedirectAttributes 传递 Flash 消息。' },
    { type: 'code', lang: 'java', content: `@PostMapping("/activities/{id}/join")
public String joinActivity(@PathVariable Integer id,
                           @RequestParam(required = false) String from,
                           HttpSession session, RedirectAttributes attrs) {
    User user = (User) session.getAttribute("user");
    if (user == null) return "redirect:/login";

    Activity act = activityService.getActivityById(id);
    String result = activityService.joinActivity(user.getUserId(), id);

    if ("success".equals(result)) {
        String timeStr = act.getStartTime()
            .format(DateTimeFormatter.ofPattern("MM月dd日 HH:mm"));
        attrs.addFlashAttribute("msg",
            "✅ 报名成功！请准时参加：" + act.getTitle() + "，时间：" + timeStr);
    } else {
        attrs.addFlashAttribute("error", result);
    }

    // 来源页面感知：详情页跳回详情页，列表页跳回列表页
    if ("detail".equals(from)) return "redirect:/activities/" + id;
    return "redirect:/activities";
}`, explanation: 'from 参数实现来源页面感知：用户从详情页报名后跳回详情页而非列表页。RedirectAttributes.addFlashAttribute 传递一次性消息（报名成功/失败），重定向后自动清除，避免 URL 参数暴露和重复显示。' },
    { type: 'heading', content: '生产部署', id: 'deploy' },
    { type: 'list', items: [
      'JDK 17 + MySQL 8 + Redis 部署至 Linux 云服务器',
      'MySQL 存储过程生成 400 用户 + 3000 条报名记录进行压测',
      '验证高并发防超卖能力（乐观锁 + 事务）',
      '上线 exp8.yuan6.cn，代码开源至 github.com/yuan-666/exp8',
    ] },
  ],
  sectionsEn: [
    { type: 'heading', content: 'Overview', id: 'overview' },
    { type: 'text', content: 'A campus activity management system built with Spring Boot 3.3 + MyBatis-Plus + MySQL + Redis, supporting admin/user dual-role management. The core highlight is using MySQL optimistic locking for atomic registration, preventing overselling under concurrent requests.' },
    { type: 'heading', content: 'Optimistic Lock Registration Logic', id: 'optimistic-lock' },
    { type: 'text', content: 'Registration is the most critical concurrent scenario. We implement optimistic locking via SQL WHERE conditions: the UPDATE checks that current participant count is below capacity. If another thread already modified it, affected rows = 0, indicating the slot is full.' },
    { type: 'code', lang: 'java', content: `@Transactional
@CacheEvict(value = {"activity", "activities"}, allEntries = true)
public String joinActivity(Integer userId, Integer activityId) {
    // 1. Duplicate registration check
    if (registrationMapper.checkUserRegistration(userId, activityId) > 0)
        return "您已报名该活动";

    Activity activity = activityMapper.selectActivityById(activityId);
    if (activity == null) return "活动不存在";
    if (LocalDateTime.now().isAfter(activity.getEndTime()))
        return "活动已结束";

    // 2. Core: optimistic lock atomic participant count update
    int rows = activityMapper.updateParticipantCount(activityId, 1);
    if (rows == 0) return "报名失败：名额已满";

    // 3. Insert registration record
    ActivityRegistration reg = new ActivityRegistration();
    reg.setUserId(Long.valueOf(userId));
    reg.setActivityId(Long.valueOf(activityId));
    registrationMapper.insertRegistration(reg);
    return "success";
}`, explanation: 'The key is step 2: updateParticipantCount executes UPDATE activity SET participant_count = participant_count + 1 WHERE id = ? AND participant_count < capacity. Under concurrency, only the first thread satisfies the WHERE condition (rows=1); subsequent threads find participant_count no longer < capacity (rows=0), preventing overselling. The entire process runs within @Transactional for atomicity.' },
    { type: 'heading', content: 'Redis Caching Strategy', id: 'redis' },
    { type: 'text', content: 'Spring Cache + Redis caches activity lists and details to reduce database load. Key principle: cache read-heavy data, evict on writes.' },
    { type: 'code', lang: 'java', content: `// Query with cache
@Cacheable(value = "activities", key = "'list_' + (#keyword?:'all') + '_' + (#sort?:'def')")
public List<Activity> search(String keyword, String sort) {
    return activityMapper.selectActivities(keyword, sort);
}

// Evict all related caches on write
@Transactional
@CacheEvict(value = {"activities", "activity"}, allEntries = true)
public void createActivity(Activity activity) {
    activityMapper.insertActivity(activity);
}`, explanation: '@Cacheable checks the cache before method execution, returning cached results on hit. @CacheEvict clears cache after writes; allEntries=true clears all entries in that cache space to prevent stale data. Registration operations must evict both "activity" and "activities" cache spaces.' },
    { type: 'heading', content: 'Controller Design', id: 'controller' },
    { type: 'text', content: 'Controllers handle Session authentication, parameter binding, and page redirects uniformly, using RedirectAttributes for flash messages.' },
    { type: 'code', lang: 'java', content: `@PostMapping("/activities/{id}/join")
public String joinActivity(@PathVariable Integer id,
                           @RequestParam(required = false) String from,
                           HttpSession session, RedirectAttributes attrs) {
    User user = (User) session.getAttribute("user");
    if (user == null) return "redirect:/login";

    Activity act = activityService.getActivityById(id);
    String result = activityService.joinActivity(user.getUserId(), id);

    if ("success".equals(result)) {
        String timeStr = act.getStartTime()
            .format(DateTimeFormatter.ofPattern("MM月dd日 HH:mm"));
        attrs.addFlashAttribute("msg",
            "✅ 报名成功！请准时参加：" + act.getTitle() + "，时间：" + timeStr);
    } else {
        attrs.addFlashAttribute("error", result);
    }

    // Source-aware redirect: detail page → back to detail, list → back to list
    if ("detail".equals(from)) return "redirect:/activities/" + id;
    return "redirect:/activities";
}`, explanation: 'The "from" parameter enables source-aware navigation: users registering from the detail page are redirected back to it. RedirectAttributes.addFlashAttribute passes one-time messages (success/failure) that auto-clear after redirect, avoiding URL parameter exposure.' },
    { type: 'heading', content: 'Production Deployment', id: 'deploy' },
    { type: 'list', items: [
      'Deployed to Linux cloud server with JDK 17 + MySQL 8 + Redis',
      'Stress-tested with MySQL stored procedures generating 400 users + 3000 registration records',
      'Verified high-concurrency oversell prevention (optimistic lock + transactions)',
      'Live at exp8.yuan6.cn, open-sourced at github.com/yuan-666/exp8',
    ] },
  ],
}

export default post
