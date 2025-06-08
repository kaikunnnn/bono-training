
// Jest型定義の最小限実装（TypeScriptエラー回避用）
declare global {
  function describe(name: string, fn: () => void): void;
  function beforeEach(fn: () => void): void;
  function test(name: string, fn: () => Promise<void> | void): void;
  function it(name: string, fn: () => Promise<void> | void): void;
  
  const expect: {
    (actual: any): {
      toBe(expected: any): void;
      toBeInTheDocument(): void;
      toBeNull(): void;
      toEqual(expected: any): void;
      toHaveBeenCalledWith(...args: any[]): void;
    };
  };

  namespace jest {
    interface Mock {
      mockResolvedValue(value: any): Mock;
      mockRejectedValue(error: any): Mock;
      mockImplementation(fn: (...args: any[]) => any): Mock;
    }
    
    function fn(): Mock;
    function clearAllMocks(): void;
    function requireActual(moduleName: string): any;
    function mock(moduleName: string, factory?: () => any): void;
  }
}

// React型定義（Testing Library用）
declare namespace React {
  interface ReactElement<P = any> {
    type: any;
    props: P;
    key: string | number | null;
  }
  
  interface ReactNode {
    // 最小限の定義
  }
}

// Testing Library型定義
declare module '@testing-library/react' {
  export function render(component: React.ReactElement): {
    getByText: (text: string | RegExp) => HTMLElement;
    queryByText: (text: string | RegExp) => HTMLElement | null;
  };
  export const screen: {
    getByText: (text: string | RegExp) => HTMLElement;
    queryByText: (text: string | RegExp) => HTMLElement | null;
  };
  export function waitFor(fn: () => void): Promise<void>;
}

declare module '@testing-library/user-event' {
  const userEvent: any;
  export default userEvent;
}

declare module '@testing-library/jest-dom' {
  // jest-dom matchers are automatically available
}

export {};
