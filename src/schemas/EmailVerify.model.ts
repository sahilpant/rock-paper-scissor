import * as mongoose from "mongoose";

export const EmailVerify = new mongoose.Schema({
      
      email:{
          type:String,
          required:true
        },
      
      key:{
          type:String,
          required:true
        },
    

})