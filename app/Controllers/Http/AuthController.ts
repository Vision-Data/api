import Route from '@ioc:Adonis/Core/Route'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import CreateUserValidator from 'App/Validators/CreateUserValidator'
import LoginValidator from 'App/Validators/LoginValidator'
import ResetPasswordLinkValidator from 'App/Validators/ResetPasswordLinkValidator'
import PasswordToken from 'App/Models/PasswordToken'
import { v4 as uuidv4 } from 'uuid'
import ResetPasswordMailer from 'App/Mailers/ResetPasswordMailer'
import PasswordValidator from 'App/Validators/PasswordValidator'

export default class AuthController {
  public async redirectToProvider ({ params, ally }: HttpContextContract) {
    return ally.use(params.provider).redirect()
  }

  public async handleProviderCallback ({
    params,
    ally,
    auth,
    response,
  }: HttpContextContract) {
    const provider = ally.use(params.provider)
    const userData = await provider.user()

    // Get user or create them
    try {
      const user = await User.firstOrCreate(
        {
          providerId: userData.id,
          provider: params.provider,
        },
        {
          email: userData.email,
          fullName: userData.nickName,
          provider: params.provider,
          providerId: userData.id,
          avatarUrl: userData.avatarUrl,
        }
      )

      const token = await auth
        .use('api')
        .generate(user, { expiresIn: '1 year' })

      const encodedToken = Buffer.from(token.token).toString('base64')
      const encodedUser = Buffer.from(JSON.stringify(token.user)).toString(
        'base64'
      )

      return response.redirect(
        `${process.env.HOST_APP}/login?token=${encodedToken}&user=${encodedUser}`
      )
    } catch {
      response.status(400).send({ error: 'An error occurred while logging in' })
    }
  }

  public async register ({ request, auth }: HttpContextContract) {
    const payload = await request.validate(CreateUserValidator)
    const user = await User.create(payload)

    const token = await auth.attempt(user.email, payload.password, {
      expiresIn: '1 year',
    })

    return { token: token.token, user: token.user }
  }

  public async login ({ request, auth }: HttpContextContract) {
    const payload = await request.validate(LoginValidator)
    const token = await auth.attempt(payload.email, payload.password, {
      expiresIn: '1 year',
    })

    return { token: token.token, user: token.user }
  }

  public async logout ({ auth, response }: HttpContextContract) {
    await auth.use('api').revoke()

    return response.status(204)
  }

  public async sendResetLink ({ request, response }: HttpContextContract) {
    const payload = await request.validate(ResetPasswordLinkValidator)

    const user = await User.findByOrFail('email', payload.email)

    const passwordToken = await PasswordToken.create({
      userId: user.id,
      token: uuidv4(),
    })

    const url = Route.makeUrl('resetPassword', {
      token: passwordToken.token,
    })

    await new ResetPasswordMailer(user, url).sendLater()

    response.status(204)
  }

  public async resetPassword ({
    request,
    response,
    params,
  }: HttpContextContract) {
    const passwordToken = await PasswordToken.query()
      .where('token', params.token)
      .where('expired_at', '>', new Date())
      .firstOrFail()

    const payload = await request.validate(PasswordValidator)

    const user = await User.findOrFail(passwordToken.userId)
    await user.merge({ password: payload.password }).save()

    await passwordToken.delete()

    response.status(204)
  }
}
