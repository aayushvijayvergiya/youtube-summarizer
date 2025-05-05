from fastapi import FastAPI, HTTPException
import os

from starlette.responses import JSONResponse

from app import summary
from app.middlewares.validate_requests import JWTAuthenticationMiddleware

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")


# Create a sub-application for the /summary route
summary_app = FastAPI()

summary_app.add_middleware(
    JWTAuthenticationMiddleware,
    secret_key=SECRET_KEY,
    algorithms=[ALGORITHM]
)

@summary_app.exception_handler(HTTPException)
async def http_exception_handler(request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

# Include the summary router in the sub-application
summary_app.include_router(summary.router, prefix="", tags=["summarize"])
