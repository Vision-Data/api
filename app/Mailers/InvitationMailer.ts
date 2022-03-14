import { BaseMailer, MessageContract } from '@ioc:Adonis/Addons/Mail'
import View from '@ioc:Adonis/Core/View'
import User from 'App/Models/User'
import Workspace from 'App/Models/Workspace'
import mjml from 'mjml'

export default class InvitationMailer extends BaseMailer {
  constructor(
    private user: User,
    private workspace: Workspace,
    private url: string
  ) {
    super()
  }

  public html = mjml(
    View.renderSync('emails/invitation', {
      user: this.user,
      workspace: this.workspace,
      url: this.url,
    })
  ).html

  public prepare(message: MessageContract) {
    message
      .subject(`Vision - Invitation sur le workspace ${this.workspace.name}`)
      .from('visiondata@mail.com')
      .to(this.user.email)
      .html(this.html)
  }
}
