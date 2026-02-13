import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as admin from 'firebase-admin'
import * as fs from 'fs'

@Injectable()
export class IdentityAuthService {
  private admin: admin.app.App
  private readonly logger = new Logger(IdentityAuthService.name)
  constructor(private configService: ConfigService) {
    this.admin = admin.initializeApp({
      credential: admin.credential.cert(this.getFirebaseConfig()),
    })
  }

  async authenticateIdentity(token: string) {
    try {
      await this.admin.appCheck().verifyToken(token)
      this.logger.log('[authenticateIdentity] Token verified successfully')
      return {
        user: 'minioadmin',
        maxValiditySeconds: 900,
        claims: {},
      }
    } catch (error) {
      let reason = 'Invalid Firebase token'
      if (error?.message?.includes('expired')) reason = 'Firebase token expired'
      if (error?.message?.includes('malformed')) reason = 'Malformed Firebase token'
      this.logger.error('[authenticateIdentity] Token verification failed:', error)
      throw new HttpException({ reason }, HttpStatus.FORBIDDEN)
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
