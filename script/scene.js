/**
 * シーンを管理するためのクラス
 */
class SceneManager {

    constructor() {
        /**
         * @type {object} - シーンを格納するためのオブジェクト
         */
        this.scene = {};
        /**
         *  @type {function} - 現在アクティブなシーン
         */
        this.activeScene = null;
        /**
         * @type {number} - 現在のシーンがアクティブになった時刻
         */
        this.startTime = null;
        /**
         * @type {number} - 現在のシーンがアクティブになってからのシーンの実行回数
         */
        this.frame = null;
    }

    add(name, updateFunction) {
        this.scene[name] = updateFunction;
    }

    use(name) {
        if (this.scene.hasOwnProperty(name) !== true) {
            return;
        }
        this.activeScene = this.scene[name];
        this.startTime = Date.now();
        this.frame = -1;
    }

    update() {
        let activeTime = (Date.now() - this.startTime) / 1000;
        this.activeScene(activeTime);
        ++this.frame;
    }
}