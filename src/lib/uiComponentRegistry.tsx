/**
 * shadcn/ui コンポーネントレジストリ
 * 主要コンポーネントのサンプル実装
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Info } from 'lucide-react';
import type { ComponentInfo } from '@/types/dev';

export const UI_COMPONENTS: Record<string, ComponentInfo[]> = {
  Forms: [
    {
      name: 'Button - Default (黒)',
      category: 'Forms',
      description: 'プライマリアクション用。黒背景・白文字。',
      example: (
        <div className="flex flex-col gap-4 w-full">
          <div className="flex items-end gap-3">
            <div className="flex flex-col items-center gap-1">
              <Button size="large">Large</Button>
              <span className="text-[10px] text-gray-400">h-12 px-7</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Button size="medium">Medium</Button>
              <span className="text-[10px] text-gray-400">h-10 px-5</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Button size="small">Small</Button>
              <span className="text-[10px] text-gray-400">h-8 px-3.5</span>
            </div>
          </div>
        </div>
      ),
      path: '@/components/ui/button',
    },
    {
      name: 'Button - Outline (白枠)',
      category: 'Forms',
      description: 'セカンダリアクション用。白背景・黒枠。',
      example: (
        <div className="flex flex-col gap-4 w-full">
          <div className="flex items-end gap-3">
            <div className="flex flex-col items-center gap-1">
              <Button variant="outline" size="large">Large</Button>
              <span className="text-[10px] text-gray-400">h-12 px-7</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Button variant="outline" size="medium">Medium</Button>
              <span className="text-[10px] text-gray-400">h-10 px-5</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Button variant="outline" size="small">Small</Button>
              <span className="text-[10px] text-gray-400">h-8 px-3.5</span>
            </div>
          </div>
        </div>
      ),
      path: '@/components/ui/button',
    },
    {
      name: 'Button - Other Variants',
      category: 'Forms',
      description: 'その他のバリエーション（ghost, destructive, secondary等）',
      example: (
        <div className="flex gap-2 flex-wrap">
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="link">Link</Button>
        </div>
      ),
      path: '@/components/ui/button',
    },
    {
      name: 'Input',
      category: 'Forms',
      description: 'Text input field',
      example: <Input placeholder="Enter text..." />,
      path: '@/components/ui/input',
    },
    {
      name: 'Label',
      category: 'Forms',
      description: 'Renders an accessible label',
      example: (
        <div className="space-y-2 w-full">
          <Label htmlFor="email">Email</Label>
          <Input id="email" placeholder="email@example.com" />
        </div>
      ),
      path: '@/components/ui/label',
    },
    {
      name: 'Checkbox',
      category: 'Forms',
      description: 'A control that allows the user to toggle between checked and not checked',
      example: (
        <div className="flex items-center space-x-2">
          <Checkbox id="terms" />
          <label htmlFor="terms" className="text-sm">
            Accept terms and conditions
          </label>
        </div>
      ),
      path: '@/components/ui/checkbox',
    },
    {
      name: 'Switch',
      category: 'Forms',
      description: 'A control that allows the user to toggle between on and off',
      example: (
        <div className="flex items-center space-x-2">
          <Switch id="airplane-mode" />
          <Label htmlFor="airplane-mode">Airplane Mode</Label>
        </div>
      ),
      path: '@/components/ui/switch',
    },
  ],

  Layout: [
    {
      name: 'Card',
      category: 'Layout',
      description: 'Displays a card with header, content, and footer',
      example: (
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description goes here</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Card content goes here.</p>
          </CardContent>
        </Card>
      ),
      path: '@/components/ui/card',
    },
    {
      name: 'Separator',
      category: 'Layout',
      description: 'Visually or semantically separates content',
      example: (
        <div className="w-full">
          <div className="py-2">Content above</div>
          <Separator />
          <div className="py-2">Content below</div>
        </div>
      ),
      path: '@/components/ui/separator',
    },
    {
      name: 'Tabs',
      category: 'Layout',
      description: 'A set of layered sections of content—known as tab panels',
      example: (
        <Tabs defaultValue="tab1" className="w-full">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content for Tab 1</TabsContent>
          <TabsContent value="tab2">Content for Tab 2</TabsContent>
        </Tabs>
      ),
      path: '@/components/ui/tabs',
    },
  ],

  'Data Display': [
    {
      name: 'Badge',
      category: 'Data Display',
      description: 'Displays a badge or a component that looks like a badge',
      example: (
        <div className="flex gap-2 flex-wrap">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>
      ),
      path: '@/components/ui/badge',
    },
    {
      name: 'Avatar',
      category: 'Data Display',
      description: 'An image element with a fallback for representing the user',
      example: (
        <div className="flex gap-2">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>AB</AvatarFallback>
          </Avatar>
        </div>
      ),
      path: '@/components/ui/avatar',
    },
  ],

  Feedback: [
    {
      name: 'Alert',
      category: 'Feedback',
      description: 'Displays a callout for user attention',
      example: (
        <div className="space-y-2 w-full">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Info</AlertTitle>
            <AlertDescription>
              This is an informational alert message.
            </AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              This is an error alert message.
            </AlertDescription>
          </Alert>
        </div>
      ),
      path: '@/components/ui/alert',
    },
    {
      name: 'Progress',
      category: 'Feedback',
      description: 'Displays an indicator showing the completion progress',
      example: <Progress value={60} className="w-full" />,
      path: '@/components/ui/progress',
    },
    {
      name: 'Skeleton',
      category: 'Feedback',
      description: 'Use to show a placeholder while content is loading',
      example: (
        <div className="space-y-2 w-full">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ),
      path: '@/components/ui/skeleton',
    },
  ],
};
