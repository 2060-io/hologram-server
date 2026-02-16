import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import appConfig from '@/config/app.config'
import { IdentityModule } from './identity'

@Module({
  imports: [
    IdentityModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
