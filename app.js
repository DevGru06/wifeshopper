//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const session = require("express-session");
const passportLocalMongoose = require("passport-local-mongoose");
// const _ = require('lodash');
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
// const MainList = new mongoose.model("MainList", mainlistSchema);

var newTitle = "";
var itemToAdd = "";
var listItem = [];

const itemList = [];
const mainlist = [];

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

const DBLoadMainList = function() {
  return new Promise(function(resolve, reject) {
    MainList = new mongoose.model("MainList", mainlistSchema);
    if (MainList.length > 0) {
      // console.log("Item", Item);
      resolve(null, "[MainList " + MainList.length + "]");
    } else {
      // console.log("MainList", MainList);

      reject("MainList Failed", null);
    }
  });
}

function FillMain() {
  return new Promise(function(resolve, reject) {
    MainList.find({}, function(err, ids) {
      // console.log('ids', ids.length);

      if (ids.length != 0) {
        ids.forEach(function(i) {
          // console.log('i', i);
          // console.log('i.item', i.item);
          // console.log('i.type', i.type);

          const mulval = {
            name: i.name,
            createdDate: i.createdDate,
            checkedDate: i.checkedDate,
            closed: i.closed,
            listitem: i.listitem
            // {
            //   item: String,
            //   qty: Number
            // }
          }
          // console.log('mulval', mulval);

          mainlist.push(mulval);
        });
        mainlist.sort();
        // console.log('typeList' + typeList);
        resolve(null, 'mainlist ' + mainlist);
      } else {
        // console.log('typeList', "Failed");
        reject("mainlist Failed " + ids.length, null);
      }
    });
  });
}

function FillItem() {
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

          itemList.push(mulval);
        });
        itemList.sort();
        // console.log('typeList' + typeList);
        resolve(null, 'itemList ' + itemList);
      } else {
        // console.log('typeList', "Failed");
        reject("itemList Failed " + ids.length, null);
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
      DBLoadItem().catch(function(err) {
        if (err) {
          console.log(err);
        }
      });
      DBLoadMainList().catch(function(err) {
        if (err) {
          console.log(err);
        }
      });
    }
  }).then(function(err, msg) {
    if (err) {
      console.log("err", err);
    } else {
      FillItem().catch(function(err) {
        if (err) {
          console.log(err);
        }
      });
      FillMain().catch(function(err) {
        if (err) {
          console.log(err);
        }
      });
    }
  }).catch(function(err) {
    if (err) {
      console.log("err", err);
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
app.get("/error", function(req, res) {
  res.render("error.ejs", {
    title: "Bock-b-gock",
    button: false,
    buttonLink: "",
    buttonTitle: "",
  });
});

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

app.post("/itemlist", function(req, res) {
  const selection = req.body.title;
  if (selection.length <= 1) {
    ResError(res, "Alert", "Title " + selection + " is too short", "/title");
    // alert("Title " + selection + " is too short");
    // res.redirect("/title");
  } else {
    console.log("selection", selection);

    MainList.find({
      name: selection
    }, function(err, ids) {
      if (ids.length != 0) {
        alert("List already exists with that Title");
        // todo: test with a redirect
      } else {
        newTitle = selection;
        res.redirect("/itemselectionlist");
      }
    });
  }
});

app.get("/itemselectionlist", function(req, res) {
  if (newTitle.length > 0) {
    res.render("list.ejs", {
      title: newTitle,
      button: true,
      buttonLink: "/menu",
      buttonTitle: "Back",
      badgelist: null,
      useChecked: true,
      list: itemList
    });
  }
});

app.get("/activelist", function(req, res){
  console.log("mainlist.length", mainlist.length);
  if(mainlist.length > 0){
    // display list
    res.render("list.ejs", {
      title: "Shopping List",
      button: true,
      buttonLink: "/menu",
      buttonTitle: "Back",
      badgelist: null,
      useChecked: true,
      list: mainlist
    });
  } else {
    // alert no lists found
    ResError(res, "Alert", "No Active Lists", "/menu");
  }
});

app.get("/list", function(req, res) {
  // if (req.isAuthenticated()){
  //   res.render("/secrets");
  // } else {
  //   res.render("/login");
  // }
  var nt = "Bee-gock!";
  var bl = null;
  var il = null;

  if(newTitle.length > 0){
    nt = newTitle;
  }

  if(listItem.length > 0){
    bl = listItem;
  }

  if(itemList.length > 0){
    il = itemList;
  }


  res.render("list.ejs", {
    title: nt,
    button: true,
    buttonLink: "/menu",
    buttonTitle: "Back",
    badgelist: bl,
    useChecked: true,
    list: il
  });
});

app.post('/add', function(req, res) {
  const selection = req.body.checkbox;

  if (selection.length > 0) {
    itemList.find(function(found) {
      console.log("selection", selection);

      if (found._id == selection) {
        found.checked = true;
        itemToAdd = found.item;
        res.redirect("/quantity");
      } else {
        console.log("ADD", "didnt find it");
        // res.redirect("/list");
      }
    });
  // } else {
  //   res.redirect("/list");
  }
});

app.get("/quantity", function(req, res) {
  // if (itemToAdd.length > 0) {
  res.render("quantity.ejs", {
    title: itemToAdd,
    button: true,
    buttonLink: "/menu",
    buttonTitle: "Back",
    item: itemToAdd
  });
  // } else {
  //   res.redirect("/error");
  // }
});

app.post("/newItem", function(req, res) {
  const qty = req.body.title;

  console.log("qty", qty);

  if (qty > 0) {

    // make entity to add to list
    const addvar = {
      item: itemToAdd,
      quantity: qty
    }

    listItem.push(addvar);

  } else {
    console.log("Quantity was to low");
    alert("Quantity of " + qty + " was too low");
  }
  // call redirect back to full list
  res.redirect("/list");
});

const ResError = function(res, title, message, backlink) {
  res.render("alert.ejs", {
    title: title,
    button: true,
    buttonLink: backlink,
    buttonTitle: "Okay",
    error: message
  });
}

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

// app.post('/:something', function(req, res) {
//   const customListName = req.params.something;
//   const selection = req.body.title;
//
//   console.log("customListName", customListName);
//   console.log("selection", selection);
//
//   switch (customListName) {
//     // case "newtitle":
//     //   title = selection;
//     //   break;
//     default:
//   }
// });

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
