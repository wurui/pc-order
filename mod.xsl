<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:oxm="https://www.openxsl.com">
    <xsl:template match="/root" name="wurui.pc-order">
        <xsl:param name="refund_url"/>
        <!-- className 'J_OXMod' required  -->
        <div class="J_OXMod oxmod-pc-order" ox-mod="pc-order" data-uid="{login/uid}" data-refund="{$refund_url}">
            <xsl:variable name="id" select="generate-id(.)"/>
            <form action="http://dev.openxsl.com/rest/order/e0ee59439b39fcc3/u/git%2Fwurui" class="J_import" method="post" enctype="multipart/form-data">
                <input type="file" name="file" id="fileImport_{$id}" style="display: none;" />
            </form>
            <form class="J_searchForm">
                <div class="searchbar lrbar lrbar37">
                    <span>
                        <select name="days">
                            <option value="0">今天</option>
                            <option selected="selected" value="7">近7天</option>
                            <option value="">不限</option>
                        </select>
                        &#160;&#160;
                        <select name="status">
                            <option value="">不限</option>
                            <option value="admin">待处理</option>
                            <option value="produce">待生产</option>
                            <option value="9">退款</option>
                            <option value="2">生产中</option>
                            <option value="3">已发货</option>
                            <option value="4">已完成</option>
                        </select>

                        &#160;&#160;

                        <input type="text" placeholder="订单编号" name="_id"/>
                        &#160;
                    </span>
                    <span class="admin-ops">
                        <button type="button" data-batch="produce" class="bt-produce">
                            <i class="iconfont">&#xe64c;</i>
                            生产
                        </button>
                        &#160;&#160;&#160;&#160;
                        <a href="/smct/dealrefund" target="_blank" data-batch="refund" class="bt-refund">
                            <i class="iconfont">&#xe671;</i>
                            退款
                        </a>
                        &#160;&#160;&#160;&#160;
                        <button type="button"  class="bt-refund" data-batch="export">
                            <i class="iconfont">&#xe66b;</i>
                            导出发货单
                        </button>
                        &#160;&#160;&#160;&#160;
                        <label class="bt-refund" for="fileImport_{$id}">
                            <i class="iconfont">&#xe607;</i>
                            导入物流单
                        </label>
                        &#160;&#160;&#160;&#160;
                        <label>
                            <input type="checkbox" name="checkall"/>
                            全选
                        </label>
                    </span>

                </div>
            </form>


            <div class="J_list"></div>
            <div class="lrbar">
                <span>
                    共<big class="J_totalCount">0</big>条
                </span>
                <span class="admin-ops">
                    批量操作&#160;&#160;
                    <button type="button" data-batch="produce" class="bt-produce">
                        <i class="iconfont">&#xe64c;</i>
                        生产
                    </button>
                    &#160;&#160;&#160;&#160;
                    <a href="/smct/dealrefund" target="_blank" data-batch="refund" class="bt-refund">
                        <i class="iconfont">&#xe671;</i>
                        退款
                    </a>
                    &#160;&#160;&#160;&#160;
                    <button type="button" class="bt-refund" data-batch="export">
                        <i class="iconfont">&#xe66b;</i>
                        导出发货单
                    </button>
                    &#160;&#160;&#160;&#160;
                </span>

            </div>
            <script type="text/tpl" class="J_tpl"><![CDATA[
            {{#data}}
            <table class="orders-table" cellpadding="0" cellspacing="0" data-id={{_id}}>
                <thead>
                    <tr>
                        <td>
                            订单编号: {{order_no}}{{#client}}<span class="order-client-{{client}}"></span>{{/client}}&#160;&#160;&#160;{{{source}}}
                            &#160;&#160;&#160;&#160;&#160;&#160;<i class="iconfont">&#xe615;</i>{{uid}}
                        </td>
                        <td colspan="2">
                            订单时间: {{order_time}}
                            &#160;&#160;
                            <label>
                                <input type="checkbox" class="J_ck" name="order_ck" data-status="{{status}}" value="{{_id}}"/>选择
                            </label>
                        </td>
                    </tr>
                </thead>
                <tbody>
                <tr>
                    <td colspan="2">
                        {{#pack}}
                        <div class="order-item" data-bid="{{customize}}" data-count="{{amount}}">
                            <div class="snapshot">
                                <div class="preview bgcolor-{{setting.bgcolor}}"">
                                <div class="card-header">{{setting.text1}}</div>
                                <div class="card-body tpl tpl-{{setting.tpl}}">
                                    <div class="central">
                                        {{#setting.carlogo}}<img src="{{fullcarlogo}}"/>{{/setting.carlogo}}
                                    </div>
                                    <img src="http://i.oxm1.cc/uploads/git/wurui/img/2ahkwkkveTj1rgh0ueRlcquA5vz-1000.png" class="qrcode"/>
                                </div>
                                <div class="card-footer">
                                    <span>{{setting.text2}}</span>
                                </div>
                            </div>
                        </div>
                        &times;{{amount}}
                    </div>
                    {{/pack}}
                </td>
                <td class="status-{{status}} order-op">
                    {{{op}}}
                </td>

            </tr>
            </tbody>
            <tfoot>
                <tr>
                    <td>配送地址: {{address}}</td>
                    <td>总数: {{totalcount}}</td>
                    <td width=200>
                        {{{payinfo}}}实付金额:&#160;&#160;<b class="price">{{totalsum}}</b>
                    </td>
                </tr>
            </tfoot>
        </table>
        {{/data}}


        ]]></script>
        </div>
    </xsl:template>
</xsl:stylesheet>
