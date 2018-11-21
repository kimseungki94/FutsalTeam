var express = require('express');
var router = express.Router();

router.use(express.static('css'));
router.get('/',function(request,response){
    // var content = '';
    // content = HtmlContent(title,desc,authStatusUI(request,response),textlist()); 
    // fs.readFile('./view/sample.html');
    // response.writeHead(200, { 'content-Type': 'sample.html'});
    // response.sendFile(path.join(__dirname, "./view/index.html"));

    response.render('group.html');
    

});
module.exports = router;