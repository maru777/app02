/**
 * LogiQ - Einstein Grid Game Module
 * 共通基底クラス GameBase を継承
 * 3カテゴリ×3要素 (計9要素) の関係性を解き明かす論理グリッド
 * カテゴリ1: 名前 (アリス, ボブ, チャーリー)
 * カテゴリ2: ペット (犬, 猫, 鳥)
 * カテゴリ3: 飲み物 (お茶, コーヒー, 牛乳)
 */
class EinsteinGridGame extends LogiqGames.GameBase {
    constructor(containerElement, options) {
        super(containerElement, options);

        this.names = ['アリス', 'ボブ', 'チャーリー'];
        this.pets = ['犬', '猫', '鳥'];
        this.drinks = ['お茶', 'コーヒー', '牛乳'];

        // 正解データ (解決テーブル。シャッフルにより毎プレイ変化)
        this.solution = {
            nameToPet: {},    // name -> pet
            nameToDrink: {},  // name -> drink
            petToDrink: {}    // pet -> drink (自動算出)
        };

        // グリッド入力状態 (18個のセル)
        // 0: 空, 1: ✖ (不一致), 2: ◯ (一致)
        this.gridState = {
            namePet: Array(9).fill(0),   // 行: name (アリス,ボブ,チャーリー), 列: pet (犬,猫,鳥)
            nameDrink: Array(9).fill(0)  // 行: name (アリス,ボブ,チャーリー), 列: drink (お茶,コーヒー,牛乳)
        };

        this.hints = [];
        this.errors = 0;
    }

    startNewGame() {
        this.gridState.namePet.fill(0);
        this.gridState.nameDrink.fill(0);
        this.errors = 0;
        this.elapsedSeconds = 0;
        this.gameActive = true;

        this.generatePuzzle();
        this.setupDOM();
        this.startTimer();

        if (this.options.onMarksChange) this.options.onMarksChange(0);
        if (this.options.onErrorsChange) this.options.onErrorsChange(0);
    }

    /**
     * ランダムな関係性を生成し、それを説明する論理ヒント文を構築する
     */
    generatePuzzle() {
        // シャッフル
        const shuffledPets = [...this.pets].sort(() => Math.random() - 0.5);
        const shuffledDrinks = [...this.drinks].sort(() => Math.random() - 0.5);

        // 正解の紐付け
        this.names.forEach((name, i) => {
            this.solution.nameToPet[name] = shuffledPets[i];
            this.solution.nameToDrink[name] = shuffledDrinks[i];
            this.solution.petToDrink[shuffledPets[i]] = shuffledDrinks[i];
        });

        // 難しすぎず簡単すぎない、十分なヒント文の自動生成
        this.hints = [];

        // ヒント1: 直接的ヒント (ペットと飲み物)
        const p1 = this.pets[Math.floor(Math.random() * 3)];
        const d1 = this.solution.petToDrink[p1];
        this.hints.push(`・「${p1}」を飼っている人は、「${d1}」を好んで飲みます。`);

        // ヒント2: 名前とペット
        const n2 = this.names[Math.floor(Math.random() * 3)];
        const pet2 = this.solution.nameToPet[n2];
        this.hints.push(`・${n2}のペットは「${pet2}」です。`);

        // ヒント3: 残りを特定するための否定または比較関係ヒント
        // 未使用の属性から関係を導く
        let unusedName = this.names.find(n => n !== n2);
        let targetDrink = this.solution.nameToDrink[unusedName];
        this.hints.push(`・${unusedName}は「${targetDrink}」を飲みます。`);
    }

