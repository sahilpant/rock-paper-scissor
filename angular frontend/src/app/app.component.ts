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
  }
  
    extra(){
      this.webSocketservice.handlereq();
    }

  title = 'ngapp';
}
