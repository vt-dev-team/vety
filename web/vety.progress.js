const colorTable = {
    success: '#13ce66',
    fail: '#ff4949',
    warning: '#e6a23c',
    default: '#409EFF'
}

let vetyProgress = Vue.component('vety-progress', {
    template: `<div class="c-progress">
    <div class="c-progress-outer" :style="setProgressBgStyle" ref="progress">
        <div class="c-progress-inner" :style="setProgressStyle"></div>
        <div v-if="showSlider" class="c-progress-slider" ref="slider" :style="setSliderStyle"></div>
    </div>
    <span v-if="showPerText">{{tempPercent}}%</span>
</div>`,
    name: 'CProgress',
    props: {
        percent: {
            type: Number,
            default: 0
        },
        showSlider: {
            type: Boolean,
            default: true
        },
        showPerText: {
            type: Boolean,
            default: false
        },
        // 进度条的宽度
        width: {
            type: Number,
            default: 300
        },
        // 滑块的宽度
        sliderWidth: {
            type: Number,
            default: 20
        },
        // 颜色的类型
        type: {
            type: String,
            default: colorTable.default
        }
    },
    data() {
        return {
            sliderLeft: 0, // 滑块相对父元素发x坐标
            progressWidth: 0, // 进度条当前的的宽度
            tempPercent: 0
        }
    },
    computed: {
        // 设置进度条的背景样式
        setProgressBgStyle() {
            return {
                // 加上滑块的宽度
                width: `${this.width + this.sliderWidth}px`
                    //width: "100%"
            }
        },
        // 设置进度条的样式
        setProgressStyle() {
            return {
                width: `${this.progressWidth}px`
                    //width: `${this.percent}%`
            }
        },
        // 设置滑块的样式
        setSliderStyle() {
            return {
                border: `1px solid #2185d0`,
                width: `${this.sliderWidth}px`,
                height: `${this.sliderWidth}px`,
                left: `${this.sliderLeft}px`
            }
        }
    },
    mounted() {
        this.sliderLeft = this.width / 100 * this.percent
        this.progressWidth = this.sliderLeft + this.sliderWidth // 滑块的x坐标加上滑块的宽度
        this.tempPercent = this.percent
        this.addListener()
    },
    methods: {
        addListener() {
            const slider = this.$refs.slider
            const progress = this.$refs.progress
            let isClickSlider = false
            let distance = 0 // 滑块与点击坐标的绝对距离
            progress.onclick = (e) => {
                // 阻止事件冒泡
                if (e.target == slider) {
                    return
                }
                let curX = progress.offsetLeft
                this.sliderLeft = e.offsetX - curX
                if (this.sliderLeft <= 0) {
                    this.sliderLeft = 0
                }
                if (this.sliderLeft >= this.width) {
                    this.sliderLeft = this.width
                }
                this._countCurPercent()
            }
            slider.onmousedown = (e) => {
                isClickSlider = true
                let curX = slider.offsetLeft
                distance = e.pageX - curX // 得出绝对距离
            }
            document.onmousemove = (e) => {
                if (isClickSlider) {
                    // 判断是否已经超出进度条的长度
                    if ((e.pageX - distance) >= 0 && (e.pageX - distance) <= (this.width - 0)) {
                        this.sliderLeft = e.pageX - distance
                        this._countCurPercent()
                    }
                }
            }
            document.onmouseup = () => {
                isClickSlider = false
            }
        },
        changePercent(q) {
            //this.$emit('percentChange', q)
            this.tempPercent = q
                //alert(this.percent)
            this.sliderLeft = this.width / 100 * this.tempPercent
            this.progressWidth = this.sliderLeft + this.sliderWidth
                //alert(this.progressWidth)
        },
        // 算出百分比
        _countCurPercent() {
            //this.tempPercent = Math.ceil(parseInt(this.sliderLeft / this.width * 100))
            this.tempPercent = (this.sliderLeft / this.width * 100).toFixed(3)
            this.progressWidth = this.sliderLeft + 20
                // 取整的时候宽度可能不为0，所以在0和100的时候也将宽度取整
            if (this.tempPercent <= 0) {
                this.progressWidth = 0
                this.sliderLeft = 0
            }
            if (this.tempPercent >= 100) {
                this.progressWidth = this.width + 20
                this.sliderLeft = this.width
            }
            this.changePercent(this.tempPercent)
            this.$emit('perc', this.tempPercent)
        }
    }
})