define(['mustache', 'oxjs', './factory'], function(Mustache, OXJS, Factory) {
    var tpl, $list, customizeRest, orderRest, codeRest, searchForm, $totalCount;
    var StatusCodes = {
        NEW: 0,
        UNPAID: 11,
        PAID: 1,
        RECEIVED: 2,
        DELIVERED: 3,
        COMPLETED: 4,
        CLOSED: 5,
        REFUNDED: 8,
        REFUND: 9,
        REFUNDING: 91,
        REFUND_FAIL: 94
    };
    var timeformat = function(d) {
        if (typeof d != 'object') {
            d = new Date(d);
        }
        var prefix0 = function(n) {
            return (n / 100).toFixed(2).substr(2)
        };
        return [d.getFullYear(), prefix0(d.getMonth() + 1), prefix0(d.getDate())].join('-') + ' ' + [d.getHours(), prefix0(d.getMinutes()), prefix0(d.getSeconds())].join(':')
    };


    var addrToString = function() {
        if (/北京|天津|上海|重庆/.test(this.province)) {
            this.city = '';
        }
        return [this.name, '(' + this.phone + ')', this.province, this.city, this.district, this.detail].join(' ')
    }


    var orderStatus = function(data) {
        //data.status = StatusCodes.PAID
        var st = data.status;
        switch (st) {
            case StatusCodes.NEW:
                return '<p>未付款</p>'; //<button data-role="close" type="button">关闭</button>
            case StatusCodes.UNPAID:
                return '<p>激活时付款</p><button data-role="produce" type="button">生产</button>'
            case StatusCodes.PAID: //todo: 后面去掉单独生产
                return '<p>已付款</p><button data-role="produce" type="button">生产</button>';
            case StatusCodes.RECEIVED:
                return '<p>生产中</p><button data-role="send" type="button">发货</button><br/><button data-role="produce" type="button">重新生产</button><br/><a href="/smctadmin/exportsheet?oids=' + data._id + '" target="download">导出发货单</a>';
            case StatusCodes.DELIVERED:
                return '<p>已发货</p><p>' + data.delivery_no + '</p><p><button data-role="wuliu" data-no="' + data.delivery_no + '">查看物流</button></p>';
            case StatusCodes.COMPLETED:
                return '<p>订单完成</p><br/>' + timeformat(data.mts);
            case StatusCodes.REFUND_FAIL:
                return '<p>退款失败</p><p><button data-role="force" type="button">手工处理</button></p>'
            case StatusCodes.REFUNDED:
                return '<p>退款完成</p>'
            case StatusCodes.REFUND:
            case StatusCodes.REFUNDING:
                return '<p>买家申请退款<br/>时间:' + timeformat(data.mts) + '</p><a target="_blank" href="/smctadmin/dealrefund?from=smct&oid=' + data._id + '">' + (st == StatusCodes.REFUNDING ? '继续' : '') + '退款</a><p><button data-role="force" type="button">手工处理</button></p>'
            case StatusCodes.CLOSED:
                return '<p>订单已关闭</p>' //<button data-role="del" type="button">删除订单</button>
            default:
                return '<p>--</p>'
        }
    }

    var param2settings = function(param) {
        if (!param) return {};
        var obj = {};
        for (var i = 0, n; n = param[i++];) {
            obj[n.label] = n.value;
        } //console.log(obj)
        return obj;
    };

    var getAndRender = function() {

        var sf = searchForm;
        var status = sf.status.value;
        var days = sf.days.value;
        var _id = sf._id.value;
        var s = {
            seller: 1
        };
        if (days) {
            var oneday = 24 * 3600 * 1000,
                now = new Date;
            now.setHours(8 + now.getTimezoneOffset() / 60, 0, 0, 0);
            var ts0 = now.getTime() - days * oneday;
            s._cts = ts0; //{$gte: ts0};

        }
        if (status) {


            switch (status) {
                case 'admin':
                    s.status = [StatusCodes.PAID, StatusCodes.RECEIVED, StatusCodes.REFUND, StatusCodes.REFUNDING, StatusCodes.REFUND_FAIL].join(',');
                    break
                case 'produce':
                    s.status = StatusCodes.PAID;
                    break
                default:
                    s.status = status - 0;
                    break
            }
        }
        if (_id) {
            s._id = _id.toLowerCase();
        }

        orderRest.get(s, function(r) {
            // $.getJSON(apiHost + '/smct/getorders?callback=?', function (r) {
            if (r && r.length) {
                var list = r;
                $totalCount.html(list.length)
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
                customizeRest.get({
                    ids: bids.join(',')
                }, function(r) {
                    var buildObj = {},
                        builds = r;
                    for (var i = 0, build; build = builds[i++];) {
                        buildObj[build._id] = build;
                    }


                    for (var i = 0, n; n = list[i++];) {
                        n.order_no = n._id.toUpperCase();
                        n.order_time = n.cts ? timeformat(n.cts) : n.time;
                        n.address = addrToString.call(n.delivery)
                            //n.status='已付款';
                        n.op = orderStatus(n);
                        // n.statusDesc = statusDesc(n)
                        n.totalsum = (n.totalfee - 0).toFixed(2);
                        if (n.pack && n.pack.length) {
                            for (var j = 0, pack; pack = n.pack[j]; j++) {
                                pack.setting = buildObj[pack.customize] && param2settings(buildObj[pack.customize].props)
                            }
                        }
                    }

                    $list.html(Mustache.render(tpl, {
                        data: list,
                        payinfo: function() {
                            
                            switch (this.payment && this.payment.type) {
                                case 'alipay':
                                case 'wxpay':

                                    return '<i class="payment payment-' + this.payment.type + '"></i>'
                                default:
                                    return ''
                            }

                        },
                        fullcarlogo: function() {

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
                $list.html('<div class="empty-order"><i class="iconfont">&#xe631;</i>&nbsp;&nbsp;<br/>该查询条件下暂无订单~<br/><br/></div>');
                $totalCount.html(0)
            }
        });
    };
    var createBatchNo = function() {
        var key = 'produceBatchJSON';
        var produceJSON = localStorage.getItem(key) || '{}';

        produceJSON = JSON.parse(produceJSON);

        var producerNo = 1; //
        var today = new Date();
        var datestamp = today.getFullYear() % 2000 * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
        var batchIndex = produceJSON[datestamp.toString()] || 0;
        batchIndex++;
        produceJSON[datestamp.toString()] = batchIndex;

        localStorage.setItem(key, JSON.stringify(produceJSON))

        return [producerNo, datestamp * 100 + batchIndex].join('')


    };

    var syncCodeAndProduce = function($ordertables, fn) {

        var batchNo = createBatchNo();

        // var totalcount = 0;
        var renderConf = {};
        var qs_json = [];
        var oids = [];
        $ordertables.each(function(idex, tbl) {
            var oid = this.getAttribute('data-id'),
                code_qs = {
                    tid: oid,
                    count: 0
                };
            //oids.push(oid);
            $('tbody>tr>td>.order-item', this).each(function(i, n) {
                var $n = $(n),
                    bid = $n.attr('data-bid'),
                    count = $n.attr('data-count') * 1,
                    $preview = $('.preview', $n);
                // totalcount += count;
                code_qs.count += count;

                renderConf[bid] = {
                    count: count,
                    oid: oid,
                    tplcolor: $preview.css('background-color'),
                    text1: $('.card-header', $preview).text(),
                    text2: $('.card-footer>span', $preview).text(),
                    carlogo: $('.central>img', $preview).attr('src')
                }
            });
            qs_json.push(code_qs)


        });
        codeRest.post({
            json: JSON.stringify(qs_json)
        }, function(r) {
            //$.post('/smctadmin/produce', {oids: oids.join(','), batch_no: batchNo}, function (r) {

            var codes = [],
                newcodes = r.message

            for (var i = 0, c; c = newcodes[i++];) {
                codes.push({
                    oid: c.tid,
                    code: c.code,
                    prod_no: batchNo + '-' + i
                })
            }
            var order_codes = [];
            for (var k in renderConf) {
                var count = renderConf[k].count;
                var oid = renderConf[k].oid;

                for (var j = 0; j < codes.length; j++) {
                    if (codes[j].oid == oid) {
                        order_codes.push({
                            code: codes[j],
                            renderConf: renderConf[k]
                        });
                        codes.splice(j, 1);
                        j--;
                        count--;
                    }
                    if (!count) break
                }

            }
            Factory.composeProduce(order_codes, batchNo, fn)

        });


    };
    return {
        init: function($mod) {
            var refund_url = $mod.attr('data-refund');
            $list = $('.J_list', $mod).on('click', function(e) {
                var tar = e.target,
                    $tb = $(tar).closest('table'),
                    _id = $tb.attr('data-id')
                switch (tar.getAttribute('data-role')) {
                    case 'del':
                        orderRest.del({
                            _id: _id
                        }, function(r) {
                            if (r && r.code == 0) {
                                $tb.remove();
                            }
                        });
                        break
                    case 'close':
                        orderRest.put({
                            _id: _id,
                            status: 5
                        }, function(r) {
                            if (r && r.code == 0) {
                                getAndRender();
                            }
                        });
                        break
                    case 'produce':

                        orderRest.put({
                            _id: _id,
                            status: 2
                        }, function(r) {
                            if (r && r.code == 0) {
                                //getAndRender();
                                var $progressbar = $('<div class="mask"><h3 class="loading">生成中...</h3></div>').appendTo('body');
                                syncCodeAndProduce($tb, function() {
                                    $progressbar.remove()
                                })


                            }
                        });
                        break
                    case 'send':
                        orderRest.put({
                            _id: _id,
                            status: 3,
                            delivery_no: '123'
                        }, function(r) {
                            if (r && r.code == 0) {
                                getAndRender();
                            }
                        });
                        break
                    case 'wuliu':
                        break
                    case 'force':
                        break
                }
            });
            tpl = $('.J_tpl', $mod).html();
            searchForm = $('.J_searchForm', $mod).on('change', function(e) {
                var tar = e.target,
                    name = tar.name;
                switch (name) {
                    case 'checkall':
                        if (tar.checked) {
                            $('.J_ck', $list).attr('checked', 'checked')
                        } else {
                            $('.J_ck', $list).removeAttr('checked')
                        }

                        break
                    case '':
                        break
                    case 'days':
                    case 'status':
                    case '_id':
                        getAndRender();
                        break
                }
                //
            })[0];
            $totalCount = $('.J_totalCount', $mod);
            var uid = $mod.attr('data-uid'),
                dsid = $mod.attr('data-dsid');
            //payurl=$mod.attr('data-payurl');
            customizeRest = OXJS.useREST('customize/' + dsid + '/u/' + encodeURIComponent(uid)).setDevHost('http://dev.openxsl.com/');
            orderRest = OXJS.useREST('order/' + dsid + '/u/' + encodeURIComponent(uid)).setDevHost('http://dev.openxsl.com/');

            codeRest = OXJS.useREST('code/' + dsid + '/u/' + encodeURIComponent(uid)).setDevHost('http://dev.openxsl.com/');


            getAndRender();



            $mod.on('click', '[data-batch]', function(e) {

                var tar = e.target;
                switch (tar.getAttribute('data-batch')) {
                    case 'produce':
                        var tables = [];
                        $('.J_ck', $list).each(function(i, n) {
                            var status = n.getAttribute('data-status');
                            if (n.checked && (status == StatusCodes.PAID || status == StatusCodes.UNPAID || status == StatusCodes.RECEIVED)) {

                                tables.push($(n).closest('table')[0])
                            }
                        });
                        if (!tables.length) {
                            alert('请选择订单');
                            return false;
                        } else {
                            var $progressbar = $('<div class="mask"><h3 class="loading">生成中...</h3></div>').appendTo('body');
                            syncCodeAndProduce($(tables), function(e) {
                                //console.log('done',e)
                                $progressbar.remove()
                            });

                            return true;
                        }
                        break
                    case 'refund':
                        var refundOrders = [];
                        $('.J_ck', $list).each(function(i, n) {
                            if (n.checked && n.getAttribute('data-status') == StatusCodes.REFUND) {
                                refundOrders.push(n.value)
                            }
                        });
                        if (!refundOrders.length) {
                            alert('请选择订单');
                        } else {
                            tar.href = refund_url + '?oids=' + refundOrders.join(',')
                        }
                        break
                }
            })

        }
    }
})