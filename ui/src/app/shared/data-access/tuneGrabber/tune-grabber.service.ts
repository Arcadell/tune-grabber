import { computed, inject, Injectable, NgZone, signal, WritableSignal } from '@angular/core';
import { TuneMetaData } from '../../interfaces/tuneMetaData';
import { catchError, EMPTY, Observable, of, Subject, switchMap, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TrackToDownload } from '../../interfaces/track';
import { environment } from '../../../../environments/environment';

export interface TuneMetaDataState {
  tuneMetaData: TuneMetaData | null,
  status: 'downloading' | 'downloaded' | 'loading' | 'success' | 'error',
  error: string | null,
  ok: boolean,
}

@Injectable({
  providedIn: 'root'
})
export class TuneGrabberService {

  http = inject(HttpClient)
  
  private state: WritableSignal<TuneMetaDataState> = signal({
    tuneMetaData: null,
    error: null,
    status: 'success',
    ok: false,
  })

  tuneMetaData = computed(() => this.state().tuneMetaData);
  error = computed(() => this.state().error);
  status = computed(() => this.state().status);
  ok = computed(() => this.state().ok);

  ok$: Subject<boolean> = new Subject();
  error$: Subject<any> = new Subject();
  search$: Subject<string> = new Subject();
  download$: Subject<TrackToDownload> = new Subject();

  private searched$ = this.search$.pipe(
    switchMap((url) => this.getTuneMetaData(url).pipe(
      catchError((err) => {
        this.error$.next(err);
        return EMPTY;
      })
    )),
  )

  private downloaded$ = this.download$.pipe(
    switchMap((trackToDownload) => this.downloadTrack(trackToDownload).pipe(
      catchError((err) => {
        this.error$.next(err);
        return EMPTY;
      })
    ))
  )

  constructor() { 
    this.ok$.pipe(
      takeUntilDestroyed()
    ).subscribe((ok) => {
      this.state.update((state) => ({
        ...state,
        ok
      }))
    })

    this.search$.pipe(
      takeUntilDestroyed()
    ).subscribe(() => {
      this.state.update((state) => ({
        ...state,
        status: 'loading',
      }))
    })

    this.searched$.pipe(
      takeUntilDestroyed()
    ).subscribe((tuneMetaData) => {
      this.state.update((state) => ({
        ...state,
        tuneMetaData,
        status: 'success',
      }))
    })

    this.error$.pipe(
      takeUntilDestroyed()
    ).subscribe((err) => {
      this.state.update((state) => ({
        ...state,
        error: err.error,
        status: 'error',
      }))
    })

    this.download$.pipe(
      takeUntilDestroyed()
    ).subscribe(() => {
      this.state.update((state) => ({
        ...state,
        status: 'downloading',
      }))
    })

    this.downloaded$.pipe(
      takeUntilDestroyed()
    ).subscribe(() => {
      this.state.update((state) => ({
        ...state,
        status: 'downloaded',
      }))
    })
  }

  private getTuneMetaData(url: string): Observable<TuneMetaData> {
    return this.http.get<TuneMetaData>(`${environment.production ? '' : environment.apiUrl}/api/tune/video-meta-data`, {
      params: {
        url,
      }
    })
  }

  private downloadTrack(trackToDownload: TrackToDownload): Observable<TuneMetaData> {
    return this.http.post<TuneMetaData>(`${environment.production ? '' : environment.apiUrl}/api/tune/download-audio`, trackToDownload)
  }
}
