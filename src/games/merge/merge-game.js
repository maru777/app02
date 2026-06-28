/**
 * LogiQ - Genesis Merge Game Module
 * 共通基底クラス GameBase を継承
 */

const CELESTIAL_THEME = {
    2: { label: 'Dust', icon: '🌌', name: '宇宙の塵' },
    4: { label: 'Meteor', icon: '☄️', name: '隕石' },
    8: { label: 'Asteroid', icon: '🌑', name: '小惑星' },
    16: { label: 'Moon', icon: '🌙', name: '月' },
    32: { label: 'Mercury', icon: '🟤', name: '水星' },
    64: { label: 'Venus', icon: '🟡', name: '金星' },
    128: { label: 'Earth', icon: '🌍', name: '地球' },
    256: { label: 'Mars', icon: '🔴', name: '火星' },
    512: { label: 'Jupiter', icon: '🟠', name: '木星' },
    1024: { label: 'Saturn', icon: '🪐', name: '土星' },
    2048: { label: 'Uranus', icon: '🔵', name: '天王星' },
    4096: { label: 'Neptune', icon: '🌀', name: '海王星' },
    8192: { label: 'Pluto', icon: '🪨', name: '冥王星' },
    16384: { label: 'Sun', icon: '☀️', name: '太陽' },
    32768: { label: 'Supernova', icon: '💥', name: '超新星' },
    65536: { label: 'Black Hole', icon: '🕳️', name: 'ブラックホール' }
};

const GEMS_THEME = {
    2: { label: 'Quartz', icon: '🪨', name: '石英' },
    4: { label: 'Amethyst', icon: '💜', name: 'アメジスト' },
    8: { label: 'Aquamarine', icon: '💙', name: 'アクアマリン' },
    16: { label: 'Topaz', icon: '💛', name: 'トパーズ' },
    32: { label: 'Jade', icon: '💚', name: '翡翠' },
    64: { label: 'Amber', icon: '🧡', name: '琥珀' },
    128: { label: 'Emerald', icon: '💚', name: 'エメラルド' },
    256: { label: 'RoseQtz', icon: '💗', name: '紅水晶' },
    512: { label: 'Sapphire', icon: '💙', name: 'サファイア' },
    1024: { label: 'Ruby', icon: '❤️', name: 'ルビー' },
    2048: { label: 'Opal', icon: '🌈', name: 'オパール' },
    4096: { label: 'Diamond', icon: '💎', name: 'ダイヤモンド' },
    8192: { label: 'PinkDia', icon: '💖', name: 'ピンクダイヤ' },
    16384: { label: 'Crown', icon: '👑', name: '王冠の宝石' },
    32768: { label: 'Cosmic', icon: '🔮', name: '宇宙石' },
    65536: { label: 'Nebula Cry', icon: '🌌', name: '星雲結晶' }
};

const KANJI_LARGE_THEME = {
    2: { label: '万', icon: '🎴', name: '万 (10^4)' },
    4: { label: '億', icon: '🪙', name: '億 (10^8)' },
    8: { label: '兆', icon: '💎', name: '兆 (10^12)' },
    16: { label: '京', icon: '🏯', name: '京 (10^16)' },
    32: { label: '垓', icon: '🌊', name: '垓 (10^20)' },
    64: { label: '杼', icon: '🌌', name: '杼 (10^24)' },
    128: { label: '穣', icon: '🌾', name: '穣 (10^28)' },
    256: { label: '溝', icon: '🏞️', name: '溝 (10^32)' },
    512: { label: '澗', icon: '🏔️', name: '澗 (10^36)' },
    1024: { label: '正', icon: '⚖️', name: '正 (10^40)' },
    2048: { label: '載', icon: '🚀', name: '載 (10^44)' },
    4096: { label: '極', icon: '⭐', name: '極 (10^48)' },
    8192: { label: '恒沙', icon: '⏳', name: '恒河沙 (10^52)' },
    16384: { label: '阿僧', icon: '📿', name: '阿僧祇 (10^56)' },
    32768: { label: '那由', icon: '🌀', name: '那由他 (10^60)' },
    65536: { label: '無量', icon: '👁️', name: '無量大数 (10^68)' }
};

