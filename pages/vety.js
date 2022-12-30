let isLoading = true
const ipc = require('electron').ipcRenderer

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
            "She was lovely.Then things changed.",
            "One candle, unattended.Only ashesremain.",
            "I leave.Dog panics.Furniture sale.",
            "Imagined adulthood.Gained adulthood.Lost Imagination.",
            "Cancer.Only three months left.Pregnant.",
            "Nothing to declare.Much to remember.",
            "New start.Newyou.Not you.",
            "Relationshipexpires;leaves a bitter aftertaste.",
            "She's his love;he's her wallet.",
            "They livedhappily ever after.Separately.",
            "First Friends.Then Lover.Lost both.",
            "Two wives, one funeral.No tear",
            "Tow lovers.One parachute.No survivors.",
            "'I love you too,'she lied.",
            "He loves her, they're just friends.",
            "Fantasticweekend.Then he never called."
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
            /*document.addEventListener("DOMContentLoaded", () => {
                new QWebChannel(qt.webChannelTransport, (c) => {
                    window.vetyBridge = c.objects.vety
                    window.vetyBridge.value = "preload"
                    window.vetyBridge.value = "get config"
                    window.vetyBridge.value = "get recentFiles"
                })
            })*/
        audioElement = document.getElementById("mainMusic")
        audioElement.addEventListener("timeupdate", () => {
                _t.player.nowTime = audioElement.currentTime
                _t.playerPercent = _t.nowPercent()
                console.log(_t.playerPercent, audioElement.duration)
                if (_t.player.allTime != audioElement.duration) {
                    _t.player.allTime = audioElement.duration
                } else {
                    _t.$refs.playerSlider.changePercent(_t.playerPercent)
                }
            })
            //document.documentElement.oncontextmenu = function(e) {
            //}
        document.addEventListener("click", function() {
            let rm = document.getElementById("rightMenu")
            rm.style.display = "none"
        })
        $('.ui.accordion')
            .accordion()
        $('.checkbox').checkbox()
            //$('.tabButton, .menu .item')
            //    .tab();
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
    },
    methods: {
        chatWithPyQt: function(c) {
            window.vetyBridge.value = c
        },
        getTheme(g) {
            return this.preference.themes[this.preference.choosed][g]
        },
        changeTab: function(d) {
            let _t = this
            if (_t.menu.tabMenuItems[d].page != this.menu.chosenTab) {
                $('.vmenu .menuScroller').css('top', `${d*55+22.5}px`)
                $(_t.$refs[this.menu.chosenTab]).transition('fade up', '100ms')
                _t.menu.chosenTab = _t.menu.tabMenuItems[d].page
                setTimeout(function() {
                    $(_t.$refs[_t.menu.tabMenuItems[d].page]).transition('fade up', '100ms')
                }, 100)
            }
        },
        askFile: function() {
            //console.log(ipc)
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
                text: `${_t.playRates[_t.nowRate]}倍速`
            });
        },
        openFile: function(fn) {
            let _t = this
            _t.filename = fn
                //$('#loaderProgress').css("display", "block")
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
            console.log(this.cutResult)
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
            this.chatWithPyQt("update " + JSON.stringify(this.config))
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
            this.chatWithPyQt(`export ${this.cutResult.materials[q][0]} ${this.cutResult.materials[q][1]}`)
        },
        /*extendMusic(z) {
            let _t = this
            _t.player.disabled = true
            _t.changeExtendMusic(`h${_t.customPage}t`)
        },
        changeExtendMusic(p) {
            let _t = this
            if (p.length <= 0) {
                _t.player.disabled = false
                $(() => {
                    $("#mainMusic").attr("src", _t.filename)
                    let vety_audio = $("#mainMusic").get('0')
                    $("#mainMusic").get('0').pause()
                    _t.status = 0
                    _t.player.nowTime = 0
                    vety_audio.load()
                    _t.play()
                })
                _t.play()
                return
            }
            let musicName = "../extend/"
            if (p[0] == "h")
                musicName += "head.mp3"
            else if (p[0] == "t")
                musicName += "tail.mp3"
            else
                musicName += p[0] + ".mp3"
            $(() => {
                $("#mainMusic").attr("src", musicName)
                let vety_audio = $("#mainMusic").get('0')
                $("#mainMusic").get('0').pause()
                _t.status = 0
                _t.player.nowTime = 0
                vety_audio.load()
                _t.play()
                vety_audio.onended = () => {
                    _t.changeExtendMusic(p.slice(1))
                }
            })
        }*/
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