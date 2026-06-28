/**
 * LogiQ - Main Application Controller
 * 全体の画面遷移、ロビー制御、およびゲームモジュールの管理を担当
 */
class App {
    constructor() {
        this.currentGameType = null;
        this.currentGameConfig = null;
        this.activeGameInstance = null;

        // ハイスコアと最高IQの管理
        this.highScores = {
            merge: parseInt(localStorage.getItem('logiq_merge_highscore') || '0'),
            king: parseInt(localStorage.getItem('logiq_king_highscore') || '0'),
            mastermind: parseInt(localStorage.getItem('logiq_einstein_highscore') || '0'),
            nonogram: parseInt(localStorage.getItem('logiq_nonogram_highscore') || '0'),
            einstein: parseInt(localStorage.getItem('logiq_einstein_highscore') || '0'),
            hashi: parseInt(localStorage.getItem('logiq_hashi_highscore') || '0')
        };

        this.highestIQs = {
            merge: localStorage.getItem('logiq_merge_highest_iq') || '---',
            king: localStorage.getItem('logiq_king_highest_iq') || '---',
            mastermind: localStorage.getItem('logiq_einstein_highest_iq') || '---',
            nonogram: localStorage.getItem('logiq_nonogram_highest_iq') || '---',
            einstein: localStorage.getItem('logiq_einstein_highest_iq') || '---',
            hashi: localStorage.getItem('logiq_hashi_highest_iq') || '---'
        };

        // 所持ポイント (CP)
        this.points = parseInt(localStorage.getItem('logiq_points') || '0');

        // サブシステム初期化
        this.achievements = new window.LogiqGames.AchievementsSystem(this);

        // コレクション（図鑑）タブ状態
        this.currentCollectionTab = 'celestial';

        // 図鑑のアンロックリスト (Mergeゲーム用)
        this.unlockedCelestials = JSON.parse(localStorage.getItem('logiq_unlocked_celestials') || '["2", "4"]');
        this.unlockedGems = JSON.parse(localStorage.getItem('logiq_unlocked_gems') || '["2", "4"]');
        this.unlockedKanjiLarge = JSON.parse(localStorage.getItem('logiq_unlocked_kanji_large') || '["2", "4"]');
        this.unlockedKanjiSmall = JSON.parse(localStorage.getItem('logiq_unlocked_kanji_small') || '["2", "4"]');
        this.unlockedSiPrefix = JSON.parse(localStorage.getItem('logiq_unlocked_si_prefix') || '["2", "4"]');
        this.unlockedElement = JSON.parse(localStorage.getItem('logiq_unlocked_element') || '["2", "4"]');
        this.unlockedGuild = JSON.parse(localStorage.getItem('logiq_unlocked_guild') || '["2", "4"]');

        // 図鑑のアンロックリスト (Nexus Align用)
        this.unlockedQuantumCores = JSON.parse(localStorage.getItem('logiq_unlocked_quantum_cores') || '["easy"]');

        // 円形スキルツリーの選択中ノード
        this.selectedSkillId = 'core';
    }

    init() {
        this.renderLobbyGrid();
        this.renderPoints();
        this.showView('dashboard');
        this.achievements.checkAll();

        // キーボード操作の中継を復元
        window.addEventListener('keydown', (e) => {
            if (this.activeGameInstance && typeof this.activeGameInstance.handleKeyDown === 'function') {
                this.activeGameInstance.handleKeyDown(e);
            }
        });
    }

    showView(viewId) {
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        const targetView = document.getElementById(viewId);
        if (targetView) targetView.classList.add('active');

        // ダッシュボードに戻った時に数値を最新化
        if (viewId === 'dashboard') {
            this.renderLobbyGrid();
            this.renderPoints();
        }
    }

    renderPoints() {
        const el = document.getElementById('user-points');
        if (el) el.innerText = this.points;
        const lobbyEl = document.getElementById('lobby-points');
        if (lobbyEl) lobbyEl.innerText = this.points;
    }

    renderLobbyGrid() {
        const container = document.getElementById('games-list');
        if (!container) return;
        container.innerHTML = '';

        window.GAME_REGISTRY.forEach(cfg => {
            const card = document.createElement('div');
            card.className = 'game-card';
            card.style.borderLeft = `5px solid ${cfg.color}`;
            
            const high = this.highScores[cfg.id] || 0;
            const iq = this.highestIQs[cfg.id] || '---';

            card.innerHTML = `
                <div class="game-icon-circle" style="background-color: ${cfg.bgColor}; color: ${cfg.color};">
                    ${cfg.icon}
                </div>
                <div class="game-info" style="flex-grow: 1;">
                    <div class="card-header-info" style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 4px;">
                        <h3 style="font-size: 13px; font-weight: 700; color: var(--text-dark); margin: 0;">${cfg.name}</h3>
                        <span class="badge" style="background-color: ${cfg.bgColor}; color: ${cfg.color}; font-size: 8.5px; padding: 2px 6px; border-radius: 6px; white-space: nowrap; font-weight: 600;">${cfg.badge}</span>
                    </div>
                    <p style="font-size: 9.5px; color: var(--text-sub); margin: 0 0 8px 0; line-height: 1.3;">${cfg.desc}</p>
                    <div class="card-stats" style="display: flex; gap: 16px; border-top: 1px dashed rgba(0,0,0,0.05); padding-top: 6px;">
                        <div class="stat">
                            <span class="label" style="font-size: 7.5px; color: var(--text-sub); display: block; text-transform: uppercase; letter-spacing: 0.3px;">HIGH SCORE</span>
                            <span class="value" style="font-size: 11px; font-weight: 700; color: var(--text-dark);">${high}</span>
                        </div>
                        <div class="stat">
                            <span class="label" style="font-size: 7.5px; color: var(--text-sub); display: block; text-transform: uppercase; letter-spacing: 0.3px;">${cfg.iqLabel}</span>
                            <span class="value" style="font-size: 11px; font-weight: 700; color: var(--text-dark);">${iq}</span>
                        </div>
                    </div>
                </div>
            `;
            card.onclick = () => this.enterLobby(cfg.id);
            container.appendChild(card);
        });
    }

