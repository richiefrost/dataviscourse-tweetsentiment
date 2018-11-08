import requests
import json

USERNAME="CHANGEME"
PASSWORD="CHANGEME"
BASE_URL="http://localhost:8000"

bounding_box = { "southWest": {
    "lat": 10.323350,
    "lng": -160.006705
  },
  "northEast": {
    "lat": 76.477765035787,
    "lng": -67.6688173
  }
}

query = { "bounding_box": bounding_box, "start_time": 152486121, "end_time": 1541708921 }
result = []
seen = set()

session = requests.sessions.Session()
session.post(f"{BASE_URL}/login/", json={"username": USERNAME, "password": PASSWORD})
for _ in range(1):
    tweets = session.post(f"{BASE_URL}/tweets/", json=query).json()
    for tweet in tweets:
        tid = tweet["_id"]
        if tid not in seen:
            result.append(tweet)
            seen.add(tid)

with open('./data/raw_tweets.json', 'w') as f:
    json.dump(result, f)
