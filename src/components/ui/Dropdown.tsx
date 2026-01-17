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
  ViewStyle,
} from 'react-native';

import { Colors } from '../../constants/theme';

import { Button } from './Button';
import { Divider } from './Divider';
import { Input } from './Input';

export type OptionItem = {
  value: string;
  label: string;
};

interface DropDownProps {
  data: OptionItem[];
  style?: ViewStyle;
  containerStyle?: ViewStyle;
  onChange: (item: OptionItem) => void;
  placeholder: string;
  selectedValue: OptionItem | null;
  searchable?: boolean;
  searchPlaceholder?: string;
}

export default function Dropdown({
  data,
  style,
  containerStyle,
  onChange,
  placeholder,
  selectedValue,
  searchable = false,
  searchPlaceholder = 'Search...',
}: DropDownProps) {
  const [expanded, setExpanded] = useState(false);
  const [value, setValue] = useState(selectedValue?.label);
  const [top, setTop] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setValue(selectedValue?.label);
  }, [selectedValue]);

  // Filter data based on search query
  const filteredData =
    searchable && searchQuery
      ? data.filter(item =>
          item.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : data;

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
      ]).start(() => {
        setExpanded(false);
        if (searchable) {
          setSearchQuery(''); // Clear search when closing
        }
      });
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
  }, [expanded, fadeAnim, scaleAnim, slideAnim, searchable]);

  const onSelect = useCallback(
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

      onChange(item);
      setValue(item.label);
      if (searchable) {
        setSearchQuery(''); // Clear search when selecting
      }

      // Close with animation
      setTimeout(() => {
        toggleExpanded();
      }, 150);
    },
    [onChange, toggleExpanded, scaleAnim, searchable]
  );

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
      style={style}
      onLayout={event => {
        const layout = event.nativeEvent.layout;
        const topOffset = layout.y;
        const heightOfComponent = layout.height;

        const finalValue =
          topOffset + heightOfComponent + (Platform.OS === 'android' ? -32 : 3);

        setTop(finalValue);
      }}
    >
      <Button variant={value ? 'dark' : 'ghost'} onPress={toggleExpanded}>
        <Text style={styles.text}>{value || placeholder}</Text>
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
              <Animated.View
                style={[
                  styles.options,
                  containerStyle,
                  {
                    top,
                    opacity: fadeAnim,
                    transform: [
                      { scale: scaleAnim },
                      { translateY: slideAnim },
                    ],
                  },
                ]}
              >
                {searchable && (
                  <View>
                    <Input
                      placeholder={searchPlaceholder}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      autoFocus={false}
                    />
                  </View>
                )}
                <FlatList
                  keyExtractor={item => item.value}
                  data={filteredData}
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
                        onPress={() => onSelect(item)}
                      >
                        <Text style={styles.optionText}>{item.label}</Text>
                      </TouchableOpacity>
                      {index < filteredData.length - 1 && (
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
  optionItem: {
    height: 25,
    justifyContent: 'center',
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
    maxHeight: 250,
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
    // backgroundColor: '#fff',
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  optionText: {
    fontSize: 15,
    opacity: 0.8,
  },
});
