namespace DashboardAnalyticsAPI.Infrastructure.Auth;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Key    { get; init; } = null!;
    public string Issuer { get; init; } = "DashboardAnalyticsAPI";
}
