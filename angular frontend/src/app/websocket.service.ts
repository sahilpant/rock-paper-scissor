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

     this.socket.emit('handler',"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVpIiwidXNlcm5hbWUiOiJ0ZXN0MyIsInJvbGUiOiJQTEFZRVIiLCJpYXQiOjE2MDEwMzc0MDYsImV4cCI6MTYwMTA3MzQwNn0.PjpqPvRxJMYRJHN1chLCflI2GJ4k-N2P09S0gGNPdCE")
   }

   

}
