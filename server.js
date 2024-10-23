const express = require('express');
const app = express();
const { pool } = require("./dbConfig");
const { escapeXML } = require('ejs');
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require("flash");
const passport = require("passport");

const initializePassport = require("./passportConfig");

initializePassport(passport);

const PORT = process.env.PORT || 4000;


// Using EJS
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

app.use(
    session({
        secret: "secret",

        resave: false,

        saveUninitialized : false
    })
);


app.use(passport.initialize())
app.use(passport.session());


app.use(flash());

// Routes
app.get("/", (req, res, next) => {
    res.render("index");
});

app.get("/users/register", checkAuthenticated, (req, res, next) => {
    res.render("register");
});

// app.get("/users/login", (req, res, next) => {
//     res.render("login");
// });

app.get("/users/login", checkAuthenticated, (req, res, next) => {
    res.render("login", {
        messages: req.flash()
    });
});


app.get("/users/dashboard", checkNotAuthenticated, (req, res, next) => {
    res.render("dashboard", { user: req.user.name });
});

//logout route
app.get("/users/logout", (req, res, next) => {
    res.logOut();
    req.flash("Success_msg", "You are log out..")
    req.redirect("/users/login");
})

app.post("/users/register", async (req, res, next) => {
    let { name, email, password, password2 } = req.body;

    console.log({
        name,
        email,
        password,
        password2
    });

    let errors = [];

    // Validation checks
    if (!name || !email || !password || !password2) {
        errors.push({ message: "Please enter all fields" });
    }

    if (password.length < 6) {
        errors.push({ message: 'Password should be at least 6 characters!' });
    }

    if (password !== password2) {
        errors.push({ message: 'Passwords do not match!' });
    }

    if (errors.length > 0) {
        // Render errors to the view
        res.render("register", { errors });
    } else {
        try {
            // Hash the password
            let hashedPassword = await bcrypt.hash(password, 10);
            console.log("Hashed Password:", hashedPassword);

            // Check if email already exists in the database
            pool.query(
                `SELECT * FROM users WHERE email = $1`, 
                [email], 
                (err, results) => {
                    if (err) {
                        throw err;
                    }

                    if (results.rows.length > 0) {
                        // User already exists
                        errors.push({ message: "Email is already registered" });
                        res.render("register", { errors });
                    } else {
                        // Email not found, insert new user
                        pool.query(
                            `INSERT INTO users (name, email, password) 
                             VALUES ($1, $2, $3) 
                             RETURNING id, password`, 
                             [name, email, hashedPassword], 
                             (err, results) => {
                                if (err) {
                                    throw err;
                                }
                                console.log(results.rows);
                                
                                // Redirect to login with a success message
                                req.flash('success_msg', 'You are now registered and can log in');
                                res.redirect('/users/login');
                            }
                        );
                    }
                }
            );
        } catch (err) {
            console.error(err);
            res.status(500).send("Server Error");
        }
    }
});



app.post("/users/login", passport.authenticate("local", {
    successRedirect:"/users/dashboard",
    failureRedirect:"/users/login",
    failureFlash: true
}));


//Check Authentication
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect("/users/dashboard");
    }
    next();
}

//Check if User is not Authenticated...
function checkNotAuthenticated(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect("/users/login");
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
