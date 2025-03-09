import { computed, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { catchError, EMPTY, first, Observable, Subject, switchMap } from 'rxjs';
import { Item, SpotifyMetaData } from '../../interfaces/spotifyMetaData';
import { HttpClient } from '@angular/common/http';
import { SpotifyAuthApiService } from '../spotifyAuthApi/spotify-auth-api.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface SpotifyMetaDataState {
  spotifyMetaData: SpotifyMetaData | null,
  selectedItem: Item | null,
  error: string | null,
  status: 'loading' | 'success' | 'error'
}

@Injectable({
  providedIn: 'root'
})
export class SpotifyApiService {

  private http = inject(HttpClient)
  private authSpotify = inject(SpotifyAuthApiService)

  private spotifyState: WritableSignal<SpotifyMetaDataState> = signal({
    spotifyMetaData: null,
    selectedItem: null,
    error: null,
    status: 'success',
  });

  spotifyMetaData = computed(() => this.spotifyState().spotifyMetaData);
  selectedItem = computed(() => this.spotifyState().selectedItem);
  error = computed(() => this.spotifyState().error);
  status = computed(() => this.spotifyState().status);

  error$: Subject<Error> = new Subject<Error>();
  search$: Subject<string> = new Subject<string>();
  
  searched$ = this.search$.pipe(
    switchMap((searchQuery) => {
      if(this.authSpotify.checkIfAuthExpired()) {
        return this.authSpotify.getAccessToken$.pipe(
          first(),
          switchMap(() => this.searchTrack(searchQuery))
        )
      }

      return this.searchTrack(searchQuery)
    })
  )

  constructor() {
    this.search$.pipe(
      takeUntilDestroyed()
    ).subscribe(() => {
      this.spotifyState.update((spotifyState) => ({
        ...spotifyState,
        status: 'loading'
      }))
    });

    this.searched$.pipe(
      takeUntilDestroyed()
    ).subscribe((spotifyMetaData) => {
      this.spotifyState.update((spotifyState) => ({
        ...spotifyState,
        spotifyMetaData,
        status: 'success'
      }))
    });

    this.error$.pipe(
      takeUntilDestroyed()
    ).subscribe((err) => {
      this.spotifyState.update((spotifyState) => ({
        ...spotifyState,
        error: err.message,
        status: 'error'
      }))
    });
  }

  private searchTrack(searchQuery: string): Observable<SpotifyMetaData> {
    return this.http.get<SpotifyMetaData>('https://api.spotify.com/v1/search', {
      params: {
        q: searchQuery,
        type: 'track'
      },
      headers: {
        Authorization: `Bearer ${this.authSpotify.spotifyAuth()?.accessToken}`
      }
    }).pipe(
      catchError((err) => {
        this.error$.next(err);
        return EMPTY;
      })
    )
  }
}
