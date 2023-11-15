import pandas as pd
import numpy as np
import sys

np.set_printoptions(threshold = sys.maxsize)
pd.set_option('display.max_columns', None)
pd.set_option('display.max_rows', None)

# Read in data and define out directory
df     = pd.read_csv('/uufs/chpc.utah.edu/common/home/steenburgh-group10/mpletcher/courses/cs6630/proj/data/GHCNd/1992_2022_GHCND_data_new.csv')
outdir = '/uufs/chpc.utah.edu/common/home/steenburgh-group10/mpletcher/courses/cs6630/proj/data/GHCNd/'

# Sort DataFramev by station name and date
df_sorted = df.sort_values(by = ['NAME', 'DATE'])

# Create new columns for month and year
df_sorted['DATE']  = pd.to_datetime(df_sorted['DATE'])
df_sorted['month'], df_sorted['year'] = df_sorted['DATE'].dt.month, df_sorted['DATE'].dt.year
  
# Create empty lists for data processing
station_month_means, station_month_counts = [], []
station_year_means,  station_year_counts  = [], []

# Get station metadata
station_metadata = df.drop_duplicates(subset = ['NAME', 'LATITUDE', 'LONGITUDE', 'ELEVATION'])
station_metadata = station_metadata[['NAME', 'LATITUDE', 'LONGITUDE', 'ELEVATION']]
#station_metadata.to_csv(outdir + 'station_metadata.csv')

# Years used for data
yrs = sorted(df_sorted['year'].unique())

# Empty lists for loops
names = []
prcps = []
dates = []

# Loop through each year, calculating cool season precip data   
for yr in yrs:

    # Filter data based on cool season months
    cs_times     = (df_sorted['DATE'] >= str(yr - 1) + '-11-01') & (df_sorted['DATE'] <= str(yr) + '-04-01')
    df_subset_cs = df_sorted[cs_times]

    # Calculate cool season precip and mean warm season temperatures
    df_subset_cs['precip_cool_season']    = df_sorted[cs_times].groupby(['NAME'])['PRCP'].cumsum()

    # Filter data to only include April
    cs_months = (df_subset_cs['month'] == 4)

    # Append data to empty lists
    names.append(df_subset_cs[cs_months]['NAME'])
    prcps.append(df_subset_cs[cs_months]['precip_cool_season'])
    dates.append(df_subset_cs[cs_months]['DATE'])

# Concatenate all appended lists
prcps_all_cs = pd.concat(prcps)
names_all_cs = pd.concat(names)
dates_all_cs = pd.concat(dates)

# Empty lists for loops
names_seasonal  = []
prcps_seasonal  = []
dates_seasonal  = []
temps_seasonal  = []
months_seasonal = []
seasonss        = []

# Loop through each year, calculating seasonal precip totals for each year
start_mns = ['12', '3', '6', '9']
end_mns   = ['2', '5', '8', '11']
seasons   = ['winter', 'spring', 'summer', 'fall']

for yr in yrs:
    for start_mn, end_mn, season in zip(start_mns, end_mns, seasons):

        if start_mn == '12':

            # Filter data based on season
            cs_times = (df_sorted['DATE'] >= str(yr - 1) + '-'  + start_mn + '-01') & \
                       (df_sorted['DATE'] <= str(yr)     + '-0' + end_mn   + '-01')

        elif start_mn == '9':

            cs_times = (df_sorted['DATE'] >= str(yr) + '-0' + start_mn + '-01') & \
                       (df_sorted['DATE'] <= str(yr) + '-' + end_mn    + '-01')

        else:
            
            cs_times = (df_sorted['DATE'] >= str(yr) + '-0' + start_mn + '-01') & \
                       (df_sorted['DATE'] <= str(yr) + '-0' + end_mn   + '-01')

        df_subset_cs = df_sorted[cs_times]

        # Calculate cool season precip and mean warm season temperatures
        df_subset_cs['precip_' + str(season) + '_season']    = df_sorted[cs_times].groupby(['NAME'])['PRCP'].cumsum()
        df_subset_cs['temp_'   + str(season) + '_season']    = df_sorted[cs_times].groupby(['NAME'])['TAVG'].transform('mean')

        if end_mn == '2':

            df_subset_cs['season'] = 'Winter'

        elif end_mn == '5':

            df_subset_cs['season'] = 'Spring'

        elif end_mn == '8':

            df_subset_cs['season'] = 'Summer'

        else:

            df_subset_cs['season'] = 'Fall'

        # Filter data to only include end season month
        cs_months = (df_subset_cs['month'] == int(end_mn))

        # Append data to empty lists
        names_seasonal.append(df_subset_cs[cs_months]['NAME'])
        prcps_seasonal.append(df_subset_cs[cs_months]['precip_' + str(season) + '_season'])
        temps_seasonal.append(df_subset_cs[cs_months]['temp_'   + str(season) + '_season'])
        dates_seasonal.append(df_subset_cs[cs_months]['DATE'])
        months_seasonal.append(df_subset_cs[cs_months]['month'])
        seasonss.append(df_subset_cs[cs_months]['season'])

