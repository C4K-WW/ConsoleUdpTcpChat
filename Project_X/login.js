const LocalStrategy = require('passport-local').Strategy;
let result = require('./users');
let user;



function login(passport, app) {

    const checkUser = (name, password, done) => {
        for (let i = 0; i < result.length; i++) {
            if (name === result[i].name) {
                user = result[i];
                if (password === user.password) {
                    console.log(user);
                    return done(null, user);
                }
            }
        }
    };

    passport.use(
        new LocalStrategy({
            usernameField: 'name',
            passwordField: 'password'
        }, checkUser)
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        for (let i = 0; i < result.length; i++) {
            if (id === result[i].id) {
                done(null, result[i]);
            }
        }
    });
};


module.exports = login;