import { Module } from '@nestjs/common'

import { IdentityController } from './identity.controller'
import { IdentityAuthService } from './identity.service'

@Module({
  controllers: [IdentityController],
  providers: [IdentityAuthService],
})
export class UploadModule {}
