const express = require("express");
const mongodb = require("mongodb");
require("dotenv").config();

const app = express();
//app.use(express);

const uri = process.env.DATABASE_URI;
const client = new mongodb.MongoClient(uri, { useUnifiedTopology: true });

client.connect(function () {
  const db = client.db("sample_airbnb");
  const collection = db.collection("listingsAndReviews");

  app.get("/", (req, res) => {
    res.send(
      "<h2>please browse below end points</h2><ul><li>/search/room <h4>name= or summary=</h4></li><li>/search/price<h4>from= or to=</h4></li><ul>"
    );
  });

  app.get("/search/room", (req, res, next) => {
    const { name, summary } = req.query;
    if (
      (name === undefined || name === "") &&
      (summary === undefined || summary === "")
    ) {
      //res.send(`please specify name or summery in your query parameter`);
      return next(`please specify name or summery in your query parameter`);
    }

    //this searchObject accept name or summary
    // the search parameters based on regex and would fine any record that has the string inside
    //the regex rule find a word that match to query not characters inside a word.

    const searchObject =
      (name !== undefined && {
        name: new RegExp(` ${name} `),
      }) ||
      (summary !== undefined && {
        summary: new RegExp(` ${summary} `),
      });

    // const searchObject =
    //   (name !== undefined && { name: new RegExp(name) }) ||
    //   (summary !== undefined && { summary: new RegExp(summary) });
    console.log("");
    console.log(searchObject);

    collection.find(searchObject).toArray(function (error, data) {
      res.send(error || data);
    });
  });

  app.get("/search/price", (req, res, next) => {
    //Queries : from : price from , to : price to
    const { from, to } = req.query;

    if (
      (from === undefined || from === "") &&
      (to === undefined || to === "")
    ) {
      return next(
        `please specify "from" price or "to" price in your query parameter`
      );
    }

    const searchObject = {
      price: {
        $gte: from == undefined ? 0 : Number(from),
        $lt: to == undefined ? 0 : Number(to),
      },
    };

    console.log("");
    console.log(searchObject);

    collection.find(searchObject).toArray(function (error, data) {
      res.send(error || data);
    });
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`server started on port ${PORT}`));
