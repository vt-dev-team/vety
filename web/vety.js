let isLoading = true

$(document).ready(function() {
    $(".winbar").css('left', $(".vmenu").outerWidth() + 'px')
    $(".winbar").css('right', '0px')
    $(".winbar").css('width', 'auto')
})

let Vety = new Vue({
    el: "#app",
    data: {
        app: {
            name: 'Project Name',
            version: 'Project Version',
            author: 'Project Author',
            updates: []
        },
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
        info: ["提示语", "第1段材料", "第2段材料", "第3段材料", "第4段材料", "第5段材料", "提示语", "第6段材料", "提示语", "第7段材料", "提示语", "第8段材料", "提示语", "第9段材料", "提示语", "第10段材料", "提示语", "提示语", "提示语", "提示语", "提示语"],
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
        nowTime: 0,
        allTime: 0,
        status: 0,
        playerPercent: 0,
    },
    computed: {
        reverseRecentFiles() {
            return this.infos.recentFiles.reverse()
        }
    },
    mounted: function() {
        let _t = this
            /*if (preload)
                _t.loadMaterials(preload)*/
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
            /*$('#loaderProgress')
                .progress({
                    duration: 100,
                    total: 100,
                    text: {
                        active: '解析 {value}%'
                    }
                });
            $('#progressSlider')
                .slider({
                    min: 0,
                    max: _t.allTime,
                    start: _t.nowTime,
                    step: 0.01
                })*/
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
                /*setTimeout(function() {
                    $('#loaderProgress').fadeOut()
                }, 500)*/
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
        }
    },
    components: {
        vetyProgress
    }
})