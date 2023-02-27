const LocalStrategy = require('passport-local').Strategy;
const { pool } = require('./dbConfig');




function login(passport) {

    const checkUser = (name, password, done) => {
        pool.query(`select * from chat where name = $1`, [name],
            (err, result) => {
                if (err) {
                    throw err;
                }
                if (result.rows.length > 0) {
                    const user = result.rows[0];
                    if (password === user.password) {
                        return done(null, user);
                    } else {
                        console.log('Password doesn`t match')
                        return done(null, false);
                    }
                } else {
                    console.log('This username doesn`t exist')
                    return done(null, false);
                }
            })
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
        pool.query(`select * from chat where id = $1`, [id],
            (err, result) => {
                if (err) {
                    throw err;
                }
                return done(null, result.rows[0])
            });
    });
};


module.exports = login;