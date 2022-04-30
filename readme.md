## Vety

Vety是一款英语听力播放软件，支持mp3文件及其他音频文件的播放。打开文件后，能自动根据音频的空白来进行分割，并根据经验自动标记。

![license](https://img.shields.io/github/license/vt-dev-team/vety)
![release](https://img.shields.io/github/v/release/vt-dev-team/vety)
![commit](https://img.shields.io/github/last-commit/vt-dev-team/vety)
![](https://img.shields.io/github/repo-size/vt-dev-team/vety)

### 许可证

采用 [GPL v2](./license) 开源

### 代码结构

代码采用 PyQt5 + PyQtWebengine 编写。Python处理逻辑，HTML编写界面。

web 目录是网页端代码

main.py 是主程序

### 快速上手

本说明按照 1.0.6 版本进行编写

#### 打开文件

用户可以按住Ctrl+O，或者点击主页(耳机按钮)-文件列表-打开文件，或者直接将文件拖入来打开文件。选择文件之后软件将自动跳转到解析列表，并且对音频进行切割，一般需要10s。

#### 播放器

选择好文件之后，软件底部的播放器即可就绪。最下方三个按钮作用分别为回退5s，暂停/播放，前进5s。

选择好文件并且播放过音频之后，播放器的滑动条就绪，可以拖动或者点击选择进度。

切割好音频之后，解析结果将显示在主页(耳机按钮)-解析列表，用户可以根据需要点击材料进行播放。材料将根据播放进度用不同颜色显示，灰色表示已播放，蓝色表示进行中，黑色表示未播放。

未经过设置，切割后的材料将按照经验命名。

#### 切分

切分代码如下

```python
while i < duration:
    if qp[i].rms < self.config["maxZero"]:
        if zeroNum == 0:
            start = i
        zeroNum += 1
        i += 1
    else:
        if zeroNum > self.config["zeroNums"]: # 连续的 silence 片段
            end = i
            if lastEnd != -1:
                self.trigger.emit(json.dumps((lastEnd, start)))
            lastEnd = end
        zeroNum = 0
        i += 1
```



### 安装与使用

#### 1. 使用者

1.   去 [release](./releases) 下载最新版的exe文件，双击vety运行即可

#### 2. 开发者

1.   安装python，（软件采用 Python 3.9 开发 和 nuitka进行打包）

2.   安装所需库

     ``` bash
     pip install -r requirements.txt
     ```

3.   运行代码文件

     ```base
     python main.py
     ```

### 贡献

提交 Pull Requests 或者直接在 QQ 群1084345610里讨论