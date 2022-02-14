import User from 'App/Models/User'

export const createUser = async (user) => {
  return await User.create(user)
}
