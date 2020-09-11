import * as mongoose from 'mongoose'
import { cards } from './cards.interface';
export interface user extends mongoose.Document{
    username:string
    email:string
    cards:cards
    stars:number
    publickey:string
    lastupdated:Date
    client_id:string
    salt:string
    password:string
}