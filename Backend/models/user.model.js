import mongoose from "mongoose";

 const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true,
        min: 3,
        max: 20,
    },
    score:{
        type: Number,
        default: 0,
    }

 })

export default mongoose.model('User', userSchema);