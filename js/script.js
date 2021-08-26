//获取默认图片
var img1 = document.getElementById('img1');
var img2 = document.getElementById('img2');
var img3 = document.getElementById('img3');
var img4 = document.getElementById('img4');
var img5 = new Image();


//全局变量
var L = 512; //图片边长
var L2 = Math.ceil(Math.sqrt(2) * L) + 4; //投影边长+冗余量
var rL = 20; //绘制实时投影所需的像素余量
var L3 = L2 + rL * 2; //绘制实时投影的总边长
var tRange = 180; //投影角度范围
var step = 1; //投影步长
var RL = 180; //（初始）投影角度数
var FTL = 1024; //经过FFT后投影的边长

//绘图用画布初始化
var canvas = document.getElementById('originp'); //截面图像
var canvasR = document.getElementById('afterR'); //投影后图像
var canvasL = document.getElementById('oneline'); //实时投影线
var canvasFFT = document.getElementById('FFTp'); //投影后图像
var canvasH = document.getElementById('Hp'); //滤波后图像
var canvasiR = document.getElementById('restorep'); //反投影结果图像
var canvasiFFR = document.getElementById('iFFRp'); //iFFR结果图像
var canvasL2 = document.getElementById('oneline2'); //实时反投影线
var canvas1 = document.getElementById('ans1'); //结果对比图1
var canvas2 = document.getElementById('ans2'); //结果对比图2
var canvas3 = document.getElementById('ans3'); //结果对比图3

//获取画布的内容
var ctx = canvas.getContext('2d');
var ctxR = canvasR.getContext('2d');
var ctxL = canvasL.getContext('2d');
var ctxFFT = canvasFFT.getContext('2d');
var ctxH = canvasH.getContext('2d');
var ctxiR = canvasiR.getContext('2d');
var ctxiFFR = canvasiFFR.getContext('2d');
var ctxL2 = canvasL2.getContext('2d');
var ctx1 = canvas1.getContext('2d');
var ctx2 = canvas2.getContext('2d');
var ctx3 = canvas3.getContext('2d');

//初始化默认图片

ctx.drawImage(img1, 0, 0);
ctx1.drawImage(img1, 0, 0);

//定义画布的内部数据格式
var imageData = ctx.getImageData(0, 0, L, L);
var imageDataR = ctxR.createImageData(L2, RL);
var imageDataL = ctxL.createImageData(L3, L3);
var imageDataFFT = ctxFFT.createImageData(FTL, RL);
var imageDataH = ctxH.createImageData(FTL, RL);
var imageDataiR = ctxiR.createImageData(L, L);
var imageDataiFFR = ctxiFFR.createImageData(L2, RL);
var imageDataL2 = ctxL2.createImageData(L3, L3);
var imageData1 = ctx1.getImageData(0, 0, L, L);
var imageData2 = ctx2.createImageData(L, L);
var imageData3 = ctx3.createImageData(L, L);

//获取直接操纵画布的变量
var data = imageData.data;
var dataR = imageDataR.data;
var dataL = imageDataL.data;
var dataFFT = imageDataFFT.data;
var dataH = imageDataH.data;
var dataiR = imageDataiR.data;
var dataiFFR = imageDataiFFR.data;
var dataL2 = imageDataL2.data;
var data1 = imageData.data1;
var data2 = imageData.data2;
var data3 = imageData.data3;

//跨栏目传输的数据变量
var realRdata = new Array(L2 * RL * 3); //正投影后数据
var HFRdata = []; //滤波后数据
var iFFRdata = []; //iFFT后数据

//获取操纵各个交互元件的变量
var degreebox = document.getElementById("form2"); //正投影角度文本框
var stepbox = document.getElementById("form1"); //正投影步长文本框
var rangebox = document.getElementById("form3"); //正投影范围文本框
var degreebox2 = document.getElementById("form4"); //反投影角度文本框
var startR = document.getElementById('startR'); //正投影按钮
var startF = document.getElementById('startF'); //开始FFT按钮
var startH = document.getElementById('startH'); //滤波按钮
var startiF = document.getElementById('startiF'); //开始iFFT按钮
var startiR = document.getElementById('startiR'); //反投影按钮
var startB = document.getElementById('startB'); //结果比较按钮
var r0 = document.getElementById('r0'); //滤波选项-无
var r1 = document.getElementById('r1'); //滤波选项-RL
var r2 = document.getElementById('r2'); //滤波选项-SL

//开始时禁用靠后的按钮，避免点击引发问题
startF.disabled = true;
startiF.disabled = true;
startH.disabled = true;
startB.disabled = true;
startiR.disabled = true;

