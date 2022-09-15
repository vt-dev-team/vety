import sys
import os
import json
from PySide6.QtCore import QThread, QUrl, Qt, QSettings, Property, Signal
from PySide6.QtGui import QDragEnterEvent, QShortcut, QDropEvent, QIcon, QKeySequence,  QPixmap
from PySide6.QtWidgets import QApplication, QMainWindow, QWidget, QSplashScreen,  QFileDialog, QGraphicsDropShadowEffect
from PySide6.QtWebChannel import QWebChannel
from PySide6.QtWebEngineWidgets import QWebEngineView
from libs.vetyCutter import cut_listen_file_simple

vetyApp = {
    "name": 'Vety',
    "version": '1.3.0',
    "author": 'yemaster',
    "updates": [
        {
            "version": 'v1.3.0',
            "details": [
                '优化了部分动画',
                '优化了界面显示'
            ]
        }
    ]
}

lis = None

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
            win.browser.page().runJavaScript(
                f"Vety.app = {json.dumps(vetyApp)}")
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
        elif p[0] == "export":
            if not lis is None:
                fn = QFileDialog.getSaveFileName(win, "保存mp3文件", './', 'mp3文件(*.mp3);;全部文件(*)')[0]
                try:
                    lis[int(allP[1]):int(allP[2])+1].export(fn, format="mp3")
                except Exception as e:
                    print("Error", e)
    value = Property(str, fget=PyQt52WebValue, fset=Web2PyQt5Value)

class VetyThread(QThread):
    trigger = Signal(str)
    config = {}
    fname = ""

    def __init__(self):
        super(VetyThread, self).__init__()

    def run(self):
        #print(self.fname)
        if self.fname and os.path.exists(self.fname):
            try:
                global lis
                res, lis = cut_listen_file_simple(
                    self.fname, self.config["maxZero"], self.config["zeroNums"])
                self.trigger.emit("Result {}".format(json.dumps(res)))
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
        self.setContextMenuPolicy(Qt.ContextMenuPolicy.NoContextMenu)
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
        elif p[0] == "Result":
            # print(p[1])
            self.page().runJavaScript("Vety.loadMaterial('{}')".format(p[1]))
        elif p[0] == "clear":
            self.page().runJavaScript("Vety.clearToLoad()")
        elif p[0] == "finish":
            self.page().runJavaScript("Vety.finishLoadFile()")
        elif p[0] == "progress":
            self.page().runJavaScript(
                "$(\"#loaderProgress\").progress('set percent', " + p[1] + ")")
        else:
            self.page().runJavaScript("Vety.loadMaterials('{}')".format(st))

    def openFile(self, q=None):
        if q is None:
            fname, ftype = QFileDialog.getOpenFileName(
                self, '打开文件', './', 'mp3文件(*.mp3);;全部文件(*)')
        else:
            fname = q
        if fname:
            if os.path.exists(fname):
                self.addRecentFiles(fname)
                self.page().runJavaScript("Vety.openFile('{}');".format(fname))
                self.page().runJavaScript(
                    "Vety.changeTab(1)")
                self.work.fname = fname
                self.work.config = self.config
                self.work.start()
            else:
                self.page().runJavaScript(
                "$('body').toast({ class: 'error', message: '找不到文件' }); ")


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
            standardFile = self.settings.value(
                'Config/standardFile') or 'standards/standard.vety'
            return {
                "maxZero": maxZero,
                "zeroNums": zeroNums,
                "primaryColor": primaryColor,
                "standardFile": standardFile
            }
        else:
            if key == "maxZero":
                return self.settings.value('Config/maxZero') or 5
            elif key == "zeroNums":
                return self.settings.value('Config/zeroNums') or 4950
            elif key == "primaryColor":
                return self.settings.value('Config/primaryColor') or 'primary'
            elif key == "standardFile":
                return self.settings.value(
                    'Config/standardFile') or 'standards/standard.vety'


class MainWindow(QMainWindow):
    def __init__(self):
        super(MainWindow, self).__init__()
        # self.prev_pos = None
        self.setWindowTitle("{} v{}".format(
            vetyApp["name"], vetyApp["version"]))
        self.resize(450, 600)
        self.setWindowIcon(QIcon(os.path.join(
            os.path.dirname(os.path.abspath(__file__)), "main/imgs/logo.ico")))

        self.browser = VetyMain()
        self.browser.load(QUrl.fromLocalFile(os.path.join(
            os.path.dirname(os.path.abspath(__file__)), "main/index.html")))
        self.setCentralWidget(self.browser)

        QShortcut(QKeySequence(self.tr("Ctrl+O")), self, self.openFile)
        QShortcut(QKeySequence(self.tr("Ctrl+Shift+F")), self, self.playRateUp)
        QShortcut(QKeySequence(self.tr("Ctrl+Shift+L")),
                  self, self.playRateDown)
        QShortcut(QKeySequence(self.tr("Space")),
                  self, self.playChange)

    def playRateUp(self):
        self.browser.page().runJavaScript("Vety.addRate(1)")

    def playRateDown(self):
        self.browser.page().runJavaScript("Vety.addRate(-1)")

    def playChange(self):
        self.browser.page().runJavaScript("Vety.changeState()")

    def openFile(self):
        self.browser.openFile()
    # def closeEvent(self, a0: QCloseEvent) -> None:
        # self.tempDir.cleanup()
        # a0.ignore()


if __name__ == '__main__':
    #os.environ["QTWEBENGINE_REMOTE_DEBUGGING"] = "9223"
    os.environ['path'] = os.path.join(os.path.dirname(
        __file__), "ffmpeg/bin/") + ";" + os.environ['path']
    app = QApplication(sys.argv)
    splash = QSplashScreen(QPixmap(os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "main/imgs/start.png")))
    splash.show()
    win = MainWindow()
    channel = QWebChannel()
    shared = VetyShared()
    channel.registerObject("vety", shared)
    win.browser.page().setWebChannel(channel)
    win.show()
    splash.finish(win)
    app.exit(app.exec())
