import React, { useEffect } from 'react';
import {
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  View as RNView,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import useColorScheme from '../hooks/useColorScheme';
import { View, Text } from '../components/Themed';
import { useThemeColor } from '../components/Themed';
import { type } from '../constants/Type';
import { RootStackParamList } from '../types';
import AppIconImage from '../assets/images/icon-1.png';
import DarkAppIconImage from '../assets/images/icon-dark.png';
import {
  SettingsIcon,
  CancelIcon,
  CheckIcon,
  XIcon,
} from '../components/Icons';
import { Dictionary, lookUpWordAsync } from '../constants/database';

export default function Search(
  props: StackScreenProps<RootStackParamList, 'Search'>
) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const textColor = useThemeColor('text');
  const textSecondaryColor = useThemeColor('textSecondary');
  const [searchValue, onChangeText] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<
    | { isValid: boolean; definition?: string | null; id?: number | string }
    | undefined
  >(undefined);

  useEffect(
    function resultDidUpdate() {
      async function setDefinitionAsync() {
        try {
          const rawData = await fetch(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${searchValue}`
          );
          const data = await rawData.json();
          const definition =
            data?.[0]?.meanings?.[0]?.definitions?.[0]?.definition;

          if (result?.isValid && definition && typeof definition === 'string') {
            setResult({
              ...result,
              definition: definition.replace(/\.$/, ''),
            });
          }
        } catch (error) {
          console.log(error);
          if (result?.isValid) {
            setResult({
              ...result,
              definition: 'No definition available',
            });
          }
        }
      }

      if (result?.isValid && !result?.definition) {
        setDefinitionAsync();
      }
    },
    [result]
  );

  function capitalizeFirstLetter(input: string) {
    return input.charAt(0).toUpperCase() + input.slice(1);
  }

  async function handleSubmit() {
    setResult(undefined);
    setLoading(true);

    try {
      const dictionary = await AsyncStorage.getItem('@wordcheck:dictionary');

      if (searchValue === 'Appjs') {
        return setResult({
          isValid: true,
          definition: 'the best conf',
          id: 'appjs-id',
        });
      }

      if (dictionary === 'NWL2020' || !dictionary) {
        const result = await lookUpWordAsync(Dictionary.NWL2020, searchValue);

        if (result === null) {
          return setResult({
            isValid: false,
            definition: undefined,
            id: undefined,
          });
        }

        return setResult({
          isValid: true,
          definition: result.definition,
          id: result.word,
        });
      } else if (dictionary === 'CSW21') {
        const result = await lookUpWordAsync(Dictionary.CSW21, searchValue);

        if (result === null) {
          return setResult({
            isValid: false,
            definition: undefined,
            id: undefined,
          });
        }

        return setResult({
          isValid: true,
          definition: result.definition,
          id: result.word,
        });
      } else if (dictionary === 'CSW15') {
        const response = await fetch(
          `https://s3-us-west-2.amazonaws.com/words.alexmeub.com/csw2015/${searchValue.toLowerCase()}.json`
        );

        const json = await response.json();

        setResult({
          isValid: true,
          definition: json.definition,
          id: json.index,
        });
      } else if (dictionary === 'NWL2018') {
        const response = await fetch(
          `https://s3-us-west-2.amazonaws.com/words.alexmeub.com/otcwl2018/${searchValue.toLowerCase()}.json`
        );

        const json = await response.json();

        setResult({
          isValid: true,
          definition: json.definition,
          id: json.index,
        });
      } else {
        alert('No dictionary selected. Please select one in settings.');
      }
    } catch (error) {
      setResult({
        isValid: false,
        definition: undefined,
        id: undefined,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <View
      style={{
        padding: 16,
        paddingLeft: insets.left + 16,
        paddingTop: insets.top + 8,
        paddingRight: insets.right + 16,
        flex: 1,
      }}
    >
      <View
        style={[
          styles.displayHorizontal,
          {
            marginBottom: 16,
            justifyContent: 'space-between',
          },
        ]}
      >
        <View style={styles.displayHorizontal}>
          <RNView
            style={{
              shadowColor: 'black',
              shadowRadius: 2,
              shadowOffset: { height: 1, width: 0 },
              shadowOpacity: 0.25,
            }}
          >
            <RNView
              style={{
                borderRadius: 7,
                overflow: 'hidden',
                marginRight: 12,
                justifyContent: 'center',
                height: 40,
                width: 40,
              }}
            >
              <Image
                source={isDark ? DarkAppIconImage : AppIconImage}
                style={{ width: 40, height: 40 }}
              />
            </RNView>
          </RNView>
          <RNView>
            <Text
              style={[
                styles.header,
                {
                  top: 8,
                },
              ]}
            >
              Word Check
            </Text>
          </RNView>
        </View>
        <TouchableOpacity onPress={() => props.navigation.push('Settings')}>
          <SettingsIcon />
        </TouchableOpacity>
      </View>
      <View style={styles.displayHorizontal}>
        <TextInput
          style={[
            styles.searchInput,
            {
              color: textColor,
              borderColor: textSecondaryColor,
            },
          ]}
          placeholderTextColor={textSecondaryColor}
          autoCorrect={false}
          onSubmitEditing={() => handleSubmit()}
          onChangeText={(text) => {
            setResult(undefined);
            onChangeText(text);
          }}
          value={searchValue}
          placeholder='Search'
          returnKeyType='search'
        />
        {Boolean(searchValue) && (
          <TouchableOpacity
            style={{
              position: 'absolute',
              right: 0,
              padding: 8,
              marginRight: -8,
            }}
            onPress={() => {
              setResult(undefined);
              onChangeText('');
            }}
          >
            <CancelIcon />
          </TouchableOpacity>
        )}
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {loading && <ActivityIndicator color={textSecondaryColor} size={24} />}
        {!loading && result && (
          <View
            style={[styles.displayHorizontal, styles.validationContainer]}
            colorKey='backgroundSecondary'
          >
            {result.isValid ? <CheckIcon /> : <XIcon />}
            <Text style={styles.validationText}>
              {capitalizeFirstLetter(searchValue)} is{' '}
              {result.isValid ? 'a playable word.' : 'not a playable word.'}
            </Text>
          </View>
        )}
        {!loading && !result && !searchValue && (
          <Text
            style={[
              type.body,
              {
                textAlign: 'center',
                marginHorizontal: 60,
                marginTop: 60,
                color: textSecondaryColor,
              },
            ]}
          >
            Tap "Search" to check if a word is playable.
          </Text>
        )}
        {!loading && result && result.isValid && result.definition && (
          <View>
            <View
              key={result.id}
              style={styles.definitionContainer}
              colorKey='backgroundSecondary'
            >
              <RNView>
                <Text style={type.titleTwo}>
                  {capitalizeFirstLetter(searchValue)}
                </Text>
              </RNView>
              <RNView style={styles.def}>
                <Text style={type.body}>
                  Definition: {capitalizeFirstLetter(
                    result.definition
                  ).trim()}
                  .
                </Text>
              </RNView>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    ...type.largeTitle,
    fontFamily: 'SemiBold',
    marginBottom: 16,
    fontSize: 24,
  },
  displayHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    ...type.body,
    height: 40,
    fontSize: 28,
    lineHeight: 28,
    borderBottomWidth: 1,
    flex: 1,
  },
  searchButton: {
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 2,
    marginLeft: 8,
    height: 40,
  },
  searchButtonText: {
    ...type.headline,
    color: '#FFF',
  },
  scrollContainer: {
    flex: 1,
    marginTop: 32,
  },
  validationContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  definitionContainer: {
    padding: 16,
    borderRadius: 8,
  },
  wordSeparator: {
    marginHorizontal: 8,
  },
  validationText: {
    ...type.body,
    marginLeft: 12,
    top: 1,
  },
  def: {
    marginBottom: 4,
  },
});
