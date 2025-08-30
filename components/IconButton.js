import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const IconButton = ({ 
  name, 
  size = 24, 
  color = '#fff', 
  onPress, 
  style, 
  disabled = false,
  accessibilityLabel 
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        disabled && styles.disabled,
        style
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
    >
      <Ionicons 
        name={name} 
        size={size} 
        color={disabled ? '#bdc3c7' : color} 
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default IconButton;
