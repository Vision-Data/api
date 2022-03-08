import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class PasswordValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    password: schema.string({}, [rules.minLength(8), rules.maxLength(30)]),
  })

  public messages = {
    required: 'This field is required',
    minLength: 'This field must be at least {{ options.minLength }} characters',
    maxLength: 'This field must be at most {{ options.maxLength }} characters',
  }
}
