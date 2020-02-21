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

    /**
     * 対象のPositionクラスのインタンスとの距離を返す
     * @param {Position} target - 距離を測る対象
     */
    distance(target) {
        let x = this.x - target.x;
        let y = this.y - target.y;
        return Math.sqrt(x * x + y * y);
    }

    /**
     * ベクトルの長さを返す静的メソッド
     * @static
     * @param {number} x - X要素
     * @param {number} y - Y要素
     */
    static calcLength(x, y) {
        return Math.sqrt(x * x + y * y);
    }

    /**
     * ベクトルを単位化した結果を返す静的メソッド
     * @static
     * @param {number} x - X要素
     * @param {number} y - Y要素
     */
    static calcNormal(x, y) {
        let len = Position.calcLength(x, y);
        return new Position(x / len, y / len);
    }

    /**
     * 対象の Position クラスのインスタンスとの外積を計算する
     * @param {Position} target - 外積の計算を行う対象
     */
    cross(target) {
        return this.x * target.y - this.y * target.x;
    }

    /**
     * 自身を単位化したベクトルを計算して返す
     */
    normalize() {
        let length = Math.sqrt(this.x * this.x + this.y * this.y);
        if (length === 0) {
            return new Position(0, 0);
        }
        let x = this.x / length;
        let y = this.y / length;
        return new Position(x, y);
    }

    /**
     * 指定されたラジアン分だけ自身を回転させる
     * @param {number} radian - 回転量
     */
    rotate(radian) {
        let s = Math.sin(radian);
        let c = Math.cos(radian);
        this.x = this.x * c + this.y * -s;
        this.y = this.x * s + this.y * c;
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
        super(ctx, x, y, w, h, 1, imagePath);

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
        this.life = 1;
        this.position.set(startX, startY);
        this.comingStartPosition = new Position(startX, startY);
        this.comingEndPosition = new Position(endX, endY);
    }

    update() {
        if (this.life <= 0) { return; }
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
                            this.shotArray[i].setPower(2);
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
        this.power = 1;
        /**
         * 自身と衝突判定を取る対象を格納する
         * @type {Array<Character>}
         */
        this.targetArray = [];
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

    setPower(power) {
        if (power != null && power > 0) {
            this.power = power;
        }
    }

    /**
     * 
     * @param {Array<Character>} [targets] - 衝突判定の対象を含む配列
     */
    setTargets(targets) {
        if (targets != null && Array.isArray(targets) === true && targets.length > 0) {
            this.targetArray = targets;
        }
    }

    setExplosions(targets) {
        if (targets != null && Array.isArray(targets) === true && targets.length > 0) {
            this.explosionArray = targets;
        }
    }

    update() {
        if (this.life <= 0) { return; }
        // 画面外へ移動していたらライフを0にする
        if (
            this.position.x + this.width < 0 ||
            this.position.x - this.width > this.ctx.canvas.width ||
            this.position.y + this.height < 0 || 
            this.position.y - this.height > this.ctx.canvas.height
        ) {
            this.life = 0;
        }
        this.position.x += this.vector.x * this.speed;
        this.position.y += this.vector.y * this.speed;
    
        this.targetArray.map((v) => {
            if (this.life <= 0 || v.life <= 0) { return; }
            let dist = this.position.distance(v.position);
            if (dist <= (this.width + v.width) / 4) {
                if (v instanceof Viper === true) {
                    if (v.isComing === true) { return; }
                }
                v.life -= this.power;
                if (v.life <= 0) {
                    for (let i = 0; i < this.explosionArray.length; ++i) {
                        if (this.explosionArray[i].life !== true) {
                            this.explosionArray[i].set(v.position.x, v.position.y);
                            break;
                        }
                    }
                    if (v instanceof Enemy === true) {
                        // 最大スコアを99999で制限
                        let score = 100;
                        if (v.type === 'large') {
                            score = 1000;
                        }
                        gameScore = Math.min(gameScore + score, 99999);
                    }
                }
                this.life = 0;
            }
        });
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
        this.attackTarget = null;
    }

    set(x, y, life = 1, type = 'default') {
        this.position.set(x, y);
        this.life = life;
        this.type = type;
        this.frame = 0;
    }

    setAttackTarget(target) {
        this.attackTarget = target;
    }

    update() {
        if (this.life <= 0) { return; }
        
        switch(this.type) {
            case 'wave':
                if (this.frame % 60 === 0) {
                    // 自機狙い
                    let tx = this.attackTarget.position.x - this.position.x;
                    let ty = this.attackTarget.position.y - this.position.y;
                    let tv = Position.calcNormal(tx, ty);
                    this.fire(tv.x, tv.y, 4.0);
                }
                this.position.x += Math.sin(this.frame / 10);
                this.position.y += 2.0;
                if (this.position.y - this.height > this.ctx.canvas.height) {
                    this.life = 0;
                }
                break;
            case 'large':
                if (this.frame % 50 === 0) {
                    // 45度ごとにオフセットした全方位弾を放つ
                    for (let i = 0; i < 360; i += 45) {
                        let r = i * Math.PI / 180;
                        let sin = Math.sin(r);
                        let cos = Math.cos(r);
                        this.fire(cos, sin, 3.0);
                    }
                }
                this.position.x += Math.sin((this.frame + 90) / 50) * 2.0;
                this.position.y += 1.0;
                if (this.position.y - this.height > this.ctx.canvas.height) {
                    this.life = 0;
                }
                break;
            case 'default':
            default:
                if (this.frame === 100) {
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

    fire(x = 0.0, y = 1.0, speed = 5.0) {
        for (let i = 0; i < this.shotArray.length; ++i) {
            if (this.shotArray[i].life <= 0) {
                this.shotArray[i].set(this.position.x, this.position.y);
                this.shotArray[i].setSpeed(speed);
                this.shotArray[i].setVector(x, y);
                break;
            }
        }
    }

    setShotArray(shotArray) {
        this.shotArray = shotArray;
    }
}

/**
 * ボスキャラクタークラス
 */
class Boss extends Character {

    constructor(ctx, x, y, w, h, imagePath) {
        super(ctx, x, y, w, h, 0, imagePath);
    
        this.mode = '';
        this.frame = 0;
        this.speed = 3;
        this.shotArray = null;
        this.homingArray = null;
        this.attackTarget = null;
    }

    set(x, y, life = 1) {
        this.position.set(x, y);
        this.life = life;
        this.frame = 0;
    }

    setAttackTarget(target) {
        this.attackTarget = target;
    }

    setMode(mode) {
        this.mode = mode;
    }

    setShotArray(shotArray) {
        this.shotArray = shotArray;
    }

    setHomingArray(homingArray) {
        this.homingArray = homingArray;
    }

    update() {
        if (this.life <= 0) { return; }

        switch (this.mode) {
            case 'invade':
                this.position.y += this.speed;
                if (this.position.y > 100) {
                    this.position.y = 100;
                    this.mode = 'floating';
                    this.frame = 0;
                }
                break;
            case 'escape':
                this.position.y -= this.speed;
                if (this.position.y < -this.height) {
                    this.life = 0;
                }
                break;
            case 'floating':
                if (this.frame % 1000 < 500) {
                    if (this.frame % 200 > 140 && this.frame % 10 === 0) {
                        let tx = this.attackTarget.position.x - this.position.x;
                        let ty = this.attackTarget.position.y - this.position.y;
                        let tv = Position.calcNormal(tx, ty);
                        this.fire(tv.x, tv.y, 3.0);
                    }
                } else {
                    if (this.frame % 50 === 0) {
                        this.homingFire(0, 1, 3.5);
                    }
                }
                this.position.x += Math.cos(this.frame / 100) * 2.0;
                break;
            default:
                break;
        }
        this.draw();
        ++this.frame;
    }

    fire(x = 0.0, y = 1.0, speed = 5.0) {
        for (let i = 0; i < this.shotArray.length; ++i) {
            if (this.shotArray[i].life <= 0) {
                this.shotArray[i].set(this.position.x, this.position.y);
                this.shotArray[i].setSpeed(speed);
                this.shotArray[i].setVector(x, y);
                break;
            }
        }
    }

    homingFire(x = 0.0, y = 1.0, speed = 3.0) {
        for (let i = 0; i < this.homingArray.length; ++i) {
            if (this.homingArray[i].life <= 0) {
                this.homingArray[i].set(this.position.x, this.position.y);
                this.homingArray[i].setSpeed(speed);
                this.homingArray[i].setVector(x, y);
                break;
            }
        }
    }
}

/**
 * Homing shot クラス
 */

class Homing extends Shot {

    constructor(ctx, x, y, w, h, imagePath) {
        super(ctx, x, y, w, h, imagePath);
        this.frame = 0;
    }

    set(x, y, speed, power) {
        this.position.set(x, y);
        this.life = 1;
        this.setSpeed(speed);
        this.setPower(power);
        this.frame = 0;
    }

    update() {
        if (this.life <= 0) { return; }
        // 画面外へ移動していたらライフを0にする
        if (
            this.position.x + this.width < 0 ||
            this.position.x - this.width > this.ctx.canvas.width ||
            this.position.y + this.height < 0 || 
            this.position.y - this.height > this.ctx.canvas.height
        ) {
            this.life = 0;
        }
        let target = this.targetArray[0];
        if (this.frame < 100) {
            let vector = new Position(
                target.position.x - this.position.x,
                target.position.y - this.position.y
            );
            let normalizedVector = vector.normalize();
            this.vector = this.vector.normalize();
            let cross = this.vector.cross(normalizedVector)
            let rad = Math.PI / 180.0;
            if (cross > 0.0) {
                // 右側にターゲットがいる
                this.vector.rotate(rad);
            } else if (cross < 0.0) {
                // 左側にいる
                this.vector.rotate(-rad);
            }
        }
        this.position.x += this.vector.x * this.speed;
        this.position.y += this.vector.y * this.speed;
        this.angle = Math.atan2(this.vector.y, this.vector.x);
    
        this.targetArray.map((v) => {
            if (this.life <= 0 || v.life <= 0) { return; }
            let dist = this.position.distance(v.position);
            if (dist <= (this.width + v.width) / 4) {
                if (v instanceof Viper === true) {
                    if (v.isComing === true) { return; }
                }
                v.life -= this.power;
                if (v.life <= 0) {
                    for (let i = 0; i < this.explosionArray.length; ++i) {
                        if (this.explosionArray[i].life !== true) {
                            this.explosionArray[i].set(v.position.x, v.position.y);
                            break;
                        }
                    }
                    if (v instanceof Enemy === true) {
                        // 最大スコアを99999で制限
                        let score = 100;
                        if (v.type === 'large') {
                            score = 1000;
                        }
                        gameScore = Math.min(gameScore + score, 99999);
                    }
                }
                this.life = 0;
            }
        });
        this.rotationDraw();
        ++this.frame;
    }
}