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
            name: 'vety',
            version: 'v1.0.6',
            author: 'yemaster',
            updates: [{
                version: 'v1.0.6',
                details: [
                    '提高了切割的精确度',
                    '支持实时Update',
                    '修复了部分Bug'
                ]
            }, {
                version: 'v1.0.4',
                details: [
                    '支持历史记录',
                    '还有个彩蛋',
                    '更新了界面',
                    '修复了部分Bug'
                ]
            }, ]
        },
        unibody: "window",
        infos: {
            recentFiles: []
        },
        config: {
            maxZero: 5,
            zeroNums: 3200,
            primaryColor: 'primary'
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
        materials: [],
        nowTime: 0,
        allTime: 0,
        status: 0,
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
            if (_t.allTime != audioElement.duration) {
                _t.allTime = audioElement.duration
                $('#progressSlider').slider({
                    min: 0,
                    max: _t.allTime,
                    start: _t.nowTime,
                    step: 0.01,
                    onChange: function(p) {
                        if (p != _t.nowTime)
                            document.getElementById("mainMusic").currentTime = p
                    }
                })
            } else {
                $('#progressSlider').slider('set value', _t.nowTime)
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
        $('.filemenu a.item').click((e) => {
            let p = e.currentTarget
            $('.filemenu .menuScroller').css('left', `${p.offsetLeft+34}px`)
        })
        audioElement.addEventListener("play", () => {
            _t.status = 1
        })
        audioElement.addEventListener("pause", () => {
            _t.status = 0
        })
        $('#loaderProgress')
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
            })
    },
    methods: {
        chatWithPyQt: function(c) {
            window.vetyBridge.value = c
        },
        getMusicName: function(p) {
            if (this.useExperienceCutName) {
                if (this.materials.length <= 16 || this.materials[0][0] > 35000)
                    return this.info[p + 1]
                else
                    return this.info[p]
            } else
                return `音频${p + 1}`
        },
        openFile: function(fn) {
            let _t = this
            _t.filename = fn
            $('#loaderProgress').css("display", "block")
            _t.isLoadingFile = true
            $("#loader").css("display", "block")
            $(() => {

                $("#mainMusic").attr("src", fn)
                let vety_audio = $("#mainMusic").get('0')
                $("#mainMusic").get('0').pause()
                _t.status = 0
                vety_audio.load()
            })
        },
        loadMaterials: function(p) {
            let _t = this
            let q = JSON.parse(p)
            _t.materials.push(q)
        },
        clearToLoad: function() {
            this.materials = []
        },
        finishLoadFile: function() {
            this.isLoadingFile = false
            setTimeout(function() {
                $('#loaderProgress').fadeOut()
            }, 500)
        },
        play: function() {
            document.getElementById("mainMusic").play()
        },
        stop: function() {
            document.getElementById("mainMusic").pause()
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
        }
    }
})