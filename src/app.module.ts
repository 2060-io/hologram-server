import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import appConfig from '@/config/app.config'
import { UploadModule } from './identity'

@Module({
  imports: [
    UploadModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