    enterLobby(gameId) {
        const cfg = window.GAME_REGISTRY.find(g => g.id === gameId);
        if (!cfg) return;

        this.currentGameType = gameId;
        this.currentGameConfig = cfg;

        const titleEl = document.getElementById('lobby-game-title');
        const descEl = document.getElementById('lobby-game-desc');
        const tabNav = document.querySelector('.lobby-tab-nav');
        const diffContainer = document.getElementById('lobby-difficulty-container');

        if (titleEl) titleEl.innerText = cfg.name;
        if (descEl) descEl.innerText = cfg.desc;

        // スキン・アビリティタブの表示制御（ゲームが対応している場合のみ）
        if (tabNav) tabNav.style.display = cfg.hasSkins ? 'flex' : 'none';

        // Nexus Align (king) の場合のみ難易度選択を表示
        if (diffContainer) {
            diffContainer.style.display = gameId === 'king' ? 'block' : 'none';
        }

        // ガイド説明の更新
        const ruleEl = document.getElementById('lobby-rule-content');
        if (ruleEl) {
            ruleEl.innerHTML = this.getLobbyRuleHTML(gameId);
        }

        this.checkSaveGame();
        this.switchLobbyTab('start'); // 初期タブは 'start' (START)
        this.showView('lobby-view');
    }

    switchLobbyTab(tabName) {
        document.querySelectorAll('#lobby-tab-nav .tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.id === `lobby-tab-btn-${tabName}`);
        });
        document.querySelectorAll('.lobby-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        const activeContent = document.getElementById(`lobby-tab-${tabName}`);
        if (activeContent) activeContent.classList.add('active');

        // タブ固有の動的描画
        if (tabName === 'skins') {
            this.updateShopUI();
        } else if (tabName === 'skills') {
            this.updateSkillsUI();
        } else if (tabName === 'collection') {
            this.renderCollectionGrid();
        } else if (tabName === 'achievements') {
            this.achievements.renderUI();
        }
    }

    getLobbyRuleHTML(gameId) {
        const rules = {
            merge: `
                <h3>ゲームルール</h3>
                <p>同じ数値（物質）のタイルを重ねることで、次の段階へと進化していきます。</p>
                <p class="highlight">・スワイプまたは矢印キーで全タイルがその方向へ移動<br>・同じ物質が衝突すると合体し、1つ上の物質に進化<br>・動くスペースがなくなると測定終了となります</p>
                <p>※アビリティ（SKILLS）を解放すると、初期グリッドを5x5に拡張したり、初期進化ブーストを得ることができます。</p>
            `,
            king: `
                <h3>ゲームルール</h3>
                <p>エネルギーグリッドを起動し、量子セクターにエネルギーコアを安定配置します。</p>
                <p class="highlight">
                ・各カラーセクターにちょうど1つ置く<br>
                ・同じ行、同じ列に重複して置けない<br>
                ・コアの周囲8マスに別のコアを隣接して置けない
                </p>
                <p>【オートプレイアシスト】<br>
                コア（🔮）を配置すると、干渉ルール上<b>絶対に他のコアを置けない範囲（周囲8マスと縦横十字ライン）に自動で目印が敷き詰められます！</b>
                </p>
                <p>【操作方法】<br>
                ・<span class="highlight">ダブルクリック:</span> コアを配置/解除<br>
                ・<span class="highlight">シングルクリック/スワイプ:</span> 選択した色の目印を配置/解除<br>
                ・<span class="highlight">1手戻る:</span> 左下のボタンで何回でも前の状態に戻せます
                </p>
                <p>※すべてのコアを矛盾なく配置できた時点で<b>自動的にクリア</b>となります。</p>
            `,
            mastermind: `
                <h3>ゲームルール</h3>
                <p>ヒント情報を元に、グリッドの各セルに正しい「記号」を配置していきます。</p>
                <p class="highlight">
                ・各行、各列に重複して同じ記号を置くことはできません<br>
                ・左側に表示されるヒントは、各行の配置ルールを示しています
                </p>
            `
        };
        return rules[gameId] || '<p>ルール情報がありません。</p>';
    }

    continueEndless() {
        if (this.activeGameInstance && typeof this.activeGameInstance.continueEndless === 'function') {
            this.activeGameInstance.continueEndless();
            
            // 結果画面モーダルを非表示にする
            const resView = document.getElementById('result-view');
            if (resView) {
                resView.classList.remove('active');
            }
        }
    }

    playGameFromLobby(forceNew = false) {
        const cfg = this.currentGameConfig;
        if (!cfg) return;

        const saveKey = cfg.id === 'merge' ? 'logiq_save_game' : cfg.id === 'king' ? 'logiq_save_king_game' : null;
        if (forceNew && saveKey) {
            localStorage.removeItem(saveKey);
        }

        this.setupActiveGameHeader();

        const container = document.getElementById('game-stage');
        container.innerHTML = ''; 

        if (this.activeGameInstance) {
            this.activeGameInstance.destroy();
            this.activeGameInstance = null;
        }

        const GameClass = window.LogiqGames[cfg.className];
        if (!GameClass) {
            console.error(`Game class ${cfg.className} not found.`);
            return;
        }

        const options = this.buildGameOptions(cfg.id);
        this.activeGameInstance = new GameClass(container, options);
        this.activeGameInstance.loadCSS(cfg.cssPath);

        // セーブデータの読み込み/新規開始の連携
        if (saveKey) {
            const raw = localStorage.getItem(saveKey);
            if (raw) {
                this.activeGameInstance.loadGameState(JSON.parse(raw));
            } else {
                this.activeGameInstance.startNewGame();
            }
        } else {
            this.activeGameInstance.startNewGame();
        }

        // 進化インジケーターの表示・非表示制御
        const evIndicator = document.getElementById('evolution-indicator');
        if (evIndicator) {
            evIndicator.style.display = cfg.id === 'merge' ? 'flex' : 'none';
        }

        // 操作ガイドテキストをゲームに応じて更新
        const guideText = document.getElementById('game-guide-text');
        if (guideText) {
            const guides = {
                merge: '← → ↑ ↓ キーまたはスワイプでタイルを移動。同じタイルが衝突すると合体します。',
                king: 'ダブルクリックでコアを配置 / シングルクリックで目印を配置。全コアを矛盾なく置くとクリア。'
            };
            guideText.innerText = guides[cfg.id] || '';
        }

        this.showView('game-view');
    }