//滤波选项切换控制代码
function rcheck0() {
    r0.checked = true;
    r1.checked = false;
    r2.checked = false;
}
r0.addEventListener('click', rcheck0);

function rcheck1() {
    r0.checked = false;
    r1.checked = true;
    r2.checked = false;
}
r1.addEventListener('click', rcheck1);

function rcheck2() {
    r0.checked = false;
    r1.checked = false;
    r2.checked = true;
}
r2.addEventListener('click', rcheck2);

//图片选择界面控制代码
var checkedn = 1;

function cimg1() {
    checkedn = 1;
    //修改原始图片
    ctx.drawImage(img1, 0, 0);
    ctx1.drawImage(img1, 0, 0);
    //在选择图片页面显示选中效果
    $('#ximg1').addClass("active");
    $('#ximg2').removeClass("active");
    $('#ximg3').removeClass("active");
    $('ximg4').removeClass("active");
}

function cimg2() {
    checkedn = 2;
    ctx.drawImage(img2, 0, 0);
    ctx1.drawImage(img2, 0, 0);
    $('#ximg1').removeClass("active");
    $('#ximg2').addClass("active");
    $('#ximg3').removeClass("active");
    $('#ximg4').removeClass("active");
}

function cimg3() {
    checkedn = 3;
    ctx.drawImage(img3, 0, 0);
    ctx1.drawImage(img3, 0, 0);
    $('#ximg1').removeClass("active");
    $('#ximg2').removeClass("active");
    $('#ximg3').addClass("active");
    $('#ximg4').removeClass("active");
}

function cimg4() {
    checkedn = 4;
    ctx.drawImage(img4, 0, 0);
    ctx1.drawImage(img4, 0, 0);
    $('#ximg1').removeClass("active");
    $('#ximg2').removeClass("active");
    $('#ximg3').removeClass("active");
    $('#ximg4').addClass("active");
}

//自定义图像
$(function() {
    $("#file").change(function(e) {
        var file = e.target.files[0] || e.dataTransfer.files[0];
        $('#filelabel').text(document.getElementById("file").files[0].name);
        //在选择图片页面去除选中效果
        $('#ximg1').removeClass("active");
        $('#ximg2').removeClass("active");
        $('#ximg3').removeClass("active");
        $('#ximg4').removeClass("active");
        if (file) {
            var reader = new FileReader();
            reader.onload = function() {
                img5.src = this.result;
            }
            img5.onload = function() {
                ctx.drawImage(img5, 0, 0, 512, 512);
                ctx1.drawImage(img5, 0, 0, 512, 512);
            }

            reader.readAsDataURL(file);
        }
    });
})

//图像调整。用于将值域不固定的图像缩放到指定范围内
var adjustimg = function(imgdata, maxl, minl) {
    var maxnum = 0;
    var minnum = 65535;
    var ajimgdata = new Array(imgdata.length)
    for (var j = 0; j < imgdata.length; j++) {
        maxnum = Math.max(maxnum, imgdata[j]);
        minnum = Math.min(minnum, imgdata[j]);
    }
    for (var j = 0; j < imgdata.length; j++) {
        ajimgdata[j] = (imgdata[j] - minnum) / (maxnum - minnum) * (maxl - minl) + minl;

    }
    return ajimgdata;
}

