import pandas as pd
import os
import random
import numpy as np

RAW_DATA_PATH = "data/processed_turkish_house_sales.csv"
CLEAN_DATA_PATH = "data/istanbul_cleaned.csv"

def split_oda_salon(text):
    text = str(text).lower().replace(" ", "")
    try:
        if "+" in text:
            parts = text.split("+")
            return float(parts[0]), float(parts[1])
        elif "stüdyo" in text or "studio" in text:
            return 1.0, 0.0
        else:
            return float(text), 0.0
    except:
        return 0.0, 0.0

def process_data():
    print(f"🔄 İstanbul verisi okunuyor...")
    
    if not os.path.exists(RAW_DATA_PATH):
        print(f"❌ Hata: Dosya bulunamadı!")
        return

    df = pd.read_csv(RAW_DATA_PATH)
    df.columns = df.columns.str.strip()

    cols_to_drop = ['satici_tip', 'SaticiTipi', 'Tarih', 'IlanTarihi']
    for col in cols_to_drop:
        if col in df.columns:
            df.drop(columns=[col], inplace=True)
    
    if 'Oda_Sayisi' in df.columns:
        split_data = df['Oda_Sayisi'].apply(split_oda_salon).tolist()
        df['OdaSayisi'] = [x[0] for x in split_data]
        df['SalonSayisi'] = [x[1] for x in split_data]
        df.drop(columns=['Oda_Sayisi'], inplace=True)

    rename_map = {'Metrekare': 'NetAlan', 'il': 'Sehir', 'Ilce': 'Ilce', 'Mahalle': 'Mahalle', 'fiyat': 'Fiyat'}
    df.rename(columns=rename_map, inplace=True)

    if 'Ilce' in df.columns and 'Mahalle' in df.columns:
        valid_data = df.dropna(subset=['Mahalle'])
        valid_data = valid_data[valid_data['Mahalle'] != 'Bilinmiyor']
        district_map = valid_data.groupby('Ilce')['Mahalle'].unique().apply(list).to_dict()
        def fill_mahalle(row):
            mh = row['Mahalle']
            if pd.isna(mh) or str(mh).lower() == 'bilinmiyor':
                dist = row['Ilce']
                if dist in district_map and len(district_map[dist]) > 0:
                    return random.choice(district_map[dist])
                return "Diğer"
            return mh
        df['Mahalle'] = df.apply(fill_mahalle, axis=1)

    df['NetAlan'] = df['NetAlan'].replace(0, 1)
    df['BirimFiyat'] = df['Fiyat'] / df['NetAlan']
    df['IlceMedyan'] = df.groupby('Ilce')['BirimFiyat'].transform('median')
    df['FiyatSkoru'] = df['BirimFiyat'] / df['IlceMedyan']
    
    def ata_siki_yas(skor):
        if skor >= 1.35: return random.randint(0, 3)
        elif skor >= 1.15: return random.randint(4, 10)
        elif skor >= 0.95: return random.randint(11, 18)
        elif skor >= 0.80: return random.randint(19, 25)
        else: return random.randint(26, 30)
    df['BinaYasi'] = df['FiyatSkoru'].apply(ata_siki_yas)

    def ata_balkon(row):
        alan = row['NetAlan']
        oda = row['OdaSayisi']
        if alan < 65 or oda < 2: return random.choices([0, 1], weights=[90, 10])[0]
        elif alan < 100: return random.choices([0, 1, 2], weights=[30, 65, 5])[0]
        elif alan < 135: return random.choices([0, 1, 2], weights=[10, 60, 30])[0]
        else: return random.choices([1, 2, 3], weights=[50, 45, 5])[0]
    df['BalkonSayisi'] = df.apply(ata_balkon, axis=1)

    site_ilceleri = ['Başakşehir', 'Beylikdüzü', 'Esenyurt', 'Ataşehir', 'Çekmeköy', 'Sancaktepe', 'Tuzla']
    def ata_site_durumu(row):
        ilce = str(row['Ilce'])
        yas = row['BinaYasi']
        skor = row['FiyatSkoru']
        prob = 10 
        for site_ilce in site_ilceleri:
            if site_ilce in ilce: prob += 40; break
        if yas <= 10: prob += 25
        elif yas <= 20: prob += 10
        if skor > 1.2: prob += 15
        prob = min(max(prob, 5), 95)
        return random.choices([1, 0], weights=[prob, 100-prob])[0]
    df['SiteIcerisinde'] = df.apply(ata_site_durumu, axis=1)

    print("🏠 Oda ve Alana göre Kat Tipi (Dublex/Normal) atanıyor...")
    
    def ata_kat_tipi(row):
        oda = row['OdaSayisi']
        salon = row['SalonSayisi']
        alan = row['NetAlan']
        if oda >= 6 or alan > 280:
            return random.choices(['Tripleks', 'Dubleks'], weights=[70, 30])[0]
        elif (oda >= 4.5) or (alan > 170) or (salon >= 1.5):
            return random.choices(['Dubleks', 'Normal'], weights=[60, 40])[0]
        else:
            return 'Normal'

    df['KatTipi'] = df.apply(ata_kat_tipi, axis=1)

    df.drop(columns=['BirimFiyat', 'IlceMedyan', 'FiyatSkoru'], inplace=True)

    df.to_csv(CLEAN_DATA_PATH, index=False)
    print(f"✅ Başarılı! Kaydedildi: {CLEAN_DATA_PATH}")
    print(f"   Kat Tipi Dağılımı: {df['KatTipi'].value_counts().to_dict()}")

if __name__ == "__main__":
    process_data()
