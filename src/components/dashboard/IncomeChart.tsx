"use client"

import { Income, MonthlyIncome } from "@/lib/type"
import { FC } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

// Custom tooltip component
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-md shadow-md border border-border">
        <p className="text-sm text-foreground font-medium">
          {`${payload[0].payload.month}: ₹${payload[0].payload.total}`}
        </p>
      </div>
    )
  }

  return null
}

const IncomeChart: FC<{ income: Income & { monthlyChart: MonthlyIncome[] } }> = ({
  income,
}) => {
  const currentMonthIncome = income.currentMonthIncome
  const lastMonthIncome = income.lastMonthIncome
  const percentageChange =
    lastMonthIncome > 0
      ? (((currentMonthIncome - lastMonthIncome) / lastMonthIncome) * 100).toFixed(1)
      : "0"

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-muted rounded-xl p-4">
          <p className="text-muted-foreground text-sm">Current Month</p>
          <h3 className="text-2xl font-bold mt-1">₹{currentMonthIncome}</h3>
        </div>
        <div className="bg-muted rounded-xl p-4">
          <p className="text-muted-foreground text-sm">Last Month</p>
          <h3 className="text-2xl font-bold mt-1">₹{lastMonthIncome}</h3>
        </div>
        <div className="bg-muted rounded-xl p-4">
          <p className="text-muted-foreground text-sm">Monthly Growth</p>
          <h3
            className={`text-2xl font-bold mt-1 ${
              Number(percentageChange) >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {Number(percentageChange) >= 0 ? "+" : ""}
            {percentageChange}%
          </h3>
        </div>
      </div>

      <div className="h-64 sm:h-80 mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={income.monthlyChart}
            margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#888888" tickLine={false} axisLine={false} />
            <YAxis
              stroke="#888888"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `₹${value}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(193, 167, 226, 0.1)" }} />
            <Bar dataKey="total" fill="#C1A7E2" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-unicorn-purple/5 p-4 rounded-lg border border-unicorn-purple/20">
        <h4 className="font-medium mb-2">Income Breakdown</h4>
        <div className="space-y-3">
          {income.serviceWiseIncome.map((service) => (
            <div key={service.name} className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-unicorn-purple mr-2"></div>
                <span className="text-sm">{service.name}</span>
              </div>
              <span className="text-sm font-medium">₹{service.total}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default IncomeChart
