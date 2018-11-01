var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');
var session = require('express-session'); //세션 미들워어 설치
var FileStore = require('session-file-store')(session); //세션 파일스토어 생성 이왕이면 DB에 넣자
var server = express();
var shortid = require('short-id');

server.use(bodyParser.urlencoded({extended: false}))
server.use(cookieParser())

server.use(session({
 secret: '@#@$MYSIGN#@$#$',
 resave: false,
 saveUninitialized: true,
 store:new FileStore()
}));
server.use(flash());
var db = require('./lib/db');
var passport = require('./lib/passport')(server)
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
function HtmlContent(title,desc,authStatusUI='<a href="/login"> 로그인</a> | | <a href="/register">Register</a>',feedback){
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
    if(request.user){

        //request.session.is_logined 기존
        return true;
    }else{
        return false;
    }
}
function authStatusUI(request,response){
    var authStatusUI = '<a href="/login">로그인</a> | <a href="/register">Register</a>'  
    if(authIsOwner(request,response)){
        authStatusUI = `${request.user.displayName} | <a href="/logout">logout</a>`
        //session일때는 request.session.nickname
    }
    return authStatusUI;
}
server.get('/',function(request,response){  
    var fmsg = request.flash();
    var feedback = ''
    if(fmsg.success){
        

        feedback = fmsg.success[0];
        
    }
    var content = ''; 
    var successful_login = `<div style="color:blue;"> ${feedback} </div>`
    console.log('/',request.user);
    content = HtmlContent(title,desc,authStatusUI(request,response),feedback);
    if(request.session.num === undefined){
        request.session.num = 1;
    } else {
        request.session.num =  request.session.num + 1;
    }
    response.send(content + successful_login + `<br> Views : ${request.session.num}</br>`);

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
// server.get('/signup',function(request,response){
//     request.logout();

//     //destory기능을 쓰는게 불상사를 줄일수 있음..
//     // request.session.destroy(function(err){
//     //     response.redirect('/');
//     // });
//     //session 상태 저장 이상한 에러같은거 엄청뜨는거 방지
//     /* 생코형님들 말로는 destory를 할시 쿠키값으로 가지고 있는걸
//     request header에서 요청하기때문에 이상황이 벌어지는거라고함
//     따라서 변수를 지정한 email이나 password는 냅두고 변수만 없애고
//     만들면 된다고하는데 다음에 해볼게! */
//     request.session.save(function(){
//         var title = '회원가입';
//         var desc = `
//         <form action="/create_process" method="post">
//         <p>
//         <input type="text" name="title" 
//         placeholder="title"></p>
//         <p>
//         <input type="password" name="desc"
//         placeholder="description"></input>
//         </p>
//         <p>
//         <input type="submit" value="회원가입">
//         </p>
//         </form>
//         `;
//         content = HtmlContent(title,desc); 
//         response.send(content);
//     })
    
// });
server.get('/register',function(request,response){
    var title = '로그인';
    var fmsg = request.flash();
    var feedback = ''
    if(fmsg.error){
        feedback = fmsg.error[0];
    }
    
    var desc = `
    <div style="color:red;">${feedback}</div>
    <form action="/register_process" method="post">
    <p>
    <input type="text" name="email" 
    placeholder="email"></p>
    <p>
    <input type="password" name="password"
    placeholder="password"></input>
    </p>
    <p>
    <input type="password" name="password2"
    placeholder="password"></input>
    </p>
    <p>
    <input type="text" name="displayName" 
    placeholder="displayName"></p>
    <p>
    <input type="submit" value="회원가입">
    </p>
    </form>
    `;

    content = HtmlContent(title,desc);
    response.send(content);
});

server.post('/register_process', function(request,response){
    var post = request.body;
    var email = post.email;
    var pwd = post.password;
    var pwd2 = post.password2;
    var displayName = post.displayName;

    if(pwd != pwd2){
        request.flash('errpr', 'Password must same!');
        response.redirect('/auth/register');
    }else{
        var user={
            id:shortid.generate(),
            email:email,
            password:pwd,
            displayName:displayName
        };
        db.get('users').push(user).write();
            request.login(user, function(err){
                console.log('등록은됫다');
                return response.redirect('/'); 
            })
       
        }
    });


server.get('/login',function(request,response){
    var title = '로그인';
    var fmsg = request.flash();
    var feedback = ''
    if(fmsg.error){
        feedback = fmsg.error[0];
    }
    
    var desc = `
    <div style="color:red;">${feedback}</div>
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

// server.post('/login_process',function(request,response){
//     var post = request.body;
//     var email = post.email;
//     var password = post.password; 

//     if(email === authData.email && password === authData.password){
//         console.log("1345");
//         request.session.is_logined = true;
//         request.session.nickname = authData.nickname; 
//         //이거 못해서 3시간동안 뻘짓.....
//         request.session.save(function(){
//             response.redirect('/');
//         }); //
//         console.log(request.session);
        
//     }else{
//         response.send('who')
//     }
//     // response.redirect('/');
    
// });
server.post('/login_process',
  passport.authenticate('local', 
  { 
      successRedirect: '/',      //성공했을때 경로                       
  failureRedirect: '/login',   //실패했을때 경로 
  failureFlash: true, 
  successFlash: true        //지금 실행이 안됨...               
  }));

server.get('/logout',function(request,response){
   
    

    request.logout();

    //destory기능을 쓰는게 불상사를 줄일수 있음..
    // request.session.destroy(function(err){
    //     response.redirect('/');
    // });
    //session 상태 저장 이상한 에러같은거 엄청뜨는거 방지
    /* 생코형님들 말로는 destory를 할시 쿠키값으로 가지고 있는걸
    request header에서 요청하기때문에 이상황이 벌어지는거라고함
    따라서 변수를 지정한 email이나 password는 냅두고 변수만 없애고
    만들면 된다고하는데 다음에 해볼게! */
    request.session.save(function(){
        response.redirect('/');
    })
});
server.listen(process.env.PORT || 3000);