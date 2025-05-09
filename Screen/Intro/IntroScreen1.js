import React from 'react';
import Intro from '../../Components/Intro/Intro';


const IntroScreen1 = ({ navigation }) => {
  return (
    <Intro
      backgroundImage={require('./images/intro1.png')}
      title="SEARCH & COMPARE"
      highlightText="Save your time & money"
      description=" on your car service by comparing nearby shops"
      onSkipPress={() => navigation.replace('RegNavigator')} 
      onNextPress={() => navigation.navigate('Intro2')} 
      activeDotIndex={1}
    />
  );
};

export default IntroScreen1;
