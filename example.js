const {FileDB, Event} = require("./src/index");


const fs = require("fs");
const http = require("http");
const stream = require("stream");
const path = require("path");
const srcPath = "./test_data/";
const outPath = "./test_data/output/";

const delimiter = Buffer.from([127, 127, 127, 127]);
const delimiterLength = delimiter.length;

// synchronously read test data files
const data0 = fs.readFileSync(path.resolve(__dirname, srcPath, "10KB.data"));
const data1 = fs.readFileSync(path.resolve(__dirname, srcPath, "1B.data"));

// define output data file path (will be created if does not exist)
const fileDBPath = path.resolve(__dirname, outPath, "out.data");

// create file db instance and add event listeners
const fileDB = new FileDB(fileDBPath);
/* fileDB.on(Event.SIZE, (size) => {
    console.log("current db file size:", size, "bytes");
}) */

// run multiple chainable appends and reads
/* fileDB.append(data0).append(data1);
fileDB.read(res => console.log("read cb from app, res.length:", res.length)).append(data0); */

// thenable way of .read() usage
// fileDB.read().then(res => console.log("read.then from app, res.length:", res.length));

fileDB
.append(data1)
.then(res => {
    console.log("1st append res:", res);
})
.read((data) => {
    console.log("read cb data:", data);
}, {start: 0, end: 3}) // just the first three bytes;
.append(data0)
.then(res => {
    console.log("2nd append res:", res);
    fileDB.close();
    delete fileDB;
}).catch(err => {
    console.log("catch err:", err);
});


/* fileDB.on(Event.SIZE, (size) => {
    console.log("current db file size:", size, "bytes");
    if (size > 100000) {
        console.log("file size reashed 100k bytes");
        clearInterval(appendIID);
        fileDB.then(res => {
            fileDB.close();
            delete fileDB;
        });
    }
}); */
