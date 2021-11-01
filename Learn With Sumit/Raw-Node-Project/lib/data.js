const fs = require('fs');
const path = require('path');

const lib = {};

lib.basedir = path.join(__dirname,'/../.data/');

lib.create = (dir, file, data, callback) => {
    fs.open(`${lib.basedir + dir}/${file}.json`,'wx',(err, fileDescriptior)=>{
        if(!err && fileDescriptior){
            const stringData = JSON.stringify(data);

            fs.writeFile(fileDescriptior, stringData, (err2)=>{
                if(!err2){
                    fs.close(fileDescriptior,(err3) => {
                        if(!err3){
                            callback(false);
                        }else{
                            callback('Error closing the new file!');
                        }
                    });
                } else {
                    callback("Error writing to new file!");
                }
            });
        }else{
            callback('There was an error, file may already exists!');
        }
    });
}

lib.read = (dir, file, callback) => {
    fs.readFile(`${lib.basedir + dir}/${file}.json`,'utf-8', (err, data)=>{
        callback(err,data);
    });
};

lib.update = (dir, file, data, callback) =>{
    fs.open(`${lib.basedir + dir}/${file}.json`,'r+',(err, fileDescriptior)=>{
        if(!err && fileDescriptior){
            const stringData = JSON.stringify(data);

            fs.ftruncate(fileDescriptior,(err1) => {
                if(!err1){
                    fs.writeFile(fileDescriptior,stringData,(err2) =>{
                        if(!err2){
                            fs.close(fileDescriptior,(err3) => {
                                if(!err3){
                                    callback(false);
                                }else{
                                    callback("Error closing file!");
                                }
                            });
                        }else{
                            callback("Error writing to file!");
                        }
                    })
                }else{
                    callback('Error truncating file!');
                }
            })
        }else{
            callback('Error updating. File may not exist');
        }
    });
}

lib.delete = (dir, file, callback) => {
    fs.unlink(`${lib.basedir + dir}/${file}.json`,(err) => {
        if(!err){
            callback(false);
        }else{
            callback('Error deleting file');
        }
    })
}

module.exports = lib;