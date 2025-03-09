using Application.Interfaces;
using Domain.Entities;
using YoutubeDLSharp;
using YoutubeDLSharp.Options;

namespace Application.Services
{
    public class TuneGrabber(YoutubeDL ytdl) : ITuneGrabber
    {
        public async Task<VideoMetaData> GetVideoMetaDataAsync(string url)
        {
            var res = await ytdl.RunVideoDataFetch(url);

            if (res == null)
            {
                Console.WriteLine("Res is null");
            }

            if (res.Data == null)
            {
                Console.WriteLine("Res.Data is null");
                foreach (var item in res.ErrorOutput)
                {
                    Console.WriteLine(item);
                }

                throw new Exception("Video meta data is null");
            }

            var videoMetaData = new VideoMetaData();

            videoMetaData.Title = res.Data.Title;
            videoMetaData.Description = res.Data.Description;
            videoMetaData.Url = url;
            videoMetaData.Thumbnail = res.Data.Thumbnail;

            return videoMetaData;
        }

        public async Task GetTheTune(TrackToDownload spotifyMetaData, Progress<DownloadProgress> progress)
        {
            string? tuneToProcessPath = null;
            try
            {
                var res = await ytdl.RunAudioDownload(
                    spotifyMetaData.Url,
                    AudioConversionFormat.Mp3,
                    progress: progress
                );

                tuneToProcessPath = res.Data;

                var file = TagLib.File.Create(tuneToProcessPath);
                await SetAlbumArt(spotifyMetaData.ImageUrl, file);
                file.Tag.Title = spotifyMetaData.Title;
                file.Tag.Album = spotifyMetaData.Album;
                file.Tag.Performers = spotifyMetaData.Artists;
                file.Tag.Track = (uint)spotifyMetaData.TrackNumber;
                file.Tag.Year = (uint)spotifyMetaData.Year;
                file.Tag.Genres = spotifyMetaData.Genre;

                file.Save();

                var directory = Path.GetDirectoryName(tuneToProcessPath);
                var newFileName = $"{spotifyMetaData.Title} - {spotifyMetaData.Album}.mp3";
                var newFilePath = Path.Combine(directory, newFileName);

                if (File.Exists(newFilePath)) { File.Delete(newFilePath); }
                File.Move(tuneToProcessPath, newFilePath);
            }
            catch (Exception ex)
            {
                if(!string.IsNullOrEmpty(tuneToProcessPath))
                    File.Delete(tuneToProcessPath);

                throw new Exception(ex.Message);
            }
        }

        private async Task SetAlbumArt(string url, TagLib.File file)
        {
            byte[] imageBytes;
            using (HttpClient client = new HttpClient())
            {
                imageBytes = await client.GetByteArrayAsync(url);
            }

            TagLib.Id3v2.AttachmentFrame cover = new TagLib.Id3v2.AttachmentFrame
            {
                Type = TagLib.PictureType.FrontCover,
                Description = "Cover",
                MimeType = System.Net.Mime.MediaTypeNames.Image.Jpeg,
                Data = imageBytes,
                TextEncoding = TagLib.StringType.UTF16


            };
            file.Tag.Pictures = new TagLib.IPicture[] { cover };
        }
    }
}
