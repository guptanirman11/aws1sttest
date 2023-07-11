import pandas as pd
import os

# Read the data from the CSV files
dataframes = {}
file_path = 'files/by_subject/'

# List all the CSV files in the directory
file_list = os.listdir(file_path)
for file_name in file_list:
    if file_name.endswith('.csv'):
        # Read each CSV file into a pandas DataFrame
        subject_id = file_name[:2]  # Extract the subject ID from the file name
        file = os.path.join(file_path, file_name)
        dataframe = pd.read_csv(file)
        dataframes[subject_id] = dataframe

# Perform computations on the data
for subject_id, dataframe in dataframes.items():
    # Example computation: Calculate the average reaction time
    average_rt = dataframe['reaction_time'].mean()
    print(f"Subject {subject_id}: Average Reaction Time = {average_rt}")

    # Perform other computations as needed

    # Store the results or further process the data

