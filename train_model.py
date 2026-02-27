import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import joblib

df = pd.read_csv("traffic.csv")

# convert road labels into numbers
le = LabelEncoder()
df["road"] = le.fit_transform(df["road"])

X = df[["road", "hour"]]
y = df["congestion"]

model = RandomForestRegressor()
model.fit(X, y)

joblib.dump((model, le), "model.pkl")