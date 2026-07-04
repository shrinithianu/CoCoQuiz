from database.db import get_db_connection

def save_result(user_id, quiz_id, score, total_marks, percentage, time_taken_seconds):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO results (user_id, quiz_id, score, total_marks, percentage, time_taken_seconds)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (user_id, quiz_id, score, total_marks, percentage, time_taken_seconds))
    result_id = cursor.lastrowid
    conn.commit()
    cursor.close()
    conn.close()
    return result_id

def save_answers(result_id, answers):
    conn = get_db_connection()
    cursor = conn.cursor()
    for ans in answers:
        cursor.execute("""
            INSERT INTO answers (result_id, question_id, selected_option, is_correct)
            VALUES (%s, %s, %s, %s)
        """, (result_id, ans["question_id"], ans.get("selected_option"), ans["is_correct"]))
    conn.commit()
    cursor.close()
    conn.close()

def get_results_by_user(user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT r.*, q.title AS quiz_title, q.duration_minutes, u.username AS teacher_name
        FROM results r
        JOIN quizzes q ON r.quiz_id = q.id
        LEFT JOIN users u ON q.created_by = u.id
        WHERE r.user_id = %s
        ORDER BY r.submitted_at DESC
    """, (user_id,))
    results = cursor.fetchall()
    cursor.close()
    conn.close()
    return results

def get_result_detail(result_id, user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM results WHERE id = %s AND user_id = %s", (result_id, user_id))
    result = cursor.fetchone()
    if not result:
        cursor.close()
        conn.close()
        return None, None
    cursor.execute("""
        SELECT a.selected_option, a.is_correct,
               qu.question_text, qu.option_a, qu.option_b, qu.option_c, qu.option_d,
               qu.correct_option, qu.marks
        FROM answers a
        JOIN questions qu ON a.question_id = qu.id
        WHERE a.result_id = %s
    """, (result_id,))
    answers = cursor.fetchall()
    cursor.close()
    conn.close()
    return result, answers

def get_results_by_quiz(quiz_id):
    """Teacher: get all student results for a specific quiz."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT r.*, u.username, u.email
        FROM results r
        JOIN users u ON r.user_id = u.id
        WHERE r.quiz_id = %s
        ORDER BY r.percentage DESC
    """, (quiz_id,))
    results = cursor.fetchall()
    cursor.close()
    conn.close()
    return results

def get_all_results():
    """Admin: get every result."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT r.*, u.username, u.role, q.title AS quiz_title,
               teacher.username AS teacher_name
        FROM results r
        JOIN users u ON r.user_id = u.id
        JOIN quizzes q ON r.quiz_id = q.id
        LEFT JOIN users teacher ON q.created_by = teacher.id
        ORDER BY r.submitted_at DESC
    """)
    results = cursor.fetchall()
    cursor.close()
    conn.close()
    return results
