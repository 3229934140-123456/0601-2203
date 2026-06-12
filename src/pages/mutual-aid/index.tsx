import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { mockMutualAidList } from '@/data/mockMutualAid';
import { MutualAid } from '@/types';
import AidCard from '@/components/AidCard';

const TYPE_FILTERS = [
  { value: 'all', label: '全部' },
  { value: 'borrow', label: '借物' },
  { value: 'carpool', label: '拼车' },
  { value: 'material', label: '资料' },
  { value: 'skill', label: '技能' },
];

const STATUS_FILTERS = [
  { value: 'all', label: '全部状态' },
  { value: 'open', label: '待认领' },
  { value: 'claimed', label: '已认领' },
  { value: 'completed', label: '已完成' },
];

const MutualAidPage: React.FC = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeType, setActiveType] = useState('all');
  const [activeStatus, setActiveStatus] = useState('all');
  const aidList = mockMutualAidList;

  useDidShow(() => {
    console.log('[MutualAid] Page did show');
  });

  const filteredList = useMemo(() => {
    return aidList.filter((aid) => {
      const matchType = activeType === 'all' || aid.type === activeType;
      const matchStatus = activeStatus === 'all' || aid.status === activeStatus;
      const matchKeyword = !searchKeyword ||
        aid.title.includes(searchKeyword) ||
        aid.description.includes(searchKeyword);
      return matchType && matchStatus && matchKeyword;
    });
  }, [aidList, activeType, activeStatus, searchKeyword]);

  const handlePublish = () => {
    console.log('[MutualAid] Publish button clicked');
    Taro.navigateTo({ url: '/pages/publish-aid/index' });
  };

  const handleRefresh = () => {
    console.log('[MutualAid] Pull down refresh');
    setTimeout(() => {
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 1000);
  };

  return (
    <ScrollView
      scrollY
      className={`pageContainer ${styles.page}`}
      refresherEnabled
      onRefresherRefresh={handleRefresh}
    >
      <View className={styles.header}>
        <View className={styles.searchBar}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder="搜索求助内容..."
            value={searchKeyword}
            onInput={(e) => setSearchKeyword(e.detail.value)}
            confirmType="search"
          />
        </View>
      </View>

      <ScrollView scrollX className={styles.filterBar}>
        {TYPE_FILTERS.map((filter) => (
          <Text
            key={filter.value}
            className={classnames(
              styles.filterItem,
              activeType === filter.value && styles.filterActive
            )}
            onClick={() => setActiveType(filter.value)}
          >
            {filter.label}
          </Text>
        ))}
      </ScrollView>

      <ScrollView scrollX className={styles.filterBar} style={{ marginBottom: 0 }}>
        {STATUS_FILTERS.map((filter) => (
          <Text
            key={filter.value}
            className={classnames(
              styles.filterItem,
              activeStatus === filter.value && styles.filterActive
            )}
            onClick={() => setActiveStatus(filter.value)}
          >
            {filter.label}
          </Text>
        ))}
      </ScrollView>

      <View className={styles.listContent} style={{ marginTop: 32 }}>
        {filteredList.length > 0 ? (
          filteredList.map((aid) => <AidCard key={aid.id} aid={aid} />)
        ) : (
          <View className="emptyState">
            <Text className="emptyIcon">📭</Text>
            <Text className="emptyText">暂无相关求助信息</Text>
          </View>
        )}
      </View>

      <View className={styles.fab} onClick={handlePublish}>
        <Text className={styles.fabIcon}>+</Text>
      </View>
    </ScrollView>
  );
};

export default MutualAidPage;