//第一页代码
var Page1 = function() {
    var i = 0; //第几个角度

    var runflag = false; //是否运行标志

    //开始-暂停状态切换代码
    var rotateflag = function() {
        runflag = !runflag;
        if (runflag) {
            //从文本框中更新信息
            i = Math.floor(Number(degreebox.value) / step);
            step = Number(stepbox.value);
            tRange = Number(rangebox.value) - step;
            startR.innerHTML = "暂停";
            if (!stepbox.disabled) //判断是从头重新启动还是暂停
            {
                //只有当从头开始时刷新投影结果显示页面
                RL = Math.floor(tRange / step);
                canvasR.height = RL;
                imageDataR = ctxR.createImageData(L2, RL);
                var dataL = imageDataL.data;
                refreshP1();
            }

            //运行过程中锁定特定文本框避免意外修改
            stepbox.disabled = true;
            rangebox.disabled = true;

            //交由专门的函数来将每个角度依次像动画一样执行
            window.requestAnimationFrame(onestep);
        } else {
            startR.innerHTML = "运行";
        }
    }

    //刷新图像代码，用于清空数据重新初始化
    var refreshP1 = function() {
        imageData = ctx.getImageData(0, 0, L, L);
        imageDataR = ctxR.createImageData(L2, RL);
        imageDataL = ctxL.createImageData(L3, L3);

        //刷新后以下关系必须重新建立
        data = imageData.data;
        dataR = imageDataR.data;
        dataL = imageDataL.data;

        //由于投影结果是累加的，因此必须置零
        realRdata = new Array(L2 * RL * 3);
        for (var j = 0; j < L2 * RL * 3; j++) {
            realRdata[j] = 0;
        }

        //投影显示置零
        for (var l = 0; l < RL; l++) {
            for (var j = 0; j < L2; j++) {
                dataR[L2 * l * 4 + j * 4 + 0] = 0;
                dataR[L2 * l * 4 + j * 4 + 1] = 0;
                dataR[L2 * l * 4 + j * 4 + 2] = 0;
                dataR[L2 * l * 4 + j * 4 + 3] = 255;
            }
        }

        //实时投影线初始化
        for (var l = 0; l < L3; l++) {
            for (var j = rL; j < L2 + rL; j++) {
                //初始状态的两条带格子黑线的建立
                dataL[L3 * l * 4 + j * 4 + 0] = 200 * (j % 7 > 3);
                dataL[L3 * l * 4 + j * 4 + 1] = 200 * (j % 7 > 3);
                dataL[L3 * l * 4 + j * 4 + 2] = 200 * (j % 7 > 3);
                dataL[L3 * l * 4 + j * 4 + 3] = 255;
            }
        }
        for (var l = rL; l < L3 - rL; l++) {
            for (var j = rL; j < L2 + rL; j++) {
                dataL[L3 * l * 4 + j * 4 + 0] = 0;
                dataL[L3 * l * 4 + j * 4 + 1] = 0;
                dataL[L3 * l * 4 + j * 4 + 2] = 0;
                //设置两条投影线之间区域的透明度，此后保持不变
                dataL[L3 * l * 4 + j * 4 + 3] = 30;
            }
        }

        //将数据输出显示
        ctxL.putImageData(imageDataL, 0, 0);
        ctxR.putImageData(imageDataR, 0, 0);
    }
    refreshP1();


    //每一个角度的投影运算
    var onestep = function() {
        //设置旋转的投影线动画
        $('#oneline').css("transform", 'rotate(' + (-i * step) + 'deg)');

        //计算角度
        var theta = i * Math.PI / 180 * step;

        //投影线临时存储变量
        var datatemp = new Array(L2 * 3)
        for (var j = 0; j < L2 * 3; j++) {
            datatemp[j] = 0;
        }

        //采用一个像素分成四个分别投影的方法提高投影质量
        for (var u = 0; u < 4; u++) {
            //计算分出的新像素的偏移量
            var x0 = (u % 2) / 2 - 1 / 4;
            var y0 = Math.floor(u / 2) / 2 - 1 / 4;

            for (var j = 0; j < L; j++) {
                for (var k = 0; k < L; k++) {
                    //计算要投影的矢量
                    var x = j - (L - 1) / 2 + x0;
                    var y = k - (L - 1) / 2 + y0;

                    //计算出投影位置，为线性内插做准备
                    var p = -Math.sin(theta) * x + Math.cos(theta) * y + (L2 - 1) / 2;
                    var p1 = Math.floor(p);
                    var p2 = p1 + 1;

                    //通过线性内插分别计算R、G、B三通道的结果
                    datatemp[p1 * 3 + 0] += data[j * (imageData.width * 4) + k * 4 + 0] * (p2 - p);
                    datatemp[p2 * 3 + 0] += data[j * (imageData.width * 4) + k * 4 + 0] * (p - p1);

                    datatemp[p1 * 3 + 1] += data[j * (imageData.width * 4) + k * 4 + 1] * (p2 - p);
                    datatemp[p2 * 3 + 1] += data[j * (imageData.width * 4) + k * 4 + 1] * (p - p1);

                    datatemp[p1 * 3 + 2] += data[j * (imageData.width * 4) + k * 4 + 2] * (p2 - p);
                    datatemp[p2 * 3 + 2] += data[j * (imageData.width * 4) + k * 4 + 2] * (p - p1);
                }
            }

        }

        //把临时结果存入完整的表中
        for (var j = 0; j < L2; j++) {
            realRdata[L2 * i * 3 + j * 3 + 0] = datatemp[j * 3 + 0];
            realRdata[L2 * i * 3 + j * 3 + 1] = datatemp[j * 3 + 1];
            realRdata[L2 * i * 3 + j * 3 + 2] = datatemp[j * 3 + 2];
        }

        //调整图像值域，并显示
        var ajRdata = adjustimg(realRdata, 255, 0);
        for (var l = 0; l < RL; l++) {
            for (var j = 0; j < L2; j++) {
                dataR[L2 * l * 4 + j * 4 + 0] = ajRdata[L2 * l * 3 + j * 3 + 0];
                dataR[L2 * l * 4 + j * 4 + 1] = ajRdata[L2 * l * 3 + j * 3 + 1];
                dataR[L2 * l * 4 + j * 4 + 2] = ajRdata[L2 * l * 3 + j * 3 + 2];
            }
        }

        var ajdatatemp = adjustimg(datatemp, 255, 0);
        for (var l = rL; l < L3; l++) {
            for (var j = rL; j < L2 + rL; j++) {
                dataL[L3 * l * 4 + j * 4 + 0] = ajdatatemp[(j - rL) * 3 + 0];
                dataL[L3 * l * 4 + j * 4 + 1] = ajdatatemp[(j - rL) * 3 + 1];
                dataL[L3 * l * 4 + j * 4 + 2] = ajdatatemp[(j - rL) * 3 + 2];
            }
        }

        ctxL.putImageData(imageDataL, 0, 0);
        ctxR.putImageData(imageDataR, 0, 0);

        //继续还是停止判定
        if (i++ < Math.floor(tRange / step)) {
            degreebox.value = i * step; //实时更新文本框中的角度
            if (runflag)
                window.requestAnimationFrame(onestep);
        } else {
            degreebox.value = 0;

            //停止后对文本框的锁定解除
            stepbox.disabled = false;
            rangebox.disabled = false;

            //翻转开始-暂停状态
            rotateflag();

            //解锁下个页面的按钮
            startF.disabled = false;
        }
    }

    //将开始按钮与函数联系起来
    startR.addEventListener('click', rotateflag);
}
Page1();


