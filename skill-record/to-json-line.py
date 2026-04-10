import sys
import json

def convert():
    # 读取所有输入内容
    content = sys.stdin.read()
    if not content:
        return

    # 使用 json.dumps 将其转换为标准的 JSON 字符串格式
    # 这会自动处理换行符 (\n)、引号 (") 以及其他特殊字符
    json_string = json.dumps(content)
    
    # 打印转换后的结果
    print(json_string)

if __name__ == "__main__":
    convert()
