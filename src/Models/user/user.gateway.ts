import { Logger, BadRequestException } from '@nestjs/common'
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets'
import { AuthGuard } from '../user/user.guards'

@WebSocketGateway({namespace:'/noti'})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor( public readonly authService: AuthGuard) {}
  @WebSocketServer()
  wss

  private logger = new Logger('WebSockets')

  async handleConnection(client) {
    client.emit('connection', 'Successfully connected to server')
    client.on('user', async data => {

      try {
        const user = (await this.authService.validateToken('Bearer ' + data)) as any
        console.log(user)
          this.logger.log(`New client connected ${client.id}`)
         } catch (err) {
        throw new BadRequestException(err.message)
      }
    })
  }

  async handleDisconnect(client) {
    this.logger.log(`Client disconnected ${client.id}`)
  }
}
