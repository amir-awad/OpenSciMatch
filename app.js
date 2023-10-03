const express = require("express");
const session = require("express-session");
const http = require("http");
const socketIO = require("socket.io");
const path = require("path");
const connectDB = require("./db/connect");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Global configuration access
require("dotenv").config();

// set the view engine to ejs
app.set("view engine", "ejs");

// middleware
app.use(express.static("./views"));
app.use("/", express.static(path.join(__dirname + "public")));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session middleware
app.use(
  session({
    secret: "secret", // used to sign the cookie
    resave: false, // update session even w/ no changes
    saveUninitialized: true, // always create a session
  })
);

app.use("/", require("./routes/loginPage"));
app.use("/api/v1/auth", require("./routes/auth"));
app.use("/api/v1/contributors", require("./routes/contributors"));
app.use("/api/v1/project-creators", require("./routes/projectCreators"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

let name;

io.on("connection", (socket) => {
  console.log('new user connected');

  socket.on('joining msg', (username) => {
    name = username;
    io.emit('chat message', `---${name} joined the chat---`);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    io.emit('chat message', `---${name} left the chat---`);
  });

  socket.on('chat message', (msg) => {
    socket.broadcast.emit('chat message', msg); // sending message to all except the sender
  });
});

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    server.listen(port, () =>
      console.log(`Server is listening on port ${port}...`),
    );
  } catch (error) {
    console.log(error);
  }
};

start();
