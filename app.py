from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from routes.auth_routes import auth_bp
from routes.quiz_routes import quiz_bp
from routes.result_routes import result_bp
from routes.admin_routes import admin_bp
from database.db import init_db

app = Flask(__name__)
app.config.from_object(Config)

CORS(app)
jwt = JWTManager(app)

app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(quiz_bp, url_prefix="/quiz")
app.register_blueprint(result_bp, url_prefix="/results")
app.register_blueprint(admin_bp, url_prefix="/admin")

@app.route("/ping")
def ping():
    return {"message": "CoCoQuiz backend is running!"}

if __name__ == "__main__":
    init_db()
    app.run(debug=True)
