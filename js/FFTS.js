function fft(dataArray) {
    // 复数乘法
    this.mul = function(a, b) {
        if (typeof(a) !== 'object') {
            a = { real: a, imag: 0 }
        }
        if (typeof(b) !== 'object') {
            b = { real: b, imag: 0 }
        }
        return {
            real: a.real * b.real - a.imag * b.imag,
            imag: a.real * b.imag + a.imag * b.real
        };
    };

    // 复数加法
    this.add = function(a, b) {
        if (typeof(a) !== 'object') {
            a = { real: a, imag: 0 }
        }
        if (typeof(b) !== 'object') {
            b = { real: b, imag: 0 }
        }
        return {
            real: a.real + b.real,
            imag: a.imag + b.imag
        };
    };

    // 复数减法
    this.sub = function(a, b) {
        if (typeof(a) !== 'object') {
            a = { real: a, imag: 0 }
        }
        if (typeof(b) !== 'object') {
            b = { real: b, imag: 0 }
        }
        return {
            real: a.real - b.real,
            imag: a.imag - b.imag
        };
    };

    // 倒位序排列
    this.sort = function(data, r) {
        if (data.length <= 2) {
            return data;
        }
        var index = [0, 1];
        for (var i = 0; i < r - 1; i++) {
            var tempIndex = [];
            for (var j = 0; j < index.length; j++) {
                tempIndex[j] = index[j] * 2;
                tempIndex[j + index.length] = index[j] * 2 + 1;
            }
            index = tempIndex;
        }
        var datatemp = [];
        for (var i = 0; i < index.length; i++) {
            datatemp.push(data[index[i]]);
        }
        return datatemp;
    };

    var dataLen = dataArray.length;
    var r = 1; // 迭代次数
    var i = 1;
    while (i * 2 < dataLen) {
        i *= 2;
        r++;
    }
    var count = 1 << r; // 相当于count=2^r

    // 如果数据dataArray的长度不是2^N，则开始补0
    for (var i = dataLen; i < count; i++) {
        dataArray[i] = 0;
    }

    // 倒位序处理
    dataArray = this.sort(dataArray, r);

    // 计算加权系数w
    var w = [];
    for (var i = 0; i < count / 2; i++) {
        var angle = -i * Math.PI * 2 / count;
        w.push({ real: Math.cos(angle), imag: Math.sin(angle) });
    }

    for (var i = 0; i < r; i++) { // 级循环
        var group = 1 << (r - 1 - i);
        var distance = 1 << i;
        var unit = 1 << i;
        for (var j = 0; j < group; j++) { // 组循环
            var step = 2 * distance * j;
            for (var k = 0; k < unit; k++) { // 计算单元循环
                var temp = this.mul(dataArray[step + k + distance], w[count * k / 2 / distance]);
                dataArray[step + k + distance] = this.sub(dataArray[step + k], temp);
                dataArray[step + k] = this.add(dataArray[step + k], temp);
            }
        }
    }
    return dataArray;
}

function ifft(dataArray) {
    var dataLen = dataArray.length;
    var dataArray1 = [];
    for (var i = 0; i < dataLen; i++) {
        if (typeof(dataArray[i]) != 'object') {
            dataArray1[i] = {
                real: dataArray[i],
                imag: 0
            }
        } else {
            dataArray1[i] = {
                real: dataArray[i].real,
                imag: -dataArray[i].imag
            }
        }

    }


    var dataArray3 = fft(dataArray1); //var!!!
    var Length2 = dataArray3.length;
    for (var i = 0; i < Length2; i++) {
        dataArray3[i].real *= 1 / Length2;
        dataArray3[i].imag *= -1 / Length2;
    }
    return dataArray3;
}