'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';

export default function StarRating() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-2">
      {/* 🟢 Input oculto para que el Server Action reciba el valor 'rating' */}
      <input type="hidden" name="rating" value={rating} />

      {[1, 2, 3, 4, 5].map((star) => (
        <button
          type="button"
          key={star}
          className="transition-transform hover:scale-110 focus:outline-none"
          onClick={() => setRating(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
        >
          <Star
            size={32}
            className={`transition-colors duration-200 ${
              star <= (hover || rating)
                ? "text-primary fill-primary" // Estrella llena
                : "text-gray-300 dark:text-neutral-600" // Estrella vacía
            }`}
          />
        </button>
      ))}
    </div>
  );
}