using Microsoft.AspNetCore.Mvc;
using Presentation.API.Models;

namespace Presentation.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HousePriceController : ControllerBase
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public HousePriceController(IHttpClientFactory httpClientFactory, IConfiguration configuration)
    {
        _httpClient = httpClientFactory.CreateClient("AiClient");
        _configuration = configuration;
    }

    [HttpPost("predict")]
    public async Task<IActionResult> Predict([FromBody] HouseFeaturesDto features)
    {
        try
        {
            // 1. Python servis URL'ini al
            var aiServiceUrl = _configuration["AiServiceUrl"];
            if (string.IsNullOrEmpty(aiServiceUrl))
                return StatusCode(500, "AI Servis URL yapılandırması eksik.");

            // 2. Python servisine POST isteği at
            // PostAsJsonAsync metodu DTO'yu otomatik JSON'a çevirir
            var response = await _httpClient.PostAsJsonAsync($"{aiServiceUrl}/predict", features);

            // 3. Hata kontrolü
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                return StatusCode((int)response.StatusCode, $"AI Servisi Hatası: {errorContent}");
            }

            // 4. Sonucu oku ve dön
            var result = await response.Content.ReadFromJsonAsync<HousePredictionResponse>();
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Backend Hatası: {ex.Message}");
        }
    }
}