import { Component, OnInit, computed, signal, effect } from '@angular/core';
import { WalletService, WalletConnection } from './wallet.service';
import { AuthService, User } from '../../config/auth.service';
import { Router } from '@angular/router';
import { getAddress } from 'ethers';
import { LoadingComponent } from '../loading/loading.component';

@Component({
  selector: 'msuf-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss'],
  standalone: true,
  imports: [LoadingComponent],
})
export class WalletComponent implements OnInit {
  // Signals para gerenciar estado local
  private readonly _isLoading = signal<boolean>(false);
  private readonly _isSwitchingNetwork = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // Signals públicos somente leitura
  public readonly isLoading = this._isLoading.asReadonly();
  public readonly isSwitchingNetwork = this._isSwitchingNetwork.asReadonly();
  public readonly error = this._error.asReadonly();

  // Computed signals baseados nos serviços
  public readonly walletState = computed(() => this.walletService.walletState());
  public readonly currentUser = computed(() => this.authService.currentUser());
  public readonly isAuthenticated = computed(() => this.authService.isAuthenticated());

  // Computed signal para endereço formatado
  public readonly formattedAddress = computed(() => {
    const account = this.walletState().account;
    return account ? this.formatAddress(account) : 'N/A';
  });

  // Computed signal para nome da rede
  public readonly networkName = computed(() => {
    return this.getNetworkName(this.walletState().chainId);
  });

  // Computed signal para checksum address
  public readonly checksumAddress = computed(() => {
    const account = this.walletState().account;
    return account ? this.formatWalletAddress(account) : null;
  });

  constructor(
    private walletService: WalletService,
    private authService: AuthService,
    private router: Router
  ) {
    // Effect para reagir a mudanças no estado da wallet
    effect(() => {
      const walletState = this.walletState();
      if (walletState.isConnected && walletState.account) {
        // Lógica adicional quando wallet conecta
        console.log('Wallet conectada:', walletState.account);
      }
    });
  }

  ngOnInit() {
    // Com signals, não precisamos mais de subscriptions manuais
    // Os computed signals irão reagir automaticamente às mudanças
  }
  private formatWalletAddress(address: string): string {
    try {
      return getAddress(address); // Converte para checksum address
    } catch (e) {
      console.error('Endereço inválido:', address);
      return address;
    }
  }
  // Remove ngOnDestroy pois não temos mais subscriptions manuais
  // Os signals e effects são automaticamente limpos pelo Angular

  async connect() {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      await this.walletService.connectWallet();
    } catch (error: any) {
      this._error.set(this.handleError(error));
    } finally {
      this._isLoading.set(false);
    }
  }

  disconnect() {
    this.walletService.disconnectWallet();
    this._error.set(null);
    this.authService.logout();
  }

  formatAddress(address: string | null): string {
    if (!address) return 'N/A';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

async connectToHenesys() {
    this._isSwitchingNetwork.set(true);
    this._error.set(null);

    try {
      // Primeiro conecta a wallet se não estiver conectada
      if (!this.walletState().isConnected) {
        await this.connect();
      }

      // Depois alterna para a rede Henesys
      await this.walletService.switchToHenesysNetwork();

      this.onLogin();
    } catch (error: any) {
      this._error.set(this.handleError(error));
    } finally {
      this._isSwitchingNetwork.set(false);
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
    const currentWalletState = this.walletState();

    if(currentWalletState && currentWalletState.isConnected && currentWalletState.account) {
      // Ensure wallet address is in checksum format for consistency
      const checksumAddress = this.formatWalletAddress(currentWalletState.account);

      // Prevent multiple simultaneous requests
      if (this.isLoading()) {
        console.log('Login already in progress, skipping...');
        return;
      }

      this._isLoading.set(true);
      this._error.set(null);

      this.walletService.hasRegister(checksumAddress).subscribe({
        next: (response) => {
          console.log('Registration check for address:', checksumAddress, 'exists:', response.exists);
          if(response.exists) {
            this.authService.login(checksumAddress).subscribe({
              next: (response) => {
                console.log('Login successful:', response);
                this._isLoading.set(false);
              },
              error: (err) => {
                console.error('Erro no login:', err);
                this._error.set('Erro ao fazer login');
                this._isLoading.set(false);
              }
            });
          } else {
            console.log('Registering new wallet:', checksumAddress);
            this.authService.register(checksumAddress).subscribe({
              next: () => {
                this.router.navigate(['/question/1']); // ajuste a rota pós login
                this._isLoading.set(false);
              },
              error: err => {
                console.error('Erro no registro:', err);
                this._error.set('Erro ao registrar nova carteira');
                this._isLoading.set(false);
              }
            });
          }
        },
        error: (err) => {
          console.error('Erro ao verificar registro:', err);
          this._error.set('Erro ao verificar conta');
          this._isLoading.set(false);
        }
      });
    }
  }
}
