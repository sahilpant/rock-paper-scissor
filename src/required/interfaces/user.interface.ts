import * as mongoose from 'mongoose'
import { cards } from './cards.interface';

export interface user extends mongoose.Document{

    username:string

    email:string

    cards:cards

    usedCards:Array<Number>
    
    notUsedCards:Array<Number>

    stars:number

    publickey:string

    lastupdated:Date

    userinBlockchain:Boolean

    salt:string

    password:string

    role: string

    cardForBid: any

}
