import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppStore } from '@/store/useAppStore';
import ActivityCard from '@/components/ActivityCard';
import StatCard from '@/components/StatCard';

const STATUS_TABS = [
  { value: 'all', label: '全部' },
  { value: 'upcoming', label: '即将开始' },
  { value: 'ongoing', label: '进行中' },
  { value: 'ended', label: '已结束' },
];

const ActivitiesPage: React.FC = () => {
  const currentUser = useAppStore(s => s.currentUser);
  const activityList = useAppStore(s => s.activityList);
  const signUpRecords = useAppStore(s => s.signUpRecords);
  const [activeStatus, setActiveStatus] = useState('all');

  useDidShow(() => {
    console.log('[Activities] Page did show');
  });

  const stats = useMemo(() => {
    const mySignUpCount = signUpRecords.filter(r => {
      const act = activityList.find(a => a.id === r.activityId);
      return act && act.signedParticipants.includes(currentUser.id);
    }).length;
    const myCount = activityList.filter(a => a.signedParticipants.includes(currentUser.id)).length;
    return {
      upcoming: activityList.filter(a => a.status === 'upcoming').length,
      ongoing: activityList.filter(a => a.status === 'ongoing').length,
      ended: activityList.filter(a => a.status === 'ended').length,
      mySignup: myCount > 0 ? myCount : mySignUpCount,
    };
  }, [activityList, signUpRecords, currentUser.id]);

  const filteredList = useMemo(() => {
    if (activeStatus === 'all') return activityList;
    return activityList.filter(a => a.status === activeStatus);
  }, [activityList, activeStatus]);

  const handleCreate = () => {
    if (currentUser.isPresident) {
      Taro.navigateTo({ url: '/pages/create-activity/index' });
    } else {
      Taro.showToast({ title: '仅社长可创建活动', icon: 'none' });
    }
  };

  const handleRefresh = () => {
    setTimeout(() => {
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 500);
  };

  return (
    <ScrollView
      scrollY
      className={`pageContainer ${styles.page}`}
      refresherEnabled
      onRefresherRefresh={handleRefresh}
    >
      <View className={styles.header}>
        <Text className={styles.title}>活动管理</Text>
        {currentUser.isPresident && (
          <Text className={styles.createBtn} onClick={handleCreate}>
            + 创建活动
          </Text>
        )}
      </View>

      <View className={styles.statsGrid}>
        <StatCard value={stats.upcoming} label="即将开始" />
        <StatCard value={stats.ongoing} label="进行中" variant="success" />
        <StatCard value={stats.ended} label="已结束" variant="warm" />
        <StatCard value={stats.mySignup} label="我报名的" />
      </View>

      <ScrollView scrollX className={styles.filterTabs}>
        {STATUS_TABS.map((tab) => (
          <Text
            key={tab.value}
            className={classnames(
              styles.tabItem,
              activeStatus === tab.value && styles.tabActive
            )}
            onClick={() => setActiveStatus(tab.value)}
          >
            {tab.label}
          </Text>
        ))}
      </ScrollView>

      <View className={styles.sectionTitle}>
        <Text>活动列表</Text>
        <Text className={styles.countBadge}>{filteredList.length} 个</Text>
      </View>

      {filteredList.length > 0 ? (
        filteredList.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} />
        ))
      ) : (
        <View className="emptyState">
          <Text className="emptyIcon">📅</Text>
          <Text className="emptyText">暂无相关活动</Text>
        </View>
      )}

      {currentUser.isPresident && (
        <View className={styles.fab} onClick={handleCreate}>
          <Text className={styles.fabIcon}>+</Text>
        </View>
      )}
    </ScrollView>
  );
};

export default ActivitiesPage;
