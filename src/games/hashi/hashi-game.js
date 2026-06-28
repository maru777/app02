/**
 * LogiQ - Hashi Bridge Game Module
 * 共通基底クラス GameBase を継承
 * ルール:
 *  - 数字ノード(島)同士を縦横に繋ぐ。
 *  - 橋は最大2本まで。交差不可。
 *  - 各島の数字＝繋がっている橋の総数。
 *  - すべての島が1つのグループ(連結)になる必要がある。
 */
class HashiGame extends LogiqGames.GameBase {
    constructor(containerElement, options) {
        super(containerElement, options);

        this.isDragging = false;
        this.dragStartIsland = null;
        this.islands = []; // { id, x, y, limit, currentCount }
        this.bridges = []; // { fromId, toId, count, direction: 'h'|'v' }
        
        this.dragLineEl = null;

        // イベントハンドラ参照（unbind用）
        this.boundMouseMove = this.handleMouseMove.bind(this);
        this.boundMouseUp = this.handleMouseUp.bind(this);
        this.boundTouchMove = this.handleTouchMove.bind(this);
        this.boundTouchEnd = this.handleTouchEnd.bind(this);
    }

    // パズル面定義 (論理的に解ける静的データを複数登録)
    getLevels() {
        return [
            // Level 1
            {
                islands: [
                    { id: 0, x: 40,  y: 40,  limit: 2 },
                    { id: 1, x: 160, y: 40,  limit: 4 },
                    { id: 2, x: 280, y: 40,  limit: 2 },
                    { id: 3, x: 40,  y: 160, limit: 2 },
                    { id: 4, x: 160, y: 160, limit: 4 },
                    { id: 5, x: 280, y: 160, limit: 2 },
                    { id: 6, x: 160, y: 280, limit: 2 }
                ]
            },
            // Level 2
            {
                islands: [
                    { id: 0, x: 40,  y: 40,  limit: 3 },
                    { id: 1, x: 280, y: 40,  limit: 3 },
                    { id: 2, x: 160, y: 160, limit: 4 },
                    { id: 3, x: 40,  y: 280, limit: 3 },
                    { id: 4, x: 280, y: 280, limit: 3 }
                ]
            }
        ];
    }

    startNewGame() {
        this.bridges = [];
        this.elapsedSeconds = 0;

        const levels = this.getLevels();
        const lvl = levels[Math.floor(Math.random() * levels.length)];

        // 島データのコピーと初期化
        this.islands = lvl.islands.map(i => Object.assign({}, i, { currentCount: 0 }));

        this.setupDOM();
        this.startTimer();

        if (this.options.onMovesChange) this.options.onMovesChange(0);
        if (this.options.onProgressChange) this.options.onProgressChange(0);
    }

    setupDOM() {
        this.containerElement.innerHTML = `
            <div class="hashi-wrapper">
                <div id="hashi-board" class="hashi-board">
                    <svg id="hashi-svg" class="hashi-svg"></svg>
                    <!-- 島はここに配置 -->
                </div>
                <div class="hashi-actions">
                    <button class="btn btn-secondary" id="btn-hashi-clear">リセット</button>
                </div>
            </div>
        `;

        const board = this.containerElement.querySelector('#hashi-board');
        this.svgEl = this.containerElement.querySelector('#hashi-svg');

        // ドラッグ中の仮の線用要素
        this.dragLineEl = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        this.dragLineEl.setAttribute('class', 'hashi-drag-line');
        this.dragLineEl.style.display = 'none';
        this.svgEl.appendChild(this.dragLineEl);

        // 島DOM生成
        this.islands.forEach(island => {
            const el = document.createElement('div');
            el.className = 'hashi-island';
            el.id = `island-${island.id}`;
            el.dataset.id = island.id;
            el.style.left = `${island.x}px`;
            el.style.top = `${island.y}px`;
            el.innerHTML = `<span class="island-num">${island.limit}</span>`;

            // ドラッグ開始（マウス）
            el.onmousedown = (e) => {
                e.preventDefault();
                this.startDragging(island, e.clientX, e.clientY);
            };
            // タッチ開始
            el.ontouchstart = (e) => {
                e.preventDefault();
                const touch = e.touches[0];
                this.startDragging(island, touch.clientX, touch.clientY);
            };

            board.appendChild(el);
        });

        this.containerElement.querySelector('#btn-hashi-clear').onclick = () => this.clearBridges();

        // グローバルの移動/終了監視
        document.addEventListener('mousemove', this.boundMouseMove);
        document.addEventListener('mouseup', this.boundMouseUp);
        document.addEventListener('touchmove', this.boundTouchMove, { passive: false });
        document.addEventListener('touchend', this.boundTouchEnd);
    }

