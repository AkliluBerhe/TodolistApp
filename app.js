const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");




const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//create connection to MongoDB atlas database and deploy into a (aws database cloud) 
mongoose.connect("mongodb+srv://admin-aklilu:admin-aklilu@cluster0.jsats.mongodb.net/todolistDB?retryWrites=true&w=majority", { useNewUrlParser: true });

//create schema 
const itemSchema = {
    name: String
};
//create a model using schema
const Item = mongoose.model("Item", itemSchema);
//creat new document
const item1 = new Item({
    name: "Welcome to your todolist"
});
const item2 = new Item({
    name: "Fill the blank and add by pressing + button"
});
const item3 = new Item({
    name: "delete an item by clicking the check box."
});

const defaultItem = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemSchema]
};
const List = mongoose.model("List", listSchema);



let items = ["Buy Food", "Cook Food", "Eat Food"];
let workItems = [];


app.get("/", function (req, res) {
    //Read data
    Item.find({}, function (err, foundItems) {

        if (foundItems.length === 0) {
            //insert data
            Item.insertMany(defaultItem, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Succesfully inserted data!");
                }
            });
            res.redirect("/");
        } else {
            //render the entire data
            res.render("list", { listOfTitle: "Today", newListItems: foundItems });
        }
    });
});

//custome route
app.get("/:customeListName", function (req, res) {
    const customeListName = _.capitalize(req.params.customeListName);
    List.findOne({ name: customeListName }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                //create new list if does not exist
                const list = new List({
                    name: customeListName,
                    items: defaultItem
                });
                list.save();
                res.redirect("/" + customeListName);
            } else {
                //show list if list is exist's
                res.render("list", { listOfTitle: foundList.name, newListItems: foundList.items });

            }
        }
    });
});


//add button post
app.post("/", function (req, res) {

    const itemName = req.body.newItem; // input message 
    const listName = req.body.list; // + button

    const item = new Item({
        name: itemName
    });

    if (listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({ name: listName }, function (err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }
});

//delete button post
app.post("/delete", function (req, res) {
    const checkItemId = req.body.checkbox;
    const listName = req.body.listName;
    //default page
    if (listName === "Today") {
        Item.findByIdAndRemove(checkItemId, function (err) {
            if (!err) {
                console.log("Succesfully deleted checked it.");
                res.redirect("/");
            }
        });
        //custome page
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkItemId } } }, function (err, foundList) {
            if (!err) {
                res.redirect("/" + listName);
            }
        });
    }
});


app.get("/work", function (req, res) {
    res.render("list", { listOfTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
    res.render("about");
});






let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}


app.listen(port, function () {
    console.log("Server is working........");
})