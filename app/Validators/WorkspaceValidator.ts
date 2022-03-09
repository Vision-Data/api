import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class WorkspaceValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    name: schema.string({ trim: true }, [
      rules.minLength(3),
      rules.maxLength(100),
    ]),
    environment_variables: schema.object.optional().anyMembers(),
    logo: schema.string.optional({ trim: true }, [rules.url()]),
    color: schema.string.optional({ trim: true }, [
      rules.minLength(7),
      rules.maxLength(7),
      rules.hexColor(),
    ]),
  })

  public messages = {
    'name.required': 'Workspace name is required',
    minLength: 'This field must be at least {{ options.minLength }} characters',
    maxLength: 'This field must be at most {{ options.maxLength }} characters',
    'logo.url': 'Invalid URL',
    'schema.object.optional.anyMembers': 'Invalid environment variables',
    'color.hexColor': 'Invalid hexadecimal color',
  }
}
