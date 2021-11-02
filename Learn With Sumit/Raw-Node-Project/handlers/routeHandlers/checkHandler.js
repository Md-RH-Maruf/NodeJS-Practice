
const { hash, parseJSON, createRandomString } = require('../../helpers/utilities');
const data = require('../../lib/data');
const  tokenHandler  = require('./tokenHandler');
const {maxChecks} = require('../../helpers/environments');
const handler = {};

handler.checkHandler = (requestProperties,callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if(acceptedMethods.indexOf(requestProperties.method) > -1){
        handler._checks[requestProperties.method](requestProperties, callback);
    }else {
        callback(405);
    }
    
}

handler._checks = {};

handler._checks.post = (requestProperties, callback) => {
    let protocol = typeof(requestProperties.body.protocol) === 'string' && ['http','https'].indexOf(requestProperties.body.protocol)>-1 ? requestProperties.body.protocol: false;
    
    let url = typeof(requestProperties.body.url) === 'string' &&        requestProperties.body.url.trim().length > 0 ? requestProperties.body.url : false;
    
    let method = typeof(requestProperties.body.method) === 'string' && ['get','post','put','delete'].indexOf(requestProperties.body.method)>-1 ? requestProperties.body.method : false;

    let successCodes = typeof(requestProperties.body.successCodes) === 'object' && requestProperties.body.successCodes instanceof Array ? requestProperties.body.successCodes : false;

    let timeoutSeconds = typeof(requestProperties.body.timeoutSeconds) === 'number' && requestProperties.body.timeoutSeconds % 1 === 0 && requestProperties.body.timeoutSeconds >= 1 && requestProperties.body.timeoutSeconds <= 5 ? requestProperties.body.timeoutSeconds : false;


    if(protocol && url && method && successCodes && timeoutSeconds){
        let token = typeof(requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token: false;

        data.read('tokens',token, (err, tokenData) => {

            if(!err && tokenData){
                let userPhone = parseJSON(tokenData).phone;

                data.read('users',userPhone,(err2,userData)=>{
                    if(!err2 && userData){
                       
                        tokenHandler._token.verify(token, userPhone, (tokenIsValid) =>{
                            if(tokenIsValid){
                                let userObject = parseJSON(userData);
                                let userChecks = typeof(userObject.checks) === 'object' && userObject.checks instanceof Array ? userObject.checks : [];

                                if(userChecks.length < maxChecks){
                                    const checkId = createRandomString(20);
                                    const checkObject = {
                                        id: checkId,
                                        userPhone,
                                        protocol,
                                        url,
                                        method,
                                        successCodes,
                                        timeoutSeconds,
                                    };

                                    data.create('checks', checkId, checkObject, (err3) =>{
                                        if(!err3){
                                            userObject.checks = userChecks;
                                            userObject.checks.push(checkId);

                                            data.update('users',userPhone, userObject, (err4)=>{
                                                if(!err4){
                                                    callback(200, checkObject);
                                                }else{
                                                    callback(500,{
                                                        error: 'There was a problem in the server side!'
                                                    })
                                                }
                                            });
                                        }else{
                                            callback(500,{
                                                error: 'There was a problem in the server side!'
                                            })
                                        }
                                    });

                                }else{
                                    callback(401,{
                                        error: 'User checks already reached max check limit!',
                                    })
                                }
                            }else{
                                callback(403,{
                                    error: 'Authentication problem!',
                                })
                            }
                        })
                    }else{
                        callback(403,{
                            error: 'User not found!'
                        })
                    }
                });
            }else{
                callback(403, {
                    error: 'Authentication problem!'
                })
            }
        })
    }else{
        callback(400,{
            error: 'Your have a problem in your request',
        })
    }
};

handler._checks.get = (requestProperties, callback) => {
    const id = typeof(requestProperties.queryStringObject.id) === 'string' &&  requestProperties.queryStringObject.id.trim().length === 20 ? requestProperties.queryStringObject.id.trim() : false;

    if(id){
        data.read('checks', id, (err, checkData)=>{
            if(!err && checkData){
                let token = typeof(requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token: false;
                let checkObject = parseJSON(checkData);
                tokenHandler._token.verify(token, checkObject.userPhone, (tokenIsValid) =>{
                    if(tokenIsValid){
                        callback(200,checkObject);
                    }else{
                        callback(403,{
                            error: 'Authentication problem!',
                        })
                    }
                })
            }else{
                callback(500,{
                    error: 'You have a problem in your request',
                })
            }
        })
    }else{
        callback(400,{
            error: "You have a problem in your request",
        })
    }
};

handler._checks.put = (requestProperties, callback) => {
    const id = typeof(requestProperties.body.id) === 'string' &&  requestProperties.body.id.trim().length === 20 ? requestProperties.body.id.trim() : false;

    let protocol = typeof(requestProperties.body.protocol) === 'string' && ['http','https'].indexOf(requestProperties.body.protocol)>-1 ? requestProperties.body.protocol: false;
    
    let url = typeof(requestProperties.body.url) === 'string' &&        requestProperties.body.url.trim().length > 0 ? requestProperties.body.url : false;
    
    let method = typeof(requestProperties.body.method) === 'string' && ['get','post','put','delete'].indexOf(requestProperties.body.method)>-1 ? requestProperties.body.method : false;

    let successCodes = typeof(requestProperties.body.successCodes) === 'object' && requestProperties.body.successCodes instanceof Array ? requestProperties.body.successCodes : false;

    let timeoutSeconds = typeof(requestProperties.body.timeoutSeconds) === 'number' && requestProperties.body.timeoutSeconds % 1 === 0 && requestProperties.body.timeoutSeconds >= 1 && requestProperties.body.timeoutSeconds <= 5 ? requestProperties.body.timeoutSeconds : false;

    if(id){
        if(protocol || url || method || successCodes || timeoutSeconds){
            data.read('checks', id, (err,checkData) => {
                if(!err && checkData){
                    const checkObject = parseJSON(checkData);
                    const token = typeof requestProperties.headersObject.token === 'string' ? requestProperties.headersObject.token : false;
                    tokenHandler._token.verify(token, checkObject.userPhone, (tokenIsValid) =>{
                        if(tokenIsValid){
                            if(protocol){
                                checkObject.protocol = protocol;
                            }
                            if(url){
                                checkObject.url = url;
                            }
                            if(method){
                                checkObject.method = method;
                            }
                            if(successCodes){
                                checkObject.successCodes = successCodes;
                            }
                            if(timeoutSeconds){
                                checkObject.timeoutSeconds = timeoutSeconds;
                            }

                            data.update('checks',id, checkObject, (err2) => {
                                if(!err2){
                                    callback(200);
                                }else{
                                    callback(500,{
                                        error: 'There was a server side error!',
                                    })
                                }
                            })
                        }else{
                            callback(403,{
                                error: 'Authentication error!',
                            });
                        }
                    });

                }else{
                    callback(500,{
                        error: 'There was a problem in the server side!'
                    })
                }
            })
        }else{
            callback(400,{
                error: 'You must provide at least one field to update!'
            });
        }
    }else{
        callback(400,{
            error: 'You have a problem in your request'
        })
    }

};

handler._checks.delete = (requestProperties, callback) => {
    const id = typeof(requestProperties.queryStringObject.id) === 'string' &&  requestProperties.queryStringObject.id.trim().length === 20 ? requestProperties.queryStringObject.id.trim() : false;

    if(id){
        data.read('checks', id, (err, checkData)=>{
            if(!err && checkData){
                let token = typeof(requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token: false;
                let checkObject = parseJSON(checkData);
                tokenHandler._token.verify(token, checkObject.userPhone, (tokenIsValid) =>{
                    if(tokenIsValid){
                        data.delete('checks',id,(err2)=>{
                            if(!err2){
                                data.read('users',parseJSON(checkData).userPhone,(err3,userData)=>{
                                    const userObject = parseJSON(userData);
                                    if(!err3 && userData){
                                        const userChecks = typeof(userObject.checks) === 'object' && userObject.checks instanceof Array ? userObject.checks : [];

                                        const checkPosition = userChecks.indexOf(id);
                                        if(checkPosition > -1){
                                            userChecks.splice(checkPosition,1);
                                            userObject.checks = userChecks;
                                            data.update('users',userObject.phone,userObject,(err4)=>{
                                                if(!err4){
                                                    callback(200);
                                                }else{
                                                    callback(500,{
                                                        error: 'There was a server side problem'
                                                    })
                                                }
                                            })
                                        }else{
                                            callback(500,{
                                                error: 'The check id that you are trying to remove is not found in user!'
                                            })
                                        }
                                    }else{
                                        callback(500,{
                                            error: 'There was a server side problem!',
                                        })
                                    }
                                })
                            }else{
                                callback(500,{
                                    error: 'There was a server side problem!',
                                })
                            }
                        })
                    }else{
                        callback(403,{
                            error: 'Authentication problem!',
                        })
                    }
                })
            }else{
                callback(500,{
                    error: 'You have a problem in your request',
                })
            }
        })
    }else{
        callback(400,{
            error: "You have a problem in your request",
        })
    }
};


module.exports = handler;