import { AssumeRoleCommand, STSClient } from '@aws-sdk/client-sts'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {}

  public async onChunkUpload(arg0: { fileId: string; chunkNumber: number; headers: Record<string, string> }) {
    const _credentials = await this.getTemporaryCredentials()
  }
  public onFileCreate(arg0: { uuid: string; numberChunks: number; headers: Record<string, string> }) {}

  async getTemporaryCredentials() {
    const accessKeyId = this.configService.get<string>('appConfig.bucketAccessId')
    const secretAccessKey = this.configService.get<string>('appConfig.bucketAccessKey')

    if (!accessKeyId || !secretAccessKey) {
      throw new Error('Bucket credentials are not configured')
    }
    const stsClient = new STSClient({
      endpoint: this.configService.get<string>('appConfig.bucketServer'),
      region: this.configService.get<string>('appConfig.bucketRegion'),
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    })
    const command = new AssumeRoleCommand({
      RoleArn: 'arn:xxx:xxx:xxx:xxxx',
      RoleSessionName: 'minio',
      DurationSeconds: 3600,
      // Policy es opcional si el rol ya la tiene
    })
    const data = await stsClient.send(command)

    if (!data.Credentials) {
      throw new Error('Failed to get temporary credentials')
    }
    return data.Credentials
  }
}
