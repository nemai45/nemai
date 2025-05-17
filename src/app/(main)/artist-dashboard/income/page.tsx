import IncomeChart from '@/components/dashboard/IncomeChart'
import { getIncome } from '@/lib/user';
import React from 'react'

const page = async () => {
  const result = await getIncome();
  if('error' in result) {
    return <div>{result.error}</div>
  }
  return (
    <IncomeChart income={result.data} />
  )
}

export default page