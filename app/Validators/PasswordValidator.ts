import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class PasswordValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    password: schema.string({}, [rules.minLength(8), rules.maxLength(30)]),
  })

  public messages = {
    required: 'Ce champ est requis',
    minLength:
      'Ce champ doit avoir au moins {{ options.minLength }} caractères',
    maxLength:
      'Ce champ doit avoir au maximum {{ options.maxLength }} caractères',
  }
}
