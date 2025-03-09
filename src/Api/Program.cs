using Api.Routes;

namespace Api
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddCors();
            builder.Services.AddAuthorization();
            builder.Services.AddSwaggerGen();
            builder.Services.AddTuneGrabberServices();

            var app = builder.Build();

            app.UseCors(_ => _.SetIsOriginAllowed(origin => new Uri(origin).Host == "localhost").AllowAnyHeader().AllowAnyMethod());
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
                // In development we don't care about CORS
            }
            else
            {
                // TODO set trusted origins in configuration 
                // app.UseCors(_=> _.WithOrigins())
                app.UseHttpsRedirection();
            }

            // Configure the HTTP request pipeline
            app.UseHttpsRedirection();
            app.UseAuthorization();

            app.MapGroup("/api/tune")
                .MapTuneGrabberRoutes()
                .WithTags("TubeGrabber");

            app.MapGroup("/api/spotify")
                .MapSpotifyApiRoutes()
                .WithTags("Spotify");

            await app.HandleYtDlAsync();
            app.Run();
        }
    }
}