    setupDOM() {
        this.containerElement.innerHTML = `
            <div class="ein-wrapper">
                <!-- ヒント文パネル -->
                <div class="ein-hints-panel">
                    <div class="ein-hints-title">💡 推理のヒント</div>
                    <div class="ein-hints-list" id="ein-hints-list"></div>
                </div>

                <!-- グリッドテーブル -->
                <div class="ein-matrix-container">
                    <table class="ein-table">
                        <thead>
                            <tr>
                                <th></th>
                                <th class="col-header header-pet">犬</th>
                                <th class="col-header header-pet">猫</th>
                                <th class="col-header header-pet">鳥</th>
                                <th class="col-header header-drink">お茶</th>
                                <th class="col-header header-drink">コヒ</th>
                                <th class="col-header header-drink">牛乳</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr data-row-name="アリス">
                                <td class="row-header">アリス</td>
                                <td class="ein-cell" data-type="namePet" data-r="0" data-c="0"></td>
                                <td class="ein-cell" data-type="namePet" data-r="0" data-c="1"></td>
                                <td class="ein-cell" data-type="namePet" data-r="0" data-c="2"></td>
                                <td class="ein-cell" data-type="nameDrink" data-r="0" data-c="0"></td>
                                <td class="ein-cell" data-type="nameDrink" data-r="0" data-c="1"></td>
                                <td class="ein-cell" data-type="nameDrink" data-r="0" data-c="2"></td>
                            </tr>
                            <tr data-row-name="ボブ">
                                <td class="row-header">ボブ</td>
                                <td class="ein-cell" data-type="namePet" data-r="1" data-c="0"></td>
                                <td class="ein-cell" data-type="namePet" data-r="1" data-c="1"></td>
                                <td class="ein-cell" data-type="namePet" data-r="1" data-c="2"></td>
                                <td class="ein-cell" data-type="nameDrink" data-r="1" data-c="0"></td>
                                <td class="ein-cell" data-type="nameDrink" data-r="1" data-c="1"></td>
                                <td class="ein-cell" data-type="nameDrink" data-r="1" data-c="2"></td>
                            </tr>
                            <tr data-row-name="チャーリー">
                                <td class="row-header">Ch.</td>
                                <td class="ein-cell" data-type="namePet" data-r="2" data-c="0"></td>
                                <td class="ein-cell" data-type="namePet" data-r="2" data-c="1"></td>
                                <td class="ein-cell" data-type="namePet" data-r="2" data-c="2"></td>
                                <td class="ein-cell" data-type="nameDrink" data-r="2" data-c="0"></td>
                                <td class="ein-cell" data-type="nameDrink" data-r="2" data-c="1"></td>
                                <td class="ein-cell" data-type="nameDrink" data-r="2" data-c="2"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="ein-actions">
                    <button class="btn btn-secondary" id="btn-ein-clear">リセット</button>
                    <button class="btn btn-primary" id="btn-ein-check">推理を完了する</button>
                </div>
            </div>
        `;

        // ヒントの一覧描画
        const hintsList = this.containerElement.querySelector('#ein-hints-list');
        this.hints.forEach(h => {
            const el = document.createElement('div');
            el.className = 'ein-hint-item';
            el.innerText = h;
            hintsList.appendChild(el);
        });

        // セルクリックイベント
        this.containerElement.querySelectorAll('.ein-cell').forEach(cell => {
            const type = cell.dataset.type;
            const r = parseInt(cell.dataset.r);
            const c = parseInt(cell.dataset.c);
            cell.onclick = () => this.cycleCellState(type, r, c, cell);
        });

        this.containerElement.querySelector('#btn-ein-clear').onclick = () => this.clearGrid();
        this.containerElement.querySelector('#btn-ein-check').onclick = () => this.checkSolution();
    }

    cycleCellState(type, r, c, cell) {
        if (!this.gameActive) return;

        const idx = r * 3 + c;
        const current = this.gridState[type][idx];
        // 0 (空) -> 1 (✖) -> 2 (◯) -> 0 (空)
        const next = (current + 1) % 3;
        this.gridState[type][idx] = next;

        cell.className = 'ein-cell';
        if (next === 1) {
            cell.classList.add('state-cross');
            cell.innerHTML = '✖';
        } else if (next === 2) {
            cell.classList.add('state-circle');
            cell.innerHTML = '◯';
        } else {
            cell.innerHTML = '';
        }

        // マーク数をカウント
        const totalMarks = this.gridState.namePet.filter(v => v > 0).length + this.gridState.nameDrink.filter(v => v > 0).length;
        if (this.options.onMarksChange) {
            this.options.onMarksChange(totalMarks);
        }
    }

    clearGrid() {
        if (!this.gameActive) return;
        this.gridState.namePet.fill(0);
        this.gridState.nameDrink.fill(0);
        this.containerElement.querySelectorAll('.ein-cell').forEach(c => {
            c.className = 'ein-cell';
            c.innerHTML = '';
        });
        if (this.options.onMarksChange) this.options.onMarksChange(0);
    }

    checkSolution() {
        if (!this.gameActive) return;

        // ◯ が各サブグリッドに3つずつあり、かつ正解と一致しているか
        let hasError = false;
        let diffCount = 0;

        // 1. Name -> Pet グリッド検証
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                const state = this.gridState.namePet[r * 3 + c];
                const name = this.names[r];
                const pet = this.pets[c];
                const isCorrectPair = this.solution.nameToPet[name] === pet;

                if (state === 2 && !isCorrectPair) {
                    hasError = true;
                    diffCount++;
                }
                // 正解のペアなのに ◯ になっていない場合も検証
                if (isCorrectPair && state !== 2) {
                    hasError = true;
                }
            }
        }

        // 2. Name -> Drink グリッド検証
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                const state = this.gridState.nameDrink[r * 3 + c];
                const name = this.names[r];
                const drink = this.drinks[c];
                const isCorrectPair = this.solution.nameToDrink[name] === drink;

                if (state === 2 && !isCorrectPair) {
                    hasError = true;
                    diffCount++;
                }
                if (isCorrectPair && state !== 2) {
                    hasError = true;
                }
            }
        }

        if (hasError) {
            this.errors++;
            if (this.options.onErrorsChange) {
                this.options.onErrorsChange(this.errors);
            }
            app.showToast('推理に矛盾があるか、一部未完成です。');
        } else {
            this.gameActive = false;
            this.stopTimer();

            const score = Math.max(100, 3000 - this.errors * 300 - this.elapsedSeconds * 2);
            setTimeout(() => {
                if (this.onGameWin) {
                    this.onGameWin(score, this.elapsedSeconds, this.errors);
                }
            }, 600);
        }
    }
}

window.LogiqGames.EinsteinGridGame = EinsteinGridGame;
