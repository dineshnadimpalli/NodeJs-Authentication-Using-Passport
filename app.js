const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const keyJson = require("./config/keys");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");

const app = express();

// Passport config
require("./config/passport")(passport);

// DB config
const db = keyJson.MongoURI;

// Connect to Mongo DB
mongoose.connect(db, { useNewUrlParser: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.log(err))

// Ejs
app.use(expressLayouts);
app.set("view engine", "ejs");

// BodyParser
app.use(express.urlencoded({ extended: false }));

// Express session
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg")
  res.locals.error_msg = req.flash("error_msg")
  res.locals.error = req.flash("error")
  next();
})

// Router initializations
const IndexRoute = require("./routes/index");
const UserRoutes = require("./routes/users");

const PORT = process.env.PORT || 5000;

// Routes
app.use("/", IndexRoute);
app.use("/users", UserRoutes);

app.listen(PORT, () => {
  console.log(`Node Server running on port ${PORT}`);
});
