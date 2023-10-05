const express = require("express");
const session = require("express-session");
const http = require("http");
const socketIO = require("socket.io");
const path = require("path");
const connectDB = require("./db/connect");
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const File = require("./models/UploadedFile");
const multer = require("multer");

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
  }),
);

app.use("/", require("./routes/home"));
app.use("/login", require("./routes/loginPage"));
app.use("/recommend", require("./routes/recommendations"));
app.use("/api/v1/auth", require("./routes/auth"));
app.use("/api/v1/contributors", require("./routes/contributors"));
app.use("/api/v1/project-creators", require("./routes/projectCreators"));
app.use("/search", require("./routes/search"));

app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "/uploads");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `files/admin-${file.fieldname}-${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.split("/")[1] === "pdf") {
    cb(null, true);
  } else {
    cb(new Error("Not a pdf file! Please upload only pdf files."), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

//API Endpoint for uploading file
app.post("/api/uploadFile", upload.single("myFile"), async (req, res) => {
  try {
    const newFile = await File.create({
      name: req.file.filename,
    });

    res.status(200).json({
      status: "success",
      message: "File created successfully!",
    });
  } catch (error) {
    res.json({
      error,
    });
  }
});

let name;

io.on("connection", (socket) => {
  console.log("new user connected");

  socket.on("joining msg", (username) => {
    name = username;
    io.emit("chat message", `---${name} joined the chat---`);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
    io.emit("chat message", `---${name} left the chat---`);
  });

  socket.on("chat message", (msg) => {
    socket.broadcast.emit("chat message", msg); // sending message to all except the sender
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
