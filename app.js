//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const session = require("express-session");
const passportLocalMongoose = require("passport-local-mongoose");
// const _ = require('lodash');
const mongoose = require("mongoose");

const DB = require(__dirname + "/data.js");

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

// var fs = require('fs');
// var util = require('util');
// var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'w'});
// var log_stdout = process.stdout;

// console.log = function(d,e,f) { //
//   log_file.write('************************\n');
//   var enchilda = d;
//   if(e && f) {
//     enchilda += e + f;
//   } else if(e) {
//     enchilda += e;
//   }
//   log_file.write(util.format(enchilda) + '\n');
//   log_stdout.write(util.format(enchilda) + '\n');
// };

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

const viewState = [];
// {
// page:
// title:
// alert:
// btOne = {
//     button:
//     buttonLink:
//     buttonTitle:
// }
// btOne = {
//     button:
//     buttonLink:
//     buttonTitle:
// }
// bdList:
// List:
// }

// all to add an item
var CurrTitle = "";
var CurrBadge = [];
var CurrList = [];
var TempBadge = [];

var ListOLists = [];

//**********************************************************************
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Site Started Started Successfully");
  DB.BeginServer();
});

//**********************************************************************
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
  //   if(err){************************************************
  //     console.log(err);
  //     res.redirect("/register");
  //   }else {
  //     passport.authenticate("local")(req, res, function() {
  //       res.redirect("/secrets");
  //     });
  //   }
  // });*********************************************************
});

//**********************************************************************
// comes from: <GOING TO CHANGE>.EJS
// goes to: MENU.EJS
// gets info: NONE
app.all("/menu", function(req, res) {

  CurrTitle = "";
  CurrBadge.length = 0;
  CurrList.length = 0;
  TempBadge.length = 0;

  const page = {
    page: "menu.ejs",
    title: "Menu",
    alert: "",
    btOne: {
      button: false,
      buttonLink: "",
      buttonTitle: ""
    },
    btTwo: {
      button: false,
      buttonLink: "",
      buttonTitle: ""
    },
    useChecked: false,
    bdList: null,
    List: null
  }

  res.render("menu.ejs", {
    pInfo: page
  });
});
//**********************************************************************
// comes from: MENU.EJS
// goes to: TITLE.EJS
// gets info: NONE
app.all("/title", function(req, res) {
  const page = {
    page: "title.ejs",
    title: "Title",
    alert: "",
    btOne: {
      button: true,
      buttonLink: "/menu",
      buttonTitle: "Back"
    },
    btTwo: {
      button: false,
      buttonLink: "",
      buttonTitle: ""
    },
    useChecked: false,
    bdList: null,
    List: null
  }
  // console.log("title", page);
  res.render("title.ejs", {
    pInfo: page
  });
});
// comes from: TITLE.EJS
// goes to: LIST.EJS
// gets info: CurrTitle - current title of new list
app.post("/title/itemlist", function(req, res) {
  const selection = req.body.title;

  if (selection.length > 0) {
    CurrList = DB.itemL.slice();

    DB.Lists.find({
      name: selection
    }, function(err, ids) {
      if (ids.length != 0) {
        // todo: test with a redirect
      } else {
        CurrTitle = selection;
        const page = {
          page: "list.ejs",
          title: selection,
          alert: "",
          btOne: {
            button: true,
            buttonLink: "/menu",
            buttonTitle: "Back"
          },
          btTwo: {
            button: false,
            buttonLink: "",
            buttonTitle: ""
          },
          useChecked: true,
          bdList: null,
          List: CurrList
        }
        // console.log("itemlist", page);
        res.render("list.ejs", {
          pInfo: page
        });
      }
    });
  }
});
// comes from: LIST.EJS
// goes to: QUANTITY.EJS
// gets info: Item to add - edits CurrList.checked
app.post('/item/add', function(req, res) {
  const selection = req.body.checkbox;
  var title = "";

  if (selection.length > 0) {
    if (CurrList != null) {
      CurrList.find(function(found) {
        if (found._id.toString() === selection) {
          found.checked = true;
          newvar = {
            itemID: found._id,
            item: found.item,
            quantity: 0,
            type: found.type
          }
          TempBadge = newvar;
          title = found.item;

          const page = {
            page: "quantity.ejs",
            title: title,
            alert: "",
            btOne: {
              button: true,
              buttonLink: "back",
              buttonTitle: "Back"
            },
            btTwo: {
              button: false,
              buttonLink: "",
              buttonTitle: ""
            },
            useChecked: false,
            bdList: null,
            List: CurrList
          }
          // console.log("add", page);
          res.render("quantity.ejs", {
            pInfo: page
          });
        }
      });
    }
  }
  // console.log(selection + " not found");
});
// comes from: QUANTITY.EJS
// goes to: LIST.EJS
// gets info: Make badge+list,
app.post("/item/newItem", function(req, res) {
  const qty = req.body.title;

  if (qty > 0) {
    // const tv = CurrBadge[CurrBadge.length - 1];
    TempBadge.quantity = qty;
    CurrBadge.push(TempBadge);

    // console.log("add-TempBadge", TempBadge);
    // console.log("add-badge", tv);

    TempBadge = [];
    // TempBadge.item= "";
    // TempBadge.quantity= 0;
    // TempBadge.type= "";

    console.log("add-TempBadge-clear", TempBadge);

    // tv.quantity = qty;

    const page = {
      page: "list.ejs",
      title: CurrTitle,
      alert: "",
      btOne: {
        button: true,
        buttonLink: "/menu",
        buttonTitle: "Back"
      },
      btTwo: {
        button: true,
        buttonLink: "/save/list",
        buttonTitle: "Save"
      },
      useChecked: true,
      bdList: CurrBadge,
      List: CurrList
    }
    // console.log("newitem", page);
    res.render("list.ejs", {
      pInfo: page
    });
  }
});
// comes from: LIST.EJS
// goes to: LIST.EJS
// gets info: Saves the whole list
app.all("/save/list", function(req, res) {
  console.log("CurrBadge", CurrBadge);
  DB.Save(CurrTitle, CurrBadge).then(function(confirm) {
    console.log("savelist-confirm", confirm);
  }).catch(function(err) {
    if(err){
      console.log("/save/list", err);
    }
  });
  CurrTitle = "";
  CurrBadge.length = 0;
  CurrList.length = 0;
  res.redirect("/menu");
});
//**********************************************************************
// comes from: MENU.EJS
// goes to: ALTLIST.EJS
// gets info: None
app.get("/activelist", function(req, res) {
  ListOLists.length = 0;

  if (DB.mainL.length > 0) {
    DB.mainL.forEach(function(i) {
      ListOLists.push(i.name);
      // console.log("i.name", i.name);
    });
    const page = {
      page: "altlist.ejs",
      title: "Shopping List",
      alert: "",
      btOne: {
        button: true,
        buttonLink: "/menu",
        buttonTitle: "Back"
      },
      btTwo: {
        button: true,
        buttonLink: "/save/refresh",
        buttonTitle: "Refresh"
      },
      useChecked: false,
      bdList: null,
      List: ListOLists
    }
    viewState.push(page);
    res.render("altlist.ejs", {
      pInfo: page
    });
  } else {
    // alert or error
  }
});
// comes from: ALTLIST.EJS
// goes to: LIST.EJS
// gets info: None
app.get("/lists/:which", function(req, res) {
  const which = req.params.which;
  CurrTitle = which;
  DB.mainL.find(function(idx) {
    CurrList = idx.listitem.slice();

    if (idx.name === which) {
      const page = {
        page: "list.ejs",
        title: CurrTitle,
        alert: "",
        btOne: {
          button: true,
          buttonLink: "/menu",
          buttonTitle: "Back"
        },
        btTwo: {
          button: true,
          buttonLink: "/list/edit",
          buttonTitle: "Edit"
        },
        useChecked: false,
        bdList: null,
        List: CurrList
      }
      res.render("list.ejs", {
        pInfo: page
      });
    }
  });
});
// comes from: ALTLIST.EJS
// goes to: LIST.EJS
// gets info: None
app.get("/list/edit", function(req, res) {
  DB.mainL.find(function(idx) {
    if (idx.name === CurrTitle) {

      const templist = DB.itemL.slice();
      templist.forEach(function(cl) { // full list
        idx.listitem.forEach(function(bdg) { // list from selection (Badge)
          if (bdg.item === cl.item) {
            cl.checked = true; // set those in main list to checked
          }
        });
      });

      CurrList = templist;
      CurrBadge = idx.listitem;

      const page = {
        page: "list.ejs",
        title: CurrTitle,
        alert: "",
        btOne: {
          button: true,
          buttonLink: "#",// back to list display
          buttonTitle: "Back"
        },
        btTwo: {
          button: true,
          buttonLink: "#",// this gets called somewhere else, but needs to update, new function?
          buttonTitle: "Save"
        },
        useChecked: true,
        bdList: CurrBadge,
        List: CurrList
      }
      res.render("list.ejs", {
        pInfo: page
      });
    }
  });
});

app.post('/item/remove', function(req, res) {
  const selection = req.body.badge;
  console.log("selection", selection);
});

app.get("/save/refresh", function(req, res) {
  DB.RefreshServer();
  if (DB.mainL.length > 0) {
    DB.mainL.forEach(function(i) {
      ListOLists.push(i.name);
      // console.log("i.name", i.name);
    });
  }

  res.redirect("back");
});

app.get("/error/alert", function(req, res) {
  buttonTwo.button = false;

  res.render("alert.ejs", {
    title: alertTitle,
    buttonOne: buttonOne,
    buttonTwo: buttonTwo,
    alert: alertMessage
  });
});

app.post('/list/sortMe', function(req, res) {
  const col = req.body.title;
  // console.log("col", col);

  switch (col) {
    case "1":
      itemList.sort(function(a, b) {
        if (a.item < b.item) {
          return -1;
        }
        if (a.item > b.item) {
          return 1;
        }
        return 0;
      });
      break;
    case "2":
      itemList.sort(function(a, b) {
        if (a.type < b.type) {
          return -1;
        }
        if (a.type > b.type) {
          return 1;
        }
        if (a.item < b.item) {
          return -1;
        }
        if (a.item > b.item) {
          return 1;
        }
        return 0;
      });
      break;
      // default:
  }
  res.redirect("back");
});
