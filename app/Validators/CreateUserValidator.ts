import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateUserValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    full_name: schema.string({ trim: true }, [
      rules.minLength(4),
      rules.maxLength(50),
    ]),
    email: schema.string({ trim: true }, [
      rules.email(),
      rules.unique({
        table: 'users',
        column: 'email',
      }),
    ]),
    password: schema.string({}, [rules.minLength(8), rules.maxLength(30)]),
  })

  public messages = {
    required: 'This field is required',
    minLength: 'This field must be at least {{ options.minLength }} characters',
    'email.unique': 'This email already exists',
    maxLength: 'This field must be at most {{ options.maxLength }} characters',
    email: 'Invalid email',
  }
}