    setupActiveGameHeader() {
        const titleEl = document.getElementById('active-game-title');
        if (titleEl) titleEl.innerText = this.currentGameConfig.name;

        const statsHeader = document.getElementById('game-stats-header');
        if (!statsHeader) return;
        statsHeader.innerHTML = '';

        this.currentGameConfig.stats.forEach(st => {
            const box = document.createElement('div');
            box.className = 'header-stat';
            box.innerHTML = `
                <span class="label">${st.label}</span>
                <span id="${st.valId}">${st.fallback}</span>
            `;
            statsHeader.appendChild(box);
        });

        // BESTスコア欄を追加
        const gameId = this.currentGameConfig.id;
        const best = this.highScores[gameId] || 0;
        if (best > 0) {
            const bestBox = document.createElement('div');
            bestBox.className = 'header-stat';
            bestBox.id = 'stat-best-box';
            bestBox.innerHTML = `
                <span class="label">BEST</span>
                <span id="stat-best-value">${best}</span>
            `;
            statsHeader.appendChild(bestBox);
        }
    }

    buildGameOptions(gameId) {
        const base = {
            onGameOver: (score) => this.handleGameOver(gameId, score),
            onGameWin: (score, timeSec, moves, extra) => this.handleGameWin(gameId, score, timeSec, moves, extra),
            onTimeChange: (sec) => {
                const el = document.getElementById(`${gameId}-time`);
                if (el) el.innerText = this.formatTime(sec);
            }
        };

        const GameClass = window.LogiqGames[this.currentGameConfig.className];
        const baseSkills = {};

        // ゲーム専用のアビリティ（SKILLS）の有効無効設定を渡す
        if (GameClass && GameClass.SKILLS) {
            Object.keys(GameClass.SKILLS).forEach(nodeId => {
                const active = localStorage.getItem(`logiq_skill_${gameId}_${nodeId}`) === 'active';
                baseSkills[nodeId] = active;
            });
        }

        if (gameId === 'merge') {
            const activeSkin = localStorage.getItem('logiq_current_skin') || 'numbers';
            return Object.assign(base, {
                currentSkin: activeSkin,
                boost: baseSkills.boost || false,
                gridSize: baseSkills.grid5x5 ? 5 : 4,
                hasUndo: baseSkills.undo || false,
                hasShuffle: baseSkills.shuffle || false,
                onScoreChange: (score) => {
                    const el = document.getElementById('merge-score');
                    if (el) el.innerText = score;
                },
                onMovesChange: (moves) => {
                    const el = document.getElementById('merge-moves');
                    if (el) el.innerText = moves;
                },
                saveStateCallback: (data) => localStorage.setItem('logiq_save_game', JSON.stringify(data))
            });
        }

        if (gameId === 'king') {
            const diffSelect = document.getElementById('lobby-difficulty-select');
            const difficulty = diffSelect ? diffSelect.value : 'normal';
            const activeSkin = localStorage.getItem('logiq_current_king_skin') || 'nexus_classic';

            return Object.assign(base, {
                difficulty: difficulty,
                currentSkin: activeSkin,
                onMovesChange: (placed, total) => {
                    const el = document.getElementById('king-count');
                    if (el) el.innerText = `${placed}/${total}`;
                },
                onAttemptsChange: (attempts) => {
                    const el = document.getElementById('king-attempts');
                    if (el) el.innerText = attempts;
                },
                saveStateCallback: (data) => localStorage.setItem('logiq_save_king_game', JSON.stringify(data))
            });
        }

        return base;
    }

    handleGameWin(gameId, score, timeSec, moves, extra) {
        let iq = 100;
        if (gameId === 'merge') {
            iq = this.calcMergeIQ(timeSec, moves).iq;
        } else if (gameId === 'king') {
            // Nexus Align 難易度別評価モデル (extra = difficulty)
            const difficulty = extra || 'normal';
            if (difficulty === 'easy') {
                iq = Math.max(60, Math.min(115, 100 + Math.round((60 - timeSec) / 2) - moves * 3));
            } else if (difficulty === 'hard') {
                iq = Math.max(80, Math.min(145, 130 + Math.round((300 - timeSec) / 6) - moves * 5));
            } else if (difficulty === 'expert') {
                iq = Math.max(90, Math.min(160, 145 + Math.round((720 - timeSec) / 12) - moves * 6));
            } else {
                iq = Math.max(70, Math.min(130, 115 + Math.round((150 - timeSec) / 4) - moves * 4));
            }
        }

        const percent = this.iqToPercentile(iq);
        const cp = Math.round(score * 0.3);
        this.points += cp;
        localStorage.setItem('logiq_points', this.points);

        // コレクションの自動登録
        if (gameId === 'king') {
            const difficulty = extra || 'normal';
            if (!this.unlockedQuantumCores.includes(difficulty)) {
                this.unlockedQuantumCores.push(difficulty);
                localStorage.setItem('logiq_unlocked_quantum_cores', JSON.stringify(this.unlockedQuantumCores));
                const names = { easy: 'タキオン・コア', normal: 'ダークマター・コア', hard: '超弦特異点', expert: '多次元ワームホール' };
                this.showToast(`量子コア図鑑に登録: 【${names[difficulty]}】発見！`);
            }
        }

        // Mergeゲームのコレクション（進化の過程）自動登録
        if (gameId === 'merge' && this.activeGameInstance) {
            const maxVal = Math.max(...(this.activeGameInstance.tiles || []).map(t => t.value), 0);
            const vals = [2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536];
            // インスタンスプロパティとlocalStorageキーのマッピング
            const collectionMap = [
                { prop: 'unlockedCelestials', lsKey: 'logiq_unlocked_celestials' },
                { prop: 'unlockedGems',       lsKey: 'logiq_unlocked_gems' },
                { prop: 'unlockedKanjiLarge', lsKey: 'logiq_unlocked_kanji_large' },
                { prop: 'unlockedKanjiSmall', lsKey: 'logiq_unlocked_kanji_small' },
                { prop: 'unlockedSiPrefix',   lsKey: 'logiq_unlocked_si_prefix' },
                { prop: 'unlockedElement',    lsKey: 'logiq_unlocked_element' },
                { prop: 'unlockedGuild',      lsKey: 'logiq_unlocked_guild' }
            ];
            let newlyUnlocked = [];
            collectionMap.forEach(({ prop, lsKey }) => {
                const list = this[prop];
                let changed = false;
                vals.forEach(v => {
                    if (v <= maxVal && !list.includes(String(v))) {
                        list.push(String(v));
                        changed = true;
                        if (!newlyUnlocked.includes(v)) newlyUnlocked.push(v);
                    }
                });
                if (changed) localStorage.setItem(lsKey, JSON.stringify(list));
            });
            if (newlyUnlocked.length > 0) {
                newlyUnlocked.sort((a, b) => a - b);
                this.showToast(`📖 コレクションに ${newlyUnlocked.length} 件登録！（最大: ${Math.max(...newlyUnlocked)}）`);
            }
        }

        if (score > this.highScores[gameId]) {
            this.highScores[gameId] = score;
            localStorage.setItem(this.currentGameConfig.scoreKey, score);
        }
        if (!this.highestIQs[gameId] || iq > parseInt(this.highestIQs[gameId])) {
            this.highestIQs[gameId] = String(iq);
            localStorage.setItem(this.currentGameConfig.iqKey, iq);
        }

        let evaluation = '素晴らしい論理的思考力です。';
        if (iq >= 130) evaluation = '極めて優れた論理構築能力を示しています。';
        else if (iq >= 115) evaluation = '平均を大きく上回る高い知性を発揮しています。';

        this.showResultView({
            badge: 'MEASUREMENT COMPLETE',
            header: '測定結果',
            iqLabel: this.currentGameConfig.iqLabel,
            timeLabel: 'クリア時間',
            movesLabel: gameId === 'merge' ? '総手数' : '操作回数',
            showEfficiency: gameId === 'merge',
            iq,
            percent,
            score,
            time: this.formatTime(timeSec),
            moves: `${moves}回`,
            efficiency: gameId === 'merge' ? `${Math.min(100, Math.round((35 / moves) * 100))}%` : '',
            evaluation,
            showContinue: gameId === 'merge'
        });

        this.showToast(`クリア！ 🪙 ${cp} CP 獲得！`);
        this.achievements.checkAll();

        const saveKey = gameId === 'merge' ? 'logiq_save_game' : gameId === 'king' ? 'logiq_save_king_game' : null;
        if (saveKey) localStorage.removeItem(saveKey);
    }

