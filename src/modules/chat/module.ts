import { Module } from '@nestjs/common';
import { chatProviders } from './providers';
import { DatabaseModule } from '../database/module';
@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [...chatProviders],
  exports: [...chatProviders],
})
export class ChatModule {}
