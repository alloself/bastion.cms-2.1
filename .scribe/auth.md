# Authenticating requests

To authenticate requests, include a **`Cookie`** header with the value **`"Браузерные cookie (отправляются автоматически)"`**.

All authenticated endpoints are marked with a `requires authentication` badge in the documentation below.

Эта API использует Laravel Sanctum со stateful-сессиями. <br><br>**Для SPA/Web:** сначала запросите CSRF-cookie (`/sanctum/csrf-cookie`), затем выполните вход (Fortify). После этого браузер будет автоматически отправлять session cookie — добавлять заголовки авторизации не требуется. В разделе Try It Out авторизация происходит через cookie.<br><br>**Для Mobile/API:** используйте персональный токен доступа в заголовке Authorization как `Bearer {token}` (если ваш клиент работает без браузерных cookie).
