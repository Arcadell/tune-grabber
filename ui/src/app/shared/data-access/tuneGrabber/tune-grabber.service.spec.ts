import { TestBed } from '@angular/core/testing';

import { TuneGrabberService } from './tune-grabber.service';

describe('TuneGrabberService', () => {
  let service: TuneGrabberService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TuneGrabberService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
