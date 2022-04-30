import sys
import os
import json
from PyQt5.QtCore import QThread, QUrl, Qt, QSettings, pyqtSignal, pyqtProperty
from PyQt5.QtGui import QDragEnterEvent, QCloseEvent, QDropEvent, QIcon, QKeySequence,  QPixmap
from PyQt5.QtWidgets import QApplication, QMainWindow, QShortcut, QWidget, QSplashScreen,  QFileDialog
from PyQt5.QtWebChannel import QWebChannel
from PyQt5.QtWebEngineWidgets import QWebEngineView
from pydub import AudioSegment


class VetyShared(QWidget):
    def __init__(self):
        super().__init__()

    def PyQt52WebValue(self):
        return "666"

    def Web2PyQt5Value(self, st: str):
        p = st.split(" ", 1)
        allP = st.split(" ")
        # print(p)
        if p[0] == "open":
            if len(p) < 2:
                win.browser.openFile()
            else:
                win.browser.openFile(p[1])
        elif p[0] == "preload":
            if len(sys.argv) > 1 and os.path.exists(sys.argv[1]):
                filePath = sys.argv[1].replace('\\', '/')
                win.browser.openFile(filePath)
        elif p[0] == "update":
            if len(p) > 0 and len(allP) >= 4 and allP[1] == "config":
                win.browser.updateConfig(allP[2], "".join(allP[3:]))
        elif p[0] == "get":
            if p[1] == "recentFiles":
                win.browser.emitRecentFiles(
                    win.browser.getRecentFiles())
            elif p[1] == "config":
                q = win.browser.config
                win.browser.page().runJavaScript(
                    f"Vety.config = {json.dumps(q)}")
    value = pyqtProperty(str, fget=PyQt52WebValue, fset=Web2PyQt5Value)


class VetyThread(QThread):
    trigger = pyqtSignal(str)
    config = {}
    fname = ""

    def __init__(self):
        super(VetyThread, self).__init__()

    def run(self):
        if self.fname and os.path.exists(self.fname):
            try:
                self.trigger.emit("clear")
                qp = AudioSegment.from_file(self.fname)
                duration = len(qp)
                zeroNum = 0
                start = end = 0
                i = 0
                progress = 0
                lastEnd = -1
                while i < duration:
                    if int((i + 1) * 20 / duration) * 5 > progress:
                        progress = int((i + 1) * 20 / duration) * 5
                        self.trigger.emit("progress " + str(progress))
                    if qp[i].rms < self.config["maxZero"]:
                        if zeroNum == 0:
                            start = i
                        zeroNum += 1
                        i += 1
                    else:
                        if zeroNum > self.config["zeroNums"]:
                            #print(i, zeroNum)
                            end = i
                            if lastEnd != -1:
                                self.trigger.emit(json.dumps((lastEnd, start)))
                            lastEnd = end
                        zeroNum = 0
                        i += 1
            except Exception as e:
                self.trigger.emit("Error {}".format(e))
            finally:
                self.trigger.emit("finish")


