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
    }

    function render() {
        util.drawRect(0, 0, canvas.width, canvas.height, '#eeeeee');

        ctx.drawImage(image, viperX, viperY);

        requestAnimationFrame(render);
    }

    function eventSetting() {
        window.addEventListener('keydown', (event) => {
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