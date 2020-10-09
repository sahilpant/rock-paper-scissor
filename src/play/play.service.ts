import { Injectable, BadRequestException } from '@nestjs/common';
import { Model } from 'mongoose';
import { user } from 'src/required/interfaces/user.interface';
import { InjectModel } from '@nestjs/mongoose';
import { passkey } from 'src/required/interfaces/passkey.interface';
// import {Transfer,burn} from '../../gameblock'
@Injectable()
export class PlayService {

  // private obj_deployed_addresses = {
  //   gameContractAddress : '0x02BABFb7293c502A3BE6f3bfEbbd71bfB3B46eC9',
  //   nftContractAddress : '0x94E3AcDeed5780B002c1C141926f6605704c5ef8',
  //   starsContractAddress : '0x0A27A7370D14281152f7393Ed6bE963C2019F5fe',
  // }

     constructor(
                 @InjectModel('user') private readonly user:Model<user>,
      
                 @InjectModel('passkey') private readonly passkey:Model<passkey>,){}

    async play(gameid:string,)
{
          var winner = 0;  //0 if draw and 1 for user1 win and 2 for user2 win

          let game=await this.passkey.findOne().where('gameid').equals(gameid).exec()

          // const player1address = game[0].player1address

          // const player2address = game[0].player2address
          const card1 = game.card1

          const card2 = game.card2
          
          console.log(gameid+" "+card1+"  "+card2)
          
          const user1 = game.user1
          
          const user2 = game.user2

          const token1 = game.token1

          const token2 = game.token2
  
          console.log(card1+" "+card2);

          let arrOfCards=`[${card1}:${token1},${card2}:${token2}]`
           
          game.moves.push(arrOfCards)

          await game.save();


          if(card1 === card2)
          {}
    
          else
          {
            if( (card1 === "ROCK" && card2 === "SCISSOR") || (card1 === "PAPER" && card2 === "ROCK") || (card1 === "SCISSOR" && card2 === "PAPER") ){
                winner = 1;
            }
            else{
                winner = 2;
            }
        }
           
             
          console.log(winner);   
           
          if(winner === 1){  //user2 defeated
            
              const userno1 = await this.user.findOne().where('username').equals(user1).exec();
            
              game=await this.passkey.findOne().where('gameid').equals(gameid).exec()
            
              game.playerWin.push(game.user1)
            
              console.log(user2+" is defeated ")
            
              // await burn(token1,this.obj_deployed_addresses.gameContractAddress)

              // await burn(token2,this.obj_deployed_addresses.gameContractAddress)

              // await Transfer(player1address,2,this.obj_deployed_addresses.gameContractAddress)

              // userno2[0].stars--
            
              userno1.stars+= 2   //here stars are removed from admin account also
            
              await userno1.save();
            
              game.card1="empty"
            
              game.card2="empty"

              game.card1played = false

              game.card2played = false
            
              await game.save()
            
              return game.user1
            
            }
            
            else if(winner === 2){  //user1 defeated
              

              const userno2 = await this.user.findOne().where('username').equals(user2).exec();
            
              game = await this.passkey.findOne().where('gameid').equals(gameid).exec()
            
              game.playerWin.push(game.user2)
            
              console.log(user1+" is defeated ")

              // await burn(token1,this.obj_deployed_addresses.gameContractAddress)

              // await burn(token2,this.obj_deployed_addresses.gameContractAddress)

              // await Transfer(player2address,2,this.obj_deployed_addresses.gameContractAddress)
            
              userno2.stars+= 2  //here stars are removed from admin account also
            
              // userno1[0].stars--   //we can use star transfer function here

              await userno2.save();
            
              game.card1="empty"
            
              game.card2="empty"

              
             game.card1played = false

             game.card2played = false
            
              await game.save()
            
              return game.user2
            
            }
            const userno1 = await this.user.findOne().where('username').equals(user1).exec();

            const userno2 = await this.user.findOne().where('username').equals(user2).exec();

            userno1.stars++;

            userno2.stars++;

            await userno1.save();

            await userno2.save();

            game.playerWin.push("tie")

             await game.save();
            
             game.card1="empty"    
         
             game.card2="empty"

             game.card1played = false

             game.card2played = false
            
             await game.save()
            
             return "game is draw"
           
          }
          
        
       
        
    
}
