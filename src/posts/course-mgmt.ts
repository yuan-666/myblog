import type { Post } from './index'

const post: Post = {
  id: 'course-mgmt',
  title: '课程信息管理系统',
  titleEn: 'Course Management System',
  summary: 'Python 课设项目：实现课程信息的 CSV 加载、排序显示、按名查询和持久化保存。',
  summaryEn: 'Full-stack project: course CRUD with MySQL backend and RESTful API design, supporting student enrollment and grade management.',
  category: 'python',
  tags: ['Python', 'CSV', '排序'],
  date: '2023-12',
  cover: '📚',
  sections: [
    { type: 'heading', content: '项目概述', id: 'overview' },
    { type: 'text', content: '课程信息管理系统实现课程数据的加载、显示、查询和保存功能。数据存储在 CSV 文件中，支持按课程编号排序和按课程名查询。' },
    { type: 'heading', content: 'CSV 数据加载', id: 'load' },
    { type: 'code', lang: 'python', content: `import csv

def load_courses_from_csv(filename):
    courses = []
    with open(filename, 'r', newline='', encoding='utf-8') as csvfile:
        reader = csv.reader(csvfile)
        for row in reader:
            courses.append(row)
    return courses`, explanation: '打开 CSV 文件，使用 csv.reader 逐行读取，将每行数据作为一个列表追加到 courses 列表中。encoding=utf-8 确保中文课程名正常显示。' },
    { type: 'heading', content: '排序与显示', id: 'display' },
    { type: 'code', lang: 'python', content: `def display_courses(courses):
    for course in sorted(courses, key=lambda x: x[0]):
        print(course)`, explanation: '使用 Python 内置的 sorted() 函数，通过 key=lambda x: x[0] 按课程编号（每行的第一个元素）排序。lambda 表达式简洁地指定了排序依据。' },
    { type: 'heading', content: '按课程名查询', id: 'search' },
    { type: 'code', lang: 'python', content: `def find_course_by_name(courses, course_name):
    for course in courses:
        if course[1] == course_name:
            return course
    return None`, explanation: '线性遍历课程列表，比较每行第二列（课程名）是否匹配。找到即返回该课程信息，否则返回 None。对于大数据量场景，可以使用字典建立索引来优化查询性能。' },
    { type: 'heading', content: '数据保存', id: 'save' },
    { type: 'code', lang: 'python', content: `def save_courses_to_csv(filename, courses):
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        for course in courses:
            writer.writerow(course)`, explanation: '以 w 模式覆盖写入文件，遍历课程列表将每行写入 CSV。与读取时的 r 模式对应，写入时需注意 newline 参数防止空行问题。' },
    { type: 'heading', content: '扩展方向', id: 'extend' },
    { type: 'list', items: [
      '密码验证：修改和删除操作前增加权限校验',
      'GUI 界面：使用 Tkinter / PyQt 替代命令行交互',
      '错误处理：添加 try-except 捕获文件读取异常',
      '按课程性质查询、按学分排序等高级功能',
    ] },
  ],
  sectionsEn: [
    { type: 'heading', content: 'Project Overview', id: 'overview' },
    { type: 'text', content: 'The course information management system implements course data loading, display, query, and save functions. Data is stored in CSV files, supporting sorting by course ID and querying by course name.' },
    { type: 'heading', content: 'CSV Data Loading', id: 'load' },
    { type: 'code', lang: 'python', content: `import csv

def load_courses_from_csv(filename):
    courses = []
    with open(filename, 'r', newline='', encoding='utf-8') as csvfile:
        reader = csv.reader(csvfile)
        for row in reader:
            courses.append(row)
    return courses`, explanation: 'Open the CSV file and use csv.reader to read row by row, appending each row as a list to the courses list. encoding=utf-8 ensures Chinese course names display correctly.' },
    { type: 'heading', content: 'Sorting and Display', id: 'display' },
    { type: 'code', lang: 'python', content: `def display_courses(courses):
    for course in sorted(courses, key=lambda x: x[0]):
        print(course)`, explanation: 'Use Python\'s built-in sorted() function with key=lambda x: x[0] to sort by course ID (the first element of each row). The lambda expression concisely specifies the sorting criterion.' },
    { type: 'heading', content: 'Query by Course Name', id: 'search' },
    { type: 'code', lang: 'python', content: `def find_course_by_name(courses, course_name):
    for course in courses:
        if course[1] == course_name:
            return course
    return None`, explanation: 'Linearly traverse the course list, comparing whether the second column (course name) of each row matches. Return the course info if found, otherwise return None. For large datasets, a dictionary index could be used to optimize query performance.' },
    { type: 'heading', content: 'Data Saving', id: 'save' },
    { type: 'code', lang: 'python', content: `def save_courses_to_csv(filename, courses):
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        for course in courses:
            writer.writerow(course)`, explanation: 'Open file in w mode for overwrite writing, traverse the course list and write each row to CSV. The newline parameter corresponds to the r mode when reading; when writing, newline="" prevents blank line issues.' },
    { type: 'heading', content: 'Extension Directions', id: 'extend' },
    { type: 'list', items: [
      'Password verification: add permission check before modification and deletion',
      'GUI interface: use Tkinter / PyQt instead of command-line interaction',
      'Error handling: add try-except to catch file reading exceptions',
      'Advanced features: query by course type, sort by credits, etc.',
    ] },
  ],
}

export default post
