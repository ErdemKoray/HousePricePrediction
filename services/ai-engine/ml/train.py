import pandas as pd
import tensorflow_decision_forests as tfdf
import tensorflow as tf
import os
import numpy as np

# Yollar (DÜZELTİLDİ)
DATA_PATH = "data/cleaned_train.csv"
MODEL_DIR = "saved_model/my_random_forest"

def train_model():
    print(f"🔄 Temiz veri yükleniyor: {DATA_PATH}")
    
    if not os.path.exists(DATA_PATH):
        print("❌ Hata: Temiz veri bulunamadı.")
        return

    dataset_df = pd.read_csv(DATA_PATH)
    
    cat_cols = ['KitchenQual', 'CentralAir', 'HeatingQC', 'Neighborhood', 'BldgType', 'HouseStyle']
    for col in cat_cols:
        if col in dataset_df.columns:
            dataset_df[col] = dataset_df[col].astype(str)

    print("🛠️ Eğitim seti hazırlanıyor...")
    
    def split_dataset(dataset, test_ratio=0.30):
        test_indices = np.random.rand(len(dataset)) < test_ratio
        return dataset[~test_indices], dataset[test_indices]

    train_ds_pd, valid_ds_pd = split_dataset(dataset_df)
    label = 'SalePrice'
    train_ds = tfdf.keras.pd_dataframe_to_tf_dataset(train_ds_pd, label=label, task=tfdf.keras.Task.REGRESSION)
    valid_ds = tfdf.keras.pd_dataframe_to_tf_dataset(valid_ds_pd, label=label, task=tfdf.keras.Task.REGRESSION)

    print("🚀 Model Eğitimi Başlıyor...")
    model = tfdf.keras.RandomForestModel(task=tfdf.keras.Task.REGRESSION)
    model.compile(metrics=["mse"])
    model.fit(train_ds)

    print("💾 Model Kaydediliyor...")
    model.save(MODEL_DIR)
    print(f"✅ Başarılı! Model kaydedildi: {MODEL_DIR}")

if __name__ == "__main__":
    train_model()
