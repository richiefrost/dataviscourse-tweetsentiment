from __future__ import division
import requests
import json

# Returns an object with {county: {name: '', FIPS: 99999}, state: {name: '', code: '', FIPS: 12}}
# If the location isn't in the US, the result returned is None for each of the attributes
def get_state_and_county(latitude, longitude):
	url = 'http://geo.fcc.gov/api/census/block/find?format=json&latitude=%s&longitude=%s&showall=false' % (latitude, longitude)
	#print('URL: %s' % url)
	response = requests.get(url)
	if response.status_code != 200:
		print "Error getting response, response code %d" % response.status_code
		print response.text

	data = response.json()
	result = data
	if 'messages' in result:
		del result['messages']
	if 'Block' in result:
		del result['Block']
	if 'status' in result:
		del result['status']
	if 'executionTime' in result:
		del result['executionTime']
	return result

with open('storm-tweets-with-sentiment.old.json') as f:
	tweets = json.loads(f.read())

count, total = 0, len(tweets)
projection = ['text', 'county', 'state', 'geolocation', 'sentiment_score', 'date']
with open('storm-tweets-with-sentiment.json', 'a') as f:
	f.write('[')
	for tweet in tweets:
		lng, lat = tweet['geolocation']['coordinates']
		try:
			state_and_county = get_state_and_county(lat, lng)
			if state_and_county is not None:
				tweet['county'] = state_and_county['County']
				tweet['state'] = state_and_county['State']

			tweet_to_write = {key: tweet[key] for key in projection}
			f.write('%s,\n' % json.dumps(tweet_to_write))
			count += 1
			if count % 50 == 0:
				print('%0.1f%% done' % (count / total * 100))
		except:
			print('Problem loading json')
	f.write(']')