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
     * 自機のX座標
     * @type {number}
     */
    let viperX = CANVAS_WIDTH / 2
    /**
     * 自機のY座標
     * @type {number}
     */
    let viperY = CANVAS_HEIGHT / 2
    /**
     * @type {boolean} - 自機が登場中かどうかを表すフラグ
     */
    let isComing = false;
    /**
     * @type {number} - 登場演出を開始した際のタイムスタンプ
     */
    let comingStart = null;

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

        isComing = true;
        comingStart = Date.now();
        viperY = CANVAS_HEIGHT;
    }

    function render() {
        ctx.globalAlpha = 1.0;
        util.drawRect(0, 0, canvas.width, canvas.height, '#eeeeee');

        // let nowTime = (Date.now() - startTime) / 1000;
    
        if (isComing === true) {
            let justTime = Date.now();
            let comingTime = (justTime - comingStart) / 1000;
            viperY = CANVAS_HEIGHT - comingTime * 50;
            if (viperY <= CANVAS_HEIGHT - 100) {
                isComing = false;
                viperY = CANVAS_HEIGHT - 100;
            }

            if (justTime % 100 < 50) {
                ctx.globalAlpha = 0.5;
            }
        }
        ctx.drawImage(image, viperX, viperY);

        requestAnimationFrame(render);
    }

    function eventSetting() {
        window.addEventListener('keydown', (event) => {
            if (isComing === true) { return; }
            switch(event.key) {
                case 'ArrowLeft':
                    viperX -= 10;
                    break;
                case 'ArrowRight':
                    viperX += 10;
                    break;
                case 'ArrowUp':
                    viperY -= 10;
                    break;
                case 'ArrowDown':
                    viperY += 10;
                    break;
            }
        }, false);
    }
})();