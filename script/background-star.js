/**
 * 背景を流れる星クラス
 */

 class BackgroundStar {
    
    constructor(ctx, size, speed, color = '#ffffff') {
        this.ctx = ctx;
        this.size = size;
        this.speed = speed;
        this.color = color;
        this.position = null;
    }

    set(x, y) {
        this.position = new Position(x, y);
    }

    update() {
        this.ctx.fillStyle = this.color;
        this.position.y += this.speed;
        this.ctx.fillRect(
            this.position.x - this.size / 2,
            this.position.y - this.size / 2,
            this.size,
            this.size
        );
        
        // もし画面末端よりも外に出てしまっていたら上端側に戻す
        if (this.position.y + this.size > this.ctx.canvas.height) {
            this.position.y = -this.size;
        }
    }
 }