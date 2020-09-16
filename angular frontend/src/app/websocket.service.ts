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

     this.socket.emit('handler',"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImhpbWFuc2h1MDAwQGdtYWlsLmNvbSIsInVzZXJuYW1lIjoiaGltYW5zaHUiLCJpYXQiOjE2MDAxNzYzMzIsImV4cCI6MTYwMDE3OTkzMn0.gIlhjPJ3xS7JZdrAt7phRW1ltrKbeyiXnKIdMJ-iwCg")
   }

   

}
