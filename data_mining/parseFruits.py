import json
import os

fruitDir = '../data/fruits'
def readJSON(dir):
	if os.path.exists(fruitDir):
		onlyfiles = [f for f in listdir(fruitDir) if isfile(join(fruitDir, f))]
		print onlyfiles
	else: 
		print ('oh no baby wat is u doin')
readJSON(fruitDir)