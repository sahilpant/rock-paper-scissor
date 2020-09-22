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

     this.socket.emit('handler',"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVpIiwidXNlcm5hbWUiOiJ0ZXN0MyIsInJvbGUiOiJQTEFZRVIiLCJpYXQiOjE2MDA3NzIyNTcsImV4cCI6MTYwMDc3NTg1N30.dmonBxa3WMKszARMb438NMDkejpDFrUgVmxdEQTlDbY")
   }

   

}
