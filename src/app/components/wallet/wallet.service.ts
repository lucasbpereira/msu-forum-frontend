import { Injectable, signal, computed } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ethers } from 'ethers';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

const MSUKEY = environment.MSU_KEY;

export interface CharacterData {
  classCode: number;
  jobCode: number;
  level: number;
  world: number;
  expr: string;
  imageUrl: string;
}

export interface Character {
  name: string;
  assetKey: string;
  tokenId: string;
  categoryNo: number;
  data: CharacterData;
}

export interface PaginationResult {
  totalCount: number;
  pageSize: number;
  currPageNo: number;
  isLastPage: boolean;
}

export interface CharactersResponse {
  characters: Character[];
  paginationResult: PaginationResult;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface WalletConnection {
  isConnected: boolean;
  account: string | null;
  chainId: string | null;
  balance: string | null;
}

interface EthereumProvider {
  request(args: { method: string; params?: any[] }): Promise<any>;
  on(event: string, callback: (...args: any[]) => void): void;
  removeListener(event: string, callback: (...args: any[]) => void): void;
}

interface Window {
  ethereum?: EthereumProvider;
}

export interface NetworkConfig {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: 18;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private apiUrl = 'http://localhost:3000'; // ajuste para sua API

  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  // Signal privado para o estado da wallet
  private readonly _walletState = signal<WalletConnection>({
    isConnected: false,
    account: null,
    chainId: null,
    balance: null
  });

  // Signal público somente leitura
  public readonly walletState = this._walletState.asReadonly();

  // Computed signals para propriedades específicas
  public readonly isConnected = computed(() => this._walletState().isConnected);
  public readonly account = computed(() => this._walletState().account);
  public readonly chainId = computed(() => this._walletState().chainId);
  public readonly balance = computed(() => this._walletState().balance);
  public readonly isHenesysNetwork = computed(() => this._walletState().chainId === '0x10b3e');

  constructor(private http: HttpClient) {
    this.checkInitialConnection();
  }

  // Verifica se já está conectado ao carregar a aplicação
  private async checkInitialConnection() {
    if (typeof window.ethereum !== 'undefined') {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        await this.connectWallet();
      }
    }
  }

  // Conectar à MetaMask
  async connectWallet(): Promise<void> {
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask não está instalada!');
      }

      // Solicitar conexão
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();

      // Obter informações da conta - usar checksum address
      const rawAccount = accounts[0];
      const account = ethers.getAddress(rawAccount); // Convert to checksum format
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const balance = await this.getBalance(account);

      // Atualizar estado
      this._walletState.set({
        isConnected: true,
        account,
        chainId,
        balance
      });

      // Configurar listeners para mudanças
      this.setupEventListeners();

    } catch (error) {
      console.error('Erro ao conectar com MetaMask:', error);
      throw error;
    }
  }

  // Desconectar wallet
  disconnectWallet(): void {
    this._walletState.set({
      isConnected: false,
      account: null,
      chainId: null,
      balance: null
    });
    this.provider = null;
    this.signer = null;
  }

  // Obter saldo
  private async getBalance(account: string): Promise<string> {
    if (!this.provider) return '0';

    const balance = await this.provider.getBalance(account);
    return ethers.formatEther(balance);
  }

  // Configurar listeners para eventos
  private setupEventListeners(): void {
    if (typeof window.ethereum === 'undefined') return;

    // Listener para mudança de conta
    window.ethereum.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length === 0) {
        this.disconnectWallet();
      } else {
        this.connectWallet(); // Reconectar com nova conta
      }
    });

    // Listener para mudança de rede
    window.ethereum.on('chainChanged', () => {
      window.location.reload(); // Recarregar para atualizar chainId
    });
  }

  // Obter signer para transações
  getSigner(): ethers.JsonRpcSigner | null {
    return this.signer;
  }

  // Obter provider
  getProvider(): ethers.BrowserProvider | null {
    return this.provider;
  }

async addHenesysNetwork(): Promise<void> {
  try {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask não está instalada!');
    }

    const henesysConfig: NetworkConfig = {
      chainId: '0x10B3E', // 68414 em hexadecimal
      chainName: 'Henesys Network',
      nativeCurrency: {
        name: 'NXPC',
        symbol: 'NXPC',
        decimals: 18
      },
      rpcUrls: ['https://henesys-rpc.msu.io'],
      blockExplorerUrls: ['https://msu-explorer.xangle.io']
    };

    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [henesysConfig]
    });

    console.log('Rede Henesys adicionada com sucesso!');

  } catch (error) {
    console.error('Erro ao adicionar rede Henesys:', error);
    throw error;
  }
}

async switchToHenesysNetwork(): Promise<void> {
  try {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask não está instalada!');
    }

    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x10B3E' }] // 68414 em hexadecimal
    });

    console.log('Conectado à rede Henesys!');

  } catch (error: any) {
    // Se a rede não existir na MetaMask, adiciona automaticamente
    if (error.code === 4902) {
      await this.addHenesysNetwork();
    } else {
      console.error('Erro ao alternar para rede Henesys:', error);
      throw error;
    }
  }
}

  hasRegister(wallet: string) {
    return this.http.post<{ exists: boolean }>(`${this.apiUrl}/wallet`, { wallet });
  }

getWalletMSU(wallet: string) {
  const headers = new HttpHeaders({
    'x-nxopen-api-key': environment.MSU_KEY
  });

  return this.http.get<CharactersResponse>(
    `https://openapi.msu.io/v1beta/accounts/${wallet}/characters?paginationParam.pageNo=1`,
    { headers }
  );
}

  // Getter para obter o estado atual da wallet
  getCurrentWalletState(): WalletConnection {
    return this._walletState();
  }
}
