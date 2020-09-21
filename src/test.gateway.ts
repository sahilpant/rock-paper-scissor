import { SubscribeMessage, OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect, WebSocketServer, WebSocketGateway ,} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Logger } from '@nestjs/common';
import {v4 as uuid} from 'uuid'
import { AppGateway } from './app.gateway';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { user } from './required/interfaces/user.interface';
import {CardStatus} from './required/cards.enum'
import { passkey } from './required/interfaces/passkey.interface';
import { PlayService } from './play/play.service';
import {jwtStrategy} from './jwt.strategy'
import * as jwt from 'jsonwebtoken'
import {JwtPayLoad} from './required/interfaces/jwt-payload.interface'
import { detailOfCard} from '.././gameblock'
import { ConfigService } from '@nestjs/config';
import { NotificationService } from './notification/notification.service';

@WebSocketGateway({namespace:'/game'})
export class TestGateway implements OnGatewayInit, OnGatewayConnection , OnGatewayDisconnect{
  
 
  constructor(
              private  general:AppGateway,
              
              private jwtstrategy:jwtStrategy,
              
              @InjectModel('user')  private readonly user:Model<user>,
              
              @InjectModel('passkey') private readonly passkey:Model<passkey>,
              
			  private readonly playservice:PlayService,
			  
			  private configservice: ConfigService,
			  
			  private NotificationService:NotificationService ){}

  private logger:Logger = new Logger('TestGateway');

  private check={}//check whether a client is authorized or not
  
  private currConnected={};//currently connected clients
  
  private noOfusers = 1 //to count no of users in game room
  
  private emailOfConnectedUser: String;//email of users fetched from db using their given accesstoken
  
  private nameOfConnectedUser: String;//name of users fetched from db using their given accesstoken

  private roleOfConnectedUser: string;
  
  private gameCollection={} //{gameid:{userarray:[],timestamp,typeOfGame,status,Moves,RoomName}}
  
  private clientAndUser={}             //{client.id:this.emailofconnecteduser}
  
  private users ={}     // client id:game id

  private custom_id = {}; // client.id : custome_id by uuid()

  private user_timestamp = {};  //client 

  private user_check = {} //client.id : true if user is in a room false if user has left the room

  private room_status = {} //room.id : true if game has been started in that room

  private games = [] // gameid and other user details

  public room_invite_flag = {} //room id and status if there is a pending invitition

  public room_invited_player_email = {} //room id and email of the player who is invited
  
  @WebSocketServer() wss:Server;
  
  afterInit(server: Server):void {

    this.logger.log(`initialised`);
  
  }


