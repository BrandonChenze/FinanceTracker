import pandas as pd
from models import Transaction, transactions
from datetime import datetime


def read_wells_fargo_data(path_to_csv) -> pd.DataFrame:
    df = pd.read_csv(path_to_csv)
    items = df[['Transaction Date', 'Amount', 'Placeholder', 'Placeholder1', 'Description']].values
    for x in items:
        item = Transaction(x[4], x[1], x[0])
        item.display()
        item_data = datetime.strptime(item.date, "%m/%d/%Y")  # python datetime object for DB
        # if item.price < 0:
        #     transactions.add_transaction(item_data, item.price*-1, "Testing", item.description)
        if item.price > 0:
            transactions.add_transaction(item_data, item.price, "Income", item.description)
    return items


def read_marcus_statement(path_to_csv):
    df = pd.read_csv(path_to_csv)
    items = df[['Transaction Date', 'Description', 'Amount']].values
    income = [item for item in items if item[2] > 0]
    items = [item for item in items if item[2] < 0]
    for item in items:
        item = Transaction(item[1], item[2], item[0])
        item_data = datetime.strptime(item.date, "%m/%d/%Y")  # python datetime object for DB
        transactions.add_transaction(item_data, item.price*-1, "Testing", item.description)

# def get_category(description):
    

#     categories = 