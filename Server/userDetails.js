const mongoose=require("mongoose")
const userDetailsSchema = new mongoose.Schema({
    name:String,
    emailid:{type:String, unique:true},
    phoneno:String,
    password:String,
},
{
    collection:"users"
})

mongoose.model("users", userDetailsSchema)
