import { start } from './app.js'

async function main() {
  await start()
}

main().catch((err) => {
  process.exit(1)
})
