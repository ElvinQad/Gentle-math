import { UserActivity } from '@/types/admin';

interface ActivityTimelineProps {
  activities: UserActivity[];
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="bg-card p-4 rounded-lg border">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-medium">{activity.type}</div>
              <div className="text-sm text-muted-foreground">{activity.metadata?.path}</div>
            </div>
            <div className="text-sm text-muted-foreground">
              {new Date(activity.timestamp).toLocaleString()}
            </div>
          </div>
          {activity.metadata?.userAgent && (
            <div className="mt-2 text-sm text-muted-foreground">
              Browser: {activity.metadata.userAgent}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
