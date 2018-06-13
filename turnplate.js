DBFX.RegisterNamespace("DBFX.Web.Draw");
DBFX.RegisterNamespace("DBFX.Design");
DBFX.RegisterNamespace("DBFX.Serializer");
DBFX.RegisterNamespace("DBFX.Design.ControlDesigners");


DBFX.Web.Draw.Tools = {
    print: function (t) {
        //TODO:平台要打开注释,测试要注释这句代码
        // return;

        var printArr = new Array();
        var date = new Date();  //创建对象
        var y = date.getFullYear();     //获取年份
        var m = date.getMonth() + 1;   //获取月份  返回0-11
        var d = date.getDate(); // 获取日
        // var w = date.getDay();   //获取星期几  返回0-6   (0=星期天)
        var h = date.getHours();
        var minute = date.getMinutes()
        var s = date.getSeconds();
        var time = y + "-" + m + "-" + d + "   " + h + ":" + minute + ":" + s;
        printArr.push(time);
        printArr.push('>>>>>>>>>' + t);
        printArr.push('<br>');

        var p = document.getElementsByClassName("print")[0];
        printArr.forEach(function (t2) {
            p.innerHTML += t2;
        });
    },
    //返回一定范围内的随机整数
    randomInt:function (n,m) {
        var random = Math.floor(Math.random()*(m-n+1)+n);
        return random;
    }
}

