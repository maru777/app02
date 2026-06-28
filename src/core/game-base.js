/**
 * LogiQ - Game Base Class
 * すべてのゲームモジュールが継承する共通の基底クラス
 */
class GameBase {
    constructor(containerElement, options) {
        if (!containerElement) {
            throw new Error('GameBase: containerElement is required.');
        }
        this.containerElement = containerElement;
        this.options = options || {};

        // 共通オプション・コールバックの参照を保持
        this.onScoreChange = this.options.onScoreChange;
        this.onMovesChange = this.options.onMovesChange;
        this.onGameOver = this.options.onGameOver;
        this.onGameWin = this.options.onGameWin;
        this.onTimeChange = this.options.onTimeChange;
        this.onUnlockCallback = this.options.onUnlockCallback;
        this.saveStateCallback = this.options.saveStateCallback;

        // 共通ステート
        this.gameActive = false;
        this.startTime = null;
        this.elapsedSeconds = 0;
        this.timerInterval = null;
        this.loadedStylesheets = [];
    }

    /**
     * ゲーム専用のCSSを動的にロードする
     * @param {string} href CSSファイルのパス
     */
    loadCSS(href) {
        // すでに同じCSSがロードされているかチェック
        const exists = document.querySelector(`link[href="${href}"]`);
        if (exists) return;

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
        this.loadedStylesheets.push(link);
    }

    /**
     * 共通タイマーの開始
     */
    startTimer() {
        this.startTime = Date.now() - (this.elapsedSeconds * 1000);
        clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            this.elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
            if (this.onTimeChange) {
                this.onTimeChange(this.elapsedSeconds);
            }
        }, 1000);
    }

    /**
     * 共通タイマーの停止
     */
    stopTimer() {
        clearInterval(this.timerInterval);
    }

    /**
     * 時間のフォーマット (例: 75 -> "1分15秒")
     * @param {number} sec 秒数
     */
    formatTime(sec) {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return m > 0 ? `${m}分${s}秒` : `${s}秒`;
    }

    /**
     * ゲーム終了・破棄時のクリーンアップ処理
     * 各ゲームクラスでオーバーライドする場合は必ず super.destroy() を呼ぶこと
     */
    destroy() {
        this.stopTimer();
        this.gameActive = false;

        // 動的にロードしたCSSを削除してスタイル競合を防ぐ
        this.loadedStylesheets.forEach(link => {
            if (link && link.parentNode) {
                link.parentNode.removeChild(link);
            }
        });
        this.loadedStylesheets = [];

        // コンテナのDOMをクリア
        if (this.containerElement) {
            this.containerElement.innerHTML = '';
        }
    }
}

// グローバルオブジェクトに登録して他スクリプトから参照可能にする
window.LogiqGames = window.LogiqGames || {};
window.LogiqGames.GameBase = GameBase;
