import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { Activity } from '@/types';
import { formatTimeRange } from '@/utils/format';

interface ActivityCardProps {
  activity: Activity;
  onClick?: () => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      Taro.navigateTo({ url: `/pages/activity-detail/index?id=${activity.id}` });
    }
  };

  const getStatusClass = () => {
    switch (activity.status) {
      case 'upcoming': return styles.statusUpcoming;
      case 'ongoing': return styles.statusOngoing;
      case 'ended': return styles.statusEnded;
      default: return styles.statusEnded;
    }
  };

  const getStatusLabel = () => {
    switch (activity.status) {
      case 'upcoming': return '即将开始';
      case 'ongoing': return '进行中';
      case 'ended': return '已结束';
      default: return '已结束';
    }
  };

  const progressPercent = Math.round((activity.signedParticipants.length / activity.maxParticipants) * 100);

  return (
    <View className={styles.container} onClick={handleClick}>
      <View className={styles.header}>
        <Text className={styles.title}>{activity.title}</Text>
        <Text className={classnames(styles.statusBadge, getStatusClass())}>
          {getStatusLabel()}
        </Text>
      </View>

      <View className={styles.metaRow}>
        <Text className={styles.metaIcon}>⏰</Text>
        <Text>{formatTimeRange(activity.startTime, activity.endTime)}</Text>
      </View>

      <View className={styles.metaRow}>
        <Text className={styles.metaIcon}>📍</Text>
        <Text>{activity.location}</Text>
      </View>

      <Text className={styles.description}>{activity.description}</Text>

      <View className={styles.progress}>
        <View className={styles.progressBar}>
          <View className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
        </View>
        <Text className={styles.progressText}>
          已报名 {activity.signedParticipants.length}/{activity.maxParticipants} 人
        </Text>
      </View>

      <View className={styles.footer}>
        <View className={styles.organizer}>
          <Image
            className={styles.avatar}
            src={`https://picsum.photos/id/100/200/200`}
            mode="aspectFill"
          />
          <Text className={styles.organizerName}>{activity.organizerName} 发起</Text>
        </View>

        <View className={styles.tags}>
          {activity.positions.length > 0 && (
            <Text className={styles.tag}>{activity.positions.length} 个岗位</Text>
          )}
        </View>
      </View>
    </View>
  );
};

export default ActivityCard;
