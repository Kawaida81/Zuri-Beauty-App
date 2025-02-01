'use client'

import { useState, useEffect, useMemo } from 'react'
import styled from 'styled-components'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
  Scale,
  ScaleOptionsByType,
  CoreScaleOptions,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import { useSalesStore } from '@/store/salesStore'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const ChartContainer = styled.div`
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`

const ChartTitle = styled.h2`
  font-size: 1.25rem;
  color: var(--text-primary);
`

const TimeFilter = styled.select`
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
`

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
`

export default function SalesCharts() {
  const { sales, fetchSales } = useSalesStore()
  const [timeRange, setTimeRange] = useState('7d')

  useEffect(() => {
    fetchSales()
  }, [fetchSales])

  const chartData = useMemo(() => {
    const productSales: { [date: string]: number } = {}
    const serviceSales: { [date: string]: number } = {}
    const categories: { [category: string]: number } = {}

    sales.forEach((sale) => {
      // Aggregate sales by date
      const date = new Date(sale.date).toLocaleDateString()
      if (sale.items.toLowerCase().includes('service')) {
        serviceSales[date] = (serviceSales[date] || 0) + sale.amount
      } else {
        productSales[date] = (productSales[date] || 0) + sale.amount
      }

      // Aggregate sales by category
      const items = sale.items.split(',').map(item => item.trim())
      items.forEach(item => {
        categories[item] = (categories[item] || 0) + (sale.amount / items.length)
      })
    })

    const dateSet = new Set([...Object.keys(productSales), ...Object.keys(serviceSales)])
    const dates = Array.from(dateSet, date => date).sort()
    const topCategories = Object.entries(categories)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})

    return {
      salesData: {
        labels: dates,
        datasets: [
          {
            label: 'Product Sales',
            data: dates.map(date => productSales[date] || 0),
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            tension: 0.4,
          },
          {
            label: 'Service Sales',
            data: dates.map(date => serviceSales[date] || 0),
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
            tension: 0.4,
          },
        ],
      },
      categoryData: {
        labels: Object.keys(topCategories),
        datasets: [
          {
            label: 'Sales by Category',
            data: Object.values(topCategories),
            backgroundColor: [
              'rgba(255, 99, 132, 0.5)',
              'rgba(53, 162, 235, 0.5)',
              'rgba(75, 192, 192, 0.5)',
            ],
          },
        ],
      },
    }
  }, [sales])

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        beginAtZero: true,
        ticks: {
          callback: function(this: Scale<CoreScaleOptions>, tickValue: number | string) {
            if (typeof tickValue === 'number') {
              return `Ksh ${tickValue.toLocaleString()}`
            }
            return tickValue
          }
        },
      },
    },
  } satisfies ChartOptions<'line' | 'bar'>

  return (
    <ChartContainer>
      <ChartHeader>
        <ChartTitle>Sales Analytics</ChartTitle>
        <TimeFilter 
          value={timeRange} 
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
          <option value="1y">Last Year</option>
        </TimeFilter>
      </ChartHeader>
      <ChartGrid>
        <div>
          <Line data={chartData.salesData} options={chartOptions} />
        </div>
        <div>
          <Bar data={chartData.categoryData} options={chartOptions} />
        </div>
      </ChartGrid>
    </ChartContainer>
  )
} 