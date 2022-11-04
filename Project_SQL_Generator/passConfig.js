const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const { pool } = require('./dbConfig');


function initialize(passport) {
    const autheticateUser = (email, password, done) => {
        pool.query(`select * from list where email = $1`, [email],
            (err, result) => {
                if (err) {
                    throw err;
                }
                if (result.rows.length > 0) {
                    const user = result.rows[0];
                    bcrypt.compare(password, user.password, (err, Match) => {
                        if (err) {
                            throw err;
                        }
                        if (Match) {

                            const time = new Date();
                            const lastVisit = time.toGMTString();
                            pool.query(`update list set lastvisit = $1 where id =$2 `, [lastVisit, user.id],
                                (err, result) => {
                                    if (err) {
                                        throw err;
                                    }
                                })

                            console.log('Password Match');
                            return done(null, user);

                        } else {
                            console.log('Password doesn`t match');
                            return done(null, false, { message: 'Password doesn`t Match!!!' });

                        }
                    })
                } else {
                    return done(null, false, { message: 'This username doesn`t exist' })
                }

            })
    }

    passport.use(
        new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password'
        }, autheticateUser)
    );

    passport.serializeUser((user, done) => done(null, user.id))

    passport.deserializeUser((id, done) => {
        pool.query(`select * from list where id = $1`, [id],
            (err, result) => {
                if (err) {
                    throw err;
                }
                return done(null, result.rows[0])
            });
    });
}

module.exports = initialize;