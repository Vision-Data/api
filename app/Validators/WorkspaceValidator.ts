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
    'name.required': 'Workspace name is required',
    minLength: 'This field must be at least {{ options.minLength }} characters',
    maxLength: 'This field must be at most {{ options.maxLength }} characters',
    'logo.url': 'Invalid URL',
    'color.regex': 'Invalid hexadecimal color',
  }
}
