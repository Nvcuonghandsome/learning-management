'use client';

import { useCarousel } from '@/hooks/useCarousel';
import Image from 'next/image';

const LandingHero = () => {
  const currentImage = useCarousel({ totalImages: 3, interval: 3000 });

  return (
    <div className="landing__hero-images">
      {['/hero1.jpg', '/hero2.jpg', '/hero3.jpg'].map((src, index) => (
        <Image
          key={src}
          src={src}
          alt={`Hero Banner ${index + 1}`}
          fill
          priority={index === currentImage}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`landing__hero-image ${
            index === currentImage ? 'landing__hero-image--active' : ''
          }`}
        />
      ))}
    </div>
  );
};

export default LandingHero;
