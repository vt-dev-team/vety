let isLoading = true

let Vety = new Vue({
    el: "#app",
    data: {
        app: {
            name: 'Project Name',
            version: 'Project Version',
            author: 'Project Author',
            updates: []
        },
        usefulWords: [
            "小提示：Ctrl+Shift+F/L可以倍速播放",
            "小提示：空格可以暂停/播放",
            "小提示：Ctrl+O可以快速打开文件",
            "Nothing brave, nothing have.", "No one can call back yesterday.", "No rose without a thorn.", "Not to advance is to go back.", "Nothing in the world is difficult for one who sets his mind to it.", "No way is impossible to courage.", "No man can do two things at once.", "No man is born wise or learned.", "No man is content.", "No man is wise at all times.", "None are so blind as those who won’t see.", "None are so deaf as those who won’t hear.", "No news is good news.", "No cross, no crown.", "No pains, no gains.", "No pleasure without pain.", "New wine in old bottles.", "No sweet without sweat.", "No smoke without fire.", "Never too old to learn, never too late to turn.", "Nothing dries sooner than a tear.", "No garden without its weeds.", "Nothing is difficult to the man who will try.", "Nothing seek, nothing find.", "Nothing is so necessary for travelers as languages.", "Nothing is to be got without pains but poverty.", "Never say die.", "Not to know what happened before one was born is always to be a child.", "No living man all things can.", "Obedience is the first duty of a soldier.", "Observation is the best teacher.", "Offense is the best defense.", "Old friends and old wines are best.", "Old sin makes new shame.", "Once a man and twice a child.", "Once a thief, always a thief.", "Once bitten, twice shy.", "One boy is a boy, two boys half a boy, three boys no boy.", "One cannot put back the clock.", "One eyewitness is better than ten hearsays.", "One false move may lose the game.", "One good turn deserves another.", "One hour today is worth two tomorrow.", "One man’s fault is other man’s lesson.", "One never loses anything by politeness.", "One swallow does not make a summer.", "One’s words reflect one’s thinking.", "Out of debt, out of danger.", "Out of office, out of danger.", "Out of sight, out of mind.", "Patience is the best remedy.", "Penny wise, pound foolish.", "Plain dealing is praised more than practiced.", "Please the eye and plague the heart.", "Pleasure comes through toil.", "Pour water into a sieve.", "Practice makes perfect.", "Praise is not pudding.", "Praise makes good men better, and bad men worse.", "Prefer loss to unjust gain.", "Prevention is better than cure.", "Pride goes before, and shame comes after.", "Promise is debt.", "Proverbs are the daughters of daily experience.", "Pull the chestnut out of fire.", "Put the cart before the horse.", "Put your shoulder to the wheel.", "Reading enriches the mind.", "Reading is to the mind while exercise to the body.", "Respect yourself, or no one else will respect you.", "Rome is not built in a day.", "Saying is one thing and doing another.", "Seeing is believing.", "Seek the truth from facts.", "Send a wise man on an errand, and say nothing to him.", "Set a thief to catch a thief.", "He is not fit to command others that cannot command himself.", "Something is better than nothing.", "He is wise that is honest.", "Soon ripe, soon rotten.", "Speech is silver, silence is gold.", "Still water run deep.", "Strike the iron while it is hot.", "Success belongs to the persevering.", "Take things as they come.", "Talking mends no holes.", "Talk of the devil and he will appear.", "Hasty love, soon cold.", "Health is better than wealth.", "Health is happiness.", "Hear all parties.", "He knows most who speaks least", "He is a fool that forgets himself.", "He is a good friend that speaks well of us behind our backs.", "He is a wise man who speaks little.", "He is lifeless that is faultless.", "Short accounts make long friends.", "He is not laughed at that laughs at himself first.", "Soon learn, soon forgotten.", "Heaven never helps the man who will not act."
        ],
        unibody: "window",
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
            disabled: false
        },
        nowTime: 0,
        allTime: 0,
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
        document.addEventListener("DOMContentLoaded", () => {
            new QWebChannel(qt.webChannelTransport, (c) => {
                window.vetyBridge = c.objects.vety
                window.vetyBridge.value = "preload"
                window.vetyBridge.value = "get config"
                window.vetyBridge.value = "get recentFiles"
            })
        })
        audioElement = document.getElementById("mainMusic")
        audioElement.addEventListener("timeupdate", () => {
                _t.nowTime = audioElement.currentTime
                _t.playerPercent = _t.nowPercent()
                if (_t.allTime != audioElement.duration) {
                    _t.allTime = audioElement.duration
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
        $('.tabButton, .menu .item')
            .tab();
        $('.vmenu .menuScroller').css({
            top: `${$(".vmenu a.active.item")[0].offsetTop+12.5}px`,
            height: "15px"
        })
        $('.vmenu a.item').click((e) => {
            let p = e.currentTarget
            $('.vmenu .menuScroller').css('top', `${p.offsetTop+12.5}px`)
        })
        $(".ui.dropdown.button").dropdown()
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
            $('body').toast({
                class: 'info',
                message: `${_t.playRates[_t.nowRate]}倍速`
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
                _t.nowTime = 0
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
            this.playFrom(this.allTime / 100 * v)
        },
        nowPercent() {
            if (this.nowTime == 0)
                return 0
            else
                return this.nowTime / this.allTime * 100
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
                    _t.nowTime = 0
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
                _t.nowTime = 0
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