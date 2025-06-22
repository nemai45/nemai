import { Notification } from '@/lib/type'
import { Bell } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { format } from 'date-fns'

const NotificationCard = ({ notification }: { notification: Notification }) => {
  return (
    <Card 
    key={notification.id}
    className={`transition-all duration-300 hover:shadow-lg cursor-pointer transform hover:-translate-y-1`}
  >
    <CardHeader>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full`}>
            <Bell className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <CardTitle className={`text-lg font-semibold`}>
              {notification.message}
            </CardTitle>
          </div>
        </div>
      </div>
    </CardHeader>
    <CardContent>
        <p className="text-sm text-gray-500">{format(new Date(notification.created_at), "dd MMM yyyy, hh:mm a")}</p>
    </CardContent>
  </Card>
  )
}

export default NotificationCard