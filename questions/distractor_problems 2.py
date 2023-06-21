import random
import argparse
import json

parser = argparse.ArgumentParser(description='Generate some random double digit addition problems.')
parser.add_argument('--N', default=200, type=int)
args = parser.parse_args()

problems = []
for i in range(args.N):
    parity = random.choice((True, False))
    a = random.randint(1, 9)
    b = random.randint(1, 9)
    c = random.randint(1, 9)
    if parity:
        d = int(a) + int(b) + int(c)
    else:
        d = int(a) + int(b) + int(c) + random.choice((-1, 1)) * random.randint(1, 9)
    
    question = f'{a} + {b} + {c} = {d}'
    answer = str(parity)

    problems.append([question, answer])

with open('questions/json/distractors.json', 'w+') as f:
    json.dump(problems, f)