# Concatenate all appended lists
prcps_all_seasonal  = pd.concat(prcps_seasonal)
temps_all_seasonal  = pd.concat(temps_seasonal)
names_all_seasonal  = pd.concat(names_seasonal)
dates_all_seasonal  = pd.concat(dates_seasonal)
months_all_seasonal = pd.concat(months_seasonal)
seasons_all         = pd.concat(seasonss)

names_ws = []
temps    = []
dates_ws = []

# Loop through each year, calculating warm season temperature data
for yr in yrs:

    # Filter data based on warm season months
    ws_times     = (df_sorted['DATE'] >= str(yr) + '-05-01') & (df_sorted['DATE'] <= str(yr) + '-10-01')
    df_subset_ws = df_sorted[ws_times]

    df_subset_ws['temp_warm_season_mean'] = df_sorted[ws_times].groupby('NAME')['TAVG'].transform('mean')

    # Filter data to only include November
    ws_months = (df_subset_ws['month'] == 10)

    names_ws.append(df_subset_ws[ws_months]['NAME'])
    temps.append(df_subset_ws[ws_months]['temp_warm_season_mean'])
    dates_ws.append(df_subset_ws[ws_months]['DATE'])

# Concatenate all appended lists
temps_all_ws = pd.concat(temps)
names_all_ws = pd.concat(names_ws)
dates_all_ws = pd.concat(dates_ws)

# Create new DataFrames
all_data_cs       = pd.DataFrame({'NAME': names_all_cs, 'PRCP': prcps_all_cs, 'DATE': dates_all_cs})
all_data_ws       = pd.DataFrame({'NAME': names_all_ws, 'TAVG': temps_all_ws, 'DATE': dates_all_ws})
all_data_seasonal = pd.DataFrame({'NAME': names_all_seasonal, 'DATE': dates_all_seasonal, \
                                  'PRCP': prcps_all_seasonal, 'TAVG': temps_all_seasonal, \
                                  'month': months_all_seasonal, 'season': seasons_all})

# Create column names for each cool season
column_names = [f"{year}/{str(year+1)[-2:]}" for year in range(1992, 2022)]

# Sites used for project
subset_names = ['ALTON, UT US', 'BLACK ROCK, UT US', 'BLANDING, UT US', 'BLUFF, UT US', 'BOULDER, UT US', \
                'BOUNTIFUL BENCH, UT US', 'CALLAO, UT US', 'CANYONLANDS THE NECK, UT US',  \
                'DEER CREEK DAM, UT US', 'DESERET, UT US', 'ECHO DAM, UT US', 'EPHRAIM, UT US',   \
                'ESCALANTE, UT US', 'HANS FLAT RANGER STATION, UT US', 'JENSEN, UT US',    \
                'KAMAS, UT US', 'KANAB, UT US', 'MANTI, UT US', 'NEPHI, UT US', 'PROVO BYU, UT US',      \
                'RICHMOND, UT US', 'SALT LAKE CITY INTERNATIONAL AIRPORT, UT US',   \
                'TOOELE, UT US', 'WANSHIP DAM, UT US', 'WOODRUFF, UT US','ZION NATIONAL PARK, UT US']

