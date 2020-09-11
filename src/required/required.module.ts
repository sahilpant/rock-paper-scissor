import { Module } from '@nestjs/common';
import { username } from './dto/username.dto';
import { cards } from './interfaces/cards.interface';
import { passkey } from './interfaces/passkey.interface';
import { user } from './interfaces/user.interface';

@Module({})
export class RequiredModule {
    export:[username,cards,passkey,user]
}