    calcMergeIQ(timeSec, moves) {
        const iq = Math.max(70, Math.min(155, 140 - Math.floor(timeSec / 12) - Math.floor(moves / 15)));
        return { iq };
    }

    iqToPercentile(iq) {
        if (iq >= 150) return "99.9%";
        if (iq >= 140) return "99.6%";
        if (iq >= 130) return "97.7%";
        if (iq >= 120) return "90.8%";
        if (iq >= 115) return "84.1%";
        if (iq >= 110) return "74.7%";
        if (iq >= 100) return "50.0%";
        return "25.0%以下";
    }

    handleGameOver(gameId, score) {
        const saveKey = gameId === 'merge' ? 'logiq_save_game' : gameId === 'king' ? 'logiq_save_king_game' : null;
        if (saveKey) localStorage.removeItem(saveKey);

        const cp = Math.round(score * 0.4);
        this.points += cp;
        localStorage.setItem('logiq_points', this.points);
        alert(`測定終了！ 🪙 ${cp} CP 獲得しました。`);

        const evIndicator = document.getElementById('evolution-indicator');
        if (evIndicator) evIndicator.style.display = 'none';

        this.showView('lobby-view');
    }

    exitGame() {
        const gameId = this.currentGameType;
        const saveKey = gameId === 'merge' ? 'logiq_save_game' : gameId === 'king' ? 'logiq_save_king_game' : null;
        
        const hideEvo = () => {
            const evIndicator = document.getElementById('evolution-indicator');
            if (evIndicator) evIndicator.style.display = 'none';
        };

        if (saveKey && this.activeGameInstance?.gameActive) {
            if (confirm('ゲームを中断してロビーへ戻りますか？\n(状態は保存されます)')) {
                this.activeGameInstance.saveGameState();
                this.activeGameInstance.destroy();
                this.activeGameInstance = null;
                hideEvo();
                this.showView('lobby-view');
            }
        } else {
            if (this.activeGameInstance) {
                this.activeGameInstance.destroy();
                this.activeGameInstance = null;
            }
            hideEvo();
            this.showView('lobby-view');
        }
    }

    checkSaveGame() {
        const resumeBtn = document.getElementById('btn-resume-game');
        const startBtn = document.getElementById('btn-start-new');
        if (!resumeBtn || !startBtn) return;

        const cfg = this.currentGameConfig;
        const saveKey = cfg.id === 'merge' ? 'logiq_save_game' : cfg.id === 'king' ? 'logiq_save_king_game' : null;

        if (saveKey) {
            const raw = localStorage.getItem(saveKey);
            if (raw) {
                resumeBtn.style.display = 'block';
                startBtn.innerText = '新規測定を開始する';
            } else {
                resumeBtn.style.display = 'none';
                startBtn.innerText = '思考測定を開始する';
            }
        } else {
            resumeBtn.style.display = 'none';
            startBtn.innerText = `${cfg.name} を開始する`;
        }
    }

    // ===== ショップ (動的スキン生成) =====
    updateShopUI() {
        const gameId = this.currentGameType;
        const GameClass = window.LogiqGames[this.currentGameConfig.className];
        const container = document.getElementById('skins-list');

        if (!container || !GameClass || !GameClass.SKINS) return;

        container.innerHTML = '';

        const unlockedKey = gameId === 'merge' ? 'logiq_unlocked_skins' : `logiq_unlocked_${gameId}_skins`;
        const currentKey = gameId === 'merge' ? 'logiq_current_skin' : `logiq_current_${gameId}_skin`;
        
        const defaultList = gameId === 'merge' ? '["numbers"]' : '["nexus_classic"]';
        const defaultSkin = gameId === 'merge' ? 'numbers' : 'nexus_classic';

        const unlockedList = JSON.parse(localStorage.getItem(unlockedKey) || defaultList);
        const currentSkin = localStorage.getItem(currentKey) || defaultSkin;

        Object.keys(GameClass.SKINS).forEach(id => {
            const skin = GameClass.SKINS[id];
            const owned = unlockedList.includes(id);
            const active = currentSkin === id;

            const card = document.createElement('div');
            card.className = 'shop-card' + (owned ? ' owned' : ' locked') + (active ? ' active' : '');
            card.id = `skin-card-${id}`;

            const btnText = active ? '適用中' : owned ? '適用する' : `🪙 ${skin.price} CP`;
            const btnDisabled = active ? 'disabled' : '';

            card.innerHTML = `
                <div class="skin-preview">${skin.icon}</div>
                <div class="skin-info">
                    <h4>${skin.name}</h4>
                    <p>${skin.desc}</p>
                    <button class="btn-skin-action" ${btnDisabled} onclick="app.buyOrUseSkin('${id}', ${skin.price})">${btnText}</button>
                </div>
            `;
            container.appendChild(card);
        });
    }

