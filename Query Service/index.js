const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const port = 3001;
const mongoose = require("mongoose");
const dateTime = require("date-and-time");
const moment = require("moment");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors());

mongoose.connect("mongodb://localhost:27017/homelane", {
  useNewUrlParser: true,
});

const covidIndiaSchema = {
  Sno: String,
  Date: String,
  Time: String,
  "State/UnionTerritory": String,
  "Confirmed Indian National": String,
  "Confirmed Foreign National": String,
  Cured: String,
  Deaths: String,
  Confirmed: String,
};

const covidVaccineStateWiseSchema = {
  "Updated On": String,
  State: String,
  "Total Doses Administered": String,
  "Total Sessions Conducted": String,
  "Total Sites": String,
  "First Dose Administered": String,
  "Second Dose Administered": String,
  "Male(Individuals Vaccinated)": String,
  "Female(Individuals Vaccinated)": String,
  "Transgender(Individuals Vaccinated)": String,
  "Total Covaxin Administered": String,
  "Total CoviShield Administered": String,
  "Total Sputnik V Administered": String,
  AEFI: String,
  "18-45 years (Age)": String,
  "45-60 years (Age)": String,
  "60+ years (Age)": String,
  "Total Individuals Vaccinated": String,
};

const stateWiseTestingDetailSchema = {
  Date: String,
  State: String,
  TotalSamples: String,
  Negative: String,
  Positive: String,
};

const CovidIndia = mongoose.model("Covidindia", covidIndiaSchema);

const CovidVaccineStateWise = mongoose.model(
  "Covidvaccinestatewise",
  covidVaccineStateWiseSchema
);
const StateWiseTestingDetail = mongoose.model(
  "Statewisetestingdetail",
  stateWiseTestingDetailSchema
);
function formatDate(date, sep) {
  var d = new Date(date);
  month = "" + (d.getMonth() + 1);
  day = "" + d.getDate();
  year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [day, month, year].join(sep);
}
async function GetDateInfo(date) {
  const responseObject = {
    IndiaReport: null,
    StateWiseVaccineReport: null,
    StateWiseTestingReport: null,
  };
  await CovidIndia.find({ Date: date }, (err, result) => {
    if (err) {
      console.log(err);
      res.send(responseObject);
    }
    responseObject.IndiaReport = result;
  });

  await StateWiseTestingDetail.find({ Date: date }, (err, result) => {
    if (err) {
      console.log(err);
      responseObject.IndiaReport = null;
      res.send(responseObject);
    }
    responseObject.StateWiseTestingReport = result;
  });

  date = formatDate(date, "/");
  console.log(date);

  await CovidVaccineStateWise.find({ "Updated On": date }, (err, result) => {
    if (err) {
      console.log(err);
      responseObject.IndiaReport = null;
      responseObject.StateWiseTestingReport = null;
      res.send(responseObject);
    }

    responseObject.StateWiseVaccineReport = result;
  });
  return responseObject;
}

app.get("/Get_date_info", async (req, res) => {
  if (req.ip == "49.36.180.177" && req.origin == "http://localhost:3000") {
    let date = req.body.date;
    let responseObject = {
      IndiaReport: null,
      StateWiseVaccineReport: null,
      StateWiseTestingReport: null,
    };
    if (moment(date, "YYYY-MM-DD", true).isValid()) {
      responseObject = await GetDateInfo(date);
      res.send(responseObject);
    } else {
      console.log("invalid date");
      res.send(responseObject);
    }
  } else {
    res.status(401);
    res.send("Pemission denied");
  }
});
async function GetStateInfo(state) {
  const responseObject = {
    IndiaReport: null,
    StateWiseVaccineReport: null,
    StateWiseTestingReport: null,
  };
  await CovidIndia.find({ "State/UnionTerritory": state }, (err, result) => {
    if (err) {
      console.log(err);
      res.send(responseObject);
    }
    responseObject.IndiaReport = result;
  });

  await StateWiseTestingDetail.find({ State: state }, (err, result) => {
    if (err) {
      console.log(err);
      responseObject.IndiaReport = null;
      res.send(responseObject);
    }
    responseObject.StateWiseTestingReport = result;
  });

  await CovidVaccineStateWise.find({ State: state }, (err, result) => {
    if (err) {
      console.log(err);
      responseObject.IndiaReport = null;
      responseObject.StateWiseTestingReport = null;
      res.send(responseObject);
    }

    responseObject.StateWiseVaccineReport = result;
  });
  return responseObject;
}

app.get("/Get_state_info", async (req, res) => {
  if (req.ip == "49.36.180.177" && req.origin == "http://localhost:3000") {
    let responseObject = {
      IndiaReport: null,
      StateWiseVaccineReport: null,
      StateWiseTestingReport: null,
    };
    let state = req.body.state;
    if (state != "" && state != null) {
      responseObject = await GetStateInfo(state);
      res.send(responseObject);
    } else {
      res.send(responseObject);
    }
  } else {
    res.status(401);
    res.send("Pemission denied");
  }
});

async function GetPinpointInfo(date, state) {
  const responseObject = {
    IndiaReport: null,
    StateWiseVaccineReport: null,
    StateWiseTestingReport: null,
  };
  await CovidIndia.find(
    { "State/UnionTerritory": state, Date: date },
    (err, result) => {
      if (err) {
        console.log(err);
        res.send(responseObject);
      }
      responseObject.IndiaReport = result;
    }
  );

  await StateWiseTestingDetail.find(
    { State: state, Date: date },
    (err, result) => {
      if (err) {
        console.log(err);
        responseObject.IndiaReport = null;
        res.send(responseObject);
      }
      responseObject.StateWiseTestingReport = result;
    }
  );

  date = formatDate(date, "/");
  console.log(date);

  await CovidVaccineStateWise.find(
    { State: state, "Updated On": date },
    (err, result) => {
      if (err) {
        console.log(err);
        responseObject.IndiaReport = null;
        responseObject.StateWiseTestingReport = null;
        res.send(responseObject);
      }

      responseObject.StateWiseVaccineReport = result;
    }
  );
  return responseObject;
}

app.get("/Pinpoint_state", async (req, res) => {
  if (req.ip == "49.36.180.177" && req.origin == "http://localhost:3000") {
    let responseObject = {
      IndiaReport: null,
      StateWiseVaccineReport: null,
      StateWiseTestingReport: null,
    };
    let date = req.body.date;
    let state = req.body.state;
    if (state != "" && state != null && date != "" && date != null) {
      responseObject = await GetPinpointInfo(date, state);
      res.send(responseObject);
    } else {
      res.send(responseObject);
    }
  } else {
    res.status(401);
    res.send("Pemission denied");
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
