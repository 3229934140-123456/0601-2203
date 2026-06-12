import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { mockMemberList, DEPARTMENT_OPTIONS, GRADE_OPTIONS, INTEREST_OPTIONS } from '@/data/mockMember';
import { Member, Department, Grade, Interest } from '@/types';
import MemberCard from '@/components/MemberCard';

const ContactsPage: React.FC = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedDept, setSelectedDept] = useState<Department | 'all'>('all');
  const [selectedGrade, setSelectedGrade] = useState<Grade | 'all'>('all');
  const [selectedInterest, setSelectedInterest] = useState<Interest | 'all'>('all');
  const [memberList] = useState<Member[]>(mockMemberList);

  useDidShow(() => {
    console.log('[Contacts] Page did show');
  });

  const filteredList = useMemo(() => {
    return memberList.filter((member) => {
      const matchDept = selectedDept === 'all' || member.department === selectedDept;
      const matchGrade = selectedGrade === 'all' || member.grade === selectedGrade;
      const matchInterest = selectedInterest === 'all' || member.interests.includes(selectedInterest);
      const matchKeyword = !searchKeyword ||
        member.name.includes(searchKeyword) ||
        member.major.includes(searchKeyword) ||
        member.department.includes(searchKeyword);
      return matchDept && matchGrade && matchInterest && matchKeyword;
    });
  }, [memberList, selectedDept, selectedGrade, selectedInterest, searchKeyword]);

  const handleRefresh = () => {
    console.log('[Contacts] Pull down refresh');
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
      <View className={styles.searchBar}>
        <Text className={styles.searchIcon}>🔍</Text>
        <Input
          className={styles.searchInput}
          placeholder="搜索成员姓名、专业..."
          value={searchKeyword}
          onInput={(e) => setSearchKeyword(e.detail.value)}
          confirmType="search"
        />
      </View>

      <View className={styles.filterSection}>
        <Text className={styles.filterLabel}>部门筛选</Text>
        <ScrollView scrollX className={styles.filterRow}>
          <Text
            className={classnames(
              styles.filterChip,
              selectedDept === 'all' && styles.filterChipActive
            )}
            onClick={() => setSelectedDept('all')}
          >
            全部
          </Text>
          {DEPARTMENT_OPTIONS.map((dept) => (
            <Text
              key={dept}
              className={classnames(
                styles.filterChip,
                selectedDept === dept && styles.filterChipActive
              )}
              onClick={() => setSelectedDept(dept)}
            >
              {dept}
            </Text>
          ))}
        </ScrollView>
      </View>

      <View className={styles.filterSection}>
        <Text className={styles.filterLabel}>年级筛选</Text>
        <ScrollView scrollX className={styles.filterRow}>
          <Text
            className={classnames(
              styles.filterChip,
              selectedGrade === 'all' && styles.filterChipActive
            )}
            onClick={() => setSelectedGrade('all')}
          >
            全部
          </Text>
          {GRADE_OPTIONS.map((grade) => (
            <Text
              key={grade}
              className={classnames(
                styles.filterChip,
                selectedGrade === grade && styles.filterChipActive
              )}
              onClick={() => setSelectedGrade(grade)}
            >
              {grade}
            </Text>
          ))}
        </ScrollView>
      </View>

      <View className={styles.filterSection}>
        <Text className={styles.filterLabel}>兴趣筛选</Text>
        <ScrollView scrollX className={styles.filterRow}>
          <Text
            className={classnames(
              styles.filterChip,
              selectedInterest === 'all' && styles.filterChipActive
            )}
            onClick={() => setSelectedInterest('all')}
          >
            全部
          </Text>
          {INTEREST_OPTIONS.map((interest) => (
            <Text
              key={interest}
              className={classnames(
                styles.filterChip,
                selectedInterest === interest && styles.filterChipActive
              )}
              onClick={() => setSelectedInterest(interest)}
            >
              {interest}
            </Text>
          ))}
        </ScrollView>
      </View>

      <View className={styles.sectionHeader}>
        <Text className={styles.sectionTitle}>成员列表</Text>
        <Text className={styles.countBadge}>{filteredList.length} 人</Text>
      </View>

      <View className={styles.listContainer}>
        {filteredList.length > 0 ? (
          filteredList.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))
        ) : (
          <View className="emptyState">
            <Text className="emptyIcon">👥</Text>
            <Text className="emptyText">暂无符合条件的成员</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default ContactsPage;
