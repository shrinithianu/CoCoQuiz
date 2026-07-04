from flask_jwt_extended import get_jwt_identity
from models.user_model import find_user_by_username

def get_current_user():
    username = get_jwt_identity()
    return find_user_by_username(username)

def is_admin(user):
    return user and user.get("role") == "admin"

def is_teacher(user):
    return user and user.get("role") == "teacher"

def is_teacher_or_admin(user):
    return user and user.get("role") in ("teacher", "admin")