const KANJI_SMALL_THEME = {
    2: { label: '割', icon: '🍕', name: '割 (10^-1)' },
    4: { label: '分', icon: '⏱️', name: '分 (10^-2)' },
    8: { label: '厘', icon: '📏', name: '厘 (10^-3)' },
    16: { label: '毛', icon: '🪶', name: '毛 (10^-4)' },
    32: { label: '糸', icon: '🧵', name: '糸 (10^-5)' },
    64: { label: '忽', icon: '💨', name: '忽 (10^-6)' },
    128: { label: '微', icon: '🔬', name: '微 (10^-7)' },
    256: { label: '繊', icon: '🕸️', name: '繊 (10^-8)' },
    512: { label: '沙', icon: '🏖️', name: '沙 (10^-9)' },
    1024: { label: '塵', icon: '🧹', name: '塵 (10^-10)' },
    2048: { label: '埃', icon: '🌪️', name: '埃 (10^-11)' },
    4096: { label: '渺', icon: '💧', name: '渺 (10^-12)' },
    8192: { label: '漠', icon: '🏜️', name: '漠 (10^-13)' },
    16384: { label: '模糊', icon: '🌫️', name: '模糊 (10^-14)' },
    32768: { label: '逡巡', icon: '🔄', name: '逡巡 (10^-15)' },
    65536: { label: '刹那', icon: '⚡', name: '刹那 (10^-18)' }
};

const SI_PREFIX_THEME = {
    2: { label: 'KILO', icon: '📦', name: 'Kilo (10^3)' },
    4: { label: 'MEGA', icon: '💾', name: 'Mega (10^6)' },
    8: { label: 'GIGA', icon: '💿', name: 'Giga (10^9)' },
    16: { label: 'TERA', icon: '🎛️', name: 'Tera (10^12)' },
    32: { label: 'PETA', icon: '🧠', name: 'Peta (10^15)' },
    64: { label: 'EXA', icon: '🌐', name: 'Exa (10^18)' },
    128: { label: 'ZETTA', icon: '☁️', name: 'Zetta (10^21)' },
    256: { label: 'YOTTA', icon: '📡', name: 'Yotta (10^24)' },
    512: { label: 'RONNA', icon: '📡', name: 'Ronna (10^27)' },
    1024: { label: 'QUECCA', icon: '🔌', name: 'Quecca (10^30)' },
    2048: { label: 'SUPER', icon: '🔋', name: 'Super (10^33)' },
    4096: { label: 'HYPER', icon: '⚡', name: 'Hyper (10^36)' },
    8192: { label: 'ULTRA', icon: '☄️', name: 'Ultra (10^39)' },
    16384: { label: 'COSMIC', icon: '🛸', name: 'Cosmic (10^42)' },
    32768: { label: 'GALAX', icon: '🌌', name: 'Galactic (10^45)' },
    65536: { label: 'INF', icon: '♾️', name: 'Infinite (10^∞)' }
};

const ELEMENT_THEME = {
    2: { label: 'H', icon: '🎈', name: '水素 (1)' },
    4: { label: 'He', icon: '🎈', name: 'ヘリウム (2)' },
    8: { label: 'Li', icon: '🔋', name: 'リチウム (3)' },
    16: { label: 'Be', icon: '🟢', name: 'ベリリウム (4)' },
    32: { label: 'B', icon: '🧪', name: 'ホウ素 (5)' },
    64: { label: 'C', icon: '💎', name: '炭素 (6)' },
    128: { label: 'N', icon: '💨', name: '窒素 (7)' },
    256: { label: 'O', icon: '🤿', name: '酸素 (8)' },
    512: { label: 'F', icon: '🦷', name: 'フッ素 (9)' },
    1024: { label: 'Ne', icon: '🚨', name: 'ネオン (10)' },
    2048: { label: 'Na', icon: '🧂', name: 'ナトリウム (11)' },
    4096: { label: 'Mg', icon: '🎆', name: 'マグネシウム (12)' },
    8192: { label: 'Al', icon: '🥫', name: 'アルミニウム (13)' },
    16384: { label: 'Si', icon: '💻', name: 'ケイ素 (14)' },
    32768: { label: 'P', icon: '🔥', name: 'リン (15)' },
    65536: { label: 'S', icon: '🌋', name: '硫黄 (16)' }
};

const GUILD_THEME = {
    2: { label: 'F-Rk', icon: '🪵', name: 'Fランク (初心者)' },
    4: { label: 'E-Rk', icon: '🪵', name: 'Eランク (見習い)' },
    8: { label: 'D-Rk', icon: '🛡️', name: 'Dランク (一般)' },
    16: { label: 'C-Rk', icon: '⚔️', name: 'Cランク (中堅)' },
    32: { label: 'B-Rk', icon: '🏹', name: 'Bランク (精鋭)' },
    64: { label: 'A-Rk', icon: '🦅', name: 'Aランク (凄腕)' },
    128: { label: 'S-Rk', icon: '✨', name: 'Sランク (英雄)' },
    256: { label: 'SS', icon: '🌟', name: 'SSランク (大英雄)' },
    512: { label: 'SSS', icon: '☄️', name: 'SSSランク (伝説)' },
    1024: { label: 'Mstr', icon: '👑', name: 'マスター (王)' },
    2048: { label: 'GrMd', icon: '💫', name: 'グランドマスター' },
    4096: { label: 'Hero', icon: '🗡️', name: 'ブレイブヒーロー' },
    8192: { label: 'Lgnd', icon: '🐉', name: 'レジェンド' },
    16384: { label: 'Myth', icon: '🔱', name: '神話' },
    32768: { label: 'Demi', icon: '☀️', name: '半神' },
    65536: { label: 'God', icon: '👁️', name: '絶対神' }
};