    buyOrUseSkin(skinId, price) {
        const gameId = this.currentGameType;
        const unlockedKey = gameId === 'merge' ? 'logiq_unlocked_skins' : `logiq_unlocked_${gameId}_skins`;
        const defaultList = gameId === 'merge' ? '["numbers"]' : '["nexus_classic"]';
        const unlockedList = JSON.parse(localStorage.getItem(unlockedKey) || defaultList);

        if (unlockedList.includes(skinId)) {
            this.useSkin(skinId);
            return;
        }

        const GameClass = window.LogiqGames[this.currentGameConfig.className];
        const skinName = GameClass.SKINS[skinId].name;

        if (confirm(`${skinName} を 🪙 ${price} CP で解放しますか？`)) {
            if (this.points >= price) {
                this.points -= price;
                unlockedList.push(skinId);
                localStorage.setItem('logiq_points', this.points);
                localStorage.setItem(unlockedKey, JSON.stringify(unlockedList));
                this.useSkin(skinId);
                this.renderPoints();
                this.achievements.checkAll();
            } else {
                alert('CPが不足しています。');
            }
        }
    }

    useSkin(skinId) {
        const gameId = this.currentGameType;
        const currentKey = gameId === 'merge' ? 'logiq_current_skin' : `logiq_current_${gameId}_skin`;
        const saveKey = gameId === 'merge' ? 'logiq_save_game' : gameId === 'king' ? 'logiq_save_king_game' : null;

        // セーブデータがある場合警告
        if (saveKey && localStorage.getItem(saveKey) !== null) {
            if (!confirm('スキンを変更すると、現在の中断データは破棄されリセットされます。よろしいですか？')) {
                this.updateShopUI();
                return;
            }
            localStorage.removeItem(saveKey);
            if (this.activeGameInstance) {
                this.activeGameInstance.destroy();
                this.activeGameInstance = null;
            }
            this.checkSaveGame();
        }

        localStorage.setItem(currentKey, skinId);
        this.showToast('スキンを適用しました。');
        this.updateShopUI();
    }

    // ===== スキルアビリティ解放 (動的縦型ツリー) =====
    updateSkillsUI() {
        const gameId = this.currentGameType;
        const GameClass = window.LogiqGames[this.currentGameConfig.className];
        
        const treeBoard = document.querySelector('.vertical-tree-board');
        if (!treeBoard || !GameClass || !GameClass.SKILLS) return;

        const isMerge = gameId === 'merge';

        // 全アビリティリスト（マージゲーム想定）
        const allNodes = [
            'core', 'boost', 'undo', 'grid5x5', 'score1', 'shuffle', 'ad_skip',
            'score2', 'time_limit', 'combo', 'saver', 'score3', 'mastery', 'collector', 'god_mode'
        ];

        const allLines = [
            'line-boost', 'line-undo', 'line-grid5x5', 'line-score1', 'line-shuffle', 'line-ad_skip',
            'line-score2', 'line-time_limit', 'line-combo', 'line-saver', 'line-score3', 'line-mastery',
            'line-collector', 'line-god_mode'
        ];

        // マージゲーム以外の場合は、コア・ブースト(quantum_sim)・5x5(time_rewind) 以外のノードと接続線を非表示にする
        allNodes.forEach(nodeId => {
            const nodeEl = document.getElementById(`node-${nodeId}`);
            if (!nodeEl) return;
            
            if (isMerge) {
                nodeEl.style.display = 'flex';
            } else {
                // 3つの基本ノードだけ表示
                const keep = nodeId === 'core' || nodeId === 'boost' || nodeId === 'grid5x5';
                nodeEl.style.display = keep ? 'flex' : 'none';
            }
        });

        allLines.forEach(lineId => {
            const lineEl = document.getElementById(lineId);
            if (!lineEl) return;

            if (isMerge) {
                lineEl.style.display = 'block';
            } else {
                // 基本の2本だけ表示
                const keep = lineId === 'line-boost' || lineId === 'line-grid5x5';
                lineEl.style.display = keep ? 'block' : 'none';
            }
        });

        // 各ノードの見た目を状態（active, inactive, locked）に合わせて更新
        Object.keys(GameClass.SKILLS).forEach(nodeId => {
            let domId = nodeId;
            if (!isMerge) {
                if (nodeId === 'quantum_sim') domId = 'boost';
                else if (nodeId === 'time_rewind') domId = 'grid5x5';
            }

            const nodeEl = document.getElementById(`node-${domId}`);
            if (!nodeEl) return;

            const skill = GameClass.SKILLS[nodeId];
            const state = localStorage.getItem(`logiq_skill_${gameId}_${nodeId}`) || (nodeId === 'core' ? 'active' : 'locked');
            
            nodeEl.className = `tree-node ${state}`;
            if (domId === this.selectedSkillId) nodeEl.classList.add('selected-node');
            nodeEl.innerText = skill.icon;
        });

        // 14本の接続線の状態別（unlocked, available, locked）の動的更新
        const lineDefs = isMerge
            ? [
                { id: 'line-boost', parent: 'core', target: 'boost' },
                { id: 'line-undo', parent: 'core', target: 'undo' },
                { id: 'line-grid5x5', parent: 'boost', target: 'grid5x5' },
                { id: 'line-score1', parent: 'boost', target: 'score1' },
                { id: 'line-shuffle', parent: 'undo', target: 'shuffle' },
                { id: 'line-ad_skip', parent: 'undo', target: 'ad_skip' },
                { id: 'line-score2', parent: 'score1', target: 'score2' },
                { id: 'line-time_limit', parent: 'score1', target: 'time_limit' },
                { id: 'line-combo', parent: 'shuffle', target: 'combo' },
                { id: 'line-saver', parent: 'shuffle', target: 'saver' },
                { id: 'line-score3', parent: 'score2', target: 'score3' },
                { id: 'line-mastery', parent: 'time_limit', target: 'mastery' },
                { id: 'line-collector', parent: 'combo', target: 'collector' },
                { id: 'line-god_mode', parent: 'saver', target: 'god_mode' }
              ]
            : [
                { id: 'line-boost', parent: 'core', target: 'quantum_sim' },
                { id: 'line-grid5x5', parent: 'quantum_sim', target: 'time_rewind' }
              ];

        lineDefs.forEach(lineDef => {
            const line = document.getElementById(lineDef.id);
            if (!line) return;

            const parentState = localStorage.getItem(`logiq_skill_${gameId}_${lineDef.parent}`) || (lineDef.parent === 'core' ? 'active' : 'locked');
            const targetState = localStorage.getItem(`logiq_skill_${gameId}_${lineDef.target}`) || 'locked';

            line.setAttribute('class', 'tree-line');
            if (targetState === 'active') {
                line.classList.add('unlocked');
            } else if (parentState === 'active') {
                line.classList.add('available');
            } else {
                line.classList.add('locked');
            }
        });

        this.selectSkillNode(this.selectedSkillId);
    }

