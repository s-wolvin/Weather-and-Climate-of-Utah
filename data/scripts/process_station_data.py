import pandas as pd

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
station_metadata.to_csv(outdir + 'station_metadata.csv')

# Loop through each variable and time period
for key in ['EMXP', 'PRCP', 'TAVG', 'TMAX', 'TMIN']: # ['EMXP', 'PRCP', 'TAVG', 'TMAX', 'TMIN']
    for period in ['month', 'year']:

        # Group by station and time period and Calculate yearly and monthly averages of each variable 
        # as well as the number of records each month and year
        time_means    = df_sorted.groupby(['NAME', period])[key].mean().unstack(period)
        time_counts   = df_sorted.groupby(['NAME', period])[key].count().unstack(period)

        # Save to .csv
        time_means.to_csv(outdir  + 'station_'  + str(key) + '_' +  str(period) + '_means_.csv')
        time_counts.to_csv(outdir + 'station_'  + str(key) + '_' +  str(period) + '_counts_.csv')

        # Calculate total yearly precipitation for each station
        if key == 'PRCP' and period == 'year':
        
            # Groupby
            time_sum = df_sorted.groupby(['NAME', period])[key].sum().unstack(period)

            # Save to .csv
            time_sum.to_csv(outdir + 'station_' + str(key) + '_' +  str(period) + '_cumsum_.csv')
