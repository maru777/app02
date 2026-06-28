/**
 * LogiQ - Nonogram Game Module
 * 共通基底クラス GameBase を継承
 * ルール:
 *  - 8x8の盤面。行と列の数字は、その列に連続する塗りつぶされたマスの数を表す。
 *  - 数字が複数ある場合は、間に少なくとも1つの空きマスが必要。
 *  - プレイヤーは「塗る(■)」「マーク(✖)」を選択可能。
 */
class NonogramGame extends LogiqGames.GameBase {
    constructor(containerElement, options) {
        super(containerElement, options);

        this.gridSize = 8;
        this.boardState = Array(64).fill(0); // 0: 空, 1: 塗り, 2: ✖
        this.solution = [];                 // 0 or 1
        this.rowHints = [];                 // 各行のヒント配列
        this.colHints = [];                 // 各列のヒント配列
        this.errors = 0;
        this.drawMode = 1;                  // 1: 塗り, 2: ✖
        this.isMouseDown = false;
        this.lastToggledVal = -1;

        // マウスクリックドラッグ操作用
        this.boundMouseUp = () => { this.isMouseDown = false; this.lastToggledVal = -1; };
    }

    // 出題パターン
    getPatterns() {
        return [
            // ハート
            [
                0,1,1,0,0,1,1,0,
                1,1,1,1,1,1,1,1,
                1,1,1,1,1,1,1,1,
                1,1,1,1,1,1,1,1,
                0,1,1,1,1,1,1,0,
                0,0,1,1,1,1,0,0,
                0,0,0,1,1,0,0,0,
                0,0,0,0,0,0,0,0
            ],
            // ニコちゃんスマイル
            [
                0,0,1,1,1,1,0,0,
                0,1,0,0,0,0,1,0,
                1,0,1,0,0,1,0,1,
                1,0,0,0,0,0,0,1,
                1,0,1,0,0,1,0,1,
                1,0,0,1,1,0,0,1,
                0,1,0,0,0,0,1,0,
                0,0,1,1,1,1,0,0
            ],
            // ツリー (木)
            [
                0,0,0,1,1,0,0,0,
                0,0,1,1,1,1,0,0,
                0,0,0,1,1,0,0,0,
                0,1,1,1,1,1,1,0,
                1,1,1,1,1,1,1,1,
                0,0,0,1,1,0,0,0,
                0,0,0,1,1,0,0,0,
                0,0,1,1,1,1,0,0
            ],
            // チェック柄
            [
                1,1,0,0,1,1,0,0,
                1,1,0,0,1,1,0,0,
                0,0,1,1,0,0,1,1,
                0,0,1,1,0,0,1,1,
                1,1,0,0,1,1,0,0,
                1,1,0,0,1,1,0,0,
                0,0,1,1,0,0,1,1,
                0,0,1,1,0,0,1,1
            ]
        ];
    }

    startNewGame() {
        this.boardState.fill(0);
        this.errors = 0;
        this.elapsedSeconds = 0;
        this.drawMode = 1;

        // ランダムにパターンを選定
        const patterns = this.getPatterns();
        this.solution = patterns[Math.floor(Math.random() * patterns.length)];

        this.calculateHints();
        this.setupDOM();
        this.startTimer();

        if (this.options.onProgressChange) this.options.onProgressChange(0);
        if (this.options.onErrorsChange) this.options.onErrorsChange(0);
    }

    calculateHints() {
        this.rowHints = [];
        this.colHints = [];

        // 行ヒントの計算
        for (let r = 0; r < 8; r++) {
            const row = [];
            let count = 0;
            for (let c = 0; c < 8; c++) {
                if (this.solution[r * 8 + c] === 1) {
                    count++;
                } else {
                    if (count > 0) {
                        row.push(count);
                        count = 0;
                    }
                }
            }
            if (count > 0) row.push(count);
            this.rowHints.push(row.length > 0 ? row : [0]);
        }

        // 列ヒントの計算
        for (let c = 0; c < 8; c++) {
            const col = [];
            let count = 0;
            for (let r = 0; r < 8; r++) {
                if (this.solution[r * 8 + c] === 1) {
                    count++;
                } else {
                    if (count > 0) {
                        col.push(count);
                        count = 0;
                    }
                }
            }
            if (count > 0) col.push(count);
            this.colHints.push(col.length > 0 ? col : [0]);
        }
    }

