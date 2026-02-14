import { Controller, HttpCode, HttpException, HttpStatus, Post, Query } from '@nestjs/common'
import { IdentityService } from './identity.service'

@Controller()
export class IdentityController {
  constructor(private readonly identityService: IdentityService) {}

  @Post('auth')
  @HttpCode(200)
  async authenticateIdentity(@Query('token') token: string) {
    if (!token) throw new HttpException({ reason: 'Missing token' }, HttpStatus.FORBIDDEN)
    return this.identityService.authenticateIdentity(token)
  }
}
