
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
// import { match } from './schemas/match';
// import { match } from './schemas/match';

@WebSocketGateway(
	{namespace:'/game'})
export class TestGateway implements OnGatewayInit, OnGatewayConnection , OnGatewayDisconnect{
  
 
  constructor(
               private  general:AppGateway,
              
              private jwtstrategy:jwtStrategy,
              
              @InjectModel('user')  private readonly user:Model<user>,
              
			  @InjectModel('passkey') private readonly passkey:Model<passkey>,
			  
			  @InjectModel('History') private readonly History:Model<History>,

			  @InjectModel('match') private readonly match:Model<match>,
              
			  private readonly playservice:PlayService,
			  
			  private configservice: ConfigService,
			  
			  private NotificationService:NotificationService ){}

  private logger:Logger = new Logger('TestGateway');

  private check = {}//check whether a client is authorized or not
  
  private currConnected={};//client connected to any room or game currently true or false
  
  private emailOfConnectedUser: String;//email of users fetched from db using their given accesstoken
  
  private nameOfConnectedUser: String;//name of users fetched from db using their given accesstoken

  private roleOfConnectedUser: String;
  
  private users = {}     // client id:game id

  private custom_id = {}; // client.id : custome_id by uuid()

  private user_timestamp = {};  //client
 
  private room_status = {} //room.id : true if game has been started in that room

  private games = [] // gameid and other user details

  public room_invite_flag = {} //room id and status if there is a pending invitition

  public room_invited_player_email = {} //room id and email of the player who is invited

  private adminBlockStars = {} //client id with no of blocked stars by admin

  private clientidwithName = {} //clientid with associated names

  private move_time = {}; //takes the timestamp when a move is played

  private user_start = true;
  
  @WebSocketServer() wss:Server;
  
	async  afterInit(server: Server) {

    	this.logger.log(`initialised`);
  
	  }
	  
//  handle connection event

