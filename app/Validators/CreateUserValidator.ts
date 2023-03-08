import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateUserValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    full_name: schema.string([
      rules.trim(),
      rules.minLength(4),
      rules.maxLength(50),
    ]),
    email: schema.string([
      rules.trim(),
      rules.email(),
      rules.unique({
        table: 'users',
        column: 'email',
      }),
    ]),
    password: schema.string({}, [rules.minLength(8), rules.maxLength(30)]),
  })

  public messages = {
    'required': 'Ce champ est requis',
    'minLength':
      'Ce champ doit avoir au moins {{ options.minLength }} caractères',
    'email.unique': 'Cette adresse email est déjà utilisée',
    'maxLength':
      'Ce champ doit avoir au maximum {{ options.maxLength }} caractères',
    'email': 'Email invalide',
  }
}
