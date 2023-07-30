const EventEmitter = require('events')
const fs = require("fs");
const stream = require("stream");
const path = require("path");

const Event = Object.freeze({
    SIZE: "size",
    NEW_RECORD: "new_record",
    ERROR: "error"
});

const Mode = Object.freeze({
    CLOSED: "closed",
    APPEND: "append",
    READ: "read",
});

class FileDB extends EventEmitter {
    activePromise = Promise.resolve();
    currentMode = Mode.CLOSED;
    writer;
    reader;
    size = 0;

    constructor(dbPath) {
        super();

        this._path = dbPath;
        this._queue = [];
        this.activePromise = new Promise((res, rej) => {
            fs.stat(this._path, (err, stats) => {
                if (err != null) {
                    if (err.code !== 'ENOENT') {
                        //reject promise if the error is different than non-existant db file
                        rej(err);
                    } else {
                        //create directory if it's not present
                        fs.mkdir(path.resolve(this._path, ".."), { recursive: true }, (mkDirErr) => {
                            if (mkDirErr) {
                                rej(mkDirErr);
                            }
                        });
                    }
                } else {
                    this.size = stats.size;
                }
                this.reportSize();
                res();
            });
        });
    }

    // publics

    then() {
        this.activePromise = this.activePromise.then.apply(this.activePromise, arguments);
        return this;
    }

    catch() {
        this.activePromise = this.activePromise.catch.apply(this.activePromise, arguments);
        return this;
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
                const startPosition = this.size;
                const callRes = () => res({
                                        start: startPosition,
                                        end: this.size
                                    });
                this.createWriteStream("a", res, rej);
                if (data instanceof stream.Readable) {
                    data.pipe(this.writer, {end: false});
                    data.on("data", (d) => {
                        this.addSize(d.length);
                    });
                    data.on("end", callRes);
                    data.on("error", (e) => {
                        rej(e);
                    });
                } else {
                    this.writer.write(data, null, (r) => {
                        this.addSize(data.length);
                        callRes();
                    });
                }
            });
        }
        const req = this.createRequest(action);
        return this;
    }

    read(cb, options) {
        const grownOptions = {
            ...options,
            flags: "r"
        }
        const action = () => {
            return new Promise((res, rej) => {
                this.setMode(Mode.READ);
                this.createReadStream(grownOptions, res, rej, cb);
            });
        }
        const req = this.createRequest(action);
        return this;
    }

    close() {
        this.setMode(Mode.CLOSED);
    }

    get size() {
        return this.size;
    }

    //privates

    setMode(mode) {
        if (this.currentMode != mode || mode == Mode.READ) {
            this.currentMode = mode;
            console.log("change db mode to:", mode);
            this.writer && this.writer.close();
            this.reader && this.reader.destroy();
        }
    }

    createWriteStream(flags, res, rej) {
        if (!(this.writer instanceof stream.Writable) || this.writer.closed) {
            this.writer = fs.createWriteStream(this._path, {
                flags: flags
            });

            /* this.writer.on("end", (evt) => {
                // console.log("writer > end");
            });

            this.writer.on("close", (evt) => {
                // console.log("writer > close");
                // res(evt);
            }); */

            this.writer.on("error", err => {
                console.log("writer > error", err);
                rej(err)
            });
        }
    }

    createReadStream(options, res, rej, cb) {
        this.reader = fs.createReadStream(this._path, options);

        const readChunks = [];

        this.reader.on("data", (data) => {
            readChunks.push(data);
        });

        this.reader.on("end", (evt) => {
            // console.log("reader > end");
        });

        this.reader.on("close", (evt) => {
            // console.log("reader > close", readChunks.length);
            const joined = Buffer.concat(readChunks);
            cb && cb(joined);
            res(joined);
        });

        this.reader.on("error", err => {
            // console.log("reader > error");
            console.log(err);
            rej(err);
        });
    }

    addSize(amount) {
        this.size += amount;
        this.reportSize();
    }

    reportSize() {
        this.emit(Event.SIZE, this.size);
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
        action().then(res => this.res(res)).catch(e => this.rej(e));
        return this.promise;
    }
}

module.exports = {
    FileDB,
    Event,
    Mode
};