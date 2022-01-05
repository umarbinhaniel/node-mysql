const mysql = require("mysql");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const async = require("hbs/lib/async");


const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

exports.register = (req, res) => {
    console.log(req.body);

    // const name = req.body.name;
    // const email = req.body.email;
    // const password = req.body.password;
    // const passwordConfirm = req.body.passwordConfirm;
    // use destructuring like below
    const { name, email, password, passwordConfirm } = req.body;

    db.query('SELECT email FROM users WHERE email = ?', [email], async(error, results) => {
        if (error) {
            console.log(error);
        }
        if (results.length > 0) {
            return res.render('register', {
                message: 'Oops! It seems you already have an account with us'
            });
        } else if (password !== passwordConfirm) {
            return res.render('register', {
                message: 'Passwords do not match'
            });
        }

        // getting hash of password using 8 rounds of bcrypt
        let hashedPassword = await bcrypt.hash(password, 8);
        console.log(hashedPassword);

        db.query('INSERT INTO users SET ? ', { name: name, email: email, password: hashedPassword }, (error, results) => {
            if (error) {
                console.log(error);
            } else {
                return res.render('register', {
                    message: 'User registered Succesfully'
                });
            }
        });
    });
}


//login

exports.login = async(req, res) => {
    console.log(req.body);
    try {

        // const email = req.body.email;
        // const password = req.body.password;
        // use destructuring like below
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).render('login', { message: 'Please enter email and password' });
        }
        db.query('SELECT email, password FROM users WHERE email = ?', [email], async(error, results) => {
            if (error) {
                console.log(error);
            }
            console.log(results);
            if (results.length > 0) {
                console.log(results[0].password);
                if (await bcrypt.compare(password, results[0].password)) {
                    console.log('Login OHK');
                    return res.render('index');
                } else if (results['password'] !== hashedPassword) {
                    return res.render('login', {
                        message: 'Invalid Credentials'
                    });
                }

            } else {
                return res.render('login', {
                    message: 'Oops! It seems you Don\'t have an account with us'
                });
            }
        });
    } catch (error) {
        console.log(error);
        return res.render('login', {
            message: 'Something went wrong'
        });
    }
}