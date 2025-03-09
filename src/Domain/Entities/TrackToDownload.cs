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
        public required List<string> Artist { get; set; }
        public required string ImageUrl { get; set; }
    }
}
