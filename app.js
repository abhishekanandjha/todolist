const express = require("express");
const bodyParser =require("body-parser");
const mongoose =require("mongoose");
const _ =require("lodash");

const app = express();
app.set('view engine', 'ejs');
mongoose.set("strictQuery", false);
mongoose.connect("mongodb+srv://admin-abhishek:Test123@cluster0.aa3tfbi.mongodb.net/todolistDB");
// mongoose.connect("mongodb://0.0.0.0:27017/todolistDB");


// const items=["Buy Food","Cook Food","Eat Food"];
// const workItems=[];

//new schema
const itemsSchema={
  name:String
};

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//modul construction
const Item= mongoose.model("Item",itemsSchema);
const item1=new Item({
  name:"Welcome to your to do list!"
});
const item2=new Item({
  name:"Hit the + button to add new Items!"
});

const item3=new Item({
  name:"<-- Hit this to delete an item!"
});
const defaultItems=[item1,item2,item3];


const listSchema={
  name: String,
  items: [itemsSchema]
};
const List=mongoose.model("List",listSchema);

app.get("/", function(req,res){
  // res.send("hello");
  Item.find({},function(err,foundItems){
    if(foundItems.length===0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Item added successfully!");
        }
      });
      res.render("/");
    }else{
      res.render('list', {listTitle: "Today", newListItems: foundItems});
    }
  });
});


app.post("/",function(req,res){
  const itemName= req.body.newItem;
  const listName=req.body.list;

  const item=new Item({
    name: itemName
  });


  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+ listName);
    })
  }




});

app.get("/:customListName",function(req,res){
  const customListName=_.capitalize( req.params.customListName);


  List.findOne({name: customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        //create a new list
        const list=new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+ customListName);
      }else{
        //Show an existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });




});


// targeting the work route
app.get("/work",function(req,res){
  res.render("list",{ listTitle: "Today", newListItems: workItems});
});
// targeting about page\
app.get("/about",function(req,res){
  res.render("about");
});
//
// app.post("/work",function(req,res){
//   const item=req.body.newItem;
//   workItems.push(item);
//   res.redirect("/work");
// });

app.post("/delete",function(req,res){
  const checkedItemId= req.body.checkbox;
  const listName=req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        console.log("Item removed successfully!")
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name: listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
   });
  }

});

app.listen(3000, function(){
  console.log("server started on port 3000");
});
