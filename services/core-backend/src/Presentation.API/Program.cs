using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);

// --- 1. SERVİSLERİ EKLE (Alet Çantası) ---

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// İŞTE EKSİK OLAN PARÇA BU: HttpClient Servisini Kaydet
// "AiClient" ismini Controller'da kullanıyoruz, o yüzden burada tanımlamalıyız.
builder.Services.AddHttpClient("AiClient", client =>
{
    // Python servisine bağlanırken zaman aşımı (20 saniye yapalım, ML bazen yavaş olabilir)
    client.Timeout = TimeSpan.FromSeconds(20);
});

// CORS (Frontend rahat erişsin)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        b => b.AllowAnyMethod().AllowAnyHeader().AllowAnyOrigin());
});

var app = builder.Build();

// --- 2. MIDDLEWARE (İşleyiş Hattı) ---

// Swagger'ı Her Ortamda (Production/Development) Açıyoruz
app.UseSwagger();
app.UseSwaggerUI(c => 
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "House Price API V1");
    c.RoutePrefix = string.Empty; // Ana sayfada açılsın
});

app.UseCors("AllowAll");

// HttpsRedirection'ı Docker içinde SSL sertifikasıyla uğraşmamak için kapalı tutuyoruz
// app.UseHttpsRedirection();

app.UseAuthorization();
app.MapControllers();

// Sağlık Kontrolü
app.MapGet("/health", () => "Backend is UP and Running! 🚀");

app.Run();
