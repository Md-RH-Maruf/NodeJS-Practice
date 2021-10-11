var http = require('http');

http.createServer(function (req,res){
    res.writeHead(200,{'Content-Type': 'text/plain'});
    console.log("This example is different!");
    console.log("The result is displayed in the command line interface");
    
    res.end('Hello World!');
    
}).listen(8080);