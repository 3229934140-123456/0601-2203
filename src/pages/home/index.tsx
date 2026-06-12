import React, { useEffect, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppStore } from '@/store/useAppStore';
import AidCard from '@/components/AidCard';
import ActivityCard from '@/components/ActivityCard';
import StatCard from '@/components/StatCard';

const HomePage: React.FC = () => {
  const currentUser = useAppStore(s => s.currentUser);
  const mutualAidList = useAppStore(s => s.mutualAidList);
  const activityList = useAppStore(s => s.activityList);
  const signUpRecords = useAppStore(s => s.signUpRecords);
  const hotAids = useMemo(() => mutualAidList.slice(0, 3), [mutualAidList]);
  const upcomingActivities = useMemo(
    () => activityList.filter(a => a.status === 'upcoming').slice(0, 2),
    [activityList]
  );
  const myTodos = [
    { id: '1', type: 'activity', text: '校园文化节志愿者培训', meta: '今天 14:00 · 教学楼A101' },
    { id: '2', type: 'aid', text: '记得归还相机给李华同学', meta: '截止日期：6月18日' },
    { id: '3', type: 'remind', text: '团建活动报名确认', meta: '请在6月20日前确认' },
  ];

  useDidShow(() => {
    console.log('[Home] Page did show');
  });

  const handleQuickAction = (type: string) => {
    console.log('[Home] Quick action clicked:', type);
    if (type === 'publish') {
      Taro.navigateTo({ url: '/pages/publish-aid/index' });
    } else if (type === 'create') {
      if (currentUser.isPresident) {
        Taro.navigateTo({ url: '/pages/create-activity/index' });
      } else {
        Taro.showToast({ title: '仅社长可创建活动', icon: 'none' });
      }
    } else if (type === 'myAids') {
      Taro.switchTab({ url: '/pages/mutual-aid/index' });
    } else if (type === 'myActivities') {
      Taro.switchTab({ url: '/pages/activities/index' });
    }
  };

  const handlePullDownRefresh = () => {
    console.log('[Home] Pull down refresh');
    setTimeout(() => {
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 1000);
  };

  useEffect(() => {
    Taro.eventCenter.on('__taroPullDownRefresh', handlePullDownRefresh);
    return () => {
      Taro.eventCenter.off('__taroPullDownRefresh', handlePullDownRefresh);
    };
  }, []);

  const quickActions = [
    { type: 'publish', icon: '➕', label: '发布求助', iconClass: styles.quickIconBlue },
    { type: 'create', icon: '📅', label: '创建活动', iconClass: styles.quickIconOrange },
    { type: 'myAids', icon: '🤝', label: '我的互助', iconClass: styles.quickIconGreen },
    { type: 'myActivities', icon: '📋', label: '我的活动', iconClass: styles.quickIconPink },
  ];

  return (
    <ScrollView
      scrollY
      className={`pageContainer ${styles.page}`}
      refresherEnabled
      onRefresherRefresh={handlePullDownRefresh}
    >
      <View className={styles.banner}>
        <View className={styles.bannerContent}>
          <Text className={styles.bannerTitle}>你好，{currentUser.name} 👋</Text>
          <Text className={styles.bannerSubtitle}>
            {currentUser.department} · {currentUser.position}
          </Text>
        </View>
      </View>

      <View className={styles.quickGrid}>
        {quickActions.map((action) => (
          <View
            key={action.type}
            className={styles.quickItem}
            onClick={() => handleQuickAction(action.type)}
          >
            <View className={`${styles.quickIcon} ${action.iconClass}`}>
              <Text>{action.icon}</Text>
            </View>
            <Text className={styles.quickLabel}>{action.label}</Text>
          </View>
        ))}
      </View>

      <View className={styles.sectionTitle}>
        <Text>数据概览</Text>
      </View>
      <View className={styles.statsRow}>
        <StatCard value={currentUser.creditScore} label="信用分" />
        <StatCard value={signUpRecords.length} label="报名活动" variant="warm" />
        <StatCard value={currentUser.thankedCount} label="被感谢" variant="success" />
      </View>

      <View className={styles.todoList}>
        <Text className={styles.todoTitle}>待办提醒</Text>
        {myTodos.map((todo) => (
          <View key={todo.id} className={styles.todoItem}>
            <View className={styles.todoIcon}>
              <Text>{todo.type === 'activity' ? '📅' : todo.type === 'aid' ? '🤝' : '🔔'}</Text>
            </View>
            <View className={styles.todoContent}>
              <Text className={styles.todoText}>{todo.text}</Text>
              <Text className={styles.todoMeta}>{todo.meta}</Text>
            </View>
          </View>
        ))}
      </View>

      <View className={styles.listHeader}>
        <Text className={styles.sectionTitle} style={{ marginBottom: 0 }}>热门互助</Text>
        <Text
          className={styles.viewMore}
          onClick={() => Taro.switchTab({ url: '/pages/mutual-aid/index' })}
        >
          查看更多 ›
        </Text>
      </View>
      {hotAids.map((aid) => (
        <AidCard key={aid.id} aid={aid} />
      ))}

      <View className={styles.listHeader}>
        <Text className={styles.sectionTitle} style={{ marginBottom: 0, marginTop: 0 }}>即将开始</Text>
        <Text
          className={styles.viewMore}
          onClick={() => Taro.switchTab({ url: '/pages/activities/index' })}
        >
          查看更多 ›
        </Text>
      </View>
      {upcomingActivities.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}
    </ScrollView>
  );
};

export default HomePage;
