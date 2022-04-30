from pydub import AudioSegment
from pydub.silence import detect_nonsilent
import os
import time
os.environ['path'] = os.path.join(os.path.dirname(
    __file__), "ffmpeg/bin/") + ";" + os.environ['path']

class listen_file:
    def __init__(self, file) -> None:
        self.file = AudioSegment.from_file(file)
        self.points = []
        #self.materials = []

    def cut(self, maxZero = 5, zeroNums = 3200) -> int:
        # print("------Start------")
        i = 0
        duration = len(self.file)
        zeroNum = 0
        start = end = 0
        blank = []
        # print(len(self.file))
        startTime = time.time()
        while i < duration:
            if self.file[i].rms < maxZero:
                if zeroNum == 0:
                    start = i
                zeroNum += 1
                i += 1
            else:
                if zeroNum > zeroNums:
                    #print(i, zeroNum)
                    end = i
                    blank.append((start, end))
                zeroNum = 0
                i += 1
        # print(blank)
        endTime = time.time()
        print(endTime - startTime)
        #self.materials = []
        self.points = []
        for i in range(1, len(blank)):
            #self.materials.append(self.file[blank[i-1][1]:blank[i][0]])
            self.points.append([blank[i-1][1], blank[i][0]])
            # print(self.materials[-1].max)
            #self.file[blank[i-1][1]:blank[i][0]].export("listen{}.mp3".format(i), format="mp3")

        end2Time = time.time()
        print(end2Time - endTime)
        return self.points


if __name__ == "__main__":
    p = listen_file("test.mp3")
    p.cut()
