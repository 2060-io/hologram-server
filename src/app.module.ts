import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import appConfig from '@/config/app.config'
import { IdentityService } from './identity'

@Module({
  imports: [
    IdentityService,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
