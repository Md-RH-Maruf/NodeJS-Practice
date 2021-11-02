const environments = {};

environments.staging = {
    port: 3000,
    envName: 'staging',
    secretkey: 'dsfkldskjsdfkjlfg',
    maxChecks: 5,
    twilio: {
        fromPhone: '+1500550006',
        accountSid: 'ACfe8c85276919cc76fb06059288eef547',
        authToken: '337c6b2a1c285362656609481ff0b676'
    }
};

environments.production = {
    port: 5000,
    envName: 'production',
    secretkey: 'slklsdlkfklsflkjsd',
    maxChecks: 5,
    twilio: {
        fromPhone: '+1500550006',
        accountSid: 'ACfe8c85276919cc76fb06059288eef547',
        authToken: '337c6b2a1c285362656609481ff0b676'
    }
}

const currentEnvironment = typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'staging';


const environmentToExport = typeof environments[currentEnvironment] === 'object' ? environments[currentEnvironment] : environments.staging;

module.exports = environmentToExport;