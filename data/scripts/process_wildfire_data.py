"""
Savanna Wolvin

Created: Sep 25th, 2023
Edited: Sep 25th, 2023

Post Process the wildfire data and great salt lake water elevations

"""
#%% Global Imports

import pandas as pd
import numpy as np


#%% Post Process Fire data

# Load Data
wf = pd.read_csv("Historic_Utah_Wildfire_Perimeters_1999_to_2020.csv")

# Pull Desired variables
wf = wf[['incidentName','discoveryDate','gisacres']]   

# Remove any fires missing discovery data or gisacres
wf = wf.dropna(axis = 0)

# remove fires of less than one acre
wf = wf[wf['gisacres'] >= 1]

# Sort by 
wf = wf.sort_values('discoveryDate')

# formulate total acres per-year
wf['discoveryDate'] = pd.to_datetime(wf['discoveryDate'])
wf['year'] = wf['discoveryDate'].dt.year

wf = wf.groupby(['year'])['gisacres'].sum()

# Save CSV
wf.to_csv('utah_wildfire_yearly_acres')



#%% Post Process GSL water elevation

for year in np.arange(2007, 2024):
    # load in the dataset
    xx = pd.read_csv(f"GSL_water_elev_{year}.csv", header=[0])
    
    # remove the first row
    xx = xx.drop(0, axis=0)

    # combine dataframes
    if year == 2007:
        gsl = xx
    else:
        gsl = pd.concat([gsl, xx], axis = 0)
        

# Pull Desired variables
gsl = gsl[['datetime','144230_62614_cd']]

# rename
gsl = gsl.rename(columns = {'144230_62614_cd': 'elev'})

# Remove any fires missing discovery data or gisacres
gsl = gsl.dropna(axis = 0)

# formulate elevation per-month
gsl['datetime'] = pd.to_datetime(gsl['datetime'])
gsl['year'] = gsl['datetime'].dt.year
gsl['month'] = gsl['datetime'].dt.month

gsl['elev'] = gsl['elev'].astype('float')

gsl = gsl.groupby(['year', 'month'])['elev'].mean()

# Save CSV
gsl.to_csv('GSL_monthly_water_elev')
