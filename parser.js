const fast_csv = require("fast-csv");
const request = require("request");
const mysql2 = require("mysql2");
const fs = require("fs");
const path = require('path');

const connection = mysql2.createPool({
    host: "127.0.0.1",
    user: "root",
    password: "120398",
    database: "imgbrd"
});


let stream = request('http://www.vpngate.net/api/iphone/');
let csvData = [];
let csvStream = fast_csv
    .parse()
    .on("data", function (data) {
        csvData.push(data);
    })
    .on("end", function () {
        csvData.shift();
        csvData.shift();
        csvData.pop();
    })

stream.pipe(csvStream)
    .on("end", function () {
        console.log('done');
    })

function DELETE() {
    connection.promise().query("DELETE FROM imgbrd.vpn_list WHERE country NOT LIKE 'User place';")
        .then(() => {
            console.log('Rows are deleted');
        })
}

function OK() {
    for (let i = 0; i < csvData.length; i++) {
        connection.query("INSERT INTO imgbrd.vpn_list (host, ip, country, oper, config_data) VALUES ( ?, ?, ?, ?, ?)",
            [csvData[i][0]+'.opengw.net', csvData[i][1], csvData[i][5], csvData[i][12], Buffer.from(csvData[i][14], 'base64').toString('ascii')], function (err, result) {
                if (err) throw err;
            });
    }
}

function EXIT() {
    process.exit(-1)
}


setTimeout(() => {
    DELETE();
    fs.readdir('static/config_files', (err, files) =>{
        if (err) throw err;
        for (const file of files) {
            fs.unlink(path.join('static/config_files', file), err => {
                if (err) throw err;
            })
        }
    })
}, 5000);


setTimeout(OK, 10000);
setTimeout(EXIT, 30000);