//抽奖转盘
DBFX.Web.Draw.TurnPlate = function (t) {
    if(t==undefined)
        t = "TurnPlate";
    var turnPlate = new DBFX.Web.Controls.Control(t);

    turnPlate.ClassDescriptor.Designers.splice(1, 0, "DBFX.Design.ControlDesigners.DrawViewDesigner");
    turnPlate.ClassDescriptor.Serializer = "DBFX.Serializer.DrawViewSerializer";

    //TODO:测试代码
    turnPlate.canvas = document.getElementById("wheelcanvas");

    //TODO:平台代码
    // drawV.canvas = document.createElement("canvas");


    turnPlate.context = turnPlate.canvas.getContext("2d");

    //起始角度
    turnPlate.startAngle = 0;

    turnPlate.outsideRadius = 0.45*turnPlate.canvas.clientWidth;
    Object.defineProperty(turnPlate, "OutsideRadius", {
        get: function () {

            return turnPlate.outsideRadius;

        },
        set: function (v) {

            turnPlate.outsideRadius = v;
        }
    });

    turnPlate.insideRadius = 0.16*turnPlate.canvas.clientWidth;
    Object.defineProperty(turnPlate, "InsideRadius", {
        get: function () {

            return turnPlate.insideRadius;

        },
        set: function (v) {

            turnPlate.insideRadius = v;
        }
    });

    turnPlate.textRadius = 0.367*turnPlate.canvas.clientWidth;
    Object.defineProperty(turnPlate, "TextRadius", {
        get: function () {

            return turnPlate.textRadius;

        },
        set: function (v) {

            turnPlate.textRadius = v;
        }
    });

    //奖品文字颜色
    turnPlate.textColor = "#E5302F";
    Object.defineProperty(turnPlate, "TextColor", {
        get: function () {

            return turnPlate.textColor;

        },
        set: function (v) {

            turnPlate.textColor = v;
        }
    });




    //背景图片设置
    turnPlate.bgImgSrc = "turnplate-bg.png";
    turnPlate.pointerImgSrc = "turnplate-pointer.png";

    //旋转角度
    turnPlate.rotateAngle = 0;
    //总旋转角度
    turnPlate.totalAngle = 0;

    //奖品数据设置
    turnPlate.awardDatas = [];

    //旋转时间 毫秒
    turnPlate.durationTime = 0;

    //是否在旋转 false:停止; true:旋转;
    turnPlate.bRotate = false;

    //设置奖品位置  从0开始
    turnPlate.awardIndex = undefined;

    //抽到的奖品
    turnPlate.getAward = undefined;



    //绘制转盘
    turnPlate.drawWheel = function () {
        // DBFX.Web.Draw.Tools.print(turnPlate.canvas.width);

        var w = turnPlate.canvas.clientWidth;
        var h = turnPlate.canvas.clientHeight;

        var outsideR = turnPlate.outsideRadius || 0.45*w;

        var ctx = turnPlate.context;
        var radius = turnPlate.canvas.clientWidth*0.5;
        ctx.restore();

        ctx.translate(turnPlate.canvas.width * 0.5, turnPlate.canvas.height * 0.5);
        ctx.rotate(turnPlate.rotateAngle);
        ctx.translate(-turnPlate.canvas.width * 0.5, -turnPlate.canvas.width * 0.5);

        ctx.clearRect(0,0,turnPlate.canvas.width,turnPlate.canvas.height);
        ctx.strokeStyle = "#FFBE04";
        ctx.fillStyle = "#FFBE04";
        ctx.font = '16px Microsoft YaHei';
        ctx.arc(radius,radius,radius,0,Math.PI*2);

        //绘制外圈的白点
        var whiteDotR = (radius+outsideR)*0.50;
        var dotr = (radius-outsideR)*0.25;

        ctx.save();
        ctx.beginPath();
        ctx.translate(radius,radius);
        // ctx.fillStyle = "white";
        for(var i=0;i<24;i++){
            ctx.rotate(Math.PI/12);
            ctx.arc(whiteDotR,0,dotr,0,Math.PI*2,true);
        }
        // ctx.stroke();
        ctx.fill();
        ctx.restore();

        //背景图像
        // var bgImg = new Image();
        // bgImg.src = turnPlate.bgImgSrc;
        // bgImg.onload = function () {
        //     // ctx.drawImage(bgImg,0,0,bgImg.width,bgImg.height);
        // }
        // ctx.drawImage(bgImg,0,0,bgImg.width,bgImg.height);



        //根据奖品个数计算圆周角度
        var arc = Math.PI / (turnPlate.awardDatas.length/2);

        for(var i = 0; i < turnPlate.awardDatas.length; i++) {
            var angle = turnPlate.startAngle + i * arc;
            ctx.fillStyle = turnPlate.awardDatas[i].color;
            ctx.beginPath();
            //arc(x,y,r,起始角,结束角,绘制方向) 方法创建弧/曲线（用于创建圆或部分圆）
		    ctx.arc(radius, radius, turnPlate.outsideRadius, angle, angle + arc, false);
		    ctx.arc(radius, radius, turnPlate.insideRadius, angle + arc, angle, true);
            ctx.stroke();
		    ctx.fill();
		    //锁画布(为了保存之前的画布状态)
		    ctx.save();

		    //----绘制奖品开始----
		    ctx.fillStyle = turnPlate.textColor;
		    var text = turnPlate.awardDatas[i].text;
		    var line_height = 17;
            // translate方法重新映射画布上的 (0,0) 位置
            ctx.translate(radius + Math.cos(angle + arc / 2) * turnPlate.textRadius, radius + Math.sin(angle + arc / 2) * turnPlate.textRadius);
            //rotate方法旋转当前的绘图
            ctx.rotate(angle + arc / 2 + Math.PI / 2);

            //绘制奖品描述
            ctx.font = 'bold 20px Microsoft YaHei';
            ctx.fillText(text,-ctx.measureText(text).width/2,line_height);

            //绘制对应图标
            var img = new Image();
            img.src = turnPlate.awardDatas[i].imgSrc;
            img.onload = function () {
                // ctx.drawImage(img,-15,10);
            }
            ctx.drawImage(img,-15,30);
            ctx.restore();
        }

        //绘制指示箭头
        ctx.save();
        ctx.setTransform(1,0,0,1,0,0);
        ctx.beginPath();
        ctx.strokeStyle = "#E62D2D";
        ctx.fillStyle = "#E62D2D";
        ctx.lineWidth = 0;
        ctx.moveTo(turnPlate.canvas.width*0.5,turnPlate.canvas.height*0.5);
        ctx.lineTo(turnPlate.canvas.width*0.5,turnPlate.canvas.height*0.5-turnPlate.textRadius*0.7);
        ctx.lineTo(turnPlate.canvas.width*0.5-turnPlate.insideRadius*0.4,turnPlate.canvas.height*0.5);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        ctx.beginPath();
        ctx.strokeStyle = "#CA1518";
        ctx.fillStyle = "#CA1518";
        ctx.lineWidth = 0;
        ctx.moveTo(turnPlate.canvas.width*0.5,turnPlate.canvas.height*0.5);
        ctx.lineTo(turnPlate.canvas.width*0.5,turnPlate.canvas.height*0.5-turnPlate.textRadius*0.7);
        ctx.lineTo(turnPlate.canvas.width*0.5+turnPlate.insideRadius*0.4,turnPlate.canvas.height*0.5);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        ctx.beginPath();

        ctx.fillStyle = "#E62D2D";
        ctx.arc(turnPlate.canvas.width*0.5,turnPlate.canvas.height*0.5,
                turnPlate.insideRadius*0.92,0,Math.PI*2);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = "#CA1518";
        ctx.arc(turnPlate.canvas.width*0.5,turnPlate.canvas.height*0.5,
                turnPlate.insideRadius*0.75,0,Math.PI*2);
        // var pointerImg = new Image();
        // pointerImg.src = turnPlate.pointerImgSrc;
        // ctx.drawImage(pointerImg,turnPlate.canvas.width*0.5-pointerImg.width*0.5,turnPlate.canvas.height*0.5 - pointerImg.height*0.62);
        ctx.fill();

        ctx.beginPath();
        ctx.font = 'bold 30px Microsoft YaHei';
        ctx.font = ctx.font.replace(/\d+(\.\d+)?(px|pt|em|%)/i, turnPlate.insideRadius * 0.5 + "px");//替换字体大小
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#FFBE04";
        ctx.fillText("抽奖",turnPlate.canvas.width*0.5,turnPlate.canvas.height*0.5);
        ctx.restore();

    }

    //旋转转盘
    turnPlate.timeout = undefined;
    turnPlate.rotate = function () {
        if(turnPlate.bRotate)return;

        turnPlate.drawWheel();
        turnPlate.rotateAngle = Math.PI*5/180;

        turnPlate.totalAngle = turnPlate.totalAngle + turnPlate.rotateAngle;

        // if(turnPlate.rotateAngle < Math.PI*2){
        //     turnPlate.rotateAngle += Math.PI/180;
        //     DBFX.Web.Draw.Tools.print("1");
        // }else {
        //     DBFX.Web.Draw.Tools.print("0");
        //     turnPlate.rotateAngle = 0;
        // }

        // DBFX.Web.Draw.Tools.print("totalAngle:"+turnPlate.totalAngle);
        turnPlate.timeout = setTimeout(turnPlate.rotate,5);
    }
    
    //停止旋转
    turnPlate.stopRotate = function () {
        // turnPlate.startAngle = 0;
        // turnPlate.rotateAngle = 0;

        if(turnPlate.awardIndex != undefined && turnPlate.awardIndex >= 0 && turnPlate.awardIndex < turnPlate.awardDatas.length){

            DBFX.Web.Draw.Tools.print("旋转到指定奖品位置");
            turnPlate.rotateToItem(turnPlate.awardIndex);
            turnPlate.getAward = turnPlate.awardDatas[turnPlate.awardIndex];
        }

        // DBFX.Web.Draw.Tools.print("rotateAngle:"+turnPlate.rotateAngle);

        if(turnPlate.awardIndex == undefined){

            //实际旋转的角度
            var angle = turnPlate.totalAngle%(Math.PI*2);
            var temAngle = 0;
            if(angle <= Math.PI*3/2){
                temAngle = Math.PI*3/2 - angle;
            }else {
                temAngle = Math.PI*3/2 + Math.PI*2 - angle;
            }



            var perAngle = Math.floor(Math.PI*2/turnPlate.awardDatas.length);//角度
            var startAngle = 0;
            var endAngle = 0;
            for(var i=0;i<turnPlate.awardDatas.length;i++){
                startAngle = i*perAngle;
                endAngle = (i+1)*perAngle;
                if(temAngle >= startAngle && temAngle <= endAngle){
                    DBFX.Web.Draw.Tools.print("判断获取的奖品");
                    turnPlate.getAward = turnPlate.awardDatas[i];
                    break;
                }
            }
        }

        DBFX.Web.Draw.Tools.print("获得的奖品:"+turnPlate.getAward.text);
        clearTimeout(turnPlate.timeout);


    }
    

    //旋转到指定的奖品 item:奖品位置
    turnPlate.rotateToItem = function (item) {
        var perAngle = Math.floor(360/turnPlate.awardDatas.length);//角度
        //随机的角度
        var randomA = DBFX.Web.Draw.Tools.randomInt(5,perAngle);
        var angles = item *(Math.PI*2/turnPlate.awardDatas.length) + Math.PI*randomA/180;

        turnPlate.context.setTransform(1,0,0,1,0,0);
        if(angles<Math.PI*3/2){
			turnPlate.rotateAngle = Math.PI*3/2 - angles-turnPlate.rotateAngle;
		}else{
			turnPlate.rotateAngle = Math.PI*2 - angles + Math.PI*3/2-turnPlate.rotateAngle;
		}

        turnPlate.drawWheel();

    }


    return turnPlate;
}
DBFX.Serializer.TurnPlateSerializer = function () {

    //反系列化
    this.DeSerialize = function (c, xe, ns) {

    }

    //系列化
    this.Serialize = function (c, xe, ns) {

    }
}
DBFX.Design.ControlDesigners.TurnPlateDesigner = function () {

    var obdc = new DBFX.Web.Controls.GroupPanel();
    obdc.OnCreateHandle();
    obdc.OnCreateHandle = function () {

        DBFX.Resources.LoadResource("design/DesignerTemplates/DrawingDesignerTemplates/TurnPlateDesigner.scrp", function (od) {

            od.DataContext = obdc.dataContext;

        }, obdc);

    }

    obdc.HorizonScrollbar = "hidden";
    obdc.OnCreateHandle();
    obdc.Class = "VDE_Design_ObjectGeneralDesigner";
    obdc.Text = "抽奖转盘设置";
    return obdc;
}