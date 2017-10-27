import urllib2
import re
from bs4 import BeautifulSoup

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
def accessOneLink(weblink):
	page = urllib2.urlopen(weblink)
	soup = BeautifulSoup(page, 'html.parser')

#change this shit soon
allLinks = allFruitScrape(webName)[0:2]
