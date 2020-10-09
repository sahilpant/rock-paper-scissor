import { Injectable } from '@angular/core';
import {map} from 'rxjs/operators'
import {Socket} from 'ngx-socket-io'
@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  constructor(private socket:Socket) { }
 
   onConnection(){
     this.socket.on('connection',data=> console.log(data))
   }

   handlereq(){

     this.socket.emit('handler',"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RfMTBAZW1haWwuY29tIiwidXNlcm5hbWUiOiJ0ZXN0XzEwIiwicm9sZSI6IlBMQVlFUiIsImlhdCI6MTYwMjE1MTg5MSwiZXhwIjoxNjAyMTU1NDkxfQ.n3i7cjcqsdxS_nc4gqvqiGosTosuFG5sTVgQCQUA83c")
   }

   

}
