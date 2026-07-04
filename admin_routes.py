from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from models.user_model import get_all_users
from models.quiz_model import get_all_quizzes
from models.result_model import get_all_results
from utils.jwt_helper import get_current_user, is_admin

admin_bp = Blueprint("admin", __name__)

@admin_bp.route("/users", methods=["GET"])
@jwt_required()
def all_users():
    user = get_current_user()
    if not is_admin(user):
        return jsonify({"error": "Admin access required"}), 403
    users = get_all_users()
    for u in users:
        if u.get("created_at"):
            u["created_at"] = str(u["created_at"])
    return jsonify(users), 200

@admin_bp.route("/quizzes", methods=["GET"])
@jwt_required()
def all_quizzes():
    user = get_current_user()
    if not is_admin(user):
        return jsonify({"error": "Admin access required"}), 403
    quizzes = get_all_quizzes()
    for q in quizzes:
        if q.get("created_at"):
            q["created_at"] = str(q["created_at"])
    return jsonify(quizzes), 200

@admin_bp.route("/results", methods=["GET"])
@jwt_required()
def all_results():
    user = get_current_user()
    if not is_admin(user):
        return jsonify({"error": "Admin access required"}), 403
    results = get_all_results()
    for r in results:
        if r.get("submitted_at"):
            r["submitted_at"] = str(r["submitted_at"])
        r["percentage"] = float(r["percentage"])
    return jsonify(results), 200

@admin_bp.route("/stats", methods=["GET"])
@jwt_required()
def stats():
    user = get_current_user()
    if not is_admin(user):
        return jsonify({"error": "Admin access required"}), 403
    users = get_all_users()
    quizzes = get_all_quizzes()
    results = get_all_results()
    return jsonify({
        "total_users": len(users),
        "total_students": len([u for u in users if u["role"] == "student"]),
        "total_teachers": len([u for u in users if u["role"] == "teacher"]),
        "total_quizzes": len(quizzes),
        "total_attempts": len(results),
        "avg_score": round(sum(r["percentage"] for r in results) / len(results), 2) if results else 0
    }), 200
