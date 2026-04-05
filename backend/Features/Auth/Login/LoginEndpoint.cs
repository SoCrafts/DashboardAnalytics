namespace Features.Auth.Login;

public static class LoginEndpoint
{
    public static void MapEndpoint(WebApplication app)
    {
        app.MapPost("/api/auth/login", Login.Handler)
           .WithTags("Auth");
    }
}
