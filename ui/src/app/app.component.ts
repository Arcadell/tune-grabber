import { Component, effect, inject } from '@angular/core';
import { TuneGrabberService } from './shared/data-access/tuneGrabber/tune-grabber.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SpotifyApiService } from './shared/data-access/spotifyApi/spotify-api.service';
import { Item } from './shared/interfaces/spotifyMetaData';
import { TrackToDownload } from './shared/interfaces/track';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  tuneGrabber = inject(TuneGrabberService)
  spotifyApi = inject(SpotifyApiService)
  formBuilder = inject(FormBuilder);

  tuneSearchForm = this.formBuilder.group({
    url: [null, [Validators.required]],
  });

  spotifySearchForm = this.formBuilder.group({
    searchQuery: ['', [Validators.required]],
  });

  constructor() {
    effect(() =>  {
      if(this.tuneGrabber.tuneMetaData()) {
        this.spotifySearchForm.controls.searchQuery.setValue(this.tuneGrabber.tuneMetaData()!.title) 
      }
    });

    this.spotifySearchForm.controls.searchQuery.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
    ).subscribe(value => {
      if (this.spotifySearchForm.valid && value) { this.spotifyApi.search$.next(value) }
    })
  }

  downloadTrack(item: Item) {
    const trackToDownload: TrackToDownload = {
      url: this.tuneGrabber.tuneMetaData()?.url!,
      album: item.album.name,
      artists: item.artists.map((x) => x.name),
      title: item.name,
      imageUrl: item.album.images[0].url,
      genre: [],
      trackNumber: item.track_number,
      year: Number(item.album.release_date.split('-')[0])
    }

    this.tuneGrabber.download$.next(trackToDownload);
  }

  refresh() {
    window.location.reload();
  }
}
