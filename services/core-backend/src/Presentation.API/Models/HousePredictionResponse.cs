using System.Text.Json.Serialization;

namespace Presentation.API.Models;

public class HousePredictionResponse
{
    [JsonPropertyName("estimated_price")]
    public double EstimatedPrice { get; set; }

    [JsonPropertyName("currency")]
    public string Currency { get; set; }

    [JsonPropertyName("model_version")]
    public string ModelVersion { get; set; }  
}