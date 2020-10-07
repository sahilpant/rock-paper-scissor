import * as mongoose from 'mongoose'

export interface History extends mongoose.Document{
    
    Player_1:string,

    Player_2:string,

    Result_1:{
        Player_1:{
              Card_Type:String,
              Card_No:Number
        },
        Player_2:{
              Card_Type:String,
              Card_No:Number
        }
    },
  
    Result_2:{
        Player_1:{
              Card_Type:String,
              Card_No:Number
        },
        Player_2:{
              Card_Type:String,
              Card_No:Number
        }
    },

    Result_3:{
        Player_1:{
              Card_Type:String,
              Card_No:Number
        },
        Player_2:{
              Card_Type:String,
              Card_No:Number
        }
    },
    
    Game_Id:string,
    
    Total_Rounds:number,

    Type_Of_Game:string,

    Start_Date:Date,

    End_Date:Date,

    Status:string,

    Last_Updated_Date:Date

}