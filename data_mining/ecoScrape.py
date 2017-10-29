import urllib2
import json
import string
import os
from bs4 import BeautifulSoup, NavigableString
from collections import OrderedDict

def isInt(s):
	try: 
		int(s)
		return True
	except ValueError:
		return False

# Retries all plant codes for a given webpage
def retrivesCodes(webpage):
	plantCodes = []
	page = urllib2.urlopen(webpage)
	soup = BeautifulSoup(page, 'html.parser')
	for i in soup.find_all(text = True):
		if isInt(i):
			plantCodes.append(i.encode("utf8"))
	return plantCodes

# Returns tuple of table entry
def tupleTab(eachRow, col, col_index):
	currList = []
	if isInt(col_index):
		currList = [col[col_index]]
	elif col_index in ['four']:
		currList = col[0:4]
	elif col_index in ['two']:
		currList = col[4:6]
	elif col_index in ['two_d']:
		currList = col[5:7]
	elif col_index in ['two_c']:
		currList = col[1:3]
	return (eachRow.text.encode('ascii','ignore'), [k.text.encode('ascii','ignore').strip('\n\t') for k in currList])	

#get info for a single plant code page and stores in json
def collectSingle(plant_code):
	website = 'http://ecocrop.fao.org/ecocrop/srv/en/dataSheet?id=' + plant_code
	commNameSite = 'http://ecocrop.fao.org/ecocrop/srv/en/cropView?id=' + plant_code

	#Grabs common names of plant
	print commNameSite
	namePage = urllib2.urlopen(commNameSite)
	nameSoup = BeautifulSoup(namePage, 'html.parser')
	nameTab = nameSoup.find("div", {"id": "content"}).find("table")
	commName = ['Common names', '']

	for x in nameTab.findAll('tr'):
		left = x.find('th')
		if left.text in ['Common names']:
			names = [k.encode('ascii','ignore') for k in x.find('td').text.split(',')]
			commName[1]= names
	page = urllib2.urlopen(website) 
	soup = BeautifulSoup(page, 'html.parser')
	webContent = soup.find("div", {"id": "content"})
	plant_name = webContent.find("h2").text.encode('ascii','ignore')

	four_entries = ['Temperat. requir.','Rainfall (annual)', 'Latitude', 'Altitude', 'Soil PH', 'Light intensity']
	two_entries = ['Soil depth', 'Soil texture', 'Soil fertility', 'Soil Al. tox', 'Soil salinity', 'Soil drainage', 'Crop cycle']

	tupleList = []
	tupleList.append(tuple(['Plant Name' ,[plant_name]]))
	tupleList.append(tuple(commName))
	for table in soup.find_all("table"):
		for row in table.findAll('tr'):
			col = row.findAll('td')
			subRows = row.findAll('th')
			if col:
				col_index = 0
				for eachRow in subRows:
					if eachRow.text in four_entries:
						tupleList.append(tupleTab(eachRow, col, 'four'))
					elif eachRow.text in two_entries:
						if eachRow.text in ['Soil depth']:
							tupleList.append(tupleTab(eachRow, col, 'two_d'))
						elif eachRow.text in ['Crop cycle']:
							tupleList.append(tupleTab(eachRow, col, 'two_c'))
						else:
							tupleList.append(tupleTab(eachRow, col, 'two'))
					else: 
						tupleList.append(tupleTab(eachRow, col, col_index))
					col_index +=1
	return tupleList

# stores plant data into json 
def storeTups(listOfTups):
	plantsDir = 'data/plants'
	if not os.path.exists('data'):
		os.mkdir('data')
	fileName = listOfTups[0][1][0]
	data = OrderedDict()
	for tup in listOfTups:
		data[tup[0]] = tup[1]
	if not os.path.exists(plantsDir):
		os.mkdir(plantsDir)
	with open(plantsDir +'/' + fileName + '.txt', 'w') as outfile:
		json.dump(data,outfile, indent = 4)	

alphabets = list(string.ascii_lowercase)
allLetterPgs = ['http://ecocrop.fao.org/ecocrop/srv/en/cropList?name='+ letter +'&relation=beginsWith' for letter in alphabets]
plantSet = set()

#SAVE FOR LAST
for link in allLetterPgs:
	plantSet.update(retrivesCodes(link))
for i in plantSet:
	storeTups(collectSingle(i))