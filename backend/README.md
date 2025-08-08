| What you want to do     | URL                                                             | Method | Payload / Notes                                            |
| ----------------------- | --------------------------------------------------------------- | ------ | ---------------------------------------------------------- |
| Register new user       | `/auth/users/`                                                  | POST   | `{ "username": "...", "email": "...", "password": "..." }` |
| Activate user           | `/auth/users/activation/`                                       | POST   | `{ "uid": "...", "token": "..." }`                         |
| Login (get JWT tokens)  | `/auth/token/jwt/create/`                                       | POST   | `{ "username": "...", "password": "..." }`                 |
| Refresh JWT token       | `/auth/token/jwt/refresh/`                                      | POST   | `{ "refresh": "..." }`                                     |
| Get logged-in user info | `/auth/users/me/`                                               | GET    | Requires Authorization header with JWT token               |
| Logout                  | Not provided by default, you can blacklist tokens if configured |        |                                                            |
