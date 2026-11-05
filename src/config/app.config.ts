import { registerAs } from '@nestjs/config'

/**
 * Configuration for the application, including ports, database URIs, and service URLs.
 *
 * @returns {object} - An object containing the configuration settings for the application.
 */
export default registerAs('appConfig', () => ({
  /**
   * The port number on which the application will run.
   * Defaults to 3000 if APP_PORT is not set in the environment variables.
   * @type {number}
   */
  appPort: parseInt(process.env.APP_PORT ?? '3000', 10),

  bucketServer: process.env.BUCKET_SERVER || 'localhost:9000',

  bucketRegion: process.env.BUCKET_REGION || 'us-east-1',

  firebaseCfgFile: process.env.FIREBASE_CFG_FILE || './firebase-config.json',

  // Initializes firebase-admin when no Firebase configuration file exists.
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID,

  // Disable App Check token verification for tests only.
  appCheckVerify: process.env.APP_CHECK_VERIFY !== 'false',

  maxValiditySeconds: parseInt(process.env.MAX_VALIDITY_SECONDS ?? '900', 10),
}))
