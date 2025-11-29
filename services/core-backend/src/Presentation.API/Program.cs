var builder = WebApplication.CreateBuilder(args);

// Servisleri ekle
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// ORTAM NE OLURSA OLSUN SWAGGER'I AÇ (Garanti Yöntem)
app.UseSwagger();
app.UseSwaggerUI(c => 
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "House Price API V1");
    c.RoutePrefix = string.Empty; // Ana sayfayı (localhost:5001) direkt Swagger yapar
});

// app.UseHttpsRedirection(); // Docker içinde SSL sorunu olmasın diye kapattık
app.UseAuthorization();
app.MapControllers();

// Basit bir Health Check endpoint'i
app.MapGet("/health", () => "Backend is UP and Running! 🚀");

app.Run();
