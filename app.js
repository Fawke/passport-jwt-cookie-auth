const express = require('express');
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const path = require('path');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const app = express();

const PORT = 3000 || provess.env.PORT;

mongoose.connect('mongodb://localhost:27017/myapp');

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const User = require('./models/user');
const userProfile = require('./routes/user-profile');

const cookieExtractor = (req) => {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies['token']
    }
    return token;
};

const options = {
    jwtFromRequest: cookieExtractor,
    secretOrKey: 'secret'
}

app.use(passport.initialize());

passport.use(new JwtStrategy(options, (jwtPayload, done) => {
    User.findOne({ username: jwtPayload.user.username }, (err, user) => {
        if (err) {
            return done(err, false);
        }
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    });
}));

app.get('/login.html', (req, res) => {
    res.set('Content-Type', 'text/html');
    res.status(200).sendFile(path.join(__dirname, './public/login.html'));
});

app.get('/register.html', (req, res) => {
    res.set('Content-Type', 'text/html');
    res.status(200).sendFile(path.join(__dirname, './public/register.html'));
});

app.post('/auth/register', (req, res) => {
    const user = req.body;
    User.create(user, (err, user) => {
        if (err) throw err;
        res.send('Registered successfully!')
    });
});

app.post('/auth/login', (req, res) => {
    const { username, password } = req.body;
    User.findOne({ username }, (err, user) => {
        if (err) throw err;
        if (!user) {
            res.send('username or password incorrect!');
        } else {
            if (user.password === password) {
                const token = jwt.sign({user}, options.secretOrKey);
                res.cookie('token', token);
                res.send('logged in successfully!');
            } else {
                res.send('username or password incorrect!');
            }
        }
    });

});

app.use('/profile', passport.authenticate('jwt', { session: false }), userProfile);

app.listen(PORT, () => {
    console.log(`app listening of port: ${PORT}`);
});
