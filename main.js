var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var server = express();
server.use(bodyParser.urlencoded({extended: false}))
server.use(cookieParser())



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
    <h1><a href="/">안녕하세요 조기축구 모임입니다.</a></h1>
    <button onclick="location.href = 'history';
    "id="Button">역사</button>
    <button onclick="location.href = 'group';
    "id="Button">조직도</button>
    <a href="/login"> 로그인</a></h1>
    <a href="/signup"> 회원가입 </a>
    
    </body>
    </html>
    `;
    return content;
}
server.get('/',function(request,response){
    var content = '';
    content = HtmlContent();
    console.log("조기축구시작");
    response.send(content);

});
server.get('/history',function(request,response){
    var content = '';
    content = HtmlContent();
   
    response.send("개판이다");

});
server.get('/group',function(request,response){
    var content = '';
    content = HtmlContent(); 
    response.send("말안할래");

});
server.get('/signup',function(request,response){
    content = HtmlContent(); 
    response.send("회원가입");

});
server.get('/login',function(request,response){
    content = HtmlContent();
    response.send("로그인");

});

server.listen(process.env.PORT || 3000);