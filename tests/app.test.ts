import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { GenericContainer, Network, StartedNetwork, StartedTestContainer, Wait } from 'testcontainers'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { AppModule } from '@/app.module'

let network: StartedNetwork
let minioContainer: StartedTestContainer
let hologramApp: INestApplication

describe('MinIO Integration', () => {
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    hologramApp = moduleRef.createNestApplication()
    await hologramApp.listen(3000, '0.0.0.0')

    network = await new Network().start()
    minioContainer = await new GenericContainer('minio/minio:RELEASE.2025-07-23T15-54-02Z')
      .withNetwork(network)
      .withExposedPorts(9000)
      .withExtraHosts([{ host: 'host.docker.internal', ipAddress: 'host-gateway' }])
      .withEnvironment({
        MINIO_ROOT_USER: 'minioadmin',
        MINIO_ROOT_PASSWORD: 'minioadmin',
        MINIO_IDENTITY_PLUGIN_URL: 'http://host.docker.internal:3000/auth',
        MINIO_IDENTITY_PLUGIN_ROLE_POLICY: 'consoleAdmin',
        MINIO_IDENTITY_PLUGIN_ROLE_ID: 'mobile-app',
      })
      .withCommand(['server', '/data'])
      .withWaitStrategy(Wait.forHttp('/minio/health/live', 9000))
      .start()
  }, 60_000)

  afterAll(async () => {
    await minioContainer?.stop()
    await network?.stop()
    await hologramApp?.close()
  })

  it('should respond from MinIO health check', async () => {
    const port = minioContainer.getMappedPort(9000)
    const host = minioContainer.getHost()

    const response = await fetch(`http://${host}:${port}/minio/health/live`)
    expect(response.status).toBe(200)
  })

  it('should authenticate via identity plugin', async () => {
    const port = minioContainer.getMappedPort(9000)
    const host = minioContainer.getHost()
    const minioEndpoint = `http://${host}:${port}`

    const stsParams = new URLSearchParams({
      Action: 'AssumeRoleWithCustomToken',
      Version: '2011-06-15',
      Token: 'your-test-jwt-token',
      RoleArn: 'arn:minio:iam:::role/idmp-mobile-app',
      DurationSeconds: '900',
    })

    const url = `${minioEndpoint}?${stsParams.toString()}`
    const stsResponse = await fetch(url, { method: 'POST' })
    const xml = await stsResponse.text()

    expect(stsResponse.status).toBe(500)
    expect(xml).toContain('<Code>InternalError</Code>')
    expect(xml).toContain('<Message>Invalid Firebase token</Message>')
  })
})
