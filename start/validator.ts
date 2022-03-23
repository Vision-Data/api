import { validator } from '@ioc:Adonis/Core/Validator'

validator.rule(
  'hexColor',
  (value, _, options) => {
    if (typeof value !== 'string') {
      return
    }

    if (!/^#[a-z0-9]{6}$/i.test(value)) {
      options.errorReporter.report(
        options.pointer,
        'hexColor',
        'hexColor validation failed',
        options.arrayExpressionPointer
      )
    }
  },
  (_options, _type, subtype) => {
    if (subtype !== 'string') {
      throw new Error(
        '"hexColor" rule can only be used with a string schema type'
      )
    }

    return {
      async: true,
      compiledOptions: {},
    }
  }
)
