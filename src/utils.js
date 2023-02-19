module.exports.translateToByteArray = (value, byteCount) => {
    const res = [];
    let binStr = (value).toString(2).padStart(byteCount * 8, "0");
    for (let i = 0; i < byteCount; i++) {
        const byteStr = binStr.substr(i * 8, 8);
        res.push(parseInt(byteStr, 2));
    }
    return res;
}