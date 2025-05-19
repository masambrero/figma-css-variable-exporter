export type Message = {
  type: 'export';
  unit: 'px' | 'rem';
  remValue: number;
  collections: string[];
};
