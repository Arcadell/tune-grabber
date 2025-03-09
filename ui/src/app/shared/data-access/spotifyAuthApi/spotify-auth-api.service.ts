import { computed, effect, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { catchError, map, Observable, of, Subject, switchMap } from 'rxjs';
import { SpotifyAuth, SpotifyAuthResponse } from '../../interfaces/spotifyAuthResponse';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../../../environments/environment';

export interface SpotifyAuthResponseState {
  spotifyAuth: SpotifyAuth | null,
  error: string | null,
  status: 'loading' | 'success' | 'error',
}

@Injectable({
  providedIn: 'root'
})
export class SpotifyAuthApiService {

  http = inject(HttpClient)

  private authState: WritableSignal<SpotifyAuthResponseState> = signal({
    spotifyAuth: null,
    error: null,
    status: 'success',
  });

  spotifyAuth = computed(() => this.authState().spotifyAuth);
  error = computed(() => this.authState().error);
  status = computed(() => this.authState().status);

  error$: Subject<Error> = new Subject<Error>()
  getAccessToken$: Subject<void> = new Subject<void>()

  private gotAccessToken$ = this.getAccessToken$.pipe(
    switchMap(() => this.getAccessToken().pipe(
      catchError((err) => {
        this.error$.next(err);
        return of(null)
      })
    )),
  )

  constructor() {
    this.getAccessToken$.pipe(
      takeUntilDestroyed()
    ).subscribe(() => {
      this.authState.update((authState) => ({
        ...authState,
        status: 'loading',
      }))
    });

    this.gotAccessToken$.pipe(
      takeUntilDestroyed()
    ).subscribe((spotifyAuth) => {
      this.authState.update((authState) => ({
        ...authState,
        spotifyAuth,
        status: 'success'
      }))
    });

    this.error$.pipe(
      takeUntilDestroyed()
    ).subscribe((err) => {
      this.authState.update((authState) => ({
        ...authState,
        error: err.message,
        status: 'error'
      }))
    });

    effect(() => {
      window.localStorage.setItem('spotifyAuth', JSON.stringify(this.spotifyAuth()))
    })

    this.getAuthLocalStorage();
    if(this.checkIfAuthExpired()) {
      this.getAccessToken$.next()
    }
  }

  private getAccessToken(): Observable<SpotifyAuth> {
    return this.http.get<SpotifyAuthResponse>(`${environment.production ? '' : environment.apiUrl}/api/spotify/access-token`).pipe(
      map((spotifyAuthResponse) => {
        return { 
          accessToken: spotifyAuthResponse.access_token,
          tokenType: spotifyAuthResponse.token_type,
          expirationTime: Date.now() + spotifyAuthResponse.expires_in * 1000,
         } as SpotifyAuth
      })
    )
  }

  private getAuthLocalStorage() {
    const spotifyAuthString = window.localStorage.getItem('spotifyAuth');
    const spotifyAuth: SpotifyAuth = spotifyAuthString ? JSON.parse(spotifyAuthString) : null;

    if (spotifyAuth) {
      this.authState.update((authState) => ({
        ...authState,
        spotifyAuth: spotifyAuth
      }))
    }
  }

  checkIfAuthExpired() {
    return  this.spotifyAuth() == null || this.spotifyAuth() != null && this.spotifyAuth()!.expirationTime < Date.now();
  }
}
