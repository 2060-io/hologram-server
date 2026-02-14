import { registerAs } from '@nestjs/config'

/**
 * Configuration for the application, including ports, database URIs, and service URLs.
 *
 * @returns {object} - An object containing the configuration settings for the application.
 */
export default registerAs('appConfig', () => ({
  /**
   * The port number on which the application will run.
   * Defaults to 5000 if APP_PORT is not set in the environment variables.
   * @type {number}
   */
  appPort: parseInt(process.env.APP_PORT ?? '3000', 10),

  bucketServer: process.env.BUCKET_SERVER || 'https://s3.minio.dev.2060.io',

  bucketRegion: process.env.BUCKET_REGION || 'us-east-1',

  firebaseCfgFile: process.env.FIREBASE_CFG_FILE || './firebase-config.json',

  maxValiditySeconds: parseInt(process.env.MAX_VALIDITY_SECONDS ?? '900', 10),
}))
