import urllib2
import json
import string
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

#get info for a single plant code page
def collectSingle(plant_code):
	website = 'http://ecocrop.fao.org/ecocrop/srv/en/dataSheet?id=' + plant_code
	print website



alphabets = list(string.ascii_lowercase)
allLetterPgs = ['http://ecocrop.fao.org/ecocrop/srv/en/cropList?name='+ letter +'&relation=beginsWith' for letter in alphabets]
plantSet = set()
plantSet.update(retrivesCodes(allLetterPgs[0]))
for e in plantSet:
	collectSingle(e)
	break
#SAVE FOR LAST
#for link in allLetterPgs:
#	plantSet.update(retrivesCodes(link))
