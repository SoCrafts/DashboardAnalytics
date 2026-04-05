namespace Features.Auth.Register;

public static class RegisterEndpoint
{
    public static void MapEndpoint(WebApplication app)
    {
        app.MapPost("/api/auth/register", Register.Handler)
           .WithTags("Auth");
    }
}
