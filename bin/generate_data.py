#!/usr/bin/env python
import pandas as pd
# import dataset
from time import time
import zipfile
import os
import json
from pandas.api.types import CategoricalDtype
from solve import Trial
import numpy as np
from itertools import accumulate
import re
import pymysql
import boto3

bucket_name = 'memlab'

pd.options.mode.chained_assignment = None  # default='warn' We do it safely.

# IMPORTANT: This has to be set to the correct database in order for this to work. For local testing purposes that
# means a long postgres thing that you can find in your postgres settings.
# On linux/macos: export DATABASE_URL=postgres://BLAHBLAHBLAH
# On windows: set DATABASE_URL=postgres://BLAHBLAHBLAH
# or export DATABASE_URL=`heroku config:get DATABASE_URL -a <APPNAME>`

# db = dataset.connect(os.environ['DATABASE_URL'])
db_host = 'awseb-e-s349zw8gmk-stack-awsebrdsdatabase-lqrb6j4bljdx.cfdb0atxmvs4.us-east-2.rds.amazonaws.com'
db_user = 'admin'
db_password = 'memlabtest'
db_name = 'ebdb'

# Create a database connection using pymysql and adding additional parameter to get data in dictionary form
db = pymysql.connect(
    host=db_host,
    user=db_user,
    password=db_password,
    database=db_name,
    cursorclass=pymysql.cursors.DictCursor
)


# This is a temporary fix, when you fix the pssc task itself, you can get rid of it.
max_trials = 3

# if not os.path.exists('files'):
#     os.mkdir('files')

def zipdir(path, ziph):
    for dirname, subdirs, files in os.walk(path):
        for filename in files:
            ziph.write(os.path.join(dirname, filename), arcname=filename)


qkindtype = CategoricalDtype(['EMObjectPicture', 'EMWordStim', 'SMObjectNaming',
                              'WMForwardDigitSpan', 'WMBackwardDigitSpan', 'EFStroop',
                              'EFRuleID', 'PSStringComparison', 'LongTerm', 'endSurvey'], ordered=True)

qblocktype = CategoricalDtype(['practice', 'easy', 'medium', 'hard', 'longterm', 'survey'], ordered=True)


def cond_pssc(itemnum):
    with open('./questions/json/qblock.json', 'r') as f:
        qblock = json.load(f)
    tsecs = qblock[itemnum]['stimsType']
    tsecs = float(tsecs[:-1])
    return int(tsecs * 1000)


def max_if_zero(row):
    if row.reaction_time == 0:
        row.reaction_time = row.maxtime
    return row


def retime_pssc(data):
    pssc = data[data.type == 'PSStringComparison']
    pssc['maxtime'] = pssc.item.apply(cond_pssc)
    pssc = pssc.apply(max_if_zero, axis=1)
    newframes = []
    for item in pssc.item.unique():
        itemset = pssc[pssc.item == item]
        itemset.reaction_time[1:] -= itemset.reaction_time.values[:-1]
        newframes.append(itemset)
    newpssc = pd.concat(newframes)
    newpssc = newpssc
    return newpssc

# noinspection All
def by_subject_old():
    '''
    deprecated, read it, learn from it, it's bad, it moves fast and it breaks things.
    this is why zuckerburg is wrong.
    Returns: Jack
    -------

    '''
    with open('./questions/json/qblock.json', 'r') as f:
        qblock = json.load(f, encoding='utf-8')

    answers = db['answers']
    rt = db['reaction_time']
    ordering = db['ordering']
    if not os.path.exists('files/by_subject'):
        os.mkdir('files')
        os.mkdir('files/by_subject')
    for i in db['response']:
        pid = i['pid']
        data = {'ordering': [], 'item': [], 'trial': [], 'reaction_time': [],
                'response': [], 'answer': [], 'score': [], 'type': [], 'block': []}
        tic = time()
        r = rt.find_one(pid=pid)
        o = ordering.find_one(pid=pid)
        mark = False
        for j in answers:
            data['item'].append(j['task'].upper()[1:-2])
            data['trial'].append(int(j['task'][-1]))
            data['reaction_time'].append(r[j['task'].lower()])

            if data['item'][-1][0:2] == 'LT':
                data['type'].append('LongTerm')
                data['block'].append('longterm')
            else:
                data['type'].append(qblock[data['item'][-1]]['kind'])
                data['block'].append(qblock[data['item'][-1]]['difficulty'])

            if j['task'].lower() in i:
                data['response'].append(i[j['task'].lower()])
            else:
                data['response'].append(None)
            # This is the code that can be removed when you fix pssc, also change that elif to if
            if data['trial'][-1] == 0:
                mark = True
            if data['type'][-1] == 'PSStringComparison':
                if data['trial'][-1] >= max_trials:
                    if mark:
                        mark = False
                        data['trial'][-2] = 0
                    data['trial'][-1] = data['trial'][-1] - 2
                t = data['trial'][-1]
                stims = qblock[data['item'][-1]]['stimuli'][t]
                stim1, stim2 = stims.split('-')
                answer = ['different', 'same'][stim1 == stim2]
                data['answer'].append(answer)
            elif data['item'][-1][0:2] == 'ES':
                data['answer'].append('')
            else:
                data['answer'].append(j['answer'])

            if data['item'][-1][0:2] == 'ES':
                data['score'].append('')
            else:
                data['score'].append(data['answer'][-1] == data['response'][-1])
            data['ordering'].append(o[j['task'].lower()])

            # NOTE: This is a patch, and should be removed and fixed more completely when you redo the netcode for
            # the real thing. Normally I wouldn't feel comfortable patching it this way, since it technically
            # fabricates the data, but the data is only dropped when the JS side correct check succeeds, so we know
            # that if the item was dropped like this, then it's correct.

            if not data['ordering'][-1] and data['type'][-1] != 'PSStringComparison':
                data['ordering'][-1] = 0
                data['response'][-1] = data['answer'][-1]
                data['score'][-1] = True

        print(f'Fetching data for {pid} took {time() - tic} seconds.')

        data = pd.DataFrame(data)
        data['ordering'].replace('', None, inplace=True)
        data.dropna(subset=['ordering'], inplace=True)
        data['type'] = data['type'].astype(qkindtype)
        data['block'] = data['block'].astype(qblocktype)
        data = data.sort_values(['type', 'block', 'item', 'trial'])
        data.to_csv(f'files/by_subject/{pid}.csv', index=False)
    zipf = zipfile.ZipFile('files/by_subject.zip', 'w', zipfile.ZIP_DEFLATED)
    zipdir('files/by_subject', zipf)
    zipf.close()


