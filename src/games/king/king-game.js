/**
 * LogiQ - Nexus Align (旧 King Place) Game Module
 * 共通基底クラス GameBase を継承
 * 世界線: 量子ノードの安定化パズル (Nexus Align) - 明るいパステル世界線・セーブ＆Undo・マルチスキン機能付
 */
class KingGame extends LogiqGames.GameBase {
    // Nexus Align 固有のスキン
    static SKINS = {
        nexus_classic: { name: 'クラシック・ネオン', icon: '🔮', desc: '標準の美しく光る量子コアスキンです。', price: 0 },
        nexus_plasma:  { name: 'プラズマ・リアクター', icon: '⚛️', desc: '高エネルギー放電リアクターと素粒子インジケーター。', price: 1500 },
        nexus_cosmos:  { name: 'コズミック・オリオン', icon: '🪐', desc: '自転する星々を天体アラインメントに配置。', price: 2500 },
        nexus_magic:   { name: 'マジック・ルーン', icon: '🌀', desc: '古代魔術の術式展開を再現した神秘スキン。', price: 2000 }
    };

    // Nexus Align 固有の円形スキルツリー
    static SKILLS = {
        core: { name: '量子コア', icon: '🧠', desc: '基本アラインメントモジュール。', price: 0 },
        boost: { name: '予測シミュレーター', icon: '🔮', desc: '将来破綻する配置（解がゼロになるマス）を赤く警告表示する。', price: 1500, parent: 'core' },
        grid5x5: { name: 'タイムリワインド', icon: '↩', desc: '手詰まり時に自動で1手前に戻す時間逆行アシスト。', price: 2000, parent: 'core' }
    };

    constructor(containerElement, options) {
        super(containerElement, options);

        // 難易度に応じてグリッドサイズを決定
        const difficulty = options.difficulty || 'normal';
        if (difficulty === 'easy') {
            this.gridSize = 6;
        } else if (difficulty === 'hard') {
            this.gridSize = 10;
        } else if (difficulty === 'expert') {
            this.gridSize = 15;
        } else {
            this.gridSize = 8; // デフォルト (Normal)
        }

        const cellsCount = this.gridSize * this.gridSize;
        // boardState: 0(空), 1(手動グレー⚫), 2(コア🔮), 3(手動ブルー🔵), 4(手動グリーン🟢)
        this.boardState = Array(cellsCount).fill(0); 
        this.colorGrid = Array(cellsCount).fill(-1);
        this.attempts = 0;
        
        // 選択中の目印ツール (1, 3, 4)
        this.activeMarker = 1; 

        // ドラッグ（スワイプ）での連続目印配置用の状態管理
        this.isDragging = false;
        this.dragMode = null; // 'place' (配置) または 'clear' (消去)

        // 操作履歴（Undo用）
        this.history = [];

        // スキン情報
        this.currentSkin = options.currentSkin || 'nexus_classic';

        // スキンごとの絵文字・テキスト設定
        this.skinsConfig = {
            nexus_classic: {
                core: '🔮',
                coreName: 'コア',
                markers: {
                    1: { char: '⚫', color: '#7F8C8D', name: 'ALPHA' },
                    3: { char: '🔵', color: '#3498DB', name: 'BETA' },
                    4: { char: '🟢', color: '#2ECC71', name: 'GAMMA' }
                }
            },
            nexus_plasma: {
                core: '⚛️',
                coreName: 'リアクター',
                markers: {
                    1: { char: '🔸', color: '#E67E22', name: 'PROTON' }, // 陽子
                    3: { char: '🔹', color: '#2980B9', name: 'NEUTRON' }, // 中性子
                    4: { char: '💠', color: '#9B59B6', name: 'ELECTRON' }  // 電子
                }
            },
            nexus_cosmos: {
                core: '🪐',
                coreName: '惑星',
                markers: {
                    1: { char: '🌑', color: '#34495E', name: 'SATELLITE' }, // 衛星
                    3: { char: '☄️', color: '#E74C3C', name: 'COMET' },     // 彗星
                    4: { char: '🌟', color: '#F1C40F', name: 'STAR' }      // 恒星
                }
            },
            nexus_magic: {
                core: '🌀',
                coreName: '魔石',
                markers: {
                    1: { char: '🔸', color: '#E74C3C', name: 'FIRE' },
                    3: { char: '🔹', color: '#3498DB', name: 'WATER' },
                    4: { char: '💫', color: '#F1C40F', name: 'LIGHT' }
                }
            }
        };

        // 明るく上品で淡い、北欧風のくすみパステルカラー（24色）
        this.areaColors = [
            '#FADBD8', '#FDEDEC', '#F5EEF8', '#EBDEF0', '#D4E6F1',
            '#E8F8F5', '#D1F2EB', '#D5F5E3', '#E8F8F0', '#FCF3CF',
            '#FEF9E7', '#FDEBD0', '#F5CBA7', '#EDBB99', '#E5E7E9',
            '#EAFAF1', '#EAF2F8', '#F4ECF7', '#FDEDEC', '#FEF5E7',
            '#E8F6F3', '#FFF0F5', '#F0FFF0', '#F0F8FF'
        ];
    }

