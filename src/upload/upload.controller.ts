import { Controller, Headers, Param, Post, Put } from '@nestjs/common'

import { UploadService } from './upload.service'

@Controller()
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('c/:uuid/:numberChunks')
  async fileCreate(
    @Param('uuid') uuid: string,
    @Param('numberChunks') numberChunks: string,
    @Headers() headers: Record<string, string>
  ) {
    await this.uploadService.onFileCreate({
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
    await this.uploadService.onChunkUpload({
      fileId,
      chunkNumber: Number(chunkNumber),
      headers,
    })

    return { ok: true }
  }
}
