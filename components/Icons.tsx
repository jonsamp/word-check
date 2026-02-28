import React from "react";
import { Path, Svg } from "react-native-svg";
import { useThemeColor } from "../components/Themed";

export function XIcon() {
  const fill = useThemeColor("danger");

  return (
    <Svg width={80} height={80} viewBox="0 0 25 25" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M24.944 12.986c0 6.627-5.373 12-12 12-6.628 0-12-5.373-12-12s5.372-12 12-12c6.627 0 12 5.373 12 12zm-13.414 0L7.655 9.112 9.07 7.698l3.874 3.874 3.874-3.874 1.414 1.414-3.874 3.874 3.874 3.874-1.414 1.414-3.874-3.874-3.874 3.874-1.415-1.414 3.875-3.874z"
        fill={fill}
      />
    </Svg>
  );
}

export function BookIcon() {
  const stroke = useThemeColor("textSecondary");
  return (
    <Svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 21L11.8999 20.8499C11.2053 19.808 10.858 19.287 10.3991 18.9098C9.99286 18.5759 9.52476 18.3254 9.02161 18.1726C8.45325 18 7.82711 18 6.57482 18H5.2C4.07989 18 3.51984 18 3.09202 17.782C2.71569 17.5903 2.40973 17.2843 2.21799 16.908C2 16.4802 2 15.9201 2 14.8V6.2C2 5.07989 2 4.51984 2.21799 4.09202C2.40973 3.71569 2.71569 3.40973 3.09202 3.21799C3.51984 3 4.07989 3 5.2 3H5.6C7.84021 3 8.96031 3 9.81596 3.43597C10.5686 3.81947 11.1805 4.43139 11.564 5.18404C12 6.03968 12 7.15979 12 9.4M12 21V9.4M12 21L12.1001 20.8499C12.7947 19.808 13.142 19.287 13.6009 18.9098C14.0071 18.5759 14.4752 18.3254 14.9784 18.1726C15.5467 18 16.1729 18 17.4252 18H18.8C19.9201 18 20.4802 18 20.908 17.782C21.2843 17.5903 21.5903 17.2843 21.782 16.908C22 16.4802 22 15.9201 22 14.8V6.2C22 5.07989 22 4.51984 21.782 4.09202C21.5903 3.71569 21.2843 3.40973 20.908 3.21799C20.4802 3 19.9201 3 18.8 3H18.4C16.1598 3 15.0397 3 14.184 3.43597C13.4314 3.81947 12.8195 4.43139 12.436 5.18404C12 6.03968 12 7.15979 12 9.4"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke={stroke}
      />
    </Svg>
  );
}

export function CheckIcon() {
  const fill = useThemeColor("success");
  return (
    <Svg width={80} height={80} viewBox="0 0 25 25" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.947 24.507c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12-6.628 0-12 5.372-12 12 0 6.627 5.372 12 12 12zm-6.172-11.17c1.858-.906 3.155 2.26 3.884 4.65.304.996 1.185 1.034 1.612.085 1.123-2.501 3.388-6.748 7.433-11.473.364-.425-.055-.956-.51-.632-4.475 3.176-7.51 8.347-7.51 8.347-2.854-4.745-4.909-2.11-4.909-.977z"
        fill={fill}
      />
    </Svg>
  );
}

export function BlueCheckIcon() {
  const fill = useThemeColor("primary");
  return (
    <Svg width={25} height={25} viewBox="0 0 25 25" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.947 24.507c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12-6.628 0-12 5.372-12 12 0 6.627 5.372 12 12 12zm-6.172-11.17c1.858-.906 3.155 2.26 3.884 4.65.304.996 1.185 1.034 1.612.085 1.123-2.501 3.388-6.748 7.433-11.473.364-.425-.055-.956-.51-.632-4.475 3.176-7.51 8.347-7.51 8.347-2.854-4.745-4.909-2.11-4.909-.977z"
        fill={fill}
      />
    </Svg>
  );
}

export function CancelIcon() {
  const foregroundColor = useThemeColor("textSecondary");
  return (
    <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8 16l8-8M16 16L8 8"
        stroke={foregroundColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function ChevronDownIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 9l6 6 6-6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
