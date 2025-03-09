using Application.Interfaces;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using YoutubeDLSharp;

namespace Api.Routes
{
    public static class TuneGrabberRoutes
    {
        public static RouteGroupBuilder MapTuneGrabberRoutes(this RouteGroupBuilder group)
        {
            group.MapGet("/video-meta-data", async ([FromQuery] string url, [FromServices] ITuneGrabber tuneGrabber) =>
            {
                try
                {
                    var result = await tuneGrabber.GetVideoMetaDataAsync(url);
                    return Results.Ok(result);
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.StackTrace);
                    return Results.BadRequest(ex.Message);
                }
            });

            group.MapPost("/download-audio", async ([FromBody] TrackToDownload trackToDownload, [FromServices] ITuneGrabber tuneGrabber, HttpResponse response, CancellationToken ct) =>
            {
                try
                {
                    //response.ContentType = "text/event-stream";

                    var progress = new Progress<DownloadProgress>(p =>
                    {
                        //var message = $"data: {p.Progress}\n\n";
                        //Console.WriteLine(message);
                        //await response.WriteAsync(message, ct);
                        //await response.Body.FlushAsync(ct);
                    });


                    await tuneGrabber.GetTheTune(trackToDownload, progress);

                    return Results.Ok();
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.StackTrace);
                    return Results.BadRequest(ex.Message);
                }
            });

            return group;
        }
    }
}
