import React, { useState } from 'react';
import { View, Text, Input, Textarea, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useUserStore } from '@/store/useUserStore';

interface PositionForm {
  id: string;
  name: string;
  description: string;
  requiredCount: string;
}

const CreateActivityPage: React.FC = () => {
  const { currentUser } = useUserStore();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    startTime: '',
    endTime: '',
    signUpDeadline: '',
    maxParticipants: '50',
    needCheckIn: true,
    checkInCode: '',
  });
  const [positions, setPositions] = useState<PositionForm[]>([]);

  useDidShow(() => {
    console.log('[CreateActivity] Page did show');
    if (!currentUser.isPresident) {
      Taro.showToast({ title: '仅社长可创建活动', icon: 'none' });
      setTimeout(() => Taro.navigateBack(), 1500);
    }
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handlePositionChange = (id: string, field: string, value: string) => {
    setPositions(positions.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const addPosition = () => {
    const newPosition: PositionForm = {
      id: `pos-${Date.now()}`,
      name: '',
      description: '',
      requiredCount: '5',
    };
    setPositions([...positions, newPosition]);
  };

  const removePosition = (id: string) => {
    setPositions(positions.filter(p => p.id !== id));
  };

  const toggleCheckIn = () => {
    setFormData({ ...formData, needCheckIn: !formData.needCheckIn });
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      Taro.showToast({ title: '请输入活动标题', icon: 'none' });
      return;
    }
    if (!formData.description.trim()) {
      Taro.showToast({ title: '请输入活动描述', icon: 'none' });
      return;
    }
    if (!formData.location.trim()) {
      Taro.showToast({ title: '请输入活动地点', icon: 'none' });
      return;
    }
    if (!formData.startTime) {
      Taro.showToast({ title: '请选择开始时间', icon: 'none' });
      return;
    }
    if (!formData.endTime) {
      Taro.showToast({ title: '请选择结束时间', icon: 'none' });
      return;
    }
    if (!formData.signUpDeadline) {
      Taro.showToast({ title: '请选择报名截止时间', icon: 'none' });
      return;
    }

    const invalidPositions = positions.filter(p => !p.name.trim() || !p.requiredCount);
    if (invalidPositions.length > 0) {
      Taro.showToast({ title: '请完善岗位信息', icon: 'none' });
      return;
    }

    if (formData.needCheckIn && !formData.checkInCode.trim()) {
      Taro.showToast({ title: '请输入签到码', icon: 'none' });
      return;
    }

    console.log('[CreateActivity] Submit form:', { formData, positions });
    Taro.showModal({
      title: '创建成功',
      content: '活动已成功创建，成员可开始报名',
      showCancel: false,
      success: () => {
        Taro.navigateBack();
      },
    });
  };

  const isFormValid = formData.title.trim() && formData.description.trim() &&
    formData.location.trim() && formData.startTime && formData.endTime &&
    formData.signUpDeadline;

  return (
    <ScrollView scrollY className={`pageContainer ${styles.page}`}>
      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>基本信息</Text>

        <View className={styles.formItem}>
          <Text className={styles.label}>
            <Text className={styles.required}>*</Text>活动标题
          </Text>
          <Input
            className={styles.input}
            placeholder="请输入活动标题"
            value={formData.title}
            onInput={(e) => handleInputChange('title', e.detail.value)}
            maxlength={50}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>
            <Text className={styles.required}>*</Text>活动描述
          </Text>
          <Textarea
            className={styles.textarea}
            placeholder="请详细描述活动内容、注意事项等..."
            value={formData.description}
            onInput={(e) => handleInputChange('description', e.detail.value)}
            maxlength={1000}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>
            <Text className={styles.required}>*</Text>活动地点
          </Text>
          <Input
            className={styles.input}
            placeholder="请输入活动地点"
            value={formData.location}
            onInput={(e) => handleInputChange('location', e.detail.value)}
          />
        </View>
      </View>

      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>时间设置</Text>

        <View className={styles.inputRow}>
          <View className={classnames(styles.formItem, styles.inputGroup)}>
            <Text className={styles.label}>
              <Text className={styles.required}>*</Text>开始时间
            </Text>
            <Input
              className={styles.input}
              type="text"
              placeholder="选择开始时间"
              value={formData.startTime}
              onInput={(e) => handleInputChange('startTime', e.detail.value)}
            />
          </View>

          <View className={classnames(styles.formItem, styles.inputGroup)}>
            <Text className={styles.label}>
              <Text className={styles.required}>*</Text>结束时间
            </Text>
            <Input
              className={styles.input}
              type="text"
              placeholder="选择结束时间"
              value={formData.endTime}
              onInput={(e) => handleInputChange('endTime', e.detail.value)}
            />
          </View>
        </View>

        <View className={styles.inputRow}>
          <View className={classnames(styles.formItem, styles.inputGroup)}>
            <Text className={styles.label}>
              <Text className={styles.required}>*</Text>报名截止
            </Text>
            <Input
              className={styles.input}
              type="text"
              placeholder="选择截止时间"
              value={formData.signUpDeadline}
              onInput={(e) => handleInputChange('signUpDeadline', e.detail.value)}
            />
          </View>

          <View className={classnames(styles.formItem, styles.inputGroup)}>
            <Text className={styles.label}>
              <Text className={styles.required}>*</Text>最大人数
            </Text>
            <Input
              className={styles.input}
              type="number"
              placeholder="50"
              value={formData.maxParticipants}
              onInput={(e) => handleInputChange('maxParticipants', e.detail.value)}
            />
          </View>
        </View>
      </View>

      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>志愿岗位（可选）</Text>

        {positions.map((position) => (
          <View key={position.id} className={styles.positionItem}>
            <View className={styles.positionHeader}>
              <Input
                className={styles.positionName}
                placeholder="岗位名称"
                value={position.name}
                onInput={(e) => handlePositionChange(position.id, 'name', e.detail.value)}
              />
              <Text className={styles.deleteBtn} onClick={() => removePosition(position.id)}>
                ✕
              </Text>
            </View>
            <View style={{ marginBottom: 16 }}>
              <Input
                className={styles.input}
                placeholder="岗位职责描述"
                value={position.description}
                onInput={(e) => handlePositionChange(position.id, 'description', e.detail.value)}
              />
            </View>
            <Input
              className={styles.input}
              type="number"
              placeholder="需要人数"
              value={position.requiredCount}
              onInput={(e) => handlePositionChange(position.id, 'requiredCount', e.detail.value)}
            />
          </View>
        ))}

        <Text className={styles.addPositionBtn} onClick={addPosition}>
          + 添加岗位
        </Text>
      </View>

      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>签到设置</Text>

        <View className={styles.switchRow}>
          <Text className={styles.switchLabel}>启用签到</Text>
          <View
            className={classnames(styles.switch, formData.needCheckIn && styles.switchActive)}
            onClick={toggleCheckIn}
          >
            <View
              className={classnames(styles.switchThumb, formData.needCheckIn && styles.switchThumbActive)}
            />
          </View>
        </View>

        {formData.needCheckIn && (
          <View className={styles.formItem} style={{ marginTop: 16 }}>
            <Text className={styles.label}>
              <Text className={styles.required}>*</Text>签到码
            </Text>
            <Input
              className={styles.input}
              placeholder="请设置签到码，如：CULT2026"
              value={formData.checkInCode}
              onInput={(e) => handleInputChange('checkInCode', e.detail.value)}
              maxlength={20}
            />
          </View>
        )}
      </View>

      <View className={styles.footer}>
        <Text
          className={classnames(
            styles.submitBtn,
            !isFormValid && styles.submitBtnDisabled
          )}
          onClick={isFormValid ? handleSubmit : undefined}
        >
          创建活动
        </Text>
      </View>
    </ScrollView>
  );
};

export default CreateActivityPage;
