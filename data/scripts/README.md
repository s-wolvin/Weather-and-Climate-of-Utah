## filter_data.py
Python script that takes the output from process_stations.py and filters the stations to those of sufficient record. 

## process_station_data.py
Python script that pulls the entire GHCND dataset, filters the stations of only Utah, and outputs files of precipitation, extreme precipitation, average temperature, maximum temperature, and minimum temperature as yearly and monthly values. 

## process_station_datav2.0.py
Updated to generate data only for stations used in the analysis

## process_station_datav3.0.py
Updated to calculate warm- and cool-season temperature and precipitation statistics

## process_wildfire_gsl_data.py
Python script that pulls the list of Utah wildfires from 1999 to 2020 and formulates the yearly acreage burned. Additionally, this script pulls every 5-sec observation of the Great Salt Lake water elevation from 2007 to 2023 and formulates a monthly average.