var Page2 = function() {
    var FRdata = [], //FFT处理后结果
        sFRdata = [], //FFT处理后再取log结果
        sHFRdata = []; //滤波后再取log结果

    var refreshP2 = function() {
        FRdata = [];
        sFRdata = [];
        HFRdata = [];
        sHFRdata = [];
        canvasFFT.height = RL;
        canvasH.height = RL;
        imageDataFFT = ctxFFT.createImageData(FTL, RL);
        imageDataH = ctxH.createImageData(FTL, RL);
        dataFFT = imageDataFFT.data;
        dataH = imageDataH.data;
        for (var l = 0; l < RL; l++) {
            for (var j = 0; j < FTL; j++) {
                dataFFT[FTL * l * 4 + j * 4] = 0;
                dataFFT[FTL * l * 4 + j * 4 + 1] = 0;
                dataFFT[FTL * l * 4 + j * 4 + 2] = 0;
                dataFFT[FTL * l * 4 + j * 4 + 3] = 255;
            }
        }
        for (var l = 0; l < RL; l++) {
            for (var j = 0; j < FTL; j++) {
                dataH[FTL * l * 4 + j * 4] = 0;
                dataH[FTL * l * 4 + j * 4 + 1] = 0;
                dataH[FTL * l * 4 + j * 4 + 2] = 0;
                dataH[FTL * l * 4 + j * 4 + 3] = 255;
            }
        }
        ctxFFT.putImageData(imageDataFFT, 0, 0);
        ctxH.putImageData(imageDataH, 0, 0);
    }
    refreshP2();


    var i = 0;
    //每一行FFT
    var FFTstep = function() {
        //三通道分别提取，并进行FFT
        var dt1 = [],
            dt2 = [],
            dt3 = [];
        for (var j = 0; j < L2; j++) {
            dt1.push(realRdata[L2 * i * 3 + j * 3 + 0]);
            dt2.push(realRdata[L2 * i * 3 + j * 3 + 1]);
            dt3.push(realRdata[L2 * i * 3 + j * 3 + 2]);
        }
        var dtF1 = fft(dt1),
            dtF2 = fft(dt2),
            dtF3 = fft(dt3);

        for (var j = 0; j < FTL; j++) {
            FRdata[FTL * i * 3 + j * 3 + 0] = dtF1[j];
            FRdata[FTL * i * 3 + j * 3 + 1] = dtF2[j];
            FRdata[FTL * i * 3 + j * 3 + 2] = dtF3[j];
        }

        FRdataT = [];

        //类似MATLAB中fftshift，将低频移至中央
        for (var j = 0; j < FTL; j++) {
            FRdataT[FTL * i * 3 + j * 3 + 0] = FRdata[FTL * i * 3 + (Math.floor(j + FTL / 2) % FTL) * 3 + 0];
            FRdataT[FTL * i * 3 + j * 3 + 1] = FRdata[FTL * i * 3 + (Math.floor(j + FTL / 2) % FTL) * 3 + 1];
            FRdataT[FTL * i * 3 + j * 3 + 2] = FRdata[FTL * i * 3 + (Math.floor(j + FTL / 2) % FTL) * 3 + 2];
        }
        for (var j = 0; j < FTL; j++) {
            FRdata[FTL * i * 3 + j * 3 + 0] = FRdataT[FTL * i * 3 + j * 3 + 0];
            FRdata[FTL * i * 3 + j * 3 + 1] = FRdataT[FTL * i * 3 + j * 3 + 1];
            FRdata[FTL * i * 3 + j * 3 + 2] = FRdataT[FTL * i * 3 + j * 3 + 2];
        }

        //对输出图像进行log变换便于显示
        for (var j = FTL * i * 3; j < FTL * (i + 1) * 3; j++) {
            sFRdata[j] = Math.log10(FRdata[j].real * FRdata[j].real + FRdata[j].imag * FRdata[j].imag + 1);
        }

        //规范图像值域便于输出
        var ajFRdata = adjustimg(sFRdata, 255, 0);
        for (var l = 0; l < RL; l++) {
            for (var j = 0; j < FTL; j++) {
                dataFFT[FTL * l * 4 + j * 4 + 0] = ajFRdata[FTL * l * 3 + j * 3 + 0];
                dataFFT[FTL * l * 4 + j * 4 + 1] = ajFRdata[FTL * l * 3 + j * 3 + 1];
                dataFFT[FTL * l * 4 + j * 4 + 2] = ajFRdata[FTL * l * 3 + j * 3 + 2];
            }
        }

        ctxFFT.putImageData(imageDataFFT, 0, 0);

        if (i++ < RL)
            window.requestAnimationFrame(FFTstep);
        else {
            startF.disabled = false;
            startH.disabled = false; //解锁下游按钮
        }
    }

    //FFT初始化和启动函数
    var sFFT = function() {
        startF.disabled = true;
        refreshP2();
        i = 0;
        window.requestAnimationFrame(FFTstep);
    }

    //每一行滤波
    var Hstep = function() {
        for (var j = 0; j < FTL; j++) {
            var H; //滤波因子
            if (r1.checked) {
                H = Math.abs(j - (FTL) / 2); //RL滤波

            } else if (r2.checked) {
                H = Math.abs(j - (FTL) / 2);
                H = H * Math.sin(Math.PI * H / FTL * 2) / (Math.PI * H / FTL * 2 + 0.001); //SL滤波
            } else {
                H = 1; //无滤波
            }
            HFRdata[FTL * i * 3 + j * 3 + 0] = mul(FRdata[FTL * i * 3 + j * 3 + 0], H);
            HFRdata[FTL * i * 3 + j * 3 + 1] = mul(FRdata[FTL * i * 3 + j * 3 + 1], H);
            HFRdata[FTL * i * 3 + j * 3 + 2] = mul(FRdata[FTL * i * 3 + j * 3 + 2], H);
        }

        for (var j = FTL * i * 3; j < FTL * (i + 1) * 3; j++) {
            sHFRdata[j] = Math.log10(HFRdata[j].real * HFRdata[j].real + HFRdata[j].imag * HFRdata[j].imag + 1);
        }

        var ajHFRdata = adjustimg(sHFRdata, 255, 0);
        for (var l = 0; l < RL; l++) {
            for (var j = 0; j < FTL; j++) {
                dataH[FTL * l * 4 + j * 4 + 0] = ajHFRdata[FTL * l * 3 + j * 3 + 0];
                dataH[FTL * l * 4 + j * 4 + 1] = ajHFRdata[FTL * l * 3 + j * 3 + 1];
                dataH[FTL * l * 4 + j * 4 + 2] = ajHFRdata[FTL * l * 3 + j * 3 + 2];
            }
        }

        ctxH.putImageData(imageDataH, 0, 0);

        if (i++ < RL)
            window.requestAnimationFrame(Hstep);
        else {
            startH.disabled = false;
            startiF.disabled = false; //解锁下游按钮
        }
    }

    //滤波初始化和启动函数
    var sH = function() {
        i = 0;
        startH.disabled = true;
        window.requestAnimationFrame(Hstep);
    }

    startF.addEventListener('click', sFFT);
    startH.addEventListener('click', sH);
}
Page2();



