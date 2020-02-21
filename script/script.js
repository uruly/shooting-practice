(() => { 
    /**
     * キーの押下状態を調べるためのオブジェクト
     * このオブジェクトはプロジェクトのどこからでも参照できるように
     * window オブジェクトのカスタムプロパティとして設定する
     * @global
     * @type {object}
     */
    window.isKeyDown = {};
    /**
     * スコアを格納する
     * @global
     * @type {number}
     */
    window.gameScore = 0;
    /**
     * canvasの幅
     * @type {number}
     */
    const CANVAS_WIDTH = 640;
    /**
     * canvasの高さ
     * @type {number}
     */
    const CANVAS_HEIGHT = 480;
    /**
     * ショットの最大個数
     * @type {number}
     */
    const SHOT_MAX_COUNT = 10;
    /**
     * 敵キャラクターのインスタンス数
     * @type {number}
     */
    const ENEMY_SMALL_MAX_COUNT = 20;
    const ENEMY_LARGE_MAX_COUNT = 5;
    /**
     * 敵キャラクターのショットの最大個数
     * @type {number}
     */
    const ENEMY_SHOT_MAX_COUNT = 50;
    /**
     * ボスキャラクターのホーミングショットの最大個数
     * @type {number}
     */
    const HOMING_MAX_COUNT = 50;
    /**
     * 爆発エフェクトの最大個数
     * @type {number}
     */
    const EXPLOSION_MAX_COUNT = 10;
    /**
     * 背景を流れる星の個数
     * @type {number}
     */
    const BACKGROUND_STAR_MAX_COUNT = 100;
    /**
     * 背景を流れる星の最大サイズ
     * @type {number}
     */
    const BACKGROUND_STAR_MAX_SIZE = 3;
    /**
     * 背景を流れる星の最大速度
     * @type {number}
     */
    const BACKGROUND_STAR_MAX_SPEED = 4;

    let util = null;
    let canvas = null;
    let ctx = null;
    let scene = null;
    let shotArray = [];
    let singleShotArray = [];
    let enemyArray = [];
    let enemyShotArray = [];
    let explosionArray = [];
    let backgroundStarArray = [];
    let homingArray = [];
    let sound = null;
    let boss = null;
    /**
     * 再スタートするためのフラグ
     * @type {boolean}
     */
    let restart = false;
    /**
     * 自機キャラクターのインスタンス
     * @type {Viper}
     */
    let viper = null;

    window.addEventListener('load', () => {
        util = new Canvas2DUtility(document.body.querySelector('#main_canvas'));
        canvas = util.canvas;
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        ctx = util.context;
        let button = document.body.querySelector('#start_button');
        button.addEventListener('click', () => {
            button.diabled = true;
            sound = new Sound();
            initialize();
            loadCheck();
            // sound.load('./sound/explosion.mp3', (error) => {
            //     if (error != null) {
            //         // alert('ファイルの読み込みエラーです');
            //         // return;
            //     }
            //     initialize();
            //     loadCheck();
            // });
        });
    });

    function initialize() {
        let i;
        scene = new SceneManager();

        viper = new Viper(ctx, 0, 0, 64, 64, './image/viper.png');
        viper.setComing(
            CANVAS_WIDTH / 2,   // 登場開始x
            CANVAS_HEIGHT + 50, // 登場開始y
            CANVAS_WIDTH / 2,   // 登場終わりx
            CANVAS_HEIGHT - 100 // 登場終わりy
        )
    
        // 爆発エフェクトの初期化
        for (i = 0; i < EXPLOSION_MAX_COUNT; ++i) {
            explosionArray[i] = new Explosion(ctx, 50.0, 15, 35.0, 0.8);
            explosionArray[i].setSound(sound);
        }
    
        // ショットを作成
        for (i = 0; i < SHOT_MAX_COUNT; ++i) {
            shotArray[i] = new Shot(ctx, 0, 0, 32, 32, './image/viper_shot.png');
            singleShotArray[i * 2] = new Shot(ctx, 0, 0, 32, 32, './image/viper_single_shot.png');
            singleShotArray[i * 2 + 1] = new Shot(ctx, 0, 0, 32, 32, './image/viper_single_shot.png');
        }
        viper.setShotArray(shotArray, singleShotArray);

        // 敵キャラクターのショット
        for (i = 0; i < ENEMY_SHOT_MAX_COUNT; ++i) {
            enemyShotArray[i] = new Shot(ctx, 0, 0, 32, 32, './image/enemy_shot.png');
            enemyShotArray[i].setTargets([viper]);
            enemyShotArray[i].setExplosions(explosionArray);
        }

        // ボスのフォーミングショット
        for(i = 0; i < HOMING_MAX_COUNT; ++i){
            homingArray[i] = new Homing(ctx, 0, 0, 32, 32, './image/homing_shot.png');
            homingArray[i].setTargets([viper]);
            homingArray[i].setExplosions(explosionArray);
        }

        boss = new Boss(ctx, 0, 0, 128, 128, './image/boss.png');
        boss.setShotArray(enemyShotArray);
        boss.setHomingArray(homingArray);
        boss.setAttackTarget(viper);

        // 敵キャラクターを初期化
        for (i = 0; i < ENEMY_SMALL_MAX_COUNT; ++i) {
            enemyArray[i] = new Enemy(ctx, 0, 0, 48, 48, './image/enemy_small.png');
            enemyArray[i].setShotArray(enemyShotArray);
            enemyArray[i].setAttackTarget(viper);
        }
        // 大きい敵キャラクターを初期化
        for (i = 0; i < ENEMY_LARGE_MAX_COUNT; ++i) {
            enemyArray[ENEMY_SMALL_MAX_COUNT + i] = new Enemy(ctx, 0 , 0, 64, 64, './image/enemy_large.png');
            enemyArray[ENEMY_SMALL_MAX_COUNT + i].setShotArray(enemyShotArray);
            enemyArray[ENEMY_SMALL_MAX_COUNT + i].setAttackTarget(viper);
        }

        let concatEnemyArray = enemyArray.concat([boss]);
        // 衝突判定を行うために対象を設定する
        for (i = 0; i < SHOT_MAX_COUNT; ++i) {
            shotArray[i].setTargets(concatEnemyArray);
            singleShotArray[i * 2].setTargets(concatEnemyArray);
            singleShotArray[i * 2 + 1].setTargets(concatEnemyArray);
            shotArray[i].setExplosions(explosionArray);
            singleShotArray[i * 2].setExplosions(explosionArray);
            singleShotArray[i * 2 + 1].setExplosions(explosionArray);
        }

        // 流れる星を初期化する
        for (i = 0; i < BACKGROUND_STAR_MAX_COUNT; ++i) {
            let size = 1 + Math.random() * (BACKGROUND_STAR_MAX_SIZE - 1);
            let speed = 1 + Math.random() * (BACKGROUND_STAR_MAX_SPEED - 1);
            backgroundStarArray[i] = new BackgroundStar(ctx, size, speed);
            let x = Math.random() * CANVAS_WIDTH;
            let y = Math.random() * CANVAS_HEIGHT;
            backgroundStarArray[i].set(x, y);
        }

    }

    function loadCheck() {
        let ready = true;
        ready = ready && viper.ready && boss.ready;
        shotArray.map((v) => {
            ready = ready && v.ready;
        });
        singleShotArray.map((v) => {
            ready = ready && v.ready;
        });
        enemyArray.map((v) => {
            ready = ready && v.ready;
        })
        enemyShotArray.map((v) => {
            ready = ready && v.ready;
        })

        homingArray.map((v) => {
            ready = ready && v.ready;
        });

        if (ready === true) {
            eventSetting();
            sceneSetting();
            startTime = Date.now();
            render();
        } else {
            setTimeout(loadCheck, 100);
        }
    }

    function render() {
        ctx.globalAlpha = 1.0;
        util.drawRect(0, 0, canvas.width, canvas.height, '#111122');
        // スコアの表示
        ctx.font = 'bold 24px monospace';
        util.drawText(zeroPadding(gameScore, 5), 30, 50, '#111111');

        // let nowTime = (Date.now() - startTime) / 1000;
        viper.update();
        boss.update();
    
        shotArray.map((v) => {
            v.update();
        });
        singleShotArray.map((v) => {
            v.update();
        });

        enemyArray.map((v) => {
            v.update();
        });

        enemyShotArray.map((v) => {
            v.update();
        });

        explosionArray.map((v) => {
            v.update();
        });

        backgroundStarArray.map((v) => {
            v.update();
        })

        homingArray.map((v) => {
            v.update();
        });

        scene.update();

        requestAnimationFrame(render);
    }

    function eventSetting() {
        window.addEventListener('keydown', (event) => {
            isKeyDown[`key_${event.key}`] = true;
            if (event.key === 'Enter') {
                if (viper.life <= 0) {
                    restart = true;
                }
            }
        }, false);
        window.addEventListener('keyup', (event) => {
            isKeyDown[`key_${event.key}`] = false;
        }, false);
    }

    function sceneSetting() {
        // イントロ
        scene.add('intro', (time) => {
            if (time > 3.0) {
                scene.use('invade_default_type');
            }
        });

        // invadeシーン（default type の敵キャラクターを生成）
        scene.add('invade_default_type', (time) => {
            if (scene.frame % 30 === 0) {
                for (let i = 0; i < ENEMY_SMALL_MAX_COUNT; ++i) {
                    if (enemyArray[i].life <= 0) {
                        let e = enemyArray[i];
                        if (scene.frame % 60 === 0) {
                            // 左側から出現
                            e.set(-e.width, 30, 2, 'default');
                            e.setVectorFromAngle(degreesToRadians(30));
                        } else {
                            // 右側から出現
                            e.set(CANVAS_WIDTH + e.width , 30, 2, 'default');
                            e.setVectorFromAngle(degreesToRadians(150));
                        }
                        break;
                    }
                }
            }
            if (scene.frame === 270) {
                scene.use('blank');
            }
            if (viper.life <= 0) {
                scene.use('gameover');
            }
        });

        // 間隔調整のための空白のシーン
        scene.add('blank', (time) => { 
            if (scene.frame === 150) {
                scene.use('invade_wave_move_type');
            }
            if (viper.life <= 0) {
                scene.use('gameover');
            }
        });

        // invadeシーン 自機狙い
        scene.add('invade_wave_move_type', (time) => {
            if (scene.frame % 50 === 0) {
                for (let i = 0; i < ENEMY_SMALL_MAX_COUNT; ++i) {
                    if (enemyArray[i].life <= 0) {
                        let e = enemyArray[i];
                        if (scene.frame <= 200) {
                            // 左側
                            e.set(CANVAS_WIDTH * 0.2, -e.height, 2, 'wave');
                        } else {
                            e.set(CANVAS_WIDTH * 0.8, -e.height, 2, 'wave');
                        }
                        break;
                    }
                }
            }
            if (scene.frame === 450) {
                scene.use('invade_large_type');
            }
            if (viper.life <= 0) {
                scene.use('gameover');
            }
        });

        // invadeシーン 大きいの
        scene.add('invade_large_type', (time) => {
            if (scene.frame === 100) {
                let i = ENEMY_SMALL_MAX_COUNT + ENEMY_LARGE_MAX_COUNT;
                for (let j = ENEMY_SMALL_MAX_COUNT; j < i; ++j) {
                    if (enemyArray[j].life <= 0) {
                        let e = enemyArray[j];
                        e.set(CANVAS_WIDTH / 2, -e.height, 50, 'large');
                        break;
                    }
                }
            }
            if (scene.frame === 500) {
                scene.use('invade_boss');
            }
            if (viper.life <= 0) {
                scene.use('gameover');
            }
        });
        // ボス
        scene.add('invade_boss', (time) => {
            if (scene.frame === 0) {
                boss.set(CANVAS_WIDTH / 2, -boss.height, 250);
                boss.setMode('invade');
            }
            if (viper.life <= 0) {
                scene.use('gameover');
                boss.setMode('escape');
            }
            if (boss.life <= 0) {
                scene.use('intro');
            }
        });
        // ゲームオーバーシーン
        scene.add('gameover', (time) => {
            let textWidth = CANVAS_WIDTH / 2;
            let loopWidth = CANVAS_WIDTH + textWidth;
            let x = CANVAS_WIDTH - (scene.frame * 2) % loopWidth;
            ctx.font = 'bold 72px sans-serif';
            util.drawText('GAME OVER', x, CANVAS_HEIGHT / 2, '#ff0000', textWidth);
            if (restart === true) {
                restart = false;
                gameScore = 0;

                viper.setComing(
                    CANVAS_WIDTH / 2,
                    CANVAS_HEIGHT + 50,
                    CANVAS_WIDTH / 2,
                    CANVAS_HEIGHT - 100
                );
                scene.use('intro');
            }
        });
        scene.use('intro');
    }

    /**
     * 数値の不足した桁数をゼロで埋めた文字列を返す
     * @param {number} number - 数値
     * @param {number} count - 桁数 （2桁以上）
     */
    function zeroPadding(number, count) {
        let zeroArray = new Array(count);
        let zeroString = zeroArray.join('0') + number;
        return zeroString.slice(-count);
    }

    /**
     * 度数方の角度からラジアンを生成する
     * @param {number} degrees - 度数法の度数
     */
    function degreesToRadians(degrees) {
        return degrees * Math.PI / 180;
    }
})();