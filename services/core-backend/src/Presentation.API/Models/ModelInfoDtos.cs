using System.Text.Json.Serialization;

namespace Presentation.API.Models;

public class ModelInfoDto
{
    [JsonPropertyName("active_model")]
    public string? ActiveModel { get; set; }

    [JsonPropertyName("training_date")]
    public string? TrainingDate { get; set; }

    [JsonPropertyName("best_score_r2")]
    public double BestScoreR2 { get; set; }

    [JsonPropertyName("all_results")]
    public Dictionary<string, ModelScoreDetailDto>? AllResults { get; set; }
}

public class ModelScoreDetailDto
{
    [JsonPropertyName("r2_score")]
    public double R2Score { get; set; }

    [JsonPropertyName("mae")]
    public double Mae { get; set; }
}
