from pydantic import BaseModel
from typing import Dict, Any

# Tahmin İsteği
class HouseFeatures(BaseModel):
    # Zorunlu değil, gelmezse hata vermez (Optional yapıyoruz ki esnek olsun)
    NetAlan: float
    OdaSayisi: float
    # Aşağıdakiler veri setine göre değişebilir, varsayılan değer veriyoruz
    SalonSayisi: float = 0
    BinaYasi: float = 0
    BalkonSayisi: float = 0
    SiteIcerisinde: int = 0
    Asansor: int = 0
    Otopark: int = 0
    
    KatTipi: str = "Normal"
    Ilce: str = "Merkez"
    Sehir: str = "Istanbul"

# Tahmin Cevabı
class PredictionResponse(BaseModel):
    estimated_price: float
    currency: str
    model_version: str

# --- YENİ EKLENEN: Model Bilgisi Cevabı ---
class ModelInfoResponse(BaseModel):
    active_model: str
    training_date: str
    best_score_r2: float
    all_results: Dict[str, Any] # Detaylı sonuçlar
