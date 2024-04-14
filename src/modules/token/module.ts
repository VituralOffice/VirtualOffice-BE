import { Module } from '@nestjs/common';
import { ISecretsService } from 'src/modules/global/secrets/adapter';
import { SecretsModule } from 'src/modules/global/secrets/module';

import { ITokenRepository, ITokenService } from './adapter';
import { TokenService } from './service';
import { Connection, Model } from 'mongoose';
import { Token, TokenDocument, TokenSchema } from './schema';
import { TokenRepository } from './repository';
import { getConnectionToken } from '@nestjs/mongoose';
import { ConnectionName } from '../database/enum';

@Module({
  imports: [SecretsModule],
  providers: [
    {
      provide: ITokenService,
      useFactory: (secret: ISecretsService, tokenRepository: ITokenRepository) =>
        new TokenService(secret, tokenRepository),
      inject: [ISecretsService, ITokenRepository],
    },
    {
      provide: ITokenRepository,
      useFactory: (connection: Connection) =>
        new TokenRepository(connection.model(Token.name, TokenSchema) as unknown as Model<TokenDocument>),
      inject: [getConnectionToken(ConnectionName.AUTH)],
    },
  ],
  exports: [ITokenService],
})
export class TokenModule {}