    startDragging(island, clientX, clientY) {
        if (!this.gameActive) return;
        this.isDragging = true;
        this.dragStartIsland = island;

        const boardRect = this.containerElement.querySelector('#hashi-board').getBoundingClientRect();
        const x = clientX - boardRect.left;
        const y = clientY - boardRect.top;

        this.dragLineEl.setAttribute('x1', island.x + 20);
        this.dragLineEl.setAttribute('y1', island.y + 20);
        this.dragLineEl.setAttribute('x2', x);
        this.dragLineEl.setAttribute('y2', y);
        this.dragLineEl.style.display = 'block';

        // 開始島のハイライト
        const el = this.containerElement.querySelector(`#island-${island.id}`);
        if (el) el.classList.add('island-dragging');
    }

    handleMouseMove(e) {
        if (!this.isDragging) return;
        const boardRect = this.containerElement.querySelector('#hashi-board').getBoundingClientRect();
        const x = e.clientX - boardRect.left;
        const y = e.clientY - boardRect.top;

        this.dragLineEl.setAttribute('x2', x);
        this.dragLineEl.setAttribute('y2', y);
    }

    handleTouchMove(e) {
        if (!this.isDragging) return;
        e.preventDefault(); // スクロール防止
        const touch = e.touches[0];
        const boardRect = this.containerElement.querySelector('#hashi-board').getBoundingClientRect();
        const x = touch.clientX - boardRect.left;
        const y = touch.clientY - boardRect.top;

        this.dragLineEl.setAttribute('x2', x);
        this.dragLineEl.setAttribute('y2', y);
    }

    handleMouseUp(e) {
        if (!this.isDragging) return;
        const el = document.elementFromPoint(e.clientX, e.clientY);
        this.endDraggingAtElement(el);
    }

    handleTouchEnd(e) {
        if (!this.isDragging) return;
        const touch = e.changedTouches[0];
        const el = document.elementFromPoint(touch.clientX, touch.clientY);
        this.endDraggingAtElement(el);
    }

    endDraggingAtElement(el) {
        this.isDragging = false;
        this.dragLineEl.style.display = 'none';

        // ハイライト解除
        const startEl = this.containerElement.querySelector(`#island-${this.dragStartIsland.id}`);
        if (startEl) startEl.classList.remove('island-dragging');

        // 終点の島を取得
        const targetIslandEl = el ? el.closest('.hashi-island') : null;
        if (targetIslandEl) {
            const targetId = parseInt(targetIslandEl.dataset.id);
            const targetIsland = this.islands.find(i => i.id === targetId);
            if (targetIsland && targetIsland.id !== this.dragStartIsland.id) {
                this.tryCreateBridge(this.dragStartIsland, targetIsland);
            }
        }
        this.dragStartIsland = null;
    }

