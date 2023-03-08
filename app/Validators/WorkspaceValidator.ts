import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class WorkspaceValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    name: schema.string([
      rules.trim(),
      rules.minLength(3),
      rules.maxLength(100),
    ]),
    logo: schema.string.optional([rules.trim(), rules.url()]),
    color: schema.string.optional([
      rules.trim(),
      rules.regex(/^#[a-f0-9]{6}$/i),
    ]),
  })

  public messages = {
    'name.required': 'Le nom du workspace est requis',
    'minLength':
      'Ce champ doit avoir au moins {{ options.minLength }} caractères',
    'maxLength':
      'Ce champ doit avoir au maximum {{ options.maxLength }} caractères',
    'logo.url': 'URL invalide',
    'color.regex': 'Couleur invalide',
  }
}
