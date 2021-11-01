
const { hash } = require('../../helpers/utilities');
const data = require('../../lib/data');
const handler = {};

handler.userHandler = (requestProperties,callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if(acceptedMethods.indexOf(requestProperties.method) > -1){
        handler._users[requestProperties.method](requestProperties, callback);
    }else {
        callback(405);
    }
    callback(200,{
        message: 'This is a user url',
    })
}

handler._users = {};

handler._users.post = (requestProperties, callback) => {
    const firstName = typeof(requestProperties.body.firstName) === 'string' &&  requestProperties.body.firstName.trim().length > 0 ? requestProperties.body.firstName.trim() : false;
    const lastName = typeof(requestProperties.body.lastName) === 'string' &&  requestProperties.body.lastName.trim().length > 0 ? requestProperties.body.lastName.trim() : false;
    const phone = typeof(requestProperties.body.phone) === 'string' &&  requestProperties.body.phone.trim().length > 0 ? requestProperties.body.phone.trim() : false;
    const password = typeof(requestProperties.body.password) === 'string' &&  requestProperties.body.password.trim().length > 0 ? requestProperties.body.password.trim() : false;
    const tosAgreement = typeof(requestProperties.body.tosAgreement) === 'boolean' &&  requestProperties.body.lastName.trim().length > 0 ? requestProperties.body.tosAgreement.trim() : false;

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
    callback(200,{});
};

handler._users.put = (requestProperties, callback) => {

};

handler._users.delete = (requestProperties, callback) => {

};

module.exports = handler;