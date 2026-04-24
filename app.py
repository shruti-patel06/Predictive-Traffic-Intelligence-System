import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import joblib
import pandas as pd

app = FastAPI()
model, encoders = joblib.load("model.pkl")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for deployment
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/predict")
def predict(road: str, hour: int, day: str = "Monday", weather: str = "Clear"):
    # Check inputs
    if road not in encoders["road"].classes_:
        raise HTTPException(status_code=400, detail=f"Unknown road: {road}")
    if day not in encoders["day_of_week"].classes_:
        raise HTTPException(status_code=400, detail=f"Unknown day: {day}")
    if weather not in encoders["weather"].classes_:
        raise HTTPException(status_code=400, detail=f"Unknown weather: {weather}")
    
    print(f"Received input -> Road: {road}, Hour: {hour}, Day: {day}, Weather: {weather}")
    road_encoded = encoders["road"].transform([road])[0]
    day_encoded = encoders["day_of_week"].transform([day])[0]
    weather_encoded = encoders["weather"].transform([weather])[0]
    
    # Use DataFrame to match training format
    input_df = pd.DataFrame([[road_encoded, hour, day_encoded, weather_encoded]], columns=["road", "hour", "day_of_week", "weather"])
    prediction = model.predict(input_df)
    
    print("Raw prediction:", prediction)
    
    return {"predicted_congestion": float(prediction[0])}

# Serve React frontend in deployment
build_dir = os.path.join(os.path.dirname(__file__), "tailwind-project", "traffic-ui", "build")
if os.path.exists(build_dir):
    app.mount("/", StaticFiles(directory=build_dir, html=True), name="static")