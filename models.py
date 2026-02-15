from database import db
from sqlalchemy import func
from logger import logging
from datetime import datetime
import sqlalchemy as sa


class transactions(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(150))
    price = db.Column(db.Float)
    date = db.Column(db.Date())
    category = db.Column(db.String(15))

    def __init__(self, description, price, date, category):
        super().__init__()
        self.description = description
        self.price = price
        self.date = date
        self.category = category

    def add_transaction(date, price, category, description):
        new_transaction = transactions(description, price, date, category)
        if not transactions._is_duplicate(price=price, date=date):
            logging.info("Adding new transaction")
            db.session.add(new_transaction)
            db.session.commit()

    def get_all_transactions(start_date=None, end_date=None, page=1):
        """Get every transaction"""
        if start_date and end_date:
            data_in_range = transactions.query.where(transactions.date >= start_date).where(transactions.date <= end_date).order_by(transactions.date.desc()).paginate(page=1, per_page=100).items
            return data_in_range
        else:
            return transactions.query.filter_by().order_by(transactions.date.desc()).paginate(page=page, per_page=10).items

    def get_categories():
        """Get all the available categories"""
        return db.session.execute(db.select(transactions.category).distinct()).scalars()

    def get_most_expensive():
        """Get the most expensive transaction"""
        most_expesnive = db.session.execute(db.select(func.max(transactions.price), transactions)).all()
        return most_expesnive[0][1]

    def get_date_from_range(start, end):
        """Get transactions in a certain date range"""
        data_in_range = list(db.session.execute(db.select(transactions).where(transactions.date >= start).where(transactions.date <= end)).scalars())
        logging.info(f"Found data in range {start} - {end}:\n{data_in_range}")
        for item in data_in_range:
            item.display()
        return data_in_range

    def get_sum_of_category(category, start=None, end=None):
        """Get the sum of a specific category"""
        if start and end:
            sum_of_category = db.session.execute(db.select(func.sum(transactions.price)).where(transactions.category==category).where(transactions.date >= start).where(transactions.date <= end)).scalar()
        else:
            sum_of_category = db.session.execute(db.select(func.sum(transactions.price)).where(transactions.category==category)).scalar()
        logging.info(f"Sum of {category} is {sum_of_category}")

        return 0 if sum_of_category is None else sum_of_category

    def get_total_by_month(month: int, year: int) -> list:
        """Get the total spent in a specific month"""
        if month < 10:
            month = f'0{month}'
        start_date = f'{year}-{month}-01'
        end_date = f'{year}-{month}-31'
        total_of_month = db.session.execute(db.select(func.sum(transactions.price)).where(transactions.date >= start_date).where(transactions.date <= end_date)).scalar()
        return 0 if total_of_month is None else total_of_month

    def _is_duplicate(price, date):
        """Check if a duplicate value is already in the database"""
        price = price
        if db.session.execute(db.select(transactions.id).where(transactions.price == price).where(transactions.date == date)).scalar():
            return True  # where(transactions.date == date)
        else:
            return False


class Transaction:
    def __init__(self, description, price, date):
        self.description = description
        self.price = price
        self.date = date

    def display(self):
        logging.info(f"{self.description} - {self.date} - {self.price}")