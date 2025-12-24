using Microsoft.AspNetCore.Mvc;
using Presentation.API.Models;
using System.Text.Json;

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
            var aiServiceUrl = _configuration["AiServiceUrl"];
            Console.WriteLine($"Tahmin isteği: {aiServiceUrl}/predict");

            var response = await _httpClient.PostAsJsonAsync($"{aiServiceUrl}/predict", features);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                return StatusCode((int)response.StatusCode, $"AI Hatası: {errorContent}");
            }

            var rawJson = await response.Content.ReadAsStringAsync();
            
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            
            var result = JsonSerializer.Deserialize<HousePredictionResponse>(rawJson, options);
            
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Backend Hatası: {ex.Message}");
        }
    }

    [HttpGet("model-info")]
    public async Task<IActionResult> GetModelInfo()
    {
        try
        {
            var aiServiceUrl = _configuration["AiServiceUrl"];
            
            var response = await _httpClient.GetAsync($"{aiServiceUrl}/model-info");

            if (!response.IsSuccessStatusCode)
            {
                return StatusCode((int)response.StatusCode, "AI servisinden model bilgisi alınamadı.");
            }

            var rawJson = await response.Content.ReadAsStringAsync();
            
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var result = JsonSerializer.Deserialize<ModelInfoDto>(rawJson, options);

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Model bilgisi hatası: {ex.Message}");
        }
    }
}
