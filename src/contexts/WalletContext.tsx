import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WalletInfo } from '../types/dao';
import toast from 'react-hot-toast';

interface WalletContextType {
  wallet: WalletInfo;
  connectWallet: (walletName?: string) => Promise<void>;
  disconnectWallet: () => void;
  signAndSubmitTransaction: (payload: any) => Promise<any>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [wallet, setWallet] = useState<WalletInfo>({
    address: null,
    connected: false,
    connecting: false,
  });

  const connectWallet = async (walletName: string = 'Petra') => {
    setWallet(prev => ({ ...prev, connecting: true }));
    
    try {
      // Check if wallet is available
      const walletObj = (window as any).aptos || (window as any).martian;
      
      if (!walletObj) {
        throw new Error(`${walletName} wallet not found. Please install the extension.`);
      }

      // Connect to wallet
      const response = await walletObj.connect();
      
      if (response.address) {
        setWallet({
          address: response.address,
          connected: true,
          connecting: false,
        });
        toast.success(`Connected to ${walletName} wallet`);
        localStorage.setItem('walletConnected', 'true');
        localStorage.setItem('walletAddress', response.address);
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
      toast.error('Failed to connect wallet');
      setWallet(prev => ({ ...prev, connecting: false }));
    }
  };

  const disconnectWallet = () => {
    setWallet({
      address: null,
      connected: false,
      connecting: false,
    });
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('walletAddress');
    toast.success('Wallet disconnected');
  };

  const signAndSubmitTransaction = async (payload: any) => {
    const walletObj = (window as any).aptos || (window as any).martian;
    
    if (!walletObj || !wallet.connected) {
      throw new Error('Wallet not connected');
    }

    try {
      const response = await walletObj.signAndSubmitTransaction(payload);
      return response;
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  };

  // Auto-connect on page load
  useEffect(() => {
    const autoConnect = async () => {
      const wasConnected = localStorage.getItem('walletConnected');
      const savedAddress = localStorage.getItem('walletAddress');
      
      if (wasConnected && savedAddress) {
        try {
          const walletObj = (window as any).aptos || (window as any).martian;
          if (walletObj && walletObj.isConnected && walletObj.isConnected()) {
            setWallet({
              address: savedAddress,
              connected: true,
              connecting: false,
            });
          }
        } catch (error) {
          console.error('Auto-connect failed:', error);
          localStorage.removeItem('walletConnected');
          localStorage.removeItem('walletAddress');
        }
      }
    };

    autoConnect();
  }, []);

  return (
    <WalletContext.Provider value={{
      wallet,
      connectWallet,
      disconnectWallet,
      signAndSubmitTransaction,
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};