    selectSkillNode(nodeId) {
        this.selectedSkillId = nodeId;
        const gameId = this.currentGameType;
        const GameClass = window.LogiqGames[this.currentGameConfig.className];
        if (!GameClass || !GameClass.SKILLS) return;

        const isMerge = gameId === 'merge';

        // マージゲーム以外で存在しないノードを選択した場合は core にフォールバック
        if (!isMerge) {
            const valid = nodeId === 'core' || nodeId === 'boost' || nodeId === 'grid5x5';
            if (!valid) {
                nodeId = 'core';
                this.selectedSkillId = 'core';
            }
        }

        // ゲームに応じたキーの逆マッピング
        let skillKey = nodeId;
        if (!isMerge) {
            if (nodeId === 'boost') skillKey = 'quantum_sim';
            else if (nodeId === 'grid5x5') skillKey = 'time_rewind';
        }

        const skill = GameClass.SKILLS[skillKey];
        if (!skill) return;

        // 選択ハイライトの適用
        const nodeMap = isMerge
            ? {
                core: 'core', boost: 'boost', undo: 'undo', grid5x5: 'grid5x5', score1: 'score1',
                shuffle: 'shuffle', ad_skip: 'ad_skip', score2: 'score2', time_limit: 'time_limit',
                combo: 'combo', saver: 'saver', score3: 'score3', mastery: 'mastery',
                collector: 'collector', god_mode: 'god_mode'
              }
            : { core: 'core', quantum_sim: 'boost', time_rewind: 'grid5x5' };

        Object.keys(nodeMap).forEach(id => {
            const htmlId = nodeMap[id];
            const el = document.getElementById(`node-${htmlId}`);
            if (el) el.classList.toggle('selected-node', id === nodeId);
        });

        const titleEl = document.getElementById('skill-detail-title');
        const descEl = document.getElementById('skill-detail-desc');
        const actionEl = document.getElementById('skill-detail-action');
        if (!titleEl || !descEl || !actionEl) return;

        titleEl.innerText = skill.name;
        descEl.innerText = skill.desc;
        actionEl.innerHTML = '';

        const state = localStorage.getItem(`logiq_skill_${gameId}_${nodeId}`) || (nodeId === 'core' ? 'active' : 'locked');

        if (nodeId === 'core') {
            actionEl.innerHTML = `<span style="font-size: 9.5px; color: var(--accent); font-weight:700;">✅ メインコア稼働中</span>`;
        } else if (state === 'locked') {
            // 親ノードが有効かチェック（coreは常にactive扱い）
            const parentKey = skill.parent;
            const parentActive = !parentKey
                ? true
                : parentKey === 'core'
                    ? true
                    : localStorage.getItem(`logiq_skill_${gameId}_${parentKey}`) === 'active';
            if (parentActive) {
                actionEl.innerHTML = `<button class="btn btn-primary" onclick="app.buySkillNode('${nodeId}', ${skill.price})" style="font-size:10px; padding:6px 12px; border-radius:10px;">🪙 ${skill.price} CP で解放</button>`;
            } else {
                actionEl.innerHTML = `<span style="font-size: 9.5px; color: var(--text-sub);">🔒 上位ノードの解放が必要です</span>`;
            }
        } else {
            const isON = state === 'active';
            actionEl.innerHTML = `
                <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-size:9.5px; color:${isON ? 'var(--accent)' : 'var(--text-sub)'}; font-weight:700;">${isON ? '有効' : '無効'}</span>
                    <label class="switch">
                        <input type="checkbox" ${isON ? 'checked' : ''} onchange="app.toggleSkillNode('${nodeId}', this.checked)">
                        <span class="slider round"></span>
                    </label>
                </div>
            `;
        }
    }

    buySkillNode(nodeId, price) {
        const gameId = this.currentGameType;
        const GameClass = window.LogiqGames[this.currentGameConfig.className];
        const skillName = GameClass.SKILLS[nodeId].name;

        if (confirm(`${skillName} アビリティを 🪙 ${price} CP で解放しますか？`)) {
            if (this.points >= price) {
                this.points -= price;
                localStorage.setItem('logiq_points', this.points);
                localStorage.setItem(`logiq_skill_${gameId}_${nodeId}`, 'active');
                
                this.renderPoints();
                this.updateSkillsUI();
                this.achievements.checkAll();
                this.showToast(`🎉 ${skillName} を解放しました！`);
            } else {
                this.showToast('⚠️ コズミックポイント (CP) が不足しています。');
            }
        }
    }

    toggleSkillNode(nodeId, enable) {
        const gameId = this.currentGameType;
        localStorage.setItem(`logiq_skill_${gameId}_${nodeId}`, enable ? 'active' : 'inactive');
        this.updateSkillsUI();
        this.showToast(enable ? 'アビリティをONにしました' : 'アビリティをOFFにしました');
    }

    requestUndo() {
        if (this.activeGameInstance && typeof this.activeGameInstance.executeUndoFromUI === 'function') {
            this.activeGameInstance.executeUndoFromUI();
        }
    }

