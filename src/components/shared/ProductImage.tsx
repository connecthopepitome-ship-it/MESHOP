'use client';

import React, { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';
import { formatImageUrl } from '@/lib/utils';

interface ProductImageProps extends Omit<ImageProps, 'onError' | 'src'> {
  src: string;
  fallbackSrc?: string;
  alt: string;
}

const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80';

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  fallbackSrc = DEFAULT_FALLBACK_IMAGE,
  alt,
  className = '',
  ...props
}) => {
  const formattedSrc = formatImageUrl(src);
  const [imgSrc, setImgSrc] = useState<string>(formattedSrc || fallbackSrc);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    const formatted = formatImageUrl(src);
    setImgSrc(formatted || fallbackSrc);
    setHasError(false);
  }, [src, fallbackSrc]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <Image
      {...props}
      unoptimized
      src={imgSrc || fallbackSrc}
      alt={alt || 'SORAYVA Premium Saree'}
      onError={handleError}
      className={`w-full h-full object-cover transition-opacity duration-300 opacity-100 ${className}`}
    />
  );
};
