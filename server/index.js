const compression = require("compression");
const express = require("express");
const path = require("path");

const app = express();
//const port = process.env.PORT || 3000; // PORT from Heroku or local port 3000
const port = 3000;

const public = path.join(__dirname, "..", "www", "public"); // get to the "public" folder


app.use(compression());
app.use("/snake", express.static(public));

app.get("/snake/*", (_, res) => {
    res.sendFile(path.join(public, "index.html"))
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Snake Game Server is running on port ${port}`)
});
