import React, { useState } from 'react';
import {
  Box,
  Button,
  Input,
  VStack,
  Text,
  Progress,
  Heading,
  Stack,
} from '@chakra-ui/react';

export const SavingsGoal = () => {
  const [targetAmount, setTargetAmount] = useState('');
  const [duration, setDuration] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [loading, setLoading] = useState(false);

  const handleCreateGoal = async () => {
    setLoading(true);
    try {
      window.alert('Your savings goal has been created successfully');
    } catch (error) {
      window.alert('Failed to create savings goal');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSavings = async () => {
    setLoading(true);
    try {
      window.alert('Your savings have been added successfully');
    } catch (error) {
      window.alert('Failed to add savings');
    } finally {
      setLoading(false);
    }
  };

  const progress = (Number(currentAmount) / Number(targetAmount)) * 100;

  return (
    <Box maxW="1200px" mx="auto" px={4} pt={20}>
      <VStack spacing={8} align="stretch">
        <Box p={6} boxShadow="md" borderRadius="md" bg="white">
          <VStack spacing={4}>
            <Heading size="md">Create New Savings Goal</Heading>
            <Box w="100%">
              <Text mb={1}>Target Amount (SAVER)</Text>
              <Input
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="Enter target amount"
              />
            </Box>
            <Box w="100%">
              <Text mb={1}>Duration (days)</Text>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Enter duration in days"
              />
            </Box>
            <Button
              colorScheme="blue"
              onClick={handleCreateGoal}
              isLoading={loading}
              isDisabled={!targetAmount || !duration}
            >
              Create Goal
            </Button>
          </VStack>
        </Box>

        <Box p={6} boxShadow="md" borderRadius="md" bg="white">
          <Stack spacing={4}>
            <Box>
              <Heading size="md" mb={4}>Current Goal Progress</Heading>
              <Text mb={2}>Target: {targetAmount} SAVER</Text>
              <Text mb={2}>Current: {currentAmount} SAVER</Text>
              <Progress value={progress} colorScheme="blue" mb={4} />
              <Button
                colorScheme="green"
                onClick={handleAddSavings}
                isLoading={loading}
              >
                Add Savings
              </Button>
            </Box>
          </Stack>
        </Box>
      </VStack>
    </Box>
  );
}; 