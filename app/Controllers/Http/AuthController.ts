import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import User from "App/Models/User";

export default class AuthController {
  public async redirectToProvider({ params, ally }: HttpContextContract) {
    return ally.use(params.provider).redirect();
  }

  public async handleProviderCallback({ params, ally }: HttpContextContract) {
    const provider = ally.use(params.provider);
    const userData = await provider.user();

    // Get user or create them
    const user = await User.firstOrCreate(
      {
        email: userData.email,
      },
      {
        email: userData.email,
        fullName: userData.nickName,
        provider: params.provider,
        providerId: userData.id,
      }
    );

    return user;
  }
}
