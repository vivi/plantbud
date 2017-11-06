import json
import os
from os import listdir
from os.path import isfile, join
fruitDir = '../data/fruits/'
def readJSON(dir):
	if os.path.exists(fruitDir):
		onlyfiles = [f for f in listdir(fruitDir) if isfile(join(fruitDir, f))]
		i = 0
		for file in onlyfiles:
			with open(fruitDir + file) as data_file:    
				data = json.load(data_file)
				if data.get('Soil:'):
					soilData =  data.get('Soil:')
	else: 
		print ('oh no baby wat is u doin')
readJSON(fruitDir)