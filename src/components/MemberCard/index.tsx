import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { Member } from '@/types';

interface MemberCardProps {
  member: Member;
  onClick?: () => void;
  showArrow?: boolean;
}

const MemberCard: React.FC<MemberCardProps> = ({ member, onClick, showArrow = true }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      Taro.navigateTo({ url: `/pages/member-detail/index?id=${member.id}` });
    }
  };

  return (
    <View className={styles.container} onClick={handleClick}>
      <Image className={styles.avatar} src={member.avatar} mode="aspectFill" />
      <View className={styles.info}>
        <View className={styles.nameRow}>
          <Text className={styles.name}>{member.name}</Text>
          <Text className={classnames(
            styles.positionBadge,
            member.isPresident && styles.presidentBadge
          )}>
            {member.position}
          </Text>
        </View>
        <Text className={styles.department}>{member.department} · {member.major}</Text>
        <Text className={styles.grade}>{member.grade} · 学分 {member.creditScore}</Text>
      </View>
      {showArrow && <Text className={styles.arrow}>›</Text>}
    </View>
  );
};

export default MemberCard;
