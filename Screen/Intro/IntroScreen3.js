import React from 'react';
import Intro from '../../Components/Intro/Intro';


const IntroScreen3 = ({navigation}) => {
  return (
    <Intro
      backgroundImage={require('./images/intro3.png')}
      title="EMERGENCY SERVICES" 
      highlightText="Get urgent help " 
      description="whenever and wherever you need it"
      onSkipPress={() => navigation.replace('RegNavigator')} // Skip to login
      onNextPress={() => navigation.navigate('RegNavigator')} // Go to next intro screen
      activeDotIndex={3}
    />
  );
};

export default IntroScreen3;
