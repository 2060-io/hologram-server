import { AssumeRoleCommand, STSClient } from '@aws-sdk/client-sts'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {}

  public async getCredentials(args: { uuid: string; numberChunks: number; headers: Record<string, string> }) {
    const accessKeyId = this.configService.get<string>('appConfig.bucketAccessId')
    const secretAccessKey = this.configService.get<string>('appConfig.bucketAccessKey')
    if (!accessKeyId || !secretAccessKey) throw new Error('Bucket credentials are not configured')

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
      DurationSeconds: 43200,
    })
    const data = await stsClient.send(command)

    if (!data.Credentials) {
      throw new Error('Failed to get temporary credentials')
    }
    return data.Credentials
  }
}
