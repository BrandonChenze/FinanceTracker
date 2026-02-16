import pandas as pd
from models import Transaction, transactions
from datetime import datetime


def read_wells_fargo_data(path_to_csv) -> pd.DataFrame:
    df = pd.read_csv(path_to_csv)
    items = df[['Transaction Date', 'Amount', 'Placeholder', 'Placeholder1', 'Description']].values
    for transaction in items:
        item = Transaction(transaction[4], transaction[1], transaction[0])
        item.display()
        item_data = datetime.strptime(item.date, "%m/%d/%Y")  # python datetime object for DB
        if item.price > 0:
            transactions.add_transaction(item_data, item.price, "Income", item.description)
        else:
            transactions.add_transaction(item_data, item.price*-1, "Testing", item.description)
    return items


def read_marcus_statement(path_to_csv):
    df = pd.read_csv(path_to_csv)
    items = df[['Transaction Date', 'Description', 'Amount']].values
    for item in items:
        item = Transaction(item[1], item[2], item[0])
        item_data = datetime.strptime(item.date, "%m/%d/%Y")  # python datetime object for DB
        if item.price > 0:
            transactions.add_transaction(item_data, item.price, "Income", item.description)
        else:
            transactions.add_transaction(item_data, item.price*-1, "Testing", item.description)
    return items
