const url = require('url');
const {StringDecoder} = require('string_decoder');
const routes = require('../routes');
const { notFoundHandler } = require('../handlers/routeHandlers/notFoundHandler');
const { parseJSON } = require('./utilities');

const handler = {}

handler.handleReqRes = (req, res) => {
    
    
    const parsedUrl = url.parse(req.url,true);
    const path = parsedUrl.pathname;
    const trimedPath = path.replace(/^\/+|\/+$/g,'');
    const method = req.method.toLowerCase();
    const queryStringObject = parsedUrl.query;
    const headersObject = req.headers;

    const requestProperties = {
        parsedUrl,
        path,
        trimedPath,
        method,
        queryStringObject,
        headersObject
    }

    let bodyData = '';
    const decoder = new StringDecoder('utf-8');

    const chosenHandler = routes[trimedPath] ? routes[trimedPath] : notFoundHandler;

    req.on('data',(buffer)=>{
        bodyData += decoder.write(buffer);
    })

    req.on('end',()=>{
        bodyData += decoder.end();
        requestProperties.body = parseJSON(bodyData);
        chosenHandler(requestProperties, (statusCode, payload) => {
            statusCode = typeof statusCode === 'number' ? statusCode : 500;
            payload = typeof payload === 'object' ? payload : {};

            const payloadString = JSON.stringify(payload);

            res.setHeader('Content-Type','application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
        });
    });
    
}

module.exports = handler;