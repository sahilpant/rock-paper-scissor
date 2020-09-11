import { Module } from '@nestjs/common';
import { PlayController } from './play.controller';
import { PlayService } from './play.service';
import { MongooseModule,} from '@nestjs/mongoose';
import { passKey } from 'src/schemas/passkey.model';

@Module({

  imports:[MongooseModule.forFeature([{name:'user',schema:'user'},{name: 'passkey' , schema: passKey}])],

  controllers: [PlayController],
  
  providers: [PlayService]

})

export class PlayModule {}
