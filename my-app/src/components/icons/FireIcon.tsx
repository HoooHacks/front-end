// FireIcon.tsx (and similarly for others)
import React from 'react';

interface IconProps {
  width?: number;
  height?: number;
  style?: React.CSSProperties;
}

const FireIcon: React.FC<IconProps> = ({ width = 24, height = 24, style }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    style={style}
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M 12.5 25 C 17.678 25 21.875 21.875 21.875 16.406 C 21.875 14.063 21.094 10.156 17.969 7.031 C 18.359 9.375 16.016 10.156 16.016 10.156 C 17.188 6.25 14.063 0.781 9.375 0 C 9.933 3.125 10.156 6.25 6.25 9.375 C 4.297 10.938 3.125 13.639 3.125 16.406 C 3.125 21.875 7.322 25 12.5 25 M 12.5 23.438 C 9.911 23.438 7.813 21.875 7.813 19.141 C 7.813 17.969 8.203 16.016 9.766 14.453 C 9.57 15.625 10.938 16.406 10.938 16.406 C 10.352 14.453 11.719 11.328 14.063 10.938 C 13.783 12.5 13.672 14.063 15.625 15.625 C 16.602 16.406 17.188 17.756 17.188 19.141 C 17.188 21.875 15.089 23.438 12.5 23.438" fill="rgb(0,0,0)"></path>
  </svg>
);

export default FireIcon;