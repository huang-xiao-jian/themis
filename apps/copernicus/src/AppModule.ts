import { Module } from '@nestjs/common';
import { AppController } from './AppController.js';
import { AppService } from './AppService.js';

@Module({
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
