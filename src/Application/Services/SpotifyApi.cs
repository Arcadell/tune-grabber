using Application.Interfaces;
using Domain.Entities;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System.Text;

namespace Application.Services
{
    public class SpotifyApi(IConfiguration configuration) : ISpotifyApi
    {
        public async Task<SpotifyAuthResponse> GetAccessToken()
        {
            var clientId = configuration.GetSection("SPOTIFY_CLIENT_ID");
            var secret = configuration.GetSection("SPOTIFY_SECRET");

            if(string.IsNullOrEmpty(clientId.Value) || string.IsNullOrEmpty(secret.Value)) throw new Exception("SPOTIFY_CLIENT_ID or SPOTIFY_SECRET is null");

            using (HttpClient http = new HttpClient())
            {
                // Create the authorization header
                var authHeader = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{clientId.Value}:{secret.Value}"));
                http.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", authHeader);

                // Prepare the form data
                var formData = new Dictionary<string, string>
            {
                { "grant_type", "client_credentials" }
            };

                // Make the POST request
                var response = await http.PostAsync("https://accounts.spotify.com/api/token", new FormUrlEncodedContent(formData));

                if (response.IsSuccessStatusCode)
                {
                    var responseBody = await response.Content.ReadAsStringAsync();
                    var tokenResponse = JsonConvert.DeserializeObject<SpotifyAuthResponse>(responseBody);

                    if(tokenResponse == null) throw new Exception("Failed to retrieve access token: RESPONSE NULL");
                    return tokenResponse;
                }
                else
                {
                    throw new Exception("Failed to retrieve access token: " + response.StatusCode);
                }
            }
        }
    }
}
