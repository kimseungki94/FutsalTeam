var express = require('express');
var router = express.Router();

router.get('/',function(request,response){
    // var content = '';
    // content = HtmlContent(title,desc,authStatusUI(request,response),textlist()); 
    // fs.readFile('./view/sample.html');
    // response.writeHead(200, { 'content-Type': 'sample.html'});
    response.render('group.html',{result: true});
   
    

});
module.exports = router;