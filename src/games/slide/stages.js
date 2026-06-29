window.SLIDE_STAGES = [
    {
        id: 1,
        timeLimit: 30, // seconds
        rows: 5,
        cols: 5,
        board: [
            [1, 1, 'E_RED', 1, 1],
            [1, 0, 0, 0, 1],
            [1, 0, 0, 0, 1],
            [1, 0, 0, 0, 1],
            [1, 1, 1, 1, 1]
        ],
        blocks: [
            { id: 'b1', color: 'red', shape: [[1]], r: 3, c: 2 }
        ]
    },
    {
        id: 2,
        timeLimit: 45,
        rows: 6,
        cols: 6,
        board: [
            [1, 1, 'E_BLUE', 1, 1, 1],
            [1, 0, 0, 0, 0, 1],
            [1, 0, 1, 0, 0, 'E_RED'],
            [1, 0, 1, 0, 0, 1],
            [1, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1]
        ],
        blocks: [
            { id: 'b1', color: 'red', shape: [[1,1]], r: 4, c: 1 },
            { id: 'b2', color: 'blue', shape: [[1],[1]], r: 2, c: 4 }
        ]
    },
    {
        id: 3,
        timeLimit: 60,
        rows: 6,
        cols: 6,
        board: [
            [1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 'E_GREEN'],
            [1, 0, 1, 1, 0, 1],
            ['E_YELLOW', 0, 0, 0, 0, 1],
            [1, 0, 0, 1, 0, 1],
            [1, 1, 1, 1, 1, 1]
        ],
        blocks: [
            { id: 'b1', color: 'green', shape: [[1, 0], [1, 1]], r: 3, c: 2 }, // L shape
            { id: 'b2', color: 'yellow', shape: [[1, 1]], r: 1, c: 3 }
        ]
    },
    {
        id: 4,
        timeLimit: 90,
        rows: 7,
        cols: 7,
        board: [
            [1, 1, 1, 'E_PURPLE', 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 0, 1, 0, 1],
            ['E_CYAN', 0, 0, 0, 0, 0, 'E_ORANGE'],
            [1, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1]
        ],
        blocks: [
            { id: 'b1', color: 'purple', shape: [[0, 1, 0], [1, 1, 1]], r: 4, c: 2 }, // T shape
            { id: 'b2', color: 'cyan', shape: [[1], [1]], r: 1, c: 3 },
            { id: 'b3', color: 'orange', shape: [[1, 1]], r: 3, c: 3 }
        ]
    },
    {
        id: 5,
        timeLimit: 120,
        rows: 8,
        cols: 8,
        board: [
            [1, 1, 1, 1, 'E_RED', 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 'E_BLUE'],
            ['E_GREEN', 0, 1, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1]
        ],
        blocks: [
            { id: 'b1', color: 'red', shape: [[1, 1], [1, 1]], r: 5, c: 4 }, // 2x2 Square
            { id: 'b2', color: 'blue', shape: [[1, 0], [1, 0], [1, 1]], r: 1, c: 1 }, // Long L shape
            { id: 'b3', color: 'green', shape: [[1, 1, 1]], r: 3, c: 4 }
        ]
    }
];
