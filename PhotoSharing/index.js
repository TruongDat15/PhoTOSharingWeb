const express = require("express");
const app = express();
const cors = require("cors");
const session = require("express-session");
const dbConnect = require("./db/dbConnect");
const UserRouter = require("./routes/UserRouter");
const PhotoRouter = require("./routes/PhotoRouter");
const CommentRouter = require("./routes/CommentRouter");
const AdminRouter = require("./routes/AdminRouter");

dbConnect();

// Allow configuring client origin via env (useful on CodeSandbox). Fallback to true for dev.
const clientOrigin = process.env.CLIENT_ORIGIN || true;
app.use(cors({ origin: clientOrigin, credentials: true }));
app.use(express.json());

// Session cookie options for cross-site contexts (CodeSandbox uses different origins):
const cookieSecure = process.env.SESSION_COOKIE_SECURE === 'true';
// If secure (HTTPS) use 'none' (for cross-site). If not secure (local HTTP), use 'lax' to avoid browser rejecting cookie.
const cookieSameSite = cookieSecure ? (process.env.SESSION_COOKIE_SAME_SITE || 'none') : (process.env.SESSION_COOKIE_SAME_SITE || 'lax');

app.use(
  session({
    secret: process.env.SESSION_SECRET || "change_this_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000, httpOnly: true, secure: cookieSecure, sameSite: cookieSameSite },
  })
);
app.use("/api/user", UserRouter);
app.use("/api/photo", PhotoRouter);
app.use("/api/comment", CommentRouter);
app.use("/admin", AdminRouter);

app.get("/", (request, response) => {
  response.send({ message: "Hello from photo-sharing app API!" });
});

app.use("/images", express.static("images"));

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`server listening on port ${port}`);
  console.log(`SESSION_COOKIE_SECURE=${cookieSecure}, SESSION_COOKIE_SAME_SITE=${cookieSameSite}, CORS origin=${clientOrigin}`);
});
