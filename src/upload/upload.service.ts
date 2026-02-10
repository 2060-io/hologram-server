import { Injectable } from '@nestjs/common'

import { CreateUploadDto } from './dto/create-upload.dto'
import { S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { AssumeRoleCommand, GetSessionTokenCommand, STSClient } from '@aws-sdk/client-sts';

@Injectable()
export class UploadService {
  constructor(
    private configService: ConfigService,
  ) {}

  public async onChunkUpload(arg0: { fileId: string; chunkNumber: number; headers: Record<string, string>; }) {
    const credentials = await this.getTemporaryCredentials();
    console.log(credentials, null, 2)
    
  }
  public onFileCreate(arg0: { uuid: string; numberChunks: number; headers: Record<string, string> }) {
    console.log('Requesting upload with onFileCreate')
  }

  async getTemporaryCredentials() {
    try {
        const stsClient = new STSClient({
          endpoint: this.configService.get('appConfig.bucketServer'),
          region: this.configService.get('appConfig.bucketRegion'),
          credentials: {
            accessKeyId: this.configService.get('appConfig.bucketAccessId'),
            secretAccessKey: this.configService.get('appConfig.bucketAccessKey'),
          },
        });
        const command = new AssumeRoleCommand({
          RoleArn: "arn:xxx:xxx:xxx:xxxx",
          RoleSessionName: "minio",
          DurationSeconds: 3600,
          // Policy es opcional si el rol ya la tiene
        });
        const data = await stsClient.send(command);

        if (!data.Credentials) {
            throw new Error("Failed to get temporary credentials");
        }

        console.log("Successfully obtained temporary credentials.");
        return data.Credentials;
    } catch (error) {
      console.error('Error getting temporary credentials:', error);
      throw error;
    }
  }

}
