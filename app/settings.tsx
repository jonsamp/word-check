import React, { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  StyleSheet,
  TouchableOpacity,
  Platform,
  View as RNView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage';

import { View, Text } from '../components/Themed';
import { type } from '../constants/Type';
import { BlueCheckIcon, SettingsCogIcon } from '../components/Icons';
// import { ScrollView } from 'react-native-gesture-handler';

export default function Settings() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentDictionary, setCurrentDictionary] = useState<
    'NWL2020' | 'CSW21' | 'NWL2018' | 'CSW15' | undefined
  >();

  useEffect(function didMount() {
    async function getDictionary() {
      const result = await AsyncStorage.getItem('@wordcheck:dictionary');

      if (result === 'NWL2020') {
        setCurrentDictionary('NWL2020');
      } else if (result === 'CSW21') {
        setCurrentDictionary('CSW21');
      } else if (result === 'NWL2018') {
        setCurrentDictionary('NWL2018');
      } else if (result === 'CSW15') {
        setCurrentDictionary('CSW15');
      } else {
        setCurrentDictionary('NWL2020');
      }
    }

    getDictionary();
  }, []);

  async function setDictionary(key: string) {
    try {
      await AsyncStorage.setItem('@wordcheck:dictionary', key);

      if (key === 'NWL2020') {
        setCurrentDictionary('NWL2020');
      } else if (key === 'CSW21') {
        setCurrentDictionary('CSW21');
      } else if (key === 'NWL2018') {
        setCurrentDictionary('NWL2018');
      } else if (key === 'CSW15') {
        setCurrentDictionary('CSW15');
      } else {
        setCurrentDictionary('NWL2020');
      }
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Platform.select({ ios: 0, android: insets.top }),
        },
      ]}
    >
      <View
        colorKey='backgroundSecondary'
        style={{
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <RNView
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <RNView style={{ top: -1 }}>
            <SettingsCogIcon />
          </RNView>
          <Text style={[type.titleTwo, { marginLeft: 4 }]}>Settings</Text>
        </RNView>
        <TouchableOpacity onPress={router.back}>
          <Text style={type.title}>Done</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
        <Text style={type.title}>Dictionaries</Text>
        <TouchableOpacity
          onPress={() => setDictionary('NWL2020')}
          style={{ marginBottom: 16, marginTop: 16 }}
        >
          <View
            colorKey='backgroundSecondary'
            style={{
              padding: 16,
              borderRadius: 8,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <RNView style={{ flex: 1 }}>
              <Text style={[type.title, { marginBottom: 4 }]}>
                NASPA Word List 2020 Edition
              </Text>
              <Text style={type.body}>
                Contains 191,852 words. This list is for use in the United
                States, Canada, and Thailand.
              </Text>
            </RNView>
            <RNView
              style={{
                opacity: currentDictionary === 'NWL2020' ? 1 : 0,
                marginLeft: 16,
              }}
            >
              <BlueCheckIcon />
            </RNView>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setDictionary('CSW21')}
          style={{ marginBottom: 16 }}
        >
          <View
            colorKey='backgroundSecondary'
            style={{
              padding: 16,
              borderRadius: 8,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <RNView style={{ flex: 1 }}>
              <Text style={[type.title, { marginBottom: 4 }]}>
                Collins Scrabble Word List 2021 Edition
              </Text>
              <Text style={type.body}>
                Contains 279,077 words. This list is for use outside of the
                United States, Canada, and Thailand.
              </Text>
            </RNView>
            <RNView
              style={{
                opacity: currentDictionary === 'CSW21' ? 1 : 0,
                marginLeft: 16,
              }}
            >
              <BlueCheckIcon />
            </RNView>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setDictionary('NWL2018')}
          style={{ marginBottom: 16 }}
        >
          <View
            colorKey='backgroundSecondary'
            style={{
              padding: 16,
              borderRadius: 8,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <RNView style={{ flex: 1 }}>
              <Text style={[type.title, { marginBottom: 4 }]}>
                NASPA Word List 2018 Edition
              </Text>
              <Text style={type.body}>
                Contains 192,111 words. This list is for use in the United
                States, Canada, and Thailand.
              </Text>
            </RNView>
            <RNView
              style={{
                opacity: currentDictionary === 'NWL2018' ? 1 : 0,
                marginLeft: 16,
              }}
            >
              <BlueCheckIcon />
            </RNView>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setDictionary('CSW15')}
          style={{ marginBottom: 16 }}
        >
          <View
            colorKey='backgroundSecondary'
            style={{
              padding: 16,
              borderRadius: 8,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <RNView style={{ flex: 1 }}>
              <Text style={[type.title, { marginBottom: 4 }]}>
                Collins Scrabble Word List 2015 Edition
              </Text>
              <Text style={type.body}>
                Contains 276,663 words and is the latest approved Scrabble word
                list for use outside of the United States, Canada, and Thailand.
              </Text>
            </RNView>
            <RNView
              style={{
                opacity: currentDictionary === 'CSW15' ? 1 : 0,
                marginLeft: 16,
              }}
            >
              <BlueCheckIcon />
            </RNView>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