class MergeGame extends LogiqGames.GameBase {
    // マージゲーム固有のスキン
    static SKINS = {
        numbers: { name: 'クラシック・ナンバー', icon: '128', desc: '標準の数字スキンです。', price: 0 },
        celestial: { name: '天体・宇宙進化', icon: '🌍', desc: '宇宙の塵からブラックホールへの進化。', price: 1000 },
        gems: { name: 'ファンタジー・ジェム', icon: '💎', desc: '原石から美しい宝石、超結晶へ。', price: 3000 },
        kanji_large: { name: '和風・大数単位', icon: '🎴', desc: '万、億、兆から無量大数へ至る巨大数の歴史。', price: 1500 },
        kanji_small: { name: '和風・極小単位', icon: '⏱️', desc: '割、分、厘から刹那へと至るミクロの領域。', price: 1500 },
        si_prefix: { name: '情報・SI接頭辞', icon: '💾', desc: 'KILO, MEGA, GIGAから無限の容量へ。', price: 2000 },
        element: { name: '科学・元素記号', icon: '🧪', desc: '水素（H）から硫黄（S）までの核融合反応。', price: 2500 },
        guild: { name: '冒険者ギルド・ランク', icon: '🛡️', desc: '木炭のF級から神話の絶対神へ至る階級闘争。', price: 3000 }
    };

    // マージゲーム固有の縦型スキルツリー (15個のアビリティ)
    static SKILLS = {
        core: { name: 'アビリティコア', icon: '🧠', desc: 'メインアビリティモジュール。ツリーの起点となります。', price: 0 },
        boost: { name: 'スタート・ブースト', icon: '🚀', desc: '最初からレベル2 (値8) のタイルが2枚配置された状態で開始します。', price: 800, parent: 'core' },
        undo: { name: 'コズミック・リワインド', icon: '↩️', desc: 'ゲーム中に一手戻す（巻き戻し）機能を使用可能にします。', price: 1200, parent: 'core' },
        grid5x5: { name: '5x5 Grid', icon: '5x5', desc: 'プレイ領域を5x5マスに拡張し、難易度を大幅に下げます。', price: 2000, parent: 'boost' },
        score1: { name: 'インテリジェンス・ゲイン I', icon: '➕', desc: 'ゲーム中に獲得できるスコアが常に10%アップします。', price: 600, parent: 'boost' },
        shuffle: { name: '次元シャッフル', icon: '🔀', desc: '手詰まり時に一度だけ、盤面のタイル位置をシャッフルできます。', price: 1500, parent: 'undo' },
        ad_skip: { name: 'CPボーナス・アクセラレータ', icon: '📺', desc: 'ゲームクリアまたはゲームオーバー時の獲得CPが常に20%アップします。', price: 800, parent: 'undo' },
        score2: { name: 'インテリジェンス・ゲイン II', icon: '⭐', desc: 'ゲーム中に獲得できるスコアが常に20%アップします。', price: 1200, parent: 'score1' },
        time_limit: { name: 'タイム・ダイレーション', icon: '⏳', desc: '思考測定モードの制限時間を15秒延長します。', price: 700, parent: 'score1' },
        combo: { name: 'コンボ・シンギュラリティ', icon: '⚡', desc: '連続でマージが発生した際のコンボスコアボーナスを2倍にします。', price: 1000, parent: 'shuffle' },
        saver: { name: 'オート・セーバー', icon: '🛡️', desc: '手詰まりになった際、自動的に一度だけ下位タイルを消滅させ延命します。', price: 1600, parent: 'shuffle' },
        score3: { name: 'インテリジェンス・ゲイン III', icon: '👑', desc: 'ゲーム中に獲得できるスコアが常に30%アップします。', price: 2200, parent: 'score2' },
        mastery: { name: 'マインド・マスタリー', icon: '🎓', desc: '最終的な測定評価時、算出されるIQ値に+5のボーナスを加算します。', price: 1800, parent: 'time_limit' },
        collector: { name: 'コスモ・コレクター', icon: '🔍', desc: '未アンロックの新種タイル（宇宙図鑑）が出現する確率を上昇させます。', price: 1500, parent: 'combo' },
        god_mode: { name: 'ゴッド・モード', icon: '👁️', desc: '全知全能の領域。ゲームプレイで獲得できるCPが常に50%アップします。', price: 3000, parent: 'saver' }
    };