# Define the list of years
years = range(1992, 2022)

# Create an empty DataFrame for the subset data
subset_data = pd.DataFrame(index=subset_names, columns=[f"Jan {str(yr+1)}" for yr in years])

# Loop through years and site names
for yr in years:
    for name in subset_names:

        # Filter data for each year
        year_filter = (all_data_cs['DATE'] == f"{yr+1}-04-01")
        year_data = all_data_cs[year_filter]

        # Add data to subset data
        subset_prcp = year_data.loc[year_data['NAME'] == name, 'PRCP'].values
        subset_data.at[name, f"Jan {str(yr+1)}"] = subset_prcp

#subset_data.to_csv(outdir + 'station_cool_season_PRCP.csv')

years = range(1992, 2023)

subset_data_ws = pd.DataFrame(index=subset_names, columns=[f"{yr}" for yr in years])

# Loop through years and site names
for yr in years:
    for name in subset_names:

        # Filter data for each year
        year_filter = (all_data_ws['DATE'] == f"{yr}-10-01")
        year_data = all_data_ws[year_filter]

        # Add data to subset data
        subset_temp = year_data.loc[year_data['NAME'] == name, 'TAVG'].values
        subset_data_ws.at[name, f"{yr}"] = subset_temp

# Seasonal data
season_means_prcp   = all_data_seasonal.groupby(['NAME', 'season'])['PRCP'].mean()
season_means_temp   = all_data_seasonal.groupby(['NAME', 'season'])['TAVG'].mean()
season_means_prcp_f, season_means_temp_f = season_means_prcp.reset_index(), season_means_temp.reset_index(), 

season_means_prcp_f, season_means_temp_f = season_means_prcp_f[season_means_prcp_f['NAME'].isin(subset_names)], \
                                           season_means_temp_f[season_means_temp_f['NAME'].isin(subset_names)]

prcp_df, temp_df = season_means_prcp_f.pivot(index='NAME', columns='season', values='PRCP'), \
                   season_means_temp_f.pivot(index='NAME', columns='season', values='TAVG')

prcp_df.reset_index(inplace=True)
temp_df.reset_index(inplace=True)

# Rename the columns to match your desired structure
prcp_df.columns.name, temp_df.columns.name = None, None  # Remove the name of the columns
prcp_df.columns, temp_df.columns = ['NAME', 'Fall', 'Spring', 'Summer', 'Winter'], ['NAME', 'Fall', 'Spring', 'Summer', 'Winter']

prcp_df.to_csv('/uufs/chpc.utah.edu/common/home/steenburgh-group10/mpletcher/courses/cs6630/proj/data/GHCNd/station_seasonal_mean_temp.csv')
temp_df.to_csv('/uufs/chpc.utah.edu/common/home/steenburgh-group10/mpletcher/courses/cs6630/proj/data/GHCNd/station_seasonal_mean_total_prcp.csv')

# Loop through each variable and time period
for key in ['EMXP', 'PRCP', 'TAVG', 'TMAX', 'TMIN']: # ['EMXP', 'PRCP', 'TAVG', 'TMAX', 'TMIN']
    for period in ['month', 'year']:

        # Group by station and time period and Calculate yearly and monthly averages of each variable 
        # as well as the number of records each month and year
        time_means    = df_sorted.groupby(['NAME', period])[key].mean().unstack(period)
        time_counts   = df_sorted.groupby(['NAME', period])[key].count().unstack(period)

        # Save to .csv
        #time_means.to_csv(outdir  + 'station_'  + str(key) + '_' +  str(period) + '_means_.csv')
        #time_counts.to_csv(outdir + 'station_'  + str(key) + '_' +  str(period) + '_counts_.csv')

        # Calculate total yearly precipitation for each station
        if key == 'PRCP' and period == 'year':
        
            # Groupby
            time_sum = df_sorted.groupby(['NAME', period])[key].sum().unstack(period)
            
            # Save to .csv
            #time_sum.to_csv(outdir + 'station_' + str(key) + '_' +  str(period) + '_cumsum_.csv')