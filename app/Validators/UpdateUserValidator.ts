import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateUserValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    full_name: schema.string({ trim: true }, [rules.minLength(4)]),
    email: schema.string({ trim: true }, [
      rules.email(),
      rules.unique({
        table: 'users',
        column: 'email',
        whereNot: { id: this.ctx?.auth?.user?.id },
      }),
    ]),
    avatar_url: schema.string({ trim: true }, [rules.url()]),
  })

  public messages = {
    minLength: 'This field must be at least {{ options.minLength }} characters',
    'email.unique': 'This email already exists',
    email: 'Invalid email',
    url: 'Invalid URL',
  }
}
