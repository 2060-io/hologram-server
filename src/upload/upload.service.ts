import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as admin from 'firebase-admin'
import * as fs from 'fs'

@Injectable()
export class UploadService {
  private admin: admin.app.App
  private readonly logger = new Logger(UploadService.name)
  constructor(private configService: ConfigService) {
    this.admin = admin.initializeApp({
      credential: admin.credential.cert(this.getFirebaseConfig()),
    })
  }

  public async getCredentials(args: { uuid: string; numberChunks: number; headers: Record<string, string> }) {
    const bucketServer = this.configService.get<string>('appConfig.bucketServer')
    if (!bucketServer) throw new Error('Bucket credentials are not configured')

    const appCheckToken =
      args.headers['x-firebase-appcheck'] || args.headers['x-firebase-app-check'] || args.headers['x-fire']

    if (!appCheckToken) {
      throw new Error('Missing Firebase App Check token')
    }

    const params = new URLSearchParams({
      Action: 'AssumeRoleWithCustomToken',
      Version: '2011-06-15',
      Token: appCheckToken,
      DurationSeconds: '900',
      RoleArn: 'arn:minio:iam:::role/idmp-mobile-app',
    })

    const url = `${bucketServer}?${params.toString()}`
    const response = await fetch(url, {
      method: 'POST',
    })

    const xml = await response.text()
    if (!response.ok) {
      throw new Error(`STS error: ${xml}`)
    }
    return xml
  }

  async handleIdentity(token: string) {
    try {
      await this.admin.appCheck().verifyToken(token)
      this.logger.log('[handleIdentity] Token verified successfully:')
      return {
        user: 'minioadmin',
        maxValiditySeconds: 900,
        claims: {},
      }
    } catch (error) {
      let reason = 'Invalid Firebase token';
      if (error?.message?.includes('expired')) reason = 'Firebase token expired';
      if (error?.message?.includes('malformed')) reason = 'Malformed Firebase token';
      throw new HttpException(
        { reason },
        HttpStatus.FORBIDDEN,
      );

    }
  }

  private getFirebaseConfig() {
    try {
      this.logger.log(`[getFirebaseConfig] Initialize upload firebase config`)
      const firebasePath = this.configService.get('appConfig.firebaseCfgFile')
      const filePath = `${firebasePath}`

      if (!fs.existsSync(filePath)) {
        this.logger.error(`[getFirebaseConfig] Firebase file not found at path: ${filePath}`)
        return null
      }

      const jsonData = fs.readFileSync(filePath, 'utf8')

      if (jsonData) {
        this.logger.log(`[getFirebaseConfig] the firebase config was read correctly`)
      }
      const firebaseConfig = JSON.parse(jsonData)

      return firebaseConfig
    } catch (error) {
      this.logger.error('[getFirebaseConfig] Error reading JSON file:', error.message)
      return null
    }
  }
}
