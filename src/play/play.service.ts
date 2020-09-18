import { Injectable, BadRequestException } from '@nestjs/common';
import { Model } from 'mongoose';
import { user } from 'src/required/interfaces/user.interface';
import { InjectModel } from '@nestjs/mongoose';
import { passkey } from 'src/required/interfaces/passkey.interface';
import {Transfer,burn} from '../../gameblock'
@Injectable()
export class PlayService {

  private obj_deployed_addresses = {
    gameContractAddress : '0x02BABFb7293c502A3BE6f3bfEbbd71bfB3B46eC9',
    nftContractAddress : '0x94E3AcDeed5780B002c1C141926f6605704c5ef8',
    starsContractAddress : '0x0A27A7370D14281152f7393Ed6bE963C2019F5fe',
  }

     constructor(
                 @InjectModel('user') private readonly user:Model<user>,
      
                 @InjectModel('passkey') private readonly passkey:Model<passkey>,){}

    async play(gameid:string,)
{
          var ans=0;

          let game=await this.passkey.find().where('gameid').equals(gameid).exec()

          const player1address = game[0].player1address

          const player2address = game[0].player2address

          const card1=game[0].card1

          const card2=game[0].card2
          
          console.log(gameid+" "+card1+"  "+card2)
          
          const user1=game[0].user1
          
          const user2=game[0].user2

          const token1=game[0].token1

          const token2=game[0].token2
         

          // //two flags to check whether minimum no. of cards to play the round is there or not
          // let user1flag=false,user2flag=false
          
          // const user1Cards = await this.user.find().where('username').equals(user1).exec()

          // if(card1 === "PAPER" && user1Cards[0].cards.PAPER.length>0)  //use .length here
          // {
          //    user1Cards[0].cards.PAPER.length--;
          
          //    user1flag=true;
          // }
          // else
          // {
          //   if(card1 === "ROCK" && user1Cards[0].cards.ROCK.length>0){
            
          //     user1Cards[0].cards.ROCK.length--
            
          //     user1flag=true;
          //   }
          //   else if(card1 === "SCISSOR" && user1Cards[0].cards.SCISSOR.length>0){
            
          //     user1Cards[0].cards.SCISSOR.length--
            
          //     user1flag=true; 
           
          //   }
          
          // }

          // const user2Cards = await this.user.find().where('username').equals(user2).exec()

          // if(card2 === "PAPER" && user2Cards[0].cards.PAPER.length>0)
          // {
          
          //   user2Cards[0].cards.PAPER.length--
          
          //   user2flag=true;
        
          // }
        
          // else
          // {
           
          //   if(card2 === "ROCK" && user2Cards[0].cards.ROCK.length>0){
           
          //     user2Cards[0].cards.ROCK.length--;
           
          //     user2flag=true;
          //   }
           
          //   else if(card2 === "SCISSOR" && user2Cards[0].cards.SCISSOR.length>0){
            
          //     user2Cards[0].cards.SCISSOR.length--;
              
          //     user2flag=true;
          //   }
          
          // }
          
          // if(user1flag && user2flag){
           
          //   await user1Cards[0].save()  //we are decrementing the card of user after blocking them
           
          //   await user2Cards[0].save()  // here we can use block function block both users cards to admin account
           
          //   let arrOfCards=`[${card1},${card2}]`
           
          //   game[0].moves.push(arrOfCards)

          //   await game[0].save();
          
          // }
          
          // else
          // {
          
          //   throw new BadRequestException("check your cards one or may be both users minimum no. of cards is not there to play game please purchase");
          
          // }
         
          if(!card1.match(card2))  //          if(!card1.match(card2) && user1flag && user2flag)
           {
          
             console.log(card1+" "+card2);

             let arrOfCards=`[${card1},${card2}]`
           
             game[0].moves.push(arrOfCards)

             await game[0].save();
            
             (card1.match("ROCK"))?
             (ans=(card2.match("SCISSOR"))?1:0) : 
             ((card1.match("PAPER")) ? 
             (ans=(card2.match("ROCK"))?1:0) :
             ( (card1.match("SCISSOR"))?(ans=(card2.match("PAPER"))?1:0):ans=-1))
             
             console.log(ans);
             
             if(ans==1){  //user2 defeated
            
              const userno1= await this.user.find().where('username').equals(user1).exec();

              const userno2= await this.user.find().where('username').equals(user2).exec();
            
              game=await this.passkey.find().where('gameid').equals(gameid).exec()
            
              game[0].playerWin.push(game[0].user1)
            
              console.log(user2)
            
              // await burn(token1,this.obj_deployed_addresses.gameContractAddress)

              // await burn(token2,this.obj_deployed_addresses.gameContractAddress)

              // await Transfer(player1address,2,this.obj_deployed_addresses.gameContractAddress)

              userno2[0].stars--
            
              userno1[0].stars++   //we can use star transfer function here
            
              await userno1[0].save();

              await userno2[0].save();
            
              game[0].card1="empty"
            
              game[0].card2="empty"
            
              await game[0].save()
            
              return game[0].user1
            
            }
            
            else if(ans==0){  //user1 defeated
              
              const userno1= await this.user.find().where('username').equals(user1).exec();

              const userno2= await this.user.find().where('username').equals(user2).exec();
            
              game=await this.passkey.find().where('gameid').equals(gameid).exec()
            
              game[0].playerWin.push(game[0].user2)
            
              console.log(user1)

              // await burn(token1,this.obj_deployed_addresses.gameContractAddress)

              // await burn(token2,this.obj_deployed_addresses.gameContractAddress)

              // await Transfer(player2address,2,this.obj_deployed_addresses.gameContractAddress)
            
              userno2[0].stars++
            
              userno1[0].stars--   //we can use star transfer function here
            
              await userno1[0].save();

              await userno2[0].save();
            
              game[0].card1="empty"
            
              game[0].card2="empty"


            
              await game[0].save()
            
              return game[0].user2
            
            }
            
            game[0].playerWin.push("tie")

             let arrOfCard=`[${card1},${card2}]`
           
             game[0].moves.push(arrOfCard)

             await game[0].save();
            

            // await burn(token1,this.obj_deployed_addresses.gameContractAddress)

            // await burn(token2,this.obj_deployed_addresses.gameContractAddress)
            
            // await Transfer(player1address,1,this.obj_deployed_addresses.gameContractAddress)

            // await Transfer(player2address,1,this.obj_deployed_addresses.gameContractAddress)

            game[0].card1="empty"
            
            game[0].card2="empty"
            
            await game[0].save()
            
            return "game is draw"
           
          }
          
          else    //else if(user1flag && user2flag)
          {
          
            game[0].playerWin.push("tie")

            let arrOfCard=`[${card1},${card2}]`
           
             game[0].moves.push(arrOfCard)

             await game[0].save();
             
            // await Transfer(player1address,1,this.obj_deployed_addresses.gameContractAddress)

            // await Transfer(player2address,1,this.obj_deployed_addresses.gameContractAddress)
          
            game[0].card1="empty"
          
            game[0].card2="empty"
          
            await game[0].save()
          
            return "game is draw"
          
          }
       
        }
    
}
