const express = require('express');
const app = express();
const session = require('express-session');
const login = require('./login');
const passport = require('passport');
let result = require('./users');
const userlist = require('./views/routes/userlist');
const logOut = require('./views/routes/logout');
const flash = require('express-flash');
const fs = require('fs');
const { writeFile, readFile } = require('fs').promises;
const { pool } = require('pg');

login(passport);
app.use(flash());
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());


app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(__dirname + '/public'));


app.get('/', isLogged, (req, res) => {
    if (typeof(req.user) === "object") {
        res.render('index', { nickname: req.user.name });
    } else if ((typeof(req.user) === "undefined")) {
        res.render('index', { nickname: 'You are not logged in' });
    }
});


let buff = new Set(); // Array of all username connected to the network.

userlist(app, buff, result); // Send UsernameList to client side.
logOut(app, buff); // Log out from the chat.

setInterval(() => {
    buff.clear();
}, 60000);

app.post('/suc',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/err'
    })
);

app.get('/err', (req, res) => {
    res.render('err', {
        nickname: req.user.name
    });
});

function isLogged(req, res, next) {
    if (req.isAuthenticated()) {
        return res.render('index', { nickname: req.user.name });
    }
    next();
};

// -- From this line to the end I need to put in a separate file.

app.param('id', (req, res, next, id) => {
    if (!req.user.id) {
        id = 0;
    } else if (req.user.id) {
        id = req.user.id;
    }

    next();
});

app.param('name', (req, res, next, name) => {
    name = req.user.name;
    next();
});


let getID;
app.post('/ChooseUser/:id/:name', (req, res) => {

    let p2pIDselect = req.body.p2pIDselect
    leftRem = p2pIDselect.replace('"', '');
    getID = leftRem.replace('"', '');
    res.end();
});

let p2pMSG;
let id;

app.route('/user/:id')
    .get(async(req, res, next) => {
        try {
            if (req.user.id) {

                let file;
                try {
                    if (getID !== "") {
                        file = await readFile(`./public/p2pChat/${req.user.name}/${getID}.txt`, { encoding: 'utf-8' });
                    } else if (getID === "") {
                        file = await readFile(`./public/GroupChat/code4000.txt`, { encoding: 'utf-8' });
                    }
                } catch (error) {
                    file = await readFile(`./public/GroupChat/code4000.txt`, { encoding: 'utf-8' });
                }

                res.send({ dbp2p: file });
                res.end();
            };
        } catch (err) {
            throw err;
        };
        res.end();

    })
    .post((req, res) => {
        p2pMSG = req.body.p2pMSG;
        let p2pID = req.body.p2pID;
        leftRem = p2pID.replace('"', '');
        id = leftRem.replace('"', '');

        // This folder creation code should be moved in register function.

        let dir = `./public/p2pChat/${req.user.name}`
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir)
        };
        WriteMsg(id, req);
        res.end();

    });


async function WriteMsg(id, req) {
    let time = new Date();
    try {
        if (id === "code4000") {
            await writeFile(`./public/GroupChat/code4000.txt`, `[${time.toLocaleTimeString()}]${req.user.name}:${p2pMSG}\n`, { flag: 'a' });
        } else if (id === "") {
            await writeFile(`./public/GroupChat/code4000.txt`, `[${time.toLocaleTimeString()}]${req.user.name}:${p2pMSG}\n`, { flag: 'a' });
        } else if (id !== "code4000" || id !== "") {
            await writeFile(`./public/p2pChat/${id}/${req.user.name}.txt`, `[${time.toLocaleTimeString()}]${req.user.name}:${p2pMSG}\n`, { flag: 'a' });
            await writeFile(`./public/p2pChat/${req.user.name}/${id}.txt`, `[${time.toLocaleTimeString()}]${req.user.name}:${p2pMSG}\n`, { flag: 'a' });
        }

    } catch (err) {

    }
};


// Author of this code: Diaconu Sandu, Moldova.
app.listen(4000);