    setupDOM() {
        this.containerElement.innerHTML = `
            <div class="nono-wrapper">
                <!-- 操作モード切替ボタン -->
                <div class="nono-toolbar">
                    <button class="btn btn-secondary active" id="nono-tool-draw">■ 塗る</button>
                    <button class="btn btn-secondary" id="nono-tool-cross">✖ マーク</button>
                </div>

                <div class="nono-grid-container">
                    <!-- 左上の空白 -->
                    <div class="nono-corner"></div>

                    <!-- 上の列ヒント -->
                    <div class="nono-col-hints" id="nono-col-hints"></div>

                    <!-- 左の行ヒント -->
                    <div class="nono-row-hints" id="nono-row-hints"></div>

                    <!-- メインボード -->
                    <div id="nono-board" class="nono-board"></div>
                </div>

                <div class="nono-actions">
                    <button class="btn btn-secondary" id="btn-nono-clear">全クリア</button>
                    <button class="btn btn-primary" id="btn-nono-check">判定する</button>
                </div>
            </div>
        `;

        // 上部列ヒント描画
        const colHintsEl = this.containerElement.querySelector('#nono-col-hints');
        for (let c = 0; c < 8; c++) {
            const hintBox = document.createElement('div');
            hintBox.className = 'nono-col-hint-box';
            hintBox.innerHTML = this.colHints[c].map(num => `<span>${num}</span>`).join('');
            colHintsEl.appendChild(hintBox);
        }

        // 左部行ヒント描画
        const rowHintsEl = this.containerElement.querySelector('#nono-row-hints');
        for (let r = 0; r < 8; r++) {
            const hintBox = document.createElement('div');
            hintBox.className = 'nono-row-hint-box';
            hintBox.innerHTML = this.rowHints[r].map(num => `<span>${num}</span>`).join(' ');
            rowHintsEl.appendChild(hintBox);
        }

        // ボードマス描画
        const boardEl = this.containerElement.querySelector('#nono-board');
        for (let i = 0; i < 64; i++) {
            const cell = document.createElement('div');
            cell.className = 'nono-cell';
            cell.dataset.index = i;

            // 5マスごとの補助線
            const r = Math.floor(i / 8);
            const c = i % 8;
            if (r === 4) cell.style.borderTop = '1.5px solid rgba(51,56,53,0.3)';
            if (c === 4) cell.style.borderLeft = '1.5px solid rgba(51,56,53,0.3)';

            // マウスドラッグ操作対応
            cell.onmousedown = (e) => {
                e.preventDefault();
                this.isMouseDown = true;
                this.handleCellAction(i);
            };
            cell.onmouseenter = () => {
                if (this.isMouseDown) {
                    this.handleCellAction(i);
                }
            };

            // タッチイベント対応
            cell.ontouchstart = (e) => {
                e.preventDefault();
                this.handleCellAction(i);
            };

            boardEl.appendChild(cell);
        }

        // ツールバーイベント
        this.containerElement.querySelector('#nono-tool-draw').onclick = (e) => this.setMode(1, e.target);
        this.containerElement.querySelector('#nono-tool-cross').onclick = (e) => this.setMode(2, e.target);
        this.containerElement.querySelector('#btn-nono-clear').onclick = () => this.clearBoard();
        this.containerElement.querySelector('#btn-nono-check').onclick = () => this.checkSolution();

        document.addEventListener('mouseup', this.runMouseUp.bind(this));
    }

    runMouseUp() {
        this.isMouseDown = false;
        this.lastToggledVal = -1;
    }

    setMode(mode, targetBtn) {
        this.drawMode = mode;
        this.containerElement.querySelectorAll('.nono-toolbar .btn').forEach(b => b.classList.remove('active'));
        targetBtn.classList.add('active');
    }

    handleCellAction(idx) {
        if (!this.gameActive) return;

        const currentVal = this.boardState[idx];
        const cell = this.containerElement.querySelector(`[data-index="${idx}"]`);

        if (this.lastToggledVal === -1) {
            // ドラッグ開始時のトグル判定
            if (currentVal === this.drawMode) {
                this.lastToggledVal = 0; // すでにその状態なら消す(空にする)
            } else {
                this.lastToggledVal = this.drawMode;
            }
        }

        this.boardState[idx] = this.lastToggledVal;
        cell.className = 'nono-cell';

        // 5マス境界線を維持
        const r = Math.floor(idx / 8);
        const c = idx % 8;
        if (r === 4) cell.style.borderTop = '1.5px solid rgba(51,56,53,0.3)';
        if (c === 4) cell.style.borderLeft = '1.5px solid rgba(51,56,53,0.3)';

        if (this.boardState[idx] === 1) {
            cell.classList.add('filled');
        } else if (this.boardState[idx] === 2) {
            cell.classList.add('crossed');
        }

        this.updateProgress();
    }

    updateProgress() {
        const totalSolutionPixels = this.solution.filter(v => v === 1).length;
        let correctPixels = 0;
        
        for (let i = 0; i < 64; i++) {
            if (this.boardState[i] === 1 && this.solution[i] === 1) {
                correctPixels++;
            }
        }

        const percent = Math.min(100, Math.round((correctPixels / totalSolutionPixels) * 100));
        if (this.options.onProgressChange) {
            this.options.onProgressChange(percent);
        }
    }

    clearBoard() {
        if (!this.gameActive) return;
        this.boardState.fill(0);
        this.containerElement.querySelectorAll('.nono-cell').forEach(cell => {
            cell.className = 'nono-cell';
        });
        if (this.options.onProgressChange) this.options.onProgressChange(0);
    }

    checkSolution() {
        if (!this.gameActive) return;

        let hasError = false;
        let diffCount = 0;

        for (let i = 0; i < 64; i++) {
            const playerFilled = this.boardState[i] === 1;
            const solFilled = this.solution[i] === 1;

            if (playerFilled !== solFilled) {
                hasError = true;
                diffCount++;
            }
        }

        if (hasError) {
            this.errors++;
            if (this.options.onErrorsChange) {
                this.options.onErrorsChange(this.errors);
            }
            app.showToast(`一致しないマスが ${diffCount} 個あります。`);
        } else {
            // クリア！
            this.gameActive = false;
            this.stopTimer();

            const score = Math.max(100, 2500 - this.errors * 250 - this.elapsedSeconds * 2);
            setTimeout(() => {
                if (this.onGameWin) {
                    this.onGameWin(score, this.elapsedSeconds, this.errors);
                }
            }, 600);
        }
    }

    destroy() {
        document.removeEventListener('mouseup', this.boundMouseUp);
        super.destroy();
    }
}

window.LogiqGames.NonogramGame = NonogramGame;
