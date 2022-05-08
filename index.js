require('dotenv').config()
const express = require('express');
// const jwt = require('jsonwebtoken');
const cors = require('cors');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();

// middleware
//app.use(cors());
app.use(
    cors({
      origin: true,
      optionsSuccessStatus: 200,
      credentials: true,
    })
  );
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.v4zzy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {

    try {
        await client.connect();
        const fruitCollection = client.db('stock').collection('fruit');

    // use jwt
        app.post('/login', (req, res) => {
        const email = req.body;
        const token = jwt.sign(email, process.env.SECRET_KEY)
        res.send({ token });
})


        app.put('/fruits/:id', async (req, res) => {
            const id = req.params.id;
            const updateFruit = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: updateFruit.name,
                    price: updateFruit.price,
                    shortDescription: updateFruit.shortDescription,
                    image: updateFruit.image,
                    quantity: updateFruit.quantity,
                    serviceProvider: updateFruit.serviceProvider,
                    email: updateFruit.email
                }
            }
            console.log(updateFruit);
            const result = await fruitCollection.updateOne(filter, updateDoc, options);
            res.send(result)
        })

        app.delete('/fruits/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await fruitCollection.deleteOne(query);
            res.send(result)
        })


        app.get('/myFruits', async (req, res) => {
            // const decodedEmail = req?.decoded?.email;
            const email = req?.query?.email;
            const query = { userEmail: email };
            
            const cursor = fruitCollection.find(query);
            const fruits = await cursor.toArray();
            res.send(fruits);
            console.log(fruits);

            
            // if (email === decodedEmail) {
                
            // }
            // else {
            //     res.status(403).send({ message: 'Forbidden access' })
            // }
        })

        app.get('/fruits', async (req, res) => {
            const pageNumber = Number(req.query.pageNumber);
            const limit = Number(req.query.limit);
            const count = await fruitCollection.estimatedDocumentCount();
            const query = {};
            const cursor = fruitCollection.find(query);
            const fruits = await cursor.toArray();
            res.send(fruits);
        })


        app.post('/fruits',  async (req, res) => {
            const newItem = req.body;
            const result = await fruitCollection.insertOne(newItem);
            res.send(result);
        })

       

    }
    finally {
        // client.close();
    }

}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log('Backend server running in port', port);
})