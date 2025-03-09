using Application.Interfaces;
using Application.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using YoutubeDLSharp;

public static class DependencyInjection
{
    public static IServiceCollection AddTuneGrabberServices(this IServiceCollection services)
    {
        services.AddSingleton<YoutubeDL>(_ => new YoutubeDL());
        services.AddScoped<ISpotifyApi, SpotifyApi>();
        services.AddScoped<ITuneGrabber, TuneGrabber>();

        return services;
    }

    public static async Task HandleYtDlAsync(this IApplicationBuilder app)
    {
        var currentDir = Directory.GetCurrentDirectory();

        var ytDlpDir = Path.Combine(currentDir, YoutubeDLSharp.Utils.YtDlpBinaryName);
        var ffmpegDir = Path.Combine(currentDir, YoutubeDLSharp.Utils.FfmpegBinaryName);
        var outputDir = Path.Combine(currentDir, "download");

        if (!File.Exists(ytDlpDir)) { await YoutubeDLSharp.Utils.DownloadYtDlp(); }
        if (!File.Exists(ffmpegDir)) { await YoutubeDLSharp.Utils.DownloadFFmpeg(); }
        if (!Directory.Exists(outputDir)) { Directory.CreateDirectory(outputDir); }

        using var scope = app.ApplicationServices.GetRequiredService<IServiceScopeFactory>().CreateScope();
        var ytdl = scope.ServiceProvider.GetService<YoutubeDL>();
        if (ytdl != null) { ytdl.OutputFolder = outputDir; }
    }
}