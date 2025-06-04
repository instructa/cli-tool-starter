import { defineCommand } from 'citty'
import { version } from '../package.json'

export const cli = defineCommand({
  meta: {
    name: 'tool-cli-starter',
    version,
    description: 'Run the starter CLI',
  },
  args: {
    hello: { type: 'boolean', description: 'Show help message' },
  },
  async run({ args: _args }) {
    if (_args.hello) {
      console.log('You can start building your cli now!')
    }
  },
})
