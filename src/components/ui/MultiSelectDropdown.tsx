import { Check } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { Colors } from '../../constants/theme';

import { Button } from './Button';
import { Divider } from './Divider';

export type OptionItem = {
  value: string;
  label: string;
};

interface MultiSelectDropdownProps {
  data: OptionItem[];
  onChange: (items: OptionItem[]) => void;
  placeholder: string;
  selectedValues: OptionItem[];
  maxSelections?: number;
}

export default function MultiSelectDropdown({
  data,
  onChange,
  placeholder,
  selectedValues,
  maxSelections,
}: MultiSelectDropdownProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedItems, setSelectedItems] = useState<OptionItem[]>(
    selectedValues || []
  );
  const [top, setTop] = useState(0);

  useEffect(() => {
    setSelectedItems(selectedValues || []);
  }, [selectedValues]);

  const buttonRef = useRef<View>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;

  const toggleExpanded = useCallback(() => {
    if (expanded) {
      // Close animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -20,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => setExpanded(false));
    } else {
      // Open animation
      setExpanded(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [expanded, fadeAnim, scaleAnim, slideAnim]);

  const onToggleItem = useCallback(
    (item: OptionItem) => {
      // Selection animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      let newSelectedItems: OptionItem[];

      if (selectedItems.find(selected => selected.value === item.value)) {
        // Remove item
        newSelectedItems = selectedItems.filter(
          selected => selected.value !== item.value
        );
      } else {
        // Add item (check max selections)
        if (maxSelections && selectedItems.length >= maxSelections) {
          return; // Don't add if max reached
        }
        newSelectedItems = [...selectedItems, item];
      }

      setSelectedItems(newSelectedItems);
      onChange(newSelectedItems);
    },
    [selectedItems, onChange, maxSelections, scaleAnim]
  );

  const getButtonText = () => {
    if (selectedItems.length === 0) {
      return placeholder;
    }
    if (selectedItems.length === 1) {
      return selectedItems[0].label;
    }
    if (selectedItems.length === 2) {
      return `${selectedItems[0].label}, ${selectedItems[1].label}`;
    }
    if (selectedItems.length === 3) {
      return `${selectedItems[0].label}, ${selectedItems[1].label} , ${selectedItems[2].label}`;
    }
    return `${selectedItems.length} items selected`;
  };

  const isItemSelected = (item: OptionItem) => {
    return selectedItems.some(selected => selected.value === item.value);
  };

  // Reset animations when component unmounts
  useEffect(() => {
    return () => {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
      slideAnim.setValue(-20);
    };
  }, [fadeAnim, scaleAnim, slideAnim]);

  return (
    <View
      ref={buttonRef}
      onLayout={event => {
        const layout = event.nativeEvent.layout;
        const topOffset = layout.y;
        const heightOfComponent = layout.height;

        const finalValue =
          topOffset + heightOfComponent + (Platform.OS === 'android' ? -32 : 3);

        setTop(finalValue);
      }}
    >
      <Button
        variant={selectedItems.length > 0 ? 'dark' : 'ghost'}
        onPress={toggleExpanded}
      >
        <Text style={styles.text}>{getButtonText()}</Text>
      </Button>

      {expanded && (
        <Modal style={{ zIndex: 1000 }} visible={expanded} transparent>
          <TouchableWithoutFeedback onPress={() => toggleExpanded()}>
            <Animated.View
              style={[
                styles.backdrop,
                {
                  opacity: fadeAnim,
                },
              ]}
            >
              <Animated.View style={[styles.options]}>
                <View style={styles.header}>
                  <Text style={styles.headerText}>
                    {maxSelections
                      ? `Select up to ${maxSelections} items`
                      : 'Select multiple items'}
                  </Text>
                  {selectedItems.length > 0 && (
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedItems([]);
                        onChange([]);
                      }}
                      style={styles.clearButton}
                    >
                      <Text style={styles.clearButtonText}>Clear</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <Divider style={{ marginVertical: 8 }} />

                <FlatList
                  keyExtractor={item => item.value}
                  data={data}
                  renderItem={({ item, index }) => (
                    <Animated.View
                      style={{
                        opacity: fadeAnim,
                        transform: [
                          {
                            translateX: slideAnim.interpolate({
                              inputRange: [-20, 0],
                              outputRange: [-20 + index * 5, 0],
                            }),
                          },
                        ],
                      }}
                    >
                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.optionItem}
                        onPress={() => onToggleItem(item)}
                      >
                        {isItemSelected(item) && (
                          <Check
                            size={15}
                            color={Colors.primary}
                            style={styles.checkbox}
                          />
                        )}
                        <Text
                          style={[
                            styles.optionText,
                            isItemSelected(item) && styles.selectedOptionText,
                          ]}
                        >
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                      {index < data.length - 1 && (
                        <Divider style={{ marginVertical: 6 }} />
                      )}
                    </Animated.View>
                  )}
                />
              </Animated.View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerText: {
    fontSize: 14,
    color: Colors.textDisabled,
    fontWeight: '500',
  },
  clearButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearButtonText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  optionItem: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  checkbox: {
    marginRight: 12,
  },
  separator: {
    height: 4,
    backgroundColor: Colors.border,
  },
  options: {
    backgroundColor: 'white',
    width: '100%',
    padding: 10,
    borderRadius: 6,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  text: {
    fontSize: 15,
    opacity: 0.8,
  },
  button: {
    height: 50,
    justifyContent: 'space-between',
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  optionText: {
    fontSize: 15,
    opacity: 0.8,
    flex: 1,
    color: Colors.text,
  },
  selectedOptionText: {
    fontWeight: '600',
    color: Colors.primary,
  },
});
