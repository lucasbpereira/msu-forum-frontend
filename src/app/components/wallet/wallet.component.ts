import { Component, OnInit } from '@angular/core';
import { WalletService, WalletConnection } from './wallet.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../config/auth.service';
import { Router } from '@angular/router';
import { getAddress } from 'ethers';

@Component({
  selector: 'msuf-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss']
})
export class WalletComponent implements OnInit {

   walletState: WalletConnection = {
    isConnected: false,
    account: null,
    chainId: null,
    balance: null
  };

  isLoading = false;
  isSwitchingNetwork = false;

  error: string | null = null;
  private subscription!: Subscription;

  constructor(private metamaskService: WalletService,
    private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.subscription = this.metamaskService.walletState$.subscribe({
      next: (state) => {
        // converte account para checksum caso não seja null
        const accountChecksum = state.account ? this.formatWalletAddress(state.account) : null;
        this.walletState = { ...state, account: accountChecksum };
      },
      error: (error) => {
        this.error = this.handleError(error);
      }
    });

  }
  private formatWalletAddress(address: string): string {
    try {
      return getAddress(address); // Converte para checksum address
    } catch (e) {
      console.error('Endereço inválido:', address);
      return address;
    }
  }
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  async connect() {
    this.isLoading = true;
    this.error = null;

    try {
      await this.metamaskService.connectWallet();
    } catch (error: any) {
      this.error = this.handleError(error);
    } finally {
      this.isLoading = false;
    }
  }

  disconnect() {
    this.metamaskService.disconnectWallet();
    this.error = null;
  }

  formatAddress(address: string | null): string {
    if (!address) return 'N/A';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

async connectToHenesys() {
    this.isSwitchingNetwork = true;
    this.error = null;

    try {
      // Primeiro conecta a wallet se não estiver conectada
      if (!this.walletState.isConnected) {
        await this.connect();
        this.walletState.isConnected = true;
      }

      // Depois alterna para a rede Henesys
      await this.metamaskService.switchToHenesysNetwork();

      this.onLogin()
    } catch (error: any) {
      this.error = this.handleError(error);
    } finally {
      this.isSwitchingNetwork = false;
    }
  }

  // Atualize a função getNetworkName para incluir Henesys
  getNetworkName(chainId: string | null): string {
    if (!chainId) return 'Rede não disponível';

    const networks: { [key: string]: string } = {
      '0x1': 'Ethereum Mainnet',
      '0x5': 'Goerli Testnet',
      '0xaa36a7': 'Sepolia Testnet',
      '0x89': 'Polygon Mainnet',
      '0x13881': 'Mumbai Testnet',
      '0xa4b1': 'Arbitrum One',
      '0x2105': 'Base Mainnet',
      '0x14a33': 'Base Goerli',
      '0xa86a': 'AVAX Mainnet',
      '0x64': 'Gnosis Chain',
      '0xa': 'Optimism',
      '0x38': 'Binance Smart Chain',
      '0x61': 'BSC Testnet',
      '0x10b3e': 'Henesys Network' // ← ID em lowercase para matching
    };

    return networks[chainId] || `Rede Desconhecida (${chainId})`;
  }

  private handleError(error: any): string {
    if (error.code === 4001) {
      return 'Usuário rejeitou a conexão';
    } else if (error.code === -32002) {
      return 'Requisição já pendente. Por favor, verifique sua MetaMask';
    } else if (error.message?.includes('MetaMask não está instalada')) {
      return 'MetaMask não encontrada. Por favor, instale a extensão';
    } else if (error.message?.includes('User rejected')) {
      return 'Conexão recusada pelo usuário';
    } else {
      return error.message || 'Erro desconhecido ao conectar com MetaMask';
    }
  }

  onLogin() {
    console.log()

    if(this.walletState && this.walletState.isConnected) {
      this.metamaskService.hasRegister(this.walletState.account || '').subscribe(response =>{
        console.log(response.exists)
        if(response.exists) {
          this.authService.login(this.walletState.account || '').subscribe({
            next: () => {
              this.router.navigate(['/question/1']); // ajuste a rota pós login
            },
            error: err => {
              console.error('Erro no login:', err);
            }
          });
        } else {
          console.log(this.walletState.account);
          this.authService.register(this.walletState.account || '').subscribe({
            next: () => {
              this.router.navigate(['/question/1']); // ajuste a rota pós login
            },
            error: err => {
              console.error('Erro no login:', err);
            }
          });

        }

      });
    }
  }
}
