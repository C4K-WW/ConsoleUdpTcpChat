const express = require('express');
const app = express();
const fs = require('fs');
const session = require('express-session');
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}))

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(__dirname + '/public'))

app.get('/', (req, res) => {
    res.render('index');

});

let getMessage = {};
app.post('/get', (req, res) => {
    getMessage.user = JSON.parse(req.body.sendNick);
    getMessage.message = JSON.parse(req.body.sendMessage);
    getMessage.id = req.session.id
    console.log('Incoming:')
    console.log(getMessage);
})
let id;
app.get('/get', (req, res) => {
    console.log(id);
    console.log(getMessage.id);
    if (getMessage.id !== id) {
        res.json(getMessage);
        console.log('OutGoing:')
        console.log(getMessage);
    }

    id = getMessage.id;
})


app.listen(4000);