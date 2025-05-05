from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from jose import jwt, JWTError

class JWTAuthenticationMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, secret_key: str, algorithms: list[str]):
        super().__init__(app)
        self.secret_key = secret_key
        self.algorithms = algorithms

    async def dispatch(self, request: Request, call_next):
        try:
            authorization: str = request.headers.get("Authorization")
            if not authorization or not authorization.startswith("Bearer "):
                raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

            token = authorization.split(" ")[1]
            try:
                # Decode and validate the JWT token
                payload = jwt.decode(token, self.secret_key, algorithms=self.algorithms)
                request.state.user = payload  # Attach the decoded payload to the request state
            except JWTError:
                raise HTTPException(status_code=401, detail="Invalid token")

            response = await call_next(request)
            return response
        except HTTPException as exc:
            # Return a JSON response for HTTP exceptions
            return JSONResponse(
                status_code=exc.status_code,
                content={"detail": exc.detail},
            )