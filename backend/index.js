//mongodb+srv://betigomgom:WinOpfEAaEMSWWQ2@cluster0.oz0nc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
const PORT = 4000; 
const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());




mongoose.connect('mongodb+srv://betigomgom:zEAFCCC3aZYHT9fY@cluster0.oz0nc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('Database is connected'))
  .catch(err => console.log('Database connection error:', err));

app.get('/', (req, res) => {
    res.send('Express app is running');
});


const Users = mongoose.model('User' , {
    name:{
        type:String,
    },
    email:{
        type:String,
        unique:true
    },
    password:{
        type:String,

    },

    cartData:{
        type:Object,
    },

    date:{
        type:Date,
        default:Date.now,

    },

    consommation :{
        type:Number,
        required:false
    }
})



app.post('/signup' , async (req,res) => {
    let check = await Users.findOne({email:req.body.email});
    if (check){
        return res.status(400).json({success:false, error :'existing user with this email'})
    }
    
    const user = new Users ({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,

    })
    await user.save();
    const data = {
        user:{
            id:user.id
        }
    }
    const token = jwt.sign(data,'secret ecomm');
    res.json({success:true,token})
})

app.post('/login', async (req,res) => {
    let user = await Users.findOne({email:req.body.email});
    if(user){
        const comparePass = req.body.password === user.password ;
        if (comparePass){
            const data = {
                user:{
                    id:user.id
                }
            }
            const token = jwt.sign(data,'secret ecomm');
            res.json({success:true,token})

        }else{
            res.json({success:false,error:'wrong password'})
        }
    } else {
        res.json({success:false, error:'wrong email id '})
    }
})


const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).json({ error: 'No token, authorization denied' });
    }
    try {
        const decoded = jwt.verify(token, 'secret ecomm');
        req.user = decoded.user;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token is not valid' });
    }
};
app.post('/deleteUser', async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'ID is required' });
        }

        const result = await Users.findByIdAndDelete(id);

        if (result) {
            console.log('User removed:', result.name);
            res.json({
                success: true,
                name: result.name
            });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error removing user:', error);
        res.status(500).json({ error: 'An error occurred while removing the user' });
    }
});



app.post('/update-consommation', fetchUser, async (req, res) => {
    try {
        const { consommation } = req.body;
        if (!consommation) {
            return res.status(400).json({ error: 'Consommation is required' });
        }

        const userId = req.user.id;
        const user = await Users.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.consommation = consommation;
        await user.save();

        res.json({ success: true, consommation: user.consommation });
    } catch (error) {
        console.error('Error updating consumption:', error);
        res.status(500).json({ error: 'An error occurred while updating the consumption' });
    }
});


app.get('/users', async (req, res) => {
    const users = await Users.find({});
    if (users) {
        console.log('All users', users);
        res.json(users);
    } else {
        console.log('Error, check endpoint');
    }
});






app.listen(PORT, (error) => {
    if (!error) {
        console.log('Server running on port ' + PORT);
    } else {
        console.log('Error:', error);
    }
});