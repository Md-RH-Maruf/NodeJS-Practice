const crypto = require('crypto');
const environment = require('./environments');

const utilities = {};

utilities.parseJSON = (jsonString) => {
    let jsonObject = {};

    try{
        jsonObject = JSON.parse(jsonString);
    }catch{
        jsonObject = {};
    }

    return jsonObject;
};

utilities.hash = (str) => {
    if(typeof str === 'string' && str.length > 0){
        const hash = crypto.createHmac('sha256',environment.secretkey).update(str).digest('hex');

        return hash;
    }
    return false;
};

module.exports = utilities;