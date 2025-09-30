import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { View } from 'react-native';

export const WavyBackground = ({ position = 'top' }: { position?: 'top' | 'bottom' }) => {
  return (
    <View 
      className={`absolute w-full ${position === 'top' ? 'top-0' : 'bottom-0'}`}
      style={{ zIndex: -1, pointerEvents: 'none' }} 
    >
      <Svg 
        height={200} 
        width="100%" 
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <Path
          d={position === 'top' 
            ? "M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,208C1248,224,1344,192,1392,176L1440,160L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
            : "M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,208C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          }
          fill="#84C94B"
          fillOpacity="1"
        />
      </Svg>
    </View>
  );
};