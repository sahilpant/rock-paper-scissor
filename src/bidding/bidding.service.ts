import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { bidDTO, itemtoBeBidDTO } from './itemToBebid.dto';
import { cardBid } from './itemtobebid.interface';
import {detailOfCard} from '../../gameblock'
import { user } from 'src/required/interfaces/user.interface';
@Injectable()
export class BiddingService {

    constructor(
                @InjectModel('cardBid') private readonly cardBid:Model<cardBid>,
                @InjectModel('user') private readonly user:Model<user>
    ){}

  async buyItem({biddername,cardid,price}:bidDTO){
        
    let cardinBidDB = await this.cardBid.findOne({cardid:cardid})

    if(cardinBidDB)
    {
  
      var object = {biddername:biddername,bid:price}; 
      cardinBidDB.currentBids.push(object)
      await cardinBidDB.save()
    }
  }

  async getall(){
    return this.cardBid.find({sold:false})
  }
  
  async sellItem(itemtoBid:itemtoBeBidDTO){
    
    let carddetail = await detailOfCard(itemtoBid.cardid);  // detailofcard is the blockchain function to fetch the detail of a specific token id 


    const _user = await this.user.findOne({ email:itemtoBid.user_email })

    if(_user && (_user.notUsedCards.indexOf(itemtoBid.cardid) != -1)){

      _user.cardForBid.push(itemtoBid.cardid)

      /****************************logic for deleting card from not used cards*********************************/
      let indexofCard = _user.notUsedCards.indexOf(itemtoBid.cardid)
      let x = _user.notUsedCards.slice(0,indexofCard);
      let y = _user.notUsedCards.slice(indexofCard+1);
      y.forEach((element) => x.push(element));
      _user.notUsedCards = x;
      /********************************************************************************************************/

      try {
        await _user.save()
      } catch (error) {
        console.log(error)
      }

      console.log(carddetail+"   "+carddetail[0]+"   "+carddetail[1]);

      let givenCardType: string


      (carddetail[0] === "1")?(givenCardType="ROCK"):(
                (carddetail[0] === "2")?(givenCardType="PAPER"):(
                                  (carddetail[0] === "3")?(givenCardType = "SCISSOR"):givenCardType=null))
      try{
        if(givenCardType){
          const item = new this.cardBid()
          item.user_email = itemtoBid.user_email
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
    else {
      throw new BadRequestException;
    }        
  }
}
