// src/games/slide/slide-game.js

class SlideGame {
    constructor(container, options = {}) {
        this.container = container;
        this.options = options;
        this.stageNum = options.stage || 1;
        this.gameActive = false;
        
        // Stats
        this.moves = 0;
        this.timerStarted = false;
        this.timerInterval = null;
        this.timeLimitSec = 60;
        this.timeRemaining = 60;
        
        // Data
        this.stageData = null;
        this.board = []; // 2D array of static items
        this.blocks = []; // Array of active blocks
        this.cellSize = 40;
        this.padding = 10;
        
        // Drag state
        this.draggingBlock = null;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.dragStartR = 0;
        this.dragStartC = 0;
        
        this.init();
    }
    
    init() {
        // Load stage data
        if (!window.SLIDE_STAGES) {
            console.error("Stage data not found!");
            return;
        }
        
        const stageIndex = this.stageNum - 1;
        this.stageData = window.SLIDE_STAGES[stageIndex];
        if (!this.stageData) {
            alert("全ステージクリア！おめでとうございます！");
            if (app) app.exitGame();
            return;
        }
        
        this.timeLimitSec = this.stageData.timeLimit || 60;
        this.timeRemaining = this.timeLimitSec;
        this.board = JSON.parse(JSON.stringify(this.stageData.board));
        this.blocks = JSON.parse(JSON.stringify(this.stageData.blocks));
        
        this.renderDOM();
        this.updateStatsUI();
        this.gameActive = true;
        
        // Bind events
        this.bindEvents();
    }
    
