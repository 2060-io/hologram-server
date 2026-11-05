import { HttpException, HttpStatus, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import admin from 'firebase-admin'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, type MockInstance, vi } from 'vitest'
import { IdentityService } from './identity.service'

const { verifyToken } = vi.hoisted(() => ({ verifyToken: vi.fn() }))

vi.mock('firebase-admin', () => ({
  default: {
    initializeApp: vi.fn(() => ({ appCheck: () => ({ verifyToken }) })),
    credential: { cert: vi.fn((serviceAccount) => ({ mockCredential: serviceAccount })) },
  },
}))

const serviceAccount = {
  type: 'service_account',
  project_id: 'hologram-cert-project',
  private_key_id: 'key-id',
  private_key: 'private-key',
  client_email: 'sa@hologram-cert-project.iam.gserviceaccount.com',
}

const identityPayload = { user: 'mobile-app', maxValiditySeconds: 900, claims: {} }

let tmpDir: string
let certFilePath: string
let missingFilePath: string
let warnSpy: MockInstance

function createService(overrides: Record<string, unknown> = {}) {
  const values: Record<string, unknown> = {
    'appConfig.firebaseCfgFile': missingFilePath,
    'appConfig.appCheckVerify': true,
    'appConfig.maxValiditySeconds': 900,
    ...overrides,
  }
  const configService = { get: (key: string) => values[key] } as unknown as ConfigService
  return new IdentityService(configService)
}

describe('IdentityService configurations', () => {
  beforeAll(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hologram-identity-'))
    certFilePath = path.join(tmpDir, 'firebase-config.json')
    missingFilePath = path.join(tmpDir, 'absent-firebase-config.json')
    fs.writeFileSync(certFilePath, JSON.stringify(serviceAccount), 'utf8')
  })

  afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  beforeEach(() => {
    vi.clearAllMocks()
    warnSpy = vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined)
    vi.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined)
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('initializes firebase with the service account when the configuration file exists', () => {
    createService({ 'appConfig.firebaseCfgFile': certFilePath, 'appConfig.firebaseProjectId': 'ignored-project' })

    expect(admin.credential.cert).toHaveBeenCalledWith(serviceAccount)
    expect(admin.initializeApp).toHaveBeenCalledWith({ credential: { mockCredential: serviceAccount } })
  })

  it('initializes firebase with the project id when the configuration file is absent', () => {
    createService({ 'appConfig.firebaseProjectId': 'hologram-test-project' })

    expect(admin.initializeApp).toHaveBeenCalledWith({ projectId: 'hologram-test-project' })
    expect(admin.credential.cert).not.toHaveBeenCalled()
  })

  it('fails to start without a configuration file, without a project id and with verification enabled', () => {
    expect(() => createService()).toThrow(/FIREBASE_CFG_FILE[\s\S]*FIREBASE_PROJECT_ID[\s\S]*APP_CHECK_VERIFY=false/)
  })

  it('accepts a token without firebase when verification is disabled', async () => {
    const service = createService({ 'appConfig.appCheckVerify': false })

    expect(admin.initializeApp).not.toHaveBeenCalled()
    expect(warnSpy).toHaveBeenCalledTimes(1)

    await expect(service.authenticateIdentity('any-token')).resolves.toEqual(identityPayload)
    expect(verifyToken).not.toHaveBeenCalled()
    expect(warnSpy).toHaveBeenCalledTimes(2)
  })

  it('verifies the token when verification is enabled', async () => {
    const service = createService({ 'appConfig.firebaseProjectId': 'hologram-test-project' })
    verifyToken.mockResolvedValue({ appId: 'test-app' })

    await expect(service.authenticateIdentity('good-token')).resolves.toEqual(identityPayload)
    expect(verifyToken).toHaveBeenCalledWith('good-token')
    expect(warnSpy).not.toHaveBeenCalled()
  })

  it('rejects a token with 403 when verification fails', async () => {
    const service = createService({ 'appConfig.firebaseProjectId': 'hologram-test-project' })
    verifyToken.mockRejectedValue(new Error('Decoding App Check token failed'))

    const error = await service.authenticateIdentity('bad-token').catch((e) => e)

    expect(error).toBeInstanceOf(HttpException)
    expect(error.getStatus()).toBe(HttpStatus.FORBIDDEN)
    expect(error.getResponse()).toEqual({ reason: 'Invalid Firebase token' })
  })
})
