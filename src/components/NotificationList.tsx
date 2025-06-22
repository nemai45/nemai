import React from 'react'
import { Notification } from '@/lib/type'
import NotificationCard from './NotificationCard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'

interface NotificationListProps {
  notifications: Notification[]
  title: string
}

const NotificationList = ({ notifications, title }: NotificationListProps) => {
  if (notifications.length === 0) {
    return (
      <Card className="flex flex-col gap-4 my-4">
        <CardHeader>
          <CardTitle className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-unicorn-purple via-unicorn-pink to-unicorn-blue">{title}</CardTitle>
          <CardDescription>No notifications</CardDescription>
        </CardHeader>
      </Card>
    )
  }
  return (
    <Card className="flex flex-col gap-4 my-4">
      <CardHeader>
        <CardTitle className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-unicorn-purple via-unicorn-pink to-unicorn-blue">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {notifications.map((notification) => (
          <NotificationCard key={notification.id} notification={notification}/>
        ))}
      </CardContent>
    </Card>
  )
}

export default NotificationList