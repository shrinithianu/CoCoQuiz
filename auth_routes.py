from flask import Blueprint, request, jsonify
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token, jwt_required
from models.user_model import create_user, find_user_by_username, find_user_by_email
from utils.jwt_helper import get_current_user

bcrypt = Bcrypt()
auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username", "").strip()
    email = data.get("email", "").strip()
    password = data.get("password", "")
    role = data.get("role", "student")

    if not username or not email or not password:
        return jsonify({"error": "All fields are required"}), 400

    if role not in ("student", "teacher", "admin"):
        role = "student"

    if find_user_by_username(username):
        return jsonify({"error": "Username already taken"}), 400

    if find_user_by_email(email):
        return jsonify({"error": "Email already registered"}), 400

    password_hash = bcrypt.generate_password_hash(password).decode("utf-8")
    create_user(username, email, password_hash, role)
    return jsonify({"message": "Registered successfully"}), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username", "").strip()
    password = data.get("password", "")

    user = find_user_by_username(username)
    if not user or not bcrypt.check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid credentials"}), 401

    access_token = create_access_token(identity=username)
    return jsonify({
        "token": access_token,
        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "role": user["role"]
        }
    }), 200

@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user = get_current_user()
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({
        "id": user["id"],
        "username": user["username"],
        "email": user["email"],
        "role": user["role"]
    }), 200
