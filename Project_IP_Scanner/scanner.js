let { writeFile, readFile } = require('fs').promises;
let portscanner = require('portscanner');
let cluster = require('cluster');
const numCPUs = require('os').cpus().length;


//********* Write IP list on a file IP.txt *********//

let ipFile = async() => {
    try {
        await writeFile('./content/IP.txt', `${ip}`)
    } catch (err) {
        console.log(err);
        return
    }


}

//-------------- END writing IP.txt ---------------//



//**********************IP:PORT Check Version 0.3**********************//
Version: 0.3

let thread = 10;

async function search3() {
    try {
        if (cluster.isMaster) {
            for (let i = 0; i < thread; i++) {
                cluster.fork();
            }

        } else {

            const read = await readFile('./content/IP.txt', 'utf8');
            const arr = await read.split('\n');
            const one = arr.filter((_, index) => index % thread === cluster.worker.id - 1);
            one.pop();

            for (x of one) {
                let ip = x.split(':');
                let resp = await portscanner.checkPortStatus(`${ip[1]}`, `${ip[0]}`); // ip[0] - ip and ip[1] is the port //
                if (resp !== 'closed') {
                    console.log(`IP:${ip[0]} on port:${ip[1]} ${resp}`)
                    writeFile('./content/results.txt', `${ip}\n`, { flag: 'a' });
                } else {
                    console.log(`IP:${ip[0]} on port:${ip[1]} ${resp}`)
                }
            }
        }



    } catch (err) {
        console.log(err);
        return
    }
}
//---------------------- END IP:PORT Check Version -------------------//


//*************** IP:PORT Generator / CLASS A.B.x.x ***************//
let ip = '';
let pGen = [];
let cd = [];

function portGen(port, _port = port) {
    for (port; port <= _port; port++) {
        pGen.push(port.toString());
    }
}


function rangeCD(d, _d, c, _c) {
    let i = d;

    for (d; d <= _d; d++) {
        cd.push(`${c.toString()+"."+d.toString()}`)
        if (d === _d) {
            c++;
            d = i;
            cd.push(`${c.toString()+"."+d.toString()}`)
            if (c === (_c + 1)) {
                return
            }

        }
    }
}



function scan(from, to, port, _port) {

    if (typeof(from) !== 'string' && typeof(to) !== 'string' && port !== 'number') {
        console.log(`HINT: scan('fromIP','toIP',port) or scan('fromIP','toIP',fromPort,toPort)`)
        console.log(`Example: scan('192.168.0.1','192.168.0.5',22) or scan('192.168.0.1','192.168.0.5',22,23)`)
        return
    }

    let digitFrom = from.match(/\d+/g);
    let digitTo = to.match(/\d+/g);
    rangeCD(parseInt(digitFrom[3]), parseInt(digitTo[3]), parseInt(digitFrom[2]), parseInt(digitTo[2]));
    portGen(port, _port);
    let i;
    let y = 0;
    for (i = 0; i < cd.length - 1; ++i) {
        ip += digitFrom[0].toString() + "." + digitFrom[1].toString() + "." + cd[i] + ":" + pGen[y] + `\n`;
        if (i === cd.length - 1) {
            if (y < pGen.length - 1) {
                i = 0;
                y++;
                ip += digitFrom[0].toString() + "." + digitFrom[1].toString() + "." + cd[i] + ":" + pGen[y] + `\n`;
            }

        }
    }
    ipFile();
    search3();
}

function nmap(singleIP, port, _port) {

    if (typeof(singleIP) !== 'string' && typeof(port) !== 'number' && typeof(_port) !== 'number') {
        console.log(`HINT: port('IP',fromPort,toPort)`)
        console.log(`Example: port('192.168.0.1',22,23)`)
        return
    }

    portGen(port, _port);
    let i;
    for (i = 0; i < pGen.length; ++i) {
        ip += singleIP + ":" + pGen[i] + `\n`;

    }
    ipFile();
    search3();

}

//------------------------ End of IP:PORT Generator -----------------------//

scan('192.168.0.1', '192.168.255.255', 8080);
// nmap('192.168.1.2', 1, 5432);