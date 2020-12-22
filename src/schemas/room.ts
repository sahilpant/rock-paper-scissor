import * as mongoose from  'mongoose';
 export const room =new mongoose.Schema({
   username:{type:String},
   roomID:{type:String}

})