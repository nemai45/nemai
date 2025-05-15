import React from 'react'

interface ErrorProps {
    error?: string
}

const Error = ({ error = "Something Went Wrong!!" }: ErrorProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold">{error}</h1>
    </div>
  )
}

export default Error