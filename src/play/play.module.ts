import { Module } from '@nestjs/common';
import { PlayController } from './play.controller';
import { PlayService } from './play.service';
import { MongooseModule,} from '@nestjs/mongoose';
import { passKey } from 'src/schemas/passkey.model';
import { match } from 'src/schemas/match';

@Module({

  imports:[MongooseModule.forFeature([{name:'user',schema:'user'},{name: 'passkey' , schema: passKey},{name:'match', schema:match}])],

  controllers: [PlayController],
  
  providers: [PlayService]

})

export class PlayModule {}
