const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('What\'s your name?',(name)=>{
    console.log("your name = ",name);
    
});

rl.on('line',(input)=>{
    console.log("received :", input);
});

rl.on('pause',()=>{
    console.log("Readline Paused");
});