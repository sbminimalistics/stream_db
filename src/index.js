const EventEmitter = require('events')
const fs = require("fs");
const stream = require("stream");

const Events = Object.freeze({
    SIZE: "size",
    NEW_RECORD: "new_record",
});

const Mode = Object.freeze({
    CLOSED: "closes",
    APPEND: "append",
    READ: "read",
});

class FileDB extends EventEmitter{
    activePromise = Promise.resolve();
    currentMode = Mode.CLOSED;
    writer;
    reader;

    constructor(path) {
        super();
        console.log("FileDB.constructor");
        this._path = path;
        this._queue = [];
    }

    then() {
        return this.activePromise.then.apply(this.activePromise, arguments);
    }

    catch() {
        return this.activePromise.catch.apply(this.activePromise, arguments)
    }

    createRequest(action) {
        const req = new Request();
        this.activePromise = this.activePromise.then(res => {
            return req.execute(action);
        });
    }

    append(data) {
        const action = () => {
            return new Promise((res, rej) => {
                this.setMode(Mode.APPEND);
                this.createWriteStream("a");
                this.writer.write(data, null, (r) => {
                    res();
                });
            });
        }
        const req = this.createRequest(action);
        return this;
    }

    read(cb) {
        const action = () => {
            return new Promise((res, rej) => {
                this.setMode(Mode.READ);
                this.createReadStream("r", res, rej, cb);
            });
        }
        const req = this.createRequest(action);
        return this;
    }

    setMode(mode) {
        if (this.currentMode != mode || mode == Mode.READ) {
            this.currentMode = mode;
            console.log("change db mode...");
            this.writer && this.writer.close();
            this.reader && this.reader.destroy();
        }
    }

    createWriteStream(flags) {
        if (!(this.writer instanceof stream.Writable) || this.writer.closed) {
            this.writer = fs.createWriteStream(this._path, {
                flags: flags
            });

            this.writer.on("end", (evt) => {
                console.log("writer > end");
            });

            this.writer.on("close", (evt) => {
                console.log("writer > close");
                // res(evt);
            });

            this.writer.on("error", err => {
                console.log("writer > error", err);
                // rej(err)
            });
        }
    }

    createReadStream(flags, res, rej, cb) {
        this.reader = fs.createReadStream(this._path, {
            flags: flags
        });

        const readChunks = [];

        this.reader.on("data", (data) => {
            readChunks.push(data);
            console.log("reader > data", data.length);
        });

        this.reader.on("end", (evt) => {
            console.log("reader > end");
        });

        this.reader.on("close", (evt) => {
            console.log("reader > close", readChunks.length);
            cb && cb(readChunks);
            res(readChunks);
        });

        this.reader.on("error", err => {
            console.log("reader > error");
            console.log(err);
            rej(err);
        });
    }
}

class Request {
    constructor(cmd) {
        this.cmd = cmd;
        this.promise = new Promise((res, rej) => {
            this.res = res;
            this.rej = rej;
        });
    }

    get resolve() {
        return this.res;
    }

    get reject() {
        return this.rej;
    }

    execute(action) {
        action().then(res => this.res(res));
        return this.promise;
    }
}

module.exports = {
    FileDB,
    Events,
    Mode
};