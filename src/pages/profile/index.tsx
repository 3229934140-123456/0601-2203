import React, { useState } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppStore } from '@/store/useAppStore';
import StatCard from '@/components/StatCard';
import { formatDateTime, formatRelativeTime } from '@/utils/format';

const STATUS_TABS = [
  { value: 'all', label: '全部' },
  { value: 'checked', label: '已签到' },
  { value: 'unchecked', label: '待签到' },
];

const ProfilePage: React.FC = () => {
  const currentUser = useAppStore(s => s.currentUser);
  const getUserSignUpRecords = useAppStore(s => s.getUserSignUpRecords);
  const getUserSignUpCount = useAppStore(s => s.getUserSignUpCount);
  const contributionRecords = useAppStore(s => s.contributionRecords);
  const thankRecords = useAppStore(s => s.thankRecords);
  const signUpRecords = getUserSignUpRecords(currentUser.id);
  const activityCount = getUserSignUpCount(currentUser.id);
  const [historyFilter, setHistoryFilter] = useState('all');

  useDidShow(() => {
    console.log('[Profile] Page did show');
  });

  const handleMenuItemClick = (item: string) => {
    console.log('[Profile] Menu item clicked:', item);
    Taro.showToast({ title: `${item}功能开发中`, icon: 'none' });
  };

  const getRecordIconClass = (type: string) => {
    switch (type) {
      case 'activity': return styles.recordIconWarm;
      case 'other': return styles.recordIconSuccess;
      default: return '';
    }
  };

  const getRecordIcon = (type: string) => {
    switch (type) {
      case 'aid': return '🤝';
      case 'activity': return '📅';
      case 'other': return '🎨';
      default: return '📝';
    }
  };

  const handleRecordClick = (activityId: string) => {
    Taro.navigateTo({ url: `/pages/activity-detail/index?id=${activityId}` });
  };

  const filteredRecords = historyFilter === 'all'
    ? signUpRecords
    : historyFilter === 'checked'
      ? signUpRecords.filter(r => r.checkedIn)
      : signUpRecords.filter(r => !r.checkedIn);

  const menuItems = [
    { icon: '⚙️', text: '账号设置' },
    { icon: '🔔', text: '消息通知' },
    { icon: '📱', text: '关于我们' },
    { icon: '💬', text: '意见反馈' },
  ];

  return (
    <ScrollView scrollY className={`pageContainer ${styles.page}`}>
      <View className={styles.headerCard}>
        <View className={styles.userInfo}>
          <Image className={styles.avatar} src={currentUser.avatar} mode="aspectFill" />
          <View className={styles.userDetail}>
            <Text className={styles.name}>{currentUser.name}</Text>
            <Text className={styles.position}>{currentUser.position}</Text>
            <Text className={styles.department}>{currentUser.department} · {currentUser.grade}</Text>
          </View>
        </View>

        <View className={styles.creditSection}>
          <View className={styles.creditRow}>
            <Text className={styles.creditLabel}>信用积分</Text>
            <Text className={styles.creditValue}>{currentUser.creditScore}</Text>
          </View>
          <View className={styles.creditBar}>
            <View className={styles.creditFill} style={{ width: `${currentUser.creditScore}%` }} />
          </View>
        </View>
      </View>

      <View className={styles.statsGrid}>
        <StatCard value={currentUser.contributionCount} label="贡献次数" />
        <StatCard value={currentUser.thankedCount} label="被感谢" variant="warm" />
        <StatCard value={activityCount} label="参与活动" variant="success" />
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>📊</Text>
            贡献记录
          </Text>
          <Text className={styles.viewAll}>查看全部 ›</Text>
        </View>
        {contributionRecords.slice(0, 3).map((record) => (
          <View key={record.id} className={styles.recordItem}>
            <View className={classnames(styles.recordIcon, getRecordIconClass(record.type))}>
              <Text>{getRecordIcon(record.type)}</Text>
            </View>
            <View className={styles.recordContent}>
              <Text className={styles.recordTitle}>{record.title}</Text>
              <Text className={styles.recordDesc}>{record.description}</Text>
              <View className={styles.recordMeta}>
                <Text className={styles.recordTime}>{formatRelativeTime(record.createdAt)}</Text>
                <Text className={styles.recordPoints}>+{record.points} 积分</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>💝</Text>
            收到的感谢
          </Text>
          <Text className={styles.viewAll}>查看全部 ›</Text>
        </View>
        {thankRecords.slice(0, 2).map((thank) => (
          <View key={thank.id} className={styles.thankItem}>
            <View className={styles.thankHeader}>
              <Image
                className={styles.thankAvatar}
                src={`https://picsum.photos/id/${100 + parseInt(thank.fromUserId.split('-')[1])}/200/200`}
                mode="aspectFill"
              />
              <Text className={styles.thankName}>{thank.fromUserName}</Text>
            </View>
            <Text className={styles.thankContent}>{thank.reason}</Text>
            <Text className={styles.thankTime}>{formatRelativeTime(thank.createdAt)}</Text>
          </View>
        ))}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>📋</Text>
            报名历史
          </Text>
          <Text className={styles.recordCount}>{signUpRecords.length} 条</Text>
        </View>

        <ScrollView scrollX className={styles.filterRow}>
          {STATUS_TABS.map((tab) => (
            <Text
              key={tab.value}
              className={classnames(styles.filterTag, historyFilter === tab.value && styles.filterTagActive)}
              onClick={() => setHistoryFilter(tab.value)}
            >
              {tab.label}
            </Text>
          ))}
        </ScrollView>

        {filteredRecords.length > 0 ? (
          filteredRecords.map((record) => (
            <View
              key={record.id}
              className={styles.recordItem}
              onClick={() => handleRecordClick(record.activityId)}
            >
              <View className={classnames(styles.recordIcon, styles.recordIconWarm)}>
                <Text>📅</Text>
              </View>
              <View className={styles.recordContent}>
                <View className={styles.recordTitleRow}>
                  <Text className={styles.recordTitle}>{record.activityTitle}</Text>
                  {record.checkedIn ? (
                    <Text className={classnames('tag', 'tagSuccess')}>✅ 已签到</Text>
                  ) : (
                    <Text className={classnames('tag', 'tagWarning')}>待签到</Text>
                  )}
                </View>
                <Text className={styles.recordDesc}>
                  {record.positionName ? `岗位：${record.positionName}` : '普通参与'}
                </Text>
                <View className={styles.recordMeta}>
                  <Text className={styles.recordTime}>报名时间：{formatDateTime(record.signedAt)}</Text>
                </View>
                {record.checkedIn && record.checkInTime && (
                  <Text className={styles.checkInTimeText}>
                    签到时间：{formatDateTime(record.checkInTime)}
                  </Text>
                )}
              </View>
              <Text className={styles.recordArrow}>›</Text>
            </View>
          ))
        ) : (
          <View className="emptyState" style={{ padding: '40rpx 0' }}>
            <Text className="emptyText">暂无{historyFilter === 'checked' ? '已签到' : historyFilter === 'unchecked' ? '待签到' : ''}记录</Text>
          </View>
        )}
      </View>

      <View className={styles.menuList}>
        {menuItems.map((item, index) => (
          <View key={index} className={styles.menuItem} onClick={() => handleMenuItemClick(item.text)}>
            <Text className={styles.menuIcon}>{item.icon}</Text>
            <Text className={styles.menuText}>{item.text}</Text>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default ProfilePage;
