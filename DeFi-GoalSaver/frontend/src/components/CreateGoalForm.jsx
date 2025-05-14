import React, { useState } from 'react';
import { useContractWrite, useWaitForTransaction } from 'wagmi';
import { parseEther } from 'ethers/lib/utils';

const CreateGoalForm = ({ contractAddress, contractABI }) => {
  const [formData, setFormData] = useState({
    targetAmount: '',
    deadline: '',
    category: 'emergency',
    priority: 'medium',
  });

  const { write: createGoal, data: createGoalData } = useContractWrite({
    address: contractAddress,
    abi: contractABI,
    functionName: 'createGoal',
  });

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: createGoalData?.hash,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const deadlineTimestamp = Math.floor(new Date(formData.deadline).getTime() / 1000);
    
    createGoal({
      args: [parseEther(formData.targetAmount), deadlineTimestamp],
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Create New Savings Goal
        </h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>Set up a new savings goal with target amount and deadline.</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-5 space-y-6">
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
                value={formData.targetAmount}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="deadline"
              className="block text-sm font-medium text-gray-700"
            >
              Target Date
            </label>
            <div className="mt-1">
              <input
                type="date"
                name="deadline"
                id="deadline"
                required
                value={formData.deadline}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700"
            >
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="emergency">Emergency Fund</option>
              <option value="vacation">Vacation</option>
              <option value="education">Education</option>
              <option value="retirement">Retirement</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="priority"
              className="block text-sm font-medium text-gray-700"
            >
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Goal'}
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
                    Goal created successfully!
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

export default CreateGoalForm; 