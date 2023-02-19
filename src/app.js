const {FileDB} = require("./FileDB");

const fs = require("fs");
const fsPromises = require("fs/promises");
const path = require("path");
const srcPath = "../data/";
const outPath = "../data/output/";

// const delimiter = Buffer.from(["7F", "7F", "7F", "7F"]);
const delimiter = Buffer.from([127, 127, 127, 127]);
const delimiterLength = delimiter.length;

// const img = fs.readFileSync(path.resolve(__dirname, srcPath, "DuranRio.jpg"));
const img0 = fs.readFileSync(path.resolve(__dirname, srcPath, "iGnP0ksc.data"));
const img1 = fs.readFileSync(path.resolve(__dirname, srcPath, "DuranRio.jpg"));
const img2 = fs.readFileSync(path.resolve(__dirname, srcPath, "1byte.data"));
// console.log("img.length:", img.length, "delimiterLength:", delimiterLength);

const fileDBPath = path.resolve(__dirname, outPath, "out1.jpg");
const fileDB = new FileDB(fileDBPath);
fileDB.append(img0).append(img2);
// fileDB.read().then(res => console.log("read.then from app, res.length:", res.length));
fileDB.read(res => console.log("read cb from app, res.length:", res.length)).append(img0);
// fileDB.read().then(res => console.log("read.then from app", res));
fileDB.append(img1);





/* const index = getDataFileIndex(
    path.resolve(__dirname, outPath, "out.jpg"),
    delimiter
)
console.log("index:", index);
index.then((res) => {
    console.log("-------------------> res:", res);
});

pushData(
    path.resolve(__dirname, outPath, "out.jpg"),
    [img2]
); */

// setTimeout(() => {console.log("eof")}, 1000);