  async handleConnection(client:Socket) {
	let emailOfConnectedUser=null,nameOfConnectedUser=null;
	console.log(client.handshake.query.token)
	
    if(client.handshake.query.token){
		var data = client.handshake.query.token
		try{
			const ans = <JwtPayLoad>jwt.verify(data,this.configservice.get<string>('JWT_SECRET'))
			let isuserValidatedwithPlayload = await this.jwtstrategy.validate(ans)
			if(isuserValidatedwithPlayload) {

				client.id= isuserValidatedwithPlayload.username;
				this.check[client.id] = true
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
		
		if(this.check[client.id]){
	        
			this.clientidwithName[client.id] = client.id
		}
		else{

			client.emit('Connection','token_not_found2');

		}


	}
  else{

	client.emit('Connection', "missing_token")
	client.disconnect()
  }
  }



  	@SubscribeMessage('public')
	handleJoin_Alone(client: Socket){
		if(this.check[client.id]){

			const pos = this.games.findIndex((game) => { return game.players == 1 || game.players == 0});

			if(pos != -1 && (this.room_status[this.games[pos].gameRoom] != true) && this.room_invite_flag[this.games[pos].gameRoom] != true){
				this.handleJoin( client, this.games[pos].gameRoom);
		
				this.games[pos].players++;
		
				

			}

			else {
				client.emit('NOTICE','Waiting for another player')
				this.handlejoinFirstTime(client);
			}
		}

		else {
			client.emit('Error','invalid_token');
			client.disconnect();
		}
	}

	@SubscribeMessage('private')
	handleJoin_with_Friend(client: Socket) {
		if(this.check[client.id]){
			this.handlejoinFirstTime(client);
			const room = this.users[client.id];
			this.room_invite_flag[room] = true;
		}
		else{
			client.emit("Error","invalid_token");
			client.disconnect();
		}
	}


  	handleJoinInvitation(client: Socket,room: string) {

		const pos  =  this.games.findIndex((game) => game.gameRoom == room);
		client.join(room);
		client.emit('Joined',`Welcome to the room ${room}`);
		client.to(room).broadcast.emit('player_joined', `User ${client.id} has joined the room`);

		this.currConnected[client.id] = true;
		this.users[client.id] = room;
		this.custom_id[client.id] = uuid();
		this.room_status[this.games[pos].gameRoom] = true;
		this.games[pos].players++;	
		
		// this.user_check[client.id] = 'true';
		delete this.room_invited_player_email[room];
  	}
  
	//add1
	handlejoinFirstTime(client:Socket){
		if(this.check[client.id])
	
		{
	
			let gameId = uuid();
		
			this.games.push({
		
				gameRoom: `${gameId}`,
		
				players: 1
		
			})
		
			client.join(gameId);

			this.currConnected[client.id] = true;

			this.users[client.id]=gameId;

			this.custom_id[client.id] = uuid();

			this.room_invite_flag[gameId] = false;
		
			client.emit('joinedGame',`welcome to ${gameId}`)        
	
		}
	
	}


	handleJoin(client:Socket , game: string):void{
	
		client.join(game)
	
		client.emit('joinedRoom',`welcome to ${game}`);
		
		client.to(game).broadcast.emit('joinedRoom',`${client.id} has joined the Game`);
		
		this.currConnected[client.id] = true
	
		this.users[client.id] = game;
	
		this.custom_id[client.id] = uuid();
	
	}

  
  	async handleDisconnect(client: Socket) {

		const user =  await this.user.findOne().where('username').equals(this.clientidwithName[client.id]).exec();
		const game =  await this.passkey.findOne().where('gameid').equals(this.users[client.id]).exec();
		
		if(user){

			user.stars += this.adminBlockStars[client.id]
			
			delete this.adminBlockStars[client.id]

			if(game){

				if((game.card1played && game.client1id === client.id)|| (game.card2played && game.client2id === client.id))
				{
					let returnedTokenId = user.usedCards.pop();
			
					user.notUsedCards.push(returnedTokenId);

					await game.deleteOne();
				}
				
							
			}

			await user.save();

			if(this.currConnected[client.id]){
				const room = this.users[client.id];
				this.wss.to(room).emit('disconnect',`${client.id} disconnected`);
			}

			delete this.currConnected[client.id]
			delete this.users[client.id]
			delete this.custom_id[client.id]

			this.logger.log(`${client.id} disconnected`);
			client.disconnect();
		}
	}

	@SubscribeMessage('chat')
	handlechat(client: Socket, data: string):void 
	{
		if(this.check[client.id])
			{
				const room = this.users[client.id];
				this.wss.to(room).emit('chat', data);
			}
		else client.disconnect();
	}
  

	@SubscribeMessage('invite')
	handleinvite(client: Socket,email:string){
		const room = this.users[client.id];
		const pos  =  this.games.findIndex((game) => game.gameRoom == room);
			
		if(this.games[pos].players<2)
		{	
			this.room_invited_player_email[room] = email;
			client.emit("Success",`Invitation sent to ${email}`);
			this.NotificationService.send_room_code(email);
			
		}
		else
		{
			client.emit('Error','Room full');
			
		}

	}

		
	@SubscribeMessage('End_Game')
	async handleEndGame(client:Socket) {
		const _room = this.users[client.id];
		const pos  =  this.games.findIndex((game) => game.gameRoom == _room);
		


		//DB access

		const game = await this.passkey.findOne().where('gameid').equals(_room).exec();


		if(this.currConnected[client.id] && game && (game.player1address || game.player2address)){

			const user_1 =  await this.user.findOne().where('publickey').equals(game.player1address).exec();

			const user_2 = await this.user.findOne().where('publickey').equals(game.player2address).exec();

			/*---------------------------Card Returning Logic Starts Here-------------------------*/
				
			if(game.card1 !== "empty"){
				let returnedTokenId = user_1.usedCards.pop()

				user_1.notUsedCards.push(returnedTokenId)
			}

			else if(game.card2 !== "empty"){
				let returnedTokenId = user_2.usedCards.pop()

				user_2.notUsedCards.push(returnedTokenId)
			}

			/*-----------------------Card Returning Logic Ends Here-------------------------------*/
					
			/*-----------------------Stars Returning Logic Starts Here-------------------------------*/
				
			if(user_1){
		
				user_1.stars += this.adminBlockStars[game.client1id];
				await user_1.save();
				delete this.adminBlockStars[game.client1id]

				if(user_2){
					user_2.stars += this.adminBlockStars[game.client2id];
					await user_2.save();
					delete this.adminBlockStars[game.client2id]
				}

				else{
			
					const user_2 = await this.user.findOne().where('username').equals(this.clientidwithName[client.id]).exec();
					user_2.stars += this.adminBlockStars[client.id]
					await user_2.save()
					delete this.adminBlockStars[client.id]
				
				}
			}
				
			else if(user_2){

				user_2.stars += this.adminBlockStars[game.client2id];
				await user_2.save();
				delete this.adminBlockStars[game.client2id]
				
				if(user_1){
					user_1.stars += this.adminBlockStars[game.client1id];
					await user_1.save();
					delete this.adminBlockStars[game.client1id]
				}

				else{
					const user_1 = await this.user.findOne().where('username').equals(this.clientidwithName[client.id]).exec();
					user_1.stars += this.adminBlockStars[client.id]
					await user_1.save()
					delete this.adminBlockStars[client.id];
				}
			}
				
			/*-----------------------Stars Returning Logic ends Here-------------------------------*/
			
				
			await game.deleteOne();


		
			delete this.games[pos]
			delete this.room_invite_flag[_room];
			this.currConnected[client.id] = false;
			this.room_status[_room] = false;

			
			//client_2 changes

			const _pos = Object.values(this.users).indexOf(_room);

			const client_2_id = Object.keys(this.users)[_pos];

			this.currConnected[client_2_id] = false;

			//Blockchain part for star transefer from admin

			client.to(_room).broadcast.emit('End_Game', `${client.id} has ended the Game`);
			client.leave(_room);
		

		
		}

		else if(this.currConnected[client.id] === false){
			client.emit('Error',`Enter to a game`);
		}

		else{
		delete this.games[pos]
		delete this.room_invite_flag[_room];
		this.currConnected[client.id] = false;
		this.room_status[_room] = false;
		client.leave(_room);
		}
	}



	@SubscribeMessage('leaveRoom')
	async handleLeaveRoom(client:Socket){

		const room = this.users[client.id];
		const pos  =  this.games.findIndex((game) => game.gameRoom == room);

		delete this.users[client.id];          
		delete this.user_timestamp[client.id];
		delete this.custom_id[client.id];
		delete this.currConnected[client.id];
		this.room_status[room] = false;
		this.games[pos].players--;

		client.to(room).broadcast.emit('Left',`${client.id} has left the room`);
		client.leave(room);
	}


	@SubscribeMessage('show')
	handleshow(): void {
		console.log(`--------------------------------------------`)
		console.log(`client.id : room.id`);
		console.log(this.users);
		console.log(`client.id : timestamp`);
		console.log(this.user_timestamp);
		console.log(`client.id : custom id using uuid()`);
		console.log(this.custom_id);
		console.log(` room_id : Game status in the room`);
		console.log(this.room_status);
		console.log('games');
		console.log(this.games);
		console.log("client.id : check weather they are currently in a room or not")
		console.log(this.currConnected);
		console.log("check");
		console.log(this.check);
		console.log("roomid:invited email")
		console.log(this.room_invited_player_email);
		console.log("room id : true if there is a pending invitation")
		console.log(this.room_invite_flag)
		console.log("client_id : no.of blockstars")
		console.log(this.adminBlockStars)
		console.log(`--------------------------------------------`)
	}

	// @SubscribeMessage('play')
	// handleStart(client:Socket,data:number){
	// 	if(this.user_start == true){
	// 		this.user_start = false;
	// 		this.playgame_1(client,data);
	// 	}
	// 	else{
	// 		this.user_start = true;
	// 		this.playgame_2(client,data);
	// 	}
	// 	setInterval(() => {
			
	// 	}, 20000);
	// }


/*-----------Game logic------------*/
async giveStarstoAdminforPlay(Cl_id,nameinUSERDB)
{
	let noOfStarsHolding = nameinUSERDB.stars;
		
	if(noOfStarsHolding>3)
	{
		nameinUSERDB.stars = noOfStarsHolding-3;
		this.adminBlockStars[Cl_id] = 3
	}
	
	else if(noOfStarsHolding>0 && noOfStarsHolding<=3)
	{
	    nameinUSERDB.stars = 0;
		this.adminBlockStars[Cl_id] = noOfStarsHolding;
	}
	await nameinUSERDB.save();
	
}

async finalResult(gameid:string)
{

	
	var existing_game = await this.match.find({gameid:gameid})
					

	let gameINDB = await this.passkey.findOne({gameid:gameid})
	if(gameINDB.playerWin.length !== 0)
	{
		let newHistory = await this.History.findOne({Game_Id:gameid})					
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
	let gameisfurtherPlay = true;
	let no_of_stars_holdByAdmin = 0;
    
	if(gameAlreadyExist)
	{
		let client1existinGame = false,client2existinGame = false;
		//it means that either client1 or client 2 or both has played
		if(gameAlreadyExist.client1id)
		client1existinGame =true;
		else
		{
		client1existinGame = false
		let Firstgame =  await this.user.findOne({username:this.clientidwithName[client.id]})
		if( Firstgame && Firstgame.stars <= 0)
		{
			gameisfurtherPlay = false
			const newHistory = await this.History.findOne({"Game_Id": obj.gameid});
			newHistory.Status = "Aborted";
			await newHistory.save();
			this.handleEndGame(client)
		}
		else
		{
			this.giveStarstoAdminforPlay(client.id,Firstgame);
		}
		}

		if(gameAlreadyExist.client2id)
		client2existinGame = true;
		else
		{
		client2existinGame = false
		let Firstgame =  await this.user.findOne({username:this.clientidwithName[client.id]})
		if( Firstgame && Firstgame.stars <= 0)
		{
			gameisfurtherPlay = false
			const newHistory = await this.History.findOne({"Game_Id": this.users[client.id]});
			newHistory.Status = "Aborted";
			await newHistory.save();
			this.handleEndGame(client);
		}
		else
		{
			this.giveStarstoAdminforPlay(client.id,Firstgame);
		}
		}
		
		if(client1existinGame && client2existinGame)
		{
			no_of_stars_holdByAdmin = this.adminBlockStars[client.id]
			if(no_of_stars_holdByAdmin <= 0)
			gameisfurtherPlay = false

		if(!gameisfurtherPlay)
		{
			const newHistory = await this.History.findOne({"Game_Id": obj.gameid});
			this.finalResult(this.users[client.id])
			newHistory.Status = "Aborted";
			await newHistory.save();
			this.handleEndGame(client)
		}
	}
}
	else
	{    //it run only once when no game exist
		  let Firstgame =  await this.user.findOne({username:this.clientidwithName[client.id]})
		  console.log(Firstgame);
		  if(Firstgame.stars <= 0)
		  {
			gameisfurtherPlay = false
			this.handleEndGame(client)
		  }
		  else
		  {
			this.giveStarstoAdminforPlay(client.id,Firstgame);
		  }
	}

	if(gameisfurtherPlay)
	{
		console.log("Everything running fine")
		let carddetail: string | string[];
		carddetail = await detailOfCard(data); 
	    console.log(carddetail+"   "+carddetail[0]+"   "+carddetail[1]);

	    let givenCardType: string
        (carddetail[0] === "1")?(givenCardType="ROCK"):(
									(carddetail[0] === "2")?(givenCardType="PAPER"):(
																		(carddetail[0] === "3")?(givenCardType = "SCISSOR"):givenCardType="none"))
																		
		let gameid = obj.gameid;
        if(givenCardType == CardStatus.PAPER || givenCardType == CardStatus.ROCK || givenCardType == CardStatus.SCISSOR)
		{
			let gameexist = await this.passkey.findOne({gameid:gameid})
            let nameinUSERDB = await this.user.findOne({username:this.clientidwithName[client.id]})
	
			//find index of given card
			let indexofCard = (nameinUSERDB.notUsedCards.indexOf(data))
	        console.log(indexofCard)
	
			if(gameexist && gameexist.client1id && gameexist.client2id && indexofCard !== -1)
			{	
				//1st round is completed successfully
				if(!gameexist.card1played)
			   {
				    gameexist.card1 = givenCardType;
				    gameexist.token1 = data;
					gameexist.card1played = true;
					await gameexist.save();

			   }
			   else if(!gameexist.card2played)
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
				const newHistory = new this.History({
					Game_Id:gameid,
					Start_Date:new Date(),
					Status:"Active"
				})
				try 
				{
					await newHistory.save();
				} 
				catch (error)
				{	
					console.log(error);
				}
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
			gameexist = await this.passkey.findOne({gameid:gameid});

			if(gameexist && gameexist.card1played && gameexist.card2played)
            {
				
				let newHistory = await this.History.findOne({Game_Id:gameid});
				let gameINDB = await this.passkey.findOne({gameid:gameid});

				const user1name = gameINDB.user1;
				const user2name = gameINDB.user2;
				const user1card = gameINDB.card1;
				const user2card = gameINDB.card2;
				let   token1    = gameINDB.token1;
				let   token2    = gameINDB.token2;

				newHistory.Player_1 = user1name;
				newHistory.Player_2 = user2name;
				await newHistory.save();
			
				let gameResult = await  this.playservice.play(gameid);

				const userno1 = await this.user.find({username:user1name});
				const userno2 = await this.user.find({username:user2name});

				this.adminBlockStars[gameINDB.client1id]--;
				this.adminBlockStars[gameINDB.client2id]--;

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

				/******************************************************************/
				if(gameINDB.playerWin.length === 1){
					newHistory.Result_1.Player_1.Card_Type = user1card;
					newHistory.Result_1.Player_1.Card_No = token1;

					newHistory.Result_1.Player_2.Card_Type = user2card;
					newHistory.Result_1.Player_2.Card_No = token2;

					newHistory.Total_Rounds = 1;
					await newHistory.save();
				}
				if(gameINDB.playerWin.length === 2){
					newHistory.Result_2.Player_1.Card_Type = user1card;
					newHistory.Result_2.Player_2.Card_No = token2;
					
					newHistory.Result_2.Player_2.Card_Type = user2card;
					newHistory.Result_2.Player_2.Card_No = token2;

					newHistory.Total_Rounds = 2;
					await newHistory.save();
				}
				/******************************************************************/

				if(gameINDB.playerWin.length === 3)

				{
					newHistory.Result_3.Player_1.Card_Type = user1card;
					newHistory.Result_3.Player_1.Card_No = token1;
					
					newHistory.Result_3.Player_2.Card_Type = user2card;
					newHistory.Result_3.Player_2.Card_No = token2;
					
					newHistory.Total_Rounds = 3;
			
					newHistory.Status = "Completed";
					newHistory.End_Date = new Date();
					newHistory.Last_Updated_Date = new Date();

					await newHistory.save();
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




		// Join Public game starts here  -----  
		  @SubscribeMessage('Public')
		  async startpublicgame(client:Socket, data:Object){
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
			   console.log(existing_game.length);

			   if(existing_game.length > 0){

				if(stars>=3){
					stars = stars-3;
				}
				
				await  this.match.updateOne({gameid:existing_game[0].gameid},{$set:{'player2.username': userdetails.username, 'player2.publicaddress':userdetails.publickey,'stars_of_player2':stars,'player_joined':2,"status":"active"}}, function(err,data){
					 if( err) console.log(err)
				 })

				 var response = await this.match.findOne().where('gameid').equals(existing_game[0].gameid).exec()

				client.emit("new_match_response", response);
			   }
				else if( stars > 0 &&  card_details >0 ){

					if(stars>=3){
						stars = stars-3;
					}
					  const match = new this.match({
						gameid:uuid(),
						match_type:data.match_type,
						stars_of_player1:stars,
						stars_of_player2:0,
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
					 }
					)

					  await match.save(function(err,data){

						if (err) return "Error while creating match";

						else {
							client.emit("new_match_response", data);
						}
					  });

					}

			}
			catch{
                
				console.log("Invalid user") // Later pass this as event back to client
				client.emit("new_match_response", "Invalid user");
			}

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
				data ={
					response:401,
					message:"Invalid User"
				}
                client.emit('match_details',response)
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
				  
		
				//    client.leave(data.roomID, async () =>{
					//    console.log(Object.keys(data.roomID));
					//    console.log(`user left ${data.roomID}`);
					client.join(room, await function(err){
						if(err) throw err;
						else {console.log("hi")
						client.to(room).emit('start_match_response', `User ${client.id} has joined the room`);
						client.to(room).emit('start_match_response', `User ${client.id} has joined the room`);
					  
					  }
			 });
				//    })
				   
					console.log(Object.keys(client));
					console.log(client.rooms);
					
					console.log("This was hit");
					client.emit('start_match_response',`Joined ${userdetails.username} and gane room is ${room}`);
                    
				}
			}
			catch{

				data ={
					response:401,
					message:"Invalid User"
				}
                client.emit('start_match_response',data)

			}

		}

		@SubscribeMessage("activerooms")
        async activerooms(client:Socket, data:Object){
				
				var roo = data.gameid;
				console.log(roo);
				console.log(client.rooms);

				client.to("c29b47d8-e7c9-4636-8a06-9baac2d97047").emit('activerooms_response', "THhis is the message");
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

				data ={
					response:401,
					message:"Invalid User"
				}
                client.emit('leave_match_response',data)

			}
		 }


		 @SubscribeMessage('Disconnect')
 		async disconnect(client:Socket, data:Object){
			var token = data.jwt_token; 
			console.log(data);
			const decryptedvalue = <JwtPayLoad>jwt.verify(token,this.configservice.get<string>('JWT_SECRET'));
			let userdetails = await this.jwtstrategy.validate(decryptedvalue);
			try{
				client.connected = false;
			}
			catch{

				data ={
					response:401,
					message:"Invalid User"
				}
                client.emit('Disconnect_response',data)

			}
		 }
}