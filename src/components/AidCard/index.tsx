import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { MutualAid, AID_TYPE_OPTIONS } from '@/types';
import { formatRelativeTime } from '@/utils/format';

interface AidCardProps {
  aid: MutualAid;
  onClick?: () => void;
}

const AidCard: React.FC<AidCardProps> = ({ aid, onClick }) => {
  const typeOption = AID_TYPE_OPTIONS.find(opt => opt.value === aid.type);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      Taro.navigateTo({ url: `/pages/aid-detail/index?id=${aid.id}` });
    }
  };

  const getStatusClass = () => {
    switch (aid.status) {
      case 'open': return styles.statusOpen;
      case 'claimed': return styles.statusClaimed;
      case 'completed': return styles.statusCompleted;
      case 'expired': return styles.statusExpired;
      default: return styles.statusOpen;
    }
  };

  const getStatusLabel = () => {
    switch (aid.status) {
      case 'open': return '待认领';
      case 'claimed': return '已认领';
      case 'completed': return '已完成';
      case 'expired': return '已过期';
      default: return '待认领';
    }
  };

  const getTagClass = () => {
    switch (aid.type) {
      case 'borrow': return 'tagBorrow';
      case 'carpool': return 'tagCarpool';
      case 'material': return 'tagMaterial';
      case 'skill': return 'tagSkill';
      default: return 'tagBorrow';
    }
  };

  return (
    <View className={styles.container} onClick={handleClick}>
      <View className={styles.header}>
        <View style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <Text className={classnames('tag', getTagClass(), styles.typeTag)}>
            {typeOption?.label}
          </Text>
          <Text className={styles.title}>{aid.title}</Text>
        </View>
        <Text className={classnames(styles.statusBadge, getStatusClass())}>
          {getStatusLabel()}
        </Text>
      </View>

      <View className={styles.metaRow}>
        <Text className="metaIcon">📍</Text>
        <Text>{aid.location}</Text>
        <Text style={{ margin: '0 16rpx', color: '#cbd5e1' }}>|</Text>
        <Text className="metaIcon">⏰</Text>
        <Text>有效期至 {formatRelativeTime(aid.validUntil)}</Text>
      </View>

      <Text className={styles.description}>{aid.description}</Text>

      <View className={styles.footer}>
        <View className={styles.publisher}>
          <Image className={styles.avatar} src={aid.publisherAvatar} mode="aspectFill" />
          <View>
            <Text className={styles.publisherName}>{aid.publisherName}</Text>
            <Text className={styles.publishTime}>{formatRelativeTime(aid.createdAt)}</Text>
          </View>
        </View>

        <View className={styles.actions}>
          <View className={classnames(styles.actionItem, aid.isLiked && styles.actionActive)}>
            <Text className={styles.actionIcon}>{aid.isLiked ? '❤️' : '🤍'}</Text>
            <Text>{aid.likes}</Text>
          </View>
          <View className={styles.actionItem}>
            <Text className={styles.actionIcon}>💬</Text>
            <Text>{aid.comments.length}</Text>
          </View>
          <View className={classnames(styles.actionItem, aid.isCollected && styles.actionActive)}>
            <Text className={styles.actionIcon}>{aid.isCollected ? '⭐' : '☆'}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default AidCard;
