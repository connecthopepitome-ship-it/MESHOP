'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';

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
  const [imgSrc, setImgSrc] = useState<string>(src || fallbackSrc);
  const [hasError, setHasError] = useState<boolean>(!src);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <div className={`relative overflow-hidden bg-surface-container ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-surface-container-high animate-pulse z-10 flex items-center justify-center">
          <span className="font-sans-fashion text-[0.65rem] tracking-[0.2em] uppercase text-outline">SORAYVA</span>
        </div>
      )}
      <Image
        {...props}
        src={imgSrc || fallbackSrc}
        alt={alt || 'SORAYVA Premium Saree'}
        onError={handleError}
        onLoad={() => setIsLoading(false)}
        className={`w-full h-full object-cover transition-all duration-700 ${isLoading ? 'opacity-0 scale-102' : 'opacity-100 scale-100'}`}
      />
    </div>
  );
};
