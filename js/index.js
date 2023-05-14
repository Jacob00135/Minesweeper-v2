(() => {
    'use strict';
    
    let rows = 9;
    let cols = 9;
    let mines = 10;
    let gameAreaArray;
    toggleTheme();
    generateGameAreaHTML();
    
    function toggleTheme() {
        /**
         * 设置初始主题：若系统是浅色模式，或者没有深色模式，则设置白色主题
         * 否则，设置黑色主题
         */
        let theme;
        if (window.matchMedia('(prefers-color-scheme)').media === 'not all'
            || !window.matchMedia('(prefers-color-scheme: dark)').matches) {
            theme = 'white';
        } else {
            theme = 'dark';
        }
        document.querySelectorAll('head > link[data-theme]').forEach((node, i) => {
            if (node.getAttribute('data-theme') === theme) {
                node.setAttribute('rel', 'stylesheet');
            } else {
                node.setAttribute('rel', 'alternate stylesheet');
            }
        });
    }
    
    function isFirstOpen() {
        /**
         * 判断是否是第一次翻开方块
         */
        return document.querySelector('#game-area > table > tr > td > button.open') === null;
    }
    
    function openBlock(e) {
        /**
         * 翻开一个方块
         */
        const btn = e.target;
        if (inArray('open', btn.classList) > 0) {
            return undefined;
        }
        if (isFirstOpen()) {
            generateGameAreaArray();
            generateMines(btn.row, btn.col);
            generateNumber();
            setGameAreaNumber();
        }
        btn.classList.add('open');
        if (btn.num === 0) {
            // TODO 翻开周围的数字雷
        } else if (btn.num === -1) {
            btn.classList.add('mine');
            alert('你输了！下次好运！');
        } else {
            btn.setAttribute('data-number', String(btn.num));
            btn.innerHTML = String(btn.num);
            if (isWin()) {
                alert('你赢了！');
            }
        }
    }
    
    function generateGameAreaArray() {
        /**
         * 生成游戏棋盘的逻辑数组
         */
        gameAreaArray = get2DArray(rows + 2, cols + 2, 0);
    }
    
    function generateGameAreaHTML() {
        /**
         * 生成游戏棋盘的HTML
         */
        const table = document.querySelector('#game-area > table');
        for (let r = 1; r < rows + 1; r++) {
            let tr = document.createElement('tr');
            for (let c = 1; c < cols + 1; c++) {
                let td = document.createElement('td');
                let btn = document.createElement('button');
                btn.addEventListener('click', openBlock);
                btn.type = 'button';
                btn.row = r;
                btn.col = c;
                td.appendChild(btn);
                tr.appendChild(td);
            }
            table.appendChild(tr);
        }
    }
    
    function gaToOne(r, c) {
        /**
         * 棋局下标转换成一维下标：(r, c) --> (r - 1) * cols + c - 1
         */
        return (r - 1) * cols + c - 1;
    }
    
    function oneToGa(i) {
        /**
         * 一维下标转换成棋局下标：i --> (parseInt(i / cols) + 1, i % cols + 1)
         */
        return [parseInt(i / cols) + 1, i % cols + 1];
    }
    
    function generateMines(firstRow, firstCol) {
        /**
         * 生成雷
         * 1.生成候选雷区间indexList = [0, rows * cols)
         * 2.从indexList剔除第一次点击的块以及它的周围块，使这些块不可能是雷
         * 3.从indexList中选出mines个不重复的数，保存到变量mineIndex中
         * 4.将雷的位置赋给逻辑数组
         */
        const indexList = getRangeArray(0, rows * cols, 1);
        const excludeIndex = [];
        for (let deltaR = 1; deltaR >= -1; deltaR--) {
            for (let deltaC = 1; deltaC >= -1; deltaC--) {
                let r = firstRow + deltaR;
                let c = firstCol + deltaC;
                if (r >= 1 && r <= rows && c >= 1 && c <= cols) {
                    deleteFromArray(indexList, gaToOne(r, c));
                }
            }
        }

        const mineIndex = [];
        for (let i = 0; i < mines; i++) {
            let randomIndex = getRandomInt(0, indexList.length);
            mineIndex.push(indexList[randomIndex])
            deleteFromArray(indexList, randomIndex);
        }

        for (let i = 0; i < mineIndex.length; i++) {
            let loc = oneToGa(mineIndex[i]);
            let r = loc[0];
            let c = loc[1];
            gameAreaArray[r][c] = -1;
        }
    }
    
    function generateNumber() {
        /**
         * 根据逻辑数组生成数字块
         */
        for (let r = 1; r < rows + 1; r++) {
            for (let c = 1; c < cols + 1; c++) {
                if (gameAreaArray[r][c] === -1) {
                    continue;
                }
                for (let deltaR = -1; deltaR <= 1; deltaR++) {
                    for (let deltaC = -1; deltaC <= 1; deltaC++) {
                        if (gameAreaArray[r + deltaR][c + deltaC] === -1) {
                            gameAreaArray[r][c] = gameAreaArray[r][c] + 1;
                        }
                    }
                }
            }
        }
    }
    
    function setGameAreaNumber() {
        /**
         * 将逻辑数组的数值设置到页面的按钮中
         */
        const trArray = document.querySelectorAll('#game-area > table > tr');
        for (let r = 0; r < rows; r++) {
            let btnArray = trArray[r].querySelectorAll('td > button');
            for (let c = 0; c < cols; c++) {
                let btn = btnArray[c];
                btn.num = gameAreaArray[r + 1][c + 1];
            }
        }
    }
    
    function isWin() {
        /**
         * 判断游戏是否赢了
         */
        return document.querySelectorAll('#game-area > table > tr > td > button:not(.open)').length === mines;
    }
})();