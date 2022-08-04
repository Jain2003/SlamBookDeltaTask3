const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const app = express();

app.use(express.static(__dirname+"/public/"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.connect("mongodb://localhost:27017/userDB");


// schemas
const userSchema = {
  username: String,
  department: String,
  password: String
}

const activeUserSchema = {
  username: String,
  department: String,
}

const searchUserSchema = {
  username: String
}

const commentSchema = {
  commentFor: String,
  comment: String,
  contact: String,
  commentBy: String
}

// documents
const User = new mongoose.model("User", userSchema);

const ActiveUser = new mongoose.model("ActiveUser", activeUserSchema);

const SearchedUser = new mongoose.model("SearchedUser", searchUserSchema);

const Comment = new mongoose.model("Comment", commentSchema);

var activeUsername = "";

var searchedUsername = "";

function myFunc(){
  console.log("no delete till now.");
}
var success = true;

app.get("/", function(req, res) {
  res.render("home");
});

app.get("/login", function(req, res) {
  res.render("login", {
    warning: "Enter your details"
  });
});

app.get("/register", function(req, res) {
  res.render("register", {
    warning: "Enter your details"
  });
});

app.get("/dashboard", function(req, res) {
  res.render("dashboard", {
    activeUser: activeUsername,
    warning: "Comment Here"
  });
});

app.get("/comment", function(req, res) {
  res.render("comment", {
    comments: [],
    func:myFunc(),
    warning: "enter a username in search box."
  })
})


app.post("/", function(req, res) {
  res.render("home");
  ActiveUser.deleteMany(function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log("All activeUsers cleared! Welcome to Digital Slams");
    }
  })
  SearchedUser.deleteMany(function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log("All searched Items cleared.");
    }
  })
})

app.post("/login", function(req, res) {
  if (req.body.username === undefined) {
    res.render("login", {
      warning: "enter your details"
    })
  } else {
    User.findOne({
      username: req.body.username
    }, function(err, foundUser) {
      if (err) {
        console.log(err);
      } else {
        if (foundUser) {
          if (foundUser.password === req.body.password) {
            var activeLogin = new ActiveUser({
              username: req.body.username,
              department: foundUser.department
            });
            activeUsername = req.body.username;
            activeLogin.save(async function(err) {
              if (err) {
                console.log(err);
              } else {
                await res.redirect("/dashboard")
              }
            })
          } else {
            res.render("login", {
              warning: "Wrong Password"
            });
          }
        } else {
          res.redirect("/register");
        }
      }
    })
  }
});

app.post("/register", function(req, res) {
  if (req.body.username === undefined) {
    res.render("register", {
      warning: "enter details"
    })
  } else {
    var newUser = new User({
      username: req.body.username,
      department: req.body.department,
      password: req.body.password
    });
    User.findOne({
      username: req.body.username
    }, function(err, foundUser) {
      if (err) {
        console.log(err);
      } else {
        if (foundUser) {
          console.log(foundUser);
          res.render("register", {
            warning: "username already in use try another."
          });
        } else {
          newUser.save(function(err) {
            if (err) {
              console.log(err);
            } else {
              if (req.body.username != undefined) {
                activeUsername = req.body.username;
                var activeLogin = new ActiveUser({
                  username: req.body.username,
                  department: req.body.department
                });
                activeLogin.save(async function(err) {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log("active User saved");
                    res.redirect("/dashboard");
                  }
                })
              }
            }
          })
        }
      }
    })
  }
});

app.post("/dashboard", function(req, res) {
  if (req.body.commentFor === undefined) {
    console.log(req.body.commentFor);
  } else {
    User.findOne({
      username: req.body.commentFor
    }, function(err, foundUser) {
      if (err) {
        console.log(err);
      } else {
        if (foundUser.length != 0) {
          var newComment = new Comment({
            commentFor: req.body.commentFor,
            comment: req.body.comment,
            contact: req.body.contact,
            commentBy: activeUsername
          });
          newComment.save(function(err) {
            if (err) {
              console.log(err);
            } else {
              res.render("dashboard", {
                activeUser: activeUsername,
                warning: "CommentSaved, click on the comments button to see all the comments, Or comment on ur other friends."
              })
            }
          })
        }
      }
    })
  }
});

app.post("/comment", function(req, res) {
  var commentedBy = req.body.search;
  if (commentedBy == undefined) {
    res.render("comment", {
      comments: [],
      func: myFunc(),
      warning:"Enter a username in search bar."
    })
  } else {
    Comment.find({
      commentBy: req.body.search,
      commentFor: activeUsername
    }, function(err, foundRecordArray) {
      if (err) {
        console.log(err);
      } else {
        console.log(foundRecordArray);
        if (foundRecordArray.length != 0) {
          function deleteFunc(){
            Comment.deleteOne({
              commentBy:foundRecordArray[0].commentBy
            },function(err){
              if(err){
                console.log(err);
              }else{
                console.log(foundRecordArray[0].commentBy);
                console.log("comment deleted");
              }
            })
          }
          res.render("comment", {
            comments: foundRecordArray,
            func: deleteFunc(),
            warning: "Found Records"
          })
        }else{
          console.log("no comments found");
          res.render("comment",{
            comments:foundRecordArray,
            func:myFunc,
            warning:"no  comments found"
          })
        }
      }
    })
  }
})
app.listen(3000, function() {
  console.log("server active and running on port 3000");
});
