/**
 * 座標を管理するためのクラス
 */
class Position {

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    set(x, y) {
        if (x != null) { this.x = x; }
        if (y != null) { this.y = y; }
    }
}