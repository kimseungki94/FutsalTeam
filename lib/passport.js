var db = require('../lib/db');
var bcrypt = require('bcrypt');
module.exports = function(server){
    // var authData = {
    //     email:'skkim0832@gmail.com',
    //     password:'1111',
    //     nickname:'seung'
    // }

    var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
    var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
  server.use(passport.initialize());
  server.use(passport.session());
  passport.serializeUser(function(user, done) {
      console.log('serializeUser',user);
      console.log('ㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏ');    
        done(null,user.id);
        //원래 user.email이엇음
  });
  
  passport.deserializeUser(function(id, done) {
      //시리얼이 활성화가 될시 바로 deserial이 실행된다!
        // 로그인이되면 경로 옮길때마다 실행됨
        var user = db.get('users').find({id:id}).value();
     
    done(null,user);
    
  });
  passport.use(new LocalStrategy(
      //로컬전략을 여기서 쓴거
      {
          usernameField: 'email',
          passwordField: 'password'
      },
    function(email, password, done) {
        console.log('LocalStrategy',email,password);
        var user = db.get('users').find({email:email}).value();
        if(user){
            bcrypt.compare(password,user.password,
                function(err,result){
                    if(result){
                        return done(null, user,{
                            message: 'Welcome.'
                        });
                    }else{
                        return done(null, false, { 
                            message: 'Password is not correct.'
                        });
                    }
                });
               
        }else{
            return done(null, false, { 
                message: 'There is no email' });
        }
//         if(email===authData.email){
//             console.log(1);
//             if(password===authData.password){
//                 console.log(2);
//                 return done(null, authData,{
//                     message: 'Welcome.'
//                 });
//             }else{
//                 console.log(3);
//                 return done(null, false, { 
//                     message: 'Incorrect password.' });
//             }
//         }else{
//             console.log(4);
//             return done(null, false,
//                  { message: 'Incorrect email.' 
//                 });
//         }
    }
  ));
  return passport;
}
