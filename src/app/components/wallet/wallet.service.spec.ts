/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { WalletService } from './wallet.service';

describe('Service: ConnectButton', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WalletService]
    });
  });

  it('should ...', inject([WalletService], (service: WalletService) => {
    expect(service).toBeTruthy();
  }));
});
