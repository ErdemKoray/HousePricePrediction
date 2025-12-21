# Python imajını çek
FROM python:3.9-slim

# Çalışma dizinini ayarla (Container içinde '/project' dedik ki karışıklık olmasın)
WORKDIR /project

# Önce gereksinimleri kopyala ve kur (Cache avantajı için)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Şimdi TÜM klasörleri (app, data, ml, saved_model) kopyala
COPY . .

# KRİTİK NOKTA:
# Senin main.py dosyan "app" klasörünün içinde olduğu için
# uvicorn'a "app.main:app" dememiz gerekiyor.
# --host 0.0.0.0 ile dışarıya açıyoruz.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5000"]