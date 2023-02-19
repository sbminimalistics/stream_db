const {FileDB, Event} = require("./src/index");

const fs = require("fs");
const path = require("path");
const srcPath = "./test_data/";
const outPath = "./test_data/output/";

const delimiter = Buffer.from([127, 127, 127, 127]);
const delimiterLength = delimiter.length;

// synchronously read test data files
const img0 = fs.readFileSync(path.resolve(__dirname, srcPath, "10KB.data"));
const img2 = fs.readFileSync(path.resolve(__dirname, srcPath, "1byte.data"));

// define output data file path (will be created if does not exist)
const fileDBPath = path.resolve(__dirname, outPath, "out.data");

// create file db instance and add event listeners
const fileDB = new FileDB(fileDBPath);
fileDB.on(Event.SIZE, (size) => {
    console.log("current db file size:", size, "bytes");
})

// run multiple chainable appends and reads
fileDB.append(img0).append(img2);
fileDB.read(res => console.log("read cb from app, res.length:", res.length)).append(img0);

// thenable way of .read() usage
// fileDB.read().then(res => console.log("read.then from app, res.length:", res.length));

fileDB.append(img2);
