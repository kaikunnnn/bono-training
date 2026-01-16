/**
 * アニメーション表示コンポーネント
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ANIMATIONS } from '@/lib/animationDefinitions';
import { RotateCcw } from 'lucide-react';
import type { AnimationDefinition } from '@/types/dev';

interface AnimationCardProps {
  animation: AnimationDefinition;
}

const AnimationCard = ({ animation }: AnimationCardProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const playAnimation = () => {
    setIsPlaying(false);
    setTimeout(() => {
      setIsPlaying(true);
      setTimeout(() => {
        setIsPlaying(false);
      }, parseFloat(animation.duration) * 1000 + 500);
    }, 50);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{animation.name}</CardTitle>
        {animation.description && (
          <p className="text-sm text-gray-600">{animation.description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gray-100 h-40 rounded flex items-center justify-center overflow-hidden">
          <div
            className={`w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg ${
              isPlaying ? animation.className : ''
            }`}
          />
        </div>
        <div className="text-xs space-y-1 font-mono text-gray-600">
          <p>Class: {animation.className}</p>
          <p>Duration: {animation.duration}</p>
          {animation.easing && <p>Easing: {animation.easing}</p>}
        </div>
        <Button onClick={playAnimation} className="w-full" variant="outline">
          <RotateCcw className="w-4 h-4 mr-2" />
          Play Animation
        </Button>
      </CardContent>
    </Card>
  );
};

const Animations = () => {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-bold mb-6">Custom Animations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ANIMATIONS.map((anim) => (
            <AnimationCard key={anim.name} animation={anim} />
          ))}
        </div>
      </section>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 <strong>Note:</strong> Click "Play Animation" to see each animation in action.
          Some animations may require specific conditions or elements to display correctly.
        </p>
      </div>
    </div>
  );
};

export default Animations;
