import * as mongoose from "mongoose";

export const History = new mongoose.Schema({

      Player_1:{type:String},

      Player_2:{type:String},

      Result_1:{
            Player_1:{
                  Card_Type:{type:String},
                  Card_No:{type:Number}
            },
            Player_2:{
                  Card_Type:{type:String},
                  Card_No:{type:Number}
            }
        },
      
        Result_2:{
            Player_1:{
                  Card_Type:{type:String},
                  Card_No:{type:Number}
            },
            Player_2:{
                  Card_Type:{type:String},
                  Card_No:{type:Number}
            }
        },
    
        Result_3:{
            Player_1:{
                  Card_Type:{type:String},
                  Card_No:{type:Number}
            },
            Player_2:{
                  Card_Type:{type:String},
                  Card_No:{type:Number}
            }
        },
      
      Game_Id:{type:String},
      
      Total_Rounds:{type:Number},

      Type_Of_Game:{type:String},

      Start_Date:{type:Date},

      End_Date:{type:Date},

      Status:{type:String},

      Last_Updated_Date:{type:Date}
})