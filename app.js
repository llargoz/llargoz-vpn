const http = require('http');
const fs = require('fs');
const path = require('path');
const mysql2 = require('mysql2');
const dig = require('node-dig-dns');
const dns = require('dns');
const htmlspecialchars = require('htmlspecialchars');

let user_ip = '';

const connection = mysql2.createConnection({
    host: "127.0.0.1",
    user: "root",
    database: "imgbrd",
    password: "120398"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

const httpServer = http.createServer((req, res) => {
    console.log('req: '+req.url);
}).listen(8000, () => {
    console.log('server is in 8000');
});

httpServer.on('request', (req, res) => {
    if (req.method === "POST") {
        let body = "";
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            let params
            try {
                params = JSON.parse(body)
            } catch (err) {
                console.log('ERROR');
            }
            if (params !== undefined) {
                if (params.type === 0) {
                    connection.promise().query("SELECT COUNT(*) AS num FROM imgbrd.vpn_list")
                        .then(result1 => {
                            if (result1[0][0].num === 0)  {
                                res.end(JSON.stringify("Таблица пустая"));
                            }
                            else {
                                const queue = "SELECT * FROM imgbrd.vpn_list";
                                connection.query(queue, '', function (err, results) {
                                    if (err) console.log(err);
                                    else {
                                        let newest = {
                                            "host": [],
                                            "ip": [],
                                            "country": [],
                                            "oper": []
                                        }
                                        for (let i = 0; i < result1[0][0].num; i++) {
                                            newest.host.push(results[i].host);
                                            newest.ip.push(results[i].ip);
                                            newest.country.push(results[i].country);
                                            newest.oper.push(results[i].oper);
					    if (results[i].country !== 'User place'){
                                            	fs.writeFile('static/config_files/' + results[i].host + '.ovpn',
                                                results[i].config_data, err1 => {
                                                    if (err1) console.log(err1)
                                                })
					}
                                        }
                                        res.end(JSON.stringify(newest));
                                    }
                                })
                            }
                        })
                        .catch(err => {
                            console.log("ERROR");
                            res.end(JSON.stringify("Таблица не существует"));
                        })
                }
                if (params.type === 1) {
			console.log(params.host);
			console.log('q');
			dns.lookup(params.host, function onLookup(err, address, family) {
				console.log('addresses: ', address);
				if (address !== undefined) {
					res.end(JSON.stringify("true"));
					user_ip = address;
				}
				else {
					res.end(JSON.stringify("false"));
				}
			})
                }
		if (params.type === 2) {
			connection.promise().query("INSERT INTO imgbrd.vpn_list VALUES ( ?, ?, ?, ?, ? )",
				[params.host, user_ip, 'User place', htmlspecialchars(params.oper), 'no'])
				.then(result2 => {
					res.end(JSON.stringify(result2[0].insertId));
					console.log("added!");
				})
				.catch(err => {
					 res.end(JSON.stringify("Unpredictable error with DB"));
					console.log(err);
				});
            }
        }
    })
    }
    else if (req.url === '/') {
        sendRes('main.html', 'text/html', res);
    }
    else if (req.url === '/add') {
        sendRes('add.html', 'text/html', res);
    }
    else if (req.url === '/table') {
        sendRes('index.html', 'text/html', res);
    }
    else {
        sendRes(req.url, getContentType(req.url), res);
    }
});

function sendRes(url, contentType, res) {
    let file = path.join(__dirname+'/static/', url);
    fs.readFile(file, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.write('File is not found');
            res.end();
            console.log('error 404 '+file);
        }
        else {
            res.writeHead(200, {'Content-Type': contentType});
            res.write(content);
            res.end();
            console.log('res 200 '+file);
        }
    })
}

function getContentType(url) {
    switch (path.extname(url)) {
        case ".html":
            return "text/html";
        case ".css":
            return "text/css";
        case ".js":
            return "text/javascript";
        case ".json":
            return "text/json";
        default:
            return "text/octet-stream";
    }
}
