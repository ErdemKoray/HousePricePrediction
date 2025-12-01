from pydantic import BaseModel

class HouseFeatures(BaseModel):
    # Sayısal Değerler
    NetAlan: float
    OdaSayisi: float
    SalonSayisi: float
    BinaYasi: float
    BalkonSayisi: float
    SiteIcerisinde: int

    # Kategorik (Yazı) Değerler
    KatTipi: str       
    Ilce: str          
    Sehir: str         # Artık varsayılan yok, ZORUNLU alan.
