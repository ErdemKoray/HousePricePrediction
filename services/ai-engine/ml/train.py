import pandas as pd
import numpy as np
import joblib
import json
import os
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import r2_score, mean_absolute_error
from sklearn.linear_model import Ridge
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor
from lightgbm import LGBMRegressor
from catboost import CatBoostRegressor

DATA_PATH = "data/istanbul_cleaned.csv"
MODEL_PATH = "saved_model/istanbul_model.pkl"
METADATA_PATH = "saved_model/metadata.json"

def train_best_model():
    if not os.path.exists(DATA_PATH):
        print(f"Hata: {DATA_PATH} bulunamadi.")
        return

    data = pd.read_csv(DATA_PATH)

    all_numeric = ['NetAlan', 'OdaSayisi', 'SalonSayisi', 'BinaYasi', 'BalkonSayisi', 'SiteIcerisinde', 'Asansor', 'Otopark']
    all_categorical = ['Sehir', 'Ilce', 'KatTipi']
    
    numeric_features = [col for col in all_numeric if col in data.columns]
    categorical_features = [col for col in all_categorical if col in data.columns]
    target = 'Fiyat'

    X = data[numeric_features + categorical_features]
    y = data[target]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    categorical_transformer = OneHotEncoder(handle_unknown='ignore', sparse_output=False)
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', categorical_transformer, categorical_features),
            ('num', 'passthrough', numeric_features)
        ]
    )

    models = {
        "Random Forest": RandomForestRegressor(n_estimators=100, random_state=42),
        "XGBoost": XGBRegressor(n_estimators=100, learning_rate=0.1, random_state=42),
        "LightGBM": LGBMRegressor(n_estimators=100, learning_rate=0.1, random_state=42, verbose=-1),
        "CatBoost": CatBoostRegressor(iterations=100, learning_rate=0.1, depth=6, random_seed=42, verbose=0, allow_writing_files=False),
        "Linear Ridge": Ridge(alpha=1.0)
    }

    best_score = -np.inf
    best_model_pipeline = None
    best_model_name = ""
    results = {}

    print("-" * 50)
    
    for name, model in models.items():
        pipeline = Pipeline(steps=[
            ('preprocessor', preprocessor),
            ('regressor', model)
        ])
        
        pipeline.fit(X_train, y_train)
        predictions = pipeline.predict(X_test)
        
        score = r2_score(y_test, predictions)
        mae = mean_absolute_error(y_test, predictions)
        
        results[name] = {
            "r2_score": round(float(score), 4),
            "mae": round(float(mae), 0)
        }
        
        print(f"{name:<15}: R2= %{score*100:.2f}")

        if score > best_score:
            best_score = score
            best_model_pipeline = pipeline
            best_model_name = name

    print("-" * 50)

    metadata = {
        "active_model": best_model_name,
        "training_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "best_score_r2": round(float(best_score), 4),
        "all_results": results
    }

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    
    joblib.dump(best_model_pipeline, MODEL_PATH)
    
    with open(METADATA_PATH, "w") as f:
        json.dump(metadata, f, indent=4)
        
    print(f"KAZANAN: {best_model_name}")

if __name__ == "__main__":
    train_best_model()