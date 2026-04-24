import pandas as pd
import random

data = []

days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
weathers = ["Clear", "Rain", "Snow"]

for i in range(5000): # Increased sample size for more features
    hour = random.randint(0, 23)
    road = random.choice(["R1", "R2", "R3"])
    day = random.choice(days)
    weather = random.choice(weathers)
    
    is_weekend = day in ["Saturday", "Sunday"]
    is_peak = (8 <= hour <= 10 or 17 <= hour <= 20)
    
    # Base congestion calculations
    if is_peak and not is_weekend:
        base_congestion = random.uniform(0.6, 1.0)
        if road == "R3":
            base_congestion = min(1.0, base_congestion * 1.1)  # R3 10% worse during peak
    elif is_peak and is_weekend:
        # Weekends have milder peak hours
        base_congestion = random.uniform(0.4, 0.7)
    else:
        base_congestion = random.uniform(0.1, 0.5)
        
    # Apply weather penalties
    if weather == "Rain":
        congestion = min(1.0, base_congestion + 0.15)
    elif weather == "Snow":
        congestion = min(1.0, base_congestion + 0.30)
    else:
        congestion = base_congestion
    
    data.append([road, hour, day, weather, congestion])

df = pd.DataFrame(data, columns=["road", "hour", "day_of_week", "weather", "congestion"])
df.to_csv("traffic.csv", index=False)