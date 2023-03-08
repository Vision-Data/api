import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class LoginValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    email: schema.string([
      rules.trim(),
      rules.email(),
      rules.exists({
        table: 'users',
        column: 'email',
      }),
    ]),
    password: schema.string({}, [rules.minLength(8), rules.maxLength(30)]),
  })

  public messages = {
    'required': '{{ field }} est requis',
    'email': 'Email invalide',
    'email.exists': "Aucun compte n'est associé à cette adresse email",
    'maxLength':
      'Ce champ doit avoir au maximum {{ options.maxLength }} caractères',
  }
}
