(() => {
    'use strict';
    // TODO 找字体图标：标旗子、标问号、踩雷、标记错误
    /**
     * 正常数字范围为[0, 8]，雷是-1，边界是-2
     */
    let rows = 9;
    let cols = 9;
    let mines = 10;
    let isFirstOpen = true;  // 是否是第一次打开方块
    let gameAreaArray;  // 棋局逻辑数组
    let blockArray;  // 棋局HTML结点数组
    let remanentSafeBlock;  // 剩余的未翻开的安全方块数，若此变量为0，表示赢得游戏
    toggleTheme();
    generateGameArea();

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
    
    function generateGameArea() {
        /**
         * 生成游戏棋局的HTML结点
         */
        const table = document.querySelector('#game-area > table');
        blockArray = [];
        for (let r = 1; r < rows + 1; r++) {
            let tr = document.createElement('tr');
            let blockRow = [];
            for (let c = 1; c < cols + 1; c++) {
                let td = document.createElement('td');
                let btn = document.createElement('button');
                btn.addEventListener('click', openBlock);
                btn.type = 'button';
                btn.row = r;
                btn.col = c;
                td.appendChild(btn);
                tr.appendChild(td);
                blockRow.push(btn);
            }
            table.appendChild(tr);
            blockArray.push(blockRow);
        }
    }

    function openMine(btn) {
        /**
         * 翻开雷块
         */
        btn.classList.add('mine');
        alert('你输了！下次好运！');
    }
    
    function openNumber(btn) {
        /**
         * 翻开数字块
         */
        btn.innerHTML = String(btn.num);
        btn.setAttribute('data-number', String(btn.num));
        remanentSafeBlock = remanentSafeBlock - 1;
    }

    function openZero(btn) {
        /**
         * 翻开数字零的块，形成翻开周围数字块的连锁反应
         */
        const queue = [btn];
        remanentSafeBlock = remanentSafeBlock - 1;
        while (queue.length > 0) {
            let centerBlock = queue.shift();
            for (let deltaR = -1; deltaR <= 1; deltaR++) {
                for (let deltaC = -1; deltaC <= 1; deltaC++) {
                    if (deltaR === 0 && deltaC === 0) {
                        continue;
                    }
                    let r = centerBlock.row + deltaR;
                    let c = centerBlock.col + deltaC;
                    if (gameAreaArray[r][c] === -2 || blockArray[r - 1][c - 1].open) {
                        continue;
                    }
                    let childBlock = blockArray[r - 1][c - 1];
                    childBlock.classList.add('open');
                    childBlock.open = true;
                    if (childBlock.num === 0) {
                        remanentSafeBlock = remanentSafeBlock - 1;
                        queue.push(childBlock);
                    } else {
                        openNumber(childBlock);
                    }
                }
            }
        }
    }

    function openBlock(e) {
        /**
         * 翻开一个方块
         */
        const btn = e.target;
        if (btn.open) {
            return undefined;
        }
        if (isFirstOpen) {
            isFirstOpen = false;
            generateGameAreaArray();
            generateMines(btn.row, btn.col);
            generateNumber();
            setGameAreaArrayToHTML();
            remanentSafeBlock = rows * cols - mines;
        }
        btn.classList.add('open');
        btn.open = true;
        if (btn.num === -1) {
            openMine(btn);
            return undefined;
        }
        if (btn.num === 0) {
            openZero(btn);
        } else {
            openNumber(btn);
        }
        if (remanentSafeBlock === 0) {
            alert('你赢了！');
        }
    }

    function generateGameAreaArray() {
        /**
         * 生成游戏棋盘的逻辑数组
         */
        gameAreaArray = get2DArray(rows + 2, cols + 2, 0);
        for (let r = 0; r < rows + 2; r++) {
            for (let c = 0; c < cols + 2; c++) {
                if (r === 0 || r == rows + 1 || c === 0 || c === cols + 1) {
                    gameAreaArray[r][c] = -2;
                }
            }
        }
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
                if (gameAreaArray[r][c] !== -2) {
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

    function setGameAreaArrayToHTML() {
        /**
         * 将逻辑数组的数值设置到页面的按钮中
         */
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                blockArray[r][c].num = gameAreaArray[r + 1][c + 1];
            }
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
})();