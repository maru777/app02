/**
 * LogiQ - Mastermind Game Module
 * 共通基底クラス GameBase を継承
 * ルール:
 *  - 0〜9の数字から、重複のない4桁の暗号コードを生成。
 *  - プレイヤーは4桁の推測を入力。
 *  - 完全一致＝Hit(H)、数字のみ一致＝Blow(B)としてフィードバック。
 */
class MastermindGame extends LogiqGames.GameBase {
    constructor(containerElement, options) {
        super(containerElement, options);

        this.secretCode = []; // 4桁の配列
        this.history = [];    // { guess: Array, hit: number, blow: number }
        this.currentGuess = []; // プレイヤーの現在入力中の数字
    }

    startNewGame() {
        this.history = [];
        this.currentGuess = [];
        this.elapsedSeconds = 0;

        this.generateSecretCode();
        this.setupDOM();
        this.startTimer();

        if (this.options.onMovesChange) this.options.onMovesChange(0);
        if (this.options.onHistoryChange) this.options.onHistoryChange('推測を入力してください');
    }

    generateSecretCode() {
        const nums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        this.secretCode = [];
        for (let i = 0; i < 4; i++) {
            const idx = Math.floor(Math.random() * nums.length);
            this.secretCode.push(nums.splice(idx, 1)[0]);
        }
    }

    setupDOM() {
        this.containerElement.innerHTML = `
            <div class="mm-wrapper">
                <!-- 履歴リスト表示領域 -->
                <div class="mm-history-panel" id="mm-history-list">
                    <div class="mm-empty-history">ここに推理の履歴が表示されます</div>
                </div>

                <!-- 現在の入力表示 -->
                <div class="mm-input-display">
                    <div class="mm-digit-slot" data-slot="0"></div>
                    <div class="mm-digit-slot" data-slot="1"></div>
                    <div class="mm-digit-slot" data-slot="2"></div>
                    <div class="mm-digit-slot" data-slot="3"></div>
                </div>

                <!-- テンキー入力 -->
                <div class="mm-keyboard">
                    <button class="mm-key" data-num="1">1</button>
                    <button class="mm-key" data-num="2">2</button>
                    <button class="mm-key" data-num="3">3</button>
                    <button class="mm-key" data-num="4">4</button>
                    <button class="mm-key" data-num="5">5</button>
                    <button class="mm-key" data-num="6">6</button>
                    <button class="mm-key" data-num="7">7</button>
                    <button class="mm-key" data-num="8">8</button>
                    <button class="mm-key" data-num="9">9</button>
                    <button class="mm-key clear-key" id="mm-btn-clear">AC</button>
                    <button class="mm-key" data-num="0">0</button>
                    <button class="mm-key enter-key" id="mm-btn-enter">CHECK</button>
                </div>
            </div>
        `;

        // キーイベントリスナーの紐付け
        this.containerElement.querySelectorAll('.mm-key[data-num]').forEach(btn => {
            const num = parseInt(btn.dataset.num);
            btn.onclick = () => this.inputDigit(num);
        });

        this.containerElement.querySelector('#mm-btn-clear').onclick = () => this.clearInput();
        this.containerElement.querySelector('#mm-btn-enter').onclick = () => this.submitGuess();
    }

    handleKeyDown(e) {
        if (!this.gameActive) return;
        if (e.key >= '0' && e.key <= '9') {
            this.inputDigit(parseInt(e.key));
        } else if (e.key === 'Backspace' || e.key === 'Escape') {
            this.clearInput();
        } else if (e.key === 'Enter') {
            this.submitGuess();
        }
    }

    inputDigit(num) {
        if (!this.gameActive) return;
        if (this.currentGuess.length >= 4) return;
        
        // 重複数字の入力は制限（マスターマインドの標準ルール）
        if (this.currentGuess.includes(num)) {
            app.showToast('重複する数字は入力できません。');
            return;
        }

        this.currentGuess.push(num);
        this.updateInputDisplay();
    }

    clearInput() {
        if (!this.gameActive) return;
        this.currentGuess = [];
        this.updateInputDisplay();
    }

    updateInputDisplay() {
        for (let i = 0; i < 4; i++) {
            const slot = this.containerElement.querySelector(`[data-slot="${i}"]`);
            if (slot) {
                if (i < this.currentGuess.length) {
                    slot.innerText = this.currentGuess[i];
                    slot.classList.add('filled');
                } else {
                    slot.innerText = '';
                    slot.classList.remove('filled');
                }
            }
        }

        // 入力制限のためのキーボード無効化制御
        this.containerElement.querySelectorAll('.mm-key[data-num]').forEach(btn => {
            const num = parseInt(btn.dataset.num);
            if (this.currentGuess.includes(num)) {
                btn.classList.add('disabled-key');
            } else {
                btn.classList.remove('disabled-key');
            }
        });
    }

    submitGuess() {
        if (!this.gameActive) return;
        if (this.currentGuess.length < 4) {
            app.showToast('4桁の数字を入力してください。');
            return;
        }

        // ヒットとブローを判定
        let hit = 0;
        let blow = 0;

        for (let i = 0; i < 4; i++) {
            if (this.currentGuess[i] === this.secretCode[i]) {
                hit++;
            } else if (this.secretCode.includes(this.currentGuess[i])) {
                blow++;
            }
        }

        const roundResult = {
            guess: [...this.currentGuess],
            hit: hit,
            blow: blow
        };

        this.history.push(roundResult);
        this.renderHistoryList();

        // ポータルヘッダーの更新
        if (this.options.onMovesChange) this.options.onMovesChange(this.history.length);
        if (this.options.onHistoryChange) {
            this.options.onHistoryChange(`前回の結果: ${hit}H - ${blow}B`);
        }

        // 入力クリア
        this.currentGuess = [];
        this.updateInputDisplay();

        // クリア判定
        if (hit === 4) {
            this.gameActive = false;
            this.stopTimer();

            // スコア算出 (ターン数が少ない＆早いほど高IQ)
            const score = Math.max(100, 3000 - (this.history.length - 1) * 250 - this.elapsedSeconds * 2);
            
            // 盤面を成功状態に
            this.containerElement.querySelectorAll('.mm-digit-slot').forEach(slot => {
                slot.style.borderColor = '#4CAF7D';
                slot.style.color = '#4CAF7D';
            });

            setTimeout(() => {
                if (this.onGameWin) {
                    this.onGameWin(score, this.elapsedSeconds, this.history.length);
                }
            }, 800);
        }
    }

    renderHistoryList() {
        const listEl = this.containerElement.querySelector('#mm-history-list');
        if (!listEl) return;

        listEl.innerHTML = '';
        this.history.forEach((h, idx) => {
            const item = document.createElement('div');
            item.className = 'mm-history-item';
            item.innerHTML = `
                <span class="mm-round-num">#${idx + 1}</span>
                <span class="mm-guess-val">${h.guess.join(' ')}</span>
                <span class="mm-result-badge">
                    <span class="badge-hit">${h.hit} H</span>
                    <span class="badge-blow">${h.blow} B</span>
                </span>
            `;
            listEl.appendChild(item);
        });

        // スクロールを一番下に移動
        listEl.scrollTop = listEl.scrollHeight;
    }
}

window.LogiqGames.MastermindGame = MastermindGame;
