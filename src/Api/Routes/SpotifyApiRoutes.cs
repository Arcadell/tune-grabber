using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Api.Routes
{
    public static class SpotifyApiRoutes
    {
        public static RouteGroupBuilder MapSpotifyApiRoutes(this RouteGroupBuilder group)
        {
            group.MapGet("/access-token", async ([FromServices] ISpotifyApi spotifyApi) =>
            {
                try
                {
                    var result = await spotifyApi.GetAccessToken();
                    return Results.Ok(result);
                }
                catch (Exception ex)
                {
                    return Results.BadRequest(ex.Message);
                }
            });

            return group;
        }
    }
}
