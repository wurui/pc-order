define(['mustache','oxjs'],function(Mustache,OXJS){
var tpl,$list,customizeRest,orderRest;
    var timeformat = function (d) {
        if (typeof d != 'object') {
            d = new Date(d);
        }
        var prefix0 = function (n) {
            return (n / 100).toFixed(2).substr(2)
        };
        return [d.getFullYear(), prefix0(d.getMonth() + 1), prefix0(d.getDate())].join('-') + ' ' + [d.getHours(), prefix0(d.getMinutes()), prefix0(d.getSeconds())].join(':')
    };


    var addrToString = function () {
        if (/北京|天津|上海|重庆/.test(this.province)) {
            this.city = '';
        }
        return [this.name, '(' + this.phone + ')', this.province, this.city, this.district, this.detail].join(' ')
    }
    var statusDesc = function (data) {
        var st = data.status;
        switch (st) {
            case -1:
                return '<font color="#999">订单已关闭</font>';
            case 0:
                return '<font color="#f60">待付款</font>';
            case 0.1:
                return '<font color="#f60">激活时付款</font>';
            case 1:
                return '<font color="#666">已付款</font>';
            case 2:
                return '<font color="#666">生产中</font>';
            case 3:
                return '<font color="#060">已发货</font>';
            case 4:
                return '<font>订单完成</font>';
            case 8:
                return '<font color="#999">已退款</font>'
            case 9.4:
                return '<font color="#f10">退款失败</font>'
            case 9.1:
                return '<font color="#666">退款处理中</font>'
            case 9:
                return '<font color="#666">退款中</font>'
            default :
                return ''
        }
    };
    var orderOP = function (data) {
        var st = data.status;
        switch (st) {
            case 0:
                return '<button data-role="close" type="button">关闭订单</button>&nbsp;&nbsp;&nbsp;&nbsp;';
            case 1:
                return '<button data-role="refund" type="button">退款</button>';
            case 3:
                return '<button data-role="wuliu" data-no="' + data.delivery_no + '">查看物流</button>';
            case 2:
            case 4:
            case 8:
                return ''
            case 9.4:
                return '退款失败,请等待客服处理'
            case 9.1:
                return data.reason == 'h5_none' ? '' : '退款理由:' + data.reason
            case 9:
                return (data.reason == 'h5_none' ? '' : '退款理由:' + data.reason) + '&nbsp;&nbsp;&nbsp;&nbsp;<button data-role="cancelrefund" type="button">撤消退款</button>'
            default :
                return '<button data-role="del" type="button">删除订单</button>'
        }
    };
    var showWuliu = function ($tar) {


    };
    var orderStatus=function (data) {
        var st = data.status;
        switch (st) {
            case 0:
                return '<p>未付款</p><button data-role="close" type="button">关闭订单</button>';
            case 0.1:
                return '<p>激活时付款</p><button data-role="produce" type="button">生产</button>'
            case 1://todo: 后面去掉单独生产
                return '<p>已付款</p><button data-role="produce" type="button">生产</button>';
            case 2:
                return '<p>生产中</p><button data-role="send" type="button">发货</button><br/><br/><button data-role="produce" type="button">重新生产</button><br/><br/><a href="/smctadmin/exportsheet?oids='+data._id+'" target="download">导出发货单</a>';
            case 3:
                return '<p>已发货</p><p>' + data.delivery_no + '</p><p><button data-role="wuliu" data-no="' + data.delivery_no + '">查看物流</button></p>';
            case 4:
                return '<p>订单完成</p><br/>'+Util.timeformat(data.mts);
            case 9.4:
                return '<p>退款失败</p><p><button data-role="force" type="button">手工处理</button></p>'
            case 8:
                return '<p>退款完成</p>'
            case 9.1:
            case 9:
                return '<p>买家申请退款<br/>时间:' + Util.timeformat(data.mts) + '<br/>理由:' + data.reason + '</p><a target="_blank" href="/smctadmin/dealrefund?from=smct&oid=' + data._id + '">' + (st == 9.1 ? '继续' : '') + '退款</a><p><button data-role="force" type="button">手工处理</button></p>'
            default :
                return '<p>--</p><button data-role="del" type="button">删除订单</button>'
        }
    }

    var getAndRender = function () {

        orderRest.get(function (r) {
            // $.getJSON(apiHost + '/smct/getorders?callback=?', function (r) {
            if (r && r.length) {
                var list = r;
                var bids = [];
                //var totalfee = 0;
                for (var i = 0, n; n = list[i++];) {
                    //n.order_no= n._id.toUpperCase();
                    //n.order_time= (new Date(n.cts)).toLocaleString();
                    var pack = n.pack;
                    if (pack && pack.length) {
                        for (var j = 0; j < pack.length; j++) {
                            var packitem = pack[j];
                            bids.push(packitem.customize);
                        }
                    }
                }
                customizeRest.get({ids: bids.join(',')}, function (r) {

                    // $.getJSON(apiHost + '/smct/getbuilds?bids=' + bids.join(',') + '&callback=?', function (r) {
                    var buildObj = {}, builds = r;
                    for (var i = 0, build; build = builds[i++];) {
                        buildObj[build._id] = build;
                        //console.log(build._id)
                    }


                    for (var i = 0, n; n = list[i++];) {
                        n.order_no = n._id.toUpperCase();
                        n.order_time = n.cts?timeformat(n.cts): n.time;
                        n.address = addrToString.call(n.delivery)
                        //n.status='已付款';
                        n.op = orderOP(n);
                        n.statusDesc = statusDesc(n)
                        n.totalsum = (n.totalfee - 0).toFixed(2);
                        if (n.pack && n.pack.length) {
                            for (var j = 0, pack; pack = n.pack[j]; j++) {

                                pack.setting = buildObj[pack.customize] && param2settings(buildObj[pack.customize].props)

                                //console.log(pack.setting)
                            }
                        }
                    }

                    $list.html(Mustache.render(tpl, {
                        data: list,
                        fullcarlogo: function () {

                            var str = ''
                            if (/\d+/.test(this)) {
                                str = 'cars/' + this + '.png'
                            } else {
                                str = 'carlogo/' + this + '.jpg'
                            }
                            return 'http://v.oxm1.cc/' + str
                        }
                    }));

                });

            } else {
                $list.html('<i class="iconfont">&#xe631;</i>&nbsp;&nbsp;<br/>暂无订单,赶紧去定制一个你喜欢的车贴吧~<br/><a href="' + buildurl + '">开始定制 &raquo;</a><br/><br/>').addClass('empty-order');

            }
        });
    };

    var param2settings = function (param) {
        if (!param)return {};
        var obj = {};
        for (var i = 0, n; n = param[i++];) {
            obj[n.label] = n.value;
        }//console.log(obj)
        return obj;
    };

var getAndRender = function () {

        orderRest.get(function (r) {
            // $.getJSON(apiHost + '/smct/getorders?callback=?', function (r) {
            if (r && r.length) {
                var list = r;
                var bids = [];
                //var totalfee = 0;
                for (var i = 0, n; n = list[i++];) {
                    //n.order_no= n._id.toUpperCase();
                    //n.order_time= (new Date(n.cts)).toLocaleString();
                    var pack = n.pack;
                    if (pack && pack.length) {
                        for (var j = 0; j < pack.length; j++) {
                            var packitem = pack[j];
                            bids.push(packitem.customize);
                        }
                    }
                }
                customizeRest.get({ids: bids.join(',')}, function (r) {

                    // $.getJSON(apiHost + '/smct/getbuilds?bids=' + bids.join(',') + '&callback=?', function (r) {
                    var buildObj = {}, builds = r;
                    for (var i = 0, build; build = builds[i++];) {
                        buildObj[build._id] = build;
                        //console.log(build._id)
                    }


                    for (var i = 0, n; n = list[i++];) {
                        n.order_no = n._id.toUpperCase();
                        n.order_time = n.cts?timeformat(n.cts): n.time;
                        n.address = addrToString.call(n.delivery)
                        //n.status='已付款';
                        n.op = orderStatus(n);
                       // n.statusDesc = statusDesc(n)
                        n.totalsum = (n.totalfee - 0).toFixed(2);
                        if (n.pack && n.pack.length) {
                            for (var j = 0, pack; pack = n.pack[j]; j++) {

                                pack.setting = buildObj[pack.customize] && param2settings(buildObj[pack.customize].props)

                                //console.log(pack.setting)
                            }
                        }
                    }

                    $list.html(Mustache.render(tpl, {
                        data: list,
                        fullcarlogo: function () {

                            var str = ''
                            if (/\d+/.test(this)) {
                                str = 'cars/' + this + '.png'
                            } else {
                                str = 'carlogo/' + this + '.jpg'
                            }
                            return 'http://v.oxm1.cc/' + str
                        }
                    }));

                });

            } else {
                $list.html('<i class="iconfont">&#xe631;</i>&nbsp;&nbsp;<br/>暂无订单,赶紧去定制一个你喜欢的车贴吧~<br/><a href="">开始定制 &raquo;</a><br/><br/>').addClass('empty-order');

            }
        });
    };
  return {
    init:function($mod){
        $list=$('.J_list',$mod);
        tpl=$('.J_tpl',$mod).html();
        var uid = $mod.attr('data-uid');
        //payurl=$mod.attr('data-payurl');
        customizeRest = OXJS.useREST('customize/e0ee59439b39fcc3/u/' + encodeURIComponent(uid)).setDevHost('http://local.openxsl.com/'),
        orderRest = OXJS.useREST('order/e0ee59439b39fcc3/u/' + encodeURIComponent(uid)).setDevHost('http://local.openxsl.com/');

        getAndRender();

    }
  }
})
