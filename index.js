const express = require('express');
const app = express();
const axios = require('axios');

const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
app.set('view engine', 'ejs');

const port =3000;

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));
app.use(bodyParser.urlencoded({ extended: true }));


const users = [];


function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  } else {
    return res.redirect('/login');
  }
}
app.post('/loginsub', (req, res) => {
  res.render('weath', {
    City: "Delhi",
    Country: "IN",
    Temperature: "31.4",
    Humidity: "78",
    Wind: "4"
  });
});

app.post('/ameer', (req, res) => {
 const location = req.body.city;
  const apiKey = "9ac0b58652539dbc8f2fe9a0573858e9";
  const apiUrl =`https://api.openweathermap.org/data/2.5/weatherq=${location}&appid=9ac0b58652539dbc8f2fe9a0573858e9`;
  axios.get(apiUrl).then((response) => {
    const data = response.data;
    const city = data.name;
    const country = data.sys.country;
    const temperature = (data.main.temp - 273.15).toFixed(2);
    const humidity = data.main.humidity;
    const wind = data.wind.speed;


    res.render('weath', {
      City: city,
      Country: country,
      Temperature: temperature,
      Humidity: humidity,
      Wind: wind
    });
  })
    .catch((error) => {
      console.error(error);
      res.render('weath', {
        City: "Location not found",
        Country: "",
        Temperature: "",
        Humidity: "",
        Wind: ""
      });
    });
});


app.get('/', (req, res) => {
  res.render("home.ejs");
});

app.get('/login', (req, res) => {
  res.render("login.ejs");
  
});


app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  const user = users.find(u => u.username === username);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.redirect('/login');
  }

  req.session.user = user;

  res.redirect('/dashboard');
});

app.get('/dashboard', requireAuth, (req, res) => {
  res.send(`Welcome to the dashboard, ${req.session.user.username}!`);
});

app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error(err);
    }
    res.redirect('/');
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
