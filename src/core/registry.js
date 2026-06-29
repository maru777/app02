/**
 * LogiQ - Game Registry
 * ポータルに登録されている全ゲームモジュールの定義
 */
window.GAME_REGISTRY = [
    {
        id: 'merge',
        name: 'Genesis Merge',
        desc: '論理的思考 ＆ 段階進化シミュレーション',
        badge: 'IQ 70〜155 測定可能',
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>`,
        color: '#E27D60',
        bgColor: 'rgba(226, 125, 96, 0.15)',
        iqLabel: '推定マージIQ',
        hasSkins: true,
        hasCollection: true,
        scoreKey: 'logiq_merge_highscore',
        iqKey: 'logiq_merge_highest_iq',
        className: 'MergeGame',
        cssPath: 'src/games/merge/merge-game.css',
        stats: [
            { id: 1, label: 'SCORE', valId: 'merge-score', fallback: '0' },
            { id: 2, label: 'MOVES', valId: 'merge-moves', fallback: '0' },
            { id: 3, label: 'TIME', valId: 'merge-time', fallback: '00:00:00' }
        ],
        guide: 'キーボードの矢印キーまたはスワイプでタイルを動かし、同じ物質をマージして進化させていきます。目標は究極の進化形態に到達することです。'
    },
    {
        id: 'king',
        name: 'Nexus Align',
        desc: '多次元空間アライン ＆ 量子干渉回避力',
        badge: 'IQ 70〜155 測定可能',
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2v20"/><path d="M2 12h20"/><path d="m16 8-8 8"/><path d="m8 8 8 8"/></svg>`,
        color: '#8B6FCE',
        bgColor: 'rgba(139, 111, 206, 0.15)',
        iqLabel: '推定配置IQ',
        hasSkins: true,
        hasCollection: true,
        scoreKey: 'logiq_king_highscore',
        iqKey: 'logiq_king_highest_iq',
        className: 'KingGame',
        cssPath: 'src/games/king/king-game.css',
        stats: [
            { id: 1, label: 'CORES', valId: 'king-count', fallback: '0' },
            { id: 2, label: 'ATTEMPTS', valId: 'king-attempts', fallback: '0' },
            { id: 3, label: 'TIME', valId: 'king-time', fallback: '00:00:00' }
        ],
        guide: '各セクター、行、列に1つ、周囲8マスに隣接しないようにエネルギーコア（🔮）を配置します。'
    },
    {
        id: 'mastermind',
        name: 'Einstein Grid',
        desc: '仮説検証 ＆ 多重制約推論力',
        badge: 'IQ 75〜160 測定可能',
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>`,
        color: '#41B3A3',
        bgColor: 'rgba(65, 179, 163, 0.15)',
        iqLabel: '推定推論IQ',
        hasSkins: false,
        hasCollection: false,
        scoreKey: 'logiq_einstein_highscore',
        iqKey: 'logiq_einstein_highest_iq',
        className: 'EinsteinGridGame',
        cssPath: 'src/games/einstein/einstein-game.css',
        stats: [
            { id: 1, label: 'ERRORS', valId: 'einstein-errors', fallback: '0' },
            { id: 2, label: 'PROGRESS', valId: 'einstein-progress', fallback: '0%' },
            { id: 3, label: 'TIME', valId: 'einstein-time', fallback: '00:00:00' }
        ],
        guide: 'ヒントを元に、グリッドの各セルに正しい「記号」を配置していきます。縦横での重複はありません。'
    }
];
