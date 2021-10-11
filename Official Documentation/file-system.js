const fs = require('fs')

try {
    fs.renameSync('after.json', 'before.json')
    //done
  } catch (err) {
    console.error(err)
  }