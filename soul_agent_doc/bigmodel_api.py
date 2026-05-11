#调用图片生成的接口：
#请先安装requests库: `pip3 install requests`
import requests

url = "https://open.bigmodel.cn/api/paas/v4/images/generations"

payload = {
    "model": "glm-image",
    "prompt": "一只可爱的小猫咪，坐在阳光明媚的窗台上，背景是蓝天白云.",
    "size": "1280x1280"
}
headers = {
    "Authorization": "Bearer <token>",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print(response.text)


#调用文本推理说明的接口：

import requests

url = "https://open.bigmodel.cn/api/paas/v4/chat/completions"

payload = {
    "model": "glm-5.1",
    "messages": [
        {
            "role": "system",
            "content": "你是一个有用的AI助手。"
        },
        {
            "role": "user",
            "content": "请介绍一下人工智能的发展历程。"
        }
    ],
    "stream": False,
    "temperature": 1
}
headers = {
    "Authorization": "Bearer <token>",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print(response.text)