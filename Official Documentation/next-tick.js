const myFunction = (firstParam,secondParam) =>{
    console.log("first",firstParam);
    console.log("scond",secondParam);
}

const id = setTimeout(myFunction,2000,53,34);

clearTimeout(id);