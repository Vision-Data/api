import User from 'App/Models/User'
import { BaseMailer, MessageContract } from '@ioc:Adonis/Addons/Mail'
import View from '@ioc:Adonis/Core/View'
import mjml from 'mjml'

export default class ResetPasswordMailer extends BaseMailer {
  constructor(private user: User, private url: string) {
    super()
  }

  public html = mjml(
    View.renderSync('emails/reset-password', {
      user: this.user,
      url: this.url,
    })
  ).html

  public prepare(message: MessageContract) {
    message
      .subject('Vision - Réinitialisation du mot de passe')
      .from('visiondata@mail.com')
      .to(this.user.email)
      .html(this.html)
  }
}
