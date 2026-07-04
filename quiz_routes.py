from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models.quiz_model import (
    get_all_quizzes, get_quiz_by_id, get_quizzes_by_teacher,
    create_quiz, delete_quiz,
    get_questions_by_quiz, get_questions_for_student,
    add_question, delete_question, get_participant_count
)
from utils.jwt_helper import get_current_user, is_teacher_or_admin, is_admin

quiz_bp = Blueprint("quiz", __name__)

@quiz_bp.route("/", methods=["GET"])
@jwt_required()
def list_quizzes():
    user = get_current_user()
    if user["role"] == "teacher":
        quizzes = get_quizzes_by_teacher(user["id"])
    else:
        quizzes = get_all_quizzes()
    for q in quizzes:
        if q.get("created_at"):
            q["created_at"] = str(q["created_at"])
    return jsonify(quizzes), 200

@quiz_bp.route("/<int:quiz_id>", methods=["GET"])
@jwt_required()
def get_quiz(quiz_id):
    quiz = get_quiz_by_id(quiz_id)
    if not quiz:
        return jsonify({"error": "Quiz not found"}), 404
    if quiz.get("created_at"):
        quiz["created_at"] = str(quiz["created_at"])
    return jsonify(quiz), 200

@quiz_bp.route("/<int:quiz_id>/questions", methods=["GET"])
@jwt_required()
def get_quiz_questions(quiz_id):
    quiz = get_quiz_by_id(quiz_id)
    if not quiz:
        return jsonify({"error": "Quiz not found"}), 404
    user = get_current_user()
    if is_teacher_or_admin(user):
        questions = get_questions_by_quiz(quiz_id)
    else:
        questions = get_questions_for_student(quiz_id)
    return jsonify(questions), 200

@quiz_bp.route("/", methods=["POST"])
@jwt_required()
def create_quiz_route():
    user = get_current_user()
    if not is_teacher_or_admin(user):
        return jsonify({"error": "Teacher or Admin access required"}), 403
    data = request.get_json()
    title = data.get("title", "").strip()
    description = data.get("description", "")
    duration = int(data.get("duration_minutes", 10))
    max_participants = data.get("max_participants")
    if max_participants:
        max_participants = int(max_participants)
    if not title:
        return jsonify({"error": "Title is required"}), 400
    quiz_id = create_quiz(title, description, duration, user["id"], max_participants)
    return jsonify({"message": "Quiz created", "quiz_id": quiz_id}), 201

@quiz_bp.route("/<int:quiz_id>", methods=["DELETE"])
@jwt_required()
def delete_quiz_route(quiz_id):
    user = get_current_user()
    if not is_teacher_or_admin(user):
        return jsonify({"error": "Teacher or Admin access required"}), 403
    quiz = get_quiz_by_id(quiz_id)
    if not quiz:
        return jsonify({"error": "Quiz not found"}), 404
    # Teachers can only delete their own quizzes
    if user["role"] == "teacher" and quiz["created_by"] != user["id"]:
        return jsonify({"error": "You can only delete your own quizzes"}), 403
    delete_quiz(quiz_id)
    return jsonify({"message": "Quiz deleted"}), 200

@quiz_bp.route("/<int:quiz_id>/questions", methods=["POST"])
@jwt_required()
def add_question_route(quiz_id):
    user = get_current_user()
    if not is_teacher_or_admin(user):
        return jsonify({"error": "Teacher or Admin access required"}), 403
    data = request.get_json()
    required = ["question_text", "option_a", "option_b", "option_c", "option_d", "correct_option"]
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"{field} is required"}), 400
    correct = data["correct_option"].upper()
    if correct not in ("A", "B", "C", "D"):
        return jsonify({"error": "correct_option must be A, B, C, or D"}), 400
    add_question(quiz_id, data["question_text"], data["option_a"], data["option_b"],
                 data["option_c"], data["option_d"], correct, int(data.get("marks", 1)))
    return jsonify({"message": "Question added"}), 201

@quiz_bp.route("/questions/<int:question_id>", methods=["DELETE"])
@jwt_required()
def delete_question_route(question_id):
    user = get_current_user()
    if not is_teacher_or_admin(user):
        return jsonify({"error": "Teacher or Admin access required"}), 403
    delete_question(question_id)
    return jsonify({"message": "Question deleted"}), 200

@quiz_bp.route("/<int:quiz_id>/participants", methods=["GET"])
@jwt_required()
def get_participants(quiz_id):
    user = get_current_user()
    if not is_teacher_or_admin(user):
        return jsonify({"error": "Access denied"}), 403
    from models.result_model import get_results_by_quiz
    results = get_results_by_quiz(quiz_id)
    for r in results:
        if r.get("submitted_at"):
            r["submitted_at"] = str(r["submitted_at"])
        r["percentage"] = float(r["percentage"])
    return jsonify(results), 200
