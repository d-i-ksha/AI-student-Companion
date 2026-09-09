import React, { useState } from 'react';

interface UserAvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const DEFAULT_AVATAR_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDPDj2amVlyjv2wYhOLTvCdaNeQQm-AbxxSQ8m6AXQrP2eII-SMnWn2uiYQS644KgUIM4JyaJr39r2_IWvNIEnt2eWAieBw8cETCGod3Pz_NFzfGJfvQx83vHh3zpgG2wuLwSIKs8XqDaPD_QM00IWehFylHmdnu5GxCmaFiYQaWrfV0SXpJXQTdyiZSpPyu1VAGmb3SIDR9wuwfbxeW68LLFOyi1h-iihO4iXnvT8cBs1O9wgXZZB-JQ';

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src = DEFAULT_AVATAR_URL,
  name = 'Alex Rivera',
  size = 'md',
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  }[size];

  const getInitials = (n: string) => {
    return n
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (hasError || !src) {
    return (
      <div
        className={`${sizeClasses} rounded-full bg-primary-fixed text-primary font-bold flex items-center justify-center flex-shrink-0 select-none ${className}`}
      >
        {getInitials(name)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setHasError(true)}
      referrerPolicy="no-referrer"
      className={`${sizeClasses} rounded-full object-cover ring-1 ring-slate-200 flex-shrink-0 ${className}`}
    />
  );
};
