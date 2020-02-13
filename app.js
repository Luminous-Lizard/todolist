//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(__dirname + "/date.js");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Admin-JJ:ZPWhYSiqJDxHdnQy@jj-ilskt.mongodb.net/test?retryWrites=true&w=majority/todolistDB", {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  // useFindAndModify: false
});


const itemsSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({
  name: "Welcome To Your todo List"
});
const item2 = new Item({
  name: "Press + to add a new item"
});
const item3 = new Item({
  name: "<--- Press here to delete item"
});
const item4 = new Item({
  name: "To create new list, enter /'list name' after current adress bar"
});

let defaultItems = [item1, item2, item3, item4];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  // const day = date.getDate();
  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("success");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }
  });
});

app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res) {
  const checkedBoxId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.deleteOne({
      _id: checkedBoxId
    }, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("succes!");
        res.redirect("/");
      }

    });
  } else {
      List.findOneAndUpdate({name: listName}, {$pull: {items: {_id : checkedBoxId}}}, function (err, foundList){
        if (!err){
          res.redirect("/" + listName);
        }
      });
  }
});

app.get("/:newListName", function(req, res) {
  const newListName = _.capitalize(req.params.newListName);
  List.findOne({
    name: newListName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        console.log("Doesn;t excist");
        // create new list
        const list = new List({
          name: newListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + newListName);
      } else {
        console.log("Excists!");
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    }
  });

  const list = new List({
    name: newListName,
    items: defaultItems
  });

  list.save();
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started succesfully");
});
