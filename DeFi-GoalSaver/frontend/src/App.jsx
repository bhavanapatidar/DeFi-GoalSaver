import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WagmiConfig, createClient, configureChains, mainnet } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { ApolloProvider } from '@apollo/client';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import CreateGoalForm from './components/CreateGoalForm';
import SavingsPod from './components/SavingsPod';
import Analytics from './components/Analytics';
import Rewards from './components/Rewards';
import { initializeContract } from './services/contractService';

// Configure chains and providers
const { chains, provider } = configureChains(
  [mainnet],
  [publicProvider()]
);

// Set up wagmi client
const client = createClient({
  autoConnect: true,
  connectors: [new MetaMaskConnector({ chains })],
  provider,
});

// Set up Apollo Client
const apolloClient = new ApolloClient({
  uri: 'YOUR_SUBGRAPH_URL', // Replace with your deployed subgraph URL
  cache: new InMemoryCache(),
});

function App() {
  useEffect(() => {
    // Initialize contract when app loads
    initializeContract().catch(console.error);
  }, []);

  return (
    <ApolloProvider client={apolloClient}>
      <WagmiConfig client={client}>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/create-goal" element={<CreateGoalForm />} />
              <Route path="/savings-pods" element={<SavingsPod />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/rewards" element={<Rewards />} />
            </Routes>
          </Layout>
        </Router>
      </WagmiConfig>
    </ApolloProvider>
  );
}

export default App; 