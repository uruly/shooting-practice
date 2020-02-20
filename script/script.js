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
    const ENEMY_MAX_COUNT = 10;

    let util = null;
    let canvas = null;
    let ctx = null;
    let shotArray = [];
    let singleShotArray = [];
    let enemyArray = [];
    /**
     * 自機キャラクターのインスタンス
     * @type {Viper}
     */
    let viper = null;

    window.addEventListener('load', () => {
        util = new Canvas2DUtility(document.body.querySelector('#main_canvas'));
        canvas = util.canvas;
        ctx = util.context;
        initialize();
        loadCheck();
    });

    function initialize() {
        let i;
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;

        viper = new Viper(ctx, 0, 0, 64, 64, './image/viper.png');
        viper.setComing(
            CANVAS_WIDTH / 2,   // 登場開始x
            CANVAS_HEIGHT + 50, // 登場開始y
            CANVAS_WIDTH / 2,   // 登場終わりx
            CANVAS_HEIGHT - 100 // 登場終わりy
        )
    
        // ショットを作成
        for (i = 0; i < SHOT_MAX_COUNT; ++i) {
            shotArray[i] = new Shot(ctx, 0, 0, 32, 32, './image/viper_shot.png');
            singleShotArray[i * 2] = new Shot(ctx, 0, 0, 32, 32, './image/viper_single_shot.png');
            singleShotArray[i * 2 + 1] = new Shot(ctx, 0, 0, 32, 32, './image/viper_single_shot.png');
        }
        viper.setShotArray(shotArray, singleShotArray);

        // 敵キャラクターを初期化
        for (i = 0; i < ENEMY_MAX_COUNT; ++i) {
            enemyArray[i] = new Enemy(ctx, 0, 0, 48, 48, './image/enemy_small.png');
        }
    }

    function loadCheck() {
        let ready = true;
        ready = ready && viper.ready;
        shotArray.map((v) => {
            ready = ready && v.ready;
        });
        singleShotArray.map((v) => {
            ready = ready && v.ready;
        });
        enemyArray.map((v) => {
            ready = ready && v.ready;
        })

        // console.log('koko', ready);
        if (ready === true) {
            eventSetting();
            startTime = Date.now();
            render();
        } else {
            setTimeout(loadCheck, 100);
        }
    }

    function render() {
        ctx.globalAlpha = 1.0;
        util.drawRect(0, 0, canvas.width, canvas.height, '#eeeeee');

        // let nowTime = (Date.now() - startTime) / 1000;
        viper.update();
    
        shotArray.map((v) => {
            v.update();
        });
        singleShotArray.map((v) => {
            v.update();
        });

        enemyArray.map((v) => {
            v.update();
        })

        requestAnimationFrame(render);
    }

    function eventSetting() {
        window.addEventListener('keydown', (event) => {
            isKeyDown[`key_${event.key}`] = true;
        }, false);
        window.addEventListener('keyup', (event) => {
            isKeyDown[`key_${event.key}`] = false;
        }, false);
    }
})();