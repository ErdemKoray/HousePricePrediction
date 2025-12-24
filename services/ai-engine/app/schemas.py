from pydantic import BaseModel
from typing import Dict, Any

class HouseFeatures(BaseModel):
    NetAlan: float
    OdaSayisi: float
    SalonSayisi: float = 0
    BinaYasi: float = 0
    BalkonSayisi: float = 0
    SiteIcerisinde: int = 0
    Asansor: int = 0
    Otopark: int = 0
    KatTipi: str = "Normal"
    Ilce: str = "Merkez"
    Sehir: str = "Istanbul"

class PredictionResponse(BaseModel):
    estimated_price: float
    currency: str
    model_version: str

class ModelInfoResponse(BaseModel):
    active_model: str
    training_date: str
    best_score_r2: float
    all_results: Dict[str, Any]
