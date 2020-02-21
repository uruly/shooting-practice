/**
 * 爆発エフェクトクラス
 */

class Explosion {

    constructor(ctx, radius, count, size, timeRange, color = '#ff1166') {
        this.ctx = ctx;
        this.life = false;
        this.color = color;
        this.position = null;
        this.radius = radius;
        this.count = count;
        this.startTime = 0;
        this.timeRange = timeRange;
        this.firePosition = [];
        this.fireVector = [];
        this.fireBaseSize = size;
        this.fireSize = [];
    }

    set(x, y) {
        for (let i = 0; i < this.count; ++i) {
            this.firePosition[i] = new Position(x, y);
            let vr = Math.random() * Math.PI * 2.0;
            let sin = Math.sin(vr);
            let cos = Math.cos(vr);
            // 進行方向ベクトルの長さをランダムに短くし移動量をランダム化する
            let mr = Math.random();
            this.fireVector[i] = new Position(cos * mr, sin * mr);
            this.fireSize[i] = (Math.random() * 0.5 + 0.5) * this.fireBaseSize;
        }
        this.life = true;
        this.startTime = Date.now();
    }

    update() {
        if (this.life !== true) { return; }
        this.ctx.fillStyle = this.color;
        this.ctx.globalAlpha = 0.5;
        let time = (Date.now() - this.startTime) / 1000;
        let ease = simpleEaseIn(1.0 - Math.min(time / this.timeRange, 1.0));
        let progress = 1.0 - ease;
    
        for (let i = 0; i < this.firePosition.length; ++i) {
            let distance = this.radius * progress;
            let s = 1.0 - progress;
            let x = this.firePosition[i].x + this.fireVector[i].x * distance;
            let y = this.firePosition[i].y + this.fireVector[i].y  * distance;
            this.ctx.fillRect(
                x - (this.fireSize[i] * s) / 2,
                y - (this.fireSize[i] * s) / 2,
                this.fireSize[i] * s,
                this.fireSize[i] * s
            );
        }
    
        if (progress >= 1.0) {
            this.life = false;
        }
    }
}

function simpleEaseIn(t) {
    return t * t * t * t;
}