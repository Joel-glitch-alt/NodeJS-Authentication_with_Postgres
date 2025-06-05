// app.js
const express = require("express");
const session = require("express-session");
const flash = require("flash");
const passport = require("passport");
const bcrypt = require("bcrypt");
const { pool } = require("./dbConfig");

const initializePassport = require("./passportConfig");
initializePassport(passport);

const app = express();

// Middlewares
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Authentication Checks
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/users/dashboard");
  }
  next();
}

function checkNotAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect("/users/login");
}

// Routes
app.get("/", (req, res) => {
  res.status(200).send("Welcome to Home Page"); // for test
});

app.get("/users/register", checkAuthenticated, (req, res) => {
  res.render("register");
});

app.get("/users/login", checkAuthenticated, (req, res) => {
  res.render("login", {
    messages: req.flash(),
  });
});

app.get("/users/dashboard", checkNotAuthenticated, (req, res) => {
  res.render("dashboard", { user: req.user?.name || "Guest" });
});

app.get("/users/logout", (req, res) => {
  req.logOut((err) => {
    if (err) return next(err);
    req.flash("success_msg", "You are logged out");
    res.redirect("/users/login");
  });
});

app.post("/users/register", async (req, res) => {
  let { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ message: "Please enter all fields" });
  }

  if (password.length < 6) {
    errors.push({ message: "Password should be at least 6 characters!" });
  }

  if (password !== password2) {
    errors.push({ message: "Passwords do not match!" });
  }

  if (errors.length > 0) {
    return res.render("register", { errors });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      errors.push({ message: "Email is already registered" });
      return res.render("register", { errors });
    }

    await pool.query(
      `INSERT INTO users (name, email, password) VALUES ($1, $2, $3)`,
      [name, email, hashedPassword]
    );

    req.flash("success_msg", "You are now registered and can log in");
    res.redirect("/users/login");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.post(
  "/users/login",
  passport.authenticate("local", {
    successRedirect: "/users/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true,
  })
);

module.exports = app;
