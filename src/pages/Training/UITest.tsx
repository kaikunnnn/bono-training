import React from 'react';

// Training専用UIコンポーネントのインポート
import { Button } from '@/components/training/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/training/ui/card';
import { Badge } from '@/components/training/ui/badge';
import { Input } from '@/components/training/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/training/ui/select';
import { Checkbox } from '@/components/training/ui/checkbox';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/training/ui/form';
import TrainingLayout from '@/components/training/TrainingLayout';

// Training専用CSSの読み込み
import '@/styles/training.css';

const UITest = () => {
  return (
    <TrainingLayout>
      <div className="container mx-auto p-training-8 space-y-training-8">
        <div className="text-center mb-training-12">
          <h1 className="text-4xl font-bold font-training-primary text-training-primary mb-training-4">
            Training UI Components Test
          </h1>
          <p className="text-lg font-training-secondary text-gray-600">
            Training専用UIコンポーネントの動作確認ページ
          </p>
        </div>

        {/* Button Components Test */}
        <Card variant="elevated" className="p-training-6">
          <CardHeader>
            <CardTitle>Button Components</CardTitle>
            <CardDescription>Training専用ボタンコンポーネントのテスト</CardDescription>
          </CardHeader>
          <CardContent className="space-y-training-4">
            <div className="flex flex-wrap gap-training-4">
              <Button variant="default" size="sm">Small Default</Button>
              <Button variant="default" size="md">Medium Default</Button>
              <Button variant="default" size="lg">Large Default</Button>
            </div>
            <div className="flex flex-wrap gap-training-4">
              <Button variant="secondary" size="md">Secondary</Button>
              <Button variant="outline" size="md">Outline</Button>
              <Button variant="ghost" size="md">Ghost</Button>
            </div>
          </CardContent>
        </Card>

        {/* Badge Components Test */}
        <Card variant="elevated" className="p-training-6">
          <CardHeader>
            <CardTitle>Badge Components</CardTitle>
            <CardDescription>Training専用バッジコンポーネントのテスト</CardDescription>
          </CardHeader>
          <CardContent className="space-y-training-4">
            <div className="flex flex-wrap gap-training-4">
              <Badge variant="default" size="sm">Default Small</Badge>
              <Badge variant="default" size="md">Default Medium</Badge>
              <Badge variant="accent" size="sm">Accent Small</Badge>
              <Badge variant="accent" size="md">Accent Medium</Badge>
              <Badge variant="outline" size="sm">Outline Small</Badge>
              <Badge variant="outline" size="md">Outline Medium</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Input Components Test */}
        <Card variant="elevated" className="p-training-6">
          <CardHeader>
            <CardTitle>Input Components</CardTitle>
            <CardDescription>Training専用入力コンポーネントのテスト</CardDescription>
          </CardHeader>
          <CardContent className="space-y-training-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-training-4">
              <div>
                <label className="block text-sm font-medium font-training-primary mb-training-2">
                  Text Input
                </label>
                <Input type="text" placeholder="Enter text here..." />
              </div>
              <div>
                <label className="block text-sm font-medium font-training-primary mb-training-2">
                  Email Input
                </label>
                <Input type="email" placeholder="Enter email..." />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Select Components Test */}
        <Card variant="elevated" className="p-training-6">
          <CardHeader>
            <CardTitle>Select Components</CardTitle>
            <CardDescription>Training専用セレクトコンポーネントのテスト</CardDescription>
          </CardHeader>
          <CardContent className="space-y-training-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-training-4">
              <div>
                <label className="block text-sm font-medium font-training-primary mb-training-2">
                  Select Option
                </label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                    <SelectItem value="option2">Option 2</SelectItem>
                    <SelectItem value="option3">Option 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Checkbox Components Test */}
        <Card variant="elevated" className="p-training-6">
          <CardHeader>
            <CardTitle>Checkbox Components</CardTitle>
            <CardDescription>Training専用チェックボックスコンポーネントのテスト</CardDescription>
          </CardHeader>
          <CardContent className="space-y-training-4">
            <div className="space-y-training-3">
              <div className="flex items-center space-x-training-2">
                <Checkbox id="checkbox1" />
                <label 
                  htmlFor="checkbox1" 
                  className="text-sm font-medium font-training-secondary cursor-pointer"
                >
                  Training Option 1
                </label>
              </div>
              <div className="flex items-center space-x-training-2">
                <Checkbox id="checkbox2" />
                <label 
                  htmlFor="checkbox2" 
                  className="text-sm font-medium font-training-secondary cursor-pointer"
                >
                  Training Option 2
                </label>
              </div>
              <div className="flex items-center space-x-training-2">
                <Checkbox id="checkbox3" />
                <label 
                  htmlFor="checkbox3" 
                  className="text-sm font-medium font-training-secondary cursor-pointer"
                >
                  Training Option 3
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card Variants Test */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-training-6">
          <Card variant="default">
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
              <CardDescription>通常のカードデザイン</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-training-secondary">
                これはデフォルトのカードスタイルです。
              </p>
            </CardContent>
            <CardFooter>
              <Button size="sm">Action</Button>
            </CardFooter>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Elevated Card</CardTitle>
              <CardDescription>影付きのカードデザイン</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-training-secondary">
                これは影付きのカードスタイルです。
              </p>
            </CardContent>
            <CardFooter>
              <Button size="sm" variant="secondary">Action</Button>
            </CardFooter>
          </Card>
        </div>

        {/* Typography Test */}
        <Card variant="elevated" className="p-training-6">
          <CardHeader>
            <CardTitle>Typography Test</CardTitle>
            <CardDescription>Training専用フォントのテスト</CardDescription>
          </CardHeader>
          <CardContent className="space-y-training-4">
            <div>
              <h3 className="text-lg font-semibold font-training-primary mb-training-2">
                Primary Font (Rounded Mplus 1c)
              </h3>
              <p className="font-training-secondary">
                Secondary Font (Inter) - これは通常のテキストです。
              </p>
              <p className="font-training-mono text-sm mt-training-2">
                Mono Font (Futura) - これは等幅フォントです。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Spacing Test */}
        <Card variant="elevated" className="p-training-6">
          <CardHeader>
            <CardTitle>Spacing Test</CardTitle>
            <CardDescription>Training専用スペーシングのテスト</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-training-2">
              <div className="bg-training-accent/20 p-training-1 rounded">training-1 (4px)</div>
              <div className="bg-training-accent/20 p-training-2 rounded">training-2 (8px)</div>
              <div className="bg-training-accent/20 p-training-3 rounded">training-3 (12px)</div>
              <div className="bg-training-accent/20 p-training-4 rounded">training-4 (16px)</div>
              <div className="bg-training-accent/20 p-training-6 rounded">training-6 (24px)</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TrainingLayout>
  );
};

export default UITest;