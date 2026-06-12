import React from 'react';
import { Text, ScrollView } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface TabOption {
  value: string;
  label: string;
}

interface TabFilterProps {
  options: TabOption[];
  activeValue: string;
  onChange: (value: string) => void;
}

const TabFilter: React.FC<TabFilterProps> = ({ options, activeValue, onChange }) => {
  return (
    <ScrollView scrollX className={styles.container}>
      {options.map((option) => (
        <Text
          key={option.value}
          className={classnames(
            styles.tabItem,
            activeValue === option.value && styles.tabActive
          )}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Text>
      ))}
    </ScrollView>
  );
};

export default TabFilter;
