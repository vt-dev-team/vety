// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const { exec } = require('child_process')
const fs = require("fs")
const path = require('path')
const Store = require("electron-store")
const store = new Store()

function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 480,
        height: 640,
        minWidth: 300,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, './logo.ico')
    })

    // and load the index.html of the app.
    mainWindow.loadFile('./pages/index.html')
    ipcMain.on('window-min', function() {
        mainWindow.minimize();
    })
    ipcMain.on('window-max', function() {
        if (mainWindow.isMaximized()) {
            mainWindow.restore();
        } else {
            mainWindow.maximize();
        }
    })
    ipcMain.on('window-close', function() {
        mainWindow.close();
    })
    ipcMain.on('window-reload', function() {
        mainWindow.reload();
    })
    ipcMain.on('window-debug', function() {
        mainWindow.webContents.toggleDevTools();
    })
    ipcMain.on('parseFile', (_, fn) => {
        //console.log("GET", fn)
        if (!fn) {
            tmp = dialog.showOpenDialogSync({
                title: "打开文件",
                defaultPath: "",
                properties: ["openFile"],
                filters: [
                    { name: "听力文件", extensions: ["mp3", "avi", "wav", "cda"] },
                    { name: "全部文件", extensions: ["*"] }
                ]
            })
            if (tmp && tmp.length > 0)
                fn = tmp[0]
        }
        if (fn)
            parseFile(fn)
    })
    mainWindow.on('maximize', () => {
        mainWindow.webContents.send('mainWin-max', true)
    })
    mainWindow.on('unmaximize', () => {
        mainWindow.webContents.send('mainWin-max', false)
    })
    let recent = store.get("recentFiles") || []
    ipcMain.on('vetyLoaded', () => {
        mainWindow.webContents.send("getRecent", recent)
    })
    ipcMain.on('getSettings', () => {
        let vetySettings = store.get("settings") || {}
        mainWindow.webContents.send("getRecent", vetySettings)
    })
    ipcMain.on('clearRecent', (_, d) => {
        recent.splice(recent.length - d - 1, 1)
        store.set("recentFiles", recent)
        mainWindow.webContents.send("getRecent", recent)
    })

    function parseFile(fn) {
        if (!fs.existsSync(fn)) {
            mainWindow.webContents.send('mes', 'error', '', `文件${fn}找不到`)
        }
        let rcI = recent.indexOf(fn)
        if (rcI != -1) {
            recent.splice(rcI, 1)
        }
        if (recent.length >= 10)
            recent.splice(0, 1)
        recent.push(fn)
            //console.log(recent)
        store.set("recentFiles", recent)
        mainWindow.webContents.send("getRecent", recent)
        fn = fn.replace(/\\/g, "\\\\")
        mainWindow.webContents.executeJavaScript("Vety.changeTab(1); Vety.clearToLoad();")
        mainWindow.webContents.executeJavaScript("Vety.openFile('" + fn + "')")
        exec('"bin\\vetyCli.exe" "' + fn + '" -simple', (e, stdout, stderr) => {
            //console.log(stdout)
            if (e) {
                mainWindow.webContents.send('mes', 'error', '执行vetyCli时出现错误', `${e}`)
            } else {
                mainWindow.webContents.send("loadParsed", stdout)
            }
            mainWindow.webContents.executeJavaScript(`Vety.finishLoadFile()`)
        })
    }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    createWindow()
    app.on('activate', function() {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.