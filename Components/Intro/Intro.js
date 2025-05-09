import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';

import styles from './IntroStyle';

const Intro = ({
  backgroundImage,
  title,
  description,
  highlightText,
  onSkipPress,
  onNextPress,
  activeDotIndex,
}) => {
  return (
    <View style={styles.container}>
      {/* Background Image */}
      <ImageBackground source={backgroundImage} style={styles.imageBackground}>
        {/* Skip Button */}
        <TouchableOpacity style={styles.skipButton} onPress={onSkipPress}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </ImageBackground>

      {/* Bottom Card */}
      <View style={styles.card}>
        <Text style={styles.heading}>{title}</Text>
        <Text style={styles.description}>
          <Text style={styles.highlight}>{highlightText}</Text>
          {description}
        </Text>

        {/* Pagination Dots and Next Button */}
        <View style={styles.bottomRow}>
          <View style={styles.pagination}>
            <View
              style={[
                styles.dot,
                activeDotIndex === 1 ? styles.activeDot : null, // Highlight the first dot
              ]}
            />
            <View
              style={[
                styles.dot,
                activeDotIndex === 2 ? styles.activeDot : null, // Highlight the second dot
              ]}
            />
            <View
              style={[
                styles.dot,
                activeDotIndex === 3 ? styles.activeDot : null, // Highlight the third dot
              ]}
            />
          </View>

          <TouchableOpacity style={styles.nextButton} onPress={onNextPress}>
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Intro;
