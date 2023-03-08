import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateUserValidator {
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
        whereNot: { id: this.ctx?.auth?.user?.id },
      }),
    ]),
    avatar_url: schema.string([rules.trim(), rules.url()]),
  })

  public messages = {
    'required': '{{ field }} est requis',
    'minLength':
      'Ce champ doit avoir au moins {{ options.minLength }} caractères',
    'maxLength':
      'Ce champ doit avoir au maximum {{ options.maxLength }} caractères',
    'email.unique': 'Cette adresse email est déjà utilisée',
    'email': 'Email invalide',
    'url': 'URL invalide',
  }
}
