/**
 * Created by wurui on 14/04/2017.
 */


define(['./qrcode','oxjs'], function (undef,OXJS) {
    var imgToolRest=OXJS.useREST('imgtool').setDevHost('http://dev.openxsl.com/');
    var PreloadImg = {
        firmqrcode: function (img) {
            var src='http://i.oxm1.cc/uploads/git/wurui/img/2aed4puhiTj4z8br8aRqmqdA1ua-1000.png';
            imgToolRest.get({src: encodeURIComponent(src),method:'src2base64'}, function (r) {
                img.src = r;
            })

            return img;
        }(new Image)
    };
    var getRotateData = function (rotateDeg) {//rotate=false
        var cvs = this;
        var ctx = cvs.getContext('2d'),
            w = cvs.width, h = cvs.height;

        //
        if (!rotateDeg) {
            return ctx.getImageData(0, 0, w, h)
        }
        var deg = typeof rotateDeg == 'number' ? rotateDeg : 90;
        var newCVS = document.createElement('canvas');
        newCVS.width = h;
        newCVS.height = w;
        var newCtx = newCVS.getContext('2d');
        newCtx.translate(h / 2, w / 2)
        newCtx.rotate(deg * Math.PI / 180);
        newCtx.translate(-w / 2, -h / 2)
        newCtx.drawImage(cvs, 0, 0);

        return newCtx.getImageData(0, 0, h, w)
    };


    var rectWidth = 500;
    var rectHeight = 500;
    var radius = 40;
    var bgcolor = '#fff';
    var headHeight = 120;
    var footHeight = 40;
    var bodyHeight = rectHeight - footHeight - headHeight;
    var qrcodeRect = 280;

    var qrcodePadding = 5;
    var qrcodeWrapper = qrcodeRect + qrcodePadding * 2;
    var qrcodeMarginTop = 40;
    var carlogRect = 78;


    //document.body.appendChild(canvas)

    var drawImage = function (src, x, y, w, h, fn) {
        if (typeof w == 'function') {
            fn = w;
            w = undefined;
        }

        var ctx = this;
        if (src.tagName && src.tagName.toLowerCase() == 'img') {
            var img = src;
        } else {
            var img = new Image();

            if(src.startsWith('http')) {
                imgToolRest.get({src: encodeURIComponent(src)}, function (r) {
                    img.src = r;
                })
            }else{
                img.src=src;

            }

        }

        img.onload = function () {
            if (w && h) {
                ctx.drawImage(img, x, y, w, h);
            } else {
                ctx.drawImage(img, x, y);
            }

            fn && fn();
        };


        // console.log(img.complete)
        // document.body.appendChild(img)
    };

    var drawRectWithRadius = function (x, y, width, height, radius) {

        var ctx = this;
        ctx.beginPath();
        ctx.moveTo(x, y + radius);
        ctx.lineTo(x, y + height - radius);
        ctx.arcTo(x, y + height, x + radius, y + height, radius);
        ctx.lineTo(x + width - radius, y + height)
        ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
        ctx.lineTo(x + width, y + radius)
        ctx.arcTo(x + width, y, x + width - radius, y, radius);
        ctx.lineTo(x + radius, y)
        ctx.arcTo(x, y, x, y + radius, radius);
        ctx.closePath();

    };
    var fillTextWithSpacing = function (txt, x, y, spacing) {
        //先只考虑textAlign center吧
        var ctx = this;
        if (!spacing) {
            ctx.fillText(txt, x, y);
        } else {
            var i = 0, startX = x, measureWidth = ctx.measureText(txt).width,
                originTextalign = ctx.textAlign;
            switch (originTextalign) {
                case 'center':

                    startX = x - (measureWidth + txt.length * spacing) / 2;
                    //console.log('cccc',measureWidth,startX,x)
                    break
                case 'left':
                    startX = x;
                    break
                case 'right':
                    startX = x - (measureWidth + txt.length * spacing);
                    break
                default :
                    break
            }


            ctx.textAlign = 'left';
            while (i < txt.length) {
                var letter = txt[i++],
                    startX = i ? startX + spacing : startX;
                //measureWidth+=ctx.measureText(letter).width
                ctx.fillText(letter, startX, y);
                startX += ctx.measureText(letter).width
            }
            ctx.textAlign = originTextalign;
        }


        //ctx.fillText(txt,x,y);
    };


//qrcode

    var drawQRCode = function (qrcodeSrc, logoSrc, fn) {
        var ctx = this;
        drawImage.call(ctx, qrcodeSrc, (rectWidth - qrcodeRect) / 2, headHeight + qrcodeMarginTop + qrcodePadding, function () {

            if (logoSrc) {
                var imgx = (rectWidth - carlogRect) / 2,
                    imgy = headHeight + qrcodeMarginTop + qrcodePadding + (qrcodeRect - carlogRect) / 2;
                drawRectWithRadius.call(ctx, imgx, imgy, carlogRect, carlogRect, 10);
                ctx.fillStyle = '#fff';
                ctx.fill();
                ctx.save();
                ctx.clip();


                drawImage.call(ctx, logoSrc, imgx, imgy, carlogRect, carlogRect, function () {

                    ctx.restore();

                    fn && fn();
                })

            } else {
                fn && fn();
            }
        });
    };

// drawQRCode('img/testqrcode.png',carlogo);

    function renderPaper(conf, settings, fn) {

        var code = conf.code;
        var canvas = document.createElement('canvas');

        canvas.height = rectHeight;
        canvas.width = rectWidth;

        var ctx = canvas.getContext("2d");
        drawRectWithRadius.call(ctx, 0, 0, rectWidth, rectHeight, 0);

        var tplcolor = settings.tplcolor,
            text1 = settings.text1,
            text2 = settings.text2,
            carlogo = settings.carlogo,
            fontsize = settings.fontsize || 85;


        ctx.strokeStyle = '#eee';
        ctx.stroke();
        ctx.fillStyle = tplcolor;
        ctx.fill();

        ctx.fillStyle = bgcolor;
        ctx.fillRect(0, headHeight, rectWidth, bodyHeight);//body


//draw footer
        /*
         ctx.beginPath();
         ctx.moveTo(0, rectWidth - radius)
         ctx.arcTo(0, rectWidth, radius, rectWidth, radius);
         ctx.lineTo(rectWidth - radius, rectWidth)
         ctx.arcTo(rectWidth, rectWidth, rectWidth, rectWidth - radius, radius);
         ctx.lineTo(0, rectWidth - radius)
         ctx.closePath();
         ctx.fillStyle = bgcolor;
         */
// ctx.strokeStyle='red';
        ctx.fillRect(0, rectHeight - 40, rectWidth, 40);
        //ctx.fill();


        if (text1) {
//文案
            // ctx.font = "bold "+fontsize+"px '黑体', sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = 'middle'
            ctx.save()
            ctx.scale(1, 1.2);
            ctx.shadowColor = '#444'
            ctx.shadowBlur = 1
            ctx.shadowOffsetX = 5
            ctx.shadowOffsetY = -5
            if (text1.indexOf('\n') > -1) {//two lines
                fontsize = 40;
                ctx.font = "bold " + fontsize + "px '黑体', sans-serif";
                fillTextLikeCSS.call(ctx, text1, rectWidth / 2, headHeight / 4 - 5, {lineHeight: fontsize + 10})

            } else {
                ctx.font = "bold " + fontsize + "px '黑体', sans-serif";
                fillTextWithSpacing.call(ctx, text1, rectWidth / 2, headHeight / 2 - 8, 6);
            }

            ctx.restore()
        }

        if (text2) {
            ctx.font = "18px '黑体', sans-serif";
            ctx.fillStyle = '#666';
            ctx.textBaseline = 'middle'
//ctx.fillText(text2,rectWidth/2,headHeight+bodyHeight+footHeight/2);
            fillTextWithSpacing.call(ctx, text2, rectWidth / 2, headHeight + bodyHeight + footHeight / 2 - 5, 1)
        }


//qrcode wrapper
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 1;//add .5 make 1px line
        ctx.strokeRect((rectWidth - qrcodeWrapper) / 2 + .5, headHeight + qrcodeMarginTop + .5, qrcodeWrapper, qrcodeWrapper);


        var qrcodeContainer = document.createElement("div");
        new QRCode(qrcodeContainer,
            {
                text: "http://www.shaomachetie.com/carnotify/entry?_id=" + code,
                width: qrcodeRect,
                height: qrcodeRect,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });

        drawQRCode.call(ctx, qrcodeContainer.getElementsByTagName('img')[0], carlogo, function () {
            fn && fn(canvas/*.toDataURL()*/, conf);
        });

    };

    var fillTextLikeCSS = function (text, startX, startY, conf, maxWidth, lineHeight, marginBottom) {
        //先只考虑textAlign center吧
        var ctx = this;
        var conf = conf || {};
        var maxWidth = conf.maxWidth,
            lineHeight = conf.lineHeight,
            marginBottom = conf.marginBottom || 0,
            paddingLeft = conf.paddingLeft || 0,
            listStyle = conf.listStyle;

        var splt = text.split('\n');
        marginBottom = marginBottom || 0;

        splt.forEach(function (txt, j) {

            var i = 0, starIndex = 0, lines = [], subtext;

            if (listStyle == 'decimal') {
                paddingLeft = paddingLeft || 20;
                ctx.fillText((j + 1) + '.', startX - paddingLeft, startY);
            }
            while (i < txt.length) {

                subtext = txt.substring(starIndex, ++i);

                //console.log(txt,starIndex,i)
                var measureWidth = ctx.measureText(subtext).width;
                if (measureWidth >= maxWidth) {
                    lines.push(subtext);
                    subtext = null;
                    starIndex = i;
                } else {
                    // starIndex++
                }
            }

            if (subtext) {
                lines.push(subtext);
            }
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                ctx.fillText(line, startX, startY);
                startY += lineHeight;
            }
            startY += marginBottom;
            // startY += lineHeight;
        })
        return startY


        //ctx.fillText(txt,x,y);
    };

    var drawBackText = function (fn) {
        if (this.type != 'custom') {
            return fn.call(this, [])
        }
        //var rotate=0;
        var rect_height = rectHeight,
            rect_width = rectWidth;
        /*
         if(rotate){
         rect_height=rectWidth;
         rect_width=rectHeight;
         }*/

        var codes = this.codes,
            type = this.type;
        var canvas = document.createElement('canvas');
        canvas.width = rect_width;//canvas.height=rectWidth;
        canvas.height = rect_height;
        var ctx = canvas.getContext('2d');

        var content = [
            '车主扫描正面的二维码,在未激活状态下,会自动进入车主设置页面',
            '输入车主手机号,按提示填写表单完成激活',
            '将此车贴贴到前挡玻璃等位置,展示二维码',
            '他人扫码后,填写理由及上传现场照片,提交后车主手机即收到通知短信'
        ].join('\n')

        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);


        ctx.font = "bold　18px 宋体, Times";
        ctx.fillStyle = '#000';
        ctx.textBaseline = 'middle'
        //ctx.fillText(text2,rectWidth/2,headHeight+bodyHeight+footHeight/2);
        // fillTextWithSpacing(content,10,10)
        //qrcode wrapper
        var startY = 40,
            css = {
                maxWidth: 400,
                lineHeight: 24,
                marginBottom: 6,
                listStyle: 'decimal'
            };
        ctx.textAlign = 'center'
        ctx.font = "28px 宋体, Times";
        ctx.fillText('扫码车贴', rect_width / 2, startY);
        ctx.textAlign = 'left';
        ctx.font = "22px 宋体 , Times";
        ctx.fillText('使用说明', 50 - 25, startY += 40);
        ctx.font = "20px 宋体, Times";
        startY = fillTextLikeCSS.call(ctx, content, 50, startY += 30, css);
        ctx.font = "22px 宋体, Times";
        ctx.fillText('扫描下面二维码关注声罄科技公众号', 50 - 25, startY += 10);

        ctx.font = "20px 宋体, Times";
        /**
         fillTextLikeCSS.call(ctx,[
         '为防止车主遭到不必要的骚扰,1小时内重复扫码车主只会收到1次通知。',
         type!='picsay'?'本产品目前无使用期限限制,但自激活之日算起保证三年内能正常使用。如果本产品使用超过三年,视具体情况作失效或有效处理。':'本产品目自激活之日3个月内能正常使用,后面可在官网续费来延长使用期限'
         ].join('\n'),50,startY+=30,css)
         */
        ctx.drawImage(PreloadImg.firmqrcode, 90, startY += 20, 160, 160)
        //drawImage.call(ctx,'/smct/img/firm_qrcode_1.png',rect_width/2,startY+=20,100,100);


        var back_canvases = [];

        var imgData = ctx.getImageData(0, 0, rect_width, rect_height);
        //var imgData=getRotateData.call(canvas,rotate);

        var _this = this;

        for (var i = 0, code; code = codes[i++];) {

            var prod_no = code.prod_no;
            var prod_index = prod_no.split('-')[1] - 1,
                pageIndex = Math.floor(prod_index / 8),
                positionIndex = prod_index % 8,
                y = rect_height * Math.floor(positionIndex / 4),
                x = rect_width * (3 - (positionIndex % 4 ) );

            var canvas = back_canvases[pageIndex],
                ctx;
            if (!canvas) {
                canvas = document.createElement('canvas');

                canvas.height = rect_height * 2;
                canvas.width = rect_width * 4;
                back_canvases[pageIndex] = canvas
                ctx = canvas.getContext("2d");
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            } else {
                ctx = canvas.getContext("2d");//477x429
            }

            ctx.putImageData(imgData, x, y);

            ctx.font = "20px  sans-serif";
            ctx.textAlign = "right";
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#000';
            ctx.fillText('No.' + prod_no, x + rect_width - 40, y + rect_height - 40);
        }

        if (typeof fn == 'function') {

            var result = [];
            for (var i = 0, c; c = back_canvases[i++];) {
                //pageCanvas.getContext("2d").putImageData(getRotateData.call(cvs,rotate), x, y);
                result.push(c.toDataURL('image/jpeg'))
            }
            fn.call(_this, result)
        }


    };


    var onrenderpage = function (cvs, conf) {
        var prod_no = conf.prod_no;
        //var rotate=this.type=='base';
        var rect_height = rectHeight,
            rect_width = rectWidth;
        /*
         if(rotate){
         rect_height=rectWidth;
         rect_width=rectHeight;
         }*/
        var prod_index = prod_no.split('-')[1] - 1,
            pageIndex = Math.floor(prod_index / 8),
            positionIndex = prod_index % 8,
            y = rect_height * Math.floor(positionIndex / 4),
            x = rect_width * (positionIndex % 4);

        var pageCanvas = this.canvases[pageIndex];


        if (!pageCanvas) {
            pageCanvas = document.createElement('canvas');


            pageCanvas.height = rect_height * 2;
            pageCanvas.width = rect_width * 4;


            this.canvases[pageIndex] = pageCanvas;

            var pctx = pageCanvas.getContext("2d");
            pctx.fillStyle = '#ffffff';
            pctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
            //var ctx = canvas.getContext("2d");
        } else {
        }


        pageCanvas.getContext("2d").putImageData(getRotateData.call(cvs), x, y);
        this.renderedcount++;
        var totalcount = this.codes.length
        if (typeof this.onrenderedcountchange == 'function') {
            this.onrenderedcountchange({
                renderedcount: this.renderedcount,
                totalcount: totalcount
            });
        }
        if (this.renderedcount == totalcount) {

            drawBackText.call(this, function (dataURLArr) {
                var result = [];
                for (var i = 0, c; c = this.canvases[i]; i++) {
                    result.push({
                        dataURL: c.toDataURL('image/jpeg'),
                        backDataURL: dataURLArr[i],
                        pageNo: i + 1
                    })
                }
                this.callback && this.callback(result);
            });


        }

    };
    var ComposetypeA4 = function (type, fn) {
        this.type = type;

        this.renderedcount = 0;
        //this.totalcount = 0;
        this.canvases = [];

        this.callback = fn;
        this.codes = [];
        switch (type) {
            case 'custom':
            case 'base':
            default :

                rectWidth = 490;
                rectHeight = 560;
                headHeight = 140;
                footHeight = 40;
                bodyHeight = rectHeight - footHeight - headHeight;
                qrcodeRect = 320;
                qrcodeWrapper = qrcodeRect + qrcodePadding * 2;
                break
            /*
             default :
             rectWidth = 500;
             rectHeight = 500;
             headHeight = 120;
             footHeight = 40;
             bodyHeight = rectHeight-footHeight - headHeight;
             qrcodeRect = 280;
             qrcodeWrapper = qrcodeRect + qrcodePadding * 2;
             break
             */
        }
    };
    ComposetypeA4.prototype.addTask = function (codeObj, settings, type) {

        //this.totalcount++;
        this.codes.push(codeObj);
        renderPaper.call(this, codeObj, settings, onrenderpage.bind(this))
    };

    return ComposetypeA4


})

