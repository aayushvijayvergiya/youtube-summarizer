from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    username: str
    name: str
    email: EmailStr


class UserCreate(UserBase):
    password: str

class UserSignin(BaseModel):
    username: str
    password: str

class UserOut(UserBase):
    id: int

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None
