//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://harsh04:shikari2004@cluster0.t1lkykf.mongodb.net/todolistDB")

const itemSchema = new mongoose.Schema ({
  name: String
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item ({
  name: "Welcome to your todolist!"
});

const item2 = new Item ({
  name: "Hit the + button to add a new item"
});

const item3 = new Item ({
  name: "<-- Hit this to delete a item"
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema ({
  name: String,
  items: [itemSchema]
});

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

  Item.find({}).then(function(foundItems){

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems)
      .then(function(){
        console.log("Items added successfully");
      })
      .catch(function(err){
        console.log(err);
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
    
  })
  .catch(function(err){
    console.log(err);
  });

});

app.get("/:customListName", function(req ,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName})
  .then(function(foundList){
    if(!foundList){
      //create list
      const list = new List ({
        name: customListName,
        items: defaultItems
      });
    
      list.save();
      res.redirect("/" + customListName);
    } else {
      //showing existing list
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items} )
    }
  })
  .catch(function(err){
    console.log(err);
  });

  
})

app.post("/", function(req, res){

  const newItem = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name: newItem
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName})
    .then(function(foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName)
    })
  }

});

app.post("/delete", function(req, res){
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today") {
    Item.findByIdAndRemove({_id: checkedItem})
    .then(function(){
      console.log("item removed");
      res.redirect("/")
    })
    .catch(function(err){
      confirm.log(err);
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItem}}})
    .then(function(){
      res.redirect("/" + listName);
    });
  }

 
});



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
