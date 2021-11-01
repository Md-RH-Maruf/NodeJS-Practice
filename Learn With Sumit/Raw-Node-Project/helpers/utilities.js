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

utilities.createRandomString = (stringLength) =>{
    let length = stringLength;

    length = stringLength> 0? stringLength: false;
    let output = '';
    if(length){
        let acceptableCharacter = "abcdefghijklmnopqrstuvwxyz1234567890";
        for(let i=1;i<=stringLength;i++){
            output += acceptableCharacter.charAt(Math.floor(Math.random()*35));
        }
    }
    return output;
}

module.exports = utilities;