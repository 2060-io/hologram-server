import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import admin from 'firebase-admin'
import * as fs from 'fs'

@Injectable()
export class IdentityService {
  private admin?: admin.app.App
  private readonly appCheckVerify: boolean
  private readonly logger = new Logger(IdentityService.name)
  constructor(@Inject(ConfigService) private configService: ConfigService) {
    this.appCheckVerify = this.configService.get<boolean>('appConfig.appCheckVerify') ?? true
    if (!this.appCheckVerify) {
      this.logger.warn('[IdentityService] App Check verification is disabled. Use this mode for tests only')
    }

    const firebaseCfgFile = `${this.configService.get('appConfig.firebaseCfgFile')}`
    const projectId = this.configService.get<string>('appConfig.firebaseProjectId')

    if (fs.existsSync(firebaseCfgFile)) {
      this.admin = admin.initializeApp({
        credential: admin.credential.cert(this.getFirebaseConfig(firebaseCfgFile)),
      })
    } else if (projectId) {
      // App Check verification checks the token signature against a public JWKS. It needs no credential.
      this.logger.log(`[IdentityService] Initialize firebase with the project id: ${projectId}`)
      this.admin = admin.initializeApp({ projectId })
    } else if (this.appCheckVerify) {
      throw new Error(
        `[IdentityService] No Firebase configuration found. Set FIREBASE_CFG_FILE to an existing file (current path: ${firebaseCfgFile}), or set FIREBASE_PROJECT_ID, or set APP_CHECK_VERIFY=false for tests`
      )
    }
  }

  async authenticateIdentity(token: string) {
    if (this.appCheckVerify) {
      try {
        if (!this.admin) throw new Error('Firebase is not initialized')
        await this.admin.appCheck().verifyToken(token)
        this.logger.log('[authenticateIdentity] Token verified successfully')
      } catch (error) {
        let reason = 'Invalid Firebase token'
        if (error?.message?.includes('expired')) reason = 'Firebase token expired'
        if (error?.message?.includes('malformed')) reason = 'Malformed Firebase token'
        this.logger.error('[authenticateIdentity] Token verification failed:', error)
        throw new HttpException({ reason }, HttpStatus.FORBIDDEN)
      }
    } else {
      this.logger.warn('[authenticateIdentity] App Check verification is disabled. The token is accepted as valid')
    }

    return {
      user: 'mobile-app',
      maxValiditySeconds: this.configService.get('appConfig.maxValiditySeconds'),
      claims: {},
    }
  }

  private getFirebaseConfig(filePath: string) {
    try {
      this.logger.log(`[getFirebaseConfig] Initialize upload firebase config`)

      const jsonData = fs.readFileSync(filePath, 'utf8')

      if (jsonData) {
        this.logger.log(`[getFirebaseConfig] the firebase config was read correctly`)
      }

      return JSON.parse(jsonData)
    } catch (error) {
      this.logger.error('[getFirebaseConfig] Error reading JSON file:', error.message)
      throw new Error(`[getFirebaseConfig] Cannot read the Firebase configuration file ${filePath}: ${error.message}`)
    }
  }
}
