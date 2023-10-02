const express = require("express");
const session = require("express-session");
const path = require("path");
const connectDB = require("./db/connect");

const app = express();

// Global configuration access
require("dotenv").config();

// set the view engine to ejs
app.set("view engine", "ejs");

// middleware
app.use(express.static("./views"));
app.use("/", express.static(path.join(__dirname + "public")));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// routes

app.use(
  session({
    secret: "secret", // used to sign the cookie
    resave: false, // update session even w/ no changes
    saveUninitialized: true, // always create a session
  }),
);

app.use("/", require("./routes/loginPage"));
app.use("/api/v1/auth", require("./routes/auth"));
app.use("/api/v1/contributors", require("./routes/contributors"));
app.use("/api/v1/project-creators", require("./routes/projectCreators"));

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`),
    );
  } catch (error) {
    console.log(error);
  }
};

start();