    /**
     * 2つの島の間に橋を架ける試み
     */
    tryCreateBridge(islandA, islandB) {
        // 縦横のみの直線か
        const isHorizontal = islandA.y === islandB.y;
        const isVertical = islandA.x === islandB.x;
        if (!isHorizontal && !isVertical) return;

        // 間に他の島がないかチェック
        const minX = Math.min(islandA.x, islandB.x);
        const maxX = Math.max(islandA.x, islandB.x);
        const minY = Math.min(islandA.y, islandB.y);
        const maxY = Math.max(islandA.y, islandB.y);

        for (let i = 0; i < this.islands.length; i++) {
            const island = this.islands[i];
            if (island.id === islandA.id || island.id === islandB.id) continue;

            if (isHorizontal && island.y === islandA.y && island.x > minX && island.x < maxX) {
                return; // 間に島がある
            }
            if (isVertical && island.x === islandA.x && island.y > minY && island.y < maxY) {
                return; // 間に島がある
            }
        }

        // 交差チェック (架けようとする橋が、既存の橋と交差しないか)
        const dir = isHorizontal ? 'h' : 'v';
        const collides = this.bridges.some(b => {
            if (b.direction === dir) return false; // 同方向は交差しない

            if (dir === 'h') {
                // 自分(水平) vs 相手(垂直)
                const myY = islandA.y;
                const otherX = this.islands.find(is => is.id === b.fromId).x;
                const otherMinY = Math.min(this.islands.find(is => is.id === b.fromId).y, this.islands.find(is => is.id === b.toId).y);
                const otherMaxY = Math.max(this.islands.find(is => is.id === b.fromId).y, this.islands.find(is => is.id === b.toId).y);

                return (otherX > minX && otherX < maxX && myY > otherMinY && myY < otherMaxY);
            } else {
                // 自分(垂直) vs 相手(水平)
                const myX = islandA.x;
                const otherY = this.islands.find(is => is.id === b.fromId).y;
                const otherMinX = Math.min(this.islands.find(is => is.id === b.fromId).x, this.islands.find(is => is.id === b.toId).x);
                const otherMaxX = Math.max(this.islands.find(is => is.id === b.fromId).x, this.islands.find(is => is.id === b.toId).x);

                return (otherY > minY && otherY < maxY && myX > otherMinX && myX < otherMaxX);
            }
        });

        if (collides) return;

        // 既存の橋があるか確認
        const existingBridge = this.bridges.find(b => 
            (b.fromId === islandA.id && b.toId === islandB.id) || 
            (b.fromId === islandB.id && b.toId === islandA.id)
        );

        if (existingBridge) {
            if (existingBridge.count === 1) {
                existingBridge.count = 2; // 1本 -> 2本
            } else {
                // 2本 -> 削除 (トグル式)
                this.bridges = this.bridges.filter(b => b !== existingBridge);
            }
        } else {
            // 新しく1本架ける
            this.bridges.push({
                fromId: islandA.id,
                toId: islandB.id,
                count: 1,
                direction: dir
            });
        }

        this.updateCounts();
        this.renderBridges();
        this.checkGameWin();
    }

    updateCounts() {
        // 各島の接続数をリセット
        this.islands.forEach(i => i.currentCount = 0);

        this.bridges.forEach(b => {
            const islandFrom = this.islands.find(is => is.id === b.fromId);
            const islandTo = this.islands.find(is => is.id === b.toId);
            if (islandFrom) islandFrom.currentCount += b.count;
            if (islandTo) islandTo.currentCount += b.count;
        });

        // 島DOMのステータスクラス更新
        this.islands.forEach(island => {
            const el = this.containerElement.querySelector(`#island-${island.id}`);
            if (el) {
                el.className = 'hashi-island';
                if (island.currentCount === island.limit) {
                    el.classList.add('island-satisfied');
                } else if (island.currentCount > island.limit) {
                    el.classList.add('island-overflow');
                }
            }
        });

        // 進行状況の更新
        const totalBridges = this.bridges.reduce((acc, b) => acc + b.count, 0);
        if (this.options.onMovesChange) this.options.onMovesChange(totalBridges);

        const satisfiedCount = this.islands.filter(i => i.currentCount === i.limit).length;
        const percent = Math.round((satisfiedCount / this.islands.length) * 100);
        if (this.options.onProgressChange) this.options.onProgressChange(percent);
    }