var Page3 = function() {
    var i = 0;
    var siFFRdata = [],
        HFRdata2 = [];
    var refreshP3 = function() {
        canvasiFFR.height = RL;

        imageDataiR = ctxiR.createImageData(L, L);
        imageDataiFFR = ctxiFFR.createImageData(L2, RL);
        imageDataL2 = ctxL2.createImageData(L3, L3);
        dataiR = imageDataiR.data;
        dataiFFR = imageDataiFFR.data;
        dataL2 = imageDataL2.data;

        iFFRdata = [];
        siFFRdata = [];
        HFRdata2 = [];

        for (var l = 0; l < RL; l++) {
            for (var j = 0; j < L2; j++) {
                dataiFFR[L2 * l * 4 + j * 4] = 0;
                dataiFFR[L2 * l * 4 + j * 4 + 1] = 0;
                dataiFFR[L2 * l * 4 + j * 4 + 2] = 0;
                dataiFFR[L2 * l * 4 + j * 4 + 3] = 255;
            }
        }
        for (var l = 0; l < L; l++) {
            for (var j = 0; j < L; j++) {
                dataiR[L * l * 4 + j * 4] = 0;
                dataiR[L * l * 4 + j * 4 + 1] = 0;
                dataiR[L * l * 4 + j * 4 + 2] = 0;
                dataiR[L * l * 4 + j * 4 + 3] = 255;
            }
        }
        for (var l = 0; l < L3; l++) {
            for (var j = rL; j < L2 + rL; j++) {
                dataL2[L3 * l * 4 + j * 4] = 0;
                dataL2[L3 * l * 4 + j * 4 + 1] = 0;
                dataL2[L3 * l * 4 + j * 4 + 2] = 0;
                dataL2[L3 * l * 4 + j * 4 + 3] = 255;
            }
        }
        //反投影的投影线之间没有透明投影印记
        for (var l = rL; l < L3 - rL; l++) {
            for (var j = rL; j < L2 + rL; j++) {
                dataL2[L3 * l * 4 + j * 4] = 0;
                dataL2[L3 * l * 4 + j * 4 + 1] = 0;
                dataL2[L3 * l * 4 + j * 4 + 2] = 0;
                dataL2[L3 * l * 4 + j * 4 + 3] = 0;
            }
        }
        ctxL2.putImageData(imageDataL2, 0, 0);
        ctxiR.putImageData(imageDataiR, 0, 0);
        ctxiFFR.putImageData(imageDataiFFR, 0, 0);
    }
    refreshP3();

    var iFFTstep = function() {

        var HFRdataT = [];

        //fftshift
        for (var j = 0; j < FTL; j++) {
            HFRdataT[FTL * i * 3 + j * 3 + 0] = HFRdata[FTL * i * 3 + (Math.floor(j + FTL / 2) % FTL) * 3 + 0];
            HFRdataT[FTL * i * 3 + j * 3 + 1] = HFRdata[FTL * i * 3 + (Math.floor(j + FTL / 2) % FTL) * 3 + 1];
            HFRdataT[FTL * i * 3 + j * 3 + 2] = HFRdata[FTL * i * 3 + (Math.floor(j + FTL / 2) % FTL) * 3 + 2];
        }
        for (var j = 0; j < FTL; j++) {
            HFRdata2[FTL * i * 3 + j * 3 + 0] = HFRdataT[FTL * i * 3 + j * 3 + 0];
            HFRdata2[FTL * i * 3 + j * 3 + 1] = HFRdataT[FTL * i * 3 + j * 3 + 1];
            HFRdata2[FTL * i * 3 + j * 3 + 2] = HFRdataT[FTL * i * 3 + j * 3 + 2];
        }


        var dt1 = [],
            dt2 = [],
            dt3 = [];
        for (var j = 0; j < FTL; j++) {
            dt1.push(HFRdata2[FTL * i * 3 + j * 3 + 0]);
            dt2.push(HFRdata2[FTL * i * 3 + j * 3 + 1]);
            dt3.push(HFRdata2[FTL * i * 3 + j * 3 + 2]);
        }
        var dtF1 = ifft(dt1),
            dtF2 = ifft(dt2),
            dtF3 = ifft(dt3);

        //需要的图像再ifft结果的左侧
        for (var j = 0; j < L2; j++) {
            iFFRdata[L2 * i * 3 + j * 3 + 0] = dtF1[j];
            iFFRdata[L2 * i * 3 + j * 3 + 1] = dtF2[j];
            iFFRdata[L2 * i * 3 + j * 3 + 2] = dtF3[j];
        }

        //由于FFT结果和滤波函数的对称性，结果中虚部理论上为零，实际上相比实部很小
        for (var j = L2 * i * 3; j < L2 * (i + 1) * 3; j++) {
            siFFRdata[j] = iFFRdata[j].real;
        }

        var ajiFFRdata = adjustimg(siFFRdata, 255, 0);
        for (var l = 0; l < RL; l++) {
            for (var j = 0; j < L2; j++) {
                dataiFFR[L2 * l * 4 + j * 4 + 0] = ajiFFRdata[L2 * l * 3 + j * 3 + 0];
                dataiFFR[L2 * l * 4 + j * 4 + 1] = ajiFFRdata[L2 * l * 3 + j * 3 + 1];
                dataiFFR[L2 * l * 4 + j * 4 + 2] = ajiFFRdata[L2 * l * 3 + j * 3 + 2];
            }
        }

        ctxiFFR.putImageData(imageDataiFFR, 0, 0);

        if (i++ < RL)
            window.requestAnimationFrame(iFFTstep);
        else {
            startiF.disabled = false;
            startiR.disabled = false; //解锁下游按钮
        }

    }

    var siFFT = function() {
        startiF.disabled = true;
        refreshP3();
        i = 0;
        window.requestAnimationFrame(iFFTstep);
    }

    startiF.addEventListener('click', siFFT);


    var runflag = false;
    var startflag = true;
    //反投影中临时变量存的是整张图
    var datatemp = new Array(L * L * 3);

    var rotateflag = function() {
        runflag = !runflag;
        if (runflag) {
            i = Math.floor(Number(degreebox2.value) / step);
            startiR.innerHTML = "暂停反投影";
            if (startflag) {
                startflag = false;
                datatemp = new Array(L * L * 3);
                for (var j = 0; j < L * L * 3; j++) {
                    datatemp[j] = 0;
                }
            }
            window.requestAnimationFrame(onestep);
        } else {
            startiR.innerHTML = "运行反投影";
        }
    }

    var onestep = function() {
        $('#oneline2').css("transform", 'rotate(' + (-i * step) + 'deg)');
        var theta = i * Math.PI / 180 * step;

        //反投影没有像素变四倍的机制
        for (var j = 0; j < L; j++) {
            for (var k = 0; k < L; k++) {
                var x = j - (L - 1) / 2;
                var y = k - (L - 1) / 2;
                var p = -Math.sin(theta) * x + Math.cos(theta) * y + (L2 - 1) / 2;
                var p1 = Math.floor(p);
                var p2 = p1 + 1;

                //反投影同样采用线性插值
                datatemp[j * L * 3 + k * 3 + 0] += iFFRdata[i * L2 * 3 + p1 * 3 + 0].real * (p2 - p);
                datatemp[j * L * 3 + k * 3 + 0] += iFFRdata[i * L2 * 3 + p2 * 3 + 0].real * (p - p1);

                datatemp[j * L * 3 + k * 3 + 1] += iFFRdata[i * L2 * 3 + p1 * 3 + 1].real * (p2 - p);
                datatemp[j * L * 3 + k * 3 + 1] += iFFRdata[i * L2 * 3 + p2 * 3 + 1].real * (p - p1);

                datatemp[j * L * 3 + k * 3 + 2] += iFFRdata[i * L2 * 3 + p1 * 3 + 2].real * (p2 - p);
                datatemp[j * L * 3 + k * 3 + 2] += iFFRdata[i * L2 * 3 + p2 * 3 + 2].real * (p - p1);
            }
        }

        var ajdatatemp = adjustimg(datatemp, 255, 0);

        for (var l = 0; l < L; l++) {
            for (var j = 0; j < L; j++) {
                dataiR[L * l * 4 + j * 4 + 0] = ajdatatemp[L * l * 3 + j * 3 + 0];
                dataiR[L * l * 4 + j * 4 + 1] = ajdatatemp[L * l * 3 + j * 3 + 1];
                dataiR[L * l * 4 + j * 4 + 2] = ajdatatemp[L * l * 3 + j * 3 + 2];
            }
        }

        for (var l = 0; l < L3; l++) {
            for (var j = rL; j < L2 + rL; j++) {
                dataL2[L3 * l * 4 + j * 4 + 0] = dataiFFR[L2 * i * 4 + j * 4 + 0];
                dataL2[L3 * l * 4 + j * 4 + 1] = dataiFFR[L2 * i * 4 + j * 4 + 1];
                dataL2[L3 * l * 4 + j * 4 + 2] = dataiFFR[L2 * i * 4 + j * 4 + 2];
            }
        }

        ctxiR.putImageData(imageDataiR, 0, 0);
        ctxL2.putImageData(imageDataL2, 0, 0);

        if (i++ < Math.floor(tRange / step)) {
            degreebox2.value = i * step;
            if (runflag)
                window.requestAnimationFrame(onestep);
        } else {
            startflag = true;
            degreebox2.value = 0;
            rotateflag();
            startB.disabled = false; //解锁下游按钮
        }
    }

    startiR.addEventListener('click', rotateflag);

}
Page3();


