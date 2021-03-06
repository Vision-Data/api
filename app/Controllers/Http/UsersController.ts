import PasswordValidator from 'App/Validators/PasswordValidator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UpdateUserValidator from 'App/Validators/UpdateUserValidator'

export default class UsersController {
  public async show({ auth }: HttpContextContract) {
    return auth.user
  }

  public async update({ request, auth }: HttpContextContract) {
    const payload = await request.validate(UpdateUserValidator)
    return await auth.user!.merge(payload).save()
  }

  public async updatePassword({
    request,
    auth,
    response,
  }: HttpContextContract) {
    const payload = await request.validate(PasswordValidator)

    await auth.user!.merge(payload).save()

    response.status(204)
  }
}
