const express = require('express')
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
var jwt = require('jsonwebtoken');
const port = process.env.PORT || 8900;
var cors = require('cors')
require('dotenv').config()
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ioy1chb.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  useNewUrlParser:true,
  useUnifiedTopology:true,
  maxPoolSize:10
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
   await client.connect((err)=>{
if(err){
  console.error(err);
  return;
}
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });

    const database = client.db("doctor");

    const movies = database.collection("doctor_services");
    const movies2 = database.collection("book");
    const verifyjwt=(req,res,next)=>{
        const authorizatiion=req.headers.authorization;
if(!authorizatiion){
  return  res.status(401).send({error:true,message:"Invalid Token"})
}
const token=authorizatiion.split(' ')[1];
jwt.verify(token,process.env.AUTO_GENERATE_KEY, function(err, decoded) {
    if(err){
        return  res.status(403).send({error:true,message:"Invalid Token"})
    }
    req.decoded=decoded
    next();
  });


    }


    app.post('/jwt',(req,res)=>{
const user=req.body;
const token=jwt.sign(user,process.env.AUTO_GENERATE_KEY,{ expiresIn: '2h' });
res.send({token})
    })
    app.get('/Services',async(req,res)=>{
        const database= movies.find();
        const result=await database.toArray();
        res.send(result);
    })
    // app.post('/Services/:id',async(req,res)=>{
    //     const data=req.body;
    //     // const query={_id:new ObjectId(id)};
    //     const result = await movies.insertOne(data);
    //     console.log(result);
    //     res.send(result);
    // })
    app.get('/Services/:id',async(req,res)=>{
      const id=req.params.id;
        const query={_id:new ObjectId(id)};
        const options = {
           
            // Include only the `title` and `imdb` fields in the returned document
            projection: { _id: 1, title: 1, img: 1 ,service_id: 1,price:1},
          };
          const movie = await movies.findOne(query, options);
          res.send(movie);
    })
    app.get('/book',verifyjwt,async(req,res)=>{
        const decod=req.decoded;
        if(decod.email!==req.query.email){
            return  res.status(402).send({error:true,message:"Unauthorize Token"})
        }
        console.log(req.query.email)
        let query={};
        if(req?.query?.email){
query={email:req?.query?.email}
        }
        const result=await movies2.find(query).toArray();
        res.send(result);
    })
    app.post('/book',async(req,res)=>{
const data=req.body;
console.log(data);
const result = await movies2.insertOne(data);
res.send(result);
    })
    app.delete('/book/:id',async(req,res)=>{
        const id=req.params.id;
        console.log(id);
        const query={_id:new ObjectId(id)};
        const result = await movies2.deleteOne(query);
        res.send(result);
    })
    app.patch('/book/:id',async(req,res)=>{
        const id=req.params.id;
        const data=req.body;
        const filter = { _id:new ObjectId(id)};
        const options = { upsert: true };

    // create a document that sets the plot of the movie

    const updateDoc = {

      $set: { status:data.status}

    };
    const result = await movies2.updateOne(filter, updateDoc, options);
    res.send(result);
    })
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})