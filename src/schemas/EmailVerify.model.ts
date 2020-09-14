import * as mongoose from "mongoose";

export const EmailVerify = new mongoose.Schema({
      
      name:{
          type:String,
          required:true
        },
      
      key:{
          type:String,
          required:true
        },
    

})