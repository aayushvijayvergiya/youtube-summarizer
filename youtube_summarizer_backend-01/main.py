import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app import auth_routes
from app.summary_subapp import summary_app
from app.userRepository import models
from app.database import engine


# Press Shift+F10 to execute it or replace it with your code.
# Press Double Shift to search everywhere for classes, files, tool windows, actions, and settings.

models.Base.metadata.create_all(bind=engine)

origins = [
    "http://localhost:3000",
    "https://youtube-summarizer-livid.vercel.app"
]

# Pass middleware to FastAPI
app = FastAPI(
    title="YouTube Summarizer API",
    description="API for generating video summaries",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router, prefix="/auth", tags=["auth"])

# Mount the sub-application to the main app
app.mount("/summary", summary_app)


def print_hi(name):
    # Use a breakpoint in the code line below to debug your script.
    print(f'Hi, {name}')  # Press Ctrl+F8 to toggle the breakpoint.


# Press the green button in the gutter to run the script.
if __name__ == '__main__':
    print_hi('FastAPI')
    uvicorn.run(app, host="127.0.0.1", port=8010)

# See PyCharm help at https://www.jetbrains.com/help/pycharm/
