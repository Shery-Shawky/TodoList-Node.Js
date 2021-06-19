const express = require('express')
const http = require('http');
const fs = require('fs');
const low = require('lowdb')

const app = express()
const port = 4000
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const FileSync = require('lowdb/adapters/FileSync');
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');
const adapter = new FileSync('db.json')
const db = low(adapter)
let file = fs.readFileSync('db.json','utf-8');
let jsonfile=JSON.parse(file);

app.get('/', (req, res) => {
  res.status(200).send('Hello World')
})

//1 HTTP Method

app.get('/todos', (req, res) => {
            res.json(jsonfile);
});

//2 Return list of todos for certain username
app.get('/todos/:username', (req, res) => { 
    const username = req.params.username;
    if(username)
    {
        res.json(db.get('todo').filter({title:username}).value() ) 
    }else{
        res.send("this is no exist")
    }
});
//3 Accepts title, username

app.post('/todos', (req, res) => {  
    console.log(req.body)
    var x = db.get('todo').value()    
    console.log(x.length);    
    inc=x.length
  
    let y = db.get('todo')
    .find({ id:1 })
    .value()

    let statusOptions = ["to-do", "inprogress", "done"];
    let isin = statusOptions.includes(req.body.status);    
    console.log(req.body.status)
    console.log(isin)
    let flag =0;
    for(var i =0; i<jsonfile.usernames.length;i++)        
    {
      if(  jsonfile.usernames[i].username===req.body.username)
      {
          flag=1;
          break;
      }

    }

    if(jsonfile.usernames[i].logged===true && flag==1) 
    {
    if(isin){
    if(!y)  
    {
    db.get('todo')
    .push({ id:1, username:req.body.username,status:req.body.status , title: req.body.title , body:req.body.body})
    .write()
    res.send('myTodo is added');
    }
    else{
      db.get('todo') 
      .push({ id:inc+1, username:req.body.username,status:req.body.status , title: req.body.title , body:req.body.body})
      .write()
      res.send('myTodo is added');

    }
  }
  else {
    res.send("please add status from 'to-do', 'in progress' or 'done'")
  }
}
else
{
    res.send('you are not logged in');
}
});

//4 Delete the todo with selected id
app.delete('/todos/:id', (req, res) => { 
    const id = req.params.id;


    let g =db.get('usernames').filter({logged:true}).value()     
    console.log(g[0].username)
    let m = db.get('todo').filter({username:g[0].username}).value()
    console.log(m)
    let flag =0;
    for(let i =0; i<m.length;i++){
        if(m[i].id ===Number(id) )
        {
            flag =1
        }
    }
    if(flag===1)
    {
    db.get('todo')                     
    .remove({ id: Number(id) })
    .write() 
    res.send("todo deleted succ")
    }
    else{
        res.send("you don't own this todo")
    }
});

//5 - Edit the todo with the selected id 

app.patch('/todos/:id', (req, res) => {
  
    let [title, status,body] = [ req.body.title,req.body.status,req.body.body ]


    
    let g =db.get('usernames').filter({logged:true}).value()      
    console.log(g[0].username)
    let m = db.get('todo').filter({username:g[0].username}).value()
    console.log(m)
    let flag =0;
    for(let i =0; i<m.length;i++){
        if(m[i].id ===Number(id) )
        {
            flag =1
        }
    }
    if(flag===1)
    {

    if( db.get('todo').find({ id:Number(req.params.id) }))      
    {
    if (title) {
        db.get('todo')
            .find({ id:Number(req.params.id) })
            .set('title', title)
            .set('body' , body)
            .write()
            res.send("updated successfully")

    }
    if (status) {
        db.get('todo')
            .find({ id:Number(req.params.id) })
            .set('status', status)
            .set('body' , body)
            .write()
            res.send("updated successfully")
    }
    else{res.send(" these id isn't exist")}
}
}
else{
    res.send("you don't own this todo")
}

});

//bouns register
app.post('/reg', (req, res) => {
    db.defaults({ todo: [],usernames: [] })
  .write()

    console.log(req.body)
    var x = db.get('usernames').value()     
    console.log(x.length);    
    inc=x.length

    let y = db.get('usernames')
    .find({ id:1 })
    .value()
    
    
    if(!y)
    {                                                              
    db.get('usernames')
    .push({ id:1, username:req.body.username,password:req.body.password , logged: false })
    .write()
    res.send('you are succ reg');
    }
    else{
      db.get('usernames')
      .push({ id:inc+1,  username:req.body.username,password:req.body.password , logged: false })
      .write()
      res.send('you are succ reg');
    }
  
});

//bouns login
app.post('/login', (req, res) => {

    let flag =0;
    console.log("username"+req.body.username)
        console.log("pass"+req.body.password)
    for(let i =0; i<jsonfile.usernames.length;i++){
        console.log(jsonfile.usernames[i].username)            
        console.log(jsonfile.usernames[i].password)

        if(
            jsonfile.usernames[i].username===req.body.username
            &&
            jsonfile.usernames[i].password===req.body.password
        )
        {
            flag=1
        }
    }
    if(flag==1)
    {
            db.get('usernames')
            .find({ logged: true })                              
            .set('logged', false)
            .write()

        db.get('usernames')
        .find({ username:req.body.username })           
        .set('logged', true)
        .write()
        res.send("login is sucessfully")
    }
    else{
        res.send('wrong username or pass')
    }

});

app.use((req,res,next)=>{
    const now = new Date();
    console.log({method:req.method,now,url:req.url})
})


app.use((req,res,next)=>{
  res.status(404)
  res.send({error:"internal server error"})
})




app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

 