import { Component } from '@angular/core';
import {Socket} from 'ngx-socket-io';
import { WebsocketService} from './websocket.service'
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private webSocketservice:WebsocketService,
    private socket:Socket){
    this.webSocketservice.onConnection()
    this.socket.on('return',data=> console.log(data))
    this.socket.on('listen', data => console.log(data))
    this.socket.on('new_match_response', data => console.log(data))
    this.socket.on('match_details', data => console.log(data))
    this.socket.on('start_match_response', data => console.log(data))
    
  }
  
    extra(){  
      console.log("hit")
      this.webSocketservice.handlereq();
    }

    test(){
      this.webSocketservice.testmessage();
    }
     public(){

      this.webSocketservice.public();
     }  

     matchdetails(){
       this.webSocketservice.matchdetails()
     }

     startmatch(){
      this.webSocketservice.startmatch()
     }

  title = 'ngapp';
}
