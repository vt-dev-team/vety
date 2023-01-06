const ipc = require('electron').ipcRenderer
const { shell } = require("electron")

let Vety = new Vue({
    el: "#app",
    data: {
        app: {
            name: 'Vety',
            version: '2.0.0',
            coreVersion: '1.3.2',
            cliVersion: '1.0.1',
            author: 'yemaster',
            updates: []
        },
        preference: {
            themes: {
                "Classic": {
                    "primary": "blue"
                },
                "Dark": {
                    "primary": "blue"
                }
            },
            choosed: "Classic"
        },
        usefulWords: [
            "小提示：Ctrl+Shift+F/L可以倍速播放",
            "小提示：空格可以暂停/播放",
            "小提示：Ctrl+O可以快速打开文件",
            "Tears are a kind of emotional release.",
            "Crazy miss, where are you.",
            "As long as you live better than me, die early.",
            "Love like an idiot, worth it?",
            "I want to love my seal in your heart.",
            "You are my life, I can't live without you.",
            "Carrying my full memory, you're far away.",
            "Not because of my persistence, but because you deserve it.",
            "Happy to know how to share, to be more happy.",
            "I will not beat you, you don't know me but.",
            "Broken the promise of a place, put together not back yesterday.",
            "Some things, do not say is a knot, say is a scar.",
            "There is no love in my world, it's meant to be apart.",
            "I just want to find a person I can manage.",
            "A ray of sunshine in the morning, woke me from my sleep.",
            "I just don't want to leave you, I don't want to.",
            "If the outcome is bound to be sad, then I would rather choose to give up.",
            "I gave it back to you, and I found it really easy.",
            "The fickleness of the world I have to make myself disguised as a hedgehog.",
            "I have heard the most ridiculous story, is you and her love.",
            "Turning only to meet you, but you forget, you will turn.",
            "I want to hold your hand, walk, escape from the planet.",
            "The whole world can be yours, but you can only be mine.",
            "I began to learn to imagine, the idea of a place where you and I.",
            "Every second that you are touching, it's always in my life.",
            "Time is not to let people forget the pain, it just makes people used to pain.",
            "Tangle of love, is that you have to let me choose to smile to leave.",
            "Whether it is to leave or to get together, always so painful."
        ],
        unibody: "window",
        isMax: false,
        menu: {
            tabMenuItems: [{
                icon: "24gl-home5",
                page: "MainContent",
                name: "主页"
            }, {
                icon: "24gl-musicAlbum",
                page: "ResContent",
                name: "播放"
            }, {
                icon: "24gl-gear2",
                page: "Settings",
                name: "设置",
            }, {
                icon: "24gl-infoCircle",
                page: "About",
                name: "关于",
            }, ],
            chosenTab: "MainContent",
        },
        infos: {
            recentFiles: []
        },
        config: {
            maxZero: 5,
            zeroNums: 3200,
            primaryColor: 'primary',
            standardFile: 'standard.vety'
        },
        ismax: false,
        loadText: "加载中",
        useExperienceCutName: true,
        isloading: true,
        isLoadingFile: false,
        isdragging: false,
        dragCount: 0,
        filename: "",
        vetyBridge: {},
        playRates: [0.125, 0.25, 0.5, 1, 1.5, 2, 4, 8, 16],
        nowRate: 3,
        cutResult: {
            special_modes: [],
            materials: [],
            raw: []
        },
        player: {
            disabled: false,
            nowTime: 0,
            allTime: 0,
        },
        status: 0,
        playerPercent: 0,
        chooseEle: 0,
        customPage: "",
    },
    computed: {
        reverseRecentFiles() {
            return this.infos.recentFiles.reverse()
        }
    },
    mounted: function() {
        let _t = this
        _t.isloading = false

        // Send Prepare Signal
        ipc.send('vetyLoaded')

        audioElement = document.getElementById("mainMusic")
        audioElement.addEventListener("timeupdate", () => {
            _t.player.nowTime = audioElement.currentTime
            _t.playerPercent = _t.nowPercent()
                //console.log(_t.playerPercent, audioElement.duration)
            if (_t.player.allTime != audioElement.duration) {
                _t.player.allTime = audioElement.duration
            } else {
                _t.$refs.playerSlider.changePercent(_t.playerPercent)
            }
        })
        document.addEventListener("click", function() {
            let rm = document.getElementById("rightMenu")
            rm.style.display = "none"
        })
        document.getElementById("app").addEventListener("drop", (e) => {
            e.preventDefault()
            _t.isdragging = false
            _t.dragCount = 0
            if (_t.isLoadingFile)
                return
            const files = e.dataTransfer.files
            if (files) {
                ipc.send('parseFile', files[0].path)
            }
        })
        document.getElementById("app").addEventListener('dragover', (e) => {
            e.preventDefault()
        })
        document.getElementById("app").addEventListener("dragenter", (e) => {
            e.preventDefault()
                //console.log("ENTER")
            if (_t.isLoadingFile)
                return
            _t.dragCount++;
            _t.isdragging = true
        })
        document.getElementById("app").addEventListener("dragleave", (e) => {
            e.preventDefault()
            _t.dragCount--;
            if (!_t.dragCount) {
                //console.log("LEAVE")
                _t.isdragging = false
            }
        })
        $('.checkbox').checkbox()
        $('.vmenu .menuScroller').css({
            top: `${$(".vmenu a.active.item")[0].offsetTop+22.5}px`,
            height: "15px"
        })
        $(".ui.dropdown.button").dropdown()
        $(_t.$refs[this.menu.chosenTab]).transition('fade up', '100ms')
        audioElement.addEventListener("play", () => {
            _t.status = 1
        })
        audioElement.addEventListener("pause", () => {
            _t.status = 0
        })
        setInterval(function() { _t.loadText = _t.usefulWords[Math.floor(Math.random() * _t.usefulWords.length)] }, 3000)
        _t.loadText = _t.usefulWords[Math.floor(Math.random() * 3)]
            // Key Listener
        document.addEventListener("keydown", (e) => {
            //console.log(e)
            e.preventDefault()
            let pressedKey = e.key.toUpperCase()
            switch (pressedKey) {
                case " ":
                    _t.changeState()
                    break
                case "F":
                    if (e.shiftKey && e.ctrlKey)
                        _t.addRate(1)
                    break
                case "L":
                    if (e.shiftKey && e.ctrlKey)
                        _t.addRate(-1)
                    break
                case "O":
                    if (e.ctrlKey)
                        _t.askFile()
                    break
                case "R":
                    if (e.ctrlKey)
                        ipc.send("window-reload")
                    break
                case "F4":
                    if (e.altKey)
                        ipc.send("window-close")
                    break
                case "ARROWLEFT":
                    _t.playAbsolute(-5)
                    break
                case "ARROWRIGHT":
                    _t.playAbsolute(5)
            }
        })
    },
    methods: {
        chatWithPyQt: function(c) {
            window.vetyBridge.value = c
        },
        getTheme(g) {
            return this.preference.themes[this.preference.choosed][g]
        },
        parseLink(url) {
            let urlFC = url.split(":")
            let res = ""
            if (urlFC[0] == "github")
                res = "https://github.com/"
            res += urlFC[1]
            return res
        },
        openLink(lk) {
            shell.openExternal(this.parseLink(lk))
        },
        changeTab: function(d) {
            let _t = this
            if (_t.menu.tabMenuItems[d].page != this.menu.chosenTab) {
                $('.vmenu .menuScroller').css('top', `${d*55+22.5}px`)
                $(_t.$refs[this.menu.chosenTab]).transition('fade up', '100ms')
                _t.menu.chosenTab = _t.menu.tabMenuItems[d].page
                setTimeout(function() {
                    $(_t.$refs[_t.menu.tabMenuItems[d].page]).transition('fade up', '100ms')
                }, 130)
            }
        },
        askFile: function() {
            ipc.send("parseFile", "")
        },
        getMusicName: function(p) {
            if (this.useExperienceCutName) {
                if (this.materials[p].length >= 3)
                    return this.materials[p][2]
                else
                    return this.info[p]
            } else
                return `音频${p + 1}`
        },
        addRate: function(cont) {
            let _t = this
            _t.nowRate += cont
            if (_t.nowRate < 0)
                _t.nowRate = 0
            if (_t.nowRate >= _t.playRates.length)
                _t.nowRate = _t.playRates.length - 1
            $("#mainMusic").get(0).playbackRate = _t.playRates[_t.nowRate]
            Toast.fire({
                icon: 'info',
                text: `已开启${_t.playRates[_t.nowRate]}倍速`
            });
        },
        openFile: function(fn) {
            let _t = this
            _t.filename = fn
            _t.isLoadingFile = true
            $("#loader").css("display", "block")
            $(() => {
                $("#mainMusic").attr("src", fn)
                let vety_audio = $("#mainMusic").get('0')
                $("#mainMusic").get('0').pause()
                _t.status = 0
                _t.player.nowTime = 0
                vety_audio.load()
            })
        },
        loadMaterial: function(p) {
            let _t = this
            let q = JSON.parse(p)
            _t.cutResult = {
                    special_modes: q.s,
                    materials: q.m,
                    raw: q.r
                }
                //console.log(this.cutResult)
        },
        clearToLoad: function() {
            this.cutResult = {
                special_modes: [],
                materials: [],
                raw: []
            }
        },
        finishLoadFile: function() {
            this.isLoadingFile = false
        },
        play: function() {
            document.getElementById("mainMusic").play()
        },
        stop: function() {
            document.getElementById("mainMusic").pause()
        },
        changeState: function() {
            if (this.status === 0)
                this.play()
            else
                this.stop()
        },
        playFrom: function(p) {
            document.getElementById("mainMusic").currentTime = p
            this.play()
        },
        playAbsolute: function(e) {
            document.getElementById("mainMusic").currentTime += e
            this.play()
        },
        formatSeconds: function(a) {
            var hh = parseInt(a / 3600);
            if (hh < 10) hh = "0" + hh;
            var mm = parseInt((a - hh * 3600) / 60);
            if (mm < 10) mm = "0" + mm;
            var ss = parseInt((a - hh * 3600) % 60);
            if (ss < 10) ss = "0" + ss;
            var length = hh + ":" + mm + ":" + ss;
            if (a > 0) {
                return length;
            } else {
                return "00:00:00";
            }
        },
        doUpdate: function() {
            for (let i in this.config)
                this.config[i] = this.config[i]
        },
        changePercent: function(v) {
            this.playFrom(this.player.allTime / 100 * v)
        },
        nowPercent() {
            if (this.player.nowTime == 0)
                return 0
            else
                return this.player.nowTime / this.player.allTime * 100
        },
        showContextMenu(q, e) {
            let _t = this
            _t.chooseEle = q
            let rm = document.getElementById("rightMenu")
            rm.style.display = "block"
            let mx = e.clientX;
            let my = e.clientY;
            let rmWidth = rm.offsetWidth;
            let rmHeight = rm.offsetHeight;
            let pageWidth = document.documentElement.clientWidth;
            let pageHeight = document.documentElement.clientHeight - 100;
            if ((mx + rmWidth) < pageWidth)
                rm.style.left = mx + "px";
            else
                rm.style.left = mx - rmWidth + "px";
            if ((my + rmHeight) < pageHeight)
                rm.style.top = my + "px";
            else
                rm.style.top = my - rmHeight + "px";
            return false;
        },
        exportMp3(q) {
            //this.chatWithPyQt(`export ${this.cutResult.materials[q][0]} ${this.cutResult.materials[q][1]}`)
        }
    },
    components: {
        vetyProgress
    }
})
document.getElementById('maxbtn').addEventListener('click', () => {
    ipc.send('window-max');
})
document.getElementById('minbtn').addEventListener('click', () => {
    ipc.send('window-min');
})
document.getElementById('closebtn').addEventListener('click', () => {
    ipc.send('window-close');
})
ipc.on('mainWin-max', (_, status) => {
    Vety.isMax = status
})
ipc.on('getRecent', (_, ps) => {
    Vety.infos.recentFiles = ps
})
ipc.on('loadParsed', (_, ps) => {
    //console.log(ps)
    Vety.loadMaterial(ps)
})
ipc.on('mes', (_, ic, ti, ms) => {
    Toast.fire({
        icon: ic,
        title: ti,
        text: ms
    })
})