const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const ExpressError = require("./utils/ExpressError");
const listingRouter = require("./routes/listing");
const reviewRouter = require("./routes/reviews");
const userRouter = require("./routes/user");
const User = require("./models/user");
const { saveRedirectUrl } = require("./middleware");

const app = express();
const MONGO_URL = "mongodb://127.0.0.1:27017/wonderlust";

// ✅ Connect to MongoDB
main()
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ DB connection error:", err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

// ✅ View Engine Setup
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ✅ Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Session Configuration
const sessionOptions = {
  secret: process.env.SESSION_SECRET || "mysupersecretcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};
app.use(session(sessionOptions));
app.use(flash());

// ✅ Passport Configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ✅ Save redirect URL before authentication
app.use(saveRedirectUrl);

// ✅ Flash + Current User Middleware
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// ✅ Mount Routes
app.use("/", userRouter);
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);

// ✅ Root Redirect
app.get("/", (req, res) => {
  res.redirect("/listings");
});

// ✅ Catch-All 404 Handler
// app.all("*", (req, res, next) => {
//   next(new ExpressError("Page Not Found", 404));
// });

// ✅ Centralized Error Handler
app.use((err, req, res, next) => {
  if (err.name === "CastError") {
    err.statusCode = 400;
    err.message = `Invalid ID: "${err.value}"`;
  }
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error", { err: { statusCode, message } });
});

// ✅ Start Server
app.listen(8080, () => {
  console.log("🚀 Server running on http://localhost:8080");
});
