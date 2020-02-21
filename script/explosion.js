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
        this.fireSize = size;
        this.firePosition = [];
        this.fireVector = [];
    }

    set(x, y) {
        for (let i = 0; i < this.count; ++i) {
            this.firePosition[i] = new Position(x, y);
            let r = Math.random() * Math.PI * 2.0;
            let sin = Math.sin(r);
            let cos = Math.cos(r);
            this.fireVector[i] = new Position(cos, sin);
            this.life = true;
            this.startTime = Date.now();
        }
    }

    update() {
        if (this.life !== true) { return; }
        this.ctx.fillStyle = this.color;
        this.ctx.globalAlpha = 0.5;
        let time = (Date.now() - this.startTime) / 1000;
        let progress = Math.min(time / this.timeRange, 1.0);
    
        for (let i = 0; i < this.firePosition.length; ++i) {
            let distance = this.radius * progress;
            let x = this.firePosition[i].x + this.fireVector[i].x * distance;
            let y = this.firePosition[i].y + this.fireVector[i].y  * distance;
            this.ctx.fillRect(
                x - this.fireSize / 2,
                y - this.fireSize / 2,
                this.fireSize,
                this.fireSize
            );
        }
    
        if (progress >= 1.0) {
            this.life = false;
        }
    }
}