import type { Post } from './index'

const post: Post = {
  id: 'ticket-system',
  title: '车票管理系统',
  titleEn: 'Ticket Management System',
  summary: 'Flask + Vue 3 全栈项目：事务防超售（SELECT FOR UPDATE）、CSV 批量导入导出、滑块验证码安全设计。',
  summaryEn: 'Vue 3 + Flask full-stack project: ticket purchasing, refund, class management, CSV import/export with admin dashboard.',
  category: 'fullstack',
  tags: ['Flask', 'Vue 3', 'MySQL', '事务'],
  date: '2025-06',
  cover: '🚄',
  demoUrl: 'https://yuan-666.github.io/keshe-static/',
  sections: [
    { type: 'heading', content: '项目概述', id: 'overview' },
    { type: 'text', content: '车票管理系统采用前后端分离架构，Flask 提供 RESTful API，Vue 3 + Element Plus 构建前端界面。核心难点是购票时的并发安全——使用 SELECT FOR UPDATE 行级锁确保不会超售。' },
    { type: 'heading', content: '购票防超售（悲观锁）', id: 'purchase' },
    { type: 'code', lang: 'python', content: `def purchase_ticket_with_check(class_id, user_name, seat_type):
    conn = get_db_connection()
    try:
        conn.start_transaction()
        cursor = conn.cursor(dictionary=True)
        # 1. 查余票并加行级锁
        cursor.execute(
            "SELECT capacity, "
            "(SELECT COUNT(*) FROM ticket_info WHERE class_id=%s) AS sold "
            "FROM class_info WHERE id=%s FOR UPDATE",
            (class_id, class_id)
        )
        row = cursor.fetchone()
        # 2. 检查是否重复购票
        cursor.execute(
            "SELECT COUNT(*) AS cnt FROM ticket_info "
            "WHERE class_id=%s AND user_name=%s FOR UPDATE",
            (class_id, user_name)
        )
        already = cursor.fetchone()['cnt']
        # 3. 满足条件才出票
        if row and row['sold'] < row['capacity'] and already == 0:
            cursor.execute(
                "INSERT INTO ticket_info (class_id, user_name, seat_type) "
                "VALUES (%s, %s, %s)",
                (class_id, user_name, seat_type)
            )
            conn.commit()
            result = True
        else:
            conn.rollback()
            result = False
    except Exception:
        conn.rollback()
        result = False
    finally:
        cursor.close()
        conn.close()
    return result`, explanation: '关键在 FOR UPDATE：它对查询到的行加排他锁，在事务提交前其他事务无法修改这些行。这确保了"查余票"和"插入购票记录"之间的原子性。还增加了 already == 0 检查防止同一用户重复购票。' },
    { type: 'heading', content: '退票时间校验', id: 'refund' },
    { type: 'code', lang: 'python', content: `@app.route('/tickets/refund/<int:ticket_id>', methods=['DELETE'])
def refund_ticket(ticket_id):
    role = request.args.get('role', 'user')
    from models import get_ticket_class_departure_time
    dep_time = get_ticket_class_departure_time(ticket_id)

    if role != 'admin' and dep_time:
        from datetime import datetime, timedelta
        now = datetime.now()
        if isinstance(dep_time, str):
            dep_time = datetime.strptime(dep_time, '%Y-%m-%d %H:%M:%S')
        if dep_time - now <= timedelta(hours=12):
            return jsonify({'status': '退票失败，发车前12小时内不可退票'}), 400

    models.refund_ticket(ticket_id)
    return jsonify({'status': 'Ticket refunded'})`, explanation: '退票增加了业务规则校验：普通用户发车前 12 小时内不可退票，管理员不受限制。这里兼容了数据库返回 datetime 或 string 两种类型，体现了实际开发中的防御性编程。' },
    { type: 'heading', content: 'CSV 批量导入', id: 'import' },
    { type: 'code', lang: 'python', content: `def import_classes(class_list):
    conn = get_db_connection()
    cursor = conn.cursor()
    for data in class_list:
        class_number = data.get('class_number') or data.get('班次号') or ''
        route_start = data.get('route_start') or data.get('起点站') or ''
        route_end = data.get('route_end') or data.get('终点站') or ''
        if not (class_number and route_start and route_end):
            continue  # 跳过不完整行
        # 检查班次是否已存在，避免重复导入
        cursor.execute(
            'SELECT COUNT(*) FROM class_info '
            'WHERE class_number=%s AND route_start=%s AND route_end=%s',
            (class_number, route_start, route_end)
        )
        if cursor.fetchone()[0]:
            continue
        cursor.execute(
            'INSERT INTO class_info (...) VALUES (%s, %s, %s, %s, %s, %s)',
            (class_number, departure_time, route_start, route_end, travel_time, capacity)
        )
    conn.commit()
    cursor.close()
    conn.close()`, explanation: '批量导入兼容中英文字段名（class_number/班次号），跳过不完整行和重复班次。这种兼容设计在用户上传的 CSV 格式不确定时非常实用。' },
    { type: 'heading', content: 'CSV 导出（兼容 Excel 中文）', id: 'export' },
    { type: 'code', lang: 'python', content: `@app.route('/tickets/export', methods=['GET'])
def export_tickets():
    user_name = request.args.get('user_name')
    tickets = models.get_tickets_by_name(user_name) if user_name else models.export_tickets()
    si = StringIO()
    fieldnames = ['票ID', '购票人', '座位类型', '购票时间', '班次号', '起点站', '终点站']
    writer = csv.DictWriter(si, fieldnames=fieldnames)
    writer.writeheader()
    for t in tickets:
        writer.writerow({...})
    # 添加 BOM 头，兼容 Excel 中文显示
    output = '\\ufeff' + si.getvalue()
    mem = BytesIO(output.encode('utf-8-sig'))
    return send_file(mem, mimetype='text/csv', as_attachment=True, download_name='tickets.csv')`, explanation: '导出 CSV 时添加 BOM 头（\\ufeff）是让 Excel 正确识别 UTF-8 编码的关键技巧。不添加 BOM 的话，Excel 打开中文会乱码。使用 BytesIO 在内存中生成文件，避免临时文件写入。' },
    { type: 'heading', content: '混合云部署架构', id: 'deploy' },
    { type: 'list', items: [
      '阿里云 ECS（杭州）运行 Flask 后端 + Gunicorn',
      '私有云 MySQL（长沙）存储业务数据',
      '1Panel 面板管理 + OpenResty 反向代理',
      'Let\'s Encrypt SSL 证书 + HTTP 自动跳转',
      '上线 keshe.yuan6.cn，开源至 github.com/yuan-666/keshe-javaweb',
    ] },
  ],
  sectionsEn: [
    { type: 'heading', content: 'Project Overview', id: 'overview' },
    { type: 'text', content: 'The ticket management system adopts a front-end/back-end separated architecture, with Flask providing RESTful APIs and Vue 3 + Element Plus building the front-end interface. The core challenge is concurrent safety during ticket purchase — using SELECT FOR UPDATE row-level locks to prevent overselling.' },
    { type: 'heading', content: 'Overselling Prevention (Pessimistic Lock)', id: 'purchase' },
    { type: 'code', lang: 'python', content: `def purchase_ticket_with_check(class_id, user_name, seat_type):
    conn = get_db_connection()
    try:
        conn.start_transaction()
        cursor = conn.cursor(dictionary=True)
        # 1. Check remaining tickets and add row-level lock
        cursor.execute(
            "SELECT capacity, "
            "(SELECT COUNT(*) FROM ticket_info WHERE class_id=%s) AS sold "
            "FROM class_info WHERE id=%s FOR UPDATE",
            (class_id, class_id)
        )
        row = cursor.fetchone()
        # 2. Check for duplicate purchase
        cursor.execute(
            "SELECT COUNT(*) AS cnt FROM ticket_info "
            "WHERE class_id=%s AND user_name=%s FOR UPDATE",
            (class_id, user_name)
        )
        already = cursor.fetchone()['cnt']
        # 3. Issue ticket only if conditions are met
        if row and row['sold'] < row['capacity'] and already == 0:
            cursor.execute(
                "INSERT INTO ticket_info (class_id, user_name, seat_type) "
                "VALUES (%s, %s, %s)",
                (class_id, user_name, seat_type)
            )
            conn.commit()
            result = True
        else:
            conn.rollback()
            result = False
    except Exception:
        conn.rollback()
        result = False
    finally:
        cursor.close()
        conn.close()
    return result`, explanation: 'The key is FOR UPDATE: it places an exclusive lock on the queried rows, preventing other transactions from modifying these rows until the transaction commits. This ensures atomicity between "checking remaining tickets" and "inserting purchase record". The already == 0 check also prevents the same user from purchasing duplicate tickets.' },
    { type: 'heading', content: 'Refund Time Validation', id: 'refund' },
    { type: 'code', lang: 'python', content: `@app.route('/tickets/refund/<int:ticket_id>', methods=['DELETE'])
def refund_ticket(ticket_id):
    role = request.args.get('role', 'user')
    from models import get_ticket_class_departure_time
    dep_time = get_ticket_class_departure_time(ticket_id)

    if role != 'admin' and dep_time:
        from datetime import datetime, timedelta
        now = datetime.now()
        if isinstance(dep_time, str):
            dep_time = datetime.strptime(dep_time, '%Y-%m-%d %H:%M:%S')
        if dep_time - now <= timedelta(hours=12):
            return jsonify({'status': 'Refund failed: cannot refund within 12 hours of departure'}), 400

    models.refund_ticket(ticket_id)
    return jsonify({'status': 'Ticket refunded'})`, explanation: 'Refunds include business rule validation: regular users cannot refund within 12 hours of departure, while admins are exempt. The code is compatible with both datetime and string return types from the database, reflecting defensive programming in real-world development.' },
    { type: 'heading', content: 'CSV Batch Import', id: 'import' },
    { type: 'code', lang: 'python', content: `def import_classes(class_list):
    conn = get_db_connection()
    cursor = conn.cursor()
    for data in class_list:
        class_number = data.get('class_number') or data.get('班次号') or ''
        route_start = data.get('route_start') or data.get('起点站') or ''
        route_end = data.get('route_end') or data.get('终点站') or ''
        if not (class_number and route_start and route_end):
            continue  # Skip incomplete rows
        # Check if class already exists to avoid duplicate import
        cursor.execute(
            'SELECT COUNT(*) FROM class_info '
            'WHERE class_number=%s AND route_start=%s AND route_end=%s',
            (class_number, route_start, route_end)
        )
        if cursor.fetchone()[0]:
            continue
        cursor.execute(
            'INSERT INTO class_info (...) VALUES (%s, %s, %s, %s, %s, %s)',
            (class_number, departure_time, route_start, route_end, travel_time, capacity)
        )
    conn.commit()
    cursor.close()
    conn.close()`, explanation: 'Batch import supports both English and Chinese field names (class_number/班次号), skipping incomplete rows and duplicate classes. This compatibility design is very practical when the uploaded CSV format is uncertain.' },
    { type: 'heading', content: 'CSV Export (Excel-Compatible Chinese)', id: 'export' },
    { type: 'code', lang: 'python', content: `@app.route('/tickets/export', methods=['GET'])
def export_tickets():
    user_name = request.args.get('user_name')
    tickets = models.get_tickets_by_name(user_name) if user_name else models.export_tickets()
    si = StringIO()
    fieldnames = ['Ticket ID', 'Purchaser', 'Seat Type', 'Purchase Time', 'Class Number', 'Start Station', 'End Station']
    writer = csv.DictWriter(si, fieldnames=fieldnames)
    writer.writeheader()
    for t in tickets:
        writer.writerow({...})
    # Add BOM header for Excel Chinese display compatibility
    output = '\\ufeff' + si.getvalue()
    mem = BytesIO(output.encode('utf-8-sig'))
    return send_file(mem, mimetype='text/csv', as_attachment=True, download_name='tickets.csv')`, explanation: 'Adding the BOM header (\\ufeff) when exporting CSV is the key trick to make Excel correctly recognize UTF-8 encoding. Without BOM, Excel will show Chinese characters as garbled text. BytesIO generates the file in memory, avoiding temporary file writes.' },
    { type: 'heading', content: 'Hybrid Cloud Deployment Architecture', id: 'deploy' },
    { type: 'list', items: [
      'Alibaba Cloud ECS (Hangzhou) runs Flask backend + Gunicorn',
      'Private cloud MySQL (Changsha) stores business data',
      '1Panel management + OpenResty reverse proxy',
      'Let\'s Encrypt SSL certificate + HTTP automatic redirect',
      'Live at keshe.yuan6.cn, open-sourced at github.com/yuan-666/keshe-javaweb',
    ] },
  ],
}

export default post
