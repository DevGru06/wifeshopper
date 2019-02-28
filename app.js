//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const session = require("express-session");
const passportLocalMongoose = require("passport-local-mongoose");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

//**********************************************************************
const options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  autoIndex: false, // Don't build indexes
  reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
  reconnectInterval: 500, // Reconnect every 500ms
  poolSize: 10, // Maintain up to 10 socket connections
  // If not connected, return errors immediately rather than waiting for reconnect
  bufferMaxEntries: 0,
  connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4 // Use IPv4, skip trying IPv6
};

const LoadDB = function() { //REFACTOR ME TO MAKE PROMISE WORK RIGHT mongodb+srv://Admin:Royalty99@orderist-33pfq.mongodb.net/orderdb?retryWrites=true
  return new Promise(function(resolve, reject) {
    if (mongoose.connection.readyState === 0) {
      mongoose.connect('mongodb+srv://Admin:' + process.env.PASSWORD + '@cluster0-k5alh.azure.mongodb.net/shopmedb?retryWrites=true', options).catch((err) => {
        console.log(err.stack); //"Error Connecting to the Mongodb Database"
      });
      mongoose.set("useCreateIndex", true);

      if (mongoose.connection.readyState === 0) {
        reject("UN-Succesfully Connected to the Mongodb Database", null);
      } else {
        resolve(null, "Succesfully Connected to the Mongodb Database");
      }
    } else {
      console.log("Already connected");
    }
  });
};

//**********************************************************************
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});
userSchema.plugin(passportLocalMongoose);
const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const itemSchema = new mongoose.Schema({
  item: String,
  type: String
});

const mainlistSchema = new mongoose.Schema({
  name: String,
  createdDate: Date,
  checkedDate: Date,
  closed: Boolean,
  listitem: {
    item: String,
    qty: Number
  }
});
const MainList = new mongoose.model("MainList", mainlistSchema);

var itemToAdd = "";
const listItem = {};

const typeList = [];

//**********************************************************************

const DBLoadItem = function() {
  return new Promise(function(resolve, reject) {
    Item = mongoose.model("items", itemSchema);
    if (Item.length > 0) {
      // console.log("Item", Item);
      resolve(null, "[Item " + Item.length + "]");
    } else {
      // console.log("Item", Item);

      reject("Item Failed", null);
    }
  });
}


function FillTypesD() {
  return new Promise(function(resolve, reject) {
    Item.find({}, function(err, ids) {
      // console.log('ids', ids.length);

      if (ids.length != 0) {
        ids.forEach(function(i) {
          // console.log('i', i);
          // console.log('i.item', i.item);
          // console.log('i.type', i.type);

          const mulval = {
            _id: i._id,
            item: i.item,
            type: i.type,
            checked: false
          }
          // console.log('mulval', mulval);

          typeList.push(mulval);
        });
        typeList.sort();
        // console.log('typeList' + typeList);
        resolve(null, 'typeList ' + typeList);
      } else {
        // console.log('typeList', "Failed");
        reject("typeList Failed", null);
      }
    });
  });
}

//**********************************************************************
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Site Started Started Successfully");
  LoadDB().then(function(err, msg) {
    if (err) {
      console.log("LoadDB err", err);
    } else {
      // console.log("msg", msg);
      return DBLoadItem();
    }
  }).then(function(err, msg) {
    if (err) {
      console.log("DBLoadItem err", err);
    } else {
      return FillTypesD();
    }
  }).catch(function(err) {
    if (err) {
      console.log("FillTypesD err", err);
    }
  });
});

//**********************************************************************
// const passValue = {
//   button: true,
// buttonLink: "/menu",
// buttonTitle: "Back",
// badgelist: null,
// useChecked: true,
// }

app.get("/", function(req, res) {
  res.render("login.ejs");
});

