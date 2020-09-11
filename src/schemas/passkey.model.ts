import * as mongoose from "mongoose";

export const passKey = new mongoose.Schema({
      name:{type:String},
      key:{type:String},
      gameid:{type:String},
      card1:{type:String},
      card2:{type:String},
      user1:{type:String},
      user2:{type:String},
      playerWin:{type:Array}
})