  async handleConnection(client:Socket) {

    client.on('handler',async (data)=> 
  
    {
  
	  const ans = <JwtPayLoad>jwt.verify(data,this.configservice.get<string>('JWT_SECRET'))
	  
	  console.log(ans);
  
      this.emailOfConnectedUser = ans.email
  
	  this.nameOfConnectedUser = ans.username
	  
	  this.roleOfConnectedUser = ans.role

	  let isuserValidatedwithPlayload = await this.jwtstrategy.validate(ans)

	  if(isuserValidatedwithPlayload)
	  {
	  client.emit('return',isuserValidatedwithPlayload)
	  }
	  else
	  {
		client.emit('return',"client not verified with this payload")

		this.emailOfConnectedUser = null
  
		this.nameOfConnectedUser = null
		
		this.roleOfConnectedUser = null

		this.handleDisconnect(client);
	  }
  
    })
  
    client.emit('welcome',"welcome to the server")
  
    this.clientAndUser[client.id] = this.emailOfConnectedUser;

    if(this.emailOfConnectedUser){

		this.check[client.id] = true; //check that user has verified there payload
	
	}
	else{

		client.emit('ERROR','PAYLOAD NOT VERFIFIED HENCE NOT AUTHENTICATED');
		
		this.handleDisconnect(client);
	}

	/*------logic for checking the invitation email------*/
	if( this.check[client.id] && Object.values(this.room_invited_player_email).indexOf(this.emailOfConnectedUser) != -1){
		this.handleJoinInvitation(client,Object.keys(this.room_invited_player_email)[Object.values(this.room_invited_player_email).indexOf(this.emailOfConnectedUser)]);
	}
	/*---------------------------------------------------*/

	else if(this.check[client.id]){

		this.currConnected[client.id] = this.noOfusers++;
  
		const userdata = await this.user.findOne().where('username').equals(this.nameOfConnectedUser).exec();
  	
		userdata.client_id = client.id;
  	
		userdata.save();
  
		this.emailOfConnectedUser=null
  
		this.nameOfConnectedUser=null
  
		client.emit('joined', `welcome user ${client.id}`);
  
        const pos = this.games.findIndex((game) => { return game.players == 1 || game.players == 0});
  
        if(pos != -1 && (this.room_status[this.games[pos].gameRoom] != true) && this.room_invite_flag[this.games[pos].gameRoom] != true){
  
			const game_pos = this.games.findIndex((game) => { return game.gameRoom == this.games[pos].gameRoom});
	
			// this.games[game_pos].users.push(client.id);
	
			this.user_timestamp[client.id] = Date.now();
	
			this.handleJoin( client, this.games[pos].gameRoom);
	
			this.games[pos].players++;
	
			this.user_check[client.id] = `true`;
  
    	}
  
      	else{
  
        	this.user_timestamp[client.id] = Date.now();
  
 	        this.handlejoinFirstTime(client);
         
      	}
  
    }

  
  }

  handleJoinInvitation(client: Socket,room: string) {

	const pos  =  this.games.findIndex((game) => game.gameRoom == room);
	client.join(room);
	client.emit('Joined',`Welcome to the room ${room}`);
	client.broadcast.to(room).emit('user joined', `User ${client.id} ahs joined he room`);

	this.user_timestamp[client.id] = Date.now();
	this.currConnected[client.id] = this.noOfusers++;
	this.games[pos].players++;		
	this.user_check[client.id] = 'true';
	this.users[client.id] = room;
	this.custom_id[client.id] = uuid();
	delete this.room_invited_player_email[room];

  }
  
  handlejoinFirstTime(client:Socket){
  
    if(this.check[client.id])
  
    {
  
	  let gameId = uuid();

	  this.room_invite_flag[gameId] = false;
  
      this.games.push({
  
        gameRoom: `${gameId}`,
  
        players: 1
  
      })
  
      client.join(gameId)
  
      client.emit('joinedGame',`welcome to ${gameId}`)
  
      this.users[client.id]=gameId
  
      this.user_check[client.id] = `true`;
  
      this.custom_id[client.id] = uuid();
  
      this.gameCollection[gameId]={
  
        "userarray":[this.clientAndUser[client.id],],
  
        "timestamp":new Date(),
  
        "typeOfGame":"normal",
  
        "status":true,
  
        "moves":10,
  
        "RoomName":"testroom"
  
      }               
  
    }
  
  }

  

  
  handleJoin(client:Socket , game: string):void{
  
    client.join(game)
  
    client.emit('joinedRoom',`welcome to ${game}`);
  
    this.gameCollection[game].userarray.push(this.clientAndUser[client.id])
  
    this.users[client.id] = game;
  
	this.custom_id[client.id] = uuid();
	
	this.user_timestamp = Date.now();
  
  }

  
  	handleDisconnect(client: Socket):void {
		if(this.user_check[client.id]){
			const room = this.users[client.id];
			const pos  =  this.games.findIndex((game) => game.gameRoom == room);
			this.wss.to(this.users[client.id]).emit('user-disconnected',`user ${client.id} disconnected`);
			this.games[pos].players--;
			delete this.users[client.id]
			delete this.currConnected[client.id];
		}
		this.logger.log(`${client.id} disconnected`);
  	}

  