    constructor(containerElement, options) {
        super(containerElement, options);

        this.currentSkin = options.currentSkin || 'numbers';
        this.highScore = options.highScore || 0;
        this.gridSize = options.gridSize || 4; // 動的サイズ (4 or 5)
        this.boost = options.boost || false;   // スタートブーストの有無
        this.hasUndo = options.hasUndo || false;   // アビリティによる巻き戻しの有無
        this.hasShuffle = options.hasShuffle || false; // アビリティによるシャッフルの有無
        
        this.onScoreChange = options.onScoreChange;
        this.onMovesChange = options.onMovesChange;
        this.onUnlockCallback = options.onUnlockCallback;
        this.saveStateCallback = options.saveStateCallback;

        this.tiles = [];
        this.tileIdCounter = 0;
        this.moves = 0;
        this.score = 0;
        this.isMoving = false;
        this.targetValue = 128;
        this.isEndless = false;
        this.historyState = null;
        this.hasUsedShuffle = false; // 今回のプレイでシャッフルを使用したかフラグ

        // タッチ操作用
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.boundTouchStart = this.handleTouchStart.bind(this);
        this.boundTouchEnd = this.handleTouchEnd.bind(this);
    }

    startNewGame() {
        this.tiles = [];
        this.tileIdCounter = 0;
        this.moves = 0;
        this.score = 0;
        this.gameActive = true;
        this.isMoving = false;
        this.targetValue = 128;
        this.isEndless = false;
        this.historyState = null;
        this.elapsedSeconds = 0;

        this.setupDOM();

        // 初期タイルのドロップ
        if (this.boost) {
            // ブースト有効時は初期値 8 を2枚配置
            this.addTileWithVal(8);
            this.addTileWithVal(8);
        } else {
            this.addRandomTile();
            this.addRandomTile();
        }
        
        this.updateTileDOM();
        this.startTimer();

        if (this.onScoreChange) this.onScoreChange(this.score, this.highScore);
        if (this.onMovesChange) this.onMovesChange(this.moves);
        this.saveGameState();
    }

    setupDOM() {
        // マス数に合わせて背景グリッドセルを動的生成
        let cellsHtml = '';
        const totalCells = this.gridSize * this.gridSize;
        for (let i = 0; i < totalCells; i++) {
            cellsHtml += '<div class="grid-cell"></div>';
        }

        // サイズに応じた gap と padding の設定
        const size = this.gridSize;
        const gap = size === 5 ? 6 : 8;
        const padding = size === 5 ? 8 : 10;

        // アビリティに応じたボタンの制御
        const undoText = this.hasUndo ? '↩️ REWIND' : '🔒 REWIND (LOCKED)';
        const undoClass = (this.hasUndo && this.historyState) ? 'undo-btn' : 'undo-btn disabled';
        
        // シャッフルボタン（アビリティ所持かつ未試行の時のみ表示）
        let shuffleBtnHtml = '';
        if (this.hasShuffle) {
            const shuffleClass = this.hasUsedShuffle ? 'undo-btn disabled' : 'undo-btn';
            shuffleBtnHtml = `
                <button id="shuffle-btn" class="${shuffleClass}" onclick="app.activeGameInstance.executeShuffle()" style="background-color: var(--accent); color: white; border-color: var(--accent);">
                    <span>🔀 SHUFFLE</span>
                </button>
            `;
        }

        this.containerElement.innerHTML = `
            <div class="merge-wrapper">
                <div class="merge-controls" style="display:flex; justify-content:space-between; width:300px; margin-bottom:4px; gap: 6px;">
                    <button id="reset-btn" class="undo-btn" onclick="app.activeGameInstance.confirmReset()">
                        <span>RESET</span>
                    </button>
                    ${shuffleBtnHtml}
                    <button id="undo-btn" class="${undoClass}" onclick="app.activeGameInstance.executeUndoFromUI()">
                        <span>${undoText}</span>
                    </button>
                </div>
                <div id="grid-board" class="grid-board theme-${this.currentSkin}" style="grid-template-columns: repeat(${this.gridSize}, 1fr); grid-template-rows: repeat(${this.gridSize}, 1fr); gap: ${gap}px; padding: ${padding}px;">
                    ${cellsHtml}
                </div>
            </div>
        `;

        this.boardElement = this.containerElement.querySelector('#grid-board');
        this.boardElement.addEventListener('touchstart', this.boundTouchStart, { passive: true });
        this.boardElement.addEventListener('touchend', this.boundTouchEnd, { passive: true });
    }

    confirmReset() {
        if (confirm('ゲームを最初からやり直しますか？\n（スコアと手数はリセットされます）')) {
            localStorage.removeItem('logiq_save_game');
            this.startNewGame();
        }
    }

    handleKeyDown(e) {
        if (!this.gameActive || this.isMoving) return;
        const map = {
            ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
            w: 'up', s: 'down', a: 'left', d: 'right'
        };
        const dir = map[e.key];
        if (dir) {
            e.preventDefault();
            this.handleInput(dir);
        }
    }