    // ===== コレクション図鑑 (動的描画) =====
    renderCollectionGrid() {
        const grid = document.getElementById('collection-grid');
        if (!grid) return;
        grid.innerHTML = '';

        const tabNav = document.querySelector('.sub-tab-nav');

        if (this.currentGameType === 'king') {
            if (tabNav) {
                tabNav.innerHTML = `
                    <button id="sub-tab-quantum" class="sub-tab-btn active" onclick="app.switchCollectionTab('quantum')">量子コア図鑑</button>
                `;
            }

            const db = {
                easy: { icon: '🔮', name: 'タキオン・コア', desc: 'Easy次元の調和を保つ超光速粒子ノード。' },
                normal: { icon: '⚛️', name: 'ダークマター・コア', desc: 'Normal次元の重力安定に寄与する暗黒物質ノード。' },
                hard: { icon: '🪐', name: '超弦特異点', desc: 'Hard次元の全次元振動を束ねる10次元弦ノード。' },
                expert: { icon: '🌀', name: '多次元ワームホール', desc: 'Expert次元の時空接続を維持するアインシュタイン特異点。' }
            };

            const keys = ['easy', 'normal', 'hard', 'expert'];
            keys.forEach(key => {
                const unlocked = this.unlockedQuantumCores.includes(key);
                const cell = document.createElement('div');
                cell.className = `collection-item${unlocked ? '' : ' locked'}`;
                cell.innerHTML = unlocked
                    ? `<span class="col-num" style="text-transform:uppercase; font-size:8px;">${key}</span><span class="col-icon">${db[key].icon}</span><span class="col-name" style="font-size:10px;">${db[key].name}</span>`
                    : `<span class="col-num" style="text-transform:uppercase; font-size:8px;">${key}</span><span class="col-icon">❓</span><span class="col-name" style="font-size:10px;">未安定化</span>`;
                grid.appendChild(cell);
            });
            return;
        }

        // MergeGame 用
        if (tabNav && tabNav.innerHTML.indexOf('sub-tab-kanji_large') === -1) {
            tabNav.innerHTML = `
                <button id="sub-tab-celestial" class="sub-tab-btn ${this.currentCollectionTab === 'celestial' ? 'active' : ''}" onclick="app.switchCollectionTab('celestial')">宇宙</button>
                <button id="sub-tab-gems" class="sub-tab-btn ${this.currentCollectionTab === 'gems' ? 'active' : ''}" onclick="app.switchCollectionTab('gems')">宝石</button>
                <button id="sub-tab-kanji_large" class="sub-tab-btn ${this.currentCollectionTab === 'kanji_large' ? 'active' : ''}" onclick="app.switchCollectionTab('kanji_large')">大数</button>
                <button id="sub-tab-kanji_small" class="sub-tab-btn ${this.currentCollectionTab === 'kanji_small' ? 'active' : ''}" onclick="app.switchCollectionTab('kanji_small')">極小</button>
                <button id="sub-tab-si_prefix" class="sub-tab-btn ${this.currentCollectionTab === 'si_prefix' ? 'active' : ''}" onclick="app.switchCollectionTab('si_prefix')">情報</button>
                <button id="sub-tab-element" class="sub-tab-btn ${this.currentCollectionTab === 'element' ? 'active' : ''}" onclick="app.switchCollectionTab('element')">元素</button>
                <button id="sub-tab-guild" class="sub-tab-btn ${this.currentCollectionTab === 'guild' ? 'active' : ''}" onclick="app.switchCollectionTab('guild')">ギルド</button>
            `;
        }

        const themes = {
            celestial: {
                db: {2:'🌌',4:'☄️',8:'🌑',16:'🌙',32:'🟤',64:'🟡',128:'🌍',256:'🔴',512:'🟠',1024:'🪐',2048:'🔵',4096:'🌀',8192:'🪨',16384:'☀️',32768:'💥',65536:'🕳️'},
                names: {2:'宇宙の塵',4:'隕石',8:'小惑星',16:'月',32:'水星',64:'金星',128:'地球',256:'火星',512:'木星',1024:'土星',2048:'天王星',4096:'海王星',8192:'冥王星',16384:'太陽',32768:'超新星',65536:'ブラックホール'},
                list: this.unlockedCelestials
            },
            gems: {
                db: {2:'🪨',4:'💜',8:'💙',16:'💛',32:'💚',64:'🧡',128:'💚',256:'💗',512:'💙',1024:'❤️',2048:'🌈',4096:'💎',8192:'💖',16384:'👑',32768:'🔮',65536:'星雲結晶'},
                names: {2:'石英',4:'アメジスト',8:'アクアマリン',16:'トパーズ',32:'翡翠',64:'琥珀',128:'エメラルド',256:'紅水晶',512:'サファイア',1024:'ルビー',2048:'オパール',4096:'ダイヤモンド',8192:'ピンクダイヤ',16384:'王冠の宝石',32768:'宇宙石',65536:'星雲結晶'},
                list: this.unlockedGems
            },
            kanji_large: {
                db: {2:'🎴',4:'🪙',8:'💎',16:'🏯',32:'🌊',64:'🌌',128:'🌾',256:'🏞️',512:'🏔️',1024:'⚖️',2048:'🚀',4096:'⭐',8192:'⏳',16384:'📿',32768:'🌀',65536:'👁️'},
                names: {2:'万',4:'億',8:'兆',16:'京',32:'垓',64:'杼',128:'穣',256:'溝',512:'澗',1024:'正',2048:'載',4096:'極',8192:'恒河沙',16384:'阿僧祇',32768:'那由他',65536:'無量大数'},
                list: this.unlockedKanjiLarge
            },
            kanji_small: {
                db: {2:'🍕',4:'⏱️',8:'📏',16:'🪶',32:'🧵',64:'💨',128:'🔬',256:'🕸️',512:'🏖️',1024:'🧹',2048:'🌪️',4096:'💧',8192:'🏜️',16384:'🌫️',32768:'🔄',65536:'⚡'},
                names: {2:'割',4:'分',8:'厘',16:'毛',32:'糸',64:'忽',128:'微',256:'繊',512:'沙',1024:'塵',2048:'埃',4096:'渺',8192:'漠',16384:'模糊',32768:'逡巡',65536:'刹那'},
                list: this.unlockedKanjiSmall
            },
            si_prefix: {
                db: {2:'箱',4:'💾',8:'💿',16:'📟',32:'🧠',64:'🌐',128:'☁️',256:'📡',512:'📡',1024:'🔌',2048:'🔋',4096:'⚡',8192:'☄️',16384:'🛸',32768:'🌌',65536:'♾️'},
                names: {2:'KILO',4:'MEGA',8:'GIGA',16:'TERA',32:'PETA',64:'EXA',128:'ZETTA',256:'YOTTA',512:'RONNA',1024:'QUECCA',2048:'SUPER',4096:'HYPER',8192:'ULTRA',16384:'COSMIC',32768:'GALACTIC',65536:'INFINITE'},
                list: this.unlockedSiPrefix
            },
            element: {
                db: {2:'🎈',4:'🎈',8:'🔋',16:'🟢',32:'🧪',64:'💎',128:'💨',256:'🤿',512:'🦷',1024:'🚨',2048:'🧂',4096:'🎆',8192:'🥫',16384:'💻',32768:'🔥',65536:'陸🌋'},
                names: {2:'水素',4:'ヘリウム',8:'リチウム',16:'ベリリウム',32:'ホウ素',64:'炭素',128:'窒素',256:'酸素',512:'フッ素',1024:'ネオン',2048:'ナトリウム',4096:'マグネシウム',8192:'アルミニウム',16384:'ケイ素',32768:'リン',65536:'硫黄'},
                list: this.unlockedElement
            },
            guild: {
                db: {2:'🪵',4:'🪵',8:'🛡️',16:'⚔️',32:'🏹',64:'🦅',128:'✨',256:'🌟',512:'☄️',1024:'👑',2048:'💫',4096:'🗡️',8192:'🐉',16384:'🔱',32768:'☀️',65536:'👁️'},
                names: {2:'Fランク',4:'Eランク',8:'Dランク',16:'Cランク',32:'Bランク',64:'Aランク',128:'Sランク',256:'SSランク',512:'SSSランク',1024:'マスター',2048:'グランドマスター',4096:'ブレイブヒーロー',8192:'レジェンド',16384:'神話',32768:'半神',65536:'絶対神'},
                list: this.unlockedGuild
            }
        };

        const theme = themes[this.currentCollectionTab];
        if (!theme) return;

        const values = Object.keys(theme.db).map(Number).sort((a,b) => a-b);
        values.forEach(val => {
            const unlocked = theme.list.includes(String(val));
            const cell = document.createElement('div');
            cell.className = `collection-item${unlocked ? '' : ' locked'}`;
            cell.innerHTML = unlocked
                ? `<span class="col-num">${val}</span><span class="col-icon">${theme.db[val]}</span><span class="col-name">${theme.names[val]}</span>`
                : `<span class="col-num">${val}</span><span class="col-icon">❓</span><span class="col-name">未発見</span>`;
            grid.appendChild(cell);
        });
    }

