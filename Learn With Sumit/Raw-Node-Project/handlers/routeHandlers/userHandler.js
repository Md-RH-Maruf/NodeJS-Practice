
const { hash, parseJSON } = require('../../helpers/utilities');
const data = require('../../lib/data');
const  tokenHandler  = require('./tokenHandler');
const handler = {};

handler.userHandler = (requestProperties,callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if(acceptedMethods.indexOf(requestProperties.method) > -1){
        handler._users[requestProperties.method](requestProperties, callback);
    }else {
        callback(405);
    }
    
}

handler._users = {};

handler._users.post = (requestProperties, callback) => {
    const firstName = typeof(requestProperties.body.firstName) === 'string' &&  requestProperties.body.firstName.trim().length > 0 ? requestProperties.body.firstName.trim() : false;
    const lastName = typeof(requestProperties.body.lastName) === 'string' &&  requestProperties.body.lastName.trim().length > 0 ? requestProperties.body.lastName.trim() : false;
    const phone = typeof(requestProperties.body.phone) === 'string' &&  requestProperties.body.phone.trim().length > 0 ? requestProperties.body.phone.trim() : false;
    const password = typeof(requestProperties.body.password) === 'string' &&  requestProperties.body.password.trim().length > 0 ? requestProperties.body.password.trim() : false;
    const tosAgreement = typeof(requestProperties.body.tosAgreement) === 'boolean' ? requestProperties.body.tosAgreement : false;

    if(firstName && lastName && phone && password && tosAgreement){
        data.read('users',phone, (err) => {
            if(err){
                let userObject = {
                    firstName,
                    lastName,
                    phone,
                    password: hash(password),
                    tosAgreement
                }

                data.create('users',phone,userObject, (err2)=>{
                    if(!err2){
                        callback(200,{
                            message: 'User was created successfully'
                        })
                    }else{
                        callback(500,{ error: 'Could not create user!'})
                    }
                });
            }else{
                callback(500,{
                    error: 'There was a problem in server side!'
                })
            }
        });
    }else{
        callback(400,{
            error: 'You have a problem in your request',
        })
    }
};

handler._users.get = (requestProperties, callback) => {
    const phone = typeof(requestProperties.queryStringObject.phone) === 'string' &&  requestProperties.queryStringObject.phone.trim().length > 0 ? requestProperties.queryStringObject.phone.trim() : false;

    if(phone){
        let token = typeof(requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token: false;

        tokenHandler._token.verify(token,phone, (tokenId)=>{
            if(tokenId){
                data.read('users',phone,(err,u) =>{
                    const user = {...parseJSON(u)};
                    if(!err && user){
                        delete(user.password);
                        callback(200,user);
                    }else {
                        callback(404,{
                            error: 'Requested user was not found!',
                        });
                    }
                });
            }else{
                callback(403,{
                    error: 'Authentication Failure',
                });
            }
        });
        
    }else{
        callback(404,{
            error: 'Requested user was not found!',
        })
    }
};

handler._users.put = (requestProperties, callback) => {
    const firstName = typeof(requestProperties.body.firstName) === 'string' &&  requestProperties.body.firstName.trim().length > 0 ? requestProperties.body.firstName.trim() : false;
    const lastName = typeof(requestProperties.body.lastName) === 'string' &&  requestProperties.body.lastName.trim().length > 0 ? requestProperties.body.lastName.trim() : false;
    const phone = typeof(requestProperties.body.phone) === 'string' &&  requestProperties.body.phone.trim().length > 0 ? requestProperties.body.phone.trim() : false;
    const password = typeof(requestProperties.body.password) === 'string' &&  requestProperties.body.password.trim().length > 0 ? requestProperties.body.password.trim() : false;
    
    if(phone){
        if(firstName || lastName || password){
            let token = typeof(requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token: false;

        tokenHandler._token.verify(token,phone, (tokenId)=>{
            if(tokenId){
                data.read('users',phone,(err, uData)=>{
                    let userData = {...parseJSON(uData)};
                    if(!err && userData){
                        if(firstName){
                            userData.firstName = firstName;
                        }
                        if(lastName){
                            userData.lastName = lastName;
                        }
                        if(password){
                            userData.password = hash(password);
                        }
    
                        data.update('users',phone,userData,(err2)=>{
                            if(!err2){
                                callback(200,{
                                    message: 'User was updated usccessfully!',
                                })
                            }else{
                                callback(500,{
                                    error: 'There was a problem in the server side!'
                                })
                            }
                        })
                    }else{
                        callback(400,{
                            error: "You have a problem in your request!",
                        })    
                    }
                });
            }else{
                callback(403,{
                    error: 'Authentication Failure',
                });
            }
        });
            
        }else{
            callback(400,{
                error: "You have a problem in your request!",
            })    
        }
    }else{
        callback(400,{
            error: "Invalid phone number, Please try again!",
        })
    }
};

handler._users.delete = (requestProperties, callback) => {
    const phone = typeof(requestProperties.queryStringObject.phone) === 'string' &&  requestProperties.queryStringObject.phone.trim().length > 0 ? requestProperties.queryStringObject.phone.trim() : false;

    if(phone){
        let token = typeof(requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token: false;

        tokenHandler._token.verify(token,phone, (tokenId)=>{
            if(tokenId){
                data.read('users',phone,(err,userData) =>{
                    if(!err && userData){
                        data.delete('users',phone,(err2)=>{
                            if(!err2){
                                callback(200,{
                                    message: "User was deleted successfully"
                                });
                            }else{
                                callback(500,{
                                    error: 'There was a server side error!'
                                })
                            }
                        });
                    }else{
                        callback(500,{
                            error: 'There was a server side error!'
                        })        
                    }
                });
            }else{
                callback(403,{
                    error: 'Authentication Failure',
                });
            }
        });
        
    }else{
        callback(400,{
            error: 'There was a problem in your request!'
        })
    }
};


module.exports = handler;