    handleTouchStart(e) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
    }

    handleTouchEnd(e) {
        if (!this.gameActive || this.isMoving) return;
        const dx = e.changedTouches[0].clientX - this.touchStartX;
        const dy = e.changedTouches[0].clientY - this.touchStartY;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 30) return;
        this.handleInput(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
    }

    addTileWithVal(val) {
        const idx = this.getRandomEmptyIndex();
        if (idx !== -1) {
            this.tiles.push({
                id: this.tileIdCounter++,
                value: val,
                row: Math.floor(idx / this.gridSize),
                col: idx % this.gridSize,
                isNew: true,
                merged: false,
                toBeDeleted: false,
                mergedThisTurn: false,
                mergedIntoId: undefined
            });
        }
    }

    getRandomEmptyIndex() {
        const occupied = new Set();
        this.tiles.forEach(t => {
            if (!t.toBeDeleted) occupied.add(t.row * this.gridSize + t.col);
        });

        const empty = [];
        const totalCells = this.gridSize * this.gridSize;
        for (let i = 0; i < totalCells; i++) {
            if (!occupied.has(i)) empty.push(i);
        }
        return empty.length > 0 ? empty[Math.floor(Math.random() * empty.length)] : -1;
    }

    addRandomTile() {
        const idx = this.getRandomEmptyIndex();
        if (idx !== -1) {
            // 出現確率の調整: 2 (80%) / 4 (17%) / 8 (3%)
            let value = 2;
            const r = Math.random();
            if (r < 0.80) {
                value = 2;
            } else if (r < 0.97) {
                value = 4;
            } else {
                value = 8;
            }

            const newTile = {
                id: this.tileIdCounter++,
                value: value,
                row: Math.floor(idx / this.gridSize),
                col: idx % this.gridSize,
                isNew: true,
                merged: false,
                toBeDeleted: false,
                mergedThisTurn: false,
                mergedIntoId: undefined
            };
            this.tiles.push(newTile);
            if (this.onUnlockCallback) this.onUnlockCallback(newTile.value);
            return newTile;
        }
        return null;
    }

    updateTileDOM() {
        if (!this.boardElement) return;

        // グリッドサイズ（4 or 5）に合わせてタイルサイズと余白を動的計算
        const size = this.gridSize;
        const cellSize = size === 5 ? 52 : 64; // 5x5時は300pxの幅に合わせるため52pxが最適値
        const gap = size === 5 ? 6 : 8;
        const padding = size === 5 ? 8 : 10;

        const existingDOMs = {};
        this.boardElement.querySelectorAll('.tile').forEach(el => {
            existingDOMs[el.dataset.id] = el;
        });

        this.tiles.forEach(tile => {
            const x = padding + tile.col * (cellSize + gap);
            const y = padding + tile.row * (cellSize + gap);

            let theme = { label: String(tile.value), icon: '' };
            if (this.currentSkin === 'celestial') theme = CELESTIAL_THEME[tile.value] || { label: 'Cosmos', icon: '🌌' };
            else if (this.currentSkin === 'gems')  theme = GEMS_THEME[tile.value]      || { label: 'Jewel',  icon: '💎' };
            else if (this.currentSkin === 'kanji_large') theme = KANJI_LARGE_THEME[tile.value] || { label: '無量', icon: '👁️' };
            else if (this.currentSkin === 'kanji_small') theme = KANJI_SMALL_THEME[tile.value] || { label: '刹那', icon: '⚡' };
            else if (this.currentSkin === 'si_prefix')   theme = SI_PREFIX_THEME[tile.value]   || { label: 'INF', icon: '♾️' };
            else if (this.currentSkin === 'element')     theme = ELEMENT_THEME[tile.value]     || { label: 'S', icon: '🌋' };
            else if (this.currentSkin === 'guild')       theme = GUILD_THEME[tile.value]       || { label: 'God', icon: '👁️' };

            let tileEl = existingDOMs[tile.id];

            if (!tileEl) {
                tileEl = document.createElement('div');
                tileEl.dataset.id   = tile.id;
                tileEl.dataset.value = tile.value;
                tileEl.dataset.skin  = this.currentSkin;
                tileEl.innerHTML = `
                    <span class="tile-number">${tile.value}</span>
                    <span class="tile-icon">${theme.icon}</span>
                    <span class="tile-label">${theme.label}</span>
                `;
                tileEl.className = `tile theme-${this.currentSkin} tile-${tile.value}${tile.toBeDeleted ? ' tile-to-delete' : ''}${tile.isNew ? ' tile-new' : ''}`;
                
                // 動的マスサイズ用のCSS変数をインラインで設定
                tileEl.style.setProperty('--tile-size', `${cellSize}px`);
                tileEl.style.setProperty('--x', `${x}px`);
                tileEl.style.setProperty('--y', `${y}px`);
                tileEl.style.transform = `translate(${x}px, ${y}px)`;
                
                this.boardElement.appendChild(tileEl);
                if (tile.isNew) tile.isNew = false;
            } else {
                tileEl.style.setProperty('--tile-size', `${cellSize}px`);
                tileEl.style.setProperty('--x', `${x}px`);
                tileEl.style.setProperty('--y', `${y}px`);
                tileEl.style.transform = `translate(${x}px, ${y}px)`;

                if (tile.toBeDeleted) {
                    tileEl.classList.add('tile-to-delete');
                } else {
                    tileEl.classList.remove('tile-to-delete');
                }

                const domValue = tileEl.dataset.value;
                const domSkin  = tileEl.dataset.skin;
                if (domValue !== String(tile.value) || domSkin !== this.currentSkin || tile.merged) {
                    tileEl.dataset.value = tile.value;
                    tileEl.dataset.skin  = this.currentSkin;
                    tileEl.innerHTML = `
                        <span class="tile-number">${tile.value}</span>
                        <span class="tile-icon">${theme.icon}</span>
                        <span class="tile-label">${theme.label}</span>
                    `;
                    let cls = `tile theme-${this.currentSkin} tile-${tile.value}`;
                    if (tile.merged) { cls += ' tile-merged'; tile.merged = false; }
                    tileEl.className = cls;
                } else {
                    tileEl.classList.remove('tile-merged');
                    tileEl.classList.remove('tile-new');
                }
            }
        });

        const activeIds = new Set(this.tiles.map(t => String(t.id)));
        Object.keys(existingDOMs).forEach(id => {
            if (!activeIds.has(id)) {
                const el = existingDOMs[id];
                if (el.parentNode === this.boardElement) this.boardElement.removeChild(el);
            }
        });

        const evIndicator = document.getElementById('evolution-indicator');
        if (evIndicator) this.updateEvolutionIndicatorUI(evIndicator);
    }

    handleInput(direction) {
        if (!this.gameActive || this.isMoving) return;

        this.tiles.forEach(t => {
            const el = this.boardElement?.querySelector(`[data-id="${t.id}"]`);
            if (el) el.classList.remove('tile-new', 'tile-merged');
        });
        if (this.boardElement) void this.boardElement.offsetWidth;

        const tempHistory = {
            tiles: JSON.parse(JSON.stringify(this.tiles)),
            moves: this.moves,
            score: this.score
        };

        this.tiles.forEach(t => {
            t.mergedThisTurn = false;
            t.toBeDeleted    = false;
            t.mergedIntoId   = undefined;
            t.isNew          = false;
            t.merged         = false;
        });

        const pos2tile = {};
        this.tiles.forEach(t => { pos2tile[`${t.row},${t.col}`] = t; });

        const getTileAt = (r, c) => pos2tile[`${r},${c}`] ?? null;

        const moveTileInMap = (tile, newR, newC) => {
            delete pos2tile[`${tile.row},${tile.col}`];
            tile.row = newR;
            tile.col = newC;
            pos2tile[`${newR},${newC}`] = tile;
        };

        // 走査順序を gridSize に応じて生成
        const order = [];
        for (let i = 0; i < this.gridSize; i++) order.push(i);
        const revOrder = [...order].reverse();

        const rowOrder = direction === 'down'  ? revOrder : order;
        const colOrder = direction === 'right' ? revOrder : order;
        const dR = direction === 'up' ? -1 : direction === 'down'  ?  1 : 0;
        const dC = direction === 'left' ? -1 : direction === 'right' ?  1 : 0;

        let moved = false;
        let scoreGain = 0;
        const mergePopups = [];

        rowOrder.forEach(r => {
            colOrder.forEach(c => {
                const tile = getTileAt(r, c);
                if (!tile || tile.toBeDeleted) return;

                let curR = tile.row;
                let curC = tile.col;

                while (true) {
                    const nR = curR + dR;
                    const nC = curC + dC;
                    if (nR < 0 || nR >= this.gridSize || nC < 0 || nC >= this.gridSize) break;

                    const neighbor = getTileAt(nR, nC);

                    if (neighbor === null) {
                        moveTileInMap(tile, nR, nC);
                        curR = nR; curC = nC;
                        moved = true;
                    } else if (
                        neighbor.value === tile.value &&
                        !neighbor.mergedThisTurn &&
                        !neighbor.toBeDeleted
                    ) {
                        delete pos2tile[`${nR},${nC}`];
                        moveTileInMap(tile, nR, nC);

                        neighbor.value         *= 2;
                        neighbor.merged         = true;
                        neighbor.mergedThisTurn = true;
                        scoreGain              += neighbor.value;

                        tile.toBeDeleted = true;
                        pos2tile[`${nR},${nC}`] = neighbor;

                        moved = true;
                        if (this.onUnlockCallback) this.onUnlockCallback(neighbor.value);

                        const size = this.gridSize;
                        const cellSize = size === 5 ? 50 : 64;
                        const gap = size === 5 ? 6 : 8;
                        const padding = size === 5 ? 8 : 10;
                        mergePopups.push({
                            value: neighbor.value,
                            x: padding + neighbor.col * (cellSize + gap),
                            y: padding + neighbor.row * (cellSize + gap)
                        });
                        break;
                    } else {
                        break;
                    }
                }
            });
        });

        if (!moved) return;

        if (scoreGain > 0) {
            this.score += scoreGain;
            if (this.score > this.highScore) this.highScore = this.score;
            if (this.onScoreChange) this.onScoreChange(this.score, this.highScore);
        }

        this.isMoving = true;
        this.historyState = tempHistory;
        this.moves++;
        if (this.onMovesChange) this.onMovesChange(this.moves);
        this.updateUndoButtonState();

        this.updateTileDOM();

        setTimeout(() => {
            this.tiles = this.tiles.filter(t => !t.toBeDeleted);
            this.tiles.forEach(t => { t.mergedThisTurn = false; });

            mergePopups.forEach(m => this.showBoardScorePopup(m.value, m.x, m.y));

            this.addRandomTile();
            this.updateTileDOM();
            this.saveGameState();

            if (this.checkWin()) {
                this.gameActive = false;
                this.isMoving   = false;
                this.stopTimer();
                
                // すぐ画面が切り替わって消えたように見えるのを防ぐため、クリア演出後に遷移
                app.showToast('🎉 目標達成！知性分析へ移行します...');
                setTimeout(() => {
                    if (this.onGameWin) this.onGameWin(this.score, this.elapsedSeconds, this.moves);
                }, 1500);
            } else if (this.checkGameOver()) {
                this.gameActive = false;
                this.isMoving   = false;
                this.stopTimer();
                if (this.onGameOver) this.onGameOver(this.score);
            } else {
                this.isMoving = false;
            }
        }, 140);
    }

    checkWin() {
        if (this.isEndless) return false;
        return this.tiles.some(t => t.value >= this.targetValue && !t.toBeDeleted);
    }

    checkGameOver() {
        const occupied = new Set(this.tiles.map(t => `${t.row},${t.col}`));
        if (occupied.size < (this.gridSize * this.gridSize)) return false;

        const grid = {};
        this.tiles.forEach(t => { grid[`${t.row},${t.col}`] = t.value; });

        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                const v = grid[`${r},${c}`];
                if (c < (this.gridSize - 1) && v === grid[`${r},${c+1}`]) return false;
                if (r < (this.gridSize - 1) && v === grid[`${r+1},${c}`]) return false;
            }
        }
        return true;
    }

    updateEvolutionIndicatorUI(container) {
        if (!container) return;

        let themeDb = null;
        let unlockedList = [];

        if (this.currentSkin === 'celestial') {
            themeDb = CELESTIAL_THEME;
            unlockedList = JSON.parse(localStorage.getItem('logiq_unlocked_celestials') || '["2","4"]');
        } else if (this.currentSkin === 'gems') {
            themeDb = GEMS_THEME;
            unlockedList = JSON.parse(localStorage.getItem('logiq_unlocked_gems') || '["2","4"]');
        } else if (this.currentSkin === 'kanji_large') {
            themeDb = KANJI_LARGE_THEME;
            unlockedList = JSON.parse(localStorage.getItem('logiq_unlocked_kanji_large') || '["2","4"]');
        } else if (this.currentSkin === 'kanji_small') {
            themeDb = KANJI_SMALL_THEME;
            unlockedList = JSON.parse(localStorage.getItem('logiq_unlocked_kanji_small') || '["2","4"]');
        } else if (this.currentSkin === 'si_prefix') {
            themeDb = SI_PREFIX_THEME;
            unlockedList = JSON.parse(localStorage.getItem('logiq_unlocked_si_prefix') || '["2","4"]');
        } else if (this.currentSkin === 'element') {
            themeDb = ELEMENT_THEME;
            unlockedList = JSON.parse(localStorage.getItem('logiq_unlocked_element') || '["2","4"]');
        } else if (this.currentSkin === 'guild') {
            themeDb = GUILD_THEME;
            unlockedList = JSON.parse(localStorage.getItem('logiq_unlocked_guild') || '["2","4"]');
        }

        if (!Array.isArray(unlockedList)) unlockedList = [];

        const values = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536];
        let html = '';

        values.forEach((val, idx) => {
            let displayIcon = '';
            if (this.currentSkin === 'numbers') {
                displayIcon = String(val);
            } else {
                const isUnlocked = unlockedList.includes(String(val));
                displayIcon = (isUnlocked && themeDb && themeDb[val]) ? themeDb[val].icon : '❓';
            }
            
            html += `<div class="evo-step" style="background-color:rgba(255,255,255,0.15); width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; flex-shrink:0; border: 1px solid rgba(255,255,255,0.1);" title="${themeDb && themeDb[val] ? themeDb[val].name : val}"><span class="evo-icon">${displayIcon}</span></div>`;
            if (idx < values.length - 1) html += '<span class="evo-arrow" style="font-size:10px; color:var(--text-light); flex-shrink:0; margin: 0 -2px;">➔</span>';
        });

        container.innerHTML = html;
    }

    updateUndoButtonState() {
        const undoBtn = this.containerElement.querySelector('#undo-btn');
        if (undoBtn) {
            const canUndo = this.hasUndo && this.historyState;
            undoBtn.className = canUndo ? 'undo-btn' : 'undo-btn disabled';
        }
    }

    executeUndoFromUI() {
        if (!this.hasUndo) {
            app.showToast('🔒 コズミック・リワインド アビリティが必要です');
            return;
        }
        if (!this.historyState) {
            app.showToast('巻き戻す履歴がありません。');
            return;
        }
        this.executeUndo();
        app.showToast('↩️ 1手巻き戻しました！');
    }

    executeShuffle() {
        if (!this.hasShuffle) return;
        if (this.hasUsedShuffle) {
            app.showToast('シャッフルは1プレイにつき1回までです。');
            return;
        }

        // 盤面上のすべてのタイルの行 (row) と列 (col) をランダムな位置に再配置
        const totalCells = this.gridSize * this.gridSize;
        const indices = [];
        for (let i = 0; i < totalCells; i++) indices.push(i);
        
        // シャッフル
        indices.sort(() => Math.random() - 0.5);

        this.tiles.forEach((tile, idx) => {
            const newPos = indices[idx];
            tile.row = Math.floor(newPos / this.gridSize);
            tile.col = newPos % this.gridSize;
        });

        this.hasUsedShuffle = true;
        this.updateTileDOM();
        
        // UIのシャッフルボタンを無効化
        const shuffleBtn = this.containerElement.querySelector('#shuffle-btn');
        if (shuffleBtn) {
            shuffleBtn.className = 'undo-btn disabled';
        }

        app.showToast('🔀 次元シャッフルを発動しました！');
        this.saveGameState();
    }

    executeUndo() {
        if (!this.historyState) { this.isMoving = false; return; }

        this.tiles = JSON.parse(JSON.stringify(this.historyState.tiles));
        this.moves = this.historyState.moves;
        this.score = this.historyState.score;

        if (this.onScoreChange) this.onScoreChange(this.score, this.highScore);
        if (this.onMovesChange) this.onMovesChange(this.moves);

        this.updateTileDOM();

        this.historyState = null;
        this.updateUndoButtonState();
        this.isMoving = false;
        this.saveGameState();
    }

    continueEndless() {
        this.targetValue = 9999999;
        this.isEndless   = true;
        this.gameActive  = true;
        this.isMoving    = false;
        this.historyState = null;
        this.updateUndoButtonState();
        this.saveGameState();
        this.startTimer();
    }

    showBoardScorePopup(amount, x, y) {
        if (!this.boardElement) return;
        const popup = document.createElement('div');
        popup.className = 'board-score-popup';
        popup.innerText = `+${amount}`;
        popup.style.left = `${x + 40}px`;
        popup.style.top  = `${y - 5}px`;
        this.boardElement.appendChild(popup);
        setTimeout(() => {
            if (popup.parentNode === this.boardElement) this.boardElement.removeChild(popup);
        }, 800);
    }

    saveGameState() {
        if (this.saveStateCallback) {
            this.saveStateCallback({
                tiles: this.tiles,
                score: this.score,
                moves: this.moves,
                isEndless: this.isEndless,
                targetValue: this.targetValue,
                gameActive: this.gameActive,
                gridSize: this.gridSize
            });
        }
    }

    loadGameState(saveData) {
        this.tiles = saveData.tiles;
        this.tiles.forEach(t => {
            t.isNew          = false;
            t.merged         = false;
            t.toBeDeleted    = false;
            t.mergedThisTurn = false;
            t.mergedIntoId   = undefined;
        });

        this.score       = saveData.score;
        this.moves       = saveData.moves;
        this.isEndless   = saveData.isEndless;
        this.targetValue = saveData.targetValue;
        this.gameActive  = true;
        this.isMoving    = false;
        this.gridSize    = saveData.gridSize || this.gridSize; // セーブデータからグリッドサイズを復元
        this.startTime   = Date.now();
        this.historyState = null;

        this.setupDOM();
        this.updateTileDOM();
        this.updateUndoButtonState();

        this.startTimer();

        if (this.onScoreChange) this.onScoreChange(this.score, this.highScore);
        if (this.onMovesChange) this.onMovesChange(this.moves);
    }

    destroy() {
        if (this.boardElement) {
            this.boardElement.removeEventListener('touchstart', this.boundTouchStart);
            this.boardElement.removeEventListener('touchend', this.boundTouchEnd);
        }
        super.destroy();
    }
}

// 共通ネームスペースに登録
window.LogiqGames.MergeGame = MergeGame;
