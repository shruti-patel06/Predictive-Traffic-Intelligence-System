import pandas as pd
import random

data = []

for i in range(2000):
    hour = random.randint(0, 23)
    road = random.choice(["R1", "R2", "R3"])
    
    is_peak = 8 <= hour <= 10 or 17 <= hour <= 20
    
    if is_peak:
        base_congestion = random.uniform(0.6, 1.0)
        if road == "R3":
            congestion = min(1.0, base_congestion * 1.1)  # R3 10% worse during peak
        else:
            congestion = base_congestion
    else:
        congestion = random.uniform(0.1, 0.5)
    
    data.append([road, hour, congestion])

df = pd.DataFrame(data, columns=["road", "hour", "congestion"])
df.to_csv("traffic.csv", index=False)