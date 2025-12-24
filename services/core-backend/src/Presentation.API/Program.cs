using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddHttpClient("AiClient", client =>
{
    client.Timeout = TimeSpan.FromSeconds(20);
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        b => b.AllowAnyMethod().AllowAnyHeader().AllowAnyOrigin());
});

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI(c => 
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "House Price API V1");
    c.RoutePrefix = string.Empty;
});

app.UseCors("AllowAll");

// app.UseHttpsRedirection();

app.UseAuthorization();
app.MapControllers();

app.MapGet("/health", () => "Backend is UP and Running! 🚀");

app.Run();
