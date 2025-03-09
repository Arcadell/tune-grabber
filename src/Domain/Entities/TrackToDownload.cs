using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class TrackToDownload
    {
        public required string Url { get; set; }
        public required string Title { get; set; }
        public required string Album { get; set; }
        public required string[] Artists { get; set; }
        public required string ImageUrl { get; set; }
        public required int TrackNumber { get; set; }
        public required int Year { get; set; }
        public required string[] Genre { get; set; }

    }
}
