export interface Table {
    id: string;
    number: number;
    seats: number;
    x: number;
    y: number;
    width: number;
    height: number;
    shape: 'rectangle' | 'circle';
}

export interface RestaurantLayout {
  tables: Table[];
  lastUpdated: Date;
}
