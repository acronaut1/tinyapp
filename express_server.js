const express = require("express");
const morgan = require('morgan')
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

function generateRandomString() {
  // Generate [Random AlphaNumeric String]..
  let rndStr = Math.random(2).toString(36).slice(2, 8);
  //console.log(rndStr);
  return rndStr;
}

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// **LAND**[ROOT]
app.get("/", (req, res) => {
  //res.send("Hello!");
  const randURL = generateRandomString();
  res.send(`<html><body>Welcome to <b>TinyApp</b><br>I take Long URLS, and I shrink them like this: ${randURL}<br><br><a href="/urls"> Come on in!</a></body></html>\n`);
  //res.redirect(`/urls/${randURL}`);
});



// app.get("/hello_HTML", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

// app.get("/hello_Vars", (req, res) => {
//   const templateVars = { greeting: 'Hello World!' };
//   res.render("hello_world", templateVars);
// });

// **CREATE**[URLS: Create New URL]
app.get("/urls/new", (req, res) => {
  const userEdit = req.cookies.user_id;
  const templateVars = { user: users[req.cookies.user_id] };  
  res.render("urls_new", templateVars);
});

// **VIEW**[URLS: Display shortenURL]
app.get("/urls/:shortURL", (req, res) => {
  const userEdit = req.cookies.user_id;
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies.user_id] };
  res.render("urls_show", templateVars);
});

// **VISIT**[URLS: Link to a ShortenURL]
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  console.log(`longURL:`, longURL);
  res.redirect(longURL);
});


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


// TERNARY BASED VALIDINPUT CHECK, BUGGY...
// const checkValidInput = (email, password) => {
//   (email ? console.log('eml:TRUE!!', true) : console.log('eml:FALSE!!', false));
//   (password ? console.log('pass:TRUE!!', true) : console.log('pass:FALSE!!', false));
//   return (email, password);
// };



const validInputCheck = (email, password) => {
  if (email === '' || password === '') {
    return false;
  }
  return true;
};

const getUserByEmail = (email) => {
  console.log(`GUBE_users-obj:`, users);
  console.log(`pre-forloopEmail:`, email);
  for (const user in users) {
    if (email === users[user].email) {
      return users[user];
    }
  }
  return null;
};

const passwordCheck = (user, password) => {
  if (user === null) {
    return null;
  }
  return user.password === password;
};


// **VIEW** [URLS: Main..]
app.get("/urls", (req, res) => {
  console.log(`reg.cookies:`, req.cookies);
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies.user_id],
  };
  res.render("urls_index", templateVars);
});

// login page
app.get('/login', (req, res) => {
  let templateVars = {user: users[req.cookies['user_id']]};
  res.render('usr_login', templateVars);
});

// **REGISTER**
app.get("/register", (req, res) => {
  //const templateVars = { urls: urlDatabase,
  //  user_id: req.cookies.user_id };
  let templateVars = { user: users[req.cookies.user_id] };
  res.render("usr_register", templateVars);
});


// //The Blackhole-redirect; Returns the index page when no other route is matched.
// app.get("*", (req, res) => {
//   console.log("Wanderer sent-back to the Index..")
//   res.redirect("/urls");
//   //generateRandomString();
// });


// **DELETE** ShortenURL Link
app.post("/urls/:shortURL/delete", (req, res) => {
  console.log('a Link have been Deleted!', req.params.shortURL);
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

// LOOK AT THIS CHANGE LOOK AT THIS CHANGE LOOK AT THIS CHANGE LOOK AT THIS
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
})

// app.post("/urls", (req, res) => {
//   console.log(req.body);  // Log the POST request body to the console
//   res.send("Ok");         // Respond with 'Ok' (we will replace this)
// });



// *generates* shortURL, *adds* to database and *redirects* to /urls/shortURL
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  //urlDatabase[shortURL] = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  console.log('User:', req.cookies.user_id, ' Shorted ', req.body.longURL, ' with ', shortURL);
  res.redirect(`/urls/${shortURL}`);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = generateRandomString();
  // (eNp = email AND password..)
  const eNp = validInputCheck(email, password);
  //console.log(`email,password:`, email,password);
  //console.log(`eNp:`, eNp);
  if (!eNp) {
    return res.status(403).send("Please enter BOTH Email & Password..");
  }
  const user = getUserByEmail(email);
  if (user) {
    return res.status(403).send("Email already Exist! <a href='/login'>Try Again</a>");
  }
  console.log(email, password);
  users[id] = { id, email, password};
  console.log(`users-obj:`, users);
  res.cookie("user_id", id);
  res.redirect("/urls");
});

// User_id gets Logged in..
app.post("/login", (req, res) => {
  //const user_id = req.body.user_id;
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email);
  
  // console.log(`req.body:`, req.body); // to check..
  // Filter out the stuff I don't want first...
  if (!user) {
    return res.status(400).send("Sorry, Invalid Credential: <a href='/login'>Try Again</a>");
  }
  const checkPassword = passwordCheck(user, password);
  if (!checkPassword) {
    return res.status(403).send("Invalid Credentials: <a href='/login'>Try Again</a>");
  }
  console.log('Logged IN...', user);
  res.cookie('user_id', user.id);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  console.log('Logged OUT...');
  res.clearCookie('user_id');
  res.redirect("/");
});

// When Server-Boot Online, it listens on specific Port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
