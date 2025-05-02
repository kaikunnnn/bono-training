
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { PlanType, getPlanBenefits } from '@/utils/subscriptionPlans';

interface PlanCardProps {
  id: string;
  name: string;
  description: string;
  price: string;
  features: {
    learning: boolean;
    member: boolean;
    training: boolean;
  };
  recommended: boolean;
  isCurrentPlan: boolean;
  onSubscribe: (planType: PlanType) => void;
  isLoading: boolean;
}

const PlanCard: React.FC<PlanCardProps> = ({
  id,
  name,
  description,
  price,
  features,
  recommended,
  isCurrentPlan,
  onSubscribe,
  isLoading
}) => {
  const planBenefits = getPlanBenefits(id as PlanType);
  
  return (
    <Card 
      className={`
        flex flex-col
        ${recommended ? 'border-primary shadow-lg relative' : ''}
        ${isCurrentPlan ? 'border-green-500' : ''}
      `}
    >
      {recommended && (
        <div className="absolute -top-3 left-0 right-0 flex justify-center">
          <Badge className="bg-primary text-white px-3 py-1">おすすめ</Badge>
        </div>
      )}
      {isCurrentPlan && (
        <div className="absolute -top-3 left-0 right-0 flex justify-center">
          <Badge className="bg-green-500 text-white px-3 py-1">現在のプラン</Badge>
        </div>
      )}
      <CardHeader className={recommended ? 'pt-8' : ''}>
        <CardTitle>{name}</CardTitle>
        <div className="mt-2 mb-2">
          <span className="text-3xl font-bold">{price}</span>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-4">
          <div className="space-y-2">
            {planBenefits.map((benefit, idx) => (
              <div key={idx} className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            <Button 
              className={`w-full ${recommended ? 'bg-primary' : ''}`}
              disabled={isLoading || isCurrentPlan}
              onClick={() => onSubscribe(id as PlanType)}
            >
              {isCurrentPlan ? '現在のプラン' : '選択する'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanCard;
