const express = require("express");
const morgan = require('morgan')
const app = express();
const PORT = 8081; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const helpers = require('./helpers.js');

function generateRandomString() {
  // Generate [Random AlphaNumeric String]..
  let rndStr = Math.random(2).toString(36).slice(2, 8);
  //console.log(rndStr);
  return rndStr;
}

// // set user_id key on a session...
// const id = req.session.user_id = "some value";
// // read a value..
// req.session.user_id;


const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10),
    
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10),
  },
};

const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
};


app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
//app.use(cookieParser());

app.use(
  cookieSession({
    name: 'session',
    keys: ['email', 'password'],

    // Cookie options
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);


app.set("view engine", "ejs");

// **LAND**[ROOT]
app.get("/", (req, res) => {
  const randURL = generateRandomString();
  res.send(`<html><body>Welcome to <b>TinyApp</b><br>I take Long URLS, and I shrink them like this: ${randURL}<br><br><a href="/urls"> Come on in!</a></body></html>\n`);
});

// **CREATE**[URLS: Create New URL]
app.get("/urls/new", (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  if (!user) {
    return res.redirect("/login");
  }
  const templateVars = { user: users[req.session.user_id] };  
  res.render("urls_new", templateVars);
});

// **VIEW**[URLS: Display shortenURL]
app.get("/urls/:shortURL", (req, res) => {
  const userEdit = req.session.user_id;
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL , user: users[req.session.user_id] };
  res.render("urls_show", templateVars);
});

// **VISIT**[URLS: Link to a ShortenURL]
app.get("/u/:id", (req, res) => {
  const url = urlDatabase[req.params.id];
  if (!url) {
    return res.status(401).send("ERROR..");
  }
  const longURL = url.longURL;
  console.log(`longURL:`, longURL);
  res.redirect(longURL);
});

// // **VISIT**[URLS: Link to a ShortenURL]
// app.get("/u/:shortURL", (req, res) => {
//   const longURL = urlDatabase[req.params.shortURL].longURL;
//   console.log(`longURL:`, longURL);
//   res.redirect(longURL);
// });


// [DEBUG][URLS: Urls JSON]
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// [DEBUG][URLS: Urls JSON]
app.get("/users.json", (req, res) => {
  res.json(users);
});

// [DEBUG][URLS: Urls JSON]
app.get("//usr2.email", (req, res) => {
  res.json(users.user2RandomID.email);
});


const validInputCheck = (email, password) => {
  if (email === '' || password === '') {
    return false;
  }
  return true;
};

const getUserUrls = (user_id) => {
  const urls = {};
  console.log(`urlDB:`, urlDatabase);
  for (let i in urlDatabase) {
    let url = urlDatabase[i];
    if (url.userID === user_id) {
      urls[i] = url; 
    }
  }
  return urls;
}

// const getUserUrls = (user_id, urlDB) => {  // TO DO: external reference
//   const urls = {};
//   console.log(`urlDB:`, urlDB);
//   for (let i in urlDB) {
//     let url = urlDB[i];
//     if (url.userID === user_id) {
//       urls[i] = url; 
//     }
//   }
//   return urls;
// }



// const getUserByEmail = (email, database) => {
//   console.log(`GUBE_users-obj:`, database);
//   console.log(`pre-forloopEmail:`, email);
//   for (const user in database) {
//     if (email === database[user].email) {
//       return database[user];
//     }
//   }
//   return null;
// };


// const getUserByEmail = (email, database) => {
//   console.log(`GUBE_users-obj:`, users);
//   console.log(`pre-forloopEmail:`, email);
//   for (const user in users) {
//     if (email === users[user].email) {
//       return users[user];
//     }
//   }
//   return null;
// };

const passwordCheck = (user, password) => {
  if (user === null) {
    return null;
  }
  return bcrypt.compareSync(password, user.password);
};


// **VIEW** [URLS: Main..]
app.get("/urls", (req, res) => {
  console.log(`reg.session:`, req.session);
  const id = req.session.user_id;
  const user = users[id];
  if (!user) {
    return res.redirect("/login");
  }
  const templateVars = { 
    urls: getUserUrls(id),
    user: users[req.session.user_id],
  };
  res.render("urls_index", templateVars);
});


// bcrypt.hash(myPlaintextPassword, saltRounds, function(err, hash) {
//   // Store hash in your password DB.
// });




// login page****
app.get('/login', (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  if (user) {
    return res.redirect("/urls");
  }
  
  res.render("usr_login", { user });
  //res.render('usr_login', templateVars);
});

// **REGISTER** ****
app.get("/register", (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  if (user) {
    return res.redirect("/urls");
  }

  res.render("usr_register", { user });
  //res.render("usr_register", templateVars);
});


// //The Blackhole-redirect; Returns the index page when no other route is matched.
// app.get("*", (req, res) => {
//   console.log("Wanderer sent-back to the Index..")
//   res.redirect("/urls");
//   //generateRandomString();
// });


// **DELETE** ShortenURL Link
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  if (!user) {
    return res.redirect('/login');
  }
  console.log('a Link have been Deleted!', req.params.shortURL);
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});
 

// ****
app.post("/urls/:shortURL", (req, res) => {
  // ****
  const userID = req.session.user_id;
  const user = users[userID];
  if (!user) {
    return res.redirect('/urls');
  }
  // ****
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = { userID, longURL };
  res.redirect("/urls");
})

// *generates* shortURL, *adds* to database and *redirects* to /urls/shortURL
app.post('/urls', (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  if (!user) {
    return res.redirect("/login");
  }
  
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;

  urlDatabase[shortURL] = { 
    longURL : longURL,
    userID : req.session.user_id
    };
  console.log('User:', req.session.user_id, ' Shorted ', req.body.longURL, ' with ', shortURL);
  res.redirect(`/urls/${shortURL}`);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  const id = generateRandomString();
  // (eNp = email AND password..)
  const eNp = validInputCheck(email, password);
  if (!eNp) {
    return res.status(403).send("Please enter BOTH Email & Password..");
  }
  const user = helpers.getUserByEmail(email, users);
  if (user) {
    return res.status(403).send("Email already Exist! <a href='/login'>Try Again</a>");
  }
  //console.log(email, password);
  users[id] = { id, email, password: hashedPassword};
  //res.cookie("user_id", id);
  req.session.user_id = id;   // not 100%...
  res.redirect("/urls");

});

// User_id gets Logged in..
app.post("/login", (req, res) => {

  const email = req.body.email;
  const password = req.body.password;
  const user = helpers.getUserByEmail(email, users);

  if (!user) {
    return res.status(400).send("Sorry, Invalid Credential: <a href='/login'>Try Again</a>");
  }
  const checkPassword = passwordCheck(user, password);
  if (!checkPassword) {
    return res.status(403).send("Invalid Credentials: <a href='/login'>Try Again</a>");
  }
  console.log(users);
  req.session.user_id = user.id
  // res.session('user_id', user.id);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  //res.clearCookie('user_id');
  req.session = null;
  res.redirect("/urls");
});

// When Server-Boot Online, it listens on specific Port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
