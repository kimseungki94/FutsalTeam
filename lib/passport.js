var db = require('../lib/db');
var bcrypt = require('bcrypt');
var express = require('express');

module.exports = function(server){
    // var authData = {
    //     email:'skkim0832@gmail.com',
    //     password:'1111',
    //     nickname:'seung'
    // }

    var passport = require('passport')
   ,LocalStrategy = require('passport-local').Strategy,          //;를 ,로 바꾸고 싶은데 안됨
   GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
   FacebookStrategy = require('passport-facebook').Strategy;
    
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
// 구글로그인 구현
  var googleCredentials = require('../config/google.json');
//   console.log(googleCredentials.web.client_id);
  passport.use(new GoogleStrategy({
    clientID: googleCredentials.web.client_id,
    clientSecret: googleCredentials.web.client_secret,
    callbackURL: googleCredentials.web.redirect_uris[0]
  },
  function(accessToken, refreshToken, profile, done) {
      console.log('GoogleStrategy',accessToken,refreshToken,profile)
      var email = profile.emails[0].value;
      var user = db.get('users').find({email:email}).value();
      user.googleId = profile.id;
      db.get('users').find({id:user.id}).assign(user).write();
      done(null,user);
    //    User.findOrCreate({ googleId: profile.id }, function (err, user) {
    //      return done(err, user);
    //    });
  }
));
// app.get('/google',
//   passport.authenticate('google', {
//        scope: ['https://www.googleapis.com/auth/plus.login'] 
//     }));
server.get('/auth/google',

passport.authenticate('google', {
    scope: ['https://www.googleapis.com/auth/plus.login','email'] 
       
}));
server.get('/auth/google/callback', 
  passport.authenticate('google', 
  { failureRedirect: '/login' }),
  function(req, res) {
    console.log("살려줘");
    res.redirect('/');
  });



  //페이스북 로그인 구현
  passport.use(new FacebookStrategy({
    clientID: "185510502328196",
    clientSecret: "d4e1ea1e9b408a2a68f15d6e5afda0ef",
    callbackURL: "http://localhost:3000/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log('FacebookStrategy',accessToken,refreshToken,profile)
    // User.findOrCreate({ facebookId: profile.id }, function (err, user) {
    //   return cb(err, user);
    // });
    // console.log('GoogleStrategy',accessToken,refreshToken,profile)

    
    // console.log(profile.id)
    // var user = db.get('users');
    // user.facebookId =profile.id;
    // db.get('users').find({id:user.id}).assign(user).write();
    cb(null,profile);
   
    
    //   var email = profile.emails[0].value;
    //   var user = db.get('users').find({email:email}).value();
    //   user.facebookId = profile.id;
    //   db.get('users').find({id:user.id}).assign(user).write();
    //   cb(null,user);
  }
));
server.get('/auth/facebook',
passport.authenticate('facebook', { scope: ['user_friends', 'manage_pages','email'] }));

server.get('/auth/facebook/callback',
  passport.authenticate('facebook',
   { 
       
       failureRedirect: '/login'
     }),
  function(req, res) {
      // 지금 여기까지 들어가는거 가능!!
    console.log("패북살려줘");
    // Successful authentication, redirect home.
    res.redirect('/');
  });


  return passport;
}
