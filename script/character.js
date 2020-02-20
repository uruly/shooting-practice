/**
 * 座標を管理するためのクラス
 */
class Position {

    constructor(x, y) {
        this.x = null;
        this.y = null;
        this.set(x, y);
    }

    set(x, y) {
        if (x != null) { this.x = x; }
        if (y != null) { this.y = y; }
    }
}

/**
 * キャラクター管理のための基幹クラス
 */
class Character {

    constructor(ctx, x, y, w, h, life, imagePath) {
        this.ctx = ctx;
        this.position = new Position(x, y);
        this.width = w;
        this.height = h;
        this.life = life;

        this.ready = false;
        this.image = new Image();
        this.image.addEventListener('load', () => {
            this.ready = true;
        }, false);
        this.image.src = imagePath;
    }

    draw() {
        let offsetX = this.width / 2;
        let offsetY = this.height / 2;
        this.ctx.drawImage(
            this.image,
            this.position.x - offsetX,
            this.position.y - offsetY,
            this.width,
            this.height
        );
    }
}

/**
 * Viper クラス
 */
class Viper extends Character {

    constructor(ctx, x, y, w, h, imagePath) {
        super(ctx, x, y, w, h, 0, imagePath);

        this.speed = 3;
        this.isComing = false;
        this.comingStart = null;
        this.comingStartPosition = null;
        this.comingEndPosition = null;
        this.shotArray = null;
    }

    setComing(startX, startY, endX, endY) {
        this.isComing = true;
        this.comingStart = Date.now();
        this.position.set(startX, startY);
        this.comingStartPosition = new Position(startX, startY);
        this.comingEndPosition = new Position(endX, endY);
    }

    update() {
        let justTime = Date.now();

        if (this.isComing === true) {
            let comingTime = (justTime - this.comingStart) / 1000;
            let y = this.comingStartPosition.y - comingTime * 50;
            if (y <= this.comingEndPosition.y) {
                this.isComing = false;
                y = this.comingEndPosition.y
            }
            this.position.set(this.position.x, y);

            if (justTime % 100 < 50) {
                this.ctx.globalAlpha = 0.5;
            }
        } else {
            if (window.isKeyDown.key_ArrowLeft === true) {
                this.position.x -= this.speed;
            }
            if (window.isKeyDown.key_ArrowRight === true) {
                this.position.x += this.speed;
            }
            if (window.isKeyDown.key_ArrowUp === true) {
                this.position.y -= this.speed;
            }
            if (window.isKeyDown.key_ArrowDown === true) {
                this.position.y += this.speed;
            }
            if (window.isKeyDown.key_z === true) {
                for (let i = 0; i < this.shotArray.length; ++i) {
                    if (this.shotArray[i].life <= 0) {
                        this.shotArray[i].set(this.position.x, this.position.y);
                        break;
                    }
                }
            }
            // 移動後の位置が画面外へ出ていないかを確認して修正する
            let canvasWidth = this.ctx.canvas.width;
            let canvasHeight = this.ctx.canvas.height;
            let tx = Math.min(Math.max(this.position.x, 0), canvasWidth);
            let ty = Math.min(Math.max(this.position.y, 0), canvasHeight);
            this.position.set(tx, ty);
        }
        this.draw();
        this.ctx.globalAlpha = 1.0;
    }

    /**
     * ショットを設定する
     * @param {Array<Shot>} shotArray - 自身に設定するショットの配列
     */
    setShotArray(shotArray) {
        this.shotArray = shotArray;
    }
}

/**
 * Shot クラス
 */

class Shot extends Character {

    constructor(ctx, x, y, w, h, imagePath) {
        super(ctx, x, y, w, h, 0, imagePath);
        this.speed = 7;
    }

    set(x, y) {
        this.position.set(x, y);
        this.life = 1;
    }

    update() {
        if (this.life <= 0) { return; }
        if (this.position.y + this.height < 0) {
            this.life = 0;
        }
        this.position.y -= this.speed;
        this.draw();
    }
}