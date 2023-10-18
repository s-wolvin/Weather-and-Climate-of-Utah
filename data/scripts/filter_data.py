"""

"""
#%% Global Imports

import pandas as pd
import numpy as np


#%% load in stations

sttn = pd.read_csv('station_metadata.csv')


#%% load in precip

pr_year = pd.read_csv('station_PRCP_year_means_.csv')
pr_year_cnt = pd.read_csv('station_PRCP_year_counts_.csv')

pr_month = pd.read_csv('station_PRCP_month_means_.csv')
pr_month_cnt = pd.read_csv('station_PRCP_month_counts_.csv')


#%% load in temp

tp_year = pd.read_csv('station_TAVG_year_means_.csv')
tp_year_cnt = pd.read_csv('station_TAVG_year_counts_.csv')

tp_month = pd.read_csv('station_TAVG_month_means_.csv')
tp_month_cnt = pd.read_csv('station_TAVG_month_counts_.csv')


#%% Load in extreme data

expr_year  = pd.read_csv('station_EMXP_year_means_.csv')
expr_month = pd.read_csv('station_EMXP_month_means_.csv')

tmax_year  = pd.read_csv('station_TMAX_year_means_.csv')
tmax_month = pd.read_csv('station_TMAX_month_means_.csv')

tmin_year  = pd.read_csv('station_TMIN_year_means_.csv')
tmin_month = pd.read_csv('station_TMIN_month_means_.csv')


#%% Sort Values

sttn = sttn.sort_values('NAME')
pr_year = pr_year.sort_values('NAME')
pr_year_cnt = pr_year_cnt.sort_values('NAME')
pr_month = pr_month.sort_values('NAME')
pr_month_cnt = pr_month_cnt.sort_values('NAME')

tp_year = tp_year.sort_values('NAME')
tp_year_cnt = tp_year_cnt.sort_values('NAME')
tp_month = tp_month.sort_values('NAME')
tp_month_cnt = tp_month_cnt.sort_values('NAME')

expr_year = expr_year.sort_values('NAME')
expr_month = expr_month.sort_values('NAME')
tmax_year = tmax_year.sort_values('NAME')
tmax_month = tmax_month.sort_values('NAME')
tmin_year = tmin_year.sort_values('NAME')
tmin_month = tmin_month.sort_values('NAME')


#%% Determine stations with sufficient data

# Have at least 9 monthly observations per year
pr_year_cnt.iloc[:,1:] = pr_year_cnt.iloc[:,1:].where(pr_year_cnt.iloc[:,1:] > 8, np.nan)
tp_year_cnt.iloc[:,1:] = tp_year_cnt.iloc[:,1:].where(tp_year_cnt.iloc[:,1:] > 8, np.nan)

# Have at least 24 yearly observations per month
pr_month_cnt.iloc[:,1:] = pr_month_cnt.iloc[:,1:].where(pr_month_cnt.iloc[:,1:] > 23, np.nan)
tp_month_cnt.iloc[:,1:] = tp_month_cnt.iloc[:,1:].where(tp_month_cnt.iloc[:,1:] > 23, np.nan)


#%% Determine stations to keep

idx_pr_year  = pr_year_cnt[~pr_year_cnt.isna().any(axis=1)]
idx_pr_month = pr_month_cnt[~pr_month_cnt.isna().any(axis=1)]

idx_tp_year  = tp_year_cnt[~tp_year_cnt.isna().any(axis=1)]
idx_tp_month = tp_month_cnt[~tp_month_cnt.isna().any(axis=1)]

idx_pr_year  = idx_pr_year.index
idx_pr_month = idx_pr_month.index

idx_tp_year  = idx_tp_year.index
idx_tp_month = idx_tp_month.index


#%% Pull the same indicies for the original dataframes

# compare precip arrays
idx = np.intersect1d(np.array(idx_pr_year), np.array(idx_pr_month))

# compare to yearly temps
idx = np.intersect1d(np.array(idx_tp_year), idx)

# compare to monthly temps
idx = np.intersect1d(np.array(idx_tp_month), idx)


#%% Filter stations

pr_year  = pr_year.iloc[idx,:]
pr_month = pr_month.iloc[idx,:]

tp_year  = tp_year.iloc[idx,:]
tp_month = tp_month.iloc[idx,:]

expr_year  = expr_year.iloc[idx,:]
expr_month = expr_month.iloc[idx,:]

tmax_year  = tmax_year.iloc[idx,:]
tmax_month = tmax_month.iloc[idx,:]

tmin_year  = tmin_year.iloc[idx,:]
tmin_month = tmin_month.iloc[idx,:]

sttn = sttn[sttn['NAME'].isin(pr_year['NAME'])]


#%% Save data

sttn.to_csv('stations.csv')

pr_year.to_csv('precip_yearly.csv')
pr_month.to_csv('precip_monthly.csv')

tp_year.to_csv('temp_yearly.csv')
tp_month.to_csv('temp_monthly.csv')

expr_year.to_csv('ex_precip_yearly.csv')
expr_month.to_csv('ex_precip_monthly.csv')

tmax_year.to_csv('tmax_yearly.csv')
tmax_month.to_csv('tmax_monthly.csv')

tmin_year.to_csv('tmin_yearly.csv')
tmin_month.to_csv('tmin_monthly.csv')

