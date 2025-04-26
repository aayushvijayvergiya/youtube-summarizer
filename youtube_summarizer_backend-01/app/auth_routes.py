from fastapi import Depends, HTTPException, status, APIRouter
from sqlalchemy.orm import Session
from datetime import timedelta

from app import auth, database
from app.userRepository import schema

router = APIRouter()

@router.post("/signup", response_model=schema.UserOut)
def signup(user: schema.UserCreate, db: Session = Depends(database.get_db)):
    db_user = auth.get_user_by_username(db, username=user.username) or auth.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Username or email already registered")
    return auth.create_user(db, user)

@router.post("/signin", response_model=schema.Token)
def signin(form_data: schema.UserSignin, db: Session = Depends(database.get_db)):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/currentuser", response_model=schema.UserOut)
def read_users_me(current_user: schema.UserOut = Depends(auth.get_current_user)):
    return current_user

@router.post("/logout")
def logout():
    # With JWT, logout is handled client-side by removing the token
    return {"msg": "Logged out"}