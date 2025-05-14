import React, { useState } from 'react';
import { useContractWrite, useWaitForTransaction } from 'wagmi';
import { parseEther } from 'ethers/lib/utils';

const SavingsPod = ({ contractAddress, contractABI }) => {
  const [podName, setPodName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [memberAddresses, setMemberAddresses] = useState(['']);

  const { write: createPod, data: createPodData } = useContractWrite({
    address: contractAddress,
    abi: contractABI,
    functionName: 'createPod',
  });

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: createPodData?.hash,
  });

  const handleAddMember = () => {
    setMemberAddresses([...memberAddresses, '']);
  };

  const handleMemberAddressChange = (index, value) => {
    const newAddresses = [...memberAddresses];
    newAddresses[index] = value;
    setMemberAddresses(newAddresses);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validAddresses = memberAddresses.filter(addr => addr !== '');
    
    createPod({
      args: [
        podName,
        parseEther(targetAmount),
        validAddresses
      ],
    });
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Create Savings Pod
        </h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>
            Create a group savings pod with friends or family members. Set a
            target amount and invite members to contribute.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="mt-5 space-y-6">
          <div>
            <label
              htmlFor="podName"
              className="block text-sm font-medium text-gray-700"
            >
              Pod Name
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="podName"
                id="podName"
                required
                value={podName}
                onChange={(e) => setPodName(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Family Vacation Fund"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="targetAmount"
              className="block text-sm font-medium text-gray-700"
            >
              Target Amount (ETH)
            </label>
            <div className="mt-1">
              <input
                type="number"
                name="targetAmount"
                id="targetAmount"
                step="0.01"
                required
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Pod Members
            </label>
            <div className="mt-2 space-y-2">
              {memberAddresses.map((address, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="text"
                    value={address}
                    onChange={(e) =>
                      handleMemberAddressChange(index, e.target.value)
                    }
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="0x..."
                  />
                  {index === memberAddresses.length - 1 && (
                    <button
                      type="button"
                      onClick={handleAddMember}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Add Member
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Pod'}
            </button>
          </div>

          {isSuccess && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Pod created successfully!
                  </p>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default SavingsPod; 