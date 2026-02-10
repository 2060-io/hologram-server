import { Module } from '@nestjs/common'

import { MinioService } from './services/minio/minio.service'
import { UploadModule } from './upload/upload.module'
import { ConfigModule } from '@nestjs/config'
import appConfig from '@/config/app.config'

@Module({
  imports: [
    UploadModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
  ],
  controllers: [],
  providers: [MinioService],
})
export class AppModule {}
