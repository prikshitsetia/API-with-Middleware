const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const port = 3000;
const mongoose = require("mongoose");
const https = require("https");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors());

mongoose.connect("mongodb://localhost:27017/homelane", {
  useNewUrlParser: true,
});
const userSchema = {
  email: String,
  apiKey: String,
};
const User = mongoose.model("User", userSchema);

const userKeyMapping = new Map();

//get all the keys from user table
User.find({}, (err, result) => {
  result.forEach((user) => {
    userKeyMapping.set(user.email, user.apiKey);
    console.log(user.email);
  });
});
//add all the keys to set

app.post("/register", (req, res) => {
  const email = req.body.email;
  let apiKey = "";

  if (email !== "" && email !== null) {
    if (!userKeyMapping.has(email)) {
      apiKey = genKey();
      const newUser = {
        email: email,
        apiKey: apiKey,
      };
      User.create(newUser, (err, result) => {
        if (err) {
          console.log(err);
        } else {
          res.send(`User Registered with api key = ${apiKey}`);
        }
      });
      userKeyMapping.set(email, apiKey);
    } else {
      res.send("user already exists");
    }
  } else {
    res.send("invalid user");
  }
});

app.get("/", (req, res) => {
  const email = req.header("x-api-email");
  const apiKey = req.header("x-api-key");
  if (userKeyMapping.has(email)) {
    if (userKeyMapping.get(email) == apiKey) {
      if (res.body.length == 2) {
        const options = {
          hostname: "http://localhost:3001",
          path: "/Pinpoint_state",
          method: "GET",
        };

        const req = https.request(options, (resp) => {
          console.log(`statusCode: ${res.statusCode}`);

          resp.on("data", (d) => {
            res.send(d);
          });
        });
      } else if (res.body.has(state)) {
        const options = {
          hostname: "http://localhost:3001",
          path: "/Get_state_info",
          method: "GET",
        };

        const req = https.request(options, (resp) => {
          console.log(`statusCode: ${res.statusCode}`);

          resp.on("data", (d) => {
            res.send(d);
          });
        });
      } else {
        const options = {
          hostname: "http://localhost:3001",
          path: "/Get_date_info",
          method: "GET",
        };

        const req = https.request(options, (resp) => {
          console.log(`statusCode: ${res.statusCode}`);

          resp.on("data", (d) => {
            res.send(d);
          });
        });
      }
    } else {
      res.send("PErmission denied");
    }
  } else {
    res.send("PErmission denied");
  }
});

const genKey = () => {
  //create a base-36 string that is always 30 chars long a-z0-9
  // 'an0qrr5i9u0q4km27hv2hue3ywx3uu'
  return [...Array(30)]
    .map((e) => ((Math.random() * 36) | 0).toString(36))
    .join("");
};

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
