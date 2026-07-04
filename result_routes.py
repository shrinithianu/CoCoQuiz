from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models.result_model import save_result, save_answers, get_results_by_user, get_result_detail
from models.quiz_model import get_questions_by_quiz, get_quiz_by_id, get_participant_count
from utils.jwt_helper import get_current_user

result_bp = Blueprint("results", __name__)

@result_bp.route("/submit", methods=["POST"])
@jwt_required()
def submit_quiz():
    user = get_current_user()
    data = request.get_json()
    quiz_id = data.get("quiz_id")
    time_taken = int(data.get("time_taken_seconds", 0))
    submitted_answers = data.get("answers", [])

    quiz = get_quiz_by_id(quiz_id)
    if not quiz:
        return jsonify({"error": "Quiz not found"}), 404

    # Check participant limit
    if quiz.get("max_participants"):
        current_count = get_participant_count(quiz_id)
        if current_count >= quiz["max_participants"]:
            return jsonify({"error": "This quiz has reached its maximum participants limit"}), 403

    questions = get_questions_by_quiz(quiz_id)
    question_map = {q["id"]: q for q in questions}
    total_marks = sum(q["marks"] for q in questions)
    score = 0
    answer_records = []

    for ans in submitted_answers:
        q_id = ans.get("question_id")
        selected = (ans.get("selected_option") or "").upper()
        question = question_map.get(q_id)
        if question:
            is_correct = (selected == question["correct_option"])
            if is_correct:
                score += question["marks"]
            answer_records.append({
                "question_id": q_id,
                "selected_option": selected or None,
                "is_correct": is_correct
            })

    percentage = round((score / total_marks * 100), 2) if total_marks > 0 else 0.0
    result_id = save_result(user["id"], quiz_id, score, total_marks, percentage, time_taken)
    save_answers(result_id, answer_records)

    return jsonify({
        "result_id": result_id,
        "score": score,
        "total_marks": total_marks,
        "percentage": percentage,
        "time_taken_seconds": time_taken
    }), 201

@result_bp.route("/my", methods=["GET"])
@jwt_required()
def my_results():
    user = get_current_user()
    results = get_results_by_user(user["id"])
    for r in results:
        if r.get("submitted_at"):
            r["submitted_at"] = str(r["submitted_at"])
        r["percentage"] = float(r["percentage"])
    return jsonify(results), 200

@result_bp.route("/<int:result_id>", methods=["GET"])
@jwt_required()
def result_detail(result_id):
    user = get_current_user()
    result, answers = get_result_detail(result_id, user["id"])
    if not result:
        return jsonify({"error": "Result not found"}), 404
    if result.get("submitted_at"):
        result["submitted_at"] = str(result["submitted_at"])
    result["percentage"] = float(result["percentage"])
    for a in answers:
        a["is_correct"] = bool(a["is_correct"])
    return jsonify({"result": result, "answers": answers}), 200
