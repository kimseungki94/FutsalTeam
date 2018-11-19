var express = require('express');
var router = express.Router();


router.get('/',function(request,response){
    // var content = '';
    // content = HtmlContent(title,desc,authStatusUI(request,response),textlist());
    response.send("개판이다");

});
module.exports = router;