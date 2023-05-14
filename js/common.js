function inArray(value, array) {
    /**
     * 返回一个值在数组内的下标，若值不在数组内，则返回-1
     */
    for (let i = 0; i < array.length; i++) {
        if (array[i] === value) {
            return i;
        }
    }
    return -1;
}

function get2DArray(rows, cols, value) {
    /**
     * 初始化一个二维数组，初始值默认为0
     */
    if (value === undefined) {
        value = 0;
    }
    const array = [];
    for (let r = 0; r < rows; r++) {
        let arrayRow = [];
        for (let c = 0; c < cols; c++) {
            arrayRow.push(value);
        }
        array.push(arrayRow);
    }
    return array;
}

function print2DArray(array) {
    /**
     * 打印一个二维数组
     */
    const string = [];
    for (let r = 0; r < array.length; r++) {
        for (let c = 0; c < array[r].length; c++) {
            string.push(array[r][c]);
            if (c === array[r].length - 1) {
                string.push('\n');
            } else {
                string.push('\t');
            }
        }
    }
    console.log(string.join(''));
}

function getRandomInt(min, max) {
    /**
     * 返回[min, max)范围的随机整数
     */
    min = Math.ceil(min);
    max = Math.floor(max);
    if (min > max) {
        const t = max;
        max = min;
        min = t;
    }
    return Math.floor(Math.random() * (max - min)) + min;
}

function getRangeArray(start, end, step) {
    /**
     * 生成在[start, end)范围内以step为步长逐渐增长的整数数组
     */
    if (start >= end) {
        throw `生成数区间不能是[${start}, ${end})!`;
    }
    const array = [];
    while (start < end) {
        array.push(start);
        start = start + step;
    }
    return array;
}

function deleteFromArray(array, index) {
    /**
     * 从一维数组中删除指定下标的元素
     */
    if (index < 0 || index >= array.length) {
        throw "数组下标越界";
    }
    for (let i = index + 1; i < array.length; i++) {
        array[i - 1] = array[i];
    }
    array.pop();
}
