(() => { 
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

    let util = null;
    let canvas = null;
    let ctx = null;
    let image = null;

    /**
     * 実行委開始時のタイムスタンプ
     * @type {number}
     */
    let startTime = null;
    /**
     * 自機キャラクターのインスタンス
     * @type {Viper}
     */
    let viper = null;

    window.addEventListener('load', () => {
        util = new Canvas2DUtility(document.body.querySelector('#main_canvas'));
        canvas = util.canvas;
        ctx = util.context;

        util.imageLoader('./image/viper.png', (loadedImage) => {
            image = loadedImage;
            initialize();
            eventSetting();
            startTime = Date.now();
            render();
        });
    });

    function initialize() {
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;

        viper = new Viper(ctx, 0, 0, image);
        viper.setComing(
            CANVAS_WIDTH / 2,   // 登場開始x
            CANVAS_HEIGHT,      // 登場開始y
            CANVAS_WIDTH / 2,   // 登場終わりx
            CANVAS_HEIGHT - 100 // 登場終わりy
        )
    }

    function render() {
        ctx.globalAlpha = 1.0;
        util.drawRect(0, 0, canvas.width, canvas.height, '#eeeeee');

        // let nowTime = (Date.now() - startTime) / 1000;
    
        if (viper.isComing === true) {
            let justTime = Date.now();
            let comingTime = (justTime - viper.comingStart) / 1000;
            let y = CANVAS_HEIGHT - comingTime * 50;
            if (y <= viper.comingEndPosition.y) {
                viper.isComing = false;
                y = CANVAS_HEIGHT - 100;
            }
            viper.position.set(viper.position.x, y);
            if (justTime % 100 < 50) {
                ctx.globalAlpha = 0.5;
            }
        }
        viper.draw();

        requestAnimationFrame(render);
    }

    function eventSetting() {
        window.addEventListener('keydown', (event) => {
            if (viper.isComing === true) { return; }
            switch(event.key) {
                case 'ArrowLeft':
                    viper.position.x -= 10;
                    break;
                case 'ArrowRight':
                    viper.position.x += 10;
                    break;
                case 'ArrowUp':
                    viper.position.y -= 10;
                    break;
                case 'ArrowDown':
                    viper.position.y += 10;
                    break;
            }
        }, false);
    }
})();