var Page4 = function() {
    //图表数据
    var datax = [];
    var datay = [];

    var refreshP4 = function() {
        datax = [];
        datay = [];
        imageData1 = ctx1.getImageData(0, 0, L, L);
        imageData2 = ctx2.createImageData(L, L);
        imageData3 = ctx3.createImageData(L, L);
        data1 = imageData1.data;
        data2 = imageData2.data;
        data3 = imageData3.data;
        for (var l = 0; l < L; l++) {
            for (var j = 0; j < L; j++) {
                data2[L * l * 4 + j * 4 + 0] = 0;
                data2[L * l * 4 + j * 4 + 1] = 0;
                data2[L * l * 4 + j * 4 + 2] = 0;
                data2[L * l * 4 + j * 4 + 3] = 255;
            }
        }
        for (var l = 0; l < L; l++) {
            for (var j = 0; j < L; j++) {
                data3[L * l * 4 + j * 4 + 0] = 0;
                data3[L * l * 4 + j * 4 + 1] = 0;
                data3[L * l * 4 + j * 4 + 2] = 0;
                data3[L * l * 4 + j * 4 + 3] = 255;
            }
        }
        ctx2.putImageData(imageData2, 0, 0);
        ctx3.putImageData(imageData3, 0, 0);
    }
    refreshP4();

    var compare = function() {
        refreshP4();

        //直接从画布中获取数据
        for (var j = 0; j < L * L * 4; j++)
            data2[j] = dataiR[j];


        //灰色代表两图像一致，亮于灰色代表反投影图像比原图亮
        for (var l = 0; l < L; l++) {
            for (var j = 0; j < L; j++) {
                data3[L * l * 4 + j * 4 + 0] = (data2[L * l * 4 + j * 4 + 0] - data1[L * l * 4 + j * 4 + 0]) + 128;
                data3[L * l * 4 + j * 4 + 1] = (data2[L * l * 4 + j * 4 + 1] - data1[L * l * 4 + j * 4 + 1]) + 128;
                data3[L * l * 4 + j * 4 + 2] = (data2[L * l * 4 + j * 4 + 2] - data1[L * l * 4 + j * 4 + 2]) + 128;
                data3[L * l * 4 + j * 4 + 3] = 255;
            }
        }

        ctx2.putImageData(imageData2, 0, 0);
        ctx3.putImageData(imageData3, 0, 0);

        //X方向过中心点差值
        var l = L / 2 - 1
        for (var j = 0; j < L; j++) {
            var a1 = data2[L * l * 4 + j * 4 + 0] - data1[L * l * 4 + j * 4 + 0];
            var a2 = data2[L * l * 4 + j * 4 + 1] - data1[L * l * 4 + j * 4 + 1];
            var a3 = data2[L * l * 4 + j * 4 + 2] - data1[L * l * 4 + j * 4 + 2];
            datax.push([j + 1, (a1 + a2 + a3) / 3]);
        }

        //Y方向过中心点差值
        var j = L / 2 - 1
        for (var l = 0; l < L; l++) {
            var a1 = data2[L * l * 4 + j * 4 + 0] - data1[L * l * 4 + j * 4 + 0];
            var a2 = data2[L * l * 4 + j * 4 + 1] - data1[L * l * 4 + j * 4 + 1];
            var a3 = data2[L * l * 4 + j * 4 + 2] - data1[L * l * 4 + j * 4 + 2];
            datay.push([l + 1, (a1 + a2 + a3) / 3]);
        }


        optionx = {
            series: [{
                data: datax
            }]
        };
        optiony = {
            series: [{
                data: datay
            }]
        };
        myChartx.setOption(optionx);
        myCharty.setOption(optiony);

    }
    startB.addEventListener('click', compare);


    for (var j = 0; j < L; j++) {
        datax.push([j + 1, 0]);
        datay.push([j + 1, 0]);
    }
    var domx = document.getElementById("linemapx");
    var domy = document.getElementById("linemapy");
    var myChartx = echarts.init(domx);
    var myCharty = echarts.init(domy);
    optionx = null;
    optiony = null;
    optionx = {
        tooltip: {
            trigger: 'axis',
            formatter: function(params) {
                params = params[0];
                return params.value[0] + ' : ' + params.value[1];
            }
        },
        xAxis: {
            type: 'value',
            min: 1,
            max: 512,
            splitLine: {
                show: false
            }
        },
        yAxis: {
            type: 'value'
        },
        series: [{
            data: datax,
            showSymbol: false,
            type: 'line'
        }]
    };
    optiony = {
        tooltip: {
            trigger: 'axis',
            formatter: function(params) {
                params = params[0];
                return params.value[0] + ' : ' + params.value[1];
            }
        },
        xAxis: {
            type: 'value',
            min: 1,
            max: 512,
            splitLine: {
                show: false
            }
        },
        yAxis: {
            type: 'value'
        },
        series: [{
            data: datay,
            showSymbol: false,
            type: 'line'
        }]
    };
    if (optionx && typeof optionx === "object")
        myChartx.setOption(optionx, true);

    if (optiony && typeof optiony === "object")
        myCharty.setOption(optiony, true);

}
Page4();