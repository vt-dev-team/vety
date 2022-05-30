from pydub import AudioSegment
import os
import time
os.environ['path'] = os.path.join(os.path.dirname(
    __file__), "ffmpeg/bin/") + ";" + os.environ['path']


def cut_listen_file(file: str, max_zero: int = 10, min_num: int = 4200, long_min: int = 8500) -> dict:
    """将英语听力文件切分。

    将一个英语听力文件根据空白音频段自动切分为多个材料，并且自动根据听力材料类型适配。

    参数
    ----------
    file: str
        英语听力音频的文件(mp3)
    max_zero: int = 10
        当一段音频的分贝数小于该值时被认为是空白
    min_num: int = 4200
        只有空白音频长度达到该值才被识别

    返回值
    -------
    dict
        键值如下
        special_modes(list) 表示特殊，例如example表示有示例音频
        blanks(list) 表示分割好的空白
        materials(list)表示分割好的材料

        空白和材料内容均为一个dict，格式如下：
        start(int): 开始的位置(毫秒)
        end(int): 结束的位置(毫秒)
        length(int): 长度，即end-start+1
        name(str): 为材料标明的标题

    示例
    -------
    >>> cut_listen_file("./tests/test.mp3")
    >>> print(cut_listen_file("./tests/test_with_example.mp3")["special_modes"])
    example
    """

    listen_file = AudioSegment.from_file(file)
    duration = len(listen_file)

    tp = 0      # tp=0表示空白 1表示非空白
    start = 0

    cutted = []

    for i in range(duration):
        if listen_file[i].rms < max_zero:   # 如果分贝数小于设定值
            if tp == 1:
                if len(cutted) > 0 and cutted[-1][0] == tp:
                    cutted[-1][2] = i
                else:
                    cutted.append([tp, start, i])
                start = i
            tp = 0
        else:
            if tp == 0 and i - start + 1 >= min_num:
                #print(i - start + 1)
                if len(cutted) > 0 and cutted[-1][0] == tp:
                    cutted[-1][2] = i
                else:
                    cutted.append([tp, start, i])
                start = i
            tp = 1

    blanks = []
    #non_blanks = []

    for i in cutted:
        if i[0] == 0 and i[1] > 0:
            blanks.append({
                # "type": 0,
                "start": i[1],
                "end": i[2],
                "length": i[2] - i[1] + 1
            })

    # print(blanks)

    ret = {
        "special_modes": [],
        "materials": [],
        "blanks": [],
        "raw_materials": [],
    }

    cutted_blanks_temp = []
    find_girl_friend = [False] * len(blanks)
    finish_short = False
    last_short = -1
    short_range = [0, 0]

    for i in range(len(blanks)):
        if not finish_short:
            if blanks[i]["length"] < long_min:
                if len(cutted_blanks_temp) > 0:
                    if i - last_short > 1 and len(cutted_blanks_temp) > 4:
                        finish_short = True
                        short_range[1] = i
                    else:
                        short_range[0] = i
                        ret["special_modes"].append("example")
                else:
                    short_range[0] = i
                last_short = i
            cutted_blanks_temp.append(i)
        elif blanks[i]["length"] >= long_min:
            if find_girl_friend[i]:
                continue
            girl_friend_cnt = 0
            for j in range(i + 1, len(blanks)):
                if blanks[j]["length"] < long_min or find_girl_friend[j]:
                    continue
                girl_friend_cnt += 1
                if abs(blanks[i]["length"] - blanks[j]["length"]) < 1100:
                    find_girl_friend[j] = True
                    cutted_blanks_temp.append(i)
                    cutted_blanks_temp.append(j)
                    break
                if girl_friend_cnt > 1:
                    break
    # print(short_range)
    for i in cutted_blanks_temp:
        ret["blanks"].append(blanks[i])

    if len(ret["blanks"]) == 0:
        return ret

    material_point = 0
    material_count2 = 0
    if ret["blanks"][0]["start"] != 0:
        ret["materials"].append({
            "start": 0,
            "end": ret["blanks"][0]["start"],
            "name": "提示语"
        })
        material_count2 += 1
        ret["raw_materials"].append({
            "start": 0,
            "end": ret["blanks"][0]["start"],
            "name": "材料{}".format(material_count2)
        })
    else:
        ret["materials"].append({
            "start": ret["blanks"][material_point]["end"],
            "end": ret["blanks"][material_point + 1]["start"],
            "name": "提示语"
        })
        material_point += 1
    for i in range(1, len(ret["blanks"])):
        material_count2 += 1
        ret["raw_materials"].append({
            "start": ret["blanks"][i - 1]["end"],
            "end": ret["blanks"][i]["start"],
            "name": "材料{}".format(material_count2)
        })
    if ret["blanks"][-1] != duration:
        material_count2 += 1
        ret["raw_materials"].append({
            "start": ret["blanks"][-1]["end"],
            "end": duration,
            "name": "材料{}".format(material_count2)
        })

    if "example" in ret["special_modes"]:
        ret["materials"].append({
            "start": ret["blanks"][material_point]["end"],
            "end": ret["blanks"][material_point + 1]["start"],
            "name": "示例材料"
        })
        material_point += 1

    while material_point < short_range[0]:
        ret["materials"].append({
            "start": ret["blanks"][material_point]["end"],
            "end": ret["blanks"][material_point + 1]["start"],
            "name": "提示语"
        })
        material_point += 1

    material_count = 0
    for i in range(short_range[0], short_range[1]):
        material_count += 1
        ret["materials"].append({
            "start": ret["blanks"][i]["end"],
            "end": ret["blanks"][i + 1]["start"],
            "name": "第{}段材料".format(material_count)
        })

    for i in range(short_range[1] + 1, len(ret["blanks"]), 2):
        ret["materials"].append({
            "start": ret["blanks"][i - 1]["end"],
            "end": ret["blanks"][i]["start"],
            "name": "提示语"
        })
        material_count += 1
        ret["materials"].append({
            "start": ret["blanks"][i]["end"],
            "end": ret["blanks"][i + 1]["start"],
            "name": "第{}段材料".format(material_count)
        })

    ret["materials"].append({
        "start": ret["blanks"][-1]["end"],
        "end": duration,
        "name": "提示语"
    })
    return ret
    # print(special_modes)


def cut_listen_file_simple(file: str, max_zero: int = 10, min_num: int = 4200) -> dict:
    k = cut_listen_file(file, max_zero, min_num)
    res = {
        "s": k["special_modes"],
        "m": [[x["start"], x["end"], x["name"]] for x in k["materials"]],
        "r": [[x["start"], x["end"], x["name"]] for x in k["raw_materials"]]
    }
    return res


if __name__ == "__main__":
    TIMER_START = time.time()
    print(cut_listen_file_simple("./tests/test2.mp3"))

    TIMER_END = time.time()
    print("Time Cost:", TIMER_END - TIMER_START, "s")
