import React from 'react'
import { Button } from './ui/button'
import { signOut } from '@/action/auth'

const SignoutButton = () => {
  return (
    <Button onClick={signOut}>
        Sign Out
    </Button>
  )
}

export default SignoutButton