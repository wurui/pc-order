/**
 * Created by wurui on 15/09/2017.
 */
define(['./canvas-tool','./pdfkit','./blob-stream'], function ( ComposetypeA4,PDFDocument, blobStream) {


    var mm2point=function(n){
        return n/10*72/2.54
    };
//var PageSize=[mm2point(210-6),mm2point(297-6)];
    var PageSize=[mm2point(297-6),mm2point(210-6)];

    var getPageConf=function(type){
        var width=144,
            height=288,
            rect_w=72,
            rect_h=72;
        switch (type){

            case 'base':
                rect_w=80;
                rect_h=70;
                width=rect_w*2;
                height=rect_h*4;
                break
            case 'custom':
                rect_w=70;
                rect_h=80;
                width=rect_w*4;
                height=rect_h*2;
            default :
                break;
        }
        return {
            width:mm2point(width),
            height:mm2point(height),
            x:Math.floor((PageSize[0]-mm2point(width))/2),
            y:Math.floor((PageSize[1]-mm2point(height))/2),
            align: 'center',
            valign: 'top',
            size:{

            },
            rect:{
                width:mm2point(rect_w),
                height:mm2point(rect_h)
            },
            margin:{
                left:Math.floor((PageSize[0]-mm2point(width))/2),
                right:Math.ceil((PageSize[0]-mm2point(width))/2),
                top:Math.floor((PageSize[1]-mm2point(height))/2),
                bottom:Math.ceil((PageSize[1]-mm2point(height))/2)
            }
        };

    };
    var drawCuttingLine=function(page_config){//考虑3mm的打印边距
        var rows= 3,
            cols=5,i=0;
        var page_w=PageSize[0],
            page_h=PageSize[1];
        var margin=page_config.margin,
            rect_w=page_config.rect.width,
            rect_h=page_config.rect.height;

        while(i<rows){
            var y =margin.top +rect_h * i,
                len=Math.min(margin.left,margin.right),
                x1= 0,x2= x1+len,
                x3= page_w-len,x4=page_w;
            this.moveTo(x1,y).lineTo(x2,y)
                .moveTo(x3, y).lineTo(x4, y);
            i++
        }
        i=0;
        while(i<cols){

            var x =margin.left+ rect_w * i,
                y1= 0,y2=y1+margin.top,
                y3= page_h-margin.bottom,y4=page_h;
            this.moveTo(x,y1).lineTo(x,y2)
                .moveTo(x, y3).lineTo(x, y4);
            i++
        }


        return this.stroke()

    };

    var onTaskDone= function (result,batchNo) {

        var page_config=getPageConf('custom');

        var doc = new PDFDocument({
            size:PageSize,
            autoFirstPage:false,
            margin:page_config.margin
        });
        doc.drawCuttingLine=drawCuttingLine;

        var imageOpt={
            //fit: [144, 288],
            width:page_config.width,
            height:page_config.height,
            x:page_config.margin.left,
            y:page_config.margin.top,
            align: 'center',
            valign: 'top'
        };

        var stream = doc.pipe(blobStream());

        for (var i = 0, n; n = result[i++];) {
            var dataURL = n.dataURL,
                pageNo = n.pageNo;
            doc.addPage().image(dataURL,imageOpt).drawCuttingLine(page_config).addPage().image(n.backDataURL,imageOpt);
        }

        doc.end();
        stream.on('finish', function() {
            var a = document.createElement('a');
            a.href = stream.toBlobURL('application/pdf');;
            a.download = 'SMCT' + batchNo + '.pdf';
            document.body.appendChild(a);
            a.click();
        });

    };

    var composeProduce = function (order_codes,batchNo, fn) {

        var composetypeA4 = new ComposetypeA4('custom',function(result){
            onTaskDone(result,batchNo);
            fn(result);
        });

        while (order_codes.length) {//测试一下大量的,比如100张图片的生成,拼接,!!!!测试过没问题

            var config=order_codes.shift(),
                code=config.code,
                renderConf=config.renderConf
            composetypeA4.addTask(code,renderConf);

        }

    };


    return {
        composeProduce:composeProduce
    }
})