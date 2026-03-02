from database import db
from sqlalchemy import func, select
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
            data_in_range = transactions.query.where(transactions.date >= start_date).where(transactions.date <= end_date).order_by(transactions.date.desc()).paginate(page=page, per_page=10).items
            return data_in_range
        else:
            return transactions.query.filter_by().order_by(transactions.date.desc()).paginate(page=page, per_page=10).items

    def total_spent(start_date=None, end_date=None):
        '''Get the total spent on transactions in a time frame.'''
        if start_date and end_date:
            found_transactions = transactions.query.where(transactions.category != 'Income').where(transactions.date >= start_date).where(transactions.date <= end_date).with_entities(transactions.price).all()
        else:
            found_transactions = transactions.query.where(transactions.category != 'Income').with_entities(transactions.price).all()
        total_spent = 0.0
        for t in found_transactions:
            total_spent += t[0]
        return total_spent

    def get_categories(start_date=None, end_date=None):
        """Get all the available categories"""
        if start_date and end_date:
            categories = transactions.query.with_entities(transactions.category).where(transactions.date >= start_date).where(transactions.date <= end_date).distinct().all()
        else:
            categories = transactions.query.with_entities(transactions.category).distinct().all()
        actual_cateogies = []
        for cat in categories:
            actual_cateogies.append(cat[0])
        return actual_cateogies

    def get_most_expensive():
        """Get the most expensive transaction"""
        most_expesnive = db.session.execute(db.select(func.max(transactions.price), transactions)).all()
        return most_expesnive[0][1]

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
        total_of_month = transactions.total_spent(start_date, end_date)
        logging.info(f"Total: {total_of_month} for {start_date} - {end_date}")
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