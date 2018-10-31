module.exports = function(server){
    var authData = {
        email:'skkim0832@gmail.com',
        password:'1111',
        nickname:'seung'
    }

    var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

  server.use(passport.initialize());
  server.use(passport.session());
  passport.serializeUser(function(user, done) {
      console.log('serializeUser',user);    
        done(null,user.email);
  });
  
  passport.deserializeUser(function(id, done) {
      //시리얼이 활성화가 될시 바로 deserial이 실행된다!
        // 로그인이되면 경로 옮길때마다 실행됨
      console.log('deserializerUser',id); 
    done(null,authData);
    
  });
  passport.use(new LocalStrategy(
      //로컬전략을 여기서 쓴거
      {
          usernameField: 'email',
          passwordField: 'password'
      },
    function(username, password, done) {
        console.log('LocalStrategy',username,password);
        if(username===authData.email){
            console.log(1);
            if(password===authData.password){
                console.log(2);
                return done(null, authData);
            }else{
                console.log(3);
                return done(null, false, { 
                    message: 'Incorrect password.' });
            }
        }else{
            console.log(4);
            return done(null, false,
                 { message: 'Incorrect email.' 
                });
        }
    }
  ));
  return passport;
}
