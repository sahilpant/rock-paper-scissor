
import { SubscribeMessage, OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect, WebSocketServer, WebSocketGateway ,} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { HttpException, HttpStatus, Inject, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import {v4 as uuid} from 'uuid'
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { user } from './required/interfaces/user.interface';
import {CardStatus} from './required/cards.enum'
import { passkey } from './required/interfaces/passkey.interface';
import {History} from './required/interfaces/History.interface'
import { PlayService } from './play/play.service';
import {jwtStrategy} from './jwt.strategy'
import * as jwt from 'jsonwebtoken';
import {JwtPayLoad} from './required/interfaces/jwt-payload.interface'
import { detailOfCard, show_stars, total_cards} from '.././gameblock'
import { ConfigService } from '@nestjs/config';
import { AppGateway } from './app.gateway'
import { NotificationService } from './notification/notification.service';
import { EmailVerify } from './schemas/EmailVerify.model';
import { match } from './required/interfaces/match.interface';
import * as matcha from './schemas/match';
import { IsNumberString } from 'class-validator';
import { date } from '@hapi/joi';
import { username } from './required/dto/username.dto';
// import { user } from './schemas/user.model';
// import { match } from './schemas/match';
// import { match } from './schemas/match';

@WebSocketGateway(
	{namespace:'/game'})
export class TestGateway implements OnGatewayInit, OnGatewayConnection{
  
 
  constructor(
              private  general:AppGateway,
              
              private jwtstrategy:jwtStrategy,
              
              @InjectModel('user')  private readonly user:Model<user>,
              
			  @InjectModel('passkey') private readonly passkey:Model<passkey>,

			  @InjectModel('match') private readonly match:Model<match>,
              
			  private readonly playservice:PlayService,
			  
			  private configservice: ConfigService,
			  
			  private NotificationService:NotificationService ){}

  private logger:Logger = new Logger('TestGateway');

  public room_invite_flag = {} //room id -> TRUE || FALSE

  private move_time = {}; //takes the timestamp when a move is played

  private user_start = true;
  
  @WebSocketServer() wss:Server;
  
	async  afterInit(server: Server) {

    	this.logger.log(`initialised`);
  
	  }
	  
//  handle connection event

  async handleConnection(client:Socket) {
	
	console.log(client.handshake.query.token)
	
    if(client.handshake.query.token){
		var data = client.handshake.query.token
		try{
			const ans = <JwtPayLoad>jwt.verify(data,this.configservice.get<string>('JWT_SECRET'))
			let isuserValidatedwithPlayload = await this.jwtstrategy.validate(ans)
			console.log(isuserValidatedwithPlayload);
			if(isuserValidatedwithPlayload) {

				client.id= isuserValidatedwithPlayload.username;
				client.emit('Connection',isuserValidatedwithPlayload) //in the browser console this output will be showm
			}

			else{
				console.log("invalid token")
				client.emit('Connection',"invalid_token")
				
			}
		}
		catch(err){

		  	const message = 'Token error- ' + err.message
			client.emit('Connection', message);
			// throw new HttpException(message, HttpStatus.FORBIDDEN)
		}
		


	}
  else{

	client.emit('Connection', "missing_token")
	client.disconnect()
  }
  }

	





	@SubscribeMessage('chat')
	handlechat(client: Socket, data: string):void 
	{

				const room = data.roomID;
				this.wss.to(room).emit('chat', data);
	}
  

		
	@SubscribeMessage('End_Game')
	async handleEndGame(client:Socket,obj:Object) {
		const _room = obj.gameid;
	

		//DB access

		const game = await this.passkey.findOne().where('gameid').equals(_room).exec();
        const match_details = await this.match.findOne({gameid:_room});

		if(game && (game.player1address || game.player2address)){

			const user_1 =  await this.user.findOne({publickey:game.player1address});

			const user_2 =  await this.user.findOne({publickey:game.player2address});

			/*---------------------------Card Returning Logic Starts Here-------------------------*/
				
			if(game.card1 && game.card1 !== null){
				let returnedTokenId = user_1.usedCards.pop()

				user_1.notUsedCards.push(returnedTokenId)
			}

			else if(game.card2 && game.card2 !== null){
				let returnedTokenId = user_2.usedCards.pop()

				user_2.notUsedCards.push(returnedTokenId)
			}

			/*-----------------------Card Returning Logic Ends Here-------------------------------*/
					
			/*-----------------------Stars Returning Logic Starts Here-------------------------------*/
				
			if(user_1){
		
				user_1.stars += match_details.stars_of_player1;
				await user_1.save();
			}
			
			if(user_2){
				
				user_2.stars += match_details.stars_of_player2;
				await user_2.save();
			}

			
				
			/*-----------------------Stars Returning Logic ends Here-------------------------------*/
			
				
			await game.deleteOne();


		
			
			delete this.room_invite_flag[`${_room}`];

			//Blockchain part for star transefer from admin

			client.to(_room).broadcast.emit('End_Game', `${client.id} has ended the Game`);
			client.leave(_room);
		

		
		}

		else{
		delete this.room_invite_flag[`${_room}`];
		client.leave(_room);
		}
	}



	@SubscribeMessage('leaveRoom')
	async handleLeaveRoom(client:Socket,room:string){

	


		client.to(room).broadcast.emit('Left',`${client.id} has left the room`);
		client.leave(room);
	}


	@SubscribeMessage('show')
	handleshow(): void {
		console.log(`--------------------------------------------`)
		console.log("room id : true if there is a pending invitation")
		console.log(this.room_invite_flag)
		console.log(`--------------------------------------------`)
	}




async finalResult(gameid:string)
{

	
	var existing_game = await this.match.find({gameid:gameid})
					

	let gameINDB = await this.passkey.findOne({gameid:gameid})

	let db_user1 = await this.user.findOne({username:gameINDB.user1});
	let db_user2 = await this.user.findOne({username:gameINDB.user2});

	if(gameINDB.playerWin.length !== 0)
	{
		let match_details = await this.match.findOne({gameid:gameid});					
		let user1name  = gameINDB.user1;
		let user2name  = gameINDB.user2;

		let user1 = 0,user2 = 0,tie = 0;
		
		for(const player in gameINDB.playerWin)
		{
			if(gameINDB.playerWin[player] === user1name)
			user1++;  

			else if(gameINDB.playerWin[player] === user2name)
			user2++;

			else
			tie++;
		}

		const finalPlayerWon = (user1>user2)?user1name:((user2>user1)?user2name:"game is draw");
		existing_game[0].winner = finalPlayerWon;
		
		db_user1.stars += match_details.stars_of_player1;
		db_user2.stars += match_details.stars_of_player2;

		await db_user1.save();
		await db_user2.save();

		this.wss.to(gameid).emit(`Final Result after Round${gameINDB.playerWin.length} `,finalPlayerWon);			
		await gameINDB.deleteOne();		
		await existing_game[0].save()				
	}
	else
	{
		this.wss.to(gameid).emit('game not played',"not a single game has been played to display the final result");
		await gameINDB.deleteOne();
	}
					
}

@SubscribeMessage('move')
async playGame(client:Socket,obj:Object)
{
	var data = obj.card_number;
	console.log(data);
	let gameAlreadyExist =  await this.passkey.findOne({gameid:obj.gameid});
	let matchinstance = await this.match.findOne({gameid:obj.gameid});
	let gameisfurtherPlay = true;
    
	if(gameAlreadyExist)
	{
		let client1existinGame = false,client2existinGame = false;
		
		if(gameAlreadyExist.client2id)
		client2existinGame = true;
		else
		{
		//This is client2's first game
		
		client2existinGame = false;
		let Firstgame =  await this.user.findOne({username:client.id})
		if( Firstgame && Firstgame.stars <= 0)
		{
			gameisfurtherPlay = false;
			const _match = await this.match.findOne({gameid:obj.gameid});
			_match.status = "Aborted";
			await _match.save();
			this.handleEndGame(client,obj.gameid);
		}
	
		}
		
		if(client1existinGame && client2existinGame)
		{
			
			if(matchinstance.stars_of_player1 == 0 || matchinstance.stars_of_player2 == 0)
			gameisfurtherPlay = false;

			if(!gameisfurtherPlay)
			{
			const _match = await this.match.findOne({gameid: obj.gameid});
			this.finalResult(obj.gameid)
			_match.status = "Aborted";
			await _match.save();
			this.handleEndGame(client,obj.gameid);
		}
	}
}
	else
	{    //it run only once when no game exist
		  let Firstgame =  await this.user.findOne({username:client.id})
		  console.log(Firstgame);
		  if(Firstgame.stars <= 0)
		  {
			gameisfurtherPlay = false;
			this.handleEndGame(client,obj.gameid);
		  }
	}

	if(gameisfurtherPlay)
	{
		console.log("Everything running fine")
		let carddetail: string | string[];

		let givenCardType: string;
		if(data == "NONE"){
		carddetail = "NONE";
		givenCardType = "NONE"
		}
		else
		{
		 carddetail = await detailOfCard(data); 
	     console.log(carddetail+"   "+carddetail[0]+"   "+carddetail[1]);
        (carddetail[0] === "1")?(givenCardType="ROCK"):(
									(carddetail[0] === "2")?(givenCardType="PAPER"):(
																		(carddetail[0] === "3")?(givenCardType = "SCISSOR"):givenCardType="none"))
				
		}
																
		let gameid = obj.gameid;
        if(givenCardType == CardStatus.PAPER || givenCardType == CardStatus.ROCK || givenCardType == CardStatus.SCISSOR)
		{
			let gameexist = await this.passkey.findOne({gameid:gameid})
            let nameinUSERDB = await this.user.findOne({username:client.id})
			 
			
			//find index of given card
			let indexofCard = (nameinUSERDB.notUsedCards.indexOf(data))
	        console.log(indexofCard)
	
			if(gameexist && gameexist.client1id && gameexist.client2id && indexofCard !== -1)
			{	
				//1st round is completed successfully
				if(!gameexist.card1played && client.id === gameexist.client1id)
			   {
				    gameexist.card1 = givenCardType;
				    gameexist.token1 = data;
					gameexist.card1played = true;
					await gameexist.save();

			   }
			   else if(!gameexist.card2played && client.id === gameexist.client2id)
			   {
					gameexist.card2 = givenCardType;
					gameexist.token2 = data;
					gameexist.card2played = true;
					await gameexist.save();
			   }
			}
				
			else if(gameexist && indexofCard !== -1)
			{
				gameexist.card2 = givenCardType
				gameexist.user2 = nameinUSERDB.username
				gameexist.player2address = nameinUSERDB.publickey
				gameexist.token2 = data
				gameexist.card2played = true
				gameexist.client2id = client.id   
				await gameexist.save();
			}
			else if(indexofCard !== -1)
			{
				
				
				const cardDetail = new this.passkey({
					gameid:gameid,
					card1:givenCardType,
					user1:nameinUSERDB.username,
					client1id:client.id,
					card1played:true,
					card2played:false,
					player1address:nameinUSERDB.publickey,
					token1:data
				})
				await cardDetail.save()
			}
			if(indexofCard !== -1)
			{
			    nameinUSERDB.usedCards.push(data)
                let x = nameinUSERDB.notUsedCards.slice(0,indexofCard);
			    let y = nameinUSERDB.notUsedCards.slice(indexofCard+1);
			    y.forEach((element) => x.push(element));
			    nameinUSERDB.notUsedCards = x;
			
			    await nameinUSERDB.save();
			}

		}
			let gameexist = await this.passkey.findOne({gameid:gameid});


/*------------------------------If card is not given within time respose considered as NONE------------------------------*/

			
if(carddetail === "NONE"){

	let winner:string;
	if(gameexist && !gameexist.card1played && gameexist.card2played){
		winner = gameexist.user2;
	}
	else if(gameexist && !gameexist.card2played && gameexist.card1played){
		winner = gameexist.user1;
	}
	else if(!gameexist || (!gameexist.card1played && !gameexist.card2played)){
		winner = "NONE";
	}
				
				
	let gameINDB = await this.passkey.findOne({gameid:gameid});

	const user1name = gameINDB.user1;
	const user2name = gameINDB.user2;
    const user1card = gameINDB.card1;
	const user2card = gameINDB.card2;
	let   token1    = gameINDB.token1;
    let   token2    = gameINDB.token2;

	let gameResult = winner;


	if(gameResult === user1name){
					
		gameINDB.playerWin.push(user1name);
		matchinstance.stars_of_player1++;
	    matchinstance.stars_of_player2--;

        matchinstance.Rounds.push({
								
			player1:{
				card_type:user1card,
				card_number:token1,
				timestamp:new Date					
			},
								
			player2:{
				card_type:null,
				card_number:-1,
				timestamp:new Date
			}					
		})



					
	const nameinUSERDB = await this.user.findOne({username:user1name});
	let indexofCard = (nameinUSERDB.notUsedCards.indexOf(data))
	nameinUSERDB.usedCards.push(data)
    let x = nameinUSERDB.notUsedCards.slice(0,indexofCard);
	let y = nameinUSERDB.notUsedCards.slice(indexofCard+1);
	y.forEach((element) => x.push(element));
	nameinUSERDB.notUsedCards = x;
	await nameinUSERDB.save();
	await matchinstance.save();
	await gameINDB.save();
				
    }
				
    else if(gameResult === user2name){
					
		matchinstance.stars_of_player2++;
		matchinstance.stars_of_player1--;
	    gameINDB.playerWin.push(user2name)

        matchinstance.Rounds.push({

			player1:{

				card_type:null,
				card_number:-1,
				timestamp:new Date
			},
			player2:{
							
				card_type:user2card,
				card_number:token2,
				timestamp:new Date			
			}
					
		})



	const nameinUSERDB = await this.user.findOne({username:user2name});
	let indexofCard = (nameinUSERDB.notUsedCards.indexOf(data))
	nameinUSERDB.usedCards.push(data)
    let x = nameinUSERDB.notUsedCards.slice(0,indexofCard);
	let y = nameinUSERDB.notUsedCards.slice(indexofCard+1);
	y.forEach((element) => x.push(element));
	nameinUSERDB.notUsedCards = x;
	await nameinUSERDB.save();
	await matchinstance.save();
	await gameINDB.save();
				
}
				
				
    else if(gameResult === "NONE"){

	this.wss.to(gameid).emit('move_response',"None Of The Player play a move")				
    }
				
}


/*------------------------------------------------------------*/

	else if(gameexist && gameexist.card1played && gameexist.card2played)
    {

		matchinstance = await this.match.findOne({gameid:gameid});
		let gameINDB = await this.passkey.findOne({gameid:gameid});

		const user1name = gameINDB.user1;
		const user2name = gameINDB.user2;
		const user1card = gameINDB.card1;
		const user2card = gameINDB.card2;
		let   token1    = gameINDB.token1;
		let   token2    = gameINDB.token2;

			
		let gameResult = await  this.playservice.play(gameid);

		if(gameResult === user1name){
			matchinstance.stars_of_player1++;
		    matchinstance.stars_of_player2--;
		}
		else if(gameResult === user2name){
			matchinstance.stars_of_player1--;
		    matchinstance.stars_of_player2++;
		}
		
		if(gameResult === "game is draw")
		{
			this.wss.to(gameid).emit('move_response',"DRAW")
		}
		else
		{
			this.wss.to(gameid).emit('move_response',gameResult+" WON ");
		}	
		this.wss.to(gameid).emit(`${user1name}`,user1card);
		this.wss.to(gameid).emit(`${user2name}`,user2card);
				

		gameINDB = await this.passkey.findOne({gameid:gameid})

				

		if(gameINDB.playerWin.length > 0){
					
			matchinstance.Rounds.push({
						
				player1:{			
					card_type:user1card,
					card_number:token1,
					timestamp:new Date		
				},		
				player2:{
					card_type:user2card,
				    card_number:token2,
					timestamp:new Date		
				}
					
			})
					
			await matchinstance.save();
					
			
			if(gameINDB.playerWin.length == 3){
						
		        matchinstance.TotalRounds = 3;
			    matchinstance.status = "Completed";
                await matchinstance.save();
				this.finalResult(gameid);
					
			}
				
		}				
			
	}
		
		
	
}
}




		@SubscribeMessage('Message')
		async messageclient(client:Socket, data:string){
		   console.log(client.id)
		   client.emit('listen', "this is the data");

		}







		@SubscribeMessage('invite')
		sendInvite(client: Socket,obj:Object){
			const room = obj.roomID;
			client.emit("Success",`Invitation sent to ${obj.email}`);
			this.NotificationService.send_room_code(obj.email);
	
		}
	
		
		
		
		@SubscribeMessage('joinGameByInvite')
		async joinGame_throughInvite(client: Socket,data:Object) {
	
			var token = data.jwt_token;
			try{
			const decryptedvalue = <JwtPayLoad>jwt.verify(token,this.configservice.get<string>('JWT_SECRET'))  
			let userdetails = await this.jwtstrategy.validate(decryptedvalue);
			console.log(userdetails.publickey);
			
			if(userdetails.publickey){
	
				var stars = await show_stars(userdetails.publickey);
				var card_details = await total_cards(userdetails.publickey);					
						
			}
						
			var existing_game = await  this.match.find({$and:[
	
				{'player1.username':{$ne:userdetails.username}},
				{'player2.username':null}
					
			]})
									
			if(existing_game.length > 0){
	
			
				if(stars>=3){
					stars = stars-3;
					await  this.match.updateOne({gameid:existing_game[0].gameid},{$set:{'player2.username': userdetails.username, 'player2.publicaddress':userdetails.publickey,'stars_of_player2':3,'player_joined':2,"status":"active"}}, function(err,data){
						if( err) console.log(err)
					})
				}
				else if(stars<3 && stars>0){
					await  this.match.updateOne({gameid:existing_game[0].gameid},{$set:{'player2.username': userdetails.username, 'player2.publicaddress':userdetails.publickey,'stars_of_player2':stars,'player_joined':2,"status":"active"}}, function(err,data){
						if( err) console.log(err)
					})
				}

						
		
	
			var response = await this.match.findOne().where('gameid').equals(existing_game[0].gameid).exec()
	
			client.emit("new_match_response", response);
					
		}
						
	
			
			
		  }
		  
		  catch{
						
			console.log("Invalid user") // Later pass this as event back to client
			client.emit("new_match_response", "Invalid user");
		}
		delete this.room_invited_player_email[`${data.room}`];
	}
	






    //Join Private game starts here

		@SubscribeMessage('private')
	async handleJoin_with_Friend(client: Socket, data:Object) {

			let game_id = await this.startpublicgame(client,data);
			this.room_invite_flag[`${game_id}`] = true;
		
	}



// Join Public game starts here  -----  
@SubscribeMessage('Public')
async startpublicgame(client:Socket, data:Object):Promise<any>{
				
	var token = data.jwt_token;
	console.log(token);
	console.log(data);
	let generated_gameid:any;
    try{
		
		const decryptedvalue = <JwtPayLoad>jwt.verify(token,this.configservice.get<string>('JWT_SECRET'))  
		let userdetails = await this.jwtstrategy.validate(decryptedvalue);
		console.log(userdetails);
		console.log(userdetails.publickey);
		
		if(userdetails.publickey){

			var stars = await show_stars(userdetails.publickey);
		    var card_details = await total_cards(userdetails.publickey);					
					
		}

		
					
		var existing_game = await  this.match.find({$and:[

			{'player1.username':{$ne:userdetails.username}},
			{'player2.username':null}
				
		]})
		
		console.log(stars+"  "+card_details+"  "+existing_game.length);					
		
		if(existing_game.length > 0 && !this.room_invite_flag[`${existing_game[0].gameid}`]){

		
			if(stars>=3){
			
				await  this.match.updateOne({gameid:existing_game[0].gameid},{$set:{'player2.username': userdetails.username, 'player2.publicaddress':userdetails.publickey,'stars_of_player2':3,'player_joined':2,"status":"active"}}, function(err,data){
					if( err) console.log(err)
				})
			}
			else if(stars<3 && stars>0){
			
				await  this.match.updateOne({gameid:existing_game[0].gameid},{$set:{'player2.username': userdetails.username, 'player2.publicaddress':userdetails.publickey,'stars_of_player2':stars,'player_joined':2,"status":"active"}}, function(err,data){
					if( err) console.log(err)
				})
			}
					
			

		var response = await this.match.findOne().where('gameid').equals(existing_game[0].gameid).exec()

		client.emit("new_match_response", response);
				
	}
					
	else if( stars > 0 &&  card_details >0 ){
		console.log("running");

		if(stars>=3){
			console.log("running1");
							
			const match = new this.match({
								gameid:uuid(),
								match_type:data.match_type,
								GameLength: data.match_type =='short' ? 60:129600,
								stars_of_player1:3,
								stars_of_player2:0,
								TotalRounds:3,
								start_date: new Date(),
								round:0,
								player1:{
									username: data.username,
									publicaddress:data.publickey,
								},
								player2:{
									username:null,
									publicaddress:null
								},
								Rounds:[],
								status:"waiting",
								winner:""
							})

			generated_gameid = match.gameid;
			console.log("748848595885");
			await match.save();
		
		}
		else{

			const match = new this.match({
								gameid:uuid(),
								match_type:data.match_type,
								stars_of_player1:stars,
								stars_of_player2:0,
								start_date: new Date(),
								TotalRounds:3,
								GameLength: data.match_type =='short' ? 60:129600,
								round:0,
								player1:{
									username: data.username,
									publicaddress:data.publickey,
								},
								player2:{
									username:null,
									publicaddress:null
								},
								Rounds:[],
								status:"waiting",
								winner:""
							}
							)

							generated_gameid = match.gameid;
				
							await match.save(async function(err,data){

								if (err) return "Error while creating match";
		
								else {
									console.log("888888888888888"+client.id);

									await this.user.updateOne({"username":client.id}, {$set:{stars:0}}, function(err,res){
										if(err){
											console.log(err)
										}
										else{
											
										}
									})
									client.emit("new_match_response", data);
								}
							});

						}					 
						}
						
               
				}
				catch(err){
					console.log(err);
					console.log("Invalid user") // Later pass this as event back to client
					client.emit("new_match_response", "Invalid user");
				}
				return generated_gameid;
			}
		
		// Joinn public game ends here
		 
		@SubscribeMessage('fetch_match_details')
		async getmatchdetails(client:Socket, data:Object){
			var token = data.jwt_token; 
            console.log(data)
			try{
			const decryptedvalue = <JwtPayLoad>jwt.verify(token,this.configservice.get<string>('JWT_SECRET'))  
			let userdetails = await this.jwtstrategy.validate(decryptedvalue);
			if(userdetails){

			var response = await this.match.find({$or:[
					{'player1.username':userdetails.username},
					 {'player2.username':userdetails.username}
				]})

				client.emit('match_details',response)
			}
			  }  
			catch{
				var res ={
					response:401,
					message:"Invalid User"
				}
                client.emit('match_details',res)
			}      


		}

		// Join the game play
		@SubscribeMessage('start_match')
 		async start_match(client:Socket, data:Object){
			var token = data.jwt_token; 
			console.log(data);
			const decryptedvalue = <JwtPayLoad>jwt.verify(token,this.configservice.get<string>('JWT_SECRET'));
			let userdetails = await this.jwtstrategy.validate(decryptedvalue);
			try{
			if(userdetails){
				   var room=data.gameid;
					client.join(room, await function(err){
						if(err) throw err;
						else {
							var  matchresponse={
								"username":client.id,
								"timestamp": new Date(),
								"gameid":data.gameid,
								"response":200

							}
						client.to(room).emit('start_match_response', matchresponse);
						
					  
					  }
			 });
				   
					console.log(Object.keys(client));
					console.log(client.rooms);
					var  matchresponse={
						"username":client.id,
						"timestamp": new Date(),
						"gameid":data.gameid,
						"response":200

					}
	
					client.emit('start_match_response',matchresponse);
                    
				}
			}
			catch{

				var res ={
				
					response:401,
					message:"Invalid User"
				}
                client.emit('start_match_response',res)

			}

		}

		@SubscribeMessage("activerooms")
        async activerooms(client:Socket, data:Object){
				
				var roo = data.gameid;
				console.log(roo);
				console.log(client.rooms);

				client.to("c29b47d8-e7c9-4636-8a06-9baac2d97047").emit('activerooms_response', "This is the message");
		}
		@SubscribeMessage("getroomID")
        async getroomID(client:Socket, data:Object){
				
				console.log(client.rooms);
				var room = client.rooms;
				console.log("Above are the rooms");
				client.emit('getroomID_response', room)
		}

		handleNotification(id:string){

			this.wss.to(id).emit('Notification','What is Up?');

		}
		@SubscribeMessage('leave_match')
 		async leave_match(client:Socket, data:Object){
			var token = data.jwt_token; 
			console.log(data);
			const decryptedvalue = <JwtPayLoad>jwt.verify(token,this.configservice.get<string>('JWT_SECRET'));
			let userdetails = await this.jwtstrategy.validate(decryptedvalue);
			try{
				client.leave(data.roomID, async () =>{
					client.emit('leave_match_response', `${data.username} left room ${data.roomID}`)
				})
			}
			catch{

				var res ={
					
					response:401,
					message:"Invalid User"
				}
                client.emit('leave_match_response',res)

			}
		 }


		 @SubscribeMessage('server_time')
		 async servertime(client:Socket, data:Object){
			var token = data.jwt_token; 
			console.log(data);
			const decryptedvalue = <JwtPayLoad>jwt.verify(token,this.configservice.get<string>('JWT_SECRET'));
			let userdetails = await this.jwtstrategy.validate(decryptedvalue);
			if(userdetails){
				
				var res={
					response:201,
					date:new Date(),


				}
				client.emit('server_time_response', res);
			}
			else{
				var err={
					response:401,
					date:""

				}
				client.emit('server_time_response', err);
			}

		 }


		 @SubscribeMessage('logoff')
 		async disconnect(client:Socket, data:Object){
			var token = data.jwt_token; 
			console.log(data);
			const decryptedvalue = <JwtPayLoad>jwt.verify(token,this.configservice.get<string>('JWT_SECRET'));
			let userdetails = await this.jwtstrategy.validate(decryptedvalue);
			try{

				client.connected = false;
				this.logger.log(`${client.id} disconnected`);
				client.disconnect();
			}
			catch{

				var res ={
					response:401,
					message:"Invalid User"
				}
                client.emit('Disconnect_response',res)

			}
		 }



}