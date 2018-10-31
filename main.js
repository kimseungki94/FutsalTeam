const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)
var fs = require('fs');
// var passport = require('passport')
// ,LocalStrategy = require('passport-local');
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session'); //세션 미들워어 설치
var FileStore = require('session-file-store')(session); //세션 파일스토어 생성 이왕이면 DB에 넣자
var server = express();
server.use(bodyParser.urlencoded({extended: false}))
server.use(cookieParser())

server.use(session({
 secret: '@#@$MYSIGN#@$#$',
 resave: false,
 saveUninitialized: true,
 store:new FileStore()
}));
var title = '';
var desc = '';

// //low db 사용
// // Set some defaults (required if your JSON file is empty)
// db.defaults({ topic: [], author: {}})
//   .write()

// // Add a post
// db.get('posts')
//   .push({ id: 1, title: 'lowdb is awesome'})
//   .write()

// // Set a user using Lodash shorthand syntax
// db.set('user.name', 'typicode')
//   .write()
  
// // Increment count
// db.update('count', n => n + 1)
//   .write()

  //홈페이지 구현
function HtmlContent(title,desc,authStatusUI='<a href="/login"> 로그인</a>'){
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
      ${authStatusUI} <a href="/signup"> 회원가입 </a> <br></br>
      <br><button onclick="location.href = 'history';
    "id="Button">역사</button>
    <button onclick="location.href = 'group';
    "id="Button">조직도</button>
    <button onclick="location.href = 'create';
    "id="Button">게시글작성</button>

    </br>
    <br>
    ${title}
    </br>
    ${desc}
    
    </body>
    </html>
    `;
    return content;
}
function authIsOwner(request,response){
    if(request.session.is_logined){
        return true;
    }else{
        return false;
    }
}
function authStatusUI(request,response){
    var authStatusUI = '<a href="/login">로그인</a>'
    if(authIsOwner(request,response)){
        authStatusUI = `${request.session.nickname} | <a href="/logout">logout</a>`
    }
    return authStatusUI;
}
server.get('/',function(request,response){  
    var content = ''; 
    console.log(request.session);
    content = HtmlContent(title,desc,authStatusUI(request,response));
    if(request.session.num === undefined){
        request.session.num = 1;
    } else {
        request.session.num =  request.session.num + 1;
    }
    response.send(content + `<br> Views : ${request.session.num}</br>`);

});
server.get('/create',function(request,response){
    if(authIsOwner(request,response)){
        var title = '게시판 만들기';
    var desc = `
    <form action="/create_question" method="post">
    <p>
    <input type="text" name="title" 
    placeholder="title"></p>
    <p>
    <textarea name="desc"
    placeholder="description"></textarea>
    </p>
    <p>
    <input type="submit" value="질문작성">
    </p>
    </form>
    `;
        var content = HtmlContent(title,desc,authStatusUI(request,response))
        response.send(content);
    }
    else{
        response.redirect('/');
        return false;
    }
});
server.get('/history',function(request,response){
    var content = '';
    content = HtmlContent(title,desc,authStatusUI(request,response));
   
    response.send(content + `<br>개판이다</br>`);

});
server.get('/group',function(request,response){
    var content = '';
    content = HtmlContent(title,desc,authStatusUI(request,response)); 
    response.send(content + `<br>말안할래</br>`);

});
server.get('/signup',function(request,response){
    var title = '회원가입';
    var desc = `
    <form action="/create_process" method="post">
    <p>
    <input type="text" name="title" 
    placeholder="title"></p>
    <p>
    <input type="password" name="desc"
    placeholder="description"></input>
    </p>
    <p>
    <input type="submit" value="회원가입">
    </p>
    </form>
    `;
    content = HtmlContent(title,desc); 
    response.send(content);
});

var authData = {
    email:'skkim0832@gmail.com',
    password:'1111',
    nickname:'seung'
}

server.get('/login',function(request,response){
    var title = '로그인';
    var desc = `
    <form action="/login_process" method="post">
    <p>
    <input type="text" name="email" 
    placeholder="email"></p>
    <p>
    <input type="password" name="password"
    placeholder="password"></input>
    </p>
    <p>
    <input type="submit" value="로그인">
    </p>
    </form>
    `;

    content = HtmlContent(title,desc);
    response.send(content);
});

server.post('/login_process',function(request,response){
    var post = request.body;
    var email = post.email;
    var password = post.password; 

    if(email === authData.email && password === authData.password){
        console.log("1345");
        request.session.is_logined = true;
        request.session.nickname = authData.nickname; 
        //이거 못해서 3시간동안 뻘짓.....
        request.session.save(function(){
            response.redirect('/');
        }); //
        console.log(request.session);
        
    }else{
        response.send('who')
    }
    // response.redirect('/');
    
});
server.get('/logout',function(request,response){
   
    request.session.destroy(function(err){
        response.redirect('/');
    });
});
server.listen(process.env.PORT || 3000);