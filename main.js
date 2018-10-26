var express = require('express');
var server = express();
function HtmlContent(){
    var content=
    `
    <DOCTYPE html>
    <html>
    <head>
    <title>조기축구모임</title>
    <meta charset="utf-8" />
    </head>
    <body>
    <h1>안녕하세요 조기축구 모임입니다.</h1>
    <button onclick="location.href = 'history';
    "id="Button">역사</button>
    <button onclick="location.href = 'group';
    "id="Button">조직도</button>
    </body>
    </html>
    `;
    return content;
}
server.get('/',function(request,response){
    var content = '';
    content = HtmlContent();
    console.log(content);
    response.send(content);

});
server.listen(3000);