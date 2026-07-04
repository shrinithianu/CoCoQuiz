from database.db import get_db_connection

def get_all_quizzes():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT q.*, u.username AS created_by_name,
               COUNT(qu.id) AS question_count,
               (SELECT COUNT(*) FROM results r WHERE r.quiz_id = q.id) AS participant_count
        FROM quizzes q
        LEFT JOIN users u ON q.created_by = u.id
        LEFT JOIN questions qu ON qu.quiz_id = q.id
        GROUP BY q.id
        ORDER BY q.created_at DESC
    """)
    quizzes = cursor.fetchall()
    cursor.close()
    conn.close()
    return quizzes

def get_quizzes_by_teacher(teacher_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT q.*, COUNT(qu.id) AS question_count,
               (SELECT COUNT(*) FROM results r WHERE r.quiz_id = q.id) AS participant_count
        FROM quizzes q
        LEFT JOIN questions qu ON qu.quiz_id = q.id
        WHERE q.created_by = %s
        GROUP BY q.id
        ORDER BY q.created_at DESC
    """, (teacher_id,))
    quizzes = cursor.fetchall()
    cursor.close()
    conn.close()
    return quizzes

def get_quiz_by_id(quiz_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM quizzes WHERE id = %s", (quiz_id,))
    quiz = cursor.fetchone()
    cursor.close()
    conn.close()
    return quiz

def create_quiz(title, description, duration_minutes, created_by, max_participants=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO quizzes (title, description, duration_minutes, created_by, max_participants) VALUES (%s, %s, %s, %s, %s)",
        (title, description, duration_minutes, created_by, max_participants)
    )
    quiz_id = cursor.lastrowid
    conn.commit()
    cursor.close()
    conn.close()
    return quiz_id

def delete_quiz(quiz_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM quizzes WHERE id = %s", (quiz_id,))
    conn.commit()
    cursor.close()
    conn.close()

def get_questions_by_quiz(quiz_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM questions WHERE quiz_id = %s", (quiz_id,))
    questions = cursor.fetchall()
    cursor.close()
    conn.close()
    return questions

def get_questions_for_student(quiz_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT id, quiz_id, question_text, option_a, option_b, option_c, option_d, marks
        FROM questions WHERE quiz_id = %s
    """, (quiz_id,))
    questions = cursor.fetchall()
    cursor.close()
    conn.close()
    return questions

def add_question(quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks=1):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks))
    conn.commit()
    cursor.close()
    conn.close()

def delete_question(question_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM questions WHERE id = %s", (question_id,))
    conn.commit()
    cursor.close()
    conn.close()

def get_participant_count(quiz_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM results WHERE quiz_id = %s", (quiz_id,))
    count = cursor.fetchone()[0]
    cursor.close()
    conn.close()
    return count
