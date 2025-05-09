import React from 'react';
import Intro from '../../Components/Intro/Intro';


const IntroScreen2 = ({navigation}) => {
  return (
    <Intro
      backgroundImage={require('./images/intro2.png')}
      title="BOOK APPOINTMENTS"
      highlightText="Schedule your service "
      description="at a time and place convenient for you"
      onSkipPress={() => navigation.replace('RegNavigator')} 
      onNextPress={() => navigation.navigate('Intro3')} 
      activeDotIndex={2}
    />
  );
};

export default IntroScreen2;
