import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { AssumeRoleCommand, Credentials, STSClient } from '@aws-sdk/client-sts'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class UploadService {
  private readonly credentialsCache = new Map<string, Credentials>()
  constructor(private configService: ConfigService) {}

  public async onChunkUpload(args: { fileId: string; chunkNumber: number; headers: Record<string, string> }) {
    const credentials = this.credentialsCache.get(args.fileId)

    if (!credentials) {
      throw new Error('Temporary credentials not found for file')
    }

    const s3 = this.createS3Client(credentials)

    await s3.send(
      new PutObjectCommand({
        Bucket: 'public',
        Key: `${args.fileId}/init`,
        Body: 'file initialized',
      })
    )
  }
  public async onFileCreate(args: { uuid: string; numberChunks: number; headers: Record<string, string> }) {
    let credentials = this.credentialsCache.get(args.uuid)

    if (!credentials) {
      credentials = await this.getTemporaryCredentials()
      this.credentialsCache.set(args.uuid, credentials)
    }

    return credentials
  }

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
    })
    const data = await stsClient.send(command)

    if (!data.Credentials) {
      throw new Error('Failed to get temporary credentials')
    }
    return data.Credentials
  }

  private createS3Client(credentials: Credentials): S3Client {
    return new S3Client({
      endpoint: this.configService.get<string>('appConfig.bucketServer'),
      region: this.configService.get<string>('appConfig.bucketRegion'),
      forcePathStyle: true,
      credentials: {
        accessKeyId: credentials.AccessKeyId!,
        secretAccessKey: credentials.SecretAccessKey!,
        sessionToken: credentials.SessionToken!,
      },
    })
  }
}