  @SubscribeMessage('chat')
  handlechat(client: Socket, data: string):void {
   
	if(this.check[client.id]) 
	
	this.wss.emit('chat',data);
	
	else client.disconnect();
  
 }
  

  


 
		@SubscribeMessage('invite')
		handleinvite(client: Socket,email:string){

			const room = this.users[client.id];
			const pos  =  this.games.findIndex((game) => game.gameRoom == room);
			if(this.games[pos].players<2){
				this.room_invite_flag[room] = true;
				this.room_invited_player_email[room] = email;
				client.emit("Success",`Invitation sent to ${email}`);
				this.NotificationService.send_room_code(email);
			}
			else{
				client.emit('Error','Room full');
			}
			
			//this.games.findIndex((game) => { return game.players == 1 || game.players == 0});
			
		}

		@SubscribeMessage('cancel_invite')
		handleCancel(client:Socket){
			const room = this.users[client.id];
			// const pos  =  this.games.findIndex((game) => game.gameRoom == room);
			delete this.room_invited_player_email[room];
			client.emit("Success","Invitation has been canceled");
		}

		@SubscribeMessage('free_room')
		handlefreeroom(client:Socket){
			const room = this.users[client.id];
			if(this.room_invite_flag[room]){
				// const pos  =  this.games.findIndex((game) => game.gameRoom == room);
				client.emit("Success","anyone can join now")
				this.room_invite_flag[room] = false;
			}

			else{
				client.emit("Warning","Cancle the invite first");
			}
		}

		@SubscribeMessage('leaveRoom')
		handleLeave(client:Socket, room:string):void {
			const _room = this.users[client.id];
			const pos  =  this.games.findIndex((game) => game.gameRoom == _room);
		  	if(this.currConnected[client.id]){
				client.leave(room);
				client.emit('leave',`left the room ${room}`);
				client.broadcast.to(room).emit('UserLeftRoom', `${this.custom_id[client.id]} left the room`);
				this.games[pos].players--;
		  	}
		 	else{
				client.emit('Error',`Enter a room to leave`);
		  	}
		}

