import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import joblib

df = pd.read_csv("traffic.csv")

# convert labels into numbers
encoders = {}
for col in ["road", "day_of_week", "weather"]:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col])
    encoders[col] = le

X = df[["road", "hour", "day_of_week", "weather"]]
y = df["congestion"]

model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X, y)

joblib.dump((model, encoders), "model.pkl")