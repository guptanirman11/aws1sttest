#!bin/bash
export DATABASE_URL=postgres://ehxgnxiwwgneym:ee8ff6d312c1b9582105e3895a2158e2f618ca8bc9c24ea89a9fb1c743bee4f4@ec2-3-221-243-122.compute-1.amazonaws.com:5432/d7havkbepkiffe
python bin/generate_data.py
