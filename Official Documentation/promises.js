const first = new Promise((resolve, reject) => {
    setTimeout(resolve, 500, 'first')
  })
  const second = new Promise((resolve, reject) => {
    setTimeout(resolve, 1000, 'second')
  })
  
  Promise.race([first,second]).then((result1,result2) => {
    console.log(result1,result2) // second
  })
  