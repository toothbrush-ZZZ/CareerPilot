from bs4 import BeautifulSoup
import json
import sys

with open("bdjobs_debug.html", "r", encoding="utf-8") as f:
    soup = BeautifulSoup(f, "lxml")
    script = soup.find("script", id="ng-state")
    if script:
        data = json.loads(script.string)
        for key in ["266867406", "617817273", "2888414439"]:
            if key in data:
                val = data[key]
                if "b" in val:
                    print(f"Body of key {key}:")
                    print(json.dumps(val["b"], indent=2)[:1000])
                    print("-" * 20)
    else:
        print("ng-state script not found")