def helper_by_subject(table:str):
    cursor = db.cursor()
    query = f"SELECT * FROM {table}";
    cursor.execute(query)
    result = cursor.fetchll()
    cursor.close()
    return result


def by_subject():
    with open('./questions/json/qblock.json', 'r') as f:
        qblock = json.load(f)

    itcodes = []
    for item in qblock:
        if qblock[item]['difficulty'] != '':
            if len(qblock[item]['trials']) != 0:
                for trial, _ in enumerate(qblock[item]['trials']):
                    itcodes.append((item, trial))
            else:
                for trial, _ in enumerate(qblock[item]['stimuli']):
                    itcodes.append((item, trial))

    # ordering = db['ordering']
    # rt = db['reaction_time']
    dfs = {}  # Dataframes will be in a dictionary, key will be pid, value will be dataframe.

    if not os.path.exists('files/by_subject'):
        os.mkdir('files')
        os.mkdir('files/by_subject')

    query3 = "SELECT * FROM response";
    cursor = db.cursor()
    cursor.execute(query3)
    res = cursor.fetchall()

    for i in res:
        cursor = db.cursor()
        pid = i['pid']
        data = []
        tic = time()
        cursor.execute("SELECT * FROM reaction_time WHERE pid = %s",(pid,))
        r = cursor.fetchone()
        cursor.execute(f"SELECT * FROM ordering WHERE pid = %s",(pid,))
        o =  cursor.fetchone()

        for j in i:
            if j == 'pid':
                continue
            datum = {'item': j.upper()[1:-2],
                     'reaction_time': r[j.upper()]}

            # This is a weird patch, take it out when you redo the trial data for LT and ES.
            if datum['item'][-7:] == 'UNDEFIN':
                datum['item'] = datum['item'][0:-8]

            try:
                datum['trial'] = int(j[-1])
            except ValueError:
                datum['trial'] = 0

            if datum['item'][0:2] == 'LO':
                datum['type'] = 'LongTerm'
                datum['block'] = 'longterm'
            elif datum['item'][0:2] == 'ES':
                datum['type'] = 'EndSurvey'
                datum['block'] = 'survey'
            else:
                datum['type'] = qblock[datum['item']]['kind']
                datum['block'] = qblock[datum['item']]['difficulty']

            if j.upper() in i:
                datum['response'] = i[j.upper()]
            else:
                datum['response'] = None
            if datum['item'][0:2] == 'ES':
                datum['answer'] = ''
                datum['score'] = ''
            else:
                solver = Trial.create(datum['type'])
                if datum['item'][0:2] == 'LO':
                    # TODO: Adapt this to the new system in next round.
                    stims = re.search(r'\d', datum['item'])[0]
                    trials = [0, 1, 2]  # Shut up
                else:
                    stims = qblock[datum['item']]['stimuli']
                    trials = qblock[datum['item']]['trials']
                datum['answer'] = solver.batch_solve(stims, trials)[datum['trial']]
                datum['score'] = datum['answer'] == datum['response']
            datum['ordering'] = o[j.upper()]

            data.append(datum)

        dfs[pid] = data
        print(f'Fetching data for {pid} took {time() - tic} seconds.')

    for subject in dfs:
        data = pd.DataFrame(dfs[subject])
        data['ordering'].replace('', None, inplace=True)
        data.dropna(subset=['ordering'], inplace=True)
        _, inv = np.unique(data['ordering'], return_inverse=True)
        data['ordering'] = inv
        data['type'] = data['type'].astype(qkindtype)
        data['block'] = data['block'].astype(qblocktype)
        data = data.sort_values(['type', 'block', 'item', 'trial'])
        data[data.type == 'PSStringComparison'] = retime_pssc(data)
        data['reaction_time'].replace(0, 'NA', inplace=True)
        data.to_csv(f'files/by_subject/{subject}.csv', index=False)

    
    s3_client = boto3.client('s3')

    zipf = zipfile.ZipFile('files/by_subject.zip', 'w', zipfile.ZIP_DEFLATED)
    zipdir('files/by_subject', zipf)
    zipf.close()

    s3_client.upload_file('files/by_subject.zip', bucket_name, 'by_subject.zip')



def main():
    by_subject()


if __name__ == "__main__":
    st = time()
    main()
    print(time() - st)
