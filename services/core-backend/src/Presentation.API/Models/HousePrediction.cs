using System.Text.Json.Serialization;

namespace Presentation.API.Models;

public class HouseFeaturesDto
{
    [JsonPropertyName("NetAlan")]
    public double NetAlan { get; set; }

    [JsonPropertyName("OdaSayisi")]
    public double OdaSayisi { get; set; }

    [JsonPropertyName("SalonSayisi")]
    public double SalonSayisi { get; set; }

    [JsonPropertyName("BinaYasi")]
    public double BinaYasi { get; set; }

    [JsonPropertyName("BalkonSayisi")]
    public double BalkonSayisi { get; set; }

    [JsonPropertyName("SiteIcerisinde")]
    public int SiteIcerisinde { get; set; }

    [JsonPropertyName("KatTipi")]
    public string KatTipi { get; set; } = string.Empty;

    [JsonPropertyName("Ilce")]
    public string Ilce { get; set; } = string.Empty;

    [JsonPropertyName("Sehir")]
    public string Sehir { get; set; } = "Istanbul";
}