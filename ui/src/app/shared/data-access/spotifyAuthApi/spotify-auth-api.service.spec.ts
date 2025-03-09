import { TestBed } from '@angular/core/testing';

import { SpotifyAuthApiService } from './spotify-auth-api.service';

describe('SpotifyApiService', () => {
  let service: SpotifyAuthApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpotifyAuthApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
