import pandas as pd
import numpy as np
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

# Veriyi Oku
DATA_PATH = "data/istanbul_cleaned.csv"
MODEL_PATH = "saved_model/istanbul_model.pkl"

if not os.path.exists(DATA_PATH):
    print("❌ Hata: Veri dosyası bulunamadı.")
    exit()

data = pd.read_csv(DATA_PATH)

# --- ÖZELLİK AYRIMI ---
# Yazı olan sütunları (Kategorik) ve Sayı olanları ayıralım
# Mahalle'yi performans için çıkarıyorum (Çok fazla çeşit var, eğitimi yavaşlatır)
categorical_features = ['Sehir', 'Ilce', 'KatTipi'] 
numeric_features = ['NetAlan', 'OdaSayisi', 'SalonSayisi', 'BinaYasi', 'BalkonSayisi', 'SiteIcerisinde']

# Hedef ve Girdiler
X = data[categorical_features + numeric_features]
y = data['Fiyat']

# Eğitim ve Test setine ayır
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print(f"📊 Veri Hazır. Eğitim Boyutu: {X_train.shape}")

# --- PIPELINE KURULUMU (OTOMATİK DÖNÜŞÜM) ---
# 1. Kategorik verileri (Yazı) -> Sayıya (OneHot) çevir
# handle_unknown='ignore': Eğitimde görmediği yeni bir ilçe gelirse hata verme
categorical_transformer = OneHotEncoder(handle_unknown='ignore', sparse_output=False)

# 2. İşleyiciyi hazırla
preprocessor = ColumnTransformer(
    transformers=[
        ('cat', categorical_transformer, categorical_features),
        ('num', 'passthrough', numeric_features) # Sayılara dokunma, olduğu gibi geçsin
    ]
)

# 3. Pipeline: Önce İşle -> Sonra Eğit
model = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('regressor', RandomForestRegressor(n_estimators=100, random_state=42))
])

# --- EĞİTİM ---
print("🚀 Model Eğitimi Başlıyor...")
model.fit(X_train, y_train)

# --- SKORLAMA ---
score = model.score(X_test, y_test)
print(f"\n📈 MODEL BAŞARI SKORU (R2): %{score*100:.2f}")

# --- KAYDET ---
print("💾 Model Kaydediliyor...")
os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
joblib.dump(model, MODEL_PATH)
print(f"✅ İşlem Tamam! Model: {MODEL_PATH}")
