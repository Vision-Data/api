import Ws from 'App/Services/Ws'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import CreateUserValidator from 'App/Validators/CreateUserValidator'
import LoginValidator from 'App/Validators/LoginValidator'

export default class AuthController {
  public async redirectToProvider({ params, ally }: HttpContextContract) {
    return ally.use(params.provider).redirect()
  }

  public async handleProviderCallback({
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

      const token = await auth.use('api').generate(user, { expiresIn: '1hour' })
      const tokenAndUserInformations = { token: token.token, user: token.user }

      Ws.io.emit('login', tokenAndUserInformations)

      return tokenAndUserInformations
    } catch {
      const error = { error: 'An error occurred while logging in' }
      Ws.io.emit('errorLogin', error)

      response.status(400).send({ error: 'An error occurred while logging in' })
    }
  }

  public async register({ request, auth }: HttpContextContract) {
    const payload = await request.validate(CreateUserValidator)
    const user = await User.create(payload)

    const token = await auth.attempt(user.email, payload.password, {
      expiresIn: '1hour',
    })

    return { token: token.token, user: token.user }
  }

  public async login({ request, auth }: HttpContextContract) {
    const payload = await request.validate(LoginValidator)
    const token = await auth.attempt(payload.email, payload.password, {
      expiresIn: '1hour',
    })

    return { token: token.token, user: token.user }
  }

  public async logout({ auth, response }: HttpContextContract) {
    await auth.use('api').revoke()

    return response.status(204)
  }
}
