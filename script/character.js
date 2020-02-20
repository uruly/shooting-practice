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
        this.vector = new Position(0.0, -1.0);
        this.angle = 270 * Math.PI / 180;

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

    setVector(x, y){
        this.vector.set(x, y);
    }

    setVectorFromAngle(angle) {
        this.angle = angle;
        let sin = Math.sin(angle);
        let cos = Math.cos(angle);
        this.vector.set(cos, sin);
    }

    rotationDraw() {
        this.ctx.save();
        this.ctx.translate(this.position.x, this.position.y);
        this.ctx.rotate(this.angle - Math.PI * 1.5);

        let offsetX = this.width / 2;
        let offsetY = this.height / 2;
        this.ctx.drawImage(
            this.image,
            -offsetX,   // translateで平行移動しているのでオフセットのみ
            -offsetY,   // translateで平行移動しているのでオフセットのみ
            this.width,
            this.height
        );
        this.ctx.restore();
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
        this.singleShotArray = null;
        /**
         * @type {number} - ショットを打った後のチェック用カウンター
         */
        this.shotCheckCounter = 0;
        /**
         * @type {number} - ショットを打つことができる間隔
         */
        this.shotInterval = 10;
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
                if (this.shotCheckCounter >= 0) {
                    let i;
                    for (i = 0; i < this.shotArray.length; ++i) {
                        if (this.shotArray[i].life <= 0) {
                            this.shotArray[i].set(this.position.x, this.position.y);
                            this.shotCheckCounter = -this.shotInterval;
                            break;
                        }
                    }
                    // シングルショット 2つでワンセット
                    for (i = 0; i < this.singleShotArray.length; i += 2) {
                        if (this.singleShotArray[i].life <= 0 && this.singleShotArray[i + 1].life <= 0) {
                            // 真上の方向（270度)から左右に10ど傾いたラジアン
                            let radCW = 280 * Math.PI / 180;
                            let radCCW = 260 * Math.PI / 180;
                            this.singleShotArray[i].set(this.position.x, this.position.y);
                            this.singleShotArray[i].setVectorFromAngle(radCW);
                            this.singleShotArray[i + 1].set(this.position.x, this.position.y);
                            this.singleShotArray[i + 1].setVectorFromAngle(radCCW);
                            this.shotCheckCounter = -this.shotInterval;
                            break;
                        }
                    }
                }
            }
            ++this.shotCheckCounter;
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
     * @param {Array<Shot>} singleShotArray - 自身に設定するシングルショットの配列
     */
    setShotArray(shotArray, singleShotArray) {
        this.shotArray = shotArray;
        this.singleShotArray = singleShotArray;
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

    setSpeed(speed) {
        if (speed != null && speed > 0) {
            this.speed = speed;
        }
    }

    update() {
        if (this.life <= 0) { return; }
        if (this.position.y + this.height < 0) {
            this.life = 0;
        }
        this.position.x += this.vector.x * this.speed;
        this.position.y += this.vector.y * this.speed;
        this.rotationDraw();
    }
}

/**
 * 敵キャラクタークラス
 */
class Enemy extends Character {

    constructor(ctx, x, y, w, h, imagePath) {
        super(ctx, x, y, w, h, 0, imagePath);
        this.type = 'default';
        this.frame = 0;
        this.speed = 3;
        this.shotArray = null;
    }

    set(x, y, life = 1, type = 'default') {
        this.position.set(x, y);
        this.life = life;
        this.type = type;
        this.frame = 0;
    }

    update() {
        if (this.life <= 0) { return; }
        
        switch(this.type) {
            case 'default':
            default:
                if (this.frame === 50) {
                    this.fire();
                }
                this.position.x += this.vector.x * this.speed;
                this.position.y += this.vector.y * this.speed;
                if (this.position.y - this.height > this.ctx.canvas.height) {
                    this.life = 0;
                }
                break;
        }

        this.draw();
        ++this.frame;
    }

    fire(x = 0.0, y = 1.0) {
        for (let i = 0; i < this.shotArray.length; ++i) {
            if (this.shotArray[i].life <= 0) {
                this.shotArray[i].set(this.position.x, this.position.y);
                this.shotArray[i].setSpeed(5.0);
                this.shotArray[i].setVector(x, y);
                break;
            }
        }
    }

    setShotArray(shotArray) {
        this.shotArray = shotArray;
    }
}