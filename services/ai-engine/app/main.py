from fastapi import FastAPI, HTTPException
import joblib
import pandas as pd
import json
import os

# Görseldeki yapıya göre schemas.py main.py'ın yanında.
# Bu yüzden nokta (.) ile import ediyoruz.
from .schemas import HouseFeatures, PredictionResponse ,ModelInfoResponse

app = FastAPI(title="House Price Prediction API")

# Dosya yolları (Container'da /project dizinindeyiz, klasörler yanımızda)
# Bir üst dizine çıkmaya gerek yok, çünkü komutu /project'ten çalıştırıyoruz.
# Dosya Yolları
MODEL_PATH = "saved_model/istanbul_model.pkl"
METADATA_PATH = "saved_model/metadata.json"

# Modeli Başlangıçta Yükle
model = None
try:
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
        print("✅ Model yüklendi.")
    else:
        print("⚠️ Uyarı: Model dosyası bulunamadı, lütfen eğitimi başlatın.")
except Exception as e:
    print(f"❌ Model yüklenirken hata: {e}")

@app.get("/")
def read_root():
    return {"message": "House Price Prediction AI Engine is Running! 🚀"}

@app.post("/predict", response_model=PredictionResponse)
def predict_price(features: HouseFeatures):
    if not model:
        raise HTTPException(status_code=500, detail="Model yüklenemedi.")
    
    # Gelen veriyi DataFrame'e çevir
    input_data = pd.DataFrame([features.dict()])
    
    # Model beklediği sütunları seçer (fazlalıkları atar)
    try:
        prediction = model.predict(input_data)
        price = float(prediction[0])
        
        return {
            "estimated_price": round(price, 2),
            "currency": "TL/Euro",
            "model_version": "v2.0-champion"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Tahmin hatası: {str(e)}")

# --- YENİ ENDPOINT: Model Detayları ---
@app.get("/model-info", response_model=ModelInfoResponse)
def get_model_info():
    if not os.path.exists(METADATA_PATH):
        raise HTTPException(status_code=404, detail="Model eğitim verisi (metadata) bulunamadı.")
    
    try:
        with open(METADATA_PATH, "r") as f:
            data = json.load(f)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Veri okunurken hata: {str(e)}")
