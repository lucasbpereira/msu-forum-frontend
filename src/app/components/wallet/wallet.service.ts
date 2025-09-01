import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ethers } from 'ethers';

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

  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  private walletState = new BehaviorSubject<WalletConnection>({
    isConnected: false,
    account: null,
    chainId: null,
    balance: null
  });

  public walletState$ = this.walletState.asObservable();

  constructor() {
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

      // Obter informações da conta
      const account = accounts[0];
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const balance = await this.getBalance(account);

      // Atualizar estado
      this.walletState.next({
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
    this.walletState.next({
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
}
