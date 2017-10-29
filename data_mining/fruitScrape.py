import urllib2
import re
import json
import os
from bs4 import BeautifulSoup, NavigableString
from collections import OrderedDict


webName = 'https://www.crfg.org/pubs/frtfacts.html'
# Scrapes all fruit links off of frtfacts website
def allFruitScrape(website):
	page = urllib2.urlopen(website)
	soup = BeautifulSoup(page, 'html.parser')
	link_box = soup.find_all(attrs={'href':re.compile("^(ff\/)")})
	fruitLinks= []
	for i in link_box:
		currLink = 'https://www.crfg.org/pubs/' + i.attrs['href'].encode('ascii','ignore')
		fruitLinks.append(currLink)
	return fruitLinks


# Takes in a single weblink, scrapes all bolded strings, and saves into .json File
def singleLinkWrite(weblink):
	data = OrderedDict()
	page = urllib2.urlopen(weblink)
	soup = BeautifulSoup(page, 'html.parser')
	invalid_tags = ['i']

	#Unwraps i tags and merges siblings of i tagged content
	for tag in invalid_tags: 
		for match in soup.findAll(tag):
			if match is not None:
				replaceString = match.string
				before = match.previous_sibling
				after = match.next_sibling
				if before is not None and before.name is None:
					replaceString = before + replaceString
					before.extract()
				if after is not None and after.name is None: 
					replaceString = replaceString + after
					after.extract()
				match.replaceWith(replaceString)
	# Find all Bolded tags
	boldTagSet = soup.find_all('b')
	for i in boldTagSet:
		if i is not None:
			if i.next_sibling is not None:
				if i.next_sibling.string is not None:
					key = i.string.encode('ascii','ignore')
					data[key] = []
					data[key].append(i.next_sibling.string.encode('ascii','ignore').replace('\n', ' '))
					
	fruitDir = 'fruits'
	fruitName = re.search('https:\/\/www\.crfg\.org\/pubs\/ff\/(.*)\.html', weblink).group(1)
	if not os.path.exists(fruitDir):
		os.mkdir(fruitDir)
	with open(fruitDir +'/' + fruitName + '.txt', 'w') as outfile:
		json.dump(data,outfile, indent = 4)



allLinks = allFruitScrape(webName)
for i in allLinks:
	singleLinkWrite(i)