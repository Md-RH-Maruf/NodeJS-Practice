const { result } = require("lodash");

setTimeout(()=>{
  console.log(" set time out")
},0);
let myFirstPromise = new Promise((resolve, reject) => {
    // We call resolve(...) when what we were doing asynchronously was successful, and reject(...) when it failed.
    // In this example, we use setTimeout(...) to simulate async code.
    // In reality, you will probably be using something like XHR or an HTML5 API.
    setTimeout( function() {
      console.log("1st success");
      resolve({result:"Success!"})  // Yay! Everything went well!
    }, 0)
  })
  
  let secondPromise = new Promise((success,reject) => {
    try {
      let result = 20/4;
      success(result);
      console.log("2nd Success");
    } catch (error) {
      reject(error);
      console.log("2nd Error");
    }
  })

  myFirstPromise.then((successMessage) => {
     console.log("Yay! " + typeof(successMessage))
  }).catch(error=> console.log(error))
  .finally(()=>{
    console.log("This is final block ");
  });
  
  myFirstPromise.then(Other=>{
    console.log("2nd Then",Other);
  }).catch((error)=>{
    console.log("2nd error",error);
  }).finally(()=>{
    console.log("This 2nd final block ");
  });

  myFirstPromise.then(Other=>{
    console.log("3rd Then",Other);
  }).catch((error)=>{
    console.log("3rd error",error);
  }).finally(()=>{
    console.log("This 3rd final block ");
  });

  process.nextTick(()=>{
    console.log("Tick Function calling");
  })