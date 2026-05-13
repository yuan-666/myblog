import type { Post } from './index'

const post: Post = {
  id: 'dictionary',
  title: '电子英汉词典',
  titleEn: 'English-Chinese Dictionary',
  summary: 'Python 课设项目：实现词条录入、查询、修改、删除功能，支持管理员/访客权限分级，使用 CSV 格式持久化存储。',
  summaryEn: 'Python course project: word entry, query, edit, and delete with admin/guest RBAC, CSV persistent storage.',
  category: 'python',
  tags: ['Python', 'CSV', '权限控制'],
  date: '2023-12',
  cover: '📖',
  sections: [
    { type: 'heading', content: '项目概述', id: 'overview' },
    { type: 'text', content: '本项目实现一个简单的电子英汉词典，支持词条录入、信息显示、词条修改、词条删除、单词查询和信息保存功能。数据以 CSV 格式持久化，同时通过身份验证区分管理员和访客的权限。' },
    { type: 'heading', content: '中英文判断模块', id: 'validate' },
    { type: 'text', content: '这是整个系统的基础模块，用于判断用户输入的字符串是否为合法的中文或英文。在录入、修改等操作中都需要先经过这个模块的校验。' },
    { type: 'code', lang: 'python', content: `def cn_or_en(cn, en):
    flag_cn = flag_en = 0
    for char_cn in cn:
        if not '\\u4e00' <= char_cn <= '\\u9fa5':
            flag_cn = 0
        else:
            flag_cn = 1
    for char_en in en:
        if 97 <= ord(char_en) <= 122 or 65 <= ord(char_en) <= 90:
            flag_en = 1
        else:
            flag_en = 0
    return flag_cn, flag_en`, explanation: '函数接受两个字符串参数 cn 和 en，分别判断是否为纯中文和纯英文。中文判断通过 Unicode 范围 \\u4e00-\\u9fa5，英文判断通过 ASCII 码范围 a-z(97-122) 和 A-Z(65-90)。返回一个元组 (flag_cn, flag_en)，1 表示合法，0 表示非法。' },
    { type: 'heading', content: '词条录入模块', id: 'add' },
    { type: 'text', content: '该模块负责向词典中添加新的词条。核心逻辑是：先校验输入的中英文是否合法，再检查词条是否已存在，最后写入 CSV 文件。' },
    { type: 'code', lang: 'python', content: `def add_entry():
    while True:
        cn = input("请输入中文(输入#返回主菜单)：")
        en = input('请输入英文(输入#返回主菜单)：')
        if cn == en == '#':
            break
        flag = cn_or_en(cn, en)
        if flag[0] == 0:
            print("中文输入有误，请重新输入")
            continue
        elif flag[1] == 0:
            print("英文输入有误，请重新输入")
            continue
        with open('dicts.csv', 'a+', encoding='utf-8-sig', newline='') as f:
            csv_reader = csv.reader(f)
            data = list(csv_reader)
            flag_if_in_dict = 0
            for row in data:
                if data.index(row) == 0:
                    continue
                if row[0] == cn and row[1] == en:
                    flag_if_in_dict = 1
            if flag_if_in_dict == 1:
                print('对应词条已存在，请重试！')
                continue
            dict_file = open('dicts.csv', mode='a', encoding='utf-8-sig', newline='')
            csv_writer = csv.DictWriter(dict_file, fieldnames=["中文", "英文"])
            csv_writer.writerow({"中文": cn, "英文": en})
            print("已保存!")
            dict_file.close()
            break`, explanation: '以 a+ 模式打开文件先读取已有数据检查重复，再用 a 模式追加写入新词条。encoding=utf-8-sig 确保 Excel 能正确打开中文 CSV。newline="" 防止写入时出现空行。' },
    { type: 'heading', content: '词条修改模块', id: 'modify' },
    { type: 'code', lang: 'python', content: `def modify_entry():
    while True:
        search_term = input("请输入要修改的内容(输入#返回主菜单)：")
        if search_term == '#':
            break
        new_cn = input("请输入新的中文：")
        new_en = input("请输入新的英文：")
        flag = cn_or_en(new_cn, new_en)
        if flag[0] == 0 or flag[1] == 0:
            print("输入有误，请重新输入")
            continue
        with open('dicts.csv', 'r', encoding='utf-8-sig', newline='') as f:
            data = list(csv.reader(f))
            entry_found = False
            for row in data:
                if data.index(row) == 0:
                    continue
                if row[0] == search_term or row[1] == search_term:
                    row[0] = new_cn
                    row[1] = new_en
                    entry_found = True
                    break
            if not entry_found:
                print("未找到对应的单词，请检查")
                continue
        with open('dicts.csv', 'w', encoding='utf-8-sig', newline='') as f:
            csv.writer(f).writerows(data)
        print("已修改！")
        break`, explanation: '先以只读模式打开 CSV 获取全部数据，遍历查找匹配行并原地修改列表，最后以 w 模式覆盖写回文件。注意：先读后写两步操作必须分开，不能同时读写同一文件。' },
    { type: 'heading', content: '词条删除与查找', id: 'del-find' },
    { type: 'text', content: '删除模块通过列表推导式过滤掉匹配行，查找模块通过遍历匹配中文来获取对应的英文翻译。' },
    { type: 'code', lang: 'python', content: `def delete_entry():
    while True:
        search_term = input('请输入要删除的单词(输入#返回主菜单)：')
        if search_term == '#':
            break
        with open('dicts.csv', 'r', encoding='utf-8-sig', newline='') as f:
            data = list(csv.reader(f))
            new_data = [row for row in data if row[0] != search_term and row[1] != search_term]
            if len(data) == len(new_data):
                print("没有找到对应的单词")
                continue
        with open('dicts.csv', 'w', encoding='utf-8-sig', newline='') as f:
            csv.writer(f).writerows(new_data)
        print(f"已删除 '{search_term}'！")
        break

def find_entry():
    while True:
        search_term = input('请输入要查找的中文(输入#返回主菜单)：')
        if search_term == '#':
            break
        if not is_chinese(search_term):
            print("输入错误，请输入中文！")
            continue
        with open('dicts.csv', 'r', encoding='utf-8-sig') as f:
            translation = next(
                (row["英文"] for row in csv.DictReader(f) if row["中文"] == search_term),
                None
            )
        if translation:
            print(f"'{search_term}' 对应的英文是 '{translation}'")
            break
        print(f"没有找到 '{search_term}'")`, explanation: '删除模块用列表推导式创建不包含目标行的新列表，比较长度判断是否找到。查找模块使用 next() + 生成器表达式优雅地获取第一个匹配结果，比手写循环更简洁。' },
    { type: 'heading', content: '身份验证与菜单系统', id: 'auth' },
    { type: 'text', content: '主程序通过字典存储用户名密码，列表存储管理员标识，实现简单的 RBAC 权限控制。管理员拥有完全权限（录入/修改/删除），访客只能查看和查询。' },
    { type: 'code', lang: 'python', content: `passwd_book = {'yuan': '123456', 'user': 'user', 'admin': 'admin'}
admin_users = ['yuan', 'admin']

while True:
    user_id = input("请输入用户名(输入q退出)：")
    if user_id == 'q':
        break
    passwd = input("请输入密码：")
    if user_id in passwd_book and passwd == passwd_book[user_id]:
        if user_id in admin_users:
            # 管理员菜单：1.录入 2.显示 3.修改 4.删除 5.查询 6.退出
            ...
        else:
            # 访客菜单：1.显示 2.查询 3.退出
            ...
    else:
        print("用户不存在或密码错误！")`, explanation: '用字典 passwd_book 做 O(1) 的用户名/密码查找，用列表 admin_users 判断角色。这种方式的局限是用户信息硬编码，实际项目中应使用数据库存储并加密密码。' },
  ],
  sectionsEn: [
    { type: 'heading', content: 'Project Overview', id: 'overview' },
    { type: 'text', content: 'This project implements a simple English-Chinese dictionary supporting word entry, information display, entry modification, entry deletion, word query, and data save functions. Data is persisted in CSV format, with identity verification distinguishing admin and guest permissions.' },
    { type: 'heading', content: 'Chinese/English Validation Module', id: 'validate' },
    { type: 'text', content: 'This is the foundational module of the entire system, used to determine whether user input strings are valid Chinese or English. All operations like entry and modification must first pass this module\'s validation.' },
    { type: 'code', lang: 'python', content: `def cn_or_en(cn, en):
    flag_cn = flag_en = 0
    for char_cn in cn:
        if not '\\u4e00' <= char_cn <= '\\u9fa5':
            flag_cn = 0
        else:
            flag_cn = 1
    for char_en in en:
        if 97 <= ord(char_en) <= 122 or 65 <= ord(char_en) <= 90:
            flag_en = 1
        else:
            flag_en = 0
    return flag_cn, flag_en`, explanation: 'The function takes two string parameters cn and en, determining whether they are pure Chinese and pure English respectively. Chinese validation uses Unicode range \\u4e00-\\u9fa5; English validation uses ASCII ranges a-z (97-122) and A-Z (65-90). Returns a tuple (flag_cn, flag_en), where 1 means valid and 0 means invalid.' },
    { type: 'heading', content: 'Entry Addition Module', id: 'add' },
    { type: 'text', content: 'This module is responsible for adding new entries to the dictionary. Core logic: first validate whether the input Chinese and English are valid, then check if the entry already exists, and finally write to the CSV file.' },
    { type: 'code', lang: 'python', content: `def add_entry():
    while True:
        cn = input("Enter Chinese (enter # to return): ")
        en = input('Enter English (enter # to return): ')
        if cn == en == '#':
            break
        flag = cn_or_en(cn, en)
        if flag[0] == 0:
            print("Invalid Chinese input, please retry")
            continue
        elif flag[1] == 0:
            print("Invalid English input, please retry")
            continue
        with open('dicts.csv', 'a+', encoding='utf-8-sig', newline='') as f:
            csv_reader = csv.reader(f)
            data = list(csv_reader)
            flag_if_in_dict = 0
            for row in data:
                if data.index(row) == 0:
                    continue
                if row[0] == cn and row[1] == en:
                    flag_if_in_dict = 1
            if flag_if_in_dict == 1:
                print('Entry already exists, please retry!')
                continue
            dict_file = open('dicts.csv', mode='a', encoding='utf-8-sig', newline='')
            csv_writer = csv.DictWriter(dict_file, fieldnames=["Chinese", "English"])
            csv_writer.writerow({"Chinese": cn, "English": en})
            print("Saved!")
            dict_file.close()
            break`, explanation: 'Open file in a+ mode to read existing data for duplicate checking, then append new entries in a mode. encoding=utf-8-sig ensures Excel can correctly open Chinese CSV. newline="" prevents blank lines when writing.' },
    { type: 'heading', content: 'Entry Modification Module', id: 'modify' },
    { type: 'code', lang: 'python', content: `def modify_entry():
    while True:
        search_term = input("Enter word to modify (enter # to return): ")
        if search_term == '#':
            break
        new_cn = input("Enter new Chinese: ")
        new_en = input("Enter new English: ")
        flag = cn_or_en(new_cn, new_en)
        if flag[0] == 0 or flag[1] == 0:
            print("Invalid input, please retry")
            continue
        with open('dicts.csv', 'r', encoding='utf-8-sig', newline='') as f:
            data = list(csv.reader(f))
            entry_found = False
            for row in data:
                if data.index(row) == 0:
                    continue
                if row[0] == search_term or row[1] == search_term:
                    row[0] = new_cn
                    row[1] = new_en
                    entry_found = True
                    break
            if not entry_found:
                print("Word not found, please check")
                continue
        with open('dicts.csv', 'w', encoding='utf-8-sig', newline='') as f:
            csv.writer(f).writerows(data)
        print("Modified!")
        break`, explanation: 'First open CSV in read-only mode to get all data, traverse to find the matching row and modify it in place, then overwrite the file in w mode. Note: read and write must be separate steps — never read and write the same file simultaneously.' },
    { type: 'heading', content: 'Entry Deletion and Query', id: 'del-find' },
    { type: 'text', content: 'The deletion module filters out matching rows using list comprehension. The query module obtains the corresponding English translation by traversing and matching Chinese text.' },
    { type: 'code', lang: 'python', content: `def delete_entry():
    while True:
        search_term = input('Enter word to delete (enter # to return): ')
        if search_term == '#':
            break
        with open('dicts.csv', 'r', encoding='utf-8-sig', newline='') as f:
            data = list(csv.reader(f))
            new_data = [row for row in data if row[0] != search_term and row[1] != search_term]
            if len(data) == len(new_data):
                print("Word not found")
                continue
        with open('dicts.csv', 'w', encoding='utf-8-sig', newline='') as f:
            csv.writer(f).writerows(new_data)
        print(f"Deleted '{search_term}'!")
        break

def find_entry():
    while True:
        search_term = input('Enter Chinese to search (enter # to return): ')
        if search_term == '#':
            break
        if not is_chinese(search_term):
            print("Error, please enter Chinese!")
            continue
        with open('dicts.csv', 'r', encoding='utf-8-sig') as f:
            translation = next(
                (row["English"] for row in csv.DictReader(f) if row["Chinese"] == search_term),
                None
            )
        if translation:
            print(f"'{search_term}' in English is '{translation}'")
            break
        print(f"'{search_term}' not found")`, explanation: 'Deletion uses list comprehension to create a new list without the target row, comparing lengths to determine if found. Query uses next() + generator expression to elegantly get the first match — cleaner than a manual loop.' },
    { type: 'heading', content: 'Authentication and Menu System', id: 'auth' },
    { type: 'text', content: 'The main program uses a dictionary to store usernames and passwords, and a list to store admin identifiers, implementing simple RBAC permission control. Admins have full permissions (add/modify/delete), while guests can only view and query.' },
    { type: 'code', lang: 'python', content: `passwd_book = {'yuan': '123456', 'user': 'user', 'admin': 'admin'}
admin_users = ['yuan', 'admin']

while True:
    user_id = input("Enter username (enter q to quit): ")
    if user_id == 'q':
        break
    passwd = input("Enter password: ")
    if user_id in passwd_book and passwd == passwd_book[user_id]:
        if user_id in admin_users:
            # Admin menu: 1.Add 2.Display 3.Modify 4.Delete 5.Query 6.Quit
            ...
        else:
            # Guest menu: 1.Display 2.Query 3.Quit
            ...
    else:
        print("Invalid username or password!")`, explanation: 'Dictionary passwd_book provides O(1) username/password lookup; list admin_users determines role. The limitation is that user info is hardcoded — in production projects, a database should be used with encrypted passwords.' },
  ],
}

export default post
