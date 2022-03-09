/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.on('/').redirectToPath('/docs')

/* Authentication */
Route.get('/auth/:provider', 'AuthController.redirectToProvider')
Route.get('/:provider/callback', 'AuthController.handleProviderCallback')

Route.post('/register', 'AuthController.register')
Route.post('/login', 'AuthController.login')

Route.post('logout', 'AuthController.logout').middleware('auth')

Route.group(() => {
  Route.post('/reset', 'AuthController.sendResetLink')
  Route.post('/reset/:token', 'AuthController.resetPassword')
}).prefix('password')

/* Users */
Route.group(() => {
  Route.get('/me', 'UsersController.show')
  Route.put('/me', 'UsersController.update')
  Route.put('/me/password', 'UsersController.updatePassword')
})
  .prefix('/users')
  .middleware('auth')

Route.group(() => {
  Route.resource('workspaces', 'WorkspacesController').apiOnly()
}).middleware('auth')
