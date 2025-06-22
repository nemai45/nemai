import NotificationList from '@/components/NotificationList';
import { getNotifications } from '@/lib/user';
import React from 'react'
import { Separator } from '@/components/ui/separator'

const page = async () => {
  const result = await getNotifications();
  if ("error" in result) {
    return <div>{result.error}</div>;
  }
  const notifications = result.data;
  return (
    <div className="p-4">
      <NotificationList notifications={notifications.filter((notification) => !notification.isRead)} title="Unread Notifications" />
      <Separator />
      <NotificationList notifications={notifications.filter((notification) => notification.isRead)} title="Read Notifications" />
    </div>
  )
}

export default page