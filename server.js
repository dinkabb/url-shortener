require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const dns = require("dns");
const urlParser = require("url");

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

const dbURI =
  "mongodb+srv://dbb:test1234@cluster0.2o8mu.mongodb.net/urlShortener?retryWrites=true&w=majority";
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });

const schema = new mongoose.Schema({ url: "string" });
const Url = mongoose.model("Url", schema);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.post("/api/shorturl", function (req, res) {
  const bodyUrl = req.body.url;

  const getAddress = dns.lookup(
    urlParser.parse(bodyUrl).hostname,
    (error, address) => {
      if (!address) {
        res.json({ error: "invalid url" });
      } else {
        const url = new Url({ url: bodyUrl });
        url.save((err, data) => {
          res.json({ original_url: data.url, short_url: data.id });
        });
      }
    }
  );
});

app.get("/api/shorturl/:id", (req, res) => {
  const id = req.params.id;
  Url.findById(id, (error, data) => {
    if (!data) {
      res.json({ error: "invalid url" });
    } else {
      res.redirect(data.url);
    }
  });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
