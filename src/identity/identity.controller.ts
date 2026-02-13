import { Controller, HttpCode, Post, Query } from '@nestjs/common'
import { IdentityAuthService } from './identity.service'

@Controller()
export class IdentityController {
  constructor(private readonly identityService: IdentityAuthService) {}

  @Post('auth')
  @HttpCode(200)
  async authenticateIdentity(@Query('token') token: string) {
    if (!token) {
      throw new Error('Missing token')
    }

    return this.identityService.authenticateIdentity(token)
  }
}
