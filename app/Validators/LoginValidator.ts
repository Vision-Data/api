import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class LoginValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    email: schema.string({ trim: true }, [
      rules.email(),
      rules.exists({
        table: 'users',
        column: 'email',
      }),
    ]),
    password: schema.string({}, [rules.minLength(8), rules.maxLength(30)]),
  })

  public messages = {
    required: '{{ field }} is required',
    email: 'Invalid email',
    'email.exists': 'User account with this email does not exist',
    maxLength: 'This field must be at most {{ options.maxLength }} characters',
  }
}
