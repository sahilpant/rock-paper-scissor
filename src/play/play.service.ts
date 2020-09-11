import { Injectable, BadRequestException } from '@nestjs/common';
import { Model } from 'mongoose';
import { user } from 'src/required/interfaces/user.interface';
import { InjectModel } from '@nestjs/mongoose';
import { passkey } from 'src/required/interfaces/passkey.interface';
import { exception } from 'console';

@Injectable()
export class PlayService {

     constructor(
                 @InjectModel('user') private readonly user:Model<user>,
      
                 @InjectModel('passkey') private readonly passkey:Model<passkey>,){}

    async play(gameid:string)
{
          var ans=0;

          let game=await this.passkey.find().where('gameid').equals(gameid).exec()

          const card1=game[0].card1

          const card2=game[0].card2
          
          console.log(gameid+" "+card1+"  "+card2)
          
          const user1=game[0].user1
          
          const user2=game[0].user2
         

          //two flags to check whether minimum no. of cards to play the round is there or not
          let user1flag=false,user2flag=false
          
          const user1Cards = await this.user.find().where('username').equals(user1).exec()

          if(card1 === "PAPER" && user1Cards[0].cards.PAPER>0)
          {
             user1Cards[0].cards.PAPER--;
          
             user1flag=true;
          }
          else
          {
            if(card1 === "ROCK" && user1Cards[0].cards.ROCK>0){
            
              user1Cards[0].cards.ROCK--
            
              user1flag=true;
            }
            else if(card1 === "SCISSOR" && user1Cards[0].cards.SCISSOR>0){
            
              user1Cards[0].cards.SCISSOR--
            
              user1flag=true; 
           
            }
          
          }

          const user2Cards = await this.user.find().where('username').equals(user2).exec()

          if(card2 === "PAPER" && user2Cards[0].cards.PAPER>0)
          {
          
            user2Cards[0].cards.PAPER--
          
            user2flag=true;
        
          }
        
          else
          {
           
            if(card2 === "ROCK" && user2Cards[0].cards.ROCK>0){
           
              user2Cards[0].cards.ROCK--;
           
              user2flag=true;
            }
           
            else if(card2 === "SCISSOR" && user2Cards[0].cards.SCISSOR>0){
            
              user2Cards[0].cards.SCISSOR--;
              
              user2flag=true;
            }
          
          }
          
          if(user1flag && user2flag){
           
            user1Cards[0].save()
           
            user2Cards[0].save()
           
            let arrOfCards=`[${card1},${card2}]`
           
            game[0].moves.push(arrOfCards)
          
          }
          
          else
          {
          
            throw new BadRequestException("check your cards one or may be both users minimum no. of cards is not there to play game please purchase");
          
          }
         
          if(!card1.match(card2) && user1flag && user2flag)
           {
          
             console.log(card1+" "+card2);
            
             (card1.match("ROCK"))?
             (ans=(card2.match("SCISSOR"))?1:0) : 
             ((card1.match("PAPER")) ? 
             (ans=(card2.match("ROCK"))?1:0) :
             ( (card1.match("SCISSOR"))?(ans=(card2.match("PAPER"))?1:0):ans=-1))
             
             console.log(ans);
             
             if(ans==1){
            
              const user= await this.user.find().where('username').equals(user2).exec();
            
              game=await this.passkey.find().where('gameid').equals(gameid).exec()
            
              game[0].playerWin.push(game[0].user1)
            
              console.log(user)
            
              user[0].stars--
            
              user[0].save();
            
              game[0].card1="empty"
            
              game[0].card2="empty"
            
              game[0].save()
            
              return game[0].user1
            
            }
            
            else if(ans==0){
            
              const user= await this.user.find().where('username').equals(user1).exec();
            
              game=await this.passkey.find().where('gameid').equals(gameid).exec()
            
              game[0].playerWin.push(game[0].user2)
            
              console.log(user)
            
              user[0].stars--
            
              user[0].save();
            
              game[0].card1="empty"
            
              game[0].card2="empty"
            
              game[0].save()
            
              return game[0].user2
            
            }
            
            game[0].playerWin.push("tie")
            
            game[0].card1="empty"
            
            game[0].card2="empty"
            
            game[0].save()
            
            return "game is draw"
           
          }
          
          else if(user1flag && user2flag){
          
            game[0].playerWin.push("tie")
          
            game[0].card1="empty"
          
            game[0].card2="empty"
          
            game[0].save()
          
            return "game is draw"
          
          }
       
        }
    
}
