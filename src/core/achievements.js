/**
 * LogiQ - Achievements System
 * 実績リストの定義およびアンロック状況の管理
 */
window.ACHIEVEMENTS = [
    {
        id: 'first_step',
        title: '思考の第一歩',
        desc: 'いずれかの思考測定でスコアを記録する',
        reward: 200,
        check: (app) => {
            return Object.values(app.highScores).some(score => score > 0);
        }
    },
    {
        id: 'logic_master',
        title: '高IQ論理知性',
        desc: 'いずれかの測定でIQ 130以上を達成する',
        reward: 500,
        check: (app) => {
            return Object.values(app.highestIQs).some(iq => parseInt(iq) >= 130);
        }
    },
    {
        id: 'collector_5',
        title: '量子・宇宙の収集家',
        desc: 'いずれかの図鑑で5種類以上のオブジェクトを発見する',
        reward: 300,
        check: (app) => {
            const countCel = app.unlockedCelestials.length;
            const countGem = app.unlockedGems.length;
            const countElem = app.unlockedElement.length;
            return Math.max(countCel, countGem, countElem) >= 5;
        }
    },
    {
        id: 'king_expert',
        title: '多次元の覇者',
        desc: 'Nexus Alignの難易度EXPERT (15x15次元) を安定化させる',
        reward: 1000,
        check: (app) => {
            return app.unlockedQuantumCores.includes('expert');
        }
    },
    {
        id: 'rich',
        title: '思考の富豪',
        desc: '所持CPが 3,000 CP を突破する',
        reward: 400,
        check: (app) => {
            return app.points >= 3000;
        }
    }
];

class AchievementsSystem {
    constructor(appInstance) {
        this.app = appInstance;
        this.unlockedIds = JSON.parse(localStorage.getItem('logiq_unlocked_achievements') || '[]');
        this.claimedIds = JSON.parse(localStorage.getItem('logiq_claimed_achievements') || '[]');
    }

    /**
     * 実績の解除状況をバックグラウンドで一斉チェック
     */
    checkAll() {
        let updated = false;
        window.ACHIEVEMENTS.forEach(ach => {
            if (this.unlockedIds.includes(ach.id)) return;

            // 各条件を満たしているかチェック
            if (ach.check(this.app)) {
                this.unlockedIds.push(ach.id);
                this.app.showToast(`🏆 実績解除: 【${ach.title}】`);
                updated = true;
            }
        });

        if (updated) {
            localStorage.setItem('logiq_unlocked_achievements', JSON.stringify(this.unlockedIds));
            this.renderUI();
        }
    }

    /**
     * ロビーの実績一覧画面を描画
     */
    renderUI() {
        const container = document.getElementById('achieve-list');
        if (!container) return;
        container.innerHTML = '';

        window.ACHIEVEMENTS.forEach(ach => {
            const isUnlocked = this.unlockedIds.includes(ach.id);
            const isClaimed = this.claimedIds.includes(ach.id);

            const card = document.createElement('div');
            card.className = `achievement-card${isUnlocked ? ' unlocked' : ''}${isClaimed ? ' claimed' : ''}`;
            
            // 進捗・状態テキスト
            let statusHTML = '';
            if (isClaimed) {
                statusHTML = `<span class="ach-status claimed">報酬受取済</span>`;
            } else if (isUnlocked) {
                statusHTML = `<button class="btn btn-primary ach-claim-btn" onclick="app.achievements.claimReward('${ach.id}')" style="font-size:9.5px; padding:4px 8px; border-radius:8px;">🎁 報酬を受け取る (🪙 ${ach.reward} CP)</button>`;
            } else {
                statusHTML = `<span class="ach-status locked">未達成</span>`;
            }

            card.innerHTML = `
                <div class="ach-info">
                    <h4>${ach.title}</h4>
                    <p>${ach.desc}</p>
                </div>
                <div class="ach-action">
                    ${statusHTML}
                </div>
            `;
            container.appendChild(card);
        });
    }

    /**
     * 実績の報酬（CP）を受け取る
     */
    claimReward(achId) {
        if (!this.unlockedIds.includes(achId)) return;
        if (this.claimedIds.includes(achId)) return;

        const ach = window.ACHIEVEMENTS.find(a => a.id === achId);
        if (!ach) return;

        this.claimedIds.push(achId);
        localStorage.setItem('logiq_claimed_achievements', JSON.stringify(this.claimedIds));

        // CPを加算
        this.app.points += ach.reward;
        localStorage.setItem('logiq_points', this.app.points);
        this.app.renderPoints();
        this.app.showToast(`🪙 ${ach.reward} CP を獲得しました！`);

        this.renderUI();
    }
}

window.LogiqGames.AchievementsSystem = AchievementsSystem;
