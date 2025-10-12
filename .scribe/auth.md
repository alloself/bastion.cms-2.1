# Authenticating requests

To authenticate requests, include an **`Authorization`** header with the value **`"Bearer {YOUR_AUTH_TOKEN}"`**.

All authenticated endpoints are marked with a `requires authentication` badge in the documentation below.

This API uses Laravel Sanctum for authentication. <br><br>**For SPA/Web:** Use cookie-based authentication by first calling the CSRF cookie endpoint, then login via Fortify. Subsequent requests will automatically include session cookies.<br><br>**For Mobile/API:** Include a personal access token in the Authorization header as `Bearer {token}`. You can generate tokens via your user dashboard.