app.get("/signin", function(req, res) {

  // const user = new User({
  //   username: req.body.username,
  //   password: req.body.password
  // });
  //
  // req.login(user, function(err) {
  //   if(err){
  //     console.log(err);
  //   } else {
  //     passport.authenticate("local")(req, result, function(){
  //       res.redicrect("/secrets");
  //     })
  //   }
  // })

  res.render("signin.ejs");
});

app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});

app.post("/register", function(req, res) {
  res.render("register.ejs");
  // User.register({username: req.body.username}, req.body.password, function(err, user) {
  //   if(err){
  //     console.log(err);
  //     res.redirect("/register");
  //   }else {
  //     passport.authenticate("local")(req, res, function() {
  //       res.redirect("/secrets");
  //     });
  //   }
  // });
});

app.all("/menu", function(req, res) {
  res.render("menu.ejs", {
    title: "Menu",
    button: false,
    buttonLink: "",
    buttonTitle: ""
  });
});

app.all("/title", function(req, res) {
  res.render("title.ejs", {
    title: "Title",
    button: true,
    buttonLink: "/menu",
    buttonTitle: "Back",
  });
});

app.get("/quantity", function(req, res) {
  if (itemToAdd.length > 0) {
    res.render("quantity.ejs", {
      title: itemToAdd,
      button: true,
      buttonLink: "/menu",
      buttonTitle: "Back",
      item: itemToAdd
    });
  } else {
    res.redirect("/error");
  }
});

app.get("/error", function(req, res) {
  res.render("error.ejs", {
    title: "Bock-b-gock",
    button: false,
    buttonLink: "",
    buttonTitle: "",
  });
});

app.get("/list", function(req, res) {
  // if (req.isAuthenticated()){
  //   res.render("/secrets");
  // } else {
  //   res.render("/login");
  // }
  res.render("list.ejs", {
    title: "Active List",
    button: true,
    buttonLink: "/menu",
    buttonTitle: "Back",
    badgelist: null,
    useChecked: true,
    list: typeList
  });
});

app.post('/add', function(req, res) {
  const selection = req.body.checkbox;

  console.log("add/selection", req.body.checkbox);

  itemToAdd = selection;

  res.redirect("/quantity");
  // find in selection and check and add to list

  // {
  //   _id: selection,
  //   item: selection,
  //   qty: Number
  // }







});

// app.get("/list", function(req, res){
//   res.render("list.ejs");
// });

// app.post('/:something', function(req, res) {
//   const customListName = req.params.something;
//   const selection = req.body.selection;
//
//   switch (customListName) {
//     case "updatefilter":
//       break;
//     case "updatetype":
//     case "typelookup":
//       break;
//     case "updateordernum":
//     case "orderlookup":
//        break;
//     case "updatevendor":
//     break;
//     case "inprogress":
//       break;
//     default:
//   }
// });

app.post('/:something', function(req, res) {
  const customListName = req.params.something;
  const selection = req.body.title;

  console.log("customListName", customListName);
  console.log("selection", selection);

  switch (customListName) {
    // case "newtitle":
    //   title = selection;
    //   break;
    default:
  }
});

// function StringBreakDown(str) {
//   // var str = "sort-list-type";
//
//   const n = str.indexOf("-");
//   const sub1 = str.substring(0, n);
//
//   const subt = str.substring(n + 1, str.length);
//
//   const n2 = subt.indexOf("-");
//   const sub2 = subt.substring(0, n2);
//
//   const sub3 = subt.substring(n2 + 1, subt.length);
//
//   return {
//     one: sub1,
//     two: sub2,
//     three: sub3
//   };
// }

// app.get('/:something', function(req, res) {
//   const customListName = req.params.something;
//   const selection = req.body.selection;
//
//   switch (customListName) {
//     case "updatefilter":
//       break;
//     case "updatetype":
//     case "typelookup":
//       break;
//     case "updateordernum":
//     case "orderlookup":
//        break;
//     case "updatevendor":
//     case "inprogress":
//        break;
//     default:
//   }
// });
