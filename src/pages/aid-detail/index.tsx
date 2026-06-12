import React, { useState } from 'react';
import { View, Text, Image, ScrollView, Input } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { mockMutualAidList } from '@/data/mockMutualAid';
import { MutualAid } from '@/types';
import { formatDateTime, formatRelativeTime } from '@/utils/format';
import { useUserStore } from '@/store/useUserStore';

const AidDetailPage: React.FC = () => {
  const router = useRouter();
  const { currentUser } = useUserStore();
  const [aid, setAid] = useState<MutualAid | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isCollected, setIsCollected] = useState(false);

  useDidShow(() => {
    console.log('[AidDetail] Page did show');
    const id = router.params.id;
    const foundAid = mockMutualAidList.find(a => a.id === id);
    if (foundAid) {
      setAid(foundAid);
      setIsLiked(foundAid.isLiked);
      setIsCollected(foundAid.isCollected);
    }
  });

  const getTagClass = () => {
    switch (aid?.type) {
      case 'borrow': return 'tagBorrow';
      case 'carpool': return 'tagCarpool';
      case 'material': return 'tagMaterial';
      case 'skill': return 'tagSkill';
      default: return 'tagBorrow';
    }
  };

  const getStatusClass = () => {
    switch (aid?.status) {
      case 'open': return styles.statusOpen;
      case 'claimed': return styles.statusClaimed;
      case 'completed': return styles.statusCompleted;
      default: return styles.statusOpen;
    }
  };

  const getStatusLabel = () => {
    switch (aid?.status) {
      case 'open': return '待认领';
      case 'claimed': return '已认领';
      case 'completed': return '已完成';
      default: return '待认领';
    }
  };

  const getTypeLabel = () => {
    switch (aid?.type) {
      case 'borrow': return '借物';
      case 'carpool': return '拼车';
      case 'material': return '资料';
      case 'skill': return '技能';
      default: return '借物';
    }
  };

  const handleClaim = () => {
    if (aid?.publisherId === currentUser.id) {
      Taro.showToast({ title: '不能认领自己发布的求助', icon: 'none' });
      return;
    }
    if (aid?.status !== 'open') {
      Taro.showToast({ title: '该求助已被认领', icon: 'none' });
      return;
    }
    Taro.showModal({
      title: '确认认领',
      content: '确定要认领这条求助吗？认领后请及时联系发布者完成互助。',
      success: (res) => {
        if (res.confirm) {
          console.log('[AidDetail] Claim aid:', aid?.id);
          Taro.showToast({ title: '认领成功', icon: 'success' });
          if (aid) {
            setAid({
              ...aid,
              status: 'claimed',
              claimantId: currentUser.id,
              claimantName: currentUser.name,
            });
          }
        }
      },
    });
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (aid) {
      setAid({
        ...aid,
        isLiked: !isLiked,
        likes: isLiked ? aid.likes - 1 : aid.likes + 1,
      });
    }
  };

  const handleCollect = () => {
    setIsCollected(!isCollected);
    Taro.showToast({
      title: isCollected ? '已取消收藏' : '收藏成功',
      icon: 'success',
    });
  };

  const handleSendComment = () => {
    if (!commentText.trim()) {
      Taro.showToast({ title: '请输入评论内容', icon: 'none' });
      return;
    }
    console.log('[AidDetail] Send comment:', commentText);
    const newComment = {
      id: `comment-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content: commentText.trim(),
      createdAt: new Date().toISOString(),
    };
    if (aid) {
      setAid({
        ...aid,
        comments: [...aid.comments, newComment],
      });
    }
    setCommentText('');
    Taro.showToast({ title: '评论成功', icon: 'success' });
  };

  const handleContact = () => {
    if (aid?.contact) {
      Taro.setClipboardData({
        data: aid.contact,
        success: () => {
          Taro.showToast({ title: '联系方式已复制', icon: 'success' });
        },
      });
    }
  };

  if (!aid) {
    return (
      <View className="pageContainer">
        <View className="emptyState">
          <Text className="emptyIcon">❓</Text>
          <Text className="emptyText">加载中...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView scrollY className={`pageContainer ${styles.page}`}>
      <View className={styles.detailCard}>
        <View className={styles.header}>
          <View style={{ flex: 1 }}>
            <View className={styles.titleRow}>
              <Text className={classnames('tag', getTagClass(), styles.typeTag)}>
                {getTypeLabel()}
              </Text>
              <Text className={styles.title}>{aid.title}</Text>
            </View>
          </View>
          <Text className={classnames(styles.statusBadge, getStatusClass())}>
            {getStatusLabel()}
          </Text>
        </View>

        <View className={styles.metaList}>
          <View className={styles.metaItem}>
            <Text className={styles.metaIcon}>📍</Text>
            <Text className={styles.metaLabel}>地点</Text>
            <Text className={styles.metaValue}>{aid.location}</Text>
          </View>
          <View className={styles.metaItem}>
            <Text className={styles.metaIcon}>⏰</Text>
            <Text className={styles.metaLabel}>有效期至</Text>
            <Text className={styles.metaValue}>{formatDateTime(aid.validUntil)}</Text>
          </View>
          <View className={styles.metaItem}>
            <Text className={styles.metaIcon}>📞</Text>
            <Text className={styles.metaLabel}>联系方式</Text>
            <Text
              className={classnames(styles.metaValue, { [styles.interactionActive]: true })}
              onClick={handleContact}
            >
              {aid.contact}（点击复制）
            </Text>
          </View>
          {aid.claimantName && (
            <View className={styles.metaItem}>
              <Text className={styles.metaIcon}>🤝</Text>
              <Text className={styles.metaLabel}>认领人</Text>
              <Text className={styles.metaValue}>{aid.claimantName}</Text>
            </View>
          )}
        </View>

        <Text className={styles.description}>{aid.description}</Text>

        <View className={styles.interactionBar}>
          <View
            className={classnames(styles.interactionItem, isLiked && styles.interactionActive)}
            onClick={handleLike}
          >
            <Text className={styles.interactionIcon}>{isLiked ? '❤️' : '🤍'}</Text>
            <Text className={styles.interactionText}>{aid.likes} 点赞</Text>
          </View>
          <View className={styles.interactionItem}>
            <Text className={styles.interactionIcon}>💬</Text>
            <Text className={styles.interactionText}>{aid.comments.length} 评论</Text>
          </View>
          <View
            className={classnames(styles.interactionItem, isCollected && styles.interactionActive)}
            onClick={handleCollect}
          >
            <Text className={styles.interactionIcon}>{isCollected ? '⭐' : '☆'}</Text>
            <Text className={styles.interactionText}>收藏</Text>
          </View>
        </View>

        <View className={styles.actionRow}>
          {aid.status === 'open' && aid.publisherId !== currentUser.id && (
            <Text className={classnames(styles.actionBtn, styles.btnPrimary)} onClick={handleClaim}>
              我来帮忙
            </Text>
          )}
          {aid.status === 'claimed' && aid.claimantId === currentUser.id && (
            <Text className={classnames(styles.actionBtn, styles.btnPrimary)}>
              确认完成
            </Text>
          )}
          {aid.publisherId === currentUser.id && (
            <Text className={classnames(styles.actionBtn, styles.btnOutline)}>
              编辑求助
            </Text>
          )}
          <Text className={classnames(styles.actionBtn, styles.btnSecondary)} onClick={handleContact}>
            复制联系方式
          </Text>
        </View>

        <View className={styles.publisher}>
          <Image className={styles.avatar} src={aid.publisherAvatar} mode="aspectFill" />
          <View className={styles.publisherInfo}>
            <Text className={styles.publisherName}>{aid.publisherName}</Text>
            <Text className={styles.publishTime}>发布于 {formatRelativeTime(aid.createdAt)}</Text>
          </View>
        </View>
      </View>

      <View className={styles.commentsSection}>
        <Text className={styles.sectionTitle}>
          评论 ({aid.comments.length})
        </Text>
        {aid.comments.length > 0 ? (
          aid.comments.map((comment) => (
            <View key={comment.id} className={styles.commentItem}>
              <Image
                className={styles.commentAvatar}
                src={comment.userAvatar}
                mode="aspectFill"
              />
              <View className={styles.commentContent}>
                <View className={styles.commentHeader}>
                  <Text className={styles.commentName}>{comment.userName}</Text>
                  <Text className={styles.commentTime}>{formatRelativeTime(comment.createdAt)}</Text>
                </View>
                <Text className={styles.commentText}>{comment.content}</Text>
              </View>
            </View>
          ))
        ) : (
          <View className="emptyState" style={{ padding: '60rpx 0' }}>
            <Text className="emptyIcon">💬</Text>
            <Text className="emptyText">暂无评论，快来抢沙发吧</Text>
          </View>
        )}

        <View className={styles.commentInputRow}>
          <Input
            className={styles.commentInput}
            placeholder="发表评论..."
            value={commentText}
            onInput={(e) => setCommentText(e.detail.value)}
            confirmType="send"
            onConfirm={handleSendComment}
          />
          <Text className={styles.sendBtn} onClick={handleSendComment}>
            发送
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default AidDetailPage;
