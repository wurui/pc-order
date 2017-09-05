<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:oxm="https://www.openxsl.com">
    <xsl:template match="/root" name="wurui.pc-order">
        <!-- className 'J_OXMod' required  -->
        <div class="J_OXMod oxmod-pc-order" ox-mod="pc-order" data-uid="{login/uid}">
            <div class="J_list"></div>
            <script type="text/tpl" class="J_tpl"><![CDATA[
            {{#data}}
            <table class="orders-table" cellpadding="0" cellspacing="0" data-id={{_id}}>
            <thead>
                <tr>
                    <td>订单编号: {{order_no}}{{#client}}<span class="order-client-{{client}}"></span>{{/client}}&nbsp;&nbsp;&nbsp;{{{source}}}</td>
                    <td colspan="2">
                        订单时间: {{order_time}}
                        &nbsp;&nbsp;
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
            <div class="order-item" data-bid="{{bid}}" data-count="{{amount}}">
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
    <td>
        {{{op}}}
    </td>

</tr>
        </tbody>
<tfoot>
<tr>
    <td>配送地址: {{address}}</td>
    <td>总数: {{totalcount}}</td>
    <td width=200>
    {{{payinfo}}}实付金额:&nbsp;&nbsp;<b class="price">{{totalsum}}</b>
</td>
</tr>
        </tfoot>
        </table>
        {{/data}}


        ]]></script>
        </div>
    </xsl:template>
</xsl:stylesheet>
