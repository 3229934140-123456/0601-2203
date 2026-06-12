import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView, Input } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppStore, RosterMember } from '@/store/useAppStore';
import { Activity, VolunteerPosition } from '@/types';
import { formatDateTime, formatTimeRange } from '@/utils/format';

const ROSTER_FILTERS = [
  { value: 'all', label: '全部' },
  { value: 'checked', label: '已签到' },
  { value: 'unchecked', label: '待签到' },
];

const ActivityDetailPage: React.FC = () => {
  const router = useRouter();
  const activityId = router.params.id;
  const currentUser = useAppStore(s => s.currentUser);
  const activityList = useAppStore(s => s.activityList);
  const hasCheckedIn = useAppStore(s => s.hasCheckedIn);
  const getAbsentMembers = useAppStore(s => s.getAbsentMembers);
  const getRoster = useAppStore(s => s.getRoster);
  const getCheckInRecords = useAppStore(s => s.getCheckInRecords);
  const signUpActivity = useAppStore(s => s.signUpActivity);
  const cancelSignUp = useAppStore(s => s.cancelSignUp);
  const checkIn = useAppStore(s => s.checkIn);
  const sendReminder = useAppStore(s => s.sendReminder);

  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [checkInInput, setCheckInInput] = useState('');
  const [rosterFilter, setRosterFilter] = useState('all');
  const [rosterPositionFilter, setRosterPositionFilter] = useState<string>('all');

  const activity = useMemo<Activity | undefined>(() => {
    return activityList.find(a => a.id === activityId);
  }, [activityList, activityId]);

  const isSignedUp = activity?.signedParticipants.includes(currentUser.id) || false;
  const isCheckedIn = activity ? hasCheckedIn(activity.id, currentUser.id) : false;
  const absentMembers = activity ? getAbsentMembers(activity.id) : [];
  const fullRoster = activity ? getRoster(activity.id) : [];
  const checkInRecords = activity ? getCheckInRecords(activity.id) : [];

  const filteredRoster = useMemo(() => {
    let list = fullRoster;
    if (rosterFilter === 'checked') {
      list = list.filter(m => m.checkedIn);
    } else if (rosterFilter === 'unchecked') {
      list = list.filter(m => !m.checkedIn);
    }
    if (rosterPositionFilter !== 'all') {
      list = list.filter(m => m.positionId === rosterPositionFilter || (!m.positionId && rosterPositionFilter === 'none'));
    }
    return list;
  }, [fullRoster, rosterFilter, rosterPositionFilter]);

  useDidShow(() => {
    console.log('[ActivityDetail] Page did show, activityId:', activityId);
    setSelectedPosition(null);
  });

  const getStatusClass = () => {
    switch (activity?.status) {
      case 'upcoming': return styles.statusUpcoming;
      case 'ongoing': return styles.statusOngoing;
      case 'ended': return styles.statusEnded;
      default: return styles.statusUpcoming;
    }
  };

  const getStatusLabel = () => {
    switch (activity?.status) {
      case 'upcoming': return '即将开始';
      case 'ongoing': return '进行中';
      case 'ended': return '已结束';
      default: return '即将开始';
    }
  };

  const handleSignUp = () => {
    if (!activity) return;

    if (activity.status !== 'upcoming') {
      Taro.showToast({ title: '该活动已结束或正在进行', icon: 'none' });
      return;
    }

    if (isSignedUp) {
      Taro.showModal({
        title: '取消报名',
        content: '确定要取消报名吗？',
        success: (res) => {
          if (res.confirm && activity) {
            const ok = cancelSignUp(activity.id, currentUser.id);
            if (ok) {
              setSelectedPosition(null);
              Taro.showToast({ title: '已取消报名', icon: 'success' });
            } else {
              Taro.showToast({ title: '取消失败', icon: 'none' });
            }
          }
        },
      });
      return;
    }

    if (activity.positions.length > 0 && !selectedPosition) {
      Taro.showToast({ title: '请先选择志愿岗位', icon: 'none' });
      return;
    }

    Taro.showModal({
      title: '确认报名',
      content: selectedPosition
        ? `确定要报名"${activity.positions.find(p => p.id === selectedPosition)?.name}"岗位吗？`
        : '确定要报名参加这个活动吗？',
      success: (res) => {
        if (res.confirm && activity) {
          const result = signUpActivity(activity.id, selectedPosition, currentUser.id, currentUser.name);
          if (result.success) {
            setSelectedPosition(null);
          }
          Taro.showToast({ title: result.message, icon: result.success ? 'success' : 'none' });
        }
      },
    });
  };

  const handleCheckIn = () => {
    if (!activity) return;
    if (!activity.checkInCode) {
      Taro.showToast({ title: '活动未开启签到', icon: 'none' });
      return;
    }
    if (!checkInInput.trim()) {
      Taro.showToast({ title: '请输入签到码', icon: 'none' });
      return;
    }
    const result = checkIn(activity.id, currentUser.id, checkInInput.trim());
    Taro.showToast({ title: result.message, icon: result.success ? 'success' : 'none' });
    if (result.success) {
      setCheckInInput('');
    }
  };

  const handleRemind = () => {
    if (!currentUser.isPresident) {
      Taro.showToast({ title: '仅社长可发送提醒', icon: 'none' });
      return;
    }
    if (!activity) return;
    if (activity.reminded) {
      Taro.showToast({ title: '提醒已发送，请勿重复', icon: 'none' });
      return;
    }
    Taro.showModal({
      title: '发送提醒',
      content: `确定要向${absentMembers.length}位未签到成员发送活动提醒吗？`,
      success: (res) => {
        if (res.confirm && activity) {
          const result = sendReminder(activity.id);
          if (result.success) {
            Taro.showToast({ title: `已向${result.absentCount}人发送提醒`, icon: 'success' });
          }
        }
      },
    });
  };

  const handleMemberClick = (userId: string) => {
    Taro.navigateTo({ url: `/pages/member-detail/index?id=${userId}` });
  };

  if (!activity) {
    return (
      <View className="pageContainer">
        <View className="emptyState">
          <Text className="emptyIcon">❓</Text>
          <Text className="emptyText">活动不存在或已删除</Text>
        </View>
      </View>
    );
  }

  const progressPercent = Math.round((activity.signedParticipants.length / activity.maxParticipants) * 100);

  return (
    <ScrollView scrollY className={`pageContainer ${styles.page}`}>
      <View className={styles.detailCard}>
        <View className={styles.header}>
          <Text className={styles.title}>{activity.title}</Text>
          <View className={styles.statusRow}>
            <Text className={classnames(styles.statusBadge, getStatusClass())}>
              {getStatusLabel()}
            </Text>
            {activity.reminded && (
              <Text className={classnames('tag', 'tagInfo')} style={{ marginLeft: 8 }}>
                🔔 已提醒
              </Text>
            )}
          </View>
        </View>

        <View className={styles.metaList}>
          <View className={styles.metaItem}>
            <Text className={styles.metaIcon}>⏰</Text>
            <Text className={styles.metaLabel}>活动时间</Text>
            <Text className={styles.metaValue}>
              {formatTimeRange(activity.startTime, activity.endTime)}
            </Text>
          </View>
          <View className={styles.metaItem}>
            <Text className={styles.metaIcon}>📍</Text>
            <Text className={styles.metaLabel}>活动地点</Text>
            <Text className={styles.metaValue}>{activity.location}</Text>
          </View>
          <View className={styles.metaItem}>
            <Text className={styles.metaIcon}>⏳</Text>
            <Text className={styles.metaLabel}>报名截止</Text>
            <Text className={styles.metaValue}>{formatDateTime(activity.signUpDeadline)}</Text>
          </View>
          {activity.checkInCode && (
            <View className={styles.metaItem}>
              <Text className={styles.metaIcon}>🔐</Text>
              <Text className={styles.metaLabel}>签到方式</Text>
              <Text className={styles.metaValue}>签到码签到</Text>
            </View>
          )}
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

        <View className={styles.organizer}>
          <Image
            className={styles.organizerAvatar}
            src={`https://picsum.photos/id/100/200/200`}
            mode="aspectFill"
          />
          <View className={styles.organizerInfo}>
            <Text className={styles.organizerName}>{activity.organizerName}</Text>
            <Text className={styles.organizerRole}>活动组织者</Text>
          </View>
        </View>
      </View>

      {activity.checkInCode && (activity.status === 'upcoming' || activity.status === 'ongoing') && (
        <View className={styles.checkInCard}>
          {currentUser.isPresident ? (
            <>
              <Text className={styles.checkInTitle}>活动签到码</Text>
              <Text className={styles.checkInCode}>{activity.checkInCode}</Text>
              <Text className={styles.checkInTime}>
                签到开始时间：{formatDateTime(activity.checkInStartTime || activity.startTime)}
              </Text>
            </>
          ) : (
            <>
              <Text className={styles.checkInTitle}>活动签到</Text>
              {isCheckedIn ? (
                <View className={styles.checkedIn}>
                  <Text className={styles.checkedInIcon}>✅</Text>
                  <Text className={styles.checkedInText}>您已完成签到</Text>
                </View>
              ) : (
                <>
                  <View className={styles.checkInInputRow}>
                    <Input
                      className={styles.checkInInput}
                      placeholder="请输入签到码"
                      value={checkInInput}
                      onInput={(e) => setCheckInInput(e.detail.value)}
                      maxlength={20}
                    />
                    <Text className={styles.checkInBtn} onClick={handleCheckIn}>
                      签到
                    </Text>
                  </View>
                  <Text className={styles.checkInTip}>
                    请向社长获取签到码后完成签到
                  </Text>
                </>
              )}
            </>
          )}
        </View>
      )}

      {activity.positions.length > 0 && activity.status === 'upcoming' && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>志愿岗位</Text>
          {activity.positions.map((position: VolunteerPosition) => {
            const isFull = position.signedCount >= position.requiredCount;
            const posPercent = Math.round((position.signedCount / position.requiredCount) * 100);
            const userSignedThis = position.signedMembers.includes(currentUser.id);
            return (
              <View
                key={position.id}
                className={classnames(
                  styles.positionCard,
                  (selectedPosition === position.id || userSignedThis) && styles.positionActive,
                  isFull && !userSignedThis && styles.positionDisabled
                )}
                onClick={() => !isSignedUp && !isFull && setSelectedPosition(position.id)}
              >
                <View className={styles.positionHeader}>
                  <Text className={styles.positionName}>
                    {position.name}
                    {userSignedThis && <Text style={{ color: '#22c55e', marginLeft: 8 }}>（已选）</Text>}
                  </Text>
                  <Text className={styles.positionProgress}>
                    {position.signedCount}/{position.requiredCount}
                  </Text>
                </View>
                <Text className={styles.positionDesc}>{position.description}</Text>
                <View className={styles.positionProgressBar}>
                  <View
                    className={classnames(styles.positionProgressFill, isFull && styles.positionProgressFull)}
                    style={{ width: `${posPercent}%` }}
                  />
                </View>
              </View>
            );
          })}
        </View>
      )}

      {currentUser.isPresident && activity.signedParticipants.length > 0 && (
        <View className={styles.section}>
          <View className={styles.sectionHeaderRow}>
            <Text className={styles.sectionTitle}>
              报名名单
              <Text style={{ fontSize: 24, color: '#64748b', fontWeight: 'normal', marginLeft: 8 }}>
                {activity.signedParticipants.length}人
              </Text>
            </Text>
            {checkInRecords.length > 0 && (
              <Text className={styles.checkInCount}>
                已签到 {checkInRecords.length}
              </Text>
            )}
          </View>

          <ScrollView scrollX className={styles.filterRow}>
            {ROSTER_FILTERS.map((f) => (
              <Text
                key={f.value}
                className={classnames(styles.filterTag, rosterFilter === f.value && styles.filterTagActive)}
                onClick={() => setRosterFilter(f.value)}
              >
                {f.label}
              </Text>
            ))}
            {activity.positions.length > 0 && (
              <>
                <Text
                  className={classnames(styles.filterTag, rosterPositionFilter === 'all' && styles.filterTagActive)}
                  onClick={() => setRosterPositionFilter('all')}
                >
                  全部岗位
                </Text>
                {activity.positions.map((pos) => (
                  <Text
                    key={pos.id}
                    className={classnames(styles.filterTag, rosterPositionFilter === pos.id && styles.filterTagActive)}
                    onClick={() => setRosterPositionFilter(pos.id)}
                  >
                    {pos.name}
                  </Text>
                ))}
                <Text
                  className={classnames(styles.filterTag, rosterPositionFilter === 'none' && styles.filterTagActive)}
                  onClick={() => setRosterPositionFilter('none')}
                >
                  无岗位
                </Text>
              </>
            )}
          </ScrollView>

          {filteredRoster.length > 0 ? (
            <View className={styles.rosterList}>
              {filteredRoster.map((member: RosterMember) => (
                <View
                  key={member.userId}
                  className={styles.rosterItem}
                  onClick={() => handleMemberClick(member.userId)}
                >
                  <Image className={styles.rosterAvatar} src={member.avatar} mode="aspectFill" />
                  <View className={styles.rosterInfo}>
                    <View className={styles.rosterNameRow}>
                      <Text className={styles.rosterName}>{member.name}</Text>
                      {member.checkedIn ? (
                        <Text className={classnames('tag', 'tagSuccess')}>✅ 已签到</Text>
                      ) : (
                        <Text className={classnames('tag', 'tagWarning')}>待签到</Text>
                      )}
                    </View>
                    <Text className={styles.rosterDetail}>
                      {member.positionName ? `岗位：${member.positionName}` : '普通参与'}
                      {' · '}{member.department}
                    </Text>
                    {member.checkedIn && member.checkInTime && (
                      <Text className={styles.rosterCheckInTime}>
                        签到时间：{formatDateTime(member.checkInTime)}
                      </Text>
                    )}
                  </View>
                  <Text className={styles.rosterArrow}>›</Text>
                </View>
              ))}
            </View>
          ) : (
            <View className="emptyState" style={{ padding: '40rpx 0' }}>
              <Text className="emptyText">无匹配成员</Text>
            </View>
          )}
        </View>
      )}

      {(activity.status === 'ongoing' || activity.status === 'ended') && currentUser.isPresident && checkInRecords.length > 0 && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            签到记录
            <Text style={{ fontSize: 24, color: '#22c55e', fontWeight: 'normal', marginLeft: 8 }}>
              {checkInRecords.length}人
            </Text>
          </Text>
          {checkInRecords.map((member: RosterMember) => (
            <View key={member.userId} className={styles.checkInRecordItem}>
              <Image className={styles.checkInRecordAvatar} src={member.avatar} mode="aspectFill" />
              <View className={styles.checkInRecordInfo}>
                <Text className={styles.checkInRecordName}>{member.name}</Text>
                <Text className={styles.checkInRecordTime}>
                  {member.checkInTime ? formatDateTime(member.checkInTime) : '未知时间'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {(activity.status === 'ongoing' || activity.status === 'ended') && currentUser.isPresident && absentMembers.length > 0 && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            缺席名单
            <Text style={{ fontSize: 24, color: '#ef4444', fontWeight: 'normal', marginLeft: 8 }}>
              {absentMembers.length}人
            </Text>
          </Text>
          <View className={styles.absentList}>
            {absentMembers.map((member) => (
              <View key={member.id} className={styles.absentItem} onClick={() => handleMemberClick(member.id)}>
                <Image className={styles.absentAvatar} src={member.avatar} mode="aspectFill" />
                <View className={styles.absentInfo}>
                  <Text className={styles.absentName}>{member.name}</Text>
                  <Text className={styles.absentDept}>{member.department} · {member.position}</Text>
                </View>
                <Text className={styles.rosterArrow}>›</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {(activity.status === 'ongoing' || activity.status === 'ended') && currentUser.isPresident && absentMembers.length === 0 && activity.signedParticipants.length > 0 && (
        <View className="emptyState" style={{ padding: '40rpx 0' }}>
          <Text className="emptyIcon">🎉</Text>
          <Text className="emptyText">全员签到，无缺席</Text>
        </View>
      )}

      <View className={styles.footer}>
        {activity.status === 'upcoming' && (
          <>
            {currentUser.isPresident && (
              <Text
                className={classnames(styles.footerBtn, styles.btnOutline, activity.reminded && styles.footerBtnDisabled)}
                onClick={handleRemind}
              >
                {activity.reminded ? '已发送提醒' : '发送提醒'}
              </Text>
            )}
            <Text
              className={classnames(
                styles.footerBtn,
                isSignedUp ? styles.btnOutline : styles.btnPrimary
              )}
              onClick={handleSignUp}
            >
              {isSignedUp ? '取消报名' : '立即报名'}
            </Text>
          </>
        )}
        {activity.status === 'ongoing' && (
          <>
            {currentUser.isPresident && (
              <Text className={classnames(styles.footerBtn, styles.btnOutline)} onClick={handleRemind}>
                {activity.reminded ? '已发提醒' : `提醒缺席(${absentMembers.length})`}
              </Text>
            )}
            {activity.checkInCode && !isCheckedIn && !currentUser.isPresident ? (
              <Text className={classnames(styles.footerBtn, styles.btnPrimary)} onClick={handleCheckIn}>
                立即签到
              </Text>
            ) : isCheckedIn ? (
              <Text className={classnames(styles.footerBtn, styles.btnDisabled)}>
                ✅ 已签到
              </Text>
            ) : (
              <Text className={classnames(styles.footerBtn, styles.btnDisabled)}>
                活动进行中
              </Text>
            )}
          </>
        )}
        {activity.status === 'ended' && (
          <Text className={classnames(styles.footerBtn, styles.btnDisabled)}>
            活动已结束
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

export default ActivityDetailPage;