    renderBridges() {
        // 既存の線をクリア (ドラッグ線以外)
        this.svgEl.querySelectorAll('g').forEach(g => g.remove());

        this.bridges.forEach(b => {
            const islandFrom = this.islands.find(is => is.id === b.fromId);
            const islandTo = this.islands.find(is => is.id === b.toId);

            const x1 = islandFrom.x + 20;
            const y1 = islandFrom.y + 20;
            const x2 = islandTo.x + 20;
            const y2 = islandTo.y + 20;

            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.setAttribute('class', 'hashi-bridge-group');

            if (b.count === 1) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', x1);
                line.setAttribute('y1', y1);
                line.setAttribute('x2', x2);
                line.setAttribute('y2', y2);
                line.setAttribute('class', 'hashi-bridge-line');
                group.appendChild(line);
            } else if (b.count === 2) {
                // 2本の並行線をわずかにずらして引く
                const offset = 4;
                const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');

                if (b.direction === 'h') {
                    line1.setAttribute('x1', x1); line1.setAttribute('y1', y1 - offset);
                    line1.setAttribute('x2', x2); line1.setAttribute('y2', y2 - offset);
                    line2.setAttribute('x1', x1); line2.setAttribute('y1', y1 + offset);
                    line2.setAttribute('x2', x2); line2.setAttribute('y2', y2 + offset);
                } else {
                    line1.setAttribute('x1', x1 - offset); line1.setAttribute('y1', y1);
                    line1.setAttribute('x2', x2 - offset); line1.setAttribute('y2', y2);
                    line2.setAttribute('x1', x1 + offset); line2.setAttribute('y1', y1);
                    line2.setAttribute('x2', x2 + offset); line2.setAttribute('y2', y2);
                }

                line1.setAttribute('class', 'hashi-bridge-line');
                line2.setAttribute('class', 'hashi-bridge-line');
                group.appendChild(line1);
                group.appendChild(line2);
            }

            this.svgEl.appendChild(group);
        });
    }

    clearBridges() {
        if (!this.gameActive) return;
        this.bridges = [];
        this.updateCounts();
        this.renderBridges();
    }

    checkGameWin() {
        // 1. 全ての島が完全に充足しているか
        const allSatisfied = this.islands.every(i => i.currentCount === i.limit);
        if (!allSatisfied) return;

        // 2. 全ての島が一続き(連結)のグループになっているか (幅優先探索で検証)
        if (this.islands.length === 0) return;
        const visited = new Set();
        const queue = [this.islands[0].id];
        visited.add(this.islands[0].id);

        while (queue.length > 0) {
            const currId = queue.shift();
            
            // 現在の島に繋がっている橋の接続先を探す
            this.bridges.forEach(b => {
                let neighborId = null;
                if (b.fromId === currId) neighborId = b.toId;
                else if (b.toId === currId) neighborId = b.fromId;

                if (neighborId !== null && !visited.has(neighborId)) {
                    visited.add(neighborId);
                    queue.push(neighborId);
                }
            });
        }

        const isConnected = visited.size === this.islands.length;

        if (isConnected) {
            // クリア！
            this.gameActive = false;
            this.stopTimer();

            // スコア算出 (早いほど高IQ)
            const score = Math.max(100, 2000 - this.elapsedSeconds * 4);
            
            // 充足時の演出アニメ
            this.containerElement.querySelectorAll('.hashi-island').forEach(el => {
                el.style.transform = 'scale(1.15)';
                setTimeout(() => el.style.transform = 'scale(1)', 200);
            });

            setTimeout(() => {
                if (this.onGameWin) {
                    this.onGameWin(score, this.elapsedSeconds, this.bridges.length);
                }
            }, 800);
        }
    }

    destroy() {
        document.removeEventListener('mousemove', this.boundMouseMove);
        document.removeEventListener('mouseup', this.boundMouseUp);
        document.removeEventListener('touchmove', this.boundTouchMove);
        document.removeEventListener('touchend', this.boundTouchEnd);
        super.destroy();
    }
}

window.LogiqGames.HashiGame = HashiGame;
