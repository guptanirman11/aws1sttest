import csv
import json
import glob
import os

fpath = os.path.dirname(os.path.realpath(__file__))

def csv2dict(csv_filename):
    with open(csv_filename, 'r') as csvfile:
        r = csv.reader(csvfile)
        dat = {}
        for i, row in enumerate(r):
            if i == 0:
                pass
            else:
                trial = {}
                trial['kind'] = csv_filename.split('/')[-1].split('.')[0]
                trial['taskNum'] = row[0]
                trial['stimuli'] = [i.replace('  ', ' ') for i in row[1:7] if i != '']
                trial['trials'] = [[j for j in i.split(' ') if j != ''] for i in row[7:10] if i != '']
                trial['stimsType'] = row[10]
                try:
                    trial['difficulty'] = row[11]
                except IndexError:
                    trial['difficulty'] = None
                dat[row[0]] = trial
    return dat

if __name__ == "__main__":
    dump = {}
    for csvf in glob.glob(fpath + '/csv/*'):
        dump.update(csv2dict(csvf))
    with open(fpath + '/json/qblock.json', 'w') as jf:
        json.dump(dump, jf, indent=4, sort_keys=True)