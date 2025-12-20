using System.Text.Json.Serialization;

namespace Presentation.API.Models;

public class HousePredictionResponse
{
    // Python'dan "estimated_price" olarak geliyor, C#'ta "EstimatedPrice" olsun
    [JsonPropertyName("estimated_price")]
    public double EstimatedPrice { get; set; }

    [JsonPropertyName("currency")]
    public string? Currency { get; set; }

    [JsonPropertyName("model_version")]
    public string? ModelVersion { get; set; }
}
