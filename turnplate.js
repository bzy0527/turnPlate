DBFX.RegisterNamespace("DBFX.Web.Draw");
DBFX.RegisterNamespace("DBFX.Design");
DBFX.RegisterNamespace("DBFX.Serializer");
DBFX.RegisterNamespace("DBFX.Design.ControlDesigners");


//转盘
DBFX.Web.Controls.TurnPlate = function (t) {
    if (t == undefined)
        t = "TurnPlate";
    var tp = new DBFX.Web.Controls.Control(t);

    tp.ClassDescriptor.Designers.splice(1, 0, "DBFX.Design.ControlDesigners.TurnPlateDesigner");
    tp.ClassDescriptor.Serializer = "DBFX.Serializer.TurnPlateSerializer";
    tp.VisualElement = document.createElement("div");
    tp.VisualElement.className = "TurnPlate";

    tp.OnCreateHandle();
    tp.OnCreateHandle = function () {
        tp.VisualElement.innerHTML = "<canvas class='TurnPlate_Canvas'></canvas><img class='TurnPlate_StartImg'>";

        //canvas对象
        tp.canvas = tp.VisualElement.querySelector("canvas.TurnPlate_Canvas");
        tp.context = tp.canvas.getContext("2d");

        tp.StartBtn = tp.VisualElement.querySelector("img.TurnPlate_StartImg");

        //开始按钮点击事件绑定
        tp.StartBtn.onmousedown = tp.startBtnClick;

        //tp.canvas.clientWidth

        tp.canvas.width = 300;
        tp.canvas.height = 300;


        //"Themes/" + app.CurrentTheme + "/Images/SearchBox/searchIcon.png";
        //默认的背景图片
        //默认的开始图片
        // tp.VisualElement.style.backgroundImage = "url(./turnplate-bg.png)";
        // tp.StartBtn.src = "./turnplate-pointer.png";

        //TODO:砚台使用
        tp.VisualElement.style.backgroundImage = "url(" + "Themes/" + app.CurrentTheme + "/Images/TurnPlate/turnplate-bg.png" + ")";
        tp.StartBtn.src = "Themes/" + app.CurrentTheme + "/Images/TurnPlate/turnplate-pointer.png";

        // tp.drawWheel();
    }

    tp.SetHeight = function (v) {
        tp.VisualElement.style.height = v;
        var cssObj = window.getComputedStyle(tp.VisualElement, null);
        var h = cssObj.height;
        tp.canvas.height = parseFloat(h);
    }

    tp.SetWidth = function (v) {
        tp.VisualElement.style.width = v;
        var cssObj = window.getComputedStyle(tp.VisualElement, null);
        var w = cssObj.width;
        tp.canvas.width = parseFloat(w);
    }

    tp.SetFontSize = function (v) {
        tp.fontSize = v;
    }

    tp.SetFontFamily = function (v) {
        tp.fontFamily = v;
    }

    tp.SetFontStyle = function (v) {
        tp.fontStyle = v;
    }

    tp.SetColor = function (v) {
        tp.fontColor = v;
    }

    //设置选中奖品的位置
    tp.selectedIndex = undefined;
    Object.defineProperty(tp, "SelectedIndex", {
        get: function () {
            return tp.selectedIndex;
        },
        set: function (v) {
            tp.selectedIndex = v * 1;
        }
    });

    //是否可以旋转
    tp.canRotate = true;
    Object.defineProperty(tp, "CanRotate", {
        get: function () {
            return tp.canRotate;
        },
        set: function (v) {
            tp.canRotate = v;
        }
    });

    //背景图片
    tp.bgImg = "";
    Object.defineProperty(tp, "BgImg", {
        get: function () {

            return tp.bgImg;

        },
        set: function (v) {

            tp.bgImg = v;
            tp.VisualElement.style.backgroundImage = "url(" + v + ")";
        }
    });

    //开始图片
    tp.startImg = "";
    Object.defineProperty(tp, "StartImg", {
        get: function () {

            return tp.startImg;

        },
        set: function (v) {

            tp.startImg = v;
            tp.StartBtn.src = v;
        }
    });

    //奖品数据设置
    tp.itemSource = [];
    Object.defineProperty(tp, "ItemSource", {
        get: function () {

            return tp.itemSource;

        },
        set: function (v) {

            tp.itemSource = v;
            // tp.drawWheel();
            tp.drawWheel();
        }
    });


    //FIXME:保存图片
    tp.images = [];
    tp.angles = [];

    //timeoutId
    tp.timeoutId = undefined;

    //起始角度
    tp.startAngle = 0;

    //旋转角度
    tp.rotateAngle = 0;

    //总旋转角度
    tp.totalAngle = 0;

    //是否在旋转 false:停止; true:旋转;
    tp.bRotate = false;

    //设置奖品位置  从0开始
    tp.awardIndex = undefined;

    //抽到的奖品
    tp.getAward = undefined;

    //TODO：旋转到的角度  根据奖品的位置进行计算
    tp.animateTo = 0;

    //外圆半径
    Object.defineProperty(tp, "OutsideRadius", {
        get: function () {

            return tp.outsideRadius;

        },
        set: function (v) {

            tp.outsideRadius = v;
        }
    });


    //内圆半径
    Object.defineProperty(tp, "InsideRadius", {
        get: function () {

            return tp.insideRadius;

        },
        set: function (v) {

            tp.insideRadius = v;
        }
    });


    //文字所在半径
    Object.defineProperty(tp, "TextRadius", {
        get: function () {

            return tp.textRadius;

        },
        set: function (v) {

            tp.textRadius = v;
        }
    });


    //奖品文字颜色
    tp.textColor = "#1c1c1c";
    Object.defineProperty(tp, "TextColor", {
        get: function () {

            return tp.textColor;

        },
        set: function (v) {

            tp.textColor = v;
        }
    });

    //旋转时间  毫秒ms
    tp.duration = 8000;
    Object.defineProperty(tp, "Duration", {
        get: function () {

            return tp.duration;

        },
        set: function (v) {

            tp.duration = v * 1 ? v * 1 : 8000;
        }
    });

    //旋转圈数
    tp.rCount = 10;
    Object.defineProperty(tp, "RCount", {
        get: function () {

            return tp.rCount;

        },
        set: function (v) {
            tp.rCount = v * 1 ? v * 1 : 10;
            tp.rCount = Math.ceil(Math.abs(tp.rCount));
        }
    });


    //绘制转盘
    tp.drawWheel = function () {

        var loadC = 0;//有效图片加载的次数
        var imageC = 0;//有效图片的数量
        tp.images = [];

        for (var k = 0; k < tp.itemSource.length; k++) {
            //FIXME:绘制对应图标
            var img = document.createElement("img");
            if(tp.itemSource[k].imgSrc){
                imageC++;
                img.src = tp.itemSource[k].imgSrc;
            }
            tp.images.push(img);

            //没有图片时
            if(imageC <1){
                //开始绘制转盘
                tp.angles = [];

                if (!tp.canvas.getContext) return;

                //tp.canvas.clientWidth
                var w = tp.canvas.width;

                //tp.canvas.clientHeight
                var h = tp.canvas.height;

                w = w <= h ? w : h;

                tp.outsideRadius = 0.45 * w;
                tp.insideRadius = 0.16 * w;
                tp.textRadius = 0.367 * w;


                var outsideR = tp.outsideRadius;
                var ctx = tp.context;
                var radius = w * 0.5;

                // ctx.restore();
                // ctx.translate(w * 0.5, h * 0.5);
                // ctx.rotate(tp.rotateAngle);
                // ctx.translate(-w * 0.5, -w * 0.5);

                ctx.clearRect(0, 0, w, w);

                ctx.strokeStyle = "#FFBE04";
                ctx.fillStyle = "#FFBE04";
                ctx.font = '16px Microsoft YaHei';
                // ctx.arc(radius,radius,radius,0,Math.PI*2);


                //绘制外圈的白点
                // var whiteDotR = (radius+outsideR)*0.50;
                // var dotr = (radius-outsideR)*0.25;
                //
                // ctx.save();
                // ctx.beginPath();
                // ctx.translate(radius,radius);
                //
                // for(var i=0;i<24;i++){
                //     ctx.rotate(Math.PI/12);
                //     ctx.arc(whiteDotR,0,dotr,0,Math.PI*2,true);
                // }
                //
                // ctx.fill();
                // ctx.restore();


                //根据奖品个数计算圆弧角度
                var arc = Math.PI / (tp.itemSource.length / 2);
                for (var i = 0; i < tp.itemSource.length; i++) {
                    var angle = tp.startAngle + i * arc;
                    tp.angles.push(angle);

                    //TODO:渐变色

                    // var grd=ctx.createLinearGradient(0,0,170,0);
                    // grd.addColorStop(0,"black");
                    // grd.addColorStop(1,"white");

                    ctx.fillStyle = tp.itemSource[i].color;
                    ctx.beginPath();
                    //arc(x,y,r,起始角,结束角,绘制方向) 方法创建弧/曲线（用于创建圆或部分圆）
                    ctx.arc(radius, radius, tp.outsideRadius, angle, angle + arc, false);
                    ctx.arc(radius, radius, tp.insideRadius, angle + arc, angle, true);
                    ctx.stroke();
                    ctx.fill();
                    //锁画布(为了保存之前的画布状态)
                    ctx.save();

                    //----绘制奖品开始----
                    ctx.fillStyle = tp.itemSource[i].fontColor || tp.Color == "" ? "#000" : tp.Color;
                    var text = tp.itemSource[i].text;
                    var line_height = 14;
                    // translate方法重新映射画布上的 (0,0) 位置
                    ctx.translate(radius + Math.cos(angle + arc / 2) * tp.textRadius, radius + Math.sin(angle + arc / 2) * tp.textRadius);
                    //rotate方法旋转当前的绘图
                    ctx.rotate(angle + arc / 2 + Math.PI / 2);

                    //TODO:文字沿着弧线绘制
                    var fontStyle = tp.itemSource[i].fontStyle || tp.FontStyle;
                    var fontSize = tp.itemSource[i].fontSize || tp.FontSize;
                    var fontFamily = tp.itemSource[i].fontFamily || tp.FontFamily;

                    //绘制奖品描述
                    //TODO:字体样式的设定
                    // ctx.font = 'bold 11px YouYuan';
                    ctx.font = fontStyle+" "+fontSize+" "+fontFamily;
                    if (text.length > 6) {
                        text = text.substring(0, 6) + "||" + text.substring(6);
                        var texts = text.split("||");
                        for (var j = 0; j < texts.length; j++) {
                            ctx.fillText(texts[j], -ctx.measureText(texts[j]).width / 2, j * line_height);
                        }
                    } else {
                        ctx.fillText(text, -ctx.measureText(text).width / 2, line_height);
                    }

                    // if(tp.images[i]){
                    //     ctx.drawImage(tp.images[i],0,0,40,40,-15,30,40,40);
                    // }

                    //把当前画布返回（调整）到上一个save()状态之前
                    ctx.restore();
                    //----绘制奖品结束----
                }
            }

            img.onload = function (ev) {
                loadC++;
                if(loadC == imageC){//图像全部加载完毕


                    //开始绘制转盘
                    tp.angles = [];

                    if (!tp.canvas.getContext) return;

                    //tp.canvas.clientWidth
                    var w = tp.canvas.width;

                    //tp.canvas.clientHeight
                    var h = tp.canvas.height;

                    w = w <= h ? w : h;

                    tp.outsideRadius = 0.45 * w;
                    tp.insideRadius = 0.16 * w;
                    tp.textRadius = 0.367 * w;


                    var outsideR = tp.outsideRadius;
                    var ctx = tp.context;
                    var radius = w * 0.5;

                    // ctx.restore();
                    // ctx.translate(w * 0.5, h * 0.5);
                    // ctx.rotate(tp.rotateAngle);
                    // ctx.translate(-w * 0.5, -w * 0.5);

                    ctx.clearRect(0, 0, w, w);

                    ctx.strokeStyle = "#FFBE04";
                    ctx.fillStyle = "#FFBE04";
                    ctx.font = '16px Microsoft YaHei';
                    // ctx.arc(radius,radius,radius,0,Math.PI*2);


                    //绘制外圈的白点
                    // var whiteDotR = (radius+outsideR)*0.50;
                    // var dotr = (radius-outsideR)*0.25;
                    //
                    // ctx.save();
                    // ctx.beginPath();
                    // ctx.translate(radius,radius);
                    //
                    // for(var i=0;i<24;i++){
                    //     ctx.rotate(Math.PI/12);
                    //     ctx.arc(whiteDotR,0,dotr,0,Math.PI*2,true);
                    // }
                    //
                    // ctx.fill();
                    // ctx.restore();


                    //根据奖品个数计算圆弧角度
                    var arc = Math.PI / (tp.itemSource.length / 2);
                    for (var i = 0; i < tp.itemSource.length; i++) {
                        var angle = tp.startAngle + i * arc;
                        tp.angles.push(angle);

                        //TODO:渐变色

                        // var grd=ctx.createLinearGradient(0,0,170,0);
                        // grd.addColorStop(0,"black");
                        // grd.addColorStop(1,"white");

                        ctx.fillStyle = tp.itemSource[i].color;
                        ctx.beginPath();
                        //arc(x,y,r,起始角,结束角,绘制方向) 方法创建弧/曲线（用于创建圆或部分圆）
                        ctx.arc(radius, radius, tp.outsideRadius, angle, angle + arc, false);
                        ctx.arc(radius, radius, tp.insideRadius, angle + arc, angle, true);
                        ctx.stroke();
                        ctx.fill();
                        //锁画布(为了保存之前的画布状态)
                        ctx.save();

                        //----绘制奖品开始----
                        ctx.fillStyle = tp.itemSource[i].fontColor || tp.Color == "" ? "#000" : tp.Color;
                        var text = tp.itemSource[i].text;
                        var line_height = 14;
                        // translate方法重新映射画布上的 (0,0) 位置
                        ctx.translate(radius + Math.cos(angle + arc / 2) * tp.textRadius, radius + Math.sin(angle + arc / 2) * tp.textRadius);
                        //rotate方法旋转当前的绘图
                        ctx.rotate(angle + arc / 2 + Math.PI / 2);

                        //TODO:文字沿着弧线绘制
                        var fontStyle = tp.itemSource[i].fontStyle || tp.FontStyle;
                        var fontSize = tp.itemSource[i].fontSize || tp.FontSize;
                        var fontFamily = tp.itemSource[i].fontFamily || tp.FontFamily;

                        //绘制奖品描述
                        //TODO:字体样式的设定
                        // ctx.font = 'bold 11px YouYuan';
                        ctx.font = fontStyle+" "+fontSize+" "+fontFamily;
                        if (text.length > 6) {
                            text = text.substring(0, 6) + "||" + text.substring(6);
                            var texts = text.split("||");
                            for (var j = 0; j < texts.length; j++) {
                                ctx.fillText(texts[j], -ctx.measureText(texts[j]).width / 2, j * line_height);
                            }
                        } else {
                            ctx.fillText(text, -ctx.measureText(text).width / 2, line_height);
                        }

                        if(tp.images[i]){
                            ctx.drawImage(tp.images[i],0,0,40,40,-15,30,40,40);
                        }

                        //把当前画布返回（调整）到上一个save()状态之前
                        ctx.restore();
                        //----绘制奖品结束----
                    }
                }
            }
        }
    }

    //生成n-m之间的整数随机数
    tp.getRandom = function (n, m) {
        var random = Math.floor(Math.random() * (m - n + 1) + n);
        return random;
    }

    //标记是否在执行动画
    tp.isAnimate = false;
    //开始按钮点击事件
    tp.startBtnClick = function (ev) {
        if(!tp.enabled) return;

        if(tp.isAnimate)return;
        tp.isAnimate = !tp.isAnimate;

        //添加开始动画事件
        if (tp.RotateStart != undefined) {
            if (tp.RotateStart.GetType != undefined && tp.RotateStart.GetType() == "Command") {
                tp.RotateStart.Sender = tp;
                tp.RotateStart.Execute();
            }

            if (typeof (tp.RotateStart) == "function")
                tp.RotateStart(ev);
        }

        //开始旋转动画
        tp.startAnimate();
    }


    //开始旋转  转到指定奖品停止
    tp.startAnimate = function () {
        if (tp.bRotate) return;
        //不可以旋转则不执行旋转动画
        if (!tp.canRotate) return;

        tp.bRotate = !tp.bRotate;

        if (tp.timeoutId) {
            clearTimeout(tp.timeoutId);
        }

        //FIXME：计算需要旋转到的奖品位置（角度）选取的index为0时
        tp.index = isNaN(parseInt(tp.selectedIndex)) ? tp.getRandom(0, tp.itemSource.length - 1) : parseInt(tp.selectedIndex);

        tp.animateTo = tp.getTotalRotateA(tp.index, tp.rCount);

        //记录开始时间
        tp.startTime = +new Date();
        //起始角度
        tp.startA = 0;
        //旋转动画
        tp.animate();
    }

    //旋转动画
    tp.animate = function () {

        var actualTime = +new Date();
        var checkEnd = actualTime - tp.startTime > tp.duration;

        //达到指定的动画时间停止动画
        if (checkEnd) {
            tp.stopAnimate();
        } else {
            var angle = tp.easing(0, actualTime - tp.startTime, tp.startA, tp.animateTo - tp.startA, tp.duration);
            tp.canvas.style.transform = "rotate(" + ((~~(angle * 10)) / 10 % 360) + "deg)";
            //旋转了多少度
            tp.allRotate = (~~(angle * 10)) / 10 % 360;
            tp.timeoutId = setTimeout(tp.animate, 10);
        }

    }

    //计算需要旋转的总角度  index从0开始  n-一共旋转多少圈
    tp.getTotalRotateA = function (index, n) {
        n = !(n * 1) ? 10 : n * 1;

        var aveA = tp.itemSource.length ? 360 / tp.itemSource.length : 0;

        //随机停在合理的角度区间
        var angles = index * aveA + aveA * (tp.getRandom(2, 8) / 10);
        if (angles < 270) {
            angles = 270 - angles;
        } else {
            angles = 360 - angles + 270;
        }
        tp.animateTo = angles + 360 * n;
        return tp.animateTo;
    }


    //旋转速度曲线方法（Tween公式）
    tp.easing = function (x, t, b, c, d) {
        return -c * ((t = t / d - 1) * t * t * t - 1) + b;
    }

    //停止动画
    tp.stopAnimate = function () {
        clearTimeout(tp.timeoutId);

        tp.bRotate = false;
        tp.isAnimate = false;

        if(!isNaN(tp.index)){
            tp.SelectedData = tp.itemSource[tp.index];
        }else {
            tp.SelectedData = null;
        }

        console.log(tp.SelectedData);

        //TODO:添加停止动画事件
        if (tp.RotateStop != undefined) {
            if (tp.RotateStop.GetType != undefined && tp.RotateStop.GetType() == "Command") {
                tp.RotateStop.Sender = tp;
                tp.RotateStop.Execute();
            }

            if (typeof (tp.RotateStop) == "function")
                tp.RotateStop();
        }
    }


    tp.OnCreateHandle();
    return tp;
}

