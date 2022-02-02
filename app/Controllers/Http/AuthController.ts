import Ws from "App/Services/Ws";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import User from "App/Models/User";

export default class AuthController {
  public async redirectToProvider({ params, ally }: HttpContextContract) {
    return ally.use(params.provider).redirect();
  }

  public async handleProviderCallback({
    params,
    ally,
    auth,
  }: HttpContextContract) {
    const provider = ally.use(params.provider);
    const userData = await provider.user();

    // Get user or create them
    const user = await User.firstOrCreate(
      {
        email: userData.email,
        provider: params.provider,
      },
      {
        email: userData.email,
        fullName: userData.nickName,
        provider: params.provider,
        providerId: userData.id,
      }
    );

    const token = await auth.use("api").generate(user, { expiresIn: "1hour" });
    const tokenAndUserInformations = { token: token.token, user: token.user };

    Ws.io.emit("login", tokenAndUserInformations);

    return tokenAndUserInformations;
  }

  public async logout({ auth, response }: HttpContextContract) {
    await auth.use("api").revoke();

    return response.status(204);
  }
}
