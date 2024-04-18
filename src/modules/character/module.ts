import { Module } from '@nestjs/common';
import { CharacterController } from './controller';
import { DatabaseModule } from '../database/module';
import { characterProviders } from './providers';

@Module({
  imports: [DatabaseModule],
  controllers: [CharacterController],
  providers: [...characterProviders],
  exports: [...characterProviders],
})
export class CharacterModule {}
