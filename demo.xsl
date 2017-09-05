<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:import href="mod.xsl" />
  <xsl:output method="html" doctype-public="" encoding="UTF-8"/>

  <xsl:template match="/root">
    <html env="{env/domain}">
      <head>
        <meta name="viewport" content="initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no"/>
        <title>pc-order - DEMO</title>
        <link rel="stylesheet" type="text/css" href="https://a.oxm1.cc/css/ea.css" />
        <link rel="stylesheet" type="text/css" href="asset/index.css" />
        <script src="https://a.oxm1.cc/js/require.js"></script>
      </head>
      <body>
          <style>
              .pc-page{margin:0 auto;width:1200px;}
          </style>
          <div class="pc-page">
            <div class="layout">
              <xsl:call-template name="wurui.pc-order" />
            </div>
          </div>
        <script><![CDATA[
          require.config({
            paths: {
              zepto: 'https://a.oxm1.cc/js/zepto.min',
              mustache: 'https://a.oxm1.cc/js/mustache',
              oxjs:'https://a.oxm1.cc/js/oxjs'
            },
            packages:[{name:"oxm",location:'https://a.oxm1.cc/oxm'}]
          });
          require(['zepto','oxjs','asset/index'],function(undefine,oxjs,Mod){
          Mod && Mod.init && Mod.init($('.J_OXMod'));
          })
        ]]></script>
      </body>

    </html>
  </xsl:template>

</xsl:stylesheet>
