import { Controller, Headers, HttpCode, Param, Post, Put, Req } from '@nestjs/common'
import { UploadService } from './upload.service'

@Controller()
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('c/:uuid/:numberChunks')
  async getCredentials(
    @Param('uuid') uuid: string,
    @Param('numberChunks') numberChunks: string,
    @Headers() headers: Record<string, string>
  ) {
    await this.uploadService.getCredentials({
      uuid,
      numberChunks: Number(numberChunks),
      headers,
    })

    return { ok: true }
  }

  @Put('u/:fileId/:chunkNumber')
  async uploadChunk(
    @Param('fileId') fileId: string,
    @Param('chunkNumber') chunkNumber: string,
    @Headers() headers: Record<string, string>
  ) {
    return { ok: true }
  }

  @Post('auth')
  @HttpCode(200)
  async handleIdentity(@Req() req: any) {
    const token = req.query?.token

    if (!token) {
      throw new Error('Missing token')
    }

    return this.uploadService.handleIdentity(token)
  }
}
