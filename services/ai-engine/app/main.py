from fastapi import FastAPI
from pydantic import BaseModel

class HouseFeatures(BaseModel):
    OverallQual: int
    GrLivArea: float
    GarageCars: int
    TotalBsmtSF: float
    FullBath: int
    YearBuilt: int

app = FastAPI(title="House Price AI Service (Lite)")

@app.get("/")
def health_check():
    return {"status": "running", "message": "Python Service is UP and Running!"}

@app.post("/predict")
def predict_price(features: HouseFeatures):
    # Şimdilik dummy (sahte) veri dönüyoruz ki sistemin uçtan uca çalıştığını görelim
    return {
        "estimated_price": 5500000.0,
        "currency": "TL",
        "note": "Model entegrasyonu bir sonraki adımda yapılacak."
    }
