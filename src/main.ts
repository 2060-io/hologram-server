import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import { AppModule } from '@/app.module'
import { getLogLevels } from '@/config'

async function bootstrap() {
  const logLevels = getLogLevels()
  const { name: appName, version: appVersion } = require('../package.json')

  // Create the NestJS application with custom logger levels
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: logLevels,
  })

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('API Documentation')
    .setVersion('1.0')
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  const configService = app.get(ConfigService)
  const logger = new Logger(bootstrap.name)

  app.useBodyParser('json', { limit: '5mb' })

  const port = configService.get('appConfig.appPort')

  await app.listen(port)

  // Log the URL where the application is running
  logger.log(`Application (${appName} v${appVersion}) running on: ${await app.getUrl()} `)
}
bootstrap()