		@SubscribeMessage('show')
		handleshow(): void {
			console.log(`--------------------------------------------`)
			console.log(`client.id : room.id`);
			console.log(this.users);
			console.log(`room.id : player count`);
			console.log(this.room_status);
			console.log(`client.id : timestamp`);
			console.log(this.user_timestamp);
			console.log(`client.id : check weather they are currently in a room or not`);
			console.log(this.user_check);
			console.log(`client.id : custom id using uuid()`);
			console.log(this.custom_id);
			console.log(` room_id : Game status in the room`);
			console.log(this.room_status);
			console.log('games');
			console.log(this.games);
			console.log("currConnected")
			console.log(this.currConnected);
			console.log("check");
			console.log(this.check);
			console.log("gameCollection");
			console.log(this.gameCollection);
			console.log("clientAndUser");
			console.log(this.clientAndUser);
			console.log("roomid:invited email")
			console.log(this.room_invited_player_email);
			console.log("rood id : true if there is a pending invitation")
			console.log(this.room_invite_flag)
			console.log(`--------------------------------------------`)
		}




/*---------Game logic------------*/
		@SubscribeMessage('add1')
		async playgame(client: Socket, data: Number)
		{
			 //store id of given card
			 let carddetail,flag=1
		
			 try
			 {
		
				carddetail = await detailOfCard(data);
			
			}
		
			catch
		
			{
		
				flag=0;
		
				let gameidOfUser = this.users[client.id]
		
				let currentGame = await this.passkey.findOne().where('gameid').equals(gameidOfUser).exec();
			 
				if(currentGame)
		
				{
		
					//other user card is given back to him
		
					let publickeyofthatUser = currentGame.player2address
	
					currentGame.card2 = "empty"
	
					await currentGame.save()
	
					let user2details =await this.user.findOne().where('publickey').equals(publickeyofthatUser).exec()
	
					let returnedTokenId = await user2details.usedCards.pop()
	
					await user2details.notUsedCards.push(returnedTokenId)
	
					await user2details.save();
	
					let name2 = currentGame.user2
	
					this.wss.to(gameidOfUser).emit('card not played',`${name2} your card is not used as other user card is not valid`)
	
					client.emit('not valid card','your card is not valid')
	
				}
	
	
			}
	
			if(flag==1)
			{
		
				console.log(carddetail+"   "+carddetail[0]+"   "+carddetail[1]);
	
				let givenCardType
	
				(carddetail[0] === "1")?(givenCardType="ROCK"):(
										   (carddetail[0] === "2")?(givenCardType="PAPER"):(
																				(carddetail[0] === "3")?(givenCardType = "SCISSOR"):givenCardType="none"))
																				
				console.log(data)		
		
				let gameid=this.users[client.id]  
	
				if(givenCardType == CardStatus.PAPER || givenCardType == CardStatus.ROCK || givenCardType == CardStatus.SCISSOR)
	
				{
	
					if(this.check[client.id])
	
					{
					
						let gameexist= await this.passkey.findOne().where('gameid').equals(gameid).exec();
	
						let nameinUSERDB =await this.user.findOne().where('client_id').equals(client.id).exec()
		
						//find index of given card
				
						let indexofCard =(nameinUSERDB.notUsedCards.indexOf(data))
		
						console.log(indexofCard)
		
						// console.log(nameinUSERDB.notUsedCards.findIndex(givencardid))
	
						if(gameexist && indexofCard !== -1)
		
		
						{
		
								gameexist.card1 = givenCardType
	
								gameexist.user1=nameinUSERDB.username
	
								gameexist.player1address=nameinUSERDB.publickey
	
								gameexist.token1 = data
	
								nameinUSERDB.usedCards.push(data)
	
								nameinUSERDB.notUsedCards.splice(indexofCard,1,-1000)
		
								await nameinUSERDB.save()
		
								await gameexist.save()
		
		
							}
			
							else if(indexofCard !== -1)
		
							{
		
								const cardDetail = new this.passkey({
		
								gameid:gameid,
		
								card1:givenCardType,
		
								user1:nameinUSERDB.username,
	
								player1address:nameinUSERDB.publickey,
	
								token1:data
							})
		  
							console.log( nameinUSERDB.notUsedCards[indexofCard])
	
							await nameinUSERDB.usedCards.push(data);
		
							nameinUSERDB.notUsedCards.splice(indexofCard,1,-1000)
		
							await nameinUSERDB.save()
		
							await cardDetail.save()
		
						}
	
						gameexist = await this.passkey.findOne().where('gameid').equals(gameid).exec();
	
						if(gameexist.card1 && gameexist.card2 && gameexist.card1 !== "empty" && gameexist.card2 !== "empty")
		
						{
								let gameINDB= await this.passkey.findOne().where('gameid').equals(gameid).exec();
		
								const user1name = gameINDB.user1
		
								const user2name = gameINDB.user2
		
								const user1card = gameINDB.card1
		
								const user2card = gameINDB.card2
			  
								// const addressofplayer1 = gameINDB.player1address
	
								// const addressofplayer2 = gameINDB.player2address
	
								const gameResult=await  this.playservice.play(gameid);
		
								if(gameResult === "game is draw")
		
								this.wss.to(gameid).emit('result',"game is draw")
		
								else
		
								{
		
									this.wss.to(gameid).emit('result of round',gameResult+" WON ");
		
									this.wss.to(gameid).emit(`${user1name}+"cards"`,user1card);
		
									this.wss.to(gameid).emit(`${user2name}+"cards"`,user2card);
		
		
								}
		
								gameINDB= await this.passkey.findOne().where('gameid').equals(gameid).exec()
		
								if(gameINDB.playerWin.length === 3)
		
								{
		
									let user1=0,user2=0,tie=0;
		
									console.log(gameINDB.playerWin+"             "+gameINDB.playerWin.length)
		
									for(const player in gameINDB.playerWin)
		
									{
		
										console.log(gameINDB[player]+"#####")
		
										if(gameINDB.playerWin[player] === user1name)
		
										user1++;  
		
										else if(gameINDB.playerWin[player] === user2name)
		
										user2++;
		
										else
		
										tie++;
		
		
									}
		
									console.log(user1+"###"+user2+"###"+tie)
		
									const finalPlayerWon = (user1>user2)?user1name:((user2>user1)?user2name:"game is draw")
		
									this.wss.to(gameid).emit('final',finalPlayerWon);
	
	
									//delete this gameid data from database too
	
									await gameINDB.deleteOne()
	
									await gameINDB.save()
		
		
								
								}
			
							
							}
	
						}
	
					}
	  
		
				}
	
	
			}
	
	  
		@SubscribeMessage('add2')
		async playgame1(client: Socket, data: Number)
		{
			 //store id of given card
			 let carddetail,flag=1
		
			 try
			 {
		
				carddetail = await detailOfCard(data);
			
			}
		
			catch
		
			{
		
				flag=0;
		
				let gameidOfUser = this.users[client.id]
		
				let currentGame = await this.passkey.findOne().where('gameid').equals(gameidOfUser).exec();
			 
				if(currentGame)
		
				{
		
					//other user card is given back to him
		
					let publickeyofthatUser = currentGame.player1address
	
					currentGame.card1 = "empty"
	
					await currentGame.save()
	
					let user1details =await this.user.findOne().where('publickey').equals(publickeyofthatUser).exec()
	
					let returnedTokenId = await user1details.usedCards.pop()
	
					await user1details.notUsedCards.push(returnedTokenId)
	
					await user1details.save();
	
					let name1 = currentGame.user1
	
					this.wss.to(gameidOfUser).emit('card not played',`${name1} your card is not used as other user card is not valid`)
	
					client.emit('not valid card','your card is not valid')
	
				}
	
	
			}
	
			if(flag==1)
			{
		
				console.log(carddetail+"   "+carddetail[0]+"   "+carddetail[1]);
	
				let givenCardType
	
				(carddetail[0] === "1")?(givenCardType="ROCK"):(
										   (carddetail[0] === "2")?(givenCardType="PAPER"):(
																				(carddetail[0] === "3")?(givenCardType = "SCISSOR"):givenCardType="none"))
																				
				console.log(data)		
		
				let gameid=this.users[client.id]  
	
				if(givenCardType == CardStatus.PAPER || givenCardType == CardStatus.ROCK || givenCardType == CardStatus.SCISSOR)
	
				{
	
					if(this.check[client.id])
	
					{
					
						let gameexist= await this.passkey.findOne().where('gameid').equals(gameid).exec();
	
						let nameinUSERDB =await this.user.findOne().where('client_id').equals(client.id).exec()
		
						//find index of given card
				
						let indexofCard =(nameinUSERDB.notUsedCards.indexOf(data))
		
						console.log(indexofCard)
		
						// console.log(nameinUSERDB.notUsedCards.findIndex(givencardid))
	
						if(gameexist && indexofCard !== -1)
		
		
						{
		
								gameexist.card2 = givenCardType
	
								gameexist.user2=nameinUSERDB.username
	
								gameexist.player2address=nameinUSERDB.publickey
	
								gameexist.token2 = data
	
								nameinUSERDB.usedCards.push(data)
	
								nameinUSERDB.notUsedCards.splice(indexofCard,1,-1000)
		
								await nameinUSERDB.save()
		
								await gameexist.save()
		
		
							}
			
							else if(indexofCard !== -1)
		
							{
		
								const cardDetail = new this.passkey({
		
								gameid:gameid,
		
								card2:givenCardType,
		
								user2:nameinUSERDB.username,
	
								player2address:nameinUSERDB.publickey,
	
								token2:data
							})
		  
							console.log( nameinUSERDB.notUsedCards[indexofCard])
	
							await nameinUSERDB.usedCards.push(data);
		
							nameinUSERDB.notUsedCards.splice(indexofCard,1,-1000)
		
							await nameinUSERDB.save()
		
							await cardDetail.save()
		
						}
	
						gameexist = await this.passkey.findOne().where('gameid').equals(gameid).exec();
	
						if(gameexist.card1 && gameexist.card2 && gameexist.card1 !== "empty" && gameexist.card2 !== "empty")
		
						{
								let gameINDB= await this.passkey.findOne().where('gameid').equals(gameid).exec();
		
								const user1name = gameINDB.user1
		
								const user2name = gameINDB.user2
		
								const user1card = gameINDB.card1
		
								const user2card = gameINDB.card2
			  
								// const addressofplayer1 = gameINDB.player1address
	
								// const addressofplayer2 = gameINDB.player2address
	
								const gameResult=await  this.playservice.play(gameid);
		
								if(gameResult === "game is draw")
		
								this.wss.to(gameid).emit('result',"game is draw")
		
								else
		
								{
		
									this.wss.to(gameid).emit('result of round',gameResult+" WON ");
		
									this.wss.to(gameid).emit(`${user1name}+"cards"`,user1card);
		
									this.wss.to(gameid).emit(`${user2name}+"cards"`,user2card);
		
		
								}
		
								gameINDB= await this.passkey.findOne().where('gameid').equals(gameid).exec()
		
								if(gameINDB.playerWin.length === 3)
		
								{
		
									let user1=0,user2=0,tie=0;
		
									console.log(gameINDB.playerWin+"             "+gameINDB.playerWin.length)
		
									for(const player in gameINDB.playerWin)
		
									{
		
										console.log(gameINDB[player]+"#####")
		
										if(gameINDB.playerWin[player] === user1name)
		
										user1++;  
		
										else if(gameINDB.playerWin[player] === user2name)
		
										user2++;
		
										else
		
										tie++;
		
		
									}
		
									console.log(user1+"###"+user2+"###"+tie)
		
									const finalPlayerWon = (user1>user2)?user1name:((user2>user1)?user2name:"game is draw")
		
									this.wss.to(gameid).emit('final',finalPlayerWon);
		
	
									await gameINDB.deleteOne()
	
									await gameINDB.save()
								
								}
			
							
							}
	
						}
	
					}
	  
		
				}
	
	
			}
	// @SubscribeMessage('list')
	// handlelist(client: Socket, data: string):void {

	// 	if(this.check[client.id]) client.emit('list',this.general.users)

	// 	else

	// 	{

	// 		client.emit('warning','unauthorised access')

	// 	}

	// }




	// @SubscribeMessage('userconnected')
	// currconnected(client: Socket, data: string):void {

	// 	if(this.check[client.id]) client.emit('list',this.currConnected)

	// 	else

	// 	{

	// 		client.emit('warning','unauthorised access')

	// 	}

	// }





// @SubscribeMessage('showGame')
  
  // showGame(client:Socket){
  
  // if(this.check[client.id])
  
  //   {
  
  //    console.log(this.gameCollection)
  
  //    client.emit('gamecollection',this.gameCollection)
  
  //   }
  
  // }


  
  // @SubscribeMessage('joinGame')
  // joinGame(client:Socket,data:string){
  //    if(this.gameCollection[data] && this.check[client.id])
  //    {
  //      client.join(data)
  //      this.users[client.id]=data
  //      this.gameCollection[data].userarray.push(this.clientAndUser[client.id])
  //      this.check[client.id]=true
  //    }
  // }
}
