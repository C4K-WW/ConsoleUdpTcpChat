const express = require('express');
const flash = require('express-flash');
const session = require('express-session');
const app = express();
const bcrypt = require('bcrypt');
const initialize = require('./passConfig');
const { pool } = require('./dbConfig');
const passport = require('passport');
const { writeFile, readFile } = require('fs').promises;
const fs = require('fs');
const multer = require('multer');
const path = require('path');

const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public');
    },
    filename: (req, file, cb) => {
        console.log(file);
        cb(null, `image-${Date.now()}` + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: multerStorage
});


initialize(passport);

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true
    }
}));


app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));

app.use(flash());


app.get('/', isLogged, (req, res) => {
    res.render('index');

});

app.post('/', (req, res) => {

    let logout = JSON.parse(req.body.logout);
    if (logout) {
        req.logOut();
        req.flash('msg', 'You have logged out!!!')
        res.redirect('/index');
    }

})



app.get('/dashboard', isNotLegged, (req, res) => {
    pool.query(`select icon from list where id = $1`, [req.user.id],
        (err, result) => {
            if (err) {
                throw err;
            }
            res.render('dashboard', {
                name: req.user.name,
                email: req.user.email,
                regdate: req.user.regdate,
                lastvisit: req.user.lastvisit,
                totaldownload: req.user.totaldownload,
                icon: result.rows[0].icon
            })
        }
    )

});

app.get('/register', isLogged, (req, res) => {
    res.render('register', { topic: 'Welcome to Register Page' });
});

app.get('/changepwd', isNotLegged, (req, res) => {

    pool.query(`select icon from list where id = $1`, [req.user.id],
        (err, result) => {
            if (err) {
                throw err;
            }
            res.render('changepwd', {
                name: req.user.name,
                email: req.user.email,
                regdate: req.user.regdate,
                lastvisit: req.user.lastvisit,
                totaldownload: req.user.totaldownload,
                icon: result.rows[0].icon
            })
        }
    )

})

app.post('/changepwd', upload.single('image'), async(req, res) => {
    let { email, password, password2 } = req.body
    console.log({
        email,
        password,
        password2
    });

    console.log(req.file.filename);
    let hashPassword = await bcrypt.hash(password, 10);
    pool.query(`update list set password=$1 where id=$2`, [hashPassword, req.user.id],
        (err, result) => {
            if (err) {
                throw err;
            }
        });
    pool.query(`update list set email=$1 where id=$2`, [email, req.user.id],
        (err, result) => {
            if (err) {
                throw err;
            }
        });
    pool.query(`update list set icon=$1 where id=$2`, [req.file.filename, req.user.id],
        (err, result) => {
            if (err) {
                throw err;
            }
        });
    req.flash('topic', 'Your profile details has been succesffuly updated.')
    res.render('changepwd', {
        name: req.user.name,
        email: req.user.email,
        regdate: req.user.regdate,
        lastvisit: req.user.lastvisit,
        totaldownload: req.user.totaldownload,
        icon: req.file.filename
    });


})

app.post('/register', upload.single('image'), async(req, res) => {

    const time = new Date();
    const regDate = time.toGMTString()

    let { name, email, password, password2 } = req.body;
    let hashPassword = await bcrypt.hash(password, 10);
    console.log(req.file.filename);
    if (password !== password2) {
        req.flash('topic', 'Password doesn`t Match!!!')
        res.render('register');
    }
    if (password2 < 6 || password < 6) {
        req.flash('topic', 'Password should be longer then 6 characters!!!');
        res.render('register');
    } else {
        pool.query(
            `select * from list where email = $1`, [email],
            (err, result) => {
                if (err) {
                    throw err;
                }
                if (result.rows.length > 0) {
                    req.flash('topic', `Username ${name} already exist!!!`)
                    res.render('register')
                } else {
                    pool.query(
                        `insert into list (name,email,password,regdate,icon) values ($1,$2,$3,$4,$5) returning id,name,regDate`, [name, email, hashPassword, regDate, req.file.filename],
                        (err, result) => {
                            if (err) {
                                throw err;
                            }
                            req.flash('topic', `Username ${name} has been successfuly registerd!!!`)
                            res.redirect('/dashboard');
                        }
                    )
                }
            }
        )
    }
})


app.post('/index',
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/',
        failureflash: true
    })
)


app.get('/download1', (req, res) => {

    res.download(`./public/${req.user.id}/SQL.sql`, (err) => {
        if (err) {
            req.flash('test', 'This file doesn`t exists');
            res.redirect('/dashboard');
        }
    });


    pool.query(`select * from list where id = $1`, [req.user.id], (err, result) => {
        if (err) {
            throw err;
        }
        let totalD = parseInt(result.rows[0].totaldownload) + 1;
        pool.query(`update list set totaldownload = $1 where id = $2`, [totalD, req.user.id],
            (err, result) => {
                if (err) {
                    throw err;
                }
            }
        )
    })
})


app.get('/test', async(req, res) => {
    let dir = `./public/${req.user.id}`;
    let file = await readFile(`${dir}/SQL.sql`, { encoding: 'utf8' });
    res.json({ test: file });
})


app.post('/closeWindow', (req, res) => {
    let dir = `./public/${req.user.id}`;
    fs.unlink(`${dir}/SQL.sql`, (err) => {
        if (err) {
            throw err;
        }
    })
})

app.post('/dashboard', (req, res) => {

    let dir = `./public/${req.user.id}`
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir)
    }

    let table_data = new Array();
    table_data = JSON.parse(req.body.table_data);
    table_name = JSON.parse(req.body.table_name);
    table_rows = JSON.parse(req.body.table_rows);
    table_format = JSON.parse(req.body.table_format);
    data = JSON.parse(req.body.data);
    create_table = JSON.parse(req.body.create_table);

    let sqlFile = async() => {
        try {
            if (create_table) {

                await writeFile(`${dir}/SQL.${table_format}`, `CREATE TABLE ${table_name} (\nid BIGSERIAL PRIMARY KEY NOT NULL\n`, { flag: 'a' });
                for (let i = 0; i < table_data.length; i++) {
                    await writeFile(`${dir}/SQL.${table_format}`, `,${table_data[i]} VARCHAR(200) NOT NULL\n`, { flag: 'a' });
                }
                await writeFile(`${dir}/SQL.${table_format}`, `);\n`, { flag: 'a' });

                for (let i = 0; i < table_rows; i++) {
                    await writeFile(`${dir}/SQL.${table_format}`, `INSERT INTO ${table_name} (${table_data}) VALUES ('${data[i]}');\n`, { flag: 'a' });
                }

            } else {
                for (let i = 0; i < table_rows; i++) {
                    await writeFile(`${dir}/SQL.${table_format}`, `INSERT INTO ${table_name} (${table_data}) VALUES ('${data[i]}');\n`, { flag: 'a' });
                }

            };
        } catch (err) {
            throw err;
        }
    }

    sqlFile();

})

function isLogged(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/dashboard')
    }
    next();

}

function isNotLegged(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect('/');
}


app.listen(4000);