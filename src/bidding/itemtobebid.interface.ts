import * as mongoose from 'mongoose'


export interface cardBid extends mongoose.Document{

   
    date:Date

    bidded:boolean
   
    sold:boolean
   
    user_details:string

    cardid:number

    cardtype:string

    setbidprice:number

    currentBids:{}

}