class VetyMain(QWebEngineView):
    def __init__(self):
        super(VetyMain, self).__init__()
        self.work = VetyThread()
        self.work.trigger.connect(self.display)
        self.settings = QSettings("VtDevTeam", "Vety")
        self.config = self.getConfig()
        self.setContextMenuPolicy(Qt.NoContextMenu)
        self.setAcceptDrops(True)

    def dragEnterEvent(self, e: QDragEnterEvent) -> None:
        if e.mimeData().hasText():
            e.accept()
        else:
            e.ignore()

    def dropEvent(self, e: QDropEvent) -> None:
        # print(e.mimeData().text())
        filePathList = e.mimeData().text()
        filePath = filePathList.split('\n')[0]
        filePath = filePath.replace('file:///', '', 1)
        self.openFile(filePath)

    def display(self, st):
        p = st.split(" ", 1)
        if p[0] == "Error":
            self.page().runJavaScript(
                "$('body').toast({ class: 'error', message: \""+p[1]+"\" }); ")
            self.page().runJavaScript("Vety.clearToLoad()")
        elif p[0] == "clear":
            self.page().runJavaScript("Vety.clearToLoad()")
        elif p[0] == "finish":
            self.page().runJavaScript("Vety.finishLoadFile()")
        elif p[0] == "progress":
            self.page().runJavaScript("$(\"#loaderProgress\").progress('set percent', " + p[1] + ")")
        else:
            self.page().runJavaScript("Vety.loadMaterials('{}')".format(st))

    def openFile(self, q=None):
        if q is None:
            fname, ftype = QFileDialog.getOpenFileName(
                self, '打开文件', './', 'mp3文件(*.mp3);;全部文件(*)')
        else:
            fname = q
        if fname and os.path.exists(fname):
            self.addRecentFiles(fname)
            self.page().runJavaScript("Vety.openFile('{}');".format(fname))
            self.page().runJavaScript("$(\"a[data-tab='parseList']\").click()")
            self.work.fname = fname
            self.work.config = self.config
            self.work.start()

    def getRecentFiles(self):
        recentFiles = self.settings.value('FileList/recentFiles') or []
        return recentFiles

    def addRecentFiles(self, fileName):
        recentFiles = self.getRecentFiles()
        if fileName in recentFiles:
            del recentFiles[recentFiles.index(fileName)]
        recentFiles.append(fileName)
        while len(recentFiles) > 10:
            del recentFiles[0]
        self.settings.setValue('FileList/recentFiles', recentFiles)
        self.emitRecentFiles(recentFiles)
        return True

    def emitRecentFiles(self, rc):
        self.page().runJavaScript("Vety.infos.recentFiles = JSON.parse('{}')".format(
            json.dumps(rc)))

    def updateConfig(self, key, val):
        if key == "maxZero" or key == "zeroNums":
            val = int(val)
        self.settings.setValue('Config/{}'.format(key), val)
        self.config[key] = val
        self.page().runJavaScript(
            "$('body').toast({ class: 'success', message: '修改成功' }); ")
        return True

    def getConfig(self, key=None):
        if key is None:
            maxZero = self.settings.value('Config/maxZero') or 5
            zeroNums = self.settings.value('Config/zeroNums') or 4950
            primaryColor = self.settings.value(
                'Config/primaryColor') or 'primary'
            return {
                "maxZero": maxZero,
                "zeroNums": zeroNums,
                "primaryColor": primaryColor
            }
        else:
            if key == "maxZero":
                return self.settings.value('Config/maxZero') or 5
            elif key == "zeroNums":
                return self.settings.value('Config/zeroNums') or 4950
            elif key == "primaryColor":
                return self.settings.value('Config/primaryColor') or 'primary'


class MainWindow(QMainWindow):
    def __init__(self):
        super(MainWindow, self).__init__()
        # self.prev_pos = None
        self.setWindowOpacity(0.97)
        self.setWindowTitle('Vety')
        self.resize(500, 600)
        self.setWindowIcon(QIcon("./imgs/logo.ico"))
        """self.tempDir = TemporaryDirectory()
        with AsarArchive.open('vety.asar') as archive:
            with self.tempDir as f:
                archive.extract(f)
                self.browser = VetyMain()
                self.browser.load(QUrl.fromLocalFile(os.path.join(
                    f, "/index.html")))"""

        self.browser = VetyMain()
        self.browser.load(QUrl.fromLocalFile(os.path.join(
            os.path.dirname(os.path.abspath(__file__)), "web/index.html")))
        self.setCentralWidget(self.browser)

        QShortcut(QKeySequence(self.tr("Ctrl+O")), self, self.openFile)

    def openFile(self):
        self.browser.openFile()
    # def closeEvent(self, a0: QCloseEvent) -> None:
        # self.tempDir.cleanup()
        # a0.ignore()


if __name__ == '__main__':
    os.environ["QTWEBENGINE_REMOTE_DEBUGGING"] = "9223"
    os.environ['path'] = os.path.join(os.path.dirname(
        __file__), "ffmpeg/bin/") + ";" + os.environ['path']
    app = QApplication(sys.argv)
    splash = QSplashScreen(QPixmap(os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "imgs/start.png")))
    splash.showMessage("Vety 1.0.6", Qt.AlignHCenter |
                       Qt.AlignBottom, Qt.black)
    splash.show()
    win = MainWindow()
    channel = QWebChannel()
    shared = VetyShared()
    channel.registerObject("vety", shared)
    win.browser.page().setWebChannel(channel)
    win.show()
    splash.finish(win)
    app.exit(app.exec_())