    renderDOM() {
        this.container.innerHTML = '';
        
        this.boardElement = document.createElement('div');
        this.boardElement.className = 'slide-board';
        
        // Calculate cell size based on container width
        const availableWidth = this.container.clientWidth - 40;
        const availableHeight = this.container.clientHeight - 40;
        const cols = this.stageData.cols;
        const rows = this.stageData.rows;
        
        this.cellSize = Math.min(Math.floor(availableWidth / cols), Math.floor(availableHeight / rows), 60);
        
        this.boardElement.style.width = `${cols * this.cellSize}px`;
        this.boardElement.style.height = `${rows * this.cellSize}px`;
        
        // Render Board (walls and exits)
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cellVal = this.board[r][c];
                if (cellVal !== 0) {
                    const cellEl = document.createElement('div');
                    cellEl.className = 'slide-cell';
                    cellEl.style.width = `${this.cellSize}px`;
                    cellEl.style.height = `${this.cellSize}px`;
                    cellEl.style.left = `${c * this.cellSize}px`;
                    cellEl.style.top = `${r * this.cellSize}px`;
                    
                    if (cellVal === 1) {
                        cellEl.classList.add('wall');
                    } else if (typeof cellVal === 'string' && cellVal.startsWith('E_')) {
                        const color = cellVal.split('_')[1].toLowerCase();
                        cellEl.classList.add('exit');
                        cellEl.classList.add(`slide-color-${color}`);
                    }
                    this.boardElement.appendChild(cellEl);
                }
            }
        }
        
        // Render Blocks
        this.blocks.forEach(b => {
            b.element = document.createElement('div');
            b.element.className = 'slide-block';
            
            // Render block parts
            for (let r = 0; r < b.shape.length; r++) {
                for (let c = 0; c < b.shape[r].length; c++) {
                    if (b.shape[r][c] === 1) {
                        const part = document.createElement('div');
                        part.className = `slide-block-part slide-color-${b.color}`;
                        part.style.width = `${this.cellSize}px`;
                        part.style.height = `${this.cellSize}px`;
                        part.style.left = `${c * this.cellSize}px`;
                        part.style.top = `${r * this.cellSize}px`;
                        b.element.appendChild(part);
                    }
                }
            }
            
            // Set block position
            b.element.style.left = `${b.c * this.cellSize}px`;
            b.element.style.top = `${b.r * this.cellSize}px`;
            
            // Allow Pointer Events
            b.element.addEventListener('pointerdown', (e) => this.onPointerDown(e, b));
            
            this.boardElement.appendChild(b.element);
        });
        
        this.container.appendChild(this.boardElement);
    }
    
    bindEvents() {
        this.pointerMoveHandler = (e) => this.onPointerMove(e);
        this.pointerUpHandler = (e) => this.onPointerUp(e);
        
        // Attach to document to handle drag outside block
        document.addEventListener('pointermove', this.pointerMoveHandler);
        document.addEventListener('pointerup', this.pointerUpHandler);
    }
    
    startTimer() {
        if (this.timerStarted) return;
        this.timerStarted = true;
        this.timerInterval = setInterval(() => {
            if (!this.gameActive) return;
            this.timeRemaining--;
            this.updateStatsUI();
            
            if (this.timeRemaining <= 0) {
                this.gameOverTimeOut();
            }
        }, 1000);
    }
    
    updateStatsUI() {
        const stageEl = document.getElementById('stat-value-1');
        const movesEl = document.getElementById('stat-value-2');
        const timeEl = document.getElementById('stat-value-3');
        
        if (stageEl) stageEl.innerText = this.stageNum;
        if (movesEl) movesEl.innerText = this.moves;
        
        if (timeEl) {
            const m = Math.floor(this.timeRemaining / 60).toString().padStart(2, '0');
            const s = (this.timeRemaining % 60).toString().padStart(2, '0');
            timeEl.innerText = `00:${m}:${s}`;
            
            if (this.timeRemaining <= 10) {
                timeEl.style.color = '#E63946'; // Red warning
            } else {
                timeEl.style.color = '';
            }
        }
    }
    
    // ==========================================
    // Interaction Logic
    // ==========================================
    
    onPointerDown(e, block) {
        if (!this.gameActive) return;
        this.startTimer();
        
        this.draggingBlock = block;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
        this.dragStartR = block.r;
        this.dragStartC = block.c;
        
        // Optional: highlight or elevate block
        block.element.style.zIndex = 100;
        
        // Prevent default touch actions (scrolling)
        e.preventDefault();
    }
    
    onPointerMove(e) {
        if (!this.draggingBlock || !this.gameActive) return;
        
        const dx = e.clientX - this.dragStartX;
        const dy = e.clientY - this.dragStartY;
        
        // Determine intended offset
        let dc = Math.round(dx / this.cellSize);
        let dr = Math.round(dy / this.cellSize);
        
        // Rush hour style: only allow orthogonal movement (pick dominant axis if diagonal)
        if (Math.abs(dc) > Math.abs(dr)) {
            dr = 0;
        } else {
            dc = 0;
        }
        
        if (dc === 0 && dr === 0) return; // No grid movement yet
        
        // Check if path to (dragStartR + dr, dragStartC + dc) is clear step-by-step
        let newR = this.dragStartR;
        let newC = this.dragStartC;
        
        const stepR = dr === 0 ? 0 : Math.sign(dr);
        const stepC = dc === 0 ? 0 : Math.sign(dc);
        
        let moved = false;
        const maxSteps = Math.max(Math.abs(dr), Math.abs(dc));
        
        for (let i = 0; i < maxSteps; i++) {
            const nextR = newR + stepR;
            const nextC = newC + stepC;
            
            if (this.canMoveBlockTo(this.draggingBlock, nextR, nextC)) {
                newR = nextR;
                newC = nextC;
                moved = true;
            } else {
                break; // Hit an obstacle
            }
        }
        
        if (moved && (newR !== this.draggingBlock.r || newC !== this.draggingBlock.c)) {
            this.draggingBlock.r = newR;
            this.draggingBlock.c = newC;
            this.updateBlockDOM(this.draggingBlock);
            
            // Re-anchor drag start so we don't jump back
            this.dragStartR = newR;
            this.dragStartC = newC;
            this.dragStartX = e.clientX;
            this.dragStartY = e.clientY;
            
            this.moves++;
            this.updateStatsUI();
            
            this.checkBlockExit(this.draggingBlock);
        }
    }
    
    onPointerUp(e) {
        if (!this.draggingBlock) return;
        this.draggingBlock.element.style.zIndex = 10;
        this.draggingBlock = null;
        
        // Verify win condition when finger is released
        this.checkWinCondition();
    }
    
    canMoveBlockTo(block, targetR, targetC) {
        const rows = this.stageData.rows;
        const cols = this.stageData.cols;
        
        for (let r = 0; r < block.shape.length; r++) {
            for (let c = 0; c < block.shape[r].length; c++) {
                if (block.shape[r][c] === 1) {
                    const boardR = targetR + r;
                    const boardC = targetC + c;
                    
                    // Bounds check
                    if (boardR < 0 || boardR >= rows || boardC < 0 || boardC >= cols) return false;
                    
                    // Wall check
                    const cellVal = this.board[boardR][boardC];
                    if (cellVal === 1) return false;
                    
                    // Note: Exits ('E_RED') are NOT walls, blocks can move over them freely
                    
                    // Collision with other blocks check
                    for (let other of this.blocks) {
                        if (other.id === block.id) continue;
                        
                        // Check if other block overlaps with (boardR, boardC)
                        for (let or = 0; or < other.shape.length; or++) {
                            for (let oc = 0; oc < other.shape[or].length; oc++) {
                                if (other.shape[or][oc] === 1) {
                                    if (other.r + or === boardR && other.c + oc === boardC) {
                                        return false;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        
        return true;
    }
    
    updateBlockDOM(block) {
        block.element.style.transform = `translate(${ (block.c - this.dragStartC) * this.cellSize }px, ${ (block.r - this.dragStartR) * this.cellSize }px)`;
        // Wait, since we are updating left/top instead of transform?
        // It's better to update left/top for absolute positioning and remove transform
        block.element.style.left = `${block.c * this.cellSize}px`;
        block.element.style.top = `${block.r * this.cellSize}px`;
        block.element.style.transform = ''; 
    }
    
    checkBlockExit(block) {
        // A block is considered to have exited if ANY of its parts cover its matching exit cell.
        // Actually, to make it strict, maybe a specific part needs to cover it?
        // Let's say if ALL its parts are on either the Exit or Empty spaces, but AT LEAST ONE part is on the matching Exit.
        
        let onExit = false;
        
        for (let r = 0; r < block.shape.length; r++) {
            for (let c = 0; c < block.shape[r].length; c++) {
                if (block.shape[r][c] === 1) {
                    const boardR = block.r + r;
                    const boardC = block.c + c;
                    const cellVal = this.board[boardR][boardC];
                    
                    if (typeof cellVal === 'string' && cellVal.startsWith('E_')) {
                        const exitColor = cellVal.split('_')[1].toLowerCase();
                        if (exitColor === block.color) {
                            onExit = true;
                        }
                    }
                }
            }
        }
        
        if (onExit) {
            // Block successfully escaped!
            this.draggingBlock = null; // stop drag
            
            // Visual effect
            block.element.style.transform = 'scale(0.5) opacity(0)';
            block.element.style.transition = 'all 0.3s ease';
            block.element.style.opacity = '0';
            
            setTimeout(() => {
                if (block.element.parentNode) {
                    block.element.parentNode.removeChild(block.element);
                }
                this.blocks = this.blocks.filter(b => b.id !== block.id);
                this.checkWinCondition();
            }, 300);
        }
    }
    
    checkWinCondition() {
        if (!this.gameActive) return;
        
        if (this.blocks.length === 0) {
            // WIN
            this.gameActive = false;
            if (this.timerInterval) clearInterval(this.timerInterval);
            
            // Unlock next stage
            const currentMax = parseInt(localStorage.getItem('logiq_unlocked_stages_slide') || '1');
            if (this.stageNum >= currentMax) {
                localStorage.setItem('logiq_unlocked_stages_slide', this.stageNum + 1);
            }
            
            // Show result
            if (window.app) {
                const score = Math.max(100, this.timeRemaining * 10 - this.moves * 2);
                window.app.handleGameWin('slide', score, this.timeLimitSec - this.timeRemaining, this.moves);
            }
        }
    }
    
    gameOverTimeOut() {
        this.gameActive = false;
        if (this.timerInterval) clearInterval(this.timerInterval);
        
        alert("TIME OVER! やり直してください。");
        // Reload current stage
        this.init();
    }
    
    destroy() {
        this.gameActive = false;
        if (this.timerInterval) clearInterval(this.timerInterval);
        
        document.removeEventListener('pointermove', this.pointerMoveHandler);
        document.removeEventListener('pointerup', this.pointerUpHandler);
        
        this.container.innerHTML = '';
    }
    
    loadCSS(path) {
        if (!document.querySelector(`link[href="${path}"]`)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = path;
            document.head.appendChild(link);
        }
    }
}

window.LogiqGames = window.LogiqGames || {};
window.LogiqGames.SlideGame = SlideGame;
