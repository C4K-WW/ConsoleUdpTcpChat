const LocalStrategy = require('passport-local').Strategy;
const result = {
    id: '2',
    name: 'nick',
    email: 'nick@gmail.com',
    password: '123456'
};

let user;

function initialize(passport) {

    const autheticateUser = (email, password, done) => {
        if (result.email === email) {
            console.log('Email Match!');
            console.log('Asign result Object to user Object');
            user = result;
            if (password == result.password) {
                console.log('Password Match')
                return done(null, user);
            } else {
                console.log('Password doesn`t match')
                return done(null, false);
            }
        } else {
            console.log('Username Doesn`t match')
            return done(null, false)
        }
    };

    passport.use(
        new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password'
        }, autheticateUser)
    );

    passport.serializeUser((user, done) => {
        console.log('Serialize:');
        console.log(user.id);

        done(null, user.id)
    })

    passport.deserializeUser((id, done) => {
        console.log('Deserialize:');
        console.log(id);
        if (id === result.id) {
            console.log('I found object with id ');
            console.log(id);
            return done(null, result)
        }
    });
}

module.exports = initialize;
