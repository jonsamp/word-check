import React from 'react';
import { Path, Svg, Rect } from 'react-native-svg';
import { useThemeColor } from '../components/Themed';

export function XIcon() {
  const fill = useThemeColor('danger');

  return (
    <Svg width={25} height={25} fill='none'>
      <Path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M24.944 12.986c0 6.627-5.373 12-12 12-6.628 0-12-5.373-12-12s5.372-12 12-12c6.627 0 12 5.373 12 12zm-13.414 0L7.655 9.112 9.07 7.698l3.874 3.874 3.874-3.874 1.414 1.414-3.874 3.874 3.874 3.874-1.414 1.414-3.874-3.874-3.874 3.874-1.415-1.414 3.875-3.874z'
        fill={fill}
      />
    </Svg>
  );
}

export function CheckIcon() {
  const fill = useThemeColor('success');
  return (
    <Svg width={25} height={25} viewBox='0 0 25 25' fill='none'>
      <Path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M12.947 24.507c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12-6.628 0-12 5.372-12 12 0 6.627 5.372 12 12 12zm-6.172-11.17c1.858-.906 3.155 2.26 3.884 4.65.304.996 1.185 1.034 1.612.085 1.123-2.501 3.388-6.748 7.433-11.473.364-.425-.055-.956-.51-.632-4.475 3.176-7.51 8.347-7.51 8.347-2.854-4.745-4.909-2.11-4.909-.977z'
        fill={fill}
      />
    </Svg>
  );
}

export function CancelIcon() {
  const backgroundButtonColor = useThemeColor('backgroundButton');
  const foregroundColor = useThemeColor('text');
  return (
    <Svg width={24} height={24} viewBox='0 0 24 24' fill='none'>
      <Rect width='24' height='24' rx='4' fill={backgroundButtonColor} />
      <Path
        d='M8 16l8-8M16 16L8 8'
        stroke={foregroundColor}
        strokeWidth='2'
        strokeLinecap='round'
      />
    </Svg>
  );
}

export function AboutIcon() {
  const backgroundButtonColor = useThemeColor('backgroundButton');
  const foregroundColor = useThemeColor('text');
  return (
    <Svg width={24} height={24} viewBox='0 0 24 24' fill='none'>
      <Rect width='24' height='24' rx='4' fill={backgroundButtonColor} />
      <Path
        d='M10.962 13.772h1.395c.358-1.079 1.158-1.575 2.06-2.123C15.2 11.17 16 10.52 16 9.081 16 7.352 14.468 6 11.966 6 9.43 6 8 7.352 8 8.91c0 1.044.647 1.678 1.566 1.678.953 0 1.464-.634 1.464-1.387 0-.667-.409-1.147-1.056-1.335.205-.308.698-.497 1.26-.497.987 0 1.464.548 1.464 1.575 0 .856-.34 1.336-.817 2.055-.51.77-.936 1.506-.92 2.773zM11.66 18c.987 0 1.719-.736 1.719-1.66 0-.908-.732-1.627-1.685-1.627-.988 0-1.72.736-1.72 1.66 0 .908.732 1.627 1.686 1.627z'
        fill={foregroundColor}
      />
    </Svg>
  );
}

export function SettingsIcon() {
  const backgroundButtonColor = useThemeColor('backgroundButton');
  const foregroundColor = useThemeColor('text');
  return (
    <Svg width={32} height={32} viewBox='0 0 32 32' fill='none'>
      <Rect width='32' height='32' rx='4' fill={backgroundButtonColor} />
      <Path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M25.352 14.289c.289.111.6.444.622.778.023.31.045.622 0 .933 0 .311-.022.622-.044.933-.022.311-.312.667-.623.778l-1.49.511a1.446 1.446 0 00-.734.667c-.09.244-.067.689.066.978l.69 1.444c.133.289.089.756-.111 1-.4.489-.823.911-1.29 1.311-.245.2-.712.245-1.001.111l-1.424-.666c-.311-.134-.778-.134-1.068 0-.289.11-.622.444-.733.755l-.534 1.511c-.112.311-.468.6-.801.623-.29.022-.578.044-.89.044-.289 0-.6-.022-.89-.044-.333-.023-.69-.312-.8-.623l-.534-1.51c-.111-.312-.445-.623-.734-.756-.29-.134-.779-.134-1.068 0l-1.423.666c-.29.156-.757.111-1.001-.11-.467-.4-.912-.845-1.29-1.312-.223-.244-.245-.711-.112-1l.69-1.444c.156-.29.178-.734.067-.978-.112-.267-.423-.556-.734-.667l-1.49-.51c-.29-.112-.601-.445-.624-.779A13.098 13.098 0 016 16c0-.311.022-.622.044-.933.023-.311.312-.667.623-.778l1.513-.511c.311-.111.623-.422.734-.667.089-.244.067-.689-.067-.978l-.69-1.444c-.133-.289-.088-.756.112-1 .4-.489.823-.911 1.29-1.311.245-.2.712-.245 1-.111l1.424.666c.312.134.779.134 1.068 0 .29-.11.623-.444.734-.755l.534-1.511c.111-.311.467-.6.8-.623.29-.022.579-.044.89-.044.312 0 .601.022.89.044.334.023.69.312.8.623l.557 1.51c.111.312.445.623.734.756.29.134.779.134 1.068 0l1.423-.666c.29-.156.756-.111 1.001.11.467.4.912.845 1.29 1.312.223.244.245.711.112 1l-.69 1.444c-.156.29-.178.734-.067.978.111.267.423.556.734.667l1.49.51zM19 16a3 3 0 11-6 0 3 3 0 016 0z'
        fill={foregroundColor}
      />
    </Svg>
  );
}
