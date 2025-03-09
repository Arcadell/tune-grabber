using Domain.Entities;
using YoutubeDLSharp;

namespace Application.Interfaces
{
    public interface ITuneGrabber
    {
        Task<VideoMetaData> GetVideoMetaDataAsync(string url);
        Task GetTheTune(TrackToDownload spotifyMetaData, Progress<DownloadProgress> progress);
    }
}
