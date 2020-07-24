const mongoose = require('mongoose');

const connectdB = async ()=>{
    const conn = await mongoose.connect(process.env.MONGO_URI,{
        useNewUrlParser:true,
        useCreateIndex:true,
        useFindAndModify:false,
        useUnifiedTopology: true
    });
    console.log(`mongo db connected ${conn.connection.host}`);
}
module.exports=connectdB;