    showResultView(data) {
        const resultView = document.getElementById('result-view');
        if (!resultView) return;

        const badgeEl = document.getElementById('result-badge-status');
        if (badgeEl) badgeEl.innerText = data.badge;

        const headerEl = document.getElementById('result-header-text');
        if (headerEl) headerEl.innerText = data.header;

        const iqLabelEl = document.getElementById('result-iq-label');
        if (iqLabelEl) iqLabelEl.innerText = data.iqLabel;

        const iqValEl = document.getElementById('result-iq');
        if (iqValEl) iqValEl.innerText = data.iq;

        const percentEl = document.getElementById('result-percent');
        if (percentEl) percentEl.innerText = data.percent;

        const scoreEl = document.getElementById('result-score');
        if (scoreEl) scoreEl.innerText = data.score;
        
        const timeLabelEl = document.getElementById('result-time-label');
        if (timeLabelEl) timeLabelEl.innerText = data.timeLabel;

        const timeValEl = document.getElementById('result-time');
        if (timeValEl) timeValEl.innerText = data.time;

        const movesLabelEl = document.getElementById('result-moves-label');
        if (movesLabelEl) movesLabelEl.innerText = data.movesLabel;

        const movesValEl = document.getElementById('result-moves');
        if (movesValEl) movesValEl.innerText = data.moves;

        const evalEl = document.getElementById('evaluation-text');
        if (evalEl) evalEl.innerText = data.evaluation;

        const contBtn = document.getElementById('btn-continue');
        if (contBtn) {
            contBtn.style.display = data.showContinue ? 'block' : 'none';
        }

        this.showView('result-view');
    }

    showToast(message) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerText = message;
        container.appendChild(toast);

        // 3秒後にフェードアウトして消去
        setTimeout(() => {
            toast.style.animation = 'slideInToast 0.3s cubic-bezier(0.16, 1, 0.3, 1) reverse forwards';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 2500);
    }

    formatTime(sec) {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return m > 0 ? `${m}分${s}秒` : `${s}秒`;
    }

    // ===== ポータル全体の追加機能メソッド (復元) =====
    switchMainTab(tabName) {
        // メインナビゲーションボタンのアクティブ状態切り替え
        document.querySelectorAll('.main-nav .tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.id === `main-tab-btn-${tabName}`);
        });

        // メインコンテンツ（PLAY, ACHIEVE, SHOP）の表示切り替え
        document.querySelectorAll('#dashboard .tab-content').forEach(content => {
            content.classList.remove('active');
        });
        const activeContent = document.getElementById(`main-tab-${tabName}`);
        if (activeContent) {
            activeContent.classList.add('active');
        }

        // タブ固有の動的描画
        if (tabName === 'achieve') {
            this.achievements.renderUI();
        }
    }

    addDebugPoints() {
        this.points += 1000;
        localStorage.setItem('logiq_points', this.points);
        this.renderPoints();
        this.showToast('🪙 1000 CP チャージしました（デバッグ）');
        this.achievements.checkAll();
    }

    watchAdForPoints() {
        const modal = document.getElementById('ad-modal');
        const timerEl = document.getElementById('ad-timer');
        const progressEl = document.getElementById('ad-progress');
        if (!modal || !timerEl || !progressEl) return;

        modal.classList.add('active');
        let count = 3;
        timerEl.innerText = count;
        progressEl.style.width = '0%';

        const interval = setInterval(() => {
            count--;
            timerEl.innerText = count;
            progressEl.style.width = `${((3 - count) / 3) * 100}%`;
            if (count <= 0) {
                clearInterval(interval);
                modal.classList.remove('active');
                this.points += 200;
                localStorage.setItem('logiq_points', this.points);
                this.renderPoints();
                this.showToast('🪙 200 CP 獲得しました！');
                this.achievements.checkAll();
            }
        }, 1000);
    }

    simulatePurchase(cp, price) {
        if (confirm(`デモ購入: 🪙 ${cp} CP を ¥${price} でチャージしますか？`)) {
            this.points += cp;
            localStorage.setItem('logiq_points', this.points);
            this.renderPoints();
            this.showToast(`🪙 ${cp} CP チャージしました！`);
            this.achievements.checkAll();
        }
    }

    switchCollectionTab(tabName) {
        this.currentCollectionTab = tabName;
        
        // コレクション内のサブタブ切り替え
        document.querySelectorAll('.sub-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.id === `sub-tab-${tabName}`);
        });

        this.renderCollectionGrid();
    }
}

// グローバルインスタンスの生成
window.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
    window.app.init();
});
