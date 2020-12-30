import { readFileSync } from 'fs'
import S from 'fluent-json-schema'
import { join } from 'desm'

const { version } = JSON.parse(readFileSync(join(import.meta.url, '../package.json')))

// Exporting a constant named `autoPrefix` will tell
// to `fastify-autoload` that this plugin must be loaded
// with the prefix option. In this way every route declared
// inside this plugin and its children will have the prefix
// as part of the path.
export const autoPrefix = '/_scurte'

/**
 * Fastify tries not to impose you any design decision, but we highly
 * recommend to use the Fastify plugin system, as it gives you some neat features,
 * such as the load order and the guarantee that every part of your application
 * has been loaded before start listening to incoming requests.
 * See https://www.fastify.io/docs/latest/Plugins/.
 * For this reason routes and business logic should always wrapped inside plugins,
 * but you should never use `fastify-plugin` in this case, as you don't want to leak
 * your business logic or custom plugins to the rest of the application.
 *
 * It's always a good idea to expose a status route, so you can quickly
 * understand if your application is running and which version is deployed.
 */
export default async function status (fastify, opts) {
  // There are two ways of declaring routes in Fastify,
  // the "full" declaration and the "shorthand" declaration.
  // The "shorthand" declaration is very similar to Express.
  // Both can do the same things, there are no differences.
  // I prefer the "full" declaration as I like to be explicit.
  // See https://www.fastify.io/docs/latest/Routes/.
  fastify.route({
    method: 'GET',
    path: '/status',
    handler: onStatus,
    // Fastify does an extensive use of JSON schemas.
    // It uses them for validating external input
    // (thanks to https://github.com/ajv-validator/ajv)
    // or improving the serialization speed of responses
    // (thanks to https://github.com/fastify/fast-json-stringify).
    // Since writing plain JSON schema is rather boring
    // and error prone, we have created `fluent-json-schema`,
    // a nice library to help you maintaining JSON schemas.
    schema: {
      response: {
        // You can define different schemas
        // based on the response status code.
        // Be aware that if you are using a response
        // schema and you don't define property, this property
        // will not be serialized in the final response, even if you
        // are returing it in your route handler.
        200: S.object()
          .prop('status', S.string())
          .prop('version', S.string())
      }
    }
  })

  async function onStatus (req, reply) {
    return { status: 'ok', version }
  }
}
