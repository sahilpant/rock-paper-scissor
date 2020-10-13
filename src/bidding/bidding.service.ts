import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { bidDTO, itemtoBeBidDTO } from './itemToBebid.dto';
import { cardBid } from './itemtobebid.interface';
import {detailOfCard} from '../../gameblock'
@Injectable()
export class BiddingService {

    constructor(
                @InjectModel('cardBid') private readonly cardBid:Model<cardBid> 
    ){}

  async buyItem({biddername,cardid,price}:bidDTO){
        
    let cardinBidDB = await this.cardBid.findOne({cardid:cardid})

    if(cardinBidDB)
    {
      var key = biddername; 
      var object = {}; 
      object[key] = price; 
      console.log(object);
      
      cardinBidDB.currentBids.push(object)
      await cardinBidDB.save()
    }
  }

  async getall(){
    return this.cardBid.find({sold:false})
  }
  
  async sellItem(itemtoBid:itemtoBeBidDTO){
       let carddetail = await detailOfCard(itemtoBid.cardid);  // detailofcard is the blockchain function to fetch the detail of a specific token id 
		
	
		  	console.log(carddetail+"   "+carddetail[0]+"   "+carddetail[1]);

		  	let givenCardType: string

      
        (carddetail[0] === "1")?(givenCardType="ROCK"):(
									(carddetail[0] === "2")?(givenCardType="PAPER"):(
																		(carddetail[0] === "3")?(givenCardType = "SCISSOR"):givenCardType="none"))
				try{
          if(givenCardType !== "none"){
          const item = new this.cardBid()
          item.user_details = itemtoBid.username
          item.cardid = itemtoBid.cardid
          item.cardtype = givenCardType
          item.setbidprice = itemtoBid.price
  
          await item.save();
          }
        }	
        catch(err){
          return new BadRequestException("card is not valid")
        }
        
  }

}
