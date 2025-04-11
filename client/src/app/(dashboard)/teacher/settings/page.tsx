import ShareNotificationSettings from '@/components/ShareNotificationSettings';

const TeacherSettings = () => {
  return (
    <div className="w-3/5">
      <ShareNotificationSettings
        title="User Settings"
        subtitle="Manage your user notification settings"
      />
    </div>
  );
};

export default TeacherSettings;
