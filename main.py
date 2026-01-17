"""Start from here via python main.py
Make sure to activate virtual env

"""

from flask import request, redirect
from flask import render_template
from datetime import datetime
from models import transactions
from database import db
from config import app
from logger import logging
from helpers import read_wells_fargo_data, read_marcus_statement


def create_chart_data(start_month: int, end_month: int, start_year: int):
    month_conversion = {1: 'January', 2: 'Feburary', 3: 'March', 4: 'April',
                        5: 'May', 6: 'June', 7: 'July', 8: 'August',
                        9: 'September', 10: 'October', 11: 'November',
                        12: 'December'}
    months = []
    totals = []
    if start_month == end_month:
        return [f'{month_conversion[start_month]} {start_year}'], \
            transactions.get_total_by_month(start_month, start_year)
    while start_month != end_month + 1:
        months.append(f'{month_conversion[start_month]} {start_year}')
        totals.append(transactions.get_total_by_month(start_month, start_year))
        if start_month + 1 > 12:
            start_month = 1
            start_year += 1
        else:
            start_month += 1
    return months, totals


@app.route('/', methods=["POST", "GET"], defaults={'start_date': None, 'end_date': None})
@app.route('/<start_date>_<end_date>', methods=["POST", "GET"])
def main(start_date, end_date):
    if request.method == "POST" and request.form.get("description"):
        logging.info(request.form)
        description = request.form["description"]
        price = request.form["price"]
        date = datetime.strptime(request.form["date"], "%Y-%m-%d")
        category = request.form["category"]
        transactions.add_transaction(date, price, category, description)
        return redirect(request.url)
    elif request.method == "POST" and request.form.get("start"):
        start = request.form["start"]
        end = request.form["end"]
        return redirect(f'/{start}_{end}')
    elif start_date and end_date:
        start = start_date
        end = end_date

        transaction_data = transactions.get_date_from_range(start_date, end_date)
    else:
        start = None
        end = None
        transaction_data = transactions.get_all_transactions()
    chart_data, chart_values = create_chart_data(3, 1, 2025)


    print(transactions.is_duplicate("53.61", "12/28/2025"))
    total = sum(transaction.price for transaction in transaction_data)
    categories = transactions.get_categories()
    category_totals = {}
    for category in categories:
        category_sum = transactions.get_sum_of_category(category, start, end)
        if category_sum > 0:
            category_totals[category] = category_sum
    categories = sorted(category_totals.items(), key=lambda item: item[1], reverse=True)

    return render_template("main.html", data=transaction_data, total=total, categories=categories, chart_data=chart_data, chart_values=chart_values)


@app.route('/investments', methods=["GET"])
def investments():
    return render_template("investments.html")


@app.route('/delete_all', methods=["POST", "GET"])
def delete_all():
    transactions.query.filter_by().delete()
    db.session.commit()
    return redirect("/")


@app.route('/delete/<id>', methods=["POST", "GET"])
def delete(id):
    transactions.query.filter_by(id=id).delete()
    db.session.commit()
    return redirect("/")


@app.route("/upload", methods=["POST", "GET"])
def parse_csv():
    print("Upload endpoint hit!")
    if request.method == "POST":
        bank = request.form["bank"]
        csv_file = request.files['csv_file']
        if bank == "Wells Fargo":
            read_wells_fargo_data(csv_file)
        elif bank == "Marcus":
            read_marcus_statement(csv_file)
    return redirect("/")


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0')
