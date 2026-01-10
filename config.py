from flask import Flask

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] =  'sqlite:///transactions_temp.sqlite3'
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] =  False