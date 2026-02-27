from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import joblib
import pandas as pd

app = FastAPI()
model, le = joblib.load("model.pkl")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3002"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/predict")
def predict(road: str, hour: int):
    # Check if road is in the trained labels
    if road not in le.classes_:
        raise HTTPException(status_code=400, detail=f"Unknown road: {road}. Valid roads are: {list(le.classes_)}")
    
    print("Received input -> Road:", road, "Hour:", hour)
    
    road_encoded = le.transform([road])[0]
    print("Encoded road:", road_encoded)
    
    # Use DataFrame to match training format
    input_df = pd.DataFrame([[road_encoded, hour]], columns=["road", "hour"])
    prediction = model.predict(input_df)
    
    print("Raw prediction:", prediction)
    
    return {"predicted_congestion": float(prediction[0])}