//序列化
DBFX.Serializer.TurnPlateSerializer = function () {

    //反系列化
    this.DeSerialize = function (c, xe, ns) {
        DBFX.Serializer.DeSerialProperty("StartImg", c, xe);
        DBFX.Serializer.DeSerialProperty("BgImg", c, xe);
        DBFX.Serializer.DeSerialProperty("Duration", c, xe);
        DBFX.Serializer.DeSerialProperty("RCount", c, xe);

        //对方法反序列化
        DBFX.Serializer.DeSerializeCommand("RotateStop", xe, c);
        DBFX.Serializer.DeSerializeCommand("RotateStart", xe, c);

    }

    //系列化
    this.Serialize = function (c, xe, ns) {
        DBFX.Serializer.SerialProperty("StartImg", c.StartImg, xe);
        DBFX.Serializer.SerialProperty("BgImg", c.BgImg, xe);
        DBFX.Serializer.SerialProperty("Duration", c.Duration, xe);
        DBFX.Serializer.SerialProperty("RCount", c.RCount, xe);


        //序列化方法
        DBFX.Serializer.SerializeCommand("RotateStop", c.RotateStop, xe);
        DBFX.Serializer.SerializeCommand("RotateStart", c.RotateStart, xe);

    }
}

//设计器
DBFX.Design.ControlDesigners.TurnPlateDesigner = function () {

    var obdc = new DBFX.Web.Controls.GroupPanel();
    obdc.OnCreateHandle();
    obdc.OnCreateHandle = function () {

        DBFX.Resources.LoadResource("design/DesignerTemplates/FormDesignerTemplates/TurnPlateDesigner.scrp", function (od) {

            od.DataContext = obdc.dataContext;
            //设计器中绑定事件处理
            od.EventListBox = od.FormContext.Form.FormControls.EventListBox;
            od.EventListBox.ItemSource = [{ EventName: "RotateStart", EventCode: undefined, Command: od.dataContext.RotateStart, Control: od.dataContext },
                { EventName: "RotateStop", EventCode: undefined, Command: od.dataContext.RotateStop, Control: od.dataContext }];

        }, obdc);
    }

    //事件处理程序
    obdc.DataContextChanged = function (e) {
        obdc.DataBind(e);
        if (obdc.EventListBox != undefined) {
            obdc.EventListBox.ItemSource = [{ EventName: "RotateStart", EventCode: undefined, Command: obdc.dataContext.RotateStart, Control: obdc.dataContext },
                { EventName: "RotateStop", EventCode: undefined, Command: obdc.dataContext.RotateStop, Control: obdc.dataContext }];
        }
    }

    obdc.HorizonScrollbar = "hidden";
    obdc.OnCreateHandle();
    obdc.Class = "VDE_Design_ObjectGeneralDesigner";
    obdc.Text = "旋转转盘设置";
    return obdc;
}