    startNewGame() {
        this.boardState.fill(0);
        this.attempts = 0;
        this.elapsedSeconds = 0;
        this.activeMarker = 1;
        this.history = [];
        this.gameActive = true;

        this.generateValidStage();
        this.setupDOM();
        this.startTimer();

        this.saveGameState(); // 初期状態をセーブ

        if (this.options.onMovesChange) this.options.onMovesChange(0, this.gridSize);
        if (this.options.onAttemptsChange) this.options.onAttemptsChange(this.attempts);
    }

    /**
     * 中断セーブデータの保存
     */
    saveGameState() {
        const data = {
            boardState: this.boardState,
            colorGrid: this.colorGrid,
            elapsedSeconds: this.elapsedSeconds,
            attempts: this.attempts,
            history: this.history,
            gridSize: this.gridSize,
            difficulty: this.options.difficulty || 'normal'
        };
        localStorage.setItem('logiq_save_king_game', JSON.stringify(data));
        
        // 共通セーブコールバックの呼び出し（ポータル側に通知）
        if (this.options.saveStateCallback) {
            this.options.saveStateCallback(data);
        }
    }

    /**
     * 中断セーブデータの復元
     */
    loadGameState(data) {
        this.boardState = data.boardState;
        this.colorGrid = data.colorGrid;
        this.elapsedSeconds = data.elapsedSeconds;
        this.attempts = data.attempts;
        this.history = data.history || [];
        this.gridSize = data.gridSize;
        this.gameActive = true;

        this.setupDOM();
        this.updateAllCellsDOM();
        this.updateUndoButtonState();
        this.startTimer();
    }

    saveHistory() {
        // 履歴を保存（最大100手まで。ディープコピー）
        this.history.push([...this.boardState]);
        if (this.history.length > 100) this.history.shift();
        this.updateUndoButtonState();
    }

    undo() {
        if (!this.gameActive || this.history.length === 0) return;
        this.boardState = this.history.pop();
        this.updateAllCellsDOM();
        this.updateUndoButtonState();
        this.saveGameState(); // 戻った後も即座に保存！
        this.checkAutoWin();
    }

    updateUndoButtonState() {
        const undoBtn = this.containerElement.querySelector('#btn-king-undo');
        if (undoBtn) {
            undoBtn.disabled = this.history.length === 0;
            undoBtn.style.opacity = this.history.length === 0 ? '0.4' : '1';
        }
    }

    generateValidStage() {
        let isValid = false;
        let limit = 300;

        while (!isValid && limit > 0) {
            this.generateColorAreas();
            if (this.solvePuzzle()) {
                isValid = true;
            }
            limit--;
        }
    }

