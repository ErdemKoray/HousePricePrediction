import joblib
import pandas as pd
import os
from fastapi import FastAPI, HTTPException
from app.schemas import HouseFeatures

app = FastAPI(title="Istanbul House Price Prediction API")

# Model Yolu
MODEL_PATH = "saved_model/istanbul_model.pkl"
model_pipeline = None

@app.on_event("startup")
def load_model():
    global model_pipeline
    try:
        if os.path.exists(MODEL_PATH):
            model_pipeline = joblib.load(MODEL_PATH)
            print(f"✅ Model başarıyla yüklendi: {MODEL_PATH}")
        else:
            print(f"⚠️ Hata: Model dosyası bulunamadı! Lütfen eğitimi çalıştırın.")
    except Exception as e:
        print(f"❌ Model yüklenirken kritik hata: {e}")

@app.get("/")
def health_check():
    return {
        "status": "running", 
        "model_loaded": model_pipeline is not None,
        "score": "R2 ~0.80"
    }

@app.post("/predict")
def predict_price(features: HouseFeatures):
    if not model_pipeline:
        raise HTTPException(status_code=500, detail="Model yüklü değil.")
    
    try:
        # 1. Gelen veriyi (Pydantic) -> Sözlüğe çevir
        data_dict = features.dict()
        
        # 2. Sözlüğü -> DataFrame'e çevir (Tek satırlık)
        # Scikit-Learn Pipeline sütun isimlerini görmek ister
        df_input = pd.DataFrame([data_dict])
        
        # 3. Tahmin Yap
        prediction = model_pipeline.predict(df_input)
        
        # 4. Sonucu Döndür
        estimated_price = float(prediction[0])
        
        return {
            "estimated_price": estimated_price,
            "currency": "TL",
            "model_version": "v1-random-forest"
        }

    except Exception as e:
        return {"error": str(e)}
