import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config';

const screenWidth = Dimensions.get('window').width;

const BreathingProgressTracker = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [breathingData, setBreathingData] = useState([]);
  const [chartType, setChartType] = useState('weekly'); // 'weekly', 'monthly', 'yearly', or 'all'

  useEffect(() => {
    fetchBreathingData();
  }, []);

  const fetchBreathingData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        setError('You need to be logged in to view your progress');
        setLoading(false);
        return;
      }

      const response = await fetch(`${BASE_URL}/api/user/breathing-sessions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch breathing data');
      }

      const data = await response.json();
      processBreathingData(data.sessions);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching breathing data:', err);
      setError('Failed to load breathing exercise data');
      setLoading(false);
    }
  };

  const processBreathingData = (sessions) => {
    if (!sessions || sessions.length === 0) {
      setBreathingData([]);
      return;
    }

    // Sort sessions by timestamp
    const sortedSessions = [...sessions].sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );

    // Group by date (YYYY-MM-DD)
    const groupedByDate = sortedSessions.reduce((acc, session) => {
      const date = new Date(session.timestamp).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(session);
      return acc;
    }, {});

    // Calculate total duration per day
    const dailyData = Object.keys(groupedByDate).map(date => {
      const totalDuration = groupedByDate[date].reduce(
        (sum, session) => sum + session.duration, 0
      );
      return {
        date,
        totalDuration: Math.round(totalDuration / 60), // Convert to minutes
      };
    });

    setBreathingData(dailyData);
  };

  // Format date based on chart type
  const formatDate = (dateStr, chartType) => {
    const date = new Date(dateStr);
    
    switch(chartType) {
      case 'weekly':
        return `${date.getDate()}/${date.getMonth() + 1}`; // dd/mm
      case 'monthly':
        return `${date.getDate()}/${date.getMonth() + 1}`; // dd/mm
      case 'yearly':
        return `${date.getMonth() + 1}/${date.getFullYear().toString().substr(2)}`; // mm/yy
      case 'all':
        return date.getFullYear().toString(); // yyyy
      default:
        return `${date.getDate()}/${date.getMonth() + 1}`;
    }
  };

  // Group data based on chart type
  const groupDataByPeriod = (data, chartType) => {
    if (data.length === 0) return [];
    
    switch(chartType) {
      case 'weekly':
        // Last 7 days - daily data
        return data.slice(-7);
        
      case 'monthly':
        // Last 30 days - daily data
        return data.slice(-30);
        
      case 'yearly':
        // Last 1 year - monthly data
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        
        // Filter data for last year
        const lastYearData = data.filter(item => new Date(item.date) >= oneYearAgo);
        
        // Group by month
        const monthlyData = lastYearData.reduce((acc, item) => {
          const date = new Date(item.date);
          const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
          
          if (!acc[monthYear]) {
            acc[monthYear] = {
              date: monthYear,
              totalDuration: 0,
            };
          }
          
          acc[monthYear].totalDuration += item.totalDuration;
          return acc;
        }, {});
        
        return Object.values(monthlyData);
        
      case 'all':
        // All time - yearly data
        const yearlyData = data.reduce((acc, item) => {
          const year = new Date(item.date).getFullYear();
          
          if (!acc[year]) {
            acc[year] = {
              date: year.toString(),
              totalDuration: 0,
            };
          }
          
          acc[year].totalDuration += item.totalDuration;
          return acc;
        }, {});
        
        return Object.values(yearlyData);
        
      default:
        return data.slice(-7);
    }
  };

  // Get chart data based on selected chart type
  const getChartData = () => {
    if (breathingData.length === 0) {
      return {
        labels: [],
        datasets: [{ data: [] }],
      };
    }

    const dataToShow = groupDataByPeriod(breathingData, chartType);

    return {
      labels: dataToShow.map(item => {
        return formatDate(item.date, chartType);
      }),
      datasets: [
        {
          data: dataToShow.map(item => item.totalDuration),
          color: (opacity = 1) => `rgba(46, 204, 113, ${opacity})`,
        },
      ],
    };
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3498DB" />
        <Text style={styles.loadingText}>Loading your breathing progress...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (breathingData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>No breathing exercise data yet. Complete some breathing exercises to see your progress!</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Breathing Exercise Progress</Text>
        
        <View style={styles.chartTypeContainer}>
          {['weekly', 'monthly', 'yearly', 'all'].map((type) => (
            <Text
              key={type}
              style={[
                styles.chartTypeButton,
                chartType === type && styles.chartTypeButtonActive,
              ]}
              onPress={() => setChartType(type)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          ))}
        </View>
        
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>
            {chartType === 'weekly' ? 'Last 7 Days' : 
             chartType === 'monthly' ? 'Last 30 Days' : 
             chartType === 'yearly' ? 'Last 12 Months' : 'All Time'}
          </Text>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chartScrollContent}
          >
            <LineChart
                data={getChartData()}
                width={screenWidth - 40}
                height={220}
                chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                    borderRadius: 16,
                },
                propsForDots: {
                    r: '6',
                    strokeWidth: '2',
                    stroke: '#3498DB',
                },
                }}
                bezier
                style={styles.chart}
            />
          </ScrollView>
          
          <Text style={styles.chartLabel}>Minutes Spent on Breathing Exercises</Text>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {breathingData.reduce((sum, item) => sum + item.totalDuration, 0)}
            </Text>
            <Text style={styles.statLabel}>Total Minutes</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {breathingData.length}
            </Text>
            <Text style={styles.statLabel}>Days Practiced</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {Math.max(...breathingData.map(item => item.totalDuration))}
            </Text>
            <Text style={styles.statLabel}>Best Day (min)</Text>
          </View>
        </View>
        
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Daily Breakdown</Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chartScrollContent}
          >
            <BarChart
                data={getChartData()}
                width={screenWidth - 40}
                height={220}
                yAxisLabel=""
                yAxisSuffix=" min"
                chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(46, 204, 113, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                    borderRadius: 16,
                },
                barPercentage: 0.7,
                }}
                style={styles.chart}
            />
          </ScrollView>
        </View>
        
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Tips for Consistency</Text>
          <Text style={styles.tipText}>• Try to practice breathing exercises at the same time each day</Text>
          <Text style={styles.tipText}>• Start with just 2-3 minutes and gradually increase</Text>
          <Text style={styles.tipText}>• Use breathing exercises when you feel cravings</Text>
          <Text style={styles.tipText}>• Track your progress to stay motivated</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f6f6f6',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  chartTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
    backgroundColor: '#e0e0e0',
    borderRadius: 25,
    padding: 5,
  },
  chartTypeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    color: '#7f8c8d',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginHorizontal: 2,
  },
  chartTypeButtonActive: {
    backgroundColor: '#3498DB',
    color: 'white',
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 5,
    textAlign: 'center',
  },
  chartScrollContent: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 10,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    flex: 1,
    margin: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498DB',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 5,
    textAlign: 'center',
  },
  tipsContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  tipText: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 8,
    lineHeight: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    padding: 20,
  },
});

export default BreathingProgressTracker;