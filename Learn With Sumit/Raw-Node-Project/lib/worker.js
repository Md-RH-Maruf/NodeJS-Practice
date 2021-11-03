
const url = require('url');
const http = require('http');
const https = require('https');
const { parseJSON } = require('../helpers/utilities');
const data = require('./data');
const {sendTwilioSms} = require('../helpers/notification');

const worker = {}

worker.gatherAllChecks = () => {
    data.list('checks',(err,checks)=>{
        if(!err && checks && checks.length > 0){
            checks.forEach(check =>{
                data.read('checks',check, (err2, originalCheckData)=>{
                    if(!err2 && originalCheckData){
                        worker.validateCheckData(parseJSON(originalCheckData));
                    }else{
                        console.log('Error: reading one of the checks data!');
                    }
                });
            })
        }else {
            console.log('Error: could not find any checks to process!');
        }
    })
}

worker.validateCheckData = (originalCheckData) => {
    let originalData = originalCheckData;
    if(originalCheckData && originalCheckData.id){
        originalData.state = typeof(originalCheckData.state) === 'string' && ['up','down'].indexOf(originalCheckData.state) > -1 ? originalCheckData.state : 'down';

        originalData.lastChecked = typeof(originalCheckData.lastChecked) === 'number' && originalCheckData.lastChecked > 0 ? originalCheckData.lastChecked : false;

        worker.performCheck(originalData);
    }else{
        console.log('Error: check was invalid or not properly formatted!');
    }
}

worker.performCheck = (originalData) => {
    let checkOutCome = {
        'error': false,
        'responseCode': false
    }
    let outcomeSent = false;

    const parsedUrl  = url.parse(`${originalData.protocol}://${originalData.url}`,true);
    const hostName = parsedUrl.hostname;
    const path = parsedUrl.path;

    const requestDetails = {
        protocol : originalData.protocol + ':',
        hostname : hostName,
        method : originalData.method.toUpperCase(),
        path,
        timeout : originalData.timeoutSeconds * 1000
    };

    const protocolToUse = originalData.protocol === 'http' ? http : https;

    let req = protocolToUse.request(requestDetails, (res) => {
        const status = res.statusCode;

        checkOutCome.responseCode = status;

        if(!outcomeSent){
            worker.processCheckOutcome(originalData, checkOutCome);
            outcomeSent = true;
        }
    });

    req.on('error',(e) =>{
        checkOutCome = {
            'error': true,
            'value': e
        }
        if(!outcomeSent){
            worker.processCheckOutcome(originalData, checkOutCome);
            outcomeSent = true;
        }
    });

    req.on('timeout', (e) => {
        checkOutCome = {
            error : true,
            value: 'timeout'
        }
        if(!outcomeSent){
            worker.processCheckOutcome(originalData, checkOutCome);
            outcomeSent = true;
        }
    });

    req.end();
}

worker.processCheckOutcome = (originalData, checkOutCome) =>{
    let state = !checkOutCome.error && checkOutCome.responseCode && originalData.successCodes.indexOf(checkOutCome.responseCode) > -1 ? 'up' : 'down' ;

    const alertWanted = originalData.lastChecked && originalData.state !== state ? true : false;

    let newCheckData = originalData;

    newCheckData.state = state;
    newCheckData.lastChecked = Date.now();

    data.update('checks', newCheckData.id, newCheckData, (err)=>{
        if(!err){
            if(alertWanted){
                worker.alertUserToStatusChange(newCheckData);
            }else{
                console.log('Alert is not needed as there is no state change!');
            }
        }else{
            console.log('Error trying to save check data of one of the checks!');
        }
    })
}

worker.alertUserToStatusChange = (newCheckData) => {
    let msg = `Alert: Your check for ${newCheckData.method.toUpperCase()} ${newCheckData.protocol}://${newCheckData.url} is currently ${newCheckData.state}`;

    sendTwilioSms(newCheckData.userPhone, msg, (err) => {
        if(!err){
            console.log(`User was alerted to a status change via SMS: ${msg}`);
        }else{
            console.log('There was a problem sending sms to one of the user!');
        }
    });
}

worker.loop = () => {
    setInterval(()=>{
        worker.gatherAllChecks();
    }, 10000);
}

worker.init = ()=>{
  worker.gatherAllChecks();

  worker.loop();
}

module.exports = worker;