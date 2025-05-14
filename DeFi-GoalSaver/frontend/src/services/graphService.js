import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

// Initialize Apollo Client
const client = new ApolloClient({
  uri: 'YOUR_SUBGRAPH_URL', // Replace with your deployed subgraph URL
  cache: new InMemoryCache(),
});

// GraphQL queries
export const GET_SAVINGS_ANALYTICS = gql`
  query GetSavingsAnalytics {
    goals {
      id
      targetAmount
      deadline
      currentAmount
      isCompleted
      createdAt
    }
  }
`;

export const getSavingsAnalytics = async () => {
  try {
    const { data } = await client.query({
      query: GET_SAVINGS_ANALYTICS,
    });

    const goals = data.goals;
    
    // Calculate total savings
    const totalSavings = goals.reduce(
      (sum, goal) => sum + parseFloat(goal.currentAmount),
      0
    );

    // Calculate average goal size
    const averageGoalSize =
      goals.reduce((sum, goal) => sum + parseFloat(goal.targetAmount), 0) /
      goals.length;

    // Calculate most used time durations
    const durations = goals.map((goal) => {
      const deadline = new Date(parseInt(goal.deadline) * 1000);
      const created = new Date(parseInt(goal.createdAt) * 1000);
      const months = Math.round(
        (deadline.getTime() - created.getTime()) / (1000 * 60 * 60 * 24 * 30)
      );
      return months;
    });

    const durationCounts = durations.reduce((acc, duration) => {
      acc[duration] = (acc[duration] || 0) + 1;
      return acc;
    }, {});

    const mostUsedDuration = Object.entries(durationCounts).sort(
      (a, b) => b[1] - a[1]
    )[0];

    // Count completed goals
    const completedGoals = goals.filter((goal) => goal.isCompleted).length;

    return {
      totalSavings,
      averageGoalSize,
      mostUsedDuration: {
        months: parseInt(mostUsedDuration[0]),
        count: mostUsedDuration[1],
      },
      completedGoals,
      totalGoals: goals.length,
    };
  } catch (error) {
    console.error('Error fetching savings analytics:', error);
    throw error;
  }
}; 