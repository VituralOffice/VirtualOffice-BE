import { Module } from '@nestjs/common';
import { SecretsModule } from 'src/modules/global/secrets/module';

import { DatabaseModule } from '../database/module';
import { tokenProviders } from './providers';

@Module({
  imports: [DatabaseModule, SecretsModule],
  providers: tokenProviders,
  exports: [...tokenProviders],
})
export class TokenModule {}