    generateColorAreas() {
        const size = this.gridSize;
        const cellsCount = size * size;
        this.colorGrid.fill(-1);
        
        const seeds = [];
        while (seeds.length < size) {
            const idx = Math.floor(Math.random() * cellsCount);
            if (!seeds.includes(idx)) {
                seeds.push(idx);
                this.colorGrid[idx] = seeds.length - 1;
            }
        }

        const queue = [...seeds];
        while (queue.length > 0) {
            const currIdx = Math.floor(Math.random() * queue.length);
            const idx = queue.splice(currIdx, 1)[0];
            const color = this.colorGrid[idx];

            const r = Math.floor(idx / size);
            const c = idx % size;
            const dirs = [[-1,0], [1,0], [0,-1], [0,1]];

            dirs.forEach(([dr, dc]) => {
                const nr = r + dr;
                const nc = c + dc;
                if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
                    const nIdx = nr * size + nc;
                    if (this.colorGrid[nIdx] === -1) {
                        this.colorGrid[nIdx] = color;
                        queue.push(nIdx);
                    }
                }
            });
        }
    }

    solvePuzzle() {
        const size = this.gridSize;
        const colUsed = Array(size).fill(false);
        const sectorUsed = Array(size).fill(false);
        const grid = Array(size).fill(null).map(() => Array(size).fill(0));
        let steps = 0;
        const maxSteps = 40000;

        const canPlace = (r, c) => {
            if (colUsed[c]) return false;
            const sector = this.colorGrid[r * size + c];
            if (sectorUsed[sector]) return false;

            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const nr = r + dr;
                    const nc = c + dc;
                    if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
                        if (grid[nr][nc] === 2) return false;
                    }
                }
            }
            return true;
        };

        const backtrack = (r) => {
            steps++;
            if (steps > maxSteps) return false;
            if (r === size) return true;

            for (let c = 0; c < size; c++) {
                if (canPlace(r, c)) {
                    grid[r][c] = 2;
                    colUsed[c] = true;
                    const sector = this.colorGrid[r * size + c];
                    sectorUsed[sector] = true;

                    if (backtrack(r + 1)) return true;

                    grid[r][c] = 0;
                    colUsed[c] = false;
                    sectorUsed[sector] = false;
                }
            }
            return false;
        };

        return backtrack(0);
    }

    /**
     * 特定のマスにおける描画用の一時状態を動的計算する
     * 0: 空, 1: 手動グレー, 2: コア, 3: 手動ブルー, 4: 手動グリーン, 5: 自動グレー(・)
     */
    getRenderState(idx) {
        const manual = this.boardState[idx];
        if (manual !== 0) return manual; // 手動配置があれば最優先

        // コアの周囲8マスおよび十字に該当するかチェック
        const size = this.gridSize;
        const r = Math.floor(idx / size);
        const c = idx % size;

        for (let i = 0; i < this.boardState.length; i++) {
            if (this.boardState[i] === 2) {
                const coreR = Math.floor(i / size);
                const coreC = i % size;

                // 1. 十字（同じ行、または同じ列）
                if (r === coreR || c === coreC) {
                    return 5; // 自動ドット
                }
                // 2. 周囲8マス
                if (Math.abs(r - coreR) <= 1 && Math.abs(c - coreC) <= 1) {
                    return 5; // 自動ドット
                }
            }
        }

        return 0; // 何も該当しなければ空
    }

    setupDOM() {
        const size = this.gridSize;
        const boardSizeStyle = size === 15 ? 'width: 330px; height: 330px;' : 'width: 320px; height: 320px;';
        const fontSizeStyle = size === 15 ? 'font-size: 11px;' : 'font-size: 14px;';
        
        // 現在のスキン設定を取得
        const skinCfg = this.skinsConfig[this.currentSkin] || this.skinsConfig.nexus_classic;

        this.containerElement.innerHTML = `
            <div class="king-wrapper" style="align-items: center;">
                <!-- スキンに合わせた3色の目印選択ツールバー -->
                <div class="king-toolbar" style="display: flex; gap: 8px; margin-bottom: 12px; justify-content: center; width: 320px; box-sizing: border-box;">
                    <button class="btn btn-secondary active" id="marker-btn-1" style="flex: 1; height: 36px; border-radius: 12px; font-weight: 700; font-size: 10px; display: flex; align-items: center; justify-content: center; gap: 5px; transition: all 0.2s;">
                        ${skinCfg.markers[1].char} ${skinCfg.markers[1].name}
                    </button>
                    <button class="btn btn-secondary" id="marker-btn-3" style="flex: 1; height: 36px; border-radius: 12px; font-weight: 700; font-size: 10px; display: flex; align-items: center; justify-content: center; gap: 5px; transition: all 0.2s;">
                        ${skinCfg.markers[3].char} ${skinCfg.markers[3].name}
                    </button>
                    <button class="btn btn-secondary" id="marker-btn-4" style="flex: 1; height: 36px; border-radius: 12px; font-weight: 700; font-size: 10px; display: flex; align-items: center; justify-content: center; gap: 5px; transition: all 0.2s;">
                        ${skinCfg.markers[4].char} ${skinCfg.markers[4].name}
                    </button>
                </div>

                <div id="king-board" class="king-board" style="${boardSizeStyle} grid-template-columns: repeat(${size}, 1fr); grid-template-rows: repeat(${size}, 1fr);"></div>
                
                <div class="king-actions" style="margin-top: 15px; display: flex; gap: 10px; justify-content: center; width: 320px;">
                    <button class="btn btn-secondary" id="btn-king-clear" style="font-size: 11px; padding: 6px 12px; border-radius: 12px; flex: 1;">全解除</button>
                    <button class="btn btn-secondary" id="btn-king-undo" style="font-size: 11px; padding: 6px 12px; border-radius: 12px; flex: 1;" disabled>↩ 1手戻る</button>
                </div>
            </div>
        `;

        const boardEl = this.containerElement.querySelector('#king-board');
        boardEl.innerHTML = '';

        const m1Btn = this.containerElement.querySelector('#marker-btn-1');
        const m3Btn = this.containerElement.querySelector('#marker-btn-3');
        const m4Btn = this.containerElement.querySelector('#marker-btn-4');
        
        const setMarker = (markerId) => {
            this.activeMarker = markerId;
            m1Btn.classList.toggle('active', markerId === 1);
            m3Btn.classList.toggle('active', markerId === 3);
            m4Btn.classList.toggle('active', markerId === 4);

            [m1Btn, m3Btn, m4Btn].forEach(btn => {
                btn.style.backgroundColor = '';
                btn.style.borderColor = '';
            });
            const activeBtn = markerId === 1 ? m1Btn : markerId === 3 ? m3Btn : m4Btn;
            activeBtn.style.backgroundColor = 'var(--accent-light)';
            activeBtn.style.borderColor = 'var(--accent)';
        };
        
        m1Btn.onclick = () => setMarker(1);
        m3Btn.onclick = () => setMarker(3);
        m4Btn.onclick = () => setMarker(4);
        setMarker(this.activeMarker); // 復元時にも状態維持
        this.updateUndoButtonState();

        const handleStart = (idx, e) => {
            if (!this.gameActive) return;
            
            this.saveHistory(); // 操作前に履歴を保存
            this.isDragging = true;
            const current = this.boardState[idx];

            if (current === this.activeMarker) {
                this.dragMode = 'clear';
                this.boardState[idx] = 0;
            } else {
                this.dragMode = 'place';
                this.boardState[idx] = this.activeMarker;
            }
            this.updateAllCellsDOM();
            this.saveGameState(); // 保存
        };

        const handleEnter = (idx) => {
            if (!this.gameActive || !this.isDragging || this.dragMode === null) return;
            const current = this.boardState[idx];

            if (current !== 2) {
                if (this.dragMode === 'place') {
                    this.boardState[idx] = this.activeMarker;
                } else if (this.dragMode === 'clear' && current === this.activeMarker) {
                    this.boardState[idx] = 0;
                }
                this.updateAllCellsDOM();
                this.saveGameState(); // 保存
            }
        };

        const stopDrag = () => {
            this.isDragging = false;
            this.dragMode = null;
            this.checkAutoWin();
        };

        window.addEventListener('mouseup', stopDrag);
        window.addEventListener('touchend', stopDrag);

        for (let i = 0; i < size * size; i++) {
            const cell = document.createElement('div');
            cell.className = 'king-cell';
            cell.dataset.index = i;
            cell.setAttribute('style', fontSizeStyle);
            
            const colorId = this.colorGrid[i];
            cell.style.backgroundColor = this.areaColors[colorId % this.areaColors.length];
            cell.style.borderColor = 'rgba(0,0,0,0.03)';

            this.drawBorder(cell, i, colorId);

            cell.addEventListener('mousedown', (e) => {
                if (e.button === 0) handleStart(i, e);
            });
            cell.addEventListener('mouseenter', () => handleEnter(i));

            cell.addEventListener('dblclick', (e) => {
                if (!this.gameActive) return;
                e.preventDefault();
                this.saveHistory();

                const current = this.boardState[i];
                if (current === 2) {
                    this.boardState[i] = 0;
                } else {
                    this.boardState[i] = 2;
                }
                this.updateAllCellsDOM();
                this.saveGameState(); // 保存
                this.checkAutoWin();
            });

            cell.addEventListener('touchstart', (e) => {
                handleStart(i, e);
            });
            cell.addEventListener('touchmove', (e) => {
                if (!this.isDragging || this.dragMode === null) return;
                const touch = e.touches[0];
                const target = document.elementFromPoint(touch.clientX, touch.clientY);
                if (target && target.classList.contains('king-cell')) {
                    const idx = parseInt(target.dataset.index);
                    if (!isNaN(idx)) handleEnter(idx);
                }
            });

            boardEl.appendChild(cell);
        }

        this.containerElement.querySelector('#btn-king-clear').onclick = () => this.clearBoard();
        this.containerElement.querySelector('#btn-king-undo').onclick = () => this.undo();
        
        this.updateAllCellsDOM();
        this.updateUndoButtonState();
    }

    drawBorder(cell, idx, colorId) {
        const size = this.gridSize;
        const r = Math.floor(idx / size);
        const c = idx % size;

        const borderStyle = '1px solid rgba(0, 0, 0, 0.18)';
        if (r > 0 && this.colorGrid[idx - size] !== colorId) cell.style.borderTop = borderStyle;
        if (r < size - 1 && this.colorGrid[idx + size] !== colorId) cell.style.borderBottom = borderStyle;
        if (c > 0 && this.colorGrid[idx - 1] !== colorId) cell.style.borderLeft = borderStyle;
        if (c < size - 1 && this.colorGrid[idx + 1] !== colorId) cell.style.borderRight = borderStyle;
    }

    updateAllCellsDOM() {
        const size = this.gridSize;
        const is15 = size === 15;
        const iconSize = is15 ? '12px' : '18px';

        // スキンに応じたビジュアル情報
        const skinCfg = this.skinsConfig[this.currentSkin] || this.skinsConfig.nexus_classic;

        for (let i = 0; i < this.boardState.length; i++) {
            const cell = this.containerElement.querySelector(`[data-index="${i}"]`);
            if (!cell) continue;

            cell.classList.remove('has-shield', 'has-king');
            cell.innerHTML = '';

            const renderState = this.getRenderState(i);

            if (renderState === 1) {
                cell.classList.add('has-shield');
                cell.innerHTML = `<div class="shield-dot" style="width: 4.5px; height: 4.5px; background-color: ${skinCfg.markers[1].color}; border-radius: 50%;"></div>`;
            } else if (renderState === 3) {
                cell.classList.add('has-shield');
                cell.innerHTML = `<div class="shield-dot" style="width: 4.5px; height: 4.5px; background-color: ${skinCfg.markers[3].color}; border-radius: 50%;"></div>`;
            } else if (renderState === 4) {
                cell.classList.add('has-shield');
                cell.innerHTML = `<div class="shield-dot" style="width: 4.5px; height: 4.5px; background-color: ${skinCfg.markers[4].color}; border-radius: 50%;"></div>`;
            } else if (renderState === 5) {
                cell.classList.add('has-shield');
                cell.innerHTML = `<div class="shield-dot" style="width: 2.5px; height: 2.5px; background-color: rgba(0,0,0,0.14); border-radius: 50%;"></div>`;
            } else if (renderState === 2) {
                cell.classList.add('has-king');
                cell.innerHTML = `<span style="font-size: ${iconSize}; filter: drop-shadow(0 2px 4px rgba(139, 111, 206, 0.3));">${skinCfg.core}</span>`;
            }
        }

        const placedCores = this.boardState.filter(v => v === 2).length;
        if (this.options.onMovesChange) {
            this.options.onMovesChange(placedCores, this.gridSize);
        }
    }

    clearBoard() {
        if (!this.gameActive) return;
        this.saveHistory();
        this.boardState.fill(0);
        this.updateAllCellsDOM();
        this.saveGameState(); // 保存
    }

    checkAutoWin() {
        if (!this.gameActive) return;

        const coreIndices = [];
        this.boardState.forEach((val, idx) => {
            if (val === 2) coreIndices.push(idx);
        });

        const targetCount = this.gridSize;

        if (coreIndices.length !== targetCount) {
            return;
        }

        let hasError = false;
        const size = this.gridSize;
        const rows = Array(size).fill(0);
        const cols = Array(size).fill(0);
        const colors = Array(size).fill(0);

        coreIndices.forEach(idx => {
            const r = Math.floor(idx / size);
            const c = idx % size;
            const color = this.colorGrid[idx];

            rows[r]++;
            cols[c]++;
            colors[color]++;
        });

        coreIndices.forEach(idx => {
            const r = Math.floor(idx / size);
            const c = idx % size;
            const color = this.colorGrid[idx];

            if (rows[r] > 1 || cols[c] > 1 || colors[color] > 1) {
                hasError = true;
            }
        });

        for (let i = 0; i < coreIndices.length; i++) {
            const idxA = coreIndices[i];
            const rA = Math.floor(idxA / size);
            const cA = idxA % size;

            for (let j = i + 1; j < coreIndices.length; j++) {
                const idxB = coreIndices[j];
                const rB = Math.floor(idxB / size);
                const cB = idxB % size;

                if (Math.abs(rA - rB) <= 1 && Math.abs(cA - cB) <= 1) {
                    hasError = true;
                }
            }
        }

        if (!hasError) {
            this.gameActive = false;
            this.stopTimer();
            localStorage.removeItem('logiq_save_king_game'); // クリア時はセーブデータを消去
            
            // 難易度によってスコアの重みを変えてコールバックする
            const difficulty = this.options.difficulty || 'normal';
            let baseScore = 2000;
            if (difficulty === 'easy') baseScore = 1000;
            else if (difficulty === 'hard') baseScore = 4000;
            else if (difficulty === 'expert') baseScore = 8000;

            const score = Math.max(100, baseScore - this.elapsedSeconds * (difficulty === 'expert' ? 1 : 2) - this.attempts * 100);

            app.showToast('安定化完了！次元アラインが測定されました。');
            setTimeout(() => {
                if (this.onGameWin) {
                    this.onGameWin(score, this.elapsedSeconds, this.attempts, difficulty);
                }
            }, 600);
        }
    }
}

window.LogiqGames.KingGame = KingGame;
