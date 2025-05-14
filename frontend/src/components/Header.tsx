import React from 'react';
import { Box, Button, Flex, Heading, Spacer } from '@chakra-ui/react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

export const Header = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const bgColor = 'white';
  const borderColor = 'gray.200';

  const connectWallet = async () => {
    try {
      await connect({ connector: connectors[0] });
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const disconnectWallet = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  return (
    <Box 
      as="header" 
      position="fixed" 
      w="100%" 
      bg={bgColor} 
      borderBottom="1px" 
      borderColor={borderColor}
      zIndex="sticky"
    >
      <Flex maxW="1200px" mx="auto" px={4} py={4} align="center">
        <Heading size="lg">DeFi GoalSaver</Heading>
        <Spacer />
        {isConnected ? (
          <Button onClick={disconnectWallet} colorScheme="red" variant="outline">
            {`${address?.slice(0, 6)}...${address?.slice(-4)}`}
          </Button>
        ) : (
          <Button onClick={connectWallet} colorScheme="blue">
            Connect Wallet
          </Button>
        )}
      </Flex>
    </Box>
  );
}; 