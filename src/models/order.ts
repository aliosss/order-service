export interface Order {
    id: string;
    email: string;
    orderDate: string;
    total: number;
    orderLines: OrderLine[];
}

export interface OrderLine {
    productCode: string;
    value: number;
}
