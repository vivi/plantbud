import slate
import re
from collections import OrderedDict
#slate package
#Function for reading PDF file
def readPDFFile(fileName):
	with open(fileName) as f:
		doc = slate.PDF(f)
	pageDict = OrderedDict()
	subOut = r"\\xe2\\x80\\x9[0-9]?"
	for i in range(0,len(doc)):
		splitList = re.split(r'\s+', "".join(doc[i]))
		completeString = re.sub(subOut,""," ".join(splitList))
		pageDict['Page ' + str(i + 1)] = completeString
	return pageDict
print(readPDFFile('gaia.pdf'))