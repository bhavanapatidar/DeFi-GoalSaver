import React from 'react';
import { ChakraProvider, theme, Box, Container } from '@chakra-ui/react';
import { WagmiConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';
import { Header } from './components/Header';
import { SavingsGoal } from './components/SavingsGoal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const projectId = '54d276774327c7c99099af68ed57fbbb';
const chains = [mainnet, sepolia] as [any, ...any[]];

const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata: {
    name: 'DeFi GoalSaver',
    description: 'A DeFi savings dApp',
    url: 'http://localhost:5173',
    icons: ['https://walletconnect.com/_next/static/media/logo_mark.4c4876b1.svg']
  }
});

createWeb3Modal({
  wagmiConfig,
  projectId
});

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={wagmiConfig}>
        <ChakraProvider theme={theme}>
          <Box minH="100vh" bg="gray.50" py={10}>
            <Container maxW="container.md">
              <Header />
              <SavingsGoal />
            </Container>
          </Box>
        </ChakraProvider>
      </WagmiConfig>
    </QueryClientProvider>
  );
}

export default App; 