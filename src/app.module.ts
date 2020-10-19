import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {MongooseModule} from '@nestjs/mongoose'
import { NotificationModule } from './notification/notification.module';
import { RegisterModule } from './register/register.module';
import {ConfigModule,ConfigService} from '@nestjs/config'
import {  configss } from './Config/configuration';
import configuration from './Config/configuration';
import { UserModule } from './Models/user/user.module';
import { SocketModule } from './Models/socket/socket.module';
import { RequiredModule } from './required/required.module';
import { PlayModule } from './play/play.module';
import { AppGateway } from './app.gateway';
import { TestGateway } from './test.gateway';
import {RedisModule} from 'nestjs-redis'
import { user } from './schemas/user.model';
import { passKey } from './schemas/passkey.model';
import { PlayService } from './play/play.service';
import {JwtModule} from '@nestjs/jwt'
import {PassportModule} from '@nestjs/passport'
import { jwtStrategy } from './jwt.strategy';
import { NotificationService } from './notification/notification.service';
import { join } from "path"
import { History } from './schemas/History.model';
import {match} from './schemas/match'
import { BiddingModule } from './bidding/bidding.module';

@Module({

  imports: [
    

    NotificationModule,

    MongooseModule.forFeature([{ name: 'user', schema: user },{name: 'passkey' , schema: passKey},{name:'History',schema: History},{name:'match', schema:match}]),

    // RedisModule.register

    // ({

    //   name:'test',

    //   url: 'redis://localhost:6379',

    //   port:6379,

    // }),

    RegisterModule,

    ConfigModule.forRoot

    ({

      isGlobal:true,

      envFilePath:[join(__dirname, "/env","/.env").split('dist').join('').replace(/\\/g, "//"), join(__dirname, "/env","/development.env").split('dist').join('').replace(/\\/g, "//"),],

      load:[configuration]

    }),

    MongooseModule.forRootAsync

    ({

      useFactory: (configService: ConfigService) =>

      ({

        uri:configService.get<string>('URL')

      }),

      inject: [ConfigService],

    }),
    
    RequiredModule,
    
    UserModule,
    
    SocketModule,
    
    PlayModule,
    
    PassportModule.register({ defaultStrategy:'jwt'}),
    
    JwtModule.register({
    
      secret: "hello",
    
      signOptions:{ expiresIn:3600, },
   
    }),
    
    BiddingModule,
  
  ],
  
  controllers: [AppController],
  
  providers: [AppService,TestGateway,AppGateway,configss,PlayService,jwtStrategy,NotificationService],
  
  exports:[jwtStrategy,TestGateway]

})

export class AppModule {}
