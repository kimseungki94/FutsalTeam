var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');
var session = require('express-session'); //세션 미들워어 설치
var FileStore = require('session-file-store')(session); //세션 파일스토어 생성 이왕이면 DB에 넣자
var server = express();
var shortid = require('short-id');
var sanitizeHtml = require('sanitize-html');
var db = require('./lib/db');
var bcrypt= require('bcrypt');
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

var list = db.get('topics').value();
function textlist(request,response,next){
        var i=0;
        var listText = '';
        
        while(i <list.length){
            listText = listText + `<li><a href="/topic/${list[i].id}">${list[i].title}</a></li>`;
            i = i + 1;
            
        }
        return listText;
    }

  //홈페이지 구현
function HtmlContent(title,desc,authStatusUI='<a href="/login"> 로그인</a> | | <a href="/register">Register</a>',listText){
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
      ${authStatusUI}  <br><button onclick="location.href = 'google';
      "id="Button">구글로그인</button>
      <button onclick="location.href = 'facebook';
      "id="Button">facebook로그인</button>
      <br></br>
      <br><button onclick="location.href = 'history';
    "id="Button">역사</button>
    <button onclick="location.href = 'group';
    "id="Button">조직도</button>
    <button onclick="location.href = 'create';
    "id="Button">게시글작성</button>
    <button onclick="location.href = 'update';
    "id="Button">게시글수정</button>
    <button onclick="location.href = 'delete';
    "id="Button">게시글삭제</button>
    <button onclick="location.href = 'schedule';
    "id="Button">일정확인</button>
    <button onclick="location.href = 'customer';
    "id="Button">고객문의</button>

    <br>
    ${listText}
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
    var authStatusUI = '<a href="/login">로그인</a> | <a href="/register">회원가입</a>'  
    if(authIsOwner(request,response)){
        authStatusUI = `${request.user.displayName} | <a href="/logout">로그아웃</a>`
        //session일때는 request.session.nickname
    }
    return authStatusUI;
}

// server.get('*',function(request,response,next){  
   
//     var content = ''; 
//     content = HtmlContent(textlist());
   
//     return next();

// });
server.get('/',function(request,response){  
    var fmsg = request.flash();
    var feedback = ''
    
    if(fmsg.success){
        

        feedback = fmsg.success[0];
        
    }
    var content = ''; 
    var successful_login = `<div style="color:blue;"> ${feedback} </div>`

    console.log('/',request.user);
    content = HtmlContent(title,desc,authStatusUI(request,response),textlist());
    if(request.session.num === undefined){
        request.session.num = 1;
    } else {
        request.session.num =  request.session.num + 1;
    }
    response.send(content + successful_login);

});


server.get('/create',function(request,response){
    
    if(authIsOwner(request,response)){
        var title = '게시판 만들기';
    var desc = `
    <form action="/create_question" method="post">
    <h5> 제목 </h5>
    <p>
    <input type="text" name="title" 
    placeholder="title"></p>
    <h5> 설명 </h5>
    <p>
    <textarea name="description"
    placeholder="description"></textarea>
    </p>
    <p>
    <input type="submit" value="질문작성">
    </p>
    </form>
    `;
        var content = HtmlContent(title,desc,authStatusUI(request,response),textlist());
        response.send(content);
    }
    else{
        response.redirect('/');
        return false;
    }
});
server.post('/create_question', function(request,response){
    if(!authIsOwner(request,response)){
        response.redirect('/');
        return false;

    }
    var post = request.body;
    var title = post.title;
    var description = post.description;
    var id = shortid.generate();
    db.get('topics').push({
        id:id,
        title:title,
        description:description,
        user_id:request.user.id
    }).write();
    // response.redirect(`/topic/${id}`)
    response.redirect('/');
})
server.get('/topic/:pageId', function(request,response,next){
    var topic = db.get('topics').find({
        id:request.params.pageId,
    }).value();
    var user = db.get('users').find({
        id:topic.user_id
    }).value();


    //쓰는방법을 모르겠음 undefine뜨고 담에 확인하자..
    // var  description=request.params.description
    // var sanitizedTitle = sanitizeHtml(topic,title);
    // var sanitizedDescription = sanitizeHtml(topic,description,{
    //     allowedTags: ['h1']
    // });
   
    var content = `지은사람 | ${user.displayName} 주제 ${topic.title} |
    내용 ${topic.description}`;

    // var filteredId = path.parse(request.params.pageId).base;
    // fs.readFile(`data/`)
    response.send(content);
});
server.get('/history',function(request,response){
    var content = '';
    content = HtmlContent(title,desc,authStatusUI(request,response),textlist());
   
    response.send(content + `<br>개판이다</br>`);

});
server.get('/group',function(request,response){
    var content = '';
    content = HtmlContent(title,desc,authStatusUI(request,response),textlist()); 
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
    var title = '회원가입';
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

    content =  HtmlContent(title,desc,authStatusUI(request,response),textlist());
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
        bcrypt.hash(pwd, 10, function(err, hash) {
            // Store hash in your password DB.
            var user={
                id:shortid.generate(),
                email:email,
                password:hash,
                displayName:displayName
            };
            db.get('users').push(user).write();
                request.login(user, function(err){
                    return response.redirect('/'); 
                })      
        });
        
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

    content = HtmlContent(title,desc,authStatusUI(request,response),textlist());
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
server.get('/update',function(request,response){
    
    if(authIsOwner(request,response)){
    var topic = db.get('topics').find({user_id:request.user.id}).value();
    var title = '게시판 수정';
    var desc = `
    <form action="/update_process" method="post">
    <p>
    <h5> 제목 </h5>
    <input type="text" name="title" 
    placeholder="${topic.title}"></p>
    <p>
    <h5> 설명 </h5>
    <textarea name="description"
    placeholder="${topic.description}"></textarea>
    </p>
    <p>
    <input type="submit" value="수정">
    </p>
    </form>
    `;
        var content = HtmlContent(title,desc,authStatusUI(request,response),textlist());
        response.send(content);
    }
    else{
        response.redirect('/');
        return false;
    }
});
server.post('/update_process',function(request,response){
    var post = request.body;
    
    var title = post.title;
    var description = post.description;

    var topic = db.get('topics').find({user_id:request.user.id}).value();
    console.log(post);
    console.log("ㅗㅗㅗㅗㅗㅗㅗㅗㅗㅗㅗㅗㅗㅗㅗ");
    console.log(topic)
    db.get('topics').find({user_id:request.user.id}).assign({
        title:title, description:description
    }).write();
    // if(authIsOwner(request,response)){
   
    // }
    // else{
    //     response.redirect('/');
    //     return false;
    // }
    response.redirect('/');
});
server.get('/delete',function(request,response){
    if(!authIsOwner(request,response)){
        response.redirect('/');
        return false;
    }
    db.get('topics').remove({
        user_id:request.user.id
    }).write();
    response.redirect('/');

})
server.listen(process.env.PORT || 3000);