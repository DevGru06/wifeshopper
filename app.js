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

app.all("/menu", function(req, res) {

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

function DisplayList(res, dltitle, dlbadgelist, dlitemlist, dlusechecked) {
  // console.log(dlitemlist);
  res.render("list.ejs", {
    title: dltitle,
    buttonOne: buttonOne,
    buttonTwo: buttonTwo,
    badgelist: dlbadgelist,
    useChecked: dlusechecked,
    list: dlitemlist
  });
}

// app.all("/list", function(req, res) {
//   // if (req.isAuthenticated()){***********
//   //   res.render("/secrets");**********
//   // } else {***********
//   //   res.render("/login");*****************
//   // }
//   // var nt = "Bee-gock!";
//
//   // if (newTitle.length > 0) {
//   //   nt = newTitle;
//   // }
//   //
//   // if (listtoAdd.length > 0) {
//   //   badgeList = listtoAdd;
//   // }
//
//   // if (itemList.length > 0) {
//   //   displayList = itemList;
//   // }
//
//   // console.log(displayList);
//
//   res.render("list.ejs", {
//     title: newTitle,
//     buttonOne: buttonOne,
//     buttonTwo: buttonTwo,
//     badgelist: badgeList,
//     useChecked: useChecked,
//     list: displayList
//   });
// });

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
  console.log("title", page);
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
            buttonLink: "/Back",
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
        console.log("itemlist", page);
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

  if (selection.length > 0) {
    if (CurrList != null) {
      CurrList.find(function(found) {
        if (found.item == selection) {
          found.checked = true;
          const addvar = {
            item: found.item,
            quantity: 0,
            type: found.type
          }
          CurrBadge.push(addvar);
        }
      });
    }
    const page = {
      page: "quantity.ejs",
      title: selection,
      alert: "",
      btOne: {
        button: true,
        buttonLink: "/Back",
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
    console.log("add", page);
    res.render("quantity.ejs", {
      pInfo: page
    });
  }
});
// comes from: QUANTITY.EJS
// goes to: LIST.EJS
// gets info: Make badge+list,
app.post("/item/newItem", function(req, res) {
  const qty = req.body.title;

  if (qty > 0) {
    const tv = CurrBadge[CurrBadge.length - 1];
    console.log("add-qty", qty);
    console.log("add-badge", tv);

    tv.quantity = qty;

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
    console.log("newitem", page);
    res.render("list.ejs", {
      pInfo: page
    });
  }
});
// comes from: LIST.EJS
// goes to: LIST.EJS
// gets info: Saves the whole list
app.all("/save/list", function(req, res) {
  // console.log(CurrTitle, CurrBadge);
  DB.Save(CurrTitle, CurrBadge);
  CurrTitle = "";
  CurrBadge.length = 0;
  CurrList.length = 0;
  res.redirect("/menu");
});
//**********************************************************************
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
//**********************************************************************
app.get("/lists/:which", function(req, res) {
  const which = req.params.which;

  DB.mainL.find(function(idx) {
    if (idx.name === which) {
      const page = {
        page: "list.ejs",
        title: which,
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
        List: idx.listitem
      }

      viewState.push(viewState);

      res.render("list.ejs", {
        pInfo: page
      });
    }
  });
});
app.get("/list/edit", function(req, res) {
  DB.mainL.find(function(idx) {
    if (idx.name === newTitle) {

      buttonOne.button = true;
      buttonOne.buttonTitle = "Back";
      buttonOne.buttonLink = "#" // back to list display

      buttonTwo.button = true;
      buttonTwo.buttonTitle = "Save";
      buttonTwo.buttonLink = "#" // this gets called somewhere else, but needs to update, new function?

      console.log("idx.listitem", idx.listitem);

      const templist = DB.itemL;
      templist.forEach(function(cl) {
        idx.listitem.forEach(function(bdg) {
          if (bdg.item === cl.item) {
            console.log("bdg.item", bdg.item);
            cl.checked = true;
          }
        });
      });

      // console.log("idx.listitem", idx.listitem);
      DisplayList(res, newTitle, idx.listitem, templist, true);
    }
  });
});

app.get("/save/refresh", function(req, res) {
  // DBLoadMainList();
  // FillMain();
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
