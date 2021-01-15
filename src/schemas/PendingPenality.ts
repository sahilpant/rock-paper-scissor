import * as mongoose from  'mongoose';
export const match =new mongoose.Schema({
    
    gameid:{type:String},
    publickey:{type:String},
    status:{